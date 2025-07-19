import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Edit, 
  Eye, 
  Users, 
  Car, 
  Building, 
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Download,
  Settings
} from 'lucide-react';

interface Country {
  _id: string;
  code: string;
  name: string;
  nameLocal: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  languages: Array<{
    code: string;
    name: string;
    isDefault: boolean;
  }>;
  timezone: string;
  isActive: boolean;
  isLaunched: boolean;
  launchDate?: string;
  launchPriority: number;
  statistics: {
    totalDrivers: number;
    totalCompanies: number;
    totalUsers: number;
    totalRides: number;
    monthlyRevenue: number;
  };
  subscriptionPricing: {
    driver: { monthly: number; yearly: number; };
    company: { monthly: number; yearly: number; };
    enterprise: { monthly: number; yearly: number; };
  };
}

interface CountryFilters {
  status: 'all' | 'active' | 'launched' | 'pending';
  region: string;
  currency: string;
  search: string;
}

const CountryManagement: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [filters, setFilters] = useState<CountryFilters>({
    status: 'all',
    region: '',
    currency: '',
    search: ''
  });
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCountries: 0,
    launchedCountries: 0,
    totalDrivers: 0,
    totalRevenue: 0
  });

  // Загрузка данных
  useEffect(() => {
    fetchCountries();
    fetchStats();
  }, []);

  // Фильтрация стран
  useEffect(() => {
    let filtered = countries;

    // Фильтр по статусу
    if (filters.status !== 'all') {
      filtered = filtered.filter(country => {
        switch (filters.status) {
          case 'active':
            return country.isActive;
          case 'launched':
            return country.isLaunched;
          case 'pending':
            return country.isActive && !country.isLaunched;
          default:
            return true;
        }
      });
    }

    // Фильтр по валюте
    if (filters.currency) {
      filtered = filtered.filter(country => 
        country.currency.code === filters.currency
      );
    }

    // Поиск
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(search) ||
        country.nameLocal.toLowerCase().includes(search) ||
        country.code.toLowerCase().includes(search)
      );
    }

    setFilteredCountries(filtered);
  }, [countries, filters]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/countries/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateCountry = () => {
    setSelectedCountry(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditCountry = (country: Country) => {
    setSelectedCountry(country);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewCountry = (country: Country) => {
    setSelectedCountry(country);
    setModalType('view');
    setShowModal(true);
  };

  const handleLaunchCountry = async (countryId: string) => {
    try {
      await fetch(`/api/admin/countries/${countryId}/launch`, {
        method: 'POST'
      });
      fetchCountries();
      fetchStats();
    } catch (error) {
      console.error('Error launching country:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (country: Country) => {
    if (!country.isActive) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Неактивна</span>;
    }
    if (country.isLaunched) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">Запущена</span>;
    }
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full">Подготовка</span>;
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      1: 'bg-red-100 text-red-600',
      2: 'bg-orange-100 text-orange-600',
      3: 'bg-yellow-100 text-yellow-600',
      4: 'bg-blue-100 text-blue-600',
      5: 'bg-gray-100 text-gray-600'
    };
    
    const color = colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${color}`}>
        Приоритет {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Управление Странами
          </h1>
          <p className="text-gray-600 mt-1">
            Управление географическим покрытием TeleType + GoTaxi
          </p>
        </div>
        
        <button
          onClick={handleCreateCountry}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Добавить Страну
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего Стран</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCountries}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Запущено</p>
              <p className="text-2xl font-bold text-green-600">{stats.launchedCountries}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего Водителей</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDrivers.toLocaleString()}</p>
            </div>
            <Car className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Месячный Доход</p>
              <p className="text-2xl font-bold text-orange-600">€{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">Все страны</option>
              <option value="launched">Запущенные</option>
              <option value="pending">В подготовке</option>
              <option value="active">Активные</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Валюта
            </label>
            <select
              value={filters.currency}
              onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Все валюты</option>
              <option value="EUR">EUR - Евро</option>
              <option value="PLN">PLN - Злотый</option>
              <option value="USD">USD - Доллар</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Название или код страны..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: 'all', region: '', currency: '', search: '' })}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {/* Таблица стран */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Страна
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Приоритет
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статистика
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Подписки
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCountries.map((country) => (
                <tr key={country._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {country.code}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {country.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {country.nameLocal} • {country.currency.symbol} {country.currency.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(country)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(country.launchPriority)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Car className="h-3 w-3 text-gray-400" />
                        <span>{country.statistics.totalDrivers} водителей</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span>{country.statistics.totalUsers} пользователей</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-gray-400" />
                        <span>{country.statistics.totalCompanies} компаний</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>Водитель: {formatCurrency(country.subscriptionPricing.driver.monthly, country.currency.code)}/мес</div>
                      <div>Компания: {formatCurrency(country.subscriptionPricing.company.monthly, country.currency.code)}/мес</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewCountry(country)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Просмотр"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditCountry(country)}
                        className="text-green-600 hover:text-green-900"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {!country.isLaunched && country.isActive && (
                        <button
                          onClick={() => handleLaunchCountry(country._id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Запустить"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Настройки"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Страны не найдены</h3>
            <p className="mt-1 text-sm text-gray-500">
              Попробуйте изменить фильтры или добавить новую страну.
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно будет добавлено отдельно */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalType === 'create' ? 'Добавить Страну' : 
                 modalType === 'edit' ? 'Редактировать Страну' : 'Информация о Стране'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Содержимое модального окна */}
            <div className="space-y-4">
              <p className="text-gray-600">
                Модальное окно для {modalType === 'create' ? 'создания' : 
                modalType === 'edit' ? 'редактирования' : 'просмотра'} страны
              </p>
              {selectedCountry && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium">{selectedCountry.name}</h3>
                  <p className="text-sm text-gray-600">Код: {selectedCountry.code}</p>
                  <p className="text-sm text-gray-600">Валюта: {selectedCountry.currency.code}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryManagement;

