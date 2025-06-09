import PaymentCard from '../../../src/models/PaymentCard';
import { PaymentCardService } from '../../../src/services/PaymentCardService';

jest.mock('../../../src/models/PaymentCard');

describe('PaymentCardService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentCard', () => {
    it('should create and save a new payment card', async () => {
      const mockSave = jest.fn().mockResolvedValue({
        cardNumber: '1234567812345678',
        expiryDate: [12, 25],
        ownerName: 'John Doe',
        ownerId: 'owner123',
      });

      (PaymentCard as unknown as jest.Mock).mockImplementationOnce(() => ({
        save: mockSave,
        cardNumber: '1234567812345678',
        expiryDate: [12, 25],
        ownerName: 'John Doe',
        ownerId: 'owner123',
      }));

      const result = await PaymentCardService.createPaymentCard(
        '1234567812345678',
        [12, 25],
        'John Doe',
        'owner123',
      );

      expect(result.cardNumber).toBe('1234567812345678');
      expect(result.expiryDate).toEqual([12, 25]);
      expect(result.ownerName).toBe('John Doe');
      expect(result.ownerId).toBe('owner123');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getPaymentCardsByOwnerId', () => {
    it('should return payment cards by ownerId', async () => {
      const mockCards = [
        {
          cardNumber: '1234',
          expiryDate: [12, 25],
          ownerName: 'John Doe',
          ownerId: 'owner123',
        },
      ];
      (PaymentCard.find as jest.Mock).mockResolvedValue(mockCards);

      const result =
        await PaymentCardService.getPaymentCardsByOwnerId('owner123');

      expect(PaymentCard.find).toHaveBeenCalledWith({ ownerId: 'owner123' });
      expect(result).toEqual(mockCards);
    });
  });

  describe('deletePaymentCard', () => {
    it('should delete a payment card if it exists and ownerId matches', async () => {
      const mockCard = { id: 'card123', ownerId: 'owner123' };
      (PaymentCard.findById as jest.Mock).mockResolvedValue(mockCard);
      (PaymentCard.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

      await PaymentCardService.deletePaymentCard('card123', 'owner123');

      expect(PaymentCard.findById).toHaveBeenCalledWith('card123');
      expect(PaymentCard.findByIdAndDelete).toHaveBeenCalledWith('card123');
    });

    it('should throw an error if the card is not found', async () => {
      (PaymentCard.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        PaymentCardService.deletePaymentCard('card123', 'owner123'),
      ).rejects.toThrow('NOT_FOUND');
    });

    it('should throw an error if ownerId does not match', async () => {
      const mockCard = { id: 'card123', ownerId: 'otherOwner' };
      (PaymentCard.findById as jest.Mock).mockResolvedValue(mockCard);

      await expect(
        PaymentCardService.deletePaymentCard('card123', 'owner123'),
      ).rejects.toThrow('FORBIDDEN');
    });
  });
});
