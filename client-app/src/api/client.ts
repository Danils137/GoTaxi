import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';

export interface ApiConfig {
  baseURL: string;
  socketURL: string;
}

export class GoTaxiApiClient {
  private client: AxiosInstance;
  private socket: Socket | null = null;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
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
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Инициализация Socket.IO
    this.initSocket(config.socketURL);
  }

  private initSocket(socketURL: string) {
    this.socket = io(socketURL, {
      autoConnect: false,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  getSocket() {
    return this.socket;
  }

  // === AUTH API ===
  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', { email, password });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async register(userData: any) {
    const response = await this.client.post('/api/auth/register', userData);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/api/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  // === CHAT API ===
  async getChats() {
    const response = await this.client.get('/api/chat');
    return response.data;
  }

  async getChatMessages(chatId: string, page = 1, limit = 50) {
    const response = await this.client.get(`/api/chat/${chatId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  }

  async sendMessage(chatId: string, content: string, type = 'text') {
    const response = await this.client.post(`/api/chat/${chatId}/message`, {
      content,
      type
    });
    return response.data;
  }

  async createChat(participants: string[], type: 'private' | 'group' = 'private', name?: string) {
    const response = await this.client.post('/api/chat/create', {
      participants,
      type,
      name
    });
    return response.data;
  }

  // === TAXI API ===
  async estimateRide(origin: any, destination: any) {
    const response = await this.client.post('/api/ride/estimate', {
      origin,
      destination
    });
    return response.data;
  }

  async bookRide(rideData: any) {
    const response = await this.client.post('/api/ride/book', rideData);
    return response.data;
  }

  async getRides(status?: string) {
    const response = await this.client.get('/api/ride', {
      params: status ? { status } : {}
    });
    return response.data;
  }

  async getRide(rideId: string) {
    const response = await this.client.get(`/api/ride/${rideId}`);
    return response.data;
  }

  async cancelRide(rideId: string, reason?: string) {
    const response = await this.client.post(`/api/ride/${rideId}/cancel`, { reason });
    return response.data;
  }

  // === USER API ===
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  async updateProfile(profileData: any) {
    const response = await this.client.put('/api/auth/profile', profileData);
    return response.data;
  }

  // === MAPS API ===
  async getMapsConfig(): Promise<MapsConfig> {
    const response = await this.client.get('/api/maps/config');
    return response.data;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    const response = await this.client.post('/api/maps/geocode', { address });
    return response.data.results || [];
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult[]> {
    const response = await this.client.post('/api/maps/reverse-geocode', { lat, lng });
    return response.data.results || [];
  }

  async getDirections(origin: string, destination: string): Promise<DirectionsResult> {
    const response = await this.client.post('/api/maps/directions', { origin, destination });
    return response.data;
  }

  async searchPlaces(query: string, location?: string): Promise<any[]> {
    const response = await this.client.post('/api/maps/places/search', { query, location });
    return response.data.results || [];
  }

  async autocompleteAddress(input: string, location?: string): Promise<any[]> {
    const response = await this.client.post('/api/maps/places/autocomplete', { input, location });
    return response.data.predictions || [];
  }

  async calculateDistanceMatrix(origins: string[], destinations: string[]): Promise<any> {
    const response = await this.client.post('/api/maps/distance-matrix', { origins, destinations });
    return response.data;
  }

  // === SOCKET EVENTS ===
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onRideUpdate(callback: (ride: any) => void) {
    this.socket?.on('ride_update', callback);
  }

  onDriverLocation(callback: (location: any) => void) {
    this.socket?.on('driver_location', callback);
  }

  joinChat(chatId: string) {
    this.socket?.emit('join_chat', chatId);
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leave_chat', chatId);
  }

  joinRide(rideId: string) {
    this.socket?.emit('join_ride', rideId);
  }

  leaveRide(rideId: string) {
    this.socket?.emit('leave_ride', rideId);
  }
}

// Создание экземпляра API клиента
const apiClient = new GoTaxiApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  socketURL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
});

// Восстановление токена из localStorage при загрузке
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  apiClient.setToken(savedToken);
}

export default apiClient;

