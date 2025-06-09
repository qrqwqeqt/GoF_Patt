import request from 'supertest';
import express, { RequestHandler } from 'express';
import {
  addPaymentCard,
  getPaymentCardsByOwnerId,
  deletePaymentCard,
} from '../../../src/controllers/paymentCardController';
import { PaymentCardService } from '../../../src/services/PaymentCardService';

const mockAuthenticateToken = jest.fn((req, res, next) => {
  const mockUser = { id: '123', name: 'Mock', surname: 'User' };
  req.user = mockUser;
  next();
});

const app = express();
app.use(express.json());

app.post(
  '/api/paymentCards/addPaymentCard',
  mockAuthenticateToken,
  addPaymentCard as unknown as RequestHandler,
);
app.get(
  '/api/paymentCards/getPaymentCardsByOwnerId',
  mockAuthenticateToken,
  getPaymentCardsByOwnerId as unknown as RequestHandler,
);
app.delete(
  '/api/paymentCards/deletePaymentCard/:id',
  mockAuthenticateToken,
  deletePaymentCard as unknown as RequestHandler,
);

jest.mock('../../../src/services/PaymentCardService');

describe('Payment Card Controller', () => {
  const mockUser = { id: 'user123', name: 'Test User' };
  const mockToken = 'mockToken';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/paymentCards/addPaymentCard', () => {
    it('should create a payment card and return 201', async () => {
      (PaymentCardService.createPaymentCard as jest.Mock).mockResolvedValue({
        id: 'card123',
        cardNumber: '1234567812345678',
        expiryDate: '12/25',
        ownerName: 'John Doe',
        ownerId: mockUser.id,
      });

      const response = await request(app)
        .post('/api/paymentCards/addPaymentCard')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cardNumber: '1234567812345678',
          expiryDate: '12/25',
          ownerName: 'John Doe',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Платіжна картка додана.',
        paymentCard: {
          id: 'card123',
          cardNumber: '1234567812345678',
          expiryDate: '12/25',
          ownerName: 'John Doe',
          ownerId: mockUser.id,
        },
      });
    });

    it('should return 500 on server error', async () => {
      (PaymentCardService.createPaymentCard as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const response = await request(app)
        .post('/api/paymentCards/addPaymentCard')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          cardNumber: '1234567812345678',
          expiryDate: '12/25',
          ownerName: 'John Doe',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Помилка сервера.');
    });
  });

  describe('GET /api/paymentCards/getPaymentCardsByOwnerId', () => {
    it('should return payment cards for the user', async () => {
      (
        PaymentCardService.getPaymentCardsByOwnerId as jest.Mock
      ).mockResolvedValue([
        {
          id: 'card123',
          cardNumber: '1234567812345678',
          expiryDate: '12/25',
          ownerName: 'John Doe',
          ownerId: mockUser.id,
        },
      ]);

      const response = await request(app)
        .get('/api/paymentCards/getPaymentCardsByOwnerId')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: 'card123',
          cardNumber: '1234567812345678',
          expiryDate: '12/25',
          ownerName: 'John Doe',
          ownerId: mockUser.id,
        },
      ]);
    });

    it('should return 500 on server error', async () => {
      (
        PaymentCardService.getPaymentCardsByOwnerId as jest.Mock
      ).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/paymentCards/getPaymentCardsByOwnerId')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Помилка сервера.');
    });
  });

  describe('DELETE /api/paymentCards/deletePaymentCard/:id', () => {
    it('should delete a payment card and return 200', async () => {
      (PaymentCardService.deletePaymentCard as jest.Mock).mockResolvedValue({
        message: 'Платіжну картку успішно видалено.',
      });

      const response = await request(app)
        .delete('/api/paymentCards/deletePaymentCard/card123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Платіжну картку успішно видалено.',
      });
    });

    it('should return 404 if card is not found', async () => {
      (PaymentCardService.deletePaymentCard as jest.Mock).mockRejectedValue(
        new Error('NOT_FOUND'),
      );

      const response = await request(app)
        .delete('/api/paymentCards/deletePaymentCard/card123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Платіжну картку не знайдено.',
      });
    });

    it('should return 403 if access is forbidden', async () => {
      (PaymentCardService.deletePaymentCard as jest.Mock).mockRejectedValue(
        new Error('FORBIDDEN'),
      );

      const response = await request(app)
        .delete('/api/paymentCards/deletePaymentCard/card123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        message: 'Відмовлено у доступі.',
      });
    });

    it('should return 500 on server error', async () => {
      (PaymentCardService.deletePaymentCard as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const response = await request(app)
        .delete('/api/paymentCards/deletePaymentCard/card123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Помилка сервера.');
    });
  });
});
