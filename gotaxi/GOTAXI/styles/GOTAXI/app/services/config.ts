import axios from 'axios';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001';

interface AppConfig {
  googleMapsApiKey: string;
  mapSettings: {
    defaultCenter: { lat: number; lng: number };
    defaultZoom: number;
  };
  api: {
    timeout: number;
    retryAttempts: number;
  };
  features: {
    enablePayments: boolean;
    enableRatings: boolean;
    enablePromoCode: boolean;
  };
}

class ConfigService {
  private config: AppConfig | null = null;
  private configPromise: Promise<AppConfig> | null = null;

  async getConfig(): Promise<AppConfig> {
    // If config is already loaded, return it
    if (this.config) {
      return this.config;
    }

    // If a request is already in progress, wait for it
    if (this.configPromise) {
      return this.configPromise;
    }

    // Make the request
    this.configPromise = this.fetchConfig();
    this.config = await this.configPromise;
    this.configPromise = null;

    return this.config;
  }

  private async fetchConfig(): Promise<AppConfig> {
    try {
      console.log('Fetching config from:', `${ADMIN_API_URL}/api/config/public`);
      const response = await axios.get(`${ADMIN_API_URL}/api/config/public`);
      console.log('Config fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch config from admin:', error);
      // Fallback config
      return {
        googleMapsApiKey: '',
        mapSettings: {
          defaultCenter: { lat: 56.9496, lng: 24.1052 },
          defaultZoom: 13,
        },
        api: {
          timeout: 30000,
          retryAttempts: 3,
        },
        features: {
          enablePayments: true,
          enableRatings: true,
          enablePromoCode: true,
        }
      };
    }
  }

  async getGoogleMapsApiKey(): Promise<string> {
    const config = await this.getConfig();
    return config.googleMapsApiKey;
  }

  async getMapSettings() {
    const config = await this.getConfig();
    return config.mapSettings;
  }

  async getFeatures() {
    const config = await this.getConfig();
    return config.features;
  }

  // Force refresh config (useful for development)
  async refreshConfig(): Promise<AppConfig> {
    this.config = null;
    this.configPromise = null;
    return this.getConfig();
  }
}

export const configService = new ConfigService();
export default configService;
