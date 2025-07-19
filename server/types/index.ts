import { Request } from 'express';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      id: string;
    };
  }
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

export interface Chat extends Document {
  type: 'private' | 'group';
  name?: string;
  participants: string[];
  lastMessage?: string;
  unreadCount: number;
  isTyping: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

export interface Message extends Document {
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
  isRead: boolean;
  replyTo?: string;
}

export interface User extends Document {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  status?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  role: 'client' | 'driver' | 'admin';
  
  generateAuthToken: () => string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

export interface TaxiBooking extends Document {
  userId: string;
  pickupLocation: string;
  destination: string;
  pickupTime: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  driverId?: mongoose.Schema.Types.ObjectId;
  driverName?: string;
  driverPhone?: string;
  vehicleInfo?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  completedAt?: Date;
}
