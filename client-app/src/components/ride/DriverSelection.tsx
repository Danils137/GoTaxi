import React, { useState, useEffect } from 'react';
import { Star, Clock, Car, MapPin, Euro, Info, Zap, Crown, DollarSign } from 'lucide-react';
import { apiClient } from '../../api/client';

interface DriverOption {
  driverId: string;
  driver: {
    name: string;
    rating: number;
    tripsCount: number;
    carModel: string;
    carColor: string;
    licensePlate: string;
    photo?: string;
  };
  pricing: {
    baseFare: number;
    distanceCost: number;
    timeCost: number;
    surcharges: {
      night: number;
      weekend: number;
      airport: number;
      total: number;
    };
    demandMultiplier: number;
    totalCost: number;
    currency: string;
  };
  logistics: {
    estimatedArrival: number;
    estimatedTripTime: number;
    distance: number;
  };
  score: number;
  category: 'economy' | 'standard' | 'premium';
  label: string;
  description: string;
}

interface PricingInfo {
  finalMultiplier: number;
  level: 'low' | 'normal' | 'moderate' | 'high' | 'very_high';
  explanation: string;
  components: {
    demandSupply: number;
    time: number;
    day: number;
    weather: number;
    event: number;
    seasonal: number;
  };
}

interface DriverSelectionProps {
  pickup: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoff: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onDriverSelect: (driver: DriverOption) => void;
  onBack: () => void;
}

const DriverSelection: React.FC<DriverSelectionProps> = ({
  pickup,
  dropoff,
  onDriverSelect,
  onBack
}) => {
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [pricingInfo, setPricingInfo] = useState<PricingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<string | null>(null);

  useEffect(() => {
    findDrivers();
  }, [pickup, dropoff]);

  const findDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/ride-matching/find-drivers', {
        pickup,
        dropoff,
        requestTime: new Date().toISOString(),
        preferences: {
          maxOptions: 8,
          region: 'Riga'
        }
      });

      if (response.data.success) {
        setDrivers(response.data.data.options);
        setPricingInfo(response.data.data.pricingInfo);
      } else {
        setError('Не удалось найти доступных водителей');
      }
    } catch (err: any) {
      console.error('Ошибка поиска водителей:', err);
      setError(err.response?.data?.message || 'Ошибка при поиске водителей');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'economy': return <DollarSign className="w-4 h-4" />;
      case 'premium': return <Crown className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economy': return 'text-green-600 bg-green-50 border-green-200';
      case 'premium': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getDemandLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'very_high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredDrivers = selectedCategory === 'all' 
    ? drivers 
    : drivers.filter(driver => driver.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Все варианты', count: drivers.length },
    { id: 'economy', name: 'Эконом', count: drivers.filter(d => d.category === 'economy').length },
    { id: 'standard', name: 'Стандарт', count: drivers.filter(d => d.category === 'standard').length },
    { id: 'premium', name: 'Премиум', count: drivers.filter(d => d.category === 'premium').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Поиск доступных водителей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка поиска</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={findDrivers}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Попробовать снова
            </button>
            <button
              onClick={onBack}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Назад
            </button>
            <h1 className="text-lg font-semibold">Выберите водителя</h1>
            <div></div>
          </div>
        </div>
      </div>

      {/* Route Info */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-green-500" />
            <span className="truncate">{pickup.address}</span>
            <span>→</span>
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="truncate">{dropoff.address}</span>
          </div>
        </div>
      </div>

      {/* Pricing Info */}
      {pricingInfo && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getDemandLevelColor(pricingInfo.level)}`}>
              <Info className="w-4 h-4" />
              <span>{pricingInfo.explanation}</span>
              {pricingInfo.finalMultiplier !== 1.0 && (
                <span className="font-semibold">
                  {pricingInfo.finalMultiplier > 1 ? '+' : ''}{Math.round((pricingInfo.finalMultiplier - 1) * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.id !== 'all' && getCategoryIcon(category.id)}
                <span>{category.name}</span>
                {category.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedCategory === category.id ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет доступных водителей</h3>
            <p className="text-gray-600">Попробуйте изменить фильтры или повторить поиск</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.driverId}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  {/* Driver Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {driver.driver.photo ? (
                          <img
                            src={driver.driver.photo}
                            alt={driver.driver.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-600">
                            {driver.driver.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{driver.driver.name}</h3>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getCategoryColor(driver.category)}`}>
                            {getCategoryIcon(driver.category)}
                            <span>{driver.label}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{driver.driver.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{driver.driver.tripsCount} поездок</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        €{driver.pricing.totalCost.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {driver.logistics.estimatedArrival} мин
                      </div>
                    </div>
                  </div>

                  {/* Car Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Car className="w-4 h-4" />
                      <span>{driver.driver.carModel}</span>
                    </div>
                    <span>•</span>
                    <span>{driver.driver.carColor}</span>
                    <span>•</span>
                    <span>{driver.driver.licensePlate}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">{driver.description}</p>

                  {/* Price Breakdown */}
                  {showPriceBreakdown === driver.driverId && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Детализация стоимости:</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Базовый тариф:</span>
                          <span>€{driver.pricing.baseFare.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>За расстояние ({driver.logistics.distance.toFixed(1)} км):</span>
                          <span>€{driver.pricing.distanceCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>За время ({driver.logistics.estimatedTripTime} мин):</span>
                          <span>€{driver.pricing.timeCost.toFixed(2)}</span>
                        </div>
                        {driver.pricing.surcharges.total > 0 && (
                          <div className="flex justify-between">
                            <span>Надбавки:</span>
                            <span>€{driver.pricing.surcharges.total.toFixed(2)}</span>
                          </div>
                        )}
                        {driver.pricing.demandMultiplier !== 1.0 && (
                          <div className="flex justify-between">
                            <span>Множитель спроса (×{driver.pricing.demandMultiplier.toFixed(1)}):</span>
                            <span>€{(driver.pricing.totalCost - (driver.pricing.baseFare + driver.pricing.distanceCost + driver.pricing.timeCost + driver.pricing.surcharges.total)).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t pt-1 flex justify-between font-semibold">
                          <span>Итого:</span>
                          <span>€{driver.pricing.totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowPriceBreakdown(
                        showPriceBreakdown === driver.driverId ? null : driver.driverId
                      )}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showPriceBreakdown === driver.driverId ? 'Скрыть детали' : 'Показать детали'}
                    </button>
                    <button
                      onClick={() => onDriverSelect(driver)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Выбрать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverSelection;

