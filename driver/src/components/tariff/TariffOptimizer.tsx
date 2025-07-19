import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, MapPin, Info, Lightbulb, Target } from 'lucide-react';

interface TariffRecommendations {
  baseFare: {
    current: number;
    recommended: number;
    min: number;
    max: number;
  };
  pricePerKm: {
    current: number;
    recommended: number;
    min: number;
    max: number;
  };
  pricePerMinute: {
    current: number;
    recommended: number;
    min: number;
    max: number;
  };
  reasoning: string[];
  confidence: number;
}

interface MarketData {
  averageBaseFare: number;
  averagePricePerKm: number;
  averagePricePerMinute: number;
  currentMultiplier: number;
  demandLevel: 'low' | 'normal' | 'moderate' | 'high' | 'very_high';
  explanation: string;
}

interface DriverStats {
  totalEarnings: number;
  totalTrips: number;
  averageRating: number;
  acceptanceRate: number;
  averageTripValue: number;
  peakHours: string[];
}

const TariffOptimizer: React.FC = () => {
  const [recommendations, setRecommendations] = useState<TariffRecommendations | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'market' | 'stats'>('recommendations');
  const [currentTariff, setCurrentTariff] = useState({
    baseFare: 2.50,
    pricePerKm: 1.20,
    pricePerMinute: 0.30,
    nightSurcharge: 0.50,
    weekendSurcharge: 0.20,
    airportSurcharge: 2.00
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Симуляция загрузки данных
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock данные для демонстрации
      setRecommendations({
        baseFare: {
          current: 2.50,
          recommended: 2.60,
          min: 2.00,
          max: 3.50
        },
        pricePerKm: {
          current: 1.20,
          recommended: 1.35,
          min: 1.00,
          max: 1.80
        },
        pricePerMinute: {
          current: 0.30,
          recommended: 0.32,
          min: 0.25,
          max: 0.50
        },
        reasoning: [
          'Высокий рейтинг (4.8⭐) позволяет устанавливать цены выше среднего',
          'Большой опыт (1,200 поездок) повышает ценность услуг',
          'Текущий спрос в регионе выше обычного (+15%)'
        ],
        confidence: 0.85
      });

      setMarketData({
        averageBaseFare: 2.45,
        averagePricePerKm: 1.30,
        averagePricePerMinute: 0.31,
        currentMultiplier: 1.15,
        demandLevel: 'moderate',
        explanation: 'Умеренный спрос, вечерний час пик'
      });

      setDriverStats({
        totalEarnings: 2450.80,
        totalTrips: 156,
        averageRating: 4.8,
        acceptanceRate: 0.92,
        averageTripValue: 15.70,
        peakHours: ['08:00-09:00', '17:00-19:00', '22:00-24:00']
      });

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendations = () => {
    if (!recommendations) return;
    
    setCurrentTariff(prev => ({
      ...prev,
      baseFare: recommendations.baseFare.recommended,
      pricePerKm: recommendations.pricePerKm.recommended,
      pricePerMinute: recommendations.pricePerMinute.recommended
    }));
  };

  const getDemandLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'very_high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculatePotentialIncrease = () => {
    if (!recommendations) return 0;
    
    const currentTotal = currentTariff.baseFare + (currentTariff.pricePerKm * 10) + (currentTariff.pricePerMinute * 15);
    const recommendedTotal = recommendations.baseFare.recommended + (recommendations.pricePerKm.recommended * 10) + (recommendations.pricePerMinute.recommended * 15);
    
    return ((recommendedTotal - currentTotal) / currentTotal * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Анализ рынка и подготовка рекомендаций...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Оптимизация тарифов</h1>
          <p className="text-gray-600 mt-1">Рекомендации для увеличения доходности</p>
        </div>
      </div>

      {/* Current Market Status */}
      {marketData && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getDemandLevelColor(marketData.demandLevel)}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{marketData.explanation}</span>
                </div>
                {marketData.currentMultiplier !== 1.0 && (
                  <span className="text-sm font-semibold text-green-600">
                    +{Math.round((marketData.currentMultiplier - 1) * 100)}% к базовому тарифу
                  </span>
                )}
              </div>
              <button
                onClick={loadData}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Обновить данные
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'recommendations', name: 'Рекомендации', icon: Target },
              { id: 'market', name: 'Рынок', icon: TrendingUp },
              { id: 'stats', name: 'Статистика', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && recommendations && (
          <div className="space-y-6">
            {/* Potential Increase Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Потенциальное увеличение дохода
                  </h3>
                  <p className="text-gray-600">
                    При применении рекомендаций ваш доход может увеличиться на
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    +{calculatePotentialIncrease().toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Уверенность: {Math.round(recommendations.confidence * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Tariff Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Рекомендуемые тарифы</h3>
                  <button
                    onClick={applyRecommendations}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Применить все
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Base Fare */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Базовый тариф (посадка)</h4>
                      <p className="text-sm text-gray-600">Фиксированная плата за начало поездки</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500">€{recommendations.baseFare.current}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-lg font-semibold text-green-600">
                          €{recommendations.baseFare.recommended}
                        </span>
                        {recommendations.baseFare.recommended > recommendations.baseFare.current ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Диапазон: €{recommendations.baseFare.min} - €{recommendations.baseFare.max}
                      </div>
                    </div>
                  </div>

                  {/* Price per KM */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Цена за километр</h4>
                      <p className="text-sm text-gray-600">Стоимость за каждый километр поездки</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500">€{recommendations.pricePerKm.current}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-lg font-semibold text-green-600">
                          €{recommendations.pricePerKm.recommended}
                        </span>
                        {recommendations.pricePerKm.recommended > recommendations.pricePerKm.current ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Диапазон: €{recommendations.pricePerKm.min} - €{recommendations.pricePerKm.max}
                      </div>
                    </div>
                  </div>

                  {/* Price per Minute */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Цена за минуту</h4>
                      <p className="text-sm text-gray-600">Стоимость за каждую минуту поездки</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500">€{recommendations.pricePerMinute.current}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-lg font-semibold text-green-600">
                          €{recommendations.pricePerMinute.recommended}
                        </span>
                        {recommendations.pricePerMinute.recommended > recommendations.pricePerMinute.current ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Диапазон: €{recommendations.pricePerMinute.min} - €{recommendations.pricePerMinute.max}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Обоснование рекомендаций</h3>
                </div>
                <div className="space-y-3">
                  {recommendations.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && marketData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Средние тарифы в регионе</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">€{marketData.averageBaseFare}</div>
                    <div className="text-sm text-gray-600">Базовый тариф</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">€{marketData.averagePricePerKm}</div>
                    <div className="text-sm text-gray-600">За километр</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">€{marketData.averagePricePerMinute}</div>
                    <div className="text-sm text-gray-600">За минуту</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Текущая ситуация на рынке</h3>
                <div className={`p-4 rounded-lg border ${getDemandLevelColor(marketData.demandLevel)}`}>
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Уровень спроса: {marketData.demandLevel}</div>
                      <div className="text-sm mt-1">{marketData.explanation}</div>
                      {marketData.currentMultiplier !== 1.0 && (
                        <div className="text-sm mt-2 font-semibold">
                          Текущий множитель: ×{marketData.currentMultiplier} 
                          ({marketData.currentMultiplier > 1 ? '+' : ''}{Math.round((marketData.currentMultiplier - 1) * 100)}%)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && driverStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">€{driverStats.totalEarnings}</div>
                    <div className="text-sm text-gray-600">Общий доход</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{driverStats.totalTrips}</div>
                    <div className="text-sm text-gray-600">Всего поездок</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">€{driverStats.averageTripValue}</div>
                    <div className="text-sm text-gray-600">Средняя поездка</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ваши показатели</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Рейтинг</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`text-lg ${star <= driverStats.averageRating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold">{driverStats.averageRating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Процент принятых заказов</span>
                    <span className="font-semibold">{Math.round(driverStats.acceptanceRate * 100)}%</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Пиковые часы</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {driverStats.peakHours.map(hour => (
                        <span
                          key={hour}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {hour}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TariffOptimizer;

