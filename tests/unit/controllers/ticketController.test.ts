import request from 'supertest';
import express, { RequestHandler } from 'express';
import {
  createTicket,
  getTicket,
  getAllTickets,
  deleteTicket,
} from '../../../src/controllers/ticketController';
import { TicketService } from '../../../src/services/TicketService';

const app = express();
app.use(express.json());

app.post('/api/tickets/createTicket', createTicket as RequestHandler);
app.get('/api/tickets/getTicket/:id', getTicket as RequestHandler);
app.get('/api/tickets/getAllTickets', getAllTickets as RequestHandler);
app.delete('/api/tickets/deleteTicket/:id', deleteTicket as RequestHandler);

jest.mock('../../../src/services/TicketService');

describe('Ticket Controller', () => {
  describe('POST /api/tickets/createTicket', () => {
    it('should create a ticket and return it', async () => {
      const mockTicket = {
        id: '1',
        userEmail: 'test@example.com',
        message: 'Test message',
      };
      (TicketService.createTicket as jest.Mock).mockResolvedValue(mockTicket);

      const res = await request(app)
        .post('/api/tickets/createTicket')
        .send({ userEmail: 'test@example.com', message: 'Test message' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Тікет створено.',
        ticket: mockTicket,
      });
      expect(TicketService.createTicket).toHaveBeenCalledWith(
        'test@example.com',
        'Test message',
      );
    });

    it('should return 500 if the service throws an error', async () => {
      (TicketService.createTicket as jest.Mock).mockRejectedValue(
        new Error('Service Error'),
      );

      const res = await request(app)
        .post('/api/tickets/createTicket')
        .send({ userEmail: 'test@example.com', message: 'Test message' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Помилка сервера.');
    });
  });

  describe('GET /api/tickets/getTicket/:id', () => {
    it('should return a ticket if found', async () => {
      const mockTicket = {
        id: '1',
        userEmail: 'test@example.com',
        message: 'Test message',
      };
      (TicketService.getTicket as jest.Mock).mockResolvedValue(mockTicket);

      const res = await request(app).get('/api/tickets/getTicket/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTicket);
      expect(TicketService.getTicket).toHaveBeenCalledWith('1');
    });

    it('should return 404 if the ticket is not found', async () => {
      (TicketService.getTicket as jest.Mock).mockRejectedValue(
        new Error('NOT_FOUND'),
      );

      const res = await request(app).get('/api/tickets/getTicket/1');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Тікет не знайдено.');
    });

    it('should return 500 for server errors', async () => {
      (TicketService.getTicket as jest.Mock).mockRejectedValue(
        new Error('Service Error'),
      );

      const res = await request(app).get('/api/tickets/getTicket/1');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Помилка сервера.');
    });
  });

  describe('GET /api/tickets/getAllTickets', () => {
    it('should return all tickets', async () => {
      const mockTickets = [
        { id: '1', userEmail: 'user1@example.com', message: 'Message 1' },
        { id: '2', userEmail: 'user2@example.com', message: 'Message 2' },
      ];
      (TicketService.getAllTickets as jest.Mock).mockResolvedValue(mockTickets);

      const res = await request(app).get('/api/tickets/getAllTickets');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTickets);
      expect(TicketService.getAllTickets).toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      (TicketService.getAllTickets as jest.Mock).mockRejectedValue(
        new Error('Service Error'),
      );

      const res = await request(app).get('/api/tickets/getAllTickets');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Помилка сервера.');
    });
  });

  describe('DELETE /api/tickets/deleteTicket/:id', () => {
    it('should delete a ticket and return success message', async () => {
      (TicketService.deleteTicket as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).delete('/api/tickets/deleteTicket/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Тікет успішно видалено.');
      expect(TicketService.deleteTicket).toHaveBeenCalledWith('1');
    });

    it('should return 404 if the ticket is not found', async () => {
      (TicketService.deleteTicket as jest.Mock).mockRejectedValue(
        new Error('NOT_FOUND'),
      );

      const res = await request(app).delete('/api/tickets/deleteTicket/1');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Тікет не знайдено.');
    });

    it('should return 500 for server errors', async () => {
      (TicketService.deleteTicket as jest.Mock).mockRejectedValue(
        new Error('Service Error'),
      );

      const res = await request(app).delete('/api/tickets/deleteTicket/1');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Помилка сервера.');
    });
  });
});
