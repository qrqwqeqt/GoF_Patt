import { Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { PaymentCardService } from '../services/PaymentCardService';

export const addPaymentCard = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { cardNumber, expiryDate, ownerName } = req.body;
  const ownerId = req.user.id;

  try {
    const paymentCard = await PaymentCardService.createPaymentCard(
      cardNumber,
      expiryDate,
      ownerName,
      ownerId,
    );

    res.status(201).json({ message: 'Платіжна картка додана.', paymentCard });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const getPaymentCardsByOwnerId = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const ownerId = req.user.id;

  try {
    const paymentCards =
      await PaymentCardService.getPaymentCardsByOwnerId(ownerId);

    res.status(200).json(paymentCards);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const deletePaymentCard = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;
  const ownerId = req.user.id;

  try {
    await PaymentCardService.deletePaymentCard(id, ownerId);

    res.status(200).json({
      message: 'Платіжну картку успішно видалено.',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Платіжну картку не знайдено.' });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Відмовлено у доступі.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
