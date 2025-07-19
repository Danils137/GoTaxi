import React, { useState, useEffect } from 'react';
import { 
  EuroIcon, 
  SaveIcon, 
  EditIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertCircleIcon,
  InfoIcon,
  ClockIcon,
  MapPinIcon
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface TariffData {
  _id?: string;
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  minimumFare: number;
  nightSurcharge: number;
  weekendSurcharge: number;
  airportSurcharge: number;
  region: string;
  description: string;
  isActive: boolean;
  isApproved: boolean;
}

const TariffManager: React.FC = () => {
  const [tariff, setTariff] = useState<TariffData>({
    baseFare: 2.50,
    pricePerKm: 1.20,
    pricePerMinute: 0.30,
    minimumFare: 5.00,
    nightSurcharge: 0.50,
    weekendSurcharge: 0.20,
    airportSurcharge: 2.00,
    region: 'Riga',
    description: '',
    isActive: false,
    isApproved: false
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const regions = [
    'Riga', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils', 'Other'
  ];

  useEffect(() => {
    fetchCurrentTariff();
  }, []);

  const fetchCurrentTariff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/tariff/my');
      setTariff(response.data.tariff);
      setIsEditing(false);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Тариф не найден - это нормально для новых водителей
        setIsEditing(true);
      } else {
        setError(err.response?.data?.error || 'Ошибка загрузки тарифа');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TariffData, value: string | number) => {
    setTariff(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateTariff = (): string | null => {
    if (tariff.baseFare < 0 || tariff.baseFare > 50) {
      return 'Базовый тариф должен быть от 0 до 50€';
    }
    if (tariff.pricePerKm < 0 || tariff.pricePerKm > 10) {
      return 'Цена за км должна быть от 0 до 10€';
    }
    if (tariff.pricePerMinute < 0 || tariff.pricePerMinute > 2) {
      return 'Цена за минуту должна быть от 0 до 2€';
    }
    if (tariff.minimumFare < 0 || tariff.minimumFare > 100) {
      return 'Минимальная стоимость должна быть от 0 до 100€';
    }
    return null;
  };

  const saveTariff = async () => {
    const validationError = validateTariff();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (tariff._id) {
        // Обновление существующего тарифа
        await apiClient.put(`/tariff/${tariff._id}`, tariff);
        setSuccess('Тариф обновлен и отправлен на модерацию');
      } else {
        // Создание нового тарифа
        const response = await apiClient.post('/tariff', tariff);
        setTariff(response.data.tariff);
        setSuccess('Тариф создан и отправлен на модерацию');
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка сохранения тарифа');
    } finally {
      setSaving(false);
    }
  };

  const calculateEstimate = (distance: number, duration: number) => {
    const baseCost = tariff.baseFare;
    const distanceCost = distance * tariff.pricePerKm;
    const timeCost = duration * tariff.pricePerMinute;
    const total = Math.max(baseCost + distanceCost + timeCost, tariff.minimumFare);
    return total.toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Управление тарифами</h2>
        {!isEditing && tariff._id && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <EditIcon className="w-4 h-4" />
            <span>Редактировать</span>
          </button>
        )}
      </div>

      {/* Статус тарифа */}
      {tariff._id && (
        <div className="mb-6 p-4 rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            {tariff.isApproved ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ClockIcon className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-medium">
              Статус: {tariff.isApproved ? 'Одобрен' : 'На модерации'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {tariff.isApproved 
              ? 'Ваш тариф одобрен и активен для заказов'
              : 'Тариф ожидает одобрения администратором'
            }
          </p>
        </div>
      )}

      {/* Сообщения об ошибках и успехе */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        </div>
      )}

      {/* Форма тарифа */}
      <div className="space-y-6">
        {/* Регион */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Регион работы
          </label>
          <select
            value={tariff.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* Основные тарифы */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Базовый тариф (посадка), €
            </label>
            <div className="relative">
              <EuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="50"
                value={tariff.baseFare}
                onChange={(e) => handleInputChange('baseFare', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена за километр, €
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={tariff.pricePerKm}
                onChange={(e) => handleInputChange('pricePerKm', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена за минуту, €
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="2"
                value={tariff.pricePerMinute}
                onChange={(e) => handleInputChange('pricePerMinute', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Минимальная стоимость, €
            </label>
            <div className="relative">
              <EuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={tariff.minimumFare}
                onChange={(e) => handleInputChange('minimumFare', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Надбавки */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Надбавки</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ночная надбавка (22:00-06:00), €/км
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tariff.nightSurcharge}
                onChange={(e) => handleInputChange('nightSurcharge', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Надбавка за выходные, €/км
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tariff.weekendSurcharge}
                onChange={(e) => handleInputChange('weekendSurcharge', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Надбавка за аэропорт, €
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tariff.airportSurcharge}
                onChange={(e) => handleInputChange('airportSurcharge', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание тарифа (необязательно)
          </label>
          <textarea
            value={tariff.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={!isEditing}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="Краткое описание особенностей вашего тарифа..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {tariff.description.length}/500 символов
          </p>
        </div>

        {/* Примеры расчета */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Примеры стоимости поездок</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-800">5 км, 15 мин</div>
              <div className="text-lg font-bold text-green-600">
                {calculateEstimate(5, 15)}€
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-800">10 км, 25 мин</div>
              <div className="text-lg font-bold text-green-600">
                {calculateEstimate(10, 25)}€
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-800">20 км, 40 мин</div>
              <div className="text-lg font-bold text-green-600">
                {calculateEstimate(20, 40)}€
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        {isEditing && (
          <div className="flex space-x-4">
            <button
              onClick={saveTariff}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <SaveIcon className="w-4 h-4" />
              <span>{saving ? 'Сохранение...' : 'Сохранить тариф'}</span>
            </button>
            
            {tariff._id && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchCurrentTariff();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отменить
              </button>
            )}
          </div>
        )}

        {/* Информация о модерации */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Важная информация о тарифах:</p>
              <ul className="space-y-1 text-xs">
                <li>• Все тарифы проходят модерацию администратором</li>
                <li>• Тарифы должны соответствовать законодательству Латвии</li>
                <li>• Изменения тарифа требуют повторного одобрения</li>
                <li>• Все цены указываются в евро (EUR)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffManager;

