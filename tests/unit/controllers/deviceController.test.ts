import request from 'supertest';
import express, { RequestHandler } from 'express';
import {
  addDevice,
  getDevice,
  getDevicesByOwnerId,
  getAllDevices,
  updateDevice,
  deleteDevice,
} from '../../../src/controllers/deviceController';
import { DeviceService } from '../../../src/services/DeviceService';

const mockAuthenticateToken = jest.fn((req, res, next) => {
  const mockUser = { id: '123', name: 'Mock', surname: 'User' };
  req.user = mockUser;
  next();
});
jest.mock('../../../src/services/DeviceService');
jest.mock('../../../src/config/s3.ts', () => ({
  uploadToS3: jest.fn(),
  deleteFromS3: jest.fn(),
}));

const app = express();
app.use(express.json());

app.post(
  '/api/devices/addDevice',
  mockAuthenticateToken,
  addDevice as unknown as RequestHandler,
);
app.get('/api/devices/getDevice/:id', getDevice as unknown as RequestHandler);
app.get(
  '/api/devices/getOwnerDevices',
  mockAuthenticateToken,
  getDevicesByOwnerId as unknown as RequestHandler,
);
app.get('/api/getAllDevices', getAllDevices as RequestHandler);
app.put(
  '/api/devices/updateDevice/:id',
  mockAuthenticateToken,
  updateDevice as unknown as RequestHandler,
);
app.delete(
  '/api/devices/deleteDevice/:id',
  mockAuthenticateToken,
  deleteDevice as unknown as RequestHandler,
);

describe('Device Controller', () => {
  describe('POST /api/devices/addDevice', () => {
    it('should add a device successfully', async () => {
      (DeviceService.createDevice as jest.Mock).mockResolvedValueOnce({
        id: '1',
        name: 'Device 1',
        ownerId: '123',
      });

      const response = await request(app)
        .post('/api/devices/addDevice')
        .send({ name: 'Device 1', description: 'Test Device' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Пристрій додано.');
      expect(response.body.device.name).toBe('Device 1');
    });

    it('should return 500 on server error', async () => {
      (DeviceService.createDevice as jest.Mock).mockRejectedValueOnce(
        new Error('Server Error'),
      );

      const response = await request(app)
        .post('/api/devices/addDevice')
        .send({ name: 'Device 1', description: 'Test Device' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Помилка сервера.');
    });
  });

  describe('GET /api/devices/getDevice/:id', () => {
    it('should return a device by ID', async () => {
      (DeviceService.getDevice as jest.Mock).mockResolvedValueOnce({
        id: '1',
        name: 'Device 1',
      });

      const response = await request(app).get('/api/devices/getDevice/1');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Device 1');
    });

    it('should return 500 on server error', async () => {
      (DeviceService.getDevice as jest.Mock).mockRejectedValueOnce(
        new Error('Server Error'),
      );

      const response = await request(app).get('/api/devices/getDevice/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Помилка сервера.');
    });
  });

  describe('GET /api/devices/getOwnerDevices', () => {
    it('should return devices by owner ID', async () => {
      (DeviceService.getDevicesByOwnerId as jest.Mock).mockResolvedValueOnce([
        { id: '1', name: 'Device 1' },
      ]);

      const response = await request(app).get('/api/devices/getOwnerDevices');

      expect(response.status).toBe(200);
      expect(response.body[0].name).toBe('Device 1');
    });

    it('should return 500 on server error', async () => {
      (DeviceService.getDevicesByOwnerId as jest.Mock).mockRejectedValueOnce(
        new Error('Server Error'),
      );

      const response = await request(app).get('/api/devices/getOwnerDevices');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Помилка сервера.');
    });
  });

  describe('PUT /api/devices/updateDevice/:id', () => {
    it('should update a device successfully', async () => {
      (DeviceService.updateDevice as jest.Mock).mockResolvedValueOnce({
        id: '1',
        name: 'Updated Device',
      });

      const response = await request(app)
        .put('/api/devices/updateDevice/1')
        .send({ name: 'Updated Device' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Дані пристрою оновлено.');
      expect(response.body.updatedDevice.name).toBe('Updated Device');
    });

    it('should return 404 if device not found', async () => {
      (DeviceService.updateDevice as jest.Mock).mockRejectedValueOnce(
        new Error('NOT_FOUND'),
      );

      const response = await request(app)
        .put('/api/devices/updateDevice/1')
        .send({ name: 'Updated Device' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Пристрій не знайдено.');
    });
  });

  describe('DELETE /api/devices/deleteDevice/:id', () => {
    it('should delete a device successfully', async () => {
      (DeviceService.deleteDevice as jest.Mock).mockResolvedValueOnce(true);

      const response = await request(app).delete('/api/devices/deleteDevice/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Пристрій успішно видалено.');
    });

    it('should return 404 if device not found', async () => {
      (DeviceService.deleteDevice as jest.Mock).mockRejectedValueOnce(
        new Error('NOT_FOUND'),
      );

      const response = await request(app).delete('/api/devices/deleteDevice/1');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Пристрій не знайдено.');
    });
  });
});
