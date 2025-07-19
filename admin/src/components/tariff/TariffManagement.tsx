import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  EuroIcon,
  UserIcon,
  MapPinIcon,
  FilterIcon,
  SearchIcon,
  BarChart3Icon
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface TariffData {
  _id: string;
  driverId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
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
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  byRegion: Array<{
    _id: string;
    totalTariffs: number;
    activeTariffs: number;
    pendingTariffs: number;
    avgBaseFare: number;
    avgPricePerKm: number;
    avgMinimumFare: number;
  }>;
  total: {
    totalTariffs: number;
    activeTariffs: number;
    pendingTariffs: number;
  };
}

const TariffManagement: React.FC = () => {
  const [pendingTariffs, setPendingTariffs] = useState<TariffData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'statistics'>('pending');

  const regions = ['all', 'Riga', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils', 'Other'];

  useEffect(() => {
    fetchPendingTariffs();
    fetchStatistics();
  }, []);

  const fetchPendingTariffs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/tariff/admin/pending');
      setPendingTariffs(response.data.tariffs);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки тарифов');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/tariff/admin/statistics');
      setStatistics(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки статистики:', err);
    }
  };

  const approveTariff = async (tariffId: string) => {
    setActionLoading(tariffId);
    setError(null);
    setSuccess(null);
    
    try {
      await apiClient.post(`/tariff/admin/${tariffId}/approve`);
      setSuccess('Тариф успешно одобрен');
      fetchPendingTariffs();
      fetchStatistics();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка одобрения тарифа');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectTariff = async (tariffId: string, reason: string) => {
    setActionLoading(tariffId);
    setError(null);
    setSuccess(null);
    
    try {
      await apiClient.post(`/tariff/admin/${tariffId}/reject`, { reason });
      setSuccess('Тариф отклонен');
      fetchPendingTariffs();
      fetchStatistics();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка отклонения тарифа');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (tariffId: string) => {
    const reason = prompt('Укажите причину отклонения тарифа:');
    if (reason && reason.trim()) {
      rejectTariff(tariffId, reason.trim());
    }
  };

  const filteredTariffs = pendingTariffs.filter(tariff => {
    const matchesRegion = selectedRegion === 'all' || tariff.region === selectedRegion;
    const matchesSearch = searchTerm === '' || 
      tariff.driverId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.driverId.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRegion && matchesSearch;
  });

  const formatCurrency = (amount: number) => `${amount.toFixed(2)}€`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('lv-LV');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Управление тарифами</h1>
        <p className="text-gray-600">Модерация и статистика тарифов водителей</p>
      </div>

      {/* Сообщения */}
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

      {/* Табы */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>На модерации ({pendingTariffs.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3Icon className="w-4 h-4" />
                <span>Статистика</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'pending' && (
        <>
          {/* Фильтры */}
          <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="w-4 h-4 text-gray-500" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все регионы</option>
                {regions.slice(1).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 flex-1">
              <SearchIcon className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Поиск по имени или email водителя..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Список тарифов на модерации */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTariffs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Нет тарифов на модерации</h3>
              <p className="text-gray-600">Все тарифы обработаны или отсутствуют новые заявки</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTariffs.map(tariff => (
                <div key={tariff._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{tariff.driverId.name}</h3>
                        <p className="text-sm text-gray-600">{tariff.driverId.email}</p>
                        <p className="text-sm text-gray-600">{tariff.driverId.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{tariff.region}</span>
                    </div>
                  </div>

                  {/* Тарифы */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-800">
                        {formatCurrency(tariff.baseFare)}
                      </div>
                      <div className="text-xs text-blue-600">Посадка</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-800">
                        {formatCurrency(tariff.pricePerKm)}
                      </div>
                      <div className="text-xs text-green-600">За км</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-semibold text-orange-800">
                        {formatCurrency(tariff.pricePerMinute)}
                      </div>
                      <div className="text-xs text-orange-600">За мин</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-semibold text-purple-800">
                        {formatCurrency(tariff.minimumFare)}
                      </div>
                      <div className="text-xs text-purple-600">Минимум</div>
                    </div>
                  </div>

                  {/* Надбавки */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Надбавки</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Ночная:</span>
                        <span className="font-medium">+{formatCurrency(tariff.nightSurcharge)}/км</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Выходные:</span>
                        <span className="font-medium">+{formatCurrency(tariff.weekendSurcharge)}/км</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Аэропорт:</span>
                        <span className="font-medium">+{formatCurrency(tariff.airportSurcharge)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Описание */}
                  {tariff.description && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{tariff.description}</p>
                    </div>
                  )}

                  {/* Даты */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>Создан: {formatDate(tariff.createdAt)}</span>
                    <span>Обновлен: {formatDate(tariff.updatedAt)}</span>
                  </div>

                  {/* Действия */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => approveTariff(tariff._id)}
                      disabled={actionLoading === tariff._id}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{actionLoading === tariff._id ? 'Одобрение...' : 'Одобрить'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleReject(tariff._id)}
                      disabled={actionLoading === tariff._id}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>Отклонить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'statistics' && statistics && (
        <div className="space-y-6">
          {/* Общая статистика */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Общая статистика</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">
                  {statistics.total.totalTariffs}
                </div>
                <div className="text-sm text-blue-600">Всего тарифов</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-800">
                  {statistics.total.activeTariffs}
                </div>
                <div className="text-sm text-green-600">Активных</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-800">
                  {statistics.total.pendingTariffs}
                </div>
                <div className="text-sm text-orange-600">На модерации</div>
              </div>
            </div>
          </div>

          {/* Статистика по регионам */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Статистика по регионам</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Регион
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Всего
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Активных
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      На модерации
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Средний тариф
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.byRegion.map(region => (
                    <tr key={region._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {region._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {region.totalTariffs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {region.activeTariffs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                        {region.pendingTariffs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>Посадка: {formatCurrency(region.avgBaseFare)}</div>
                          <div>За км: {formatCurrency(region.avgPricePerKm)}</div>
                          <div>Минимум: {formatCurrency(region.avgMinimumFare)}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TariffManagement;

