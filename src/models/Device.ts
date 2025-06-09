import mongoose, { Schema, Document, Types } from 'mongoose';
import { DeviceImage, Dimensions } from '../interfaces/device.interface';

export interface IDevice extends Document {
  title: string;
  description: string;
  manufacturer: string;
  deviceModel: string;
  condition: string;
  batteryCapacity: number;
  weight: number;
  typeC: number;
  typeA: number;
  sockets: number;
  remoteUse: string;
  dimensions: Dimensions;
  batteryType: string;
  signalShape: string;
  additional: string;
  images: DeviceImage[];
  price: number;
  minRentTerm: number;
  maxRentTerm: number;
  policyAgreement: boolean;
  isInRent: boolean;
  ownerId: Types.ObjectId;
}

const DeviceSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: String,
  manufacturer: { type: String, required: true },
  deviceModel: { type: String, required: true },
  condition: { type: String, required: true },
  batteryCapacity: { type: Number, required: true },
  weight: { type: Number, required: true },
  typeC: { type: Number, required: true },
  typeA: { type: Number, required: true },
  sockets: { type: Number, required: true },
  remoteUse: { type: String, required: true },
  dimensions: {
    length: { type: String, required: true },
    width: { type: String, required: true },
    height: { type: String, required: true },
  },
  batteryType: { type: String, required: true },
  signalShape: { type: String, required: true },
  additional: String,
  images: [
    {
      url: { type: String, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
  ],
  price: { type: Number, required: true },
  minRentTerm: { type: Number, required: true },
  maxRentTerm: { type: Number, required: true },
  policyAgreement: { type: Boolean, required: true },
  isInRent: { type: Boolean, required: true },
  ownerId: { type: Types.ObjectId, ref: 'User' },
});

export default mongoose.model<IDevice>('Device', DeviceSchema);
