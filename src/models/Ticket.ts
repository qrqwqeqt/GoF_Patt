import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  userEmail: string;
  message: string;
}

const TicketSchema: Schema = new Schema({
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
});

export default mongoose.model<ITicket>('Ticket', TicketSchema);
