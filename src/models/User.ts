import mongoose, { Schema, Document } from 'mongoose';

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
}

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
});

export default mongoose.model<IUser>('User', UserSchema);
