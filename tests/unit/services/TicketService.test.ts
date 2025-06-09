import Ticket from '../../../src/models/Ticket';
import { TicketService } from '../../../src/services/TicketService';

jest.mock('../../../src/models/Ticket');

describe('TicketService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create and save a new ticket', async () => {
      const mockSave = jest.fn().mockResolvedValue({
        userEmail: 'john_doe123@gmail.com',
        message: 'Hello',
      });

      (Ticket as unknown as jest.Mock).mockImplementationOnce(() => ({
        save: mockSave,
        userEmail: 'john_doe123@gmail.com',
        message: 'Hello',
      }));

      const result = await TicketService.createTicket(
        'john_doe123@gmail.com',
        'Hello',
      );

      expect(result.userEmail).toBe('john_doe123@gmail.com');
      expect(result.message).toEqual('Hello');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getTicket', () => {
    it('should return ticket by id', async () => {
      const mockTicket = {
        _id: 'ticket123',
        userEmail: 'john_doe123@gmail.com',
        message: 'Hello',
      };
      (Ticket.findById as jest.Mock).mockResolvedValue(mockTicket);

      const result = await TicketService.getTicket('ticket123');

      expect(Ticket.findById).toHaveBeenCalledWith('ticket123');
      expect(result).toEqual(mockTicket);
    });

    it('should throw an error if the ticket is not found', async () => {
      (Ticket.findById as jest.Mock).mockResolvedValue(null);

      await expect(TicketService.getTicket('ticket123')).rejects.toThrow(
        'NOT_FOUND',
      );
    });
  });

  describe('getAllTickets', () => {
    it('should return all tickets', async () => {
      const mockTickets = [
        {
          userEmail: 'john_doe123@gmail.com',
          message: 'Hello',
        },
        {
          userEmail: 'john_doe123@gmail.com',
          message: 'Hello2',
        },
        {
          userEmail: 'john_doe123@gmail.com',
          message: 'Hello3',
        },
      ];
      (Ticket.find as jest.Mock).mockResolvedValue(mockTickets);

      const result = await TicketService.getAllTickets();

      expect(Ticket.find).toHaveBeenCalled();
      expect(result).toEqual(mockTickets);
    });
  });

  describe('deleteTicket', () => {
    it('should delete a ticket if it exists', async () => {
      const mockTicket = {
        _id: 'ticket123',
        userEmail: 'john_doe123@gmail.com',
        message: 'Hello',
      };
      (Ticket.findByIdAndDelete as jest.Mock).mockResolvedValue(mockTicket);

      await TicketService.deleteTicket('ticket123');

      expect(Ticket.findByIdAndDelete).toHaveBeenCalledWith('ticket123');
    });

    it('should throw an error if ticket is not found', async () => {
      (Ticket.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(TicketService.deleteTicket('ticket123')).rejects.toThrow(
        'NOT_FOUND',
      );
    });
  });
});
