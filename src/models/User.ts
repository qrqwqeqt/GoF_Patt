import mongoose, { Schema, Document } from 'mongoose';

// Расширенный интерфейс пользователя
export interface IUser extends Document {
  name: string;
  surname: string;
  email: string;
  password: string;
  phoneNumber: string;
  region: string;
  town: string;
  street: string;
  houseNumber: number;
  apartmentNumber: number;
  floorNumber: number;
  userType: UserType;
  isVerified: boolean;
  registrationDate: Date;
}

// Enum для типов пользователей
export enum UserType {
  REGULAR = 'regular',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

// Observer Pattern - Интерфейс для наблюдателей
export interface UserObserver {
  update(event: UserEvent, user: IUser): void;
}

// События пользователя
export interface UserEvent {
  type: 'CREATED' | 'UPDATED' | 'DELETED' | 'LOGIN' | 'PASSWORD_CHANGED';
  timestamp: Date;
  userId: string;
  data?: any;
}

// Mongoose схема
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: String,
  region: String,
  town: String,
  street: String,
  houseNumber: Number,
  apartmentNumber: Number,
  floorNumber: Number,
  userType: { 
    type: String, 
    enum: Object.values(UserType), 
    default: UserType.REGULAR 
  },
  isVerified: { type: Boolean, default: false },
  registrationDate: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);