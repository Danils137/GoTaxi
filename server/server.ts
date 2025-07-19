import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import taxiRoutes from './routes/taxi';
import driverRoutes from './routes/driver';
import rideRoutes from './routes/ride';
import chatRoutes from './routes/chat';
import mapRoutes from './routes/map';
import configRoutes from './routes/config';
import mapsRoutes from './routes/maps';
import paymentsRoutes from './routes/payments';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Настройка CORS для Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8082", "http://localhost:3000", "http://localhost:3001", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Настройка CORS для Express
app.use(cors({
  origin: ["http://localhost:8082", "http://localhost:3000", "http://localhost:3001", "http://localhost:5000", "http://localhost:5050"],
  credentials: true
}));

app.use(express.json());

// Специальная обработка для Stripe webhook (raw body)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/taxi', taxiRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/ride', rideRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/config', configRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/tariff', require('./routes/tariff'));
app.use('/api/ride-matching', require('./routes/rideMatching'));

// Сделать io доступным в маршрутах
app.set('io', io);

// Socket.IO обработчики
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Аутентификация пользователя
  socket.on('authenticate', (data) => {
    const { userId, userType } = data; // userType: 'customer' | 'driver' | 'admin'
    socket.userId = userId;
    socket.userType = userType;
    
    // Присоединяем к комнате пользователя
    socket.join(`${userType}_${userId}`);
    
    console.log(`User ${userId} authenticated as ${userType}`);
  });

  // Чат события
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });

  socket.on('typing_start', (data) => {
    socket.to(data.chatId).emit('user_typing', {
      userId: socket.userId,
      chatId: data.chatId,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.chatId).emit('user_typing', {
      userId: socket.userId,
      chatId: data.chatId,
      isTyping: false
    });
  });

  // Такси события
  socket.on('join_ride', (rideId) => {
    socket.join(`ride_${rideId}`);
    console.log(`User ${socket.userId} joined ride ${rideId}`);
  });

  socket.on('leave_ride', (rideId) => {
    socket.leave(`ride_${rideId}`);
    console.log(`User ${socket.userId} left ride ${rideId}`);
  });

  // Обновление местоположения водителя
  socket.on('driver_location_update', (data) => {
    const { rideId, location } = data;
    socket.to(`ride_${rideId}`).emit('driver_location', {
      rideId,
      location,
      driverId: socket.userId
    });
  });

  // Обновление статуса пользователя
  socket.on('status_update', (status) => {
    socket.broadcast.emit('user_status_change', {
      userId: socket.userId,
      status,
      timestamp: new Date()
    });
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Уведомляем о том, что пользователь офлайн
    if (socket.userId) {
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date()
      });
    }
  });
});

// Обработка ошибок 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Обработка ошибок сервера
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
