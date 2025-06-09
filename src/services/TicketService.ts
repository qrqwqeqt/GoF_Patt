import Ticket from '../models/Ticket';

export class TicketService {
  static async createTicket(userEmail: string, message: string) {
    const ticket = new Ticket({ userEmail, message });
    await ticket.save();

    return ticket;
  }

  static async getTicket(id: string) {
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new Error('NOT_FOUND');
    }

    return ticket;
  }

  static async getAllTickets() {
    const tickets = await Ticket.find();

    return tickets;
  }

  static async deleteTicket(id: string) {
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
      throw new Error('NOT_FOUND');
    }
  }
}
