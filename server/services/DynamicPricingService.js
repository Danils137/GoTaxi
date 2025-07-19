/**
 * Сервис динамического ценообразования
 * Управляет множителями спроса и автоматическими корректировками тарифов
 */

const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Tariff = require('../models/Tariff');

class DynamicPricingService {

  /**
   * Основной метод расчета динамического множителя
   * @param {Object} context - Контекст для расчета (время, локация, спрос)
   * @returns {Object} Информация о множителе и его компонентах
   */
  async calculateDynamicMultiplier(context) {
    const {
      requestTime = new Date(),
      location,
      region = 'Riga',
      eventType = null,
      weatherConditions = 'clear'
    } = context;

    try {
      // Компоненты множителя
      const demandSupplyMultiplier = await this.calculateDemandSupplyMultiplier(location);
      const timeMultiplier = this.calculateTimeMultiplier(requestTime);
      const dayMultiplier = this.calculateDayMultiplier(requestTime);
      const weatherMultiplier = this.calculateWeatherMultiplier(weatherConditions);
      const eventMultiplier = this.calculateEventMultiplier(eventType, location);
      const seasonalMultiplier = this.calculateSeasonalMultiplier(requestTime);

      // Базовый множитель
      let totalMultiplier = 1.0;
      
      // Применение всех множителей
      totalMultiplier *= demandSupplyMultiplier;
      totalMultiplier *= timeMultiplier;
      totalMultiplier *= dayMultiplier;
      totalMultiplier *= weatherMultiplier;
      totalMultiplier *= eventMultiplier;
      totalMultiplier *= seasonalMultiplier;

      // Ограничения множителя
      const finalMultiplier = this.applyMultiplierLimits(totalMultiplier, region);

      return {
        finalMultiplier,
        components: {
          demandSupply: demandSupplyMultiplier,
          time: timeMultiplier,
          day: dayMultiplier,
          weather: weatherMultiplier,
          event: eventMultiplier,
          seasonal: seasonalMultiplier
        },
        explanation: this.generateMultiplierExplanation(finalMultiplier, {
          demandSupplyMultiplier,
          timeMultiplier,
          dayMultiplier,
          weatherMultiplier,
          eventMultiplier,
          seasonalMultiplier
        }),
        level: this.getDemandLevel(finalMultiplier)
      };

    } catch (error) {
      console.error('Ошибка расчета динамического множителя:', error);
      return {
        finalMultiplier: 1.0,
        components: {},
        explanation: 'Стандартный тариф',
        level: 'normal'
      };
    }
  }

  /**
   * Расчет множителя спроса и предложения
   */
  async calculateDemandSupplyMultiplier(location, radius = 10) {
    try {
      // Получение активных поездок в радиусе
      const activeRides = await this.getActiveRidesInRadius(location, radius);
      
      // Получение доступных водителей в радиусе
      const availableDrivers = await this.getAvailableDriversInRadius(location, radius);
      
      // Получение ожидающих заказов
      const pendingRides = await this.getPendingRidesInRadius(location, radius);

      // Расчет коэффициента спроса
      const totalDemand = activeRides + pendingRides;
      const supply = Math.max(availableDrivers, 1); // Избегаем деления на ноль
      
      const demandSupplyRatio = totalDemand / supply;

      // Определение множителя на основе соотношения
      let multiplier = 1.0;

      if (demandSupplyRatio >= 3.0) {
        multiplier = 1.8; // Критический спрос
      } else if (demandSupplyRatio >= 2.5) {
        multiplier = 1.6; // Очень высокий спрос
      } else if (demandSupplyRatio >= 2.0) {
        multiplier = 1.4; // Высокий спрос
      } else if (demandSupplyRatio >= 1.5) {
        multiplier = 1.2; // Повышенный спрос
      } else if (demandSupplyRatio >= 1.0) {
        multiplier = 1.1; // Небольшой спрос
      } else if (demandSupplyRatio <= 0.3) {
        multiplier = 0.95; // Низкий спрос - небольшая скидка
      }

      return multiplier;

    } catch (error) {
      console.error('Ошибка расчета множителя спроса/предложения:', error);
      return 1.0;
    }
  }

