import { Request, Response } from 'express';
import { DeviceData } from '../interfaces/device.interface';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { DeviceService } from '../services/DeviceService';

export const addDevice = async (req: AuthenticatedRequest, res: Response) => {
  const deviceInfo = req.body as DeviceData;
  const deviceImages = req.files as Express.Multer.File[];

  try {
    const device = await DeviceService.createDevice(
      deviceInfo,
      deviceImages,
      req.user.id,
    );

    res.status(201).json({ message: 'Пристрій додано.', device });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const getDevice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const device = await DeviceService.getDevice(id);

    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const getDevicesByOwnerId = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const ownerId = req.user.id;

  try {
    const devices = await DeviceService.getDevicesByOwnerId(ownerId);

    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const getAllDevices = async (req: Request, res: Response) => {
  try {
    const devices = await DeviceService.getAllDevices();

    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const updateDevice = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;
  const updates = req.body;
  const ownerId = req.user.id;

  try {
    const updatedDevice = await DeviceService.updateDevice(
      id,
      updates,
      ownerId,
    );

    res.status(200).json({ message: 'Дані пристрою оновлено.', updatedDevice });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Пристрій не знайдено.' });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Відмовлено у доступі.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const deleteDevice = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;
  const ownerId = req.user.id;

  try {
    await DeviceService.deleteDevice(id, ownerId);

    res.status(200).json({ message: 'Пристрій успішно видалено.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Пристрій не знайдено.' });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Відмовлено у доступі.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
