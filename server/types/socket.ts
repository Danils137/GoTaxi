import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userType?: 'customer' | 'driver' | 'admin';
}

export interface SocketEvents {
  // Аутентификация
  authenticate: (data: { userId: string; userType: 'customer' | 'driver' | 'admin' }) => void;
  
  // Чат события
  join_chat: (chatId: string) => void;
  leave_chat: (chatId: string) => void;
  typing_start: (data: { chatId: string }) => void;
  typing_stop: (data: { chatId: string }) => void;
  
  // Такси события
  join_ride: (rideId: string) => void;
  leave_ride: (rideId: string) => void;
  driver_location_update: (data: { rideId: string; location: { lat: number; lng: number } }) => void;
  
  // Статус
  status_update: (status: 'online' | 'offline' | 'busy') => void;
}

export interface SocketEmitEvents {
  // Чат события
  new_message: (message: any) => void;
  messages_read: (data: { chatId: string; userId: string }) => void;
  user_typing: (data: { userId: string; chatId: string; isTyping: boolean }) => void;
  
  // Такси события
  new_ride_request: (ride: any) => void;
  ride_accepted: (data: { rideId: string; driver: any }) => void;
  ride_started: (data: { rideId: string }) => void;
  ride_completed: (data: { rideId: string; finalPrice: number }) => void;
  ride_cancelled: (data: { rideId: string; reason: string }) => void;
  driver_location: (data: { rideId: string; location: { lat: number; lng: number }; driverId: string }) => void;
  
  // Статус
  user_status_change: (data: { userId: string; status: string; timestamp: Date }) => void;
}

