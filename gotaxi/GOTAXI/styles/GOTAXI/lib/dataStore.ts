// Shared in-memory data store for development
// In production, use a proper database

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Ride {
  id: string;
  userId: string;
  driverId: string | null;
  from: any;
  to: any;
  selectedOption: string;
  price: number;
  status: 'pending' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedArrival: string | null;
  startTime: string | null;
  endTime: string | null;
}

export interface Driver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy';
  rating: number;
  vehicle: string;
  plate: string;
}

// Shared data stores
export const users: User[] = [];
export const rides: Ride[] = [];
export const drivers: Driver[] = [
  { id: 'driver1', name: 'John Doe', lat: 56.9496, lng: 24.1052, status: 'available', rating: 4.8, vehicle: 'Toyota Camry', plate: 'ABC-123' },
  { id: 'driver2', name: 'Jane Smith', lat: 56.9510, lng: 24.1080, status: 'available', rating: 4.9, vehicle: 'Honda Accord', plate: 'XYZ-456' },
  { id: 'driver3', name: 'Bob Johnson', lat: 56.9480, lng: 24.1100, status: 'busy', rating: 4.7, vehicle: 'Ford Focus', plate: 'DEF-789' },
  { id: 'driver4', name: 'Alice Brown', lat: 56.9520, lng: 24.1030, status: 'available', rating: 4.6, vehicle: 'Nissan Altima', plate: 'GHI-012' },
  { id: 'driver5', name: 'Charlie Wilson', lat: 56.9470, lng: 24.1060, status: 'available', rating: 4.9, vehicle: 'BMW 3 Series', plate: 'JKL-345' },
];

export const driverLocations: Record<string, { lat: number; lng: number; status: string }> = {
  'driver1': { lat: 56.9496, lng: 24.1052, status: 'available' },
  'driver2': { lat: 56.9510, lng: 24.1080, status: 'available' },
  'driver3': { lat: 56.9480, lng: 24.1100, status: 'busy' },
  'driver4': { lat: 56.9520, lng: 24.1030, status: 'available' },
  'driver5': { lat: 56.9470, lng: 24.1060, status: 'available' },
};
