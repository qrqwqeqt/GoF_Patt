import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/userRouter';
import deviceRoutes from './routes/deviceRouter';
import ticketsRoutes from './routes/ticketRouter';
import paymentCardRoutes from './routes/paymentCardRouter';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
  })
);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/paymentCards', paymentCardRoutes);

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB підключено');

    app.listen(PORT, () => console.log(`Сервер працює на порту ${PORT}`));
  } catch (error) {
    console.error('Помилка підключення до бази даних', error);
    process.exit(1);
  }
};

startServer();
