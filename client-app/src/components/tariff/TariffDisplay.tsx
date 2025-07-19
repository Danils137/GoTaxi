import React, { useState, useEffect } from 'react';
import { EuroIcon, ClockIcon, MapPinIcon, InfoIcon, CalendarIcon } from 'lucide-react';
import { apiClient } from '../../api/client';

interface TariffCalculation {
  baseFare: number;
  distanceCost: number;
  timeCost: number;
  surcharges: {
    night: number;
    weekend: number;
    airport: number;
  };
  subtotal: number;
  total: number;
  currency: string;
  minimumApplied: boolean;
}

interface TariffData {
  _id: string;
  driverId: string;
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  minimumFare: number;
  nightSurcharge: number;
  weekendSurcharge: number;
  airportSurcharge: number;
  region: string;
  currency: string;
  description?: string;
}

interface TariffDisplayProps {
  driverId?: string;
  distance?: number;
  duration?: number;
  isNight?: boolean;
  isWeekend?: boolean;
  isAirport?: boolean;
  showCalculation?: boolean;
}

const TariffDisplay: React.FC<TariffDisplayProps> = ({
  driverId,
  distance = 0,
  duration = 0,
  isNight = false,
  isWeekend = false,
  isAirport = false,
  showCalculation = false
}) => {
  const [tariff, setTariff] = useState<TariffData | null>(null);
  const [calculation, setCalculation] = useState<TariffCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (driverId) {
      fetchTariff();
    }
  }, [driverId]);

  useEffect(() => {
    if (tariff && showCalculation && distance > 0) {
      calculateFare();
    }
  }, [tariff, distance, duration, isNight, isWeekend, isAirport, showCalculation]);

  const fetchTariff = async () => {
    if (!driverId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/tariff/driver/${driverId}`);
      setTariff(response.data.tariff);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки тарифа');
    } finally {
      setLoading(false);
    }
  };

  const calculateFare = async () => {
    if (!driverId || !distance) return;
    
    try {
      const response = await apiClient.post('/tariff/calculate', {
        driverId,
        distance,
        duration,
        isNight,
        isWeekend,
        isAirport
      });
      setCalculation(response.data.calculation);
    } catch (err: any) {
      console.error('Ошибка расчета стоимости:', err);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 22 || hour < 6;
  };

  const isCurrentWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Воскресенье или суббота
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <InfoIcon className="w-5 h-5 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!tariff) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <InfoIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600 text-sm">Тариф не найден</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Тариф водителя</h3>
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <MapPinIcon className="w-4 h-4" />
          <span>{tariff.region}</span>
        </div>
      </div>

      {/* Базовые тарифы */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <EuroIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-blue-800">
            {tariff.baseFare.toFixed(2)}€
          </div>
          <div className="text-xs text-blue-600">Посадка</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <MapPinIcon className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-lg font-semibold text-green-800">
            {tariff.pricePerKm.toFixed(2)}€
          </div>
          <div className="text-xs text-green-600">За км</div>
        </div>

        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <ClockIcon className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-lg font-semibold text-orange-800">
            {tariff.pricePerMinute.toFixed(2)}€
          </div>
          <div className="text-xs text-orange-600">За мин</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <EuroIcon className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-semibold text-purple-800">
            {tariff.minimumFare.toFixed(2)}€
          </div>
          <div className="text-xs text-purple-600">Минимум</div>
        </div>
      </div>

      {/* Надбавки */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Надбавки</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Ночная (22:00-06:00)</span>
            <span className="text-sm font-medium">+{tariff.nightSurcharge.toFixed(2)}€/км</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Выходные</span>
            <span className="text-sm font-medium">+{tariff.weekendSurcharge.toFixed(2)}€/км</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Аэропорт</span>
            <span className="text-sm font-medium">+{tariff.airportSurcharge.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* Текущие условия */}
      <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <CalendarIcon className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Текущие условия</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`flex items-center space-x-1 ${getCurrentTime() ? 'text-orange-600' : 'text-gray-600'}`}>
            <span>Ночное время:</span>
            <span className="font-medium">{getCurrentTime() ? 'Да' : 'Нет'}</span>
          </div>
          <div className={`flex items-center space-x-1 ${isCurrentWeekend() ? 'text-orange-600' : 'text-gray-600'}`}>
            <span>Выходной:</span>
            <span className="font-medium">{isCurrentWeekend() ? 'Да' : 'Нет'}</span>
          </div>
        </div>
      </div>

      {/* Расчет стоимости */}
      {showCalculation && calculation && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Расчет стоимости поездки</h4>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Базовый тариф:</span>
              <span>{calculation.baseFare.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">За расстояние ({distance.toFixed(1)} км):</span>
              <span>{calculation.distanceCost.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">За время ({Math.round(duration)} мин):</span>
              <span>{calculation.timeCost.toFixed(2)}€</span>
            </div>
            
            {/* Надбавки */}
            {(calculation.surcharges.night > 0 || calculation.surcharges.weekend > 0 || calculation.surcharges.airport > 0) && (
              <div className="border-t pt-2">
                {calculation.surcharges.night > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Ночная надбавка:</span>
                    <span>+{calculation.surcharges.night.toFixed(2)}€</span>
                  </div>
                )}
                {calculation.surcharges.weekend > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Надбавка за выходные:</span>
                    <span>+{calculation.surcharges.weekend.toFixed(2)}€</span>
                  </div>
                )}
                {calculation.surcharges.airport > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Надбавка за аэропорт:</span>
                    <span>+{calculation.surcharges.airport.toFixed(2)}€</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Итого к оплате:</span>
              <span className="text-green-600">{calculation.total.toFixed(2)}€</span>
            </div>
            {calculation.minimumApplied && (
              <p className="text-xs text-gray-500 mt-1">
                * Применена минимальная стоимость поездки
              </p>
            )}
          </div>
        </div>
      )}

      {/* Описание тарифа */}
      {tariff.description && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{tariff.description}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Все цены указаны в евро (EUR) • Тарифы регулируются законодательством Латвии
      </div>
    </div>
  );
};

export default TariffDisplay;

