import PaymentCard from '../models/PaymentCard';

export class PaymentCardService {
  static async createPaymentCard(
    cardNumber: string,
    expiryDate: number[],
    ownerName: string,
    ownerId: string,
  ) {
    const paymentCard = new PaymentCard({
      cardNumber,
      expiryDate,
      ownerName,
      ownerId,
    });
    await paymentCard.save();

    return paymentCard;
  }

  static async getPaymentCardsByOwnerId(ownerId: string) {
    const paymentCards = await PaymentCard.find({ ownerId });

    return paymentCards;
  }

  static async deletePaymentCard(id: string, ownerId: string) {
    const paymentCard = await PaymentCard.findById(id);
    if (!paymentCard) {
      throw new Error('NOT_FOUND');
    }

    if (paymentCard.ownerId.toString() !== ownerId) {
      throw new Error('FORBIDDEN');
    }

    await PaymentCard.findByIdAndDelete(id);
  }
}