  /**
   * Множитель по времени суток
   */
  calculateTimeMultiplier(requestTime) {
    const hour = requestTime.getHours();
    const minute = requestTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // Определение временных периодов
    const timeRanges = {
      earlyMorning: { start: 0, end: 360, multiplier: 1.3 },      // 00:00-06:00
      morningRush: { start: 360, end: 540, multiplier: 1.4 },     // 06:00-09:00
      morning: { start: 540, end: 660, multiplier: 1.1 },         // 09:00-11:00
      midday: { start: 660, end: 840, multiplier: 1.0 },          // 11:00-14:00
      afternoon: { start: 840, end: 1020, multiplier: 1.1 },      // 14:00-17:00
      eveningRush: { start: 1020, end: 1200, multiplier: 1.5 },   // 17:00-20:00
      evening: { start: 1200, end: 1320, multiplier: 1.2 },       // 20:00-22:00
      night: { start: 1320, end: 1440, multiplier: 1.4 }          // 22:00-24:00
    };

    for (const [period, range] of Object.entries(timeRanges)) {
      if (timeInMinutes >= range.start && timeInMinutes < range.end) {
        return range.multiplier;
      }
    }

    return 1.0; // Fallback
  }

  /**
   * Множитель по дням недели
   */
  calculateDayMultiplier(requestTime) {
    const day = requestTime.getDay(); // 0 = воскресенье, 6 = суббота
    const hour = requestTime.getHours();

    const dayMultipliers = {
      0: 1.2, // Воскресенье
      1: 1.0, // Понедельник
      2: 1.0, // Вторник
      3: 1.0, // Среда
      4: 1.1, // Четверг
      5: 1.3, // Пятница
      6: 1.4  // Суббота
    };

    let multiplier = dayMultipliers[day];

    // Дополнительная корректировка для выходных вечером
    if ((day === 5 || day === 6) && hour >= 20) {
      multiplier *= 1.1; // Дополнительная надбавка за вечер выходного дня
    }

    return multiplier;
  }

  /**
   * Множитель по погодным условиям
   */
  calculateWeatherMultiplier(weatherConditions) {
    const weatherMultipliers = {
      'clear': 1.0,           // Ясно
      'partly_cloudy': 1.0,   // Переменная облачность
      'cloudy': 1.05,         // Облачно
      'light_rain': 1.15,     // Легкий дождь
      'rain': 1.25,           // Дождь
      'heavy_rain': 1.4,      // Сильный дождь
      'light_snow': 1.2,      // Легкий снег
      'snow': 1.35,           // Снег
      'heavy_snow': 1.5,      // Сильный снег
      'storm': 1.6,           // Шторм
      'fog': 1.3,             // Туман
      'ice': 1.45             // Гололед
    };

    return weatherMultipliers[weatherConditions] || 1.0;
  }

  /**
   * Множитель по событиям
   */
  calculateEventMultiplier(eventType, location) {
    if (!eventType) return 1.0;

    const eventMultipliers = {
      'concert': 1.3,         // Концерт
      'football_match': 1.4,  // Футбольный матч
      'festival': 1.5,        // Фестиваль
      'conference': 1.2,      // Конференция
      'new_year': 2.0,        // Новый год
      'christmas': 1.6,       // Рождество
      'midsummer': 1.8,       // Лиго (Иванов день)
      'independence_day': 1.4, // День независимости
      'airport_delay': 1.3,   // Задержки в аэропорту
      'public_transport_strike': 1.7, // Забастовка общественного транспорта
      'road_closure': 1.4     // Перекрытие дорог
    };

    return eventMultipliers[eventType] || 1.0;
  }

  /**
   * Сезонный множитель
   */
  calculateSeasonalMultiplier(requestTime) {
    const month = requestTime.getMonth(); // 0-11
    const day = requestTime.getDate();

    // Особые периоды
    const specialPeriods = [
      // Новогодние праздники
      { start: { month: 11, day: 25 }, end: { month: 0, day: 8 }, multiplier: 1.4 },
      // Летний сезон (туристы)
      { start: { month: 5, day: 1 }, end: { month: 7, day: 31 }, multiplier: 1.1 },
      // Начало учебного года
      { start: { month: 8, day: 1 }, end: { month: 8, day: 15 }, multiplier: 1.2 }
    ];

    for (const period of specialPeriods) {
      if (this.isDateInPeriod(requestTime, period.start, period.end)) {
        return period.multiplier;
      }
    }

    return 1.0;
  }

  /**
   * Применение ограничений множителя
   */
  applyMultiplierLimits(multiplier, region) {
    // Ограничения по регионам
    const regionLimits = {
      'Riga': { min: 0.9, max: 2.0 },
      'Daugavpils': { min: 0.95, max: 1.8 },
      'Liepaja': { min: 0.95, max: 1.8 },
      'Jelgava': { min: 0.95, max: 1.7 },
      'Jurmala': { min: 0.9, max: 2.2 }, // Курортный город
      'Ventspils': { min: 0.95, max: 1.8 },
      'Other': { min: 0.95, max: 1.6 }
    };

    const limits = regionLimits[region] || regionLimits['Other'];
    
    return Math.max(limits.min, Math.min(multiplier, limits.max));
  }

