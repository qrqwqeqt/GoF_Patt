import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../../src/models/User';
import Device from '../../../src/models/Device';
import PaymentCard from '../../../src/models/PaymentCard';
import { UserService } from '../../../src/services/UserService';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/Device');
jest.mock('../../../src/models/PaymentCard');

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user if email is not taken', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      await UserService.createUser(
        'John',
        'Doe',
        'john@example.com',
        'password123',
      );

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.prototype.save).toHaveBeenCalled();
    });

    it('should throw an error if email is already taken', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'john@example.com',
      });

      await expect(
        UserService.createUser(
          'John',
          'Doe',
          'john@example.com',
          'password123',
        ),
      ).rejects.toThrow('BAD_REQUEST');
    });
  });

  describe('authenticateUser', () => {
    it('should return a token for valid credentials', async () => {
      const user = {
        _id: '123',
        name: 'John',
        surname: 'Doe',
        password: 'hashed_password',
      };
      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const token = await UserService.authenticateUser(
        'john@example.com',
        'password123',
      );

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed_password',
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '123', name: 'John', surname: 'Doe' },
        process.env.JWT_SECRET,
        { expiresIn: '2 days' },
      );
      expect(token).toBe('token');
    });

    it('should throw an error if user is not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        UserService.authenticateUser('john@example.com', 'password123'),
      ).rejects.toThrow('NOT_FOUND');
    });

    it('should throw an error if password is incorrect', async () => {
      const user = { password: 'hashed_password' };
      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        UserService.authenticateUser('john@example.com', 'wrongpassword'),
      ).rejects.toThrow('BAD_REQUEST');
    });
  });

  describe('getUser', () => {
    it('should return the user if found', async () => {
      const user = { _id: '123', name: 'John', surname: 'Doe' };
      (User.findById as jest.Mock).mockResolvedValue(user);

      const result = await UserService.getUser('123');

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(user);
    });

    it('should throw an error if user is not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(UserService.getUser('123')).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('updateUser', () => {
    it('should update the user and return the updated user', async () => {
      const updatedUser = { _id: '123', name: 'John', surname: 'Smith' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      const result = await UserService.updateUser('123', { surname: 'Smith' });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { surname: 'Smith' },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if user is not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        UserService.updateUser('123', { surname: 'Smith' }),
      ).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('changePassword', () => {
    it('should change the password if old password is correct', async () => {
      const user = { _id: '123', password: 'hashed_password' };
      (User.findById as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      await UserService.changePassword('123', 'old_password', 'new_password');

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'old_password',
        'hashed_password',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', {
        password: 'new_hashed_password',
      });
    });

    it('should throw an error if old password is incorrect', async () => {
      const user = { password: 'hashed_password' };
      (User.findById as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        UserService.changePassword('123', 'wrong_password', 'new_password'),
      ).rejects.toThrow('BAD_REQUEST');
    });

    it('should throw an error if user is not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        UserService.changePassword('123', 'old_password', 'new_password'),
      ).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('deleteUser', () => {
    it('should delete the user and associated data', async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(true);
      (Device.deleteMany as jest.Mock).mockResolvedValue(true);
      (PaymentCard.deleteMany as jest.Mock).mockResolvedValue(true);

      await UserService.deleteUser('123');

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(Device.deleteMany).toHaveBeenCalledWith({ ownerId: '123' });
      expect(PaymentCard.deleteMany).toHaveBeenCalledWith({ ownerId: '123' });
    });

    it('should throw an error if user is not found', async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(UserService.deleteUser('123')).rejects.toThrow('NOT_FOUND');
    });
  });
});
