import mongoose, { Schema } from 'mongoose';
import { User } from '../types';

const UserSchema = new Schema<User>({
  name: { type: String, required: [true, 'Name is required'], minlength: [2, 'Name must be at least 2 characters'] },
  email: { type: String, unique: true, sparse: true, validate: { validator: (v: string) => /^\S+@\S+\.\S+$/.test(v), message: 'Invalid email format' } },
  phone: { type: String, unique: true, sparse: true, validate: { validator: (v: string) => /^\+?[\d\s-]{10,}$/.test(v), message: 'Invalid phone number format' } },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'] },
  avatar: { type: String },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
  status: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  role: { type: String, enum: ['client', 'driver', 'admin'], default: 'client' }, // Добавляем роль для различия клиентов и водителей
});

// Создание индекса для геопоиска
UserSchema.index({ location: '2dsphere' });

export default mongoose.model<User>('User', UserSchema);
