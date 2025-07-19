import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
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

// Ride services
export const rideService = {
  getAllRides: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get('/taxi/bookings', { params });
    return response.data;
  },

  updateRideStatus: async (rideId: string, status: string) => {
    const response = await api.put(`/taxi/bookings/${rideId}`, { status });
    return response.data;
  },

  getRideStats: async () => {
    const response = await api.get('/taxi/stats');
    return response.data;
  }
};

// Driver services
export const driverService = {
  getAllDrivers: async () => {
    const response = await api.get('/drivers');
    return response.data;
  },

  updateDriverStatus: async (driverId: string, status: string) => {
    const response = await api.put(`/drivers/${driverId}/status`, { status });
    return response.data;
  }
};

export default api;
