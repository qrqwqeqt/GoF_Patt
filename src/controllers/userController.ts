import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { UserService } from '../services/UserService';
import { UserType } from '../models/User';

// Singleton Pattern для UserService (опциональный 4-й паттерн)
class UserServiceSingleton {
  private static instance: UserService;
  
  private constructor() {}
  
  public static getInstance(): UserService {
    if (!UserServiceSingleton.instance) {
      UserServiceSingleton.instance = new UserService();
    }
    return UserServiceSingleton.instance;
  }
}

export const createUser = async (req: Request, res: Response) => {
  const { name, surname, email, password, userType } = req.body;

  try {
    // Используем Factory Method через статический метод
    const user = await UserService.createUser(
      name, 
      surname, 
      email, 
      password, 
      userType || UserType.REGULAR
    );

    res.status(201).json({ 
      message: 'Користувача зареєстровано успішно.',
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified
      }
    });
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
    // Получаем экземпляр сервиса (можно использовать Singleton)
    const userService = UserServiceSingleton.getInstance();
    
    // Strategy Pattern автоматически выберет стратегию на основе типа пользователя
    const token = await userService.authenticateUser(email, password);

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

    // Возвращаем данные с учетом типа пользователя
    const userData = {
      id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified,
      registrationDate: user.registrationDate,
      // Включаем дополнительные поля только для определенных типов пользователей
      ...(user.userType !== UserType.REGULAR && {
        phoneNumber: user.phoneNumber,
        region: user.region,
        town: user.town,
        street: user.street,
        houseNumber: user.houseNumber,
        apartmentNumber: user.apartmentNumber,
        floorNumber: user.floorNumber
      })
    };

    res.status(200).json(userData);
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
    const userService = UserServiceSingleton.getInstance();
    
    // Observer Pattern сработает автоматически при обновлении
    const updatedUser = await userService.updateUser(id, updates);

    res.status(200).json({ 
      message: 'Дані користувача оновлено.',
      updatedUser: {
        id: updatedUser._id,
        name: updatedUser.name,
        surname: updatedUser.surname,
        email: updatedUser.email,
        userType: updatedUser.userType,
        isVerified: updatedUser.isVerified
      }
    });
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
    const userService = UserServiceSingleton.getInstance();
    
    // Observer Pattern сработает при смене пароля
    await userService.changePassword(id, oldPassword, newPassword);

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
    const userService = UserServiceSingleton.getInstance();
    
    // Observer Pattern сработает при удалении
    await userService.deleteUser(id);

    res.status(200).json({ message: 'Користувача видалено успішно.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Дополнительный контроллер для работы с премиум функциями
export const upgradeUserToPremium = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.user.id;

  try {
    const userService = UserServiceSingleton.getInstance();
    
    // Обновляем тип пользователя на премиум
    const updatedUser = await userService.updateUser(id, { 
      userType: UserType.PREMIUM,
      isVerified: true 
    });

    res.status(200).json({ 
      message: 'Користувача оновлено до премиум статусу.',
      user: {
        id: updatedUser._id,
        userType: updatedUser.userType,
        isVerified: updatedUser.isVerified
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};