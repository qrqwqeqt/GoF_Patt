import { DeviceService } from '../../../src/services/DeviceService';
import Device, { IDevice } from '../../../src/models/Device';
import { deleteFromS3, uploadToS3 } from '../../../src/config/s3';
import { parseFormData } from '../../../src/utils/parseFormData';
import mongoose from 'mongoose';
import { DeviceData } from '../../../src/interfaces/device.interface';

jest.mock('../../../src/config/s3.ts', () => ({
  uploadToS3: jest.fn(),
  deleteFromS3: jest.fn(),
}));
jest.mock('../../../src/utils/parseFormData');
jest.mock('../../../src/models/Device');

describe('DeviceService', () => {
  const mockDeviceId = '507f1f77bcf86cd799439011';
  const mockOwnerId = '507f1f77bcf86cd799439012';
  const wrongOwnerId = '507f1f77bcf86cd799439013';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDevice', () => {
    const mockDeviceInfo: DeviceData = {
      title: 'Test Device',
      description: 'Test Description',
      manufacturer: 'Test Manufacturer',
      deviceModel: 'Test Model',
      condition: 'new',
      batteryCapacity: '5000',
      weight: '500',
      typeC: 'yes',
      typeA: 'no',
      sockets: '2',
      remoteUse: 'yes',
      dimensions: '10x20x30',
      batteryType: 'Li-ion',
      signalShape: 'square',
      additional: 'None',
      price: '100',
      minRentTerm: '1',
      maxRentTerm: '30',
      policyAgreement: 'true',
      imageDimensions: JSON.stringify([
        { width: 100, height: 100 },
        { width: 200, height: 200 },
      ]),
    };

    const mockDeviceImages = [
      { filename: 'image1.jpg' },
      { filename: 'image2.jpg' },
    ] as Express.Multer.File[];

    const mockUserId = 'user123';

    it('should create a device successfully', async () => {
      const DeviceMock = Device as jest.MockedClass<typeof Device>;

      (uploadToS3 as jest.Mock).mockResolvedValue({ Location: 'test-url' });
      (parseFormData as jest.Mock).mockReturnValue({
        ...mockDeviceInfo,
        imageDimensions: JSON.parse(mockDeviceInfo.imageDimensions),
      });

      DeviceMock.prototype.save = jest.fn().mockResolvedValue({
        _id: 'device123',
        ...mockDeviceInfo,
        images: [
          { url: 'test-url', width: 100, height: 100 },
          { url: 'test-url', width: 200, height: 200 },
        ],
        ownerId: mockUserId,
      });

      const result = await DeviceService.createDevice(
        mockDeviceInfo,
        mockDeviceImages,
        mockUserId,
      );

      expect(uploadToS3).toHaveBeenCalledTimes(2);
      expect(Device).toHaveBeenCalledWith(
        expect.objectContaining({
          isInRent: false,
          ownerId: mockUserId,
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getDevice', () => {
    const mockDeviceId = 'device123';

    it('should return device with populated owner', async () => {
      const mockDevice = {
        _id: mockDeviceId,
        title: 'Test Device',
        ownerId: {
          name: 'John',
          surname: 'Doe',
          phoneNumber: '1234567890',
        },
      };

      (Device.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDevice),
      });

      const result = await DeviceService.getDevice(mockDeviceId);

      expect(Device.findById).toHaveBeenCalledWith(mockDeviceId);
      expect(result).toEqual(mockDevice);
    });
  });

  describe('getDevicesByOwnerId', () => {
    const mockOwnerId = 'owner123';

    it('should return all devices for owner', async () => {
      const mockDevices = [
        { _id: 'device1', title: 'Device 1' },
        { _id: 'device2', title: 'Device 2' },
      ];

      (Device.find as jest.Mock).mockResolvedValue(mockDevices);

      const result = await DeviceService.getDevicesByOwnerId(mockOwnerId);

      expect(Device.find).toHaveBeenCalledWith({ ownerId: mockOwnerId });
      expect(result).toEqual(mockDevices);
    });
  });

  describe('getAllDevices', () => {
    it('should return all devices with populated owner town', async () => {
      const mockDevices = [
        { _id: 'device1', title: 'Device 1', ownerId: { town: 'Town1' } },
        { _id: 'device2', title: 'Device 2', ownerId: { town: 'Town2' } },
      ];

      (Device.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDevices),
      });

      const result = await DeviceService.getAllDevices();

      expect(Device.find).toHaveBeenCalled();
      expect(result).toEqual(mockDevices);
    });
  });

  describe('updateDevice', () => {
    const mockUpdates: Partial<IDevice> = {
      title: 'Updated Device',
      description: 'Updated Description',
      price: 150,
    };

    it('should update device successfully', async () => {
      const mockDevice = {
        _id: mockDeviceId,
        ownerId: new mongoose.Types.ObjectId(mockOwnerId),
        ...mockUpdates,
      };

      (Device.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockDevice);

      const result = await DeviceService.updateDevice(
        mockDeviceId,
        mockUpdates,
        mockOwnerId,
      );

      expect(Device.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDeviceId,
        mockUpdates,
        { new: true },
      );
      expect(result).toEqual(mockDevice);
    });

    it('should throw FORBIDDEN error if user is not owner', async () => {
      const mockDevice = {
        _id: mockDeviceId,
        ownerId: new mongoose.Types.ObjectId(mockOwnerId),
        ...mockUpdates,
      };

      (Device.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockDevice);

      await expect(
        DeviceService.updateDevice(mockDeviceId, mockUpdates, wrongOwnerId),
      ).rejects.toThrow('FORBIDDEN');
    });

    it('should throw NOT_FOUND error if device does not exist', async () => {
      (Device.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        DeviceService.updateDevice(mockDeviceId, mockUpdates, mockOwnerId),
      ).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('deleteDevice', () => {
    it('should delete device and its images successfully', async () => {
      const mockDevice = {
        _id: mockDeviceId,
        ownerId: new mongoose.Types.ObjectId(mockOwnerId),
        images: [{ url: 'image1-url' }, { url: 'image2-url' }],
      };

      (Device.findById as jest.Mock).mockResolvedValue(mockDevice);
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      (Device.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      await DeviceService.deleteDevice(mockDeviceId, mockOwnerId);

      expect(deleteFromS3).toHaveBeenCalledTimes(2);
      expect(Device.findByIdAndDelete).toHaveBeenCalledWith(mockDeviceId);
    });

    it('should throw FORBIDDEN error if user is not owner', async () => {
      const mockDevice = {
        _id: mockDeviceId,
        ownerId: new mongoose.Types.ObjectId(mockOwnerId),
        images: [],
      };

      (Device.findById as jest.Mock).mockResolvedValue(mockDevice);

      await expect(
        DeviceService.deleteDevice(mockDeviceId, wrongOwnerId),
      ).rejects.toThrow('FORBIDDEN');
    });

    it('should throw NOT_FOUND error if device does not exist', async () => {
      (Device.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        DeviceService.deleteDevice(mockDeviceId, mockOwnerId),
      ).rejects.toThrow('NOT_FOUND');
    });
  });
});
