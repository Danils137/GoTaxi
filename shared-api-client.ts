// Общий API клиент для всех приложений GoTaxi
// Можно использовать в React, React Native и других клиентах

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class GoTaxiApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Interceptor для добавления токена авторизации
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Можно добавить редирект на страницу входа
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // === AUTH API ===
  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await this.client.post('/api/auth/register', userData);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/api/auth/logout');
    return response.data;
  }

  // === MAPS API ===
  async getMapsConfig() {
    const response = await this.client.get('/api/maps/config');
    return response.data;
  }

  async geocodeAddress(address: string, language = 'ru') {
    const response = await this.client.post('/api/maps/geocode', { address, language });
    return response.data;
  }

  async reverseGeocode(lat: number, lng: number, language = 'ru') {
    const response = await this.client.post('/api/maps/reverse-geocode', { lat, lng, language });
    return response.data;
  }

  async getDirections(origin: string, destination: string, options: any = {}) {
    const response = await this.client.post('/api/maps/directions', {
      origin,
      destination,
      ...options,
    });
    return response.data;
  }

  async searchPlaces(query: string, options: any = {}) {
    const response = await this.client.post('/api/maps/places/search', {
      query,
      ...options,
    });
    return response.data;
  }

  async autocompleteAddress(input: string, options: any = {}) {
    const response = await this.client.post('/api/maps/places/autocomplete', {
      input,
      ...options,
    });
    return response.data;
  }

  async getDistanceMatrix(origins: string[], destinations: string[], options: any = {}) {
    const response = await this.client.post('/api/maps/distance-matrix', {
      origins,
      destinations,
      ...options,
    });
    return response.data;
  }

  // === PAYMENTS API ===
  async setupDriverPayment(driverId: string, email: string, phone?: string) {
    const response = await this.client.post('/api/payments/setup-driver', {
      driverId,
      email,
      phone,
    });
    return response.data;
  }

  async getDriverPaymentStatus(driverId: string, accountId?: string) {
    const response = await this.client.get(`/api/payments/driver-status/${driverId}`, {
      params: { accountId },
    });
    return response.data;
  }

  async createRidePayment(rideData: {
    rideId: string;
    amount: number;
    customerId: string;
    driverAccountId: string;
    applicationFeeAmount?: number;
  }) {
    const response = await this.client.post('/api/payments/create-ride-payment', rideData);
    return response.data;
  }

  async confirmRidePayment(paymentIntentId: string, finalAmount?: number) {
    const response = await this.client.post('/api/payments/confirm-ride-payment', {
      paymentIntentId,
      finalAmount,
    });
    return response.data;
  }

  async cancelRidePayment(paymentIntentId: string, reason?: string) {
    const response = await this.client.post('/api/payments/cancel-ride-payment', {
      paymentIntentId,
      reason,
    });
    return response.data;
  }

  async getDriverEarnings(driverId: string, options: any = {}) {
    const response = await this.client.get(`/api/payments/driver-earnings/${driverId}`, {
      params: options,
    });
    return response.data;
  }

  async createCustomer(userData: {
    userId: string;
    email: string;
    name?: string;
    phone?: string;
  }) {
    const response = await this.client.post('/api/payments/create-customer', userData);
    return response.data;
  }

  // === RIDES API ===
  async createRide(rideData: any) {
    const response = await this.client.post('/api/ride/create', rideData);
    return response.data;
  }

  async getRides(params: any = {}) {
    const response = await this.client.get('/api/ride', { params });
    return response.data;
  }

  async getRide(rideId: string) {
    const response = await this.client.get(`/api/ride/${rideId}`);
    return response.data;
  }

  async updateRide(rideId: string, updateData: any) {
    const response = await this.client.put(`/api/ride/${rideId}`, updateData);
    return response.data;
  }

  async cancelRide(rideId: string, reason?: string) {
    const response = await this.client.post(`/api/ride/${rideId}/cancel`, { reason });
    return response.data;
  }

  // === DRIVERS API ===
  async getDrivers(params: any = {}) {
    const response = await this.client.get('/api/driver', { params });
    return response.data;
  }

  async getDriver(driverId: string) {
    const response = await this.client.get(`/api/driver/${driverId}`);
    return response.data;
  }

  async updateDriverLocation(driverId: string, location: { lat: number; lng: number }) {
    const response = await this.client.post(`/api/driver/${driverId}/location`, location);
    return response.data;
  }

  async updateDriverStatus(driverId: string, status: string) {
    const response = await this.client.post(`/api/driver/${driverId}/status`, { status });
    return response.data;
  }

  // === CHAT API ===
  async getChatMessages(chatId: string, params: any = {}) {
    const response = await this.client.get(`/api/chat/${chatId}/messages`, { params });
    return response.data;
  }

  async sendMessage(chatId: string, message: string, type = 'text') {
    const response = await this.client.post(`/api/chat/${chatId}/message`, { message, type });
    return response.data;
  }

  // === GENERIC REQUEST METHOD ===
  async request(config: AxiosRequestConfig) {
    const response = await this.client.request(config);
    return response.data;
  }
}

// Фабричная функция для создания клиента
export function createGoTaxiClient(baseURL: string, options: Partial<ApiConfig> = {}) {
  return new GoTaxiApiClient({
    baseURL,
    ...options,
  });
}

// Типы для TypeScript
export interface MapsConfig {
  apiKey: string;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
  mapStyles: {
    default: any[];
    dark: any[];
    minimal: any[];
  };
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface DriverPaymentStatus {
  accountId: string;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements: any;
  status: 'active' | 'pending';
}

export interface RideData {
  id: string;
  customerId: string;
  driverId?: string;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  estimatedDuration: number;
  estimatedDistance: number;
  createdAt: string;
  updatedAt: string;
}

// Экспорт по умолчанию
export default GoTaxiApiClient;

