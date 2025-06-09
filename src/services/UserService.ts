import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { IUser, UserType, UserObserver, UserEvent } from '../models/User';
import Device from '../models/Device';
import PaymentCard from '../models/PaymentCard';

// Strategy Pattern - Интерфейс для стратегий аутентификации
interface AuthenticationStrategy {
  authenticate(email: string, password: string): Promise<string>;
}

// Стратегия стандартной аутентификации
class StandardAuthStrategy implements AuthenticationStrategy {
  async authenticate(email: string, password: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('BAD_REQUEST');
    }

    return jwt.sign(
      { id: user._id, name: user.name, surname: user.surname, userType: user.userType },
      process.env.JWT_SECRET as string,
      { expiresIn: '2 days' }
    );
  }
}

// Стратегия аутентификации для премиум пользователей (расширенный токен)
class PremiumAuthStrategy implements AuthenticationStrategy {
  async authenticate(email: string, password: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('BAD_REQUEST');
    }

    return jwt.sign(
      { 
        id: user._id, 
        name: user.name, 
        surname: user.surname, 
        userType: user.userType,
        premiumFeatures: true 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7 days' } // Премиум пользователи получают токен на 7 дней
    );
  }
}

// Factory Method Pattern - Абстрактная фабрика для создания пользователей
abstract class UserFactory {
  abstract createUser(userData: any): Promise<IUser>;
  
  // Template method
  async processUserCreation(userData: any): Promise<IUser> {
    const user = await this.createUser(userData);
    await this.setupUserDefaults(user);
    return user;
  }
  
  protected async setupUserDefaults(user: IUser): Promise<void> {
    // Общие настройки для всех пользователей
    user.isVerified = false;
    user.registrationDate = new Date();
  }
}

// Конкретная фабрика для обычных пользователей
class RegularUserFactory extends UserFactory {
  async createUser(userData: any): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = new User({
      ...userData,
      password: hashedPassword,
      userType: UserType.REGULAR
    });
    
    return await newUser.save();
  }
}

// Конкретная фабрика для премиум пользователей
class PremiumUserFactory extends UserFactory {
  async createUser(userData: any): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 12); // Более сильное хеширование
    
    const newUser = new User({
      ...userData,
      password: hashedPassword,
      userType: UserType.PREMIUM
    });
    
    return await newUser.save();
  }
  
  protected async setupUserDefaults(user: IUser): Promise<void> {
    await super.setupUserDefaults(user);
    user.isVerified = true; // Премиум пользователи автоматически верифицированы
  }
}

// Конкретная фабрика для админов
class AdminUserFactory extends UserFactory {
  async createUser(userData: any): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 15); // Максимальное хеширование
    
    const newUser = new User({
      ...userData,
      password: hashedPassword,
      userType: UserType.ADMIN
    });
    
    return await newUser.save();
  }
  
  protected async setupUserDefaults(user: IUser): Promise<void> {
    await super.setupUserDefaults(user);
    user.isVerified = true;
  }
}

// Observer Pattern - Конкретные наблюдатели
class EmailNotificationObserver implements UserObserver {
  update(event: UserEvent, user: IUser): void {
    console.log(`Email notification: User ${user.name} - ${event.type} at ${event.timestamp}`);
    // Здесь была бы логика отправки email
  }
}

class AnalyticsObserver implements UserObserver {
  update(event: UserEvent, user: IUser): void {
    console.log(`Analytics: Recording event ${event.type} for user ${user._id}`);
    // Здесь была бы логика отправки данных в аналитику
  }
}

class AuditLogObserver implements UserObserver {
  update(event: UserEvent, user: IUser): void {
    console.log(`Audit: ${event.type} event for user ${user.email} at ${event.timestamp}`);
    // Здесь была бы логика записи в аудит лог
  }
}

// Главный сервис пользователей с интегрированными паттернами
export class UserService {
  private observers: UserObserver[] = [];
  private authStrategy: AuthenticationStrategy;
  
