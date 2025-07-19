import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => {
    const response = await api.post('/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Driver services
export const driverService = {
  getNearbyDrivers: async (location: { lat: number; lng: number }, radius?: number) => {
    const response = await api.post('/api/drivers/nearby', {
      lat: location.lat,
      lng: location.lng,
      radius: radius || 5,
    });
    return response.data;
  },

  getDriverLocation: async (driverId: string) => {
    const response = await api.get(`/api/drivers/${driverId}/location`);
    return response.data;
  },

  updateDriverLocation: async (driverId: string, location: { lat: number; lng: number; status?: string }) => {
    const response = await api.put(`/api/drivers/${driverId}/location`, location);
    return response.data;
  },
};

// Ride services
export const rideService = {
  createRide: async (rideData: {
    from: any;
    to: any;
    selectedOption: string;
    price: number;
    driverId?: string;
  }) => {
    const response = await api.post('/api/rides/create', rideData);
    return response.data;
  },

  getRideStatus: async (rideId: string) => {
    const response = await api.get(`/api/rides/${rideId}/status`);
    return response.data;
  },

  cancelRide: async (rideId: string) => {
    const response = await api.post(`/api/rides/${rideId}/cancel`);
    return response.data;
  },
};

export default api;
