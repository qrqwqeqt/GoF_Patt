import { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';

export const createTicket = async (req: Request, res: Response) => {
  const { userEmail, message } = req.body;

  try {
    const ticket = await TicketService.createTicket(userEmail, message);

    res.status(201).json({ message: 'Тікет створено.', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const getTicket = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const ticket = await TicketService.getTicket(id);

    res.status(200).json(ticket);
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Тікет не знайдено.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await TicketService.getAllTickets();

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await TicketService.deleteTicket(id);

    res.status(200).json({ message: 'Тікет успішно видалено.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Тікет не знайдено.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
