import request from 'supertest';
import express, { RequestHandler } from 'express';
import {
  createUser,
  authenticateUser,
  getUser,
  updateUser,
  changePassword,
  deleteUser,
} from '../../../src/controllers/userController';
import { UserService } from '../../../src/services/UserService';

const mockAuthenticateToken = jest.fn((req, res, next) => {
  const mockUser = { id: '123', name: 'Mock', surname: 'User' };
  req.user = mockUser;
  next();
});
jest.mock('../../../src/services/UserService');

const app = express();
app.use(express.json());

app.post('/api/auth/register', createUser as RequestHandler);
app.post('/api/auth/login', authenticateUser as RequestHandler);
app.get(
  '/api/auth/getUser',
  mockAuthenticateToken,
  getUser as unknown as RequestHandler,
);
app.put(
  '/api/auth/updateUser',
  mockAuthenticateToken,
  updateUser as unknown as RequestHandler,
);
app.put(
  '/api/auth/updatePassword',
  mockAuthenticateToken,
  changePassword as unknown as RequestHandler,
);
app.delete(
  '/api/auth/deleteUser',
  mockAuthenticateToken,
  deleteUser as unknown as RequestHandler,
);

describe('User Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      (UserService.createUser as jest.Mock).mockResolvedValueOnce(true);

      const response = await request(app).post('/api/auth/register').send({
        name: 'Mock',
        surname: 'User',
        email: 'mockuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Користувача зареєстровано успішно.');
    });

    it('should return 400 if user already exists', async () => {
      (UserService.createUser as jest.Mock).mockRejectedValueOnce(
        new Error('BAD_REQUEST'),
      );

      const response = await request(app).post('/api/auth/register').send({
        name: 'Mock',
        surname: 'User',
        email: 'mockuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Користувач із таким email вже існує.',
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return token', async () => {
      (UserService.authenticateUser as jest.Mock).mockResolvedValueOnce(
        'mock-token',
      );

      const response = await request(app).post('/api/auth/login').send({
        email: 'mockuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mock-token');
      expect(response.body.message).toBe('Успішний вхід.');
    });

    it('should return 404 if user not found', async () => {
      (UserService.authenticateUser as jest.Mock).mockRejectedValueOnce(
        new Error('NOT_FOUND'),
      );

      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Користувача не знайдено.');
    });
  });

  describe('GET /api/auth/getUser', () => {
    it('should return user data', async () => {
      (UserService.getUser as jest.Mock).mockResolvedValueOnce({
        id: '123',
        name: 'Mock',
        surname: 'User',
        email: 'mockuser@example.com',
      });

      const response = await request(app).get('/api/auth/getUser');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('123');
    });

    it('should return 404 if user not found', async () => {
      (UserService.getUser as jest.Mock).mockRejectedValueOnce(
        new Error('NOT_FOUND'),
      );

      const response = await request(app).get('/api/auth/getUser');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Користувача не знайдено.');
    });
  });

  describe('PUT /api/auth/updateUser', () => {
    it('should update user data', async () => {
      (UserService.updateUser as jest.Mock).mockResolvedValueOnce({
        id: '123',
        name: 'Updated Name',
        surname: 'Updated Surname',
        email: 'mockuser@example.com',
      });

      const response = await request(app).put('/api/auth/updateUser').send({
        name: 'Updated Name',
        surname: 'Updated Surname',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Дані користувача оновлено.');
      expect(response.body.updatedUser.name).toBe('Updated Name');
    });

    it('should return 404 if user not found', async () => {
      (UserService.updateUser as jest.Mock).mockRejectedValueOnce(
        new Error('NOT_FOUND'),
      );

      const response = await request(app).put('/api/auth/updateUser').send({
        name: 'Updated Name',
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Користувача не знайдено.');
    });
  });

  describe('PUT /api/auth/updatePassword', () => {
    it('should change user password successfully', async () => {
      (UserService.changePassword as jest.Mock).mockResolvedValueOnce(true);

      const response = await request(app).put('/api/auth/updatePassword').send({
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Успішна зміна паролю.');
    });

    it('should return 400 if old password is incorrect', async () => {
      (UserService.changePassword as jest.Mock).mockRejectedValueOnce(
        new Error('BAD_REQUEST'),
      );

      const response = await request(app).put('/api/auth/updatePassword').send({
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Старий пароль невірний.');
    });
  });

  describe('DELETE /api/auth/deleteUser', () => {
    it('should delete user successfully', async () => {
      (UserService.deleteUser as jest.Mock).mockResolvedValueOnce(true);

      const response = await request(app).delete('/api/auth/deleteUser');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Користувача видалено успішно.');
    });

    it('should return 404 if user not found', async () => {
      (UserService.deleteUser as jest.Mock).mockRejectedValueOnce(
        new Error('NOT_FOUND'),
      );

      const response = await request(app).delete('/api/auth/deleteUser');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Користувача не знайдено.');
    });
  });
});
