import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPaymentCard extends Document {
  cardNumber: string;
  expiryDate: number[];
  ownerName: string;
  ownerId: Types.ObjectId;
}

const PaymentCardSchema: Schema = new Schema({
  cardNumber: { type: String, required: true },
  expiryDate: { type: [Number], required: true },
  ownerName: { type: String, required: true },
  ownerId: { type: Types.ObjectId, ref: 'User' },
});

export default mongoose.model<IPaymentCard>('PaymentCard', PaymentCardSchema);
