import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { UserService } from '../services/UserService';

export const createUser = async (req: Request, res: Response) => {
  const { name, surname, email, password } = req.body;

  try {
    await UserService.createUser(name, surname, email, password);

    res.status(201).json({ message: 'Користувача зареєстровано успішно.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'BAD_REQUEST') {
      return res
        .status(400)
        .json({ message: 'Користувач із таким email вже існує.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const authenticateUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const token = await UserService.authenticateUser(email, password);

    res.json({ token, message: 'Успішний вхід.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }
    if (error instanceof Error && error.message === 'BAD_REQUEST') {
      return res.status(400).json({ message: 'Невірний пароль.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.user.id;

  try {
    const user = await UserService.getUser(id);

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.user.id;
  const updates = req.body;

  try {
    const updatedUser = await UserService.updateUser(id, updates);

    res
      .status(200)
      .json({ message: 'Дані користувача оновлено.', updatedUser });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const id = req.user.id;
  const { oldPassword, newPassword } = req.body;

  try {
    await UserService.changePassword(id, oldPassword, newPassword);

    res.status(200).json({ message: 'Успішна зміна паролю.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }
    if (error instanceof Error && error.message === 'BAD_REQUEST') {
      return res.status(400).json({ message: 'Старий пароль невірний.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.user.id;

  try {
    await UserService.deleteUser(id);

    res.status(200).json({ message: 'Користувача видалено успішно.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