  /**
   * Генерация объяснения множителя для пользователя
   */
  generateMultiplierExplanation(finalMultiplier, components) {
    const explanations = [];

    if (finalMultiplier <= 0.95) {
      explanations.push('Низкий спрос - скидка');
    } else if (finalMultiplier >= 1.5) {
      explanations.push('Высокий спрос');
    }

    if (components.timeMultiplier >= 1.3) {
      explanations.push('Час пик');
    }

    if (components.dayMultiplier >= 1.2) {
      explanations.push('Выходной день');
    }

    if (components.weatherMultiplier >= 1.2) {
      explanations.push('Плохая погода');
    }

    if (components.eventMultiplier >= 1.2) {
      explanations.push('Местное событие');
    }

    if (explanations.length === 0) {
      return 'Стандартный тариф';
    }

    return explanations.join(', ');
  }

  /**
   * Определение уровня спроса
   */
  getDemandLevel(multiplier) {
    if (multiplier <= 0.95) return 'low';
    if (multiplier <= 1.1) return 'normal';
    if (multiplier <= 1.3) return 'moderate';
    if (multiplier <= 1.5) return 'high';
    return 'very_high';
  }

  /**
   * Автоматические рекомендации тарифов для водителей
   */
  async generateTariffRecommendations(driverId, region = 'Riga') {
    try {
      const driver = await Driver.findById(driverId).populate('tariff');
      if (!driver) {
        throw new Error('Водитель не найден');
      }

      // Получение статистики региона
      const regionStats = await this.getRegionTariffStats(region);
      
      // Получение персональной статистики водителя
      const driverStats = await this.getDriverStats(driverId);

      // Расчет рекомендуемых тарифов
      const recommendations = this.calculateTariffRecommendations(
        driver,
        regionStats,
        driverStats
      );

      return recommendations;

    } catch (error) {
      console.error('Ошибка генерации рекомендаций тарифов:', error);
      throw error;
    }
  }

  /**
   * Расчет рекомендуемых тарифов
   */
  calculateTariffRecommendations(driver, regionStats, driverStats) {
    const currentTariff = driver.tariff;
    
    // Базовые множители для рекомендаций
    let ratingMultiplier = 1.0;
    let experienceMultiplier = 1.0;
    let demandMultiplier = 1.0;

    // Корректировка по рейтингу
    if (driver.rating >= 4.8) {
      ratingMultiplier = 1.15; // Отличный рейтинг
    } else if (driver.rating >= 4.5) {
      ratingMultiplier = 1.05; // Хороший рейтинг
    } else if (driver.rating < 4.0) {
      ratingMultiplier = 0.95; // Низкий рейтинг
    }

    // Корректировка по опыту
    if (driver.tripsCount >= 2000) {
      experienceMultiplier = 1.1; // Очень опытный
    } else if (driver.tripsCount >= 1000) {
      experienceMultiplier = 1.05; // Опытный
    } else if (driver.tripsCount < 100) {
      experienceMultiplier = 0.98; // Новичок
    }

    // Корректировка по спросу на водителя
    if (driverStats.acceptanceRate >= 0.9 && driverStats.averageRating >= 4.5) {
      demandMultiplier = 1.1; // Популярный водитель
    }

    // Расчет рекомендуемых значений
    const totalMultiplier = ratingMultiplier * experienceMultiplier * demandMultiplier;

    const recommendations = {
      baseFare: {
        current: currentTariff.baseFare,
        recommended: Math.round(regionStats.averageBaseFare * totalMultiplier * 100) / 100,
        min: Math.round(regionStats.averageBaseFare * 0.8 * 100) / 100,
        max: Math.round(regionStats.averageBaseFare * 1.3 * 100) / 100
      },
      pricePerKm: {
        current: currentTariff.pricePerKm,
        recommended: Math.round(regionStats.averagePricePerKm * totalMultiplier * 100) / 100,
        min: Math.round(regionStats.averagePricePerKm * 0.8 * 100) / 100,
        max: Math.round(regionStats.averagePricePerKm * 1.3 * 100) / 100
      },
      pricePerMinute: {
        current: currentTariff.pricePerMinute,
        recommended: Math.round(regionStats.averagePricePerMinute * totalMultiplier * 100) / 100,
        min: Math.round(regionStats.averagePricePerMinute * 0.8 * 100) / 100,
        max: Math.round(regionStats.averagePricePerMinute * 1.3 * 100) / 100
      },
      reasoning: this.generateRecommendationReasoning(
        ratingMultiplier,
        experienceMultiplier,
        demandMultiplier,
        driver
      ),
      confidence: this.calculateRecommendationConfidence(driverStats, regionStats)
    };

    return recommendations;
  }

