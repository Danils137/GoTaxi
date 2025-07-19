import axios from 'axios';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001';

// Create axios instance for admin API
const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if available
adminApi.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// Admin API services
export const adminService = {
  // Sync ride to admin panel
  syncRide: async (rideData: any) => {
    try {
      const response = await adminApi.post('/api/orders', {
        ...rideData,
        type: 'taxi',
        source: 'web-app'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to sync ride with admin:', error);
      // Don't throw - we don't want to break the main app if admin sync fails
      return null;
    }
  },

  // Sync client registration
  syncClient: async (clientData: any) => {
    try {
      const response = await adminApi.post('/api/clients', {
        ...clientData,
        source: 'web-app'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to sync client with admin:', error);
      return null;
    }
  },

  // Get analytics data
  getAnalytics: async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const response = await adminApi.get('/api/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  },

  // Get drivers from admin
  getDrivers: async () => {
    try {
      const response = await adminApi.get('/api/users?role=driver');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch drivers from admin:', error);
      return [];
    }
  },

  // Update ride status in admin
  updateRideStatus: async (rideId: string, status: string, additionalData?: any) => {
    try {
      const response = await adminApi.put(`/api/orders/${rideId}`, {
        status,
        ...additionalData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update ride status in admin:', error);
      return null;
    }
  }
};

export default adminApi;
