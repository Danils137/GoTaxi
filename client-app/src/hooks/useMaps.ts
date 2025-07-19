import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { MapsConfig, GeocodeResult, DirectionsResult, Location } from '../types';

export const useMaps = () => {
  const [mapsConfig, setMapsConfig] = useState<MapsConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка конфигурации карт при инициализации
  useEffect(() => {
    loadMapsConfig();
  }, []);

  const loadMapsConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = await apiClient.getMapsConfig();
      setMapsConfig(config);
    } catch (error: any) {
      console.error('Failed to load maps config:', error);
      setError('Не удалось загрузить конфигурацию карт');
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
    try {
      setError(null);
      const results = await apiClient.geocodeAddress(address);
      return results;
    } catch (error: any) {
      console.error('Failed to geocode address:', error);
      setError('Не удалось найти адрес');
      throw error;
    }
  };

  const getDirections = async (origin: string, destination: string): Promise<DirectionsResult> => {
    try {
      setError(null);
      const directions = await apiClient.getDirections(origin, destination);
      return directions;
    } catch (error: any) {
      console.error('Failed to get directions:', error);
      setError('Не удалось построить маршрут');
      throw error;
    }
  };

  const searchPlaces = async (query: string) => {
    try {
      setError(null);
      const places = await apiClient.searchPlaces(query);
      return places;
    } catch (error: any) {
      console.error('Failed to search places:', error);
      setError('Не удалось найти места');
      throw error;
    }
  };

  const autocompleteAddress = async (input: string) => {
    try {
      setError(null);
      const suggestions = await apiClient.autocompleteAddress(input);
      return suggestions;
    } catch (error: any) {
      console.error('Failed to autocomplete address:', error);
      setError('Не удалось получить подсказки адресов');
      throw error;
    }
  };

  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Получаем адрес по координатам
            const geocodeResults = await geocodeAddress(`${latitude},${longitude}`);
            const address = geocodeResults[0]?.address || 'Неизвестное местоположение';
            
            resolve({
              lat: latitude,
              lng: longitude,
              address,
            });
          } catch (error) {
            // Если не удалось получить адрес, возвращаем только координаты
            resolve({
              lat: latitude,
              lng: longitude,
              address: 'Текущее местоположение',
            });
          }
        },
        (error) => {
          let errorMessage = 'Не удалось получить местоположение';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Доступ к геолокации запрещен';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Местоположение недоступно';
              break;
            case error.TIMEOUT:
              errorMessage = 'Время ожидания геолокации истекло';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 минут
        }
      );
    });
  }, []);

  const calculateDistance = useCallback((
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number => {
    const R = 6371; // Радиус Земли в километрах
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Округляем до 2 знаков после запятой
  }, []);

  const formatDistance = useCallback((distanceInKm: number): string => {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)} м`;
    }
    return `${distanceInKm.toFixed(1)} км`;
  }, []);

  const formatDuration = useCallback((durationInMinutes: number): string => {
    if (durationInMinutes < 60) {
      return `${Math.round(durationInMinutes)} мин`;
    }
    
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.round(durationInMinutes % 60);
    
    if (minutes === 0) {
      return `${hours} ч`;
    }
    
    return `${hours} ч ${minutes} мин`;
  }, []);

  const isLocationValid = useCallback((location: Location): boolean => {
    return !!(
      location &&
      typeof location.lat === 'number' &&
      typeof location.lng === 'number' &&
      location.lat >= -90 &&
      location.lat <= 90 &&
      location.lng >= -180 &&
      location.lng <= 180 &&
      location.address &&
      location.address.trim().length > 0
    );
  }, []);

  return {
    mapsConfig,
    loading,
    error,
    geocodeAddress,
    getDirections,
    searchPlaces,
    autocompleteAddress,
    getCurrentLocation,
    calculateDistance,
    formatDistance,
    formatDuration,
    isLocationValid,
  };
};