  /**
   * Генерация объяснения рекомендаций
   */
  generateRecommendationReasoning(ratingMultiplier, experienceMultiplier, demandMultiplier, driver) {
    const reasons = [];

    if (ratingMultiplier > 1.05) {
      reasons.push(`Высокий рейтинг (${driver.rating}⭐) позволяет устанавливать цены выше среднего`);
    } else if (ratingMultiplier < 1.0) {
      reasons.push(`Рейтинг (${driver.rating}⭐) ниже среднего, рекомендуется снизить цены`);
    }

    if (experienceMultiplier > 1.05) {
      reasons.push(`Большой опыт (${driver.tripsCount} поездок) повышает ценность услуг`);
    } else if (experienceMultiplier < 1.0) {
      reasons.push(`Небольшой опыт (${driver.tripsCount} поездок), рекомендуются конкурентные цены`);
    }

    if (demandMultiplier > 1.05) {
      reasons.push('Высокий спрос на ваши услуги позволяет повысить тарифы');
    }

    if (reasons.length === 0) {
      reasons.push('Рекомендации основаны на средних тарифах региона');
    }

    return reasons;
  }

  /**
   * Расчет уверенности в рекомендациях
   */
  calculateRecommendationConfidence(driverStats, regionStats) {
    let confidence = 0.5; // Базовая уверенность

    // Увеличение уверенности на основе данных
    if (driverStats.totalTrips >= 100) confidence += 0.2;
    if (driverStats.totalTrips >= 500) confidence += 0.1;
    if (regionStats.sampleSize >= 50) confidence += 0.2;

    return Math.min(confidence, 1.0);
  }

  /**
   * Вспомогательные методы для получения данных
   */

  async getActiveRidesInRadius(location, radius) {
    // Здесь должен быть запрос к базе данных с геолокацией
    return await Ride.countDocuments({
      status: { $in: ['accepted', 'started'] }
      // + геолокационный фильтр
    });
  }

  async getAvailableDriversInRadius(location, radius) {
    return await Driver.countDocuments({
      isOnline: true,
      isAvailable: true
      // + геолокационный фильтр
    });
  }

  async getPendingRidesInRadius(location, radius) {
    return await Ride.countDocuments({
      status: 'pending'
      // + геолокационный фильтр
    });
  }

  async getRegionTariffStats(region) {
    const tariffs = await Tariff.find({ region, isApproved: true });
    
    if (tariffs.length === 0) {
      // Возврат дефолтных значений если нет данных
      return {
        averageBaseFare: 2.50,
        averagePricePerKm: 1.20,
        averagePricePerMinute: 0.30,
        sampleSize: 0
      };
    }

    return {
      averageBaseFare: tariffs.reduce((sum, t) => sum + t.baseFare, 0) / tariffs.length,
      averagePricePerKm: tariffs.reduce((sum, t) => sum + t.pricePerKm, 0) / tariffs.length,
      averagePricePerMinute: tariffs.reduce((sum, t) => sum + t.pricePerMinute, 0) / tariffs.length,
      sampleSize: tariffs.length
    };
  }

  async getDriverStats(driverId) {
    const rides = await Ride.find({ driverId });
    const totalTrips = rides.length;
    const completedTrips = rides.filter(r => r.status === 'completed').length;
    const acceptedTrips = rides.filter(r => r.status !== 'cancelled_by_driver').length;

    return {
      totalTrips,
      completedTrips,
      acceptanceRate: totalTrips > 0 ? acceptedTrips / totalTrips : 0,
      averageRating: rides.reduce((sum, r) => sum + (r.driverRating || 0), 0) / Math.max(completedTrips, 1)
    };
  }

  isDateInPeriod(date, start, end) {
    const month = date.getMonth();
    const day = date.getDate();
    
    // Обработка периодов, переходящих через новый год
    if (start.month > end.month) {
      return (month >= start.month && day >= start.day) || 
             (month <= end.month && day <= end.day);
    }
    
    return (month > start.month || (month === start.month && day >= start.day)) &&
           (month < end.month || (month === end.month && day <= end.day));
  }
}

module.exports = new DynamicPricingService();

