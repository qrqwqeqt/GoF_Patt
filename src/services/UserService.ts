import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import Device from '../models/Device';
import PaymentCard from '../models/PaymentCard';

export class UserService {
  static async createUser(
    name: string,
    surname: string,
    email: string,
    password: string,
  ) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('BAD_REQUEST');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPassword,
    });
    await newUser.save();
  }

  static async authenticateUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('BAD_REQUEST');
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, surname: user.surname },
      process.env.JWT_SECRET as string,
      { expiresIn: '2 days' },
    );

    return token;
  }

  static async getUser(id: string) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('NOT_FOUND');
    }
    return user;
  }

  static async updateUser(id: string, updates: Partial<IUser>) {
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error('NOT_FOUND');
    }
    return updatedUser;
  }

  static async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('BAD_REQUEST');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
  }

  static async deleteUser(id: string) {
    const deletedUser = await User.findByIdAndDelete(id);
    
    await Device.deleteMany({ ownerId: id });
    await PaymentCard.deleteMany({ ownerId: id });
    if (!deletedUser) {
      throw new Error('NOT_FOUND');
    }
  }
}
