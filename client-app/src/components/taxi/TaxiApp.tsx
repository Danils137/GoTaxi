import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Clock, Car, Phone, Star, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { User, Ride, RideEstimate, Location } from '../../types';
import { useMaps } from '../../hooks/useMaps';

interface TaxiAppProps {
  user: User;
  rides: Ride[];
  activeRide: Ride | null;
  loading?: boolean;
  error?: string | null;
  onBack: () => void;
  onBookRide: (rideData: any) => void;
  onCancelRide: (rideId: string, reason?: string) => void;
  onEstimateRide: (origin: Location, destination: Location) => Promise<RideEstimate>;
}

export const TaxiApp: React.FC<TaxiAppProps> = ({
  user,
  rides,
  activeRide,
  loading = false,
  error,
  onBack,
  onBookRide,
  onCancelRide,
  onEstimateRide,
}) => {
  const [currentView, setCurrentView] = useState<'book' | 'active' | 'history'>('book');
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [estimate, setEstimate] = useState<RideEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [notes, setNotes] = useState('');

  const { getCurrentLocation, formatDistance, formatDuration } = useMaps();

  useEffect(() => {
    if (activeRide) {
      setCurrentView('active');
    }
  }, [activeRide]);

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setOrigin(location);
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  };

  const handleEstimateRide = async () => {
    if (!origin || !destination) return;

    try {
      setEstimating(true);
      const rideEstimate = await onEstimateRide(origin, destination);
      setEstimate(rideEstimate);
    } catch (error) {
      console.error('Failed to estimate ride:', error);
    } finally {
      setEstimating(false);
    }
  };

  const handleBookRide = async () => {
    if (!origin || !destination) return;

    try {
      setBooking(true);
      await onBookRide({
        origin,
        destination,
        notes: notes.trim() || undefined,
      });
      
      // Reset form
      setOrigin(null);
      setDestination(null);
      setEstimate(null);
      setNotes('');
      setCurrentView('active');
    } catch (error) {
      console.error('Failed to book ride:', error);
    } finally {
      setBooking(false);
    }
  };

  const handleCancelRide = async (rideId: string) => {
    try {
      await onCancelRide(rideId, 'Отменено пользователем');
      setCurrentView('book');
    } catch (error) {
      console.error('Failed to cancel ride:', error);
    }
  };

  const renderBookingForm = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Заказать поездку
        </h3>

        <div className="space-y-4">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Откуда
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Введите адрес отправления"
                  value={origin?.address || ''}
                  onChange={(e) => {
                    // Здесь будет автокомплит адресов
                    console.log('Origin input:', e.target.value);
                  }}
                  icon={<MapPin className="w-4 h-4 text-gray-400" />}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleGetCurrentLocation}
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Куда
            </label>
            <Input
              placeholder="Введите адрес назначения"
              value={destination?.address || ''}
              onChange={(e) => {
                // Здесь будет автокомплит адресов
                console.log('Destination input:', e.target.value);
              }}
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Комментарий (необязательно)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация для водителя..."
              className="
                w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                resize-none
              "
              rows={3}
            />
          </div>

          {/* Estimate Button */}
          <Button
            onClick={handleEstimateRide}
            disabled={!origin || !destination || estimating}
            loading={estimating}
            className="w-full"
          >
            Рассчитать стоимость
          </Button>
        </div>
      </div>

      {/* Estimate Results */}
      {estimate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Расчет поездки
          </h4>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatDistance(estimate.distance)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Расстояние
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatDuration(estimate.duration)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Время в пути
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estimate.price} ₽
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Стоимость
              </div>
            </div>
          </div>

          <Button
            onClick={handleBookRide}
            loading={booking}
            className="w-full"
            size="lg"
          >
            Заказать поездку
          </Button>
        </div>
      )}
    </div>
  );

  const renderActiveRide = () => {
    if (!activeRide) {
      return (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            У вас нет активных поездок
          </p>
          <Button
            onClick={() => setCurrentView('book')}
            className="mt-4"
          >
            Заказать поездку
          </Button>
        </div>
      );
    }

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending': return 'Поиск водителя...';
        case 'accepted': return 'Водитель найден';
        case 'driver_assigned': return 'Водитель назначен';
        case 'in_progress': return 'В пути';
        default: return status;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'text-yellow-600 dark:text-yellow-400';
        case 'accepted': return 'text-green-600 dark:text-green-400';
        case 'driver_assigned': return 'text-blue-600 dark:text-blue-400';
        case 'in_progress': return 'text-primary-600 dark:text-primary-400';
        default: return 'text-gray-600 dark:text-gray-400';
      }
    };

    return (
      <div className="space-y-6">
        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Активная поездка
            </h3>
            <span className={`text-sm font-medium ${getStatusColor(activeRide.status)}`}>
              {getStatusText(activeRide.status)}
            </span>
          </div>

          {activeRide.status === 'pending' && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Ищем водителя...
              </span>
            </div>
          )}
        </div>

        {/* Route */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Маршрут
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Откуда
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeRide.origin.address}
                </p>
              </div>
            </div>
            
            <div className="ml-1.5 border-l-2 border-gray-200 dark:border-gray-600 h-4" />
            
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Куда
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeRide.destination.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        {activeRide.driver && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Водитель
            </h4>
            
            <div className="flex items-center space-x-4">
              <Avatar
                src={activeRide.driver.avatar}
                name={activeRide.driver.name}
                size="lg"
              />
              
              <div className="flex-1">
                <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                  {activeRide.driver.name}
                </h5>
                <div className="flex items-center space-x-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {activeRide.driver.rating}
                  </span>
                </div>
                {activeRide.driver.vehicle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activeRide.driver.vehicle.make} {activeRide.driver.vehicle.model} • {activeRide.driver.vehicle.number}
                  </p>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
              >
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          {['pending', 'accepted', 'driver_assigned'].includes(activeRide.status) && (
            <Button
              variant="danger"
              onClick={() => handleCancelRide(activeRide.id)}
              className="flex-1"
            >
              Отменить поездку
            </Button>
          )}
          
          {activeRide.status === 'completed' && (
            <Button
              onClick={() => setCurrentView('book')}
              className="flex-1"
            >
              Новая поездка
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const completedRides = rides.filter(ride => 
      ['completed', 'cancelled'].includes(ride.status)
    );

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          История поездок
        </h3>
        
        {completedRides.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              У вас пока нет завершенных поездок
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    ride.status === 'completed' 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {ride.status === 'completed' ? 'Завершена' : 'Отменена'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(ride.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <p>{ride.origin.address}</p>
                  <p>→ {ride.destination.address}</p>
                </div>
                
                {ride.finalPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {ride.finalPrice} ₽
                    </span>
                    <Button variant="outline" size="sm">
                      Повторить
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              GoTaxi
            </h1>
          </div>
          
          <Avatar
            src={user.avatar}
            name={user.name}
            size="sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex space-x-1">
          {[
            { key: 'book', label: 'Заказать', icon: Car },
            { key: 'active', label: 'Активные', icon: Navigation },
            { key: 'history', label: 'История', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key as any)}
              className={`
                flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${currentView === key
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {currentView === 'book' && renderBookingForm()}
        {currentView === 'active' && renderActiveRide()}
        {currentView === 'history' && renderHistory()}
      </div>
    </div>
  );
};

