// User types
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

// Chat types
export interface Chat {
  id: string;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: Date;
  isRead: boolean;
  replyTo?: string;
}

// Taxi types
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plateNumber: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  isOnline: boolean;
}

export interface Ride {
  id: string;
  customerId: string;
  driverId?: string;
  origin: Location;
  destination: Location;
  status: 'pending' | 'accepted' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';
  estimatedPrice: number;
  finalPrice?: number;
  estimatedDuration: number; // в минутах
  estimatedDistance: number; // в километрах
  actualDuration?: number;
  actualDistance?: number;
  driver?: Driver;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  notes?: string;
}

export interface RideEstimate {
  distance: number;
  duration: number;
  price: number;
  route: any; // Google Maps route object
}

// App types
export type AppMode = 'chat' | 'taxi';

export type AuthMode = 'login' | 'register';

export interface AuthUser extends User {
  token?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Maps types
export interface MapsConfig {
  apiKey: string;
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  mapStyles: {
    default: any[];
    dark: any[];
    minimal: any[];
  };
}

export interface GeocodeResult {
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  types?: string[];
}

export interface DirectionsResult {
  routes: any[];
  distance: number;
  duration: number;
  status: string;
}

// Socket events
export interface SocketEvents {
  // Chat events
  new_message: (message: Message) => void;
  message_read: (data: { chatId: string; messageId: string; userId: string }) => void;
  user_typing: (data: { chatId: string; userId: string; isTyping: boolean }) => void;
  user_online: (data: { userId: string; isOnline: boolean }) => void;
  
  // Ride events
  ride_update: (ride: Ride) => void;
  driver_location: (data: { rideId: string; location: { lat: number; lng: number } }) => void;
  ride_accepted: (data: { rideId: string; driver: Driver }) => void;
  ride_started: (data: { rideId: string }) => void;
  ride_completed: (data: { rideId: string; finalPrice: number }) => void;
  ride_cancelled: (data: { rideId: string; reason: string }) => void;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface RideBookingForm {
  origin: Location;
  destination: Location;
  scheduledFor?: Date;
  notes?: string;
}

// Theme
export type Theme = 'light' | 'dark';

// Component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