  constructor() {
    // Инициализируем наблюдателей
    this.observers.push(
      new EmailNotificationObserver(),
      new AnalyticsObserver(),
      new AuditLogObserver()
    );
    
    // Устанавливаем стратегию по умолчанию
    this.authStrategy = new StandardAuthStrategy();
  }
  
  // Методы для работы с наблюдателями
  addObserver(observer: UserObserver): void {
    this.observers.push(observer);
  }
  
  removeObserver(observer: UserObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  
  private notifyObservers(event: UserEvent, user: IUser): void {
    this.observers.forEach(observer => observer.update(event, user));
  }
  
  // Методы для работы со стратегиями
  setAuthenticationStrategy(strategy: AuthenticationStrategy): void {
    this.authStrategy = strategy;
  }
  
  // Factory method для получения нужной фабрики
  private getUserFactory(userType: UserType): UserFactory {
    switch (userType) {
      case UserType.REGULAR:
        return new RegularUserFactory();
      case UserType.PREMIUM:
        return new PremiumUserFactory();
      case UserType.ADMIN:
        return new AdminUserFactory();
      default:
        return new RegularUserFactory();
    }
  }
  
  // Обновленные методы сервиса
  static async createUser(
    name: string,
    surname: string,
    email: string,
    password: string,
    userType: UserType = UserType.REGULAR
  ): Promise<IUser> {
    const service = new UserService();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('BAD_REQUEST');
    }

    const factory = service.getUserFactory(userType);
    const user = await factory.processUserCreation({
      name,
      surname,
      email,
      password
    });
    
    // Уведомляем наблюдателей о создании пользователя
    service.notifyObservers({
      type: 'CREATED',
      timestamp: new Date(),
      userId: user._id.toString(),
      data: { userType }
    }, user);
    
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<string> {
    // Определяем стратегию на основе типа пользователя
    const user = await User.findOne({ email });
    if (user && user.userType === UserType.PREMIUM) {
      this.setAuthenticationStrategy(new PremiumAuthStrategy());
    } else {
      this.setAuthenticationStrategy(new StandardAuthStrategy());
    }
    
    const token = await this.authStrategy.authenticate(email, password);
    
    if (user) {
      // Уведомляем о входе
      this.notifyObservers({
        type: 'LOGIN',
        timestamp: new Date(),
        userId: user._id.toString()
      }, user);
    }
    
    return token;
  }

  static async getUser(id: string): Promise<IUser> {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('NOT_FOUND');
    }
    return user;
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser> {
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error('NOT_FOUND');
    }
    
    // Уведомляем об обновлении
    this.notifyObservers({
      type: 'UPDATED',
      timestamp: new Date(),
      userId: updatedUser._id.toString(),
      data: updates
    }, updatedUser);
    
    return updatedUser;
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('BAD_REQUEST');
    }

    // Используем разную силу хеширования в зависимости от типа пользователя
    let saltRounds = 10;
    if (user.userType === UserType.PREMIUM) saltRounds = 12;
    if (user.userType === UserType.ADMIN) saltRounds = 15;
    
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    
    // Уведомляем о смене пароля
    this.notifyObservers({
      type: 'PASSWORD_CHANGED',
      timestamp: new Date(),
      userId: user._id.toString()
    }, user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('NOT_FOUND');
    }
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    await Device.deleteMany({ ownerId: id });
    await PaymentCard.deleteMany({ ownerId: id });
    
    if (!deletedUser) {
      throw new Error('NOT_FOUND');
    }
    
    // Уведомляем об удалении
    this.notifyObservers({
      type: 'DELETED',
      timestamp: new Date(),
      userId: user._id.toString()
    }, user);
  }
}

// Экспортируем стратегии для внешнего использования
export { AuthenticationStrategy, StandardAuthStrategy, PremiumAuthStrategy };
export { UserFactory, RegularUserFactory, PremiumUserFactory, AdminUserFactory };