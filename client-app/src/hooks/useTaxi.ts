import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { Ride, RideEstimate, Location, Driver } from '../types';

export const useTaxi = (currentUserId?: string) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Загрузка поездок при инициализации
  useEffect(() => {
    if (currentUserId) {
      loadRides();
      setupSocketListeners();
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [currentUserId]);

  const loadRides = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const ridesData = await apiClient.getRides(status);
      setRides(ridesData);

      // Найти активную поездку
      const activeRideData = ridesData.find((ride: Ride) => 
        ['pending', 'accepted', 'driver_assigned', 'in_progress'].includes(ride.status)
      );
      
      if (activeRideData) {
        setActiveRide(activeRideData);
        // Подключиться к отслеживанию поездки
        apiClient.joinRide(activeRideData.id);
      }
    } catch (error: any) {
      console.error('Failed to load rides:', error);
      setError('Не удалось загрузить поездки');
    } finally {
      setLoading(false);
    }
  };

  const estimateRide = async (origin: Location, destination: Location): Promise<RideEstimate> => {
    try {
      setError(null);
      const estimate = await apiClient.estimateRide(origin, destination);
      return estimate;
    } catch (error: any) {
      console.error('Failed to estimate ride:', error);
      setError('Не удалось рассчитать стоимость поездки');
      throw error;
    }
  };

  const bookRide = async (rideData: {
    origin: Location;
    destination: Location;
    scheduledFor?: Date;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const newRide = await apiClient.bookRide({
        ...rideData,
        customerId: currentUserId,
      });

      setRides(prev => [newRide, ...prev]);
      setActiveRide(newRide);
      
      // Подключиться к отслеживанию поездки
      apiClient.joinRide(newRide.id);

      return newRide;
    } catch (error: any) {
      console.error('Failed to book ride:', error);
      setError('Не удалось заказать поездку');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async (rideId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.cancelRide(rideId, reason);

      // Обновить статус поездки локально
      setRides(prev => prev.map(ride => 
        ride.id === rideId 
          ? { ...ride, status: 'cancelled' as const }
          : ride
      ));

      if (activeRide?.id === rideId) {
        setActiveRide(null);
        setDriverLocation(null);
        apiClient.leaveRide(rideId);
      }
    } catch (error: any) {
      console.error('Failed to cancel ride:', error);
      setError('Не удалось отменить поездку');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRideById = async (rideId: string) => {
    try {
      const ride = await apiClient.getRide(rideId);
      return ride;
    } catch (error: any) {
      console.error('Failed to get ride:', error);
      setError('Не удалось получить информацию о поездке');
      throw error;
    }
  };

  const setupSocketListeners = () => {
    const socket = apiClient.getSocket();
    if (!socket) return;

    // Слушаем обновления поездки
    socket.on('ride_update', (updatedRide: Ride) => {
      setRides(prev => prev.map(ride => 
        ride.id === updatedRide.id ? updatedRide : ride
      ));

      if (activeRide?.id === updatedRide.id) {
        setActiveRide(updatedRide);
      }
    });

    // Слушаем принятие поездки водителем
    socket.on('ride_accepted', (data: { rideId: string; driver: Driver }) => {
      setRides(prev => prev.map(ride => 
        ride.id === data.rideId 
          ? { ...ride, status: 'accepted' as const, driver: data.driver, driverId: data.driver.id }
          : ride
      ));

      if (activeRide?.id === data.rideId) {
        setActiveRide(prev => prev ? { 
          ...prev, 
          status: 'accepted', 
          driver: data.driver, 
          driverId: data.driver.id 
        } : null);
      }
    });

    // Слушаем начало поездки
    socket.on('ride_started', (data: { rideId: string }) => {
      setRides(prev => prev.map(ride => 
        ride.id === data.rideId 
          ? { ...ride, status: 'in_progress' as const }
          : ride
      ));

      if (activeRide?.id === data.rideId) {
        setActiveRide(prev => prev ? { ...prev, status: 'in_progress' } : null);
      }
    });

    // Слушаем завершение поездки
    socket.on('ride_completed', (data: { rideId: string; finalPrice: number }) => {
      setRides(prev => prev.map(ride => 
        ride.id === data.rideId 
          ? { ...ride, status: 'completed' as const, finalPrice: data.finalPrice }
          : ride
      ));

      if (activeRide?.id === data.rideId) {
        setActiveRide(null);
        setDriverLocation(null);
        apiClient.leaveRide(data.rideId);
      }
    });

    // Слушаем отмену поездки
    socket.on('ride_cancelled', (data: { rideId: string; reason: string }) => {
      setRides(prev => prev.map(ride => 
        ride.id === data.rideId 
          ? { ...ride, status: 'cancelled' as const }
          : ride
      ));

      if (activeRide?.id === data.rideId) {
        setActiveRide(null);
        setDriverLocation(null);
        apiClient.leaveRide(data.rideId);
      }
    });

    // Слушаем местоположение водителя
    socket.on('driver_location', (data: { rideId: string; location: { lat: number; lng: number } }) => {
      if (activeRide?.id === data.rideId) {
        setDriverLocation(data.location);
      }
    });
  };

  const cleanupSocketListeners = () => {
    const socket = apiClient.getSocket();
    if (!socket) return;

    socket.off('ride_update');
    socket.off('ride_accepted');
    socket.off('ride_started');
    socket.off('ride_completed');
    socket.off('ride_cancelled');
    socket.off('driver_location');
  };

  const getActiveRide = useCallback(() => {
    return rides.find(ride => 
      ['pending', 'accepted', 'driver_assigned', 'in_progress'].includes(ride.status)
    ) || null;
  }, [rides]);

  const getRideHistory = useCallback(() => {
    return rides.filter(ride => 
      ['completed', 'cancelled'].includes(ride.status)
    );
  }, [rides]);

  const getPendingRides = useCallback(() => {
    return rides.filter(ride => ride.status === 'pending');
  }, [rides]);

  return {
    rides,
    activeRide,
    loading,
    error,
    driverLocation,
    loadRides,
    estimateRide,
    bookRide,
    cancelRide,
    getRideById,
    getActiveRide,
    getRideHistory,
    getPendingRides,
  };
};

