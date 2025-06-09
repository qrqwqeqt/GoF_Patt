import { authenticateToken } from '../../../src/middlewares/authMiddleware';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(authenticateToken as express.RequestHandler);
app.get('/protected', (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

jest.mock('jsonwebtoken');

describe('authenticateToken middleware', () => {
  it('should return 401 if token is missing', async () => {
    const response = await request(app).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Token is required');
  });

  it('should return 403 if token is invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Invalid token');
  });

  it('should pass the token and call next if token is valid', async () => {
    const mockUser = { id: 1, name: 'John Doe' };

    (jwt.verify as jest.Mock).mockImplementationOnce(() => mockUser);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });
});
