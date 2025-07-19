/**
 * Сервис подбора водителей и расчета стоимости поездок
 * Учитывает индивидуальные тарифы каждого водителя и динамическое ценообразование
 */

const Driver = require('../models/Driver');
const Tariff = require('../models/Tariff');
const Ride = require('../models/Ride');

class DriverSelectionService {
  
  /**
   * Основной метод подбора водителей для поездки
   * @param {Object} rideRequest - Запрос на поездку
   * @returns {Array} Массив доступных водителей с расчетом стоимости
   */
  async findAvailableDrivers(rideRequest) {
    const {
      pickup,
      dropoff,
      requestTime = new Date(),
      passengerCount = 1,
      preferences = {}
    } = rideRequest;

    try {
      // Шаг 1: Получить всех потенциально доступных водителей
      const nearbyDrivers = await this.getNearbyDrivers(pickup, preferences.maxPickupDistance || 10);
      
      // Шаг 2: Фильтрация доступных водителей
      const availableDrivers = await this.filterAvailableDrivers(nearbyDrivers, pickup, dropoff, requestTime);
      
      // Шаг 3: Расчет маршрута и времени
      const routeInfo = await this.calculateRoute(pickup, dropoff);
      
      // Шаг 4: Расчет стоимости для каждого водителя
      const driversWithCost = await Promise.all(
        availableDrivers.map(driver => this.calculateDriverOption(driver, routeInfo, requestTime))
      );
      
      // Шаг 5: Сортировка и группировка вариантов
      const sortedOptions = this.sortAndGroupDrivers(driversWithCost);
      
      // Шаг 6: Возврат топ вариантов
      return this.selectBestOptions(sortedOptions, preferences);
      
    } catch (error) {
      console.error('Ошибка при подборе водителей:', error);
      throw new Error('Не удалось найти доступных водителей');
    }
  }

  /**
   * Получение водителей в радиусе от точки подачи
   */
  async getNearbyDrivers(pickup, maxDistance = 10) {
    const drivers = await Driver.find({
      isOnline: true,
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [pickup.longitude, pickup.latitude]
          },
          $maxDistance: maxDistance * 1000 // конвертация в метры
        }
      }
    }).populate('tariff');

    return drivers;
  }

  /**
   * Фильтрация водителей по доступности и требованиям
   */
  async filterAvailableDrivers(drivers, pickup, dropoff, requestTime) {
    const filtered = [];

    for (const driver of drivers) {
      // Проверка базовых требований
      if (!driver.tariff || !driver.tariff.isApproved) {
        continue;
      }

      // Проверка лицензий для аэропорта
      if (this.isAirportLocation(pickup) || this.isAirportLocation(dropoff)) {
        if (!driver.hasAirportLicense) {
          continue;
        }
      }

      // Проверка активных поездок
      const hasActiveRide = await Ride.findOne({
        driverId: driver._id,
        status: { $in: ['accepted', 'started', 'arrived'] }
      });

      if (hasActiveRide) {
        continue;
      }

      // Проверка рабочих часов водителя
      if (!this.isDriverWorkingTime(driver, requestTime)) {
        continue;
      }

      filtered.push(driver);
    }

    return filtered;
  }

  /**
   * Расчет маршрута и времени поездки
   */
  async calculateRoute(pickup, dropoff) {
    // Здесь должна быть интеграция с Google Maps API
    // Для демо используем упрощенный расчет
    const distance = this.calculateDistance(pickup, dropoff);
    const estimatedTime = this.estimateTime(distance);

    return {
      distance: distance, // в километрах
      estimatedTime: estimatedTime, // в минутах
      route: null // здесь будет детальный маршрут
    };
  }

  /**
   * Расчет варианта поездки для конкретного водителя
   */
  async calculateDriverOption(driver, routeInfo, requestTime) {
    const tariff = driver.tariff;
    const demandMultiplier = await this.calculateDemandMultiplier(requestTime, driver.location);
    
    // Базовый расчет стоимости
    const baseCost = this.calculateBaseCost(tariff, routeInfo, requestTime);
    
    // Применение динамического множителя
    const finalCost = baseCost * demandMultiplier;
    
    // Расчет времени прибытия водителя
    const eta = await this.calculateETA(driver.location, routeInfo.pickup);
    
    // Расчет рейтинга водителя
    const driverScore = this.calculateDriverScore(driver, finalCost, eta);

    return {
      driverId: driver._id,
      driver: {
        name: driver.name,
        rating: driver.rating,
        tripsCount: driver.tripsCount,
        carModel: driver.carModel,
        carColor: driver.carColor,
        licensePlate: driver.licensePlate,
        photo: driver.photo
      },
      pricing: {
        baseFare: tariff.baseFare,
        distanceCost: routeInfo.distance * tariff.pricePerKm,
        timeCost: routeInfo.estimatedTime * tariff.pricePerMinute,
        surcharges: this.calculateSurcharges(tariff, routeInfo, requestTime),
        demandMultiplier: demandMultiplier,
        totalCost: finalCost,
        currency: 'EUR'
      },
      logistics: {
        estimatedArrival: eta,
        estimatedTripTime: routeInfo.estimatedTime,
        distance: routeInfo.distance
      },
      score: driverScore,
      category: this.categorizeDriver(driver, finalCost)
    };
  }

  /**
   * Базовый расчет стоимости поездки
   */
  calculateBaseCost(tariff, routeInfo, requestTime) {
    let cost = tariff.baseFare;
    cost += routeInfo.distance * tariff.pricePerKm;
    cost += routeInfo.estimatedTime * tariff.pricePerMinute;
    
    // Добавление надбавок
    const surcharges = this.calculateSurcharges(tariff, routeInfo, requestTime);
    cost += surcharges.total;
    
    // Минимальная стоимость
    return Math.max(cost, tariff.minimumFare || 5.00);
  }

  /**
   * Расчет надбавок
   */
  calculateSurcharges(tariff, routeInfo, requestTime) {
    const surcharges = {
      night: 0,
      weekend: 0,
      airport: 0,
      total: 0
    };

    const hour = requestTime.getHours();
    const day = requestTime.getDay();

    // Ночная надбавка (22:00 - 06:00)
    if (hour >= 22 || hour < 6) {
      surcharges.night = routeInfo.distance * (tariff.nightSurcharge || 0);
    }

    // Надбавка за выходные (суббота, воскресенье)
    if (day === 0 || day === 6) {
      surcharges.weekend = routeInfo.distance * (tariff.weekendSurcharge || 0);
    }

    // Надбавка за аэропорт
    if (this.isAirportRoute(routeInfo)) {
      surcharges.airport = tariff.airportSurcharge || 0;
    }

    surcharges.total = surcharges.night + surcharges.weekend + surcharges.airport;
    return surcharges;
  }

  /**
   * Расчет динамического множителя спроса
   */
  async calculateDemandMultiplier(requestTime, location) {
    try {
      // Получение текущих метрик спроса
      const activeRides = await this.getActiveRidesCount(location);
      const availableDrivers = await this.getAvailableDriversCount(location);
      
      // Базовый множитель на основе спроса/предложения
      const demandSupplyRatio = activeRides / Math.max(availableDrivers, 1);
      let multiplier = 1.0;

      if (demandSupplyRatio > 2.0) {
        multiplier = 1.5; // Очень высокий спрос
      } else if (demandSupplyRatio > 1.5) {
        multiplier = 1.3; // Высокий спрос
      } else if (demandSupplyRatio > 1.0) {
        multiplier = 1.1; // Умеренный спрос
      }

      // Корректировка по времени суток
      const timeMultiplier = this.getTimeMultiplier(requestTime);
      multiplier *= timeMultiplier;

      // Корректировка по дню недели
      const dayMultiplier = this.getDayMultiplier(requestTime);
      multiplier *= dayMultiplier;

      // Ограничение максимального множителя
      return Math.min(multiplier, 2.0);
      
    } catch (error) {
      console.error('Ошибка расчета множителя спроса:', error);
      return 1.0; // Возврат базового множителя при ошибке
    }
  }

  /**
   * Множители по времени суток
   */
  getTimeMultiplier(requestTime) {
    const hour = requestTime.getHours();
    
    if (hour >= 6 && hour < 9) return 1.2;   // Утренний час пик
    if (hour >= 9 && hour < 17) return 1.0;  // Обычное время
    if (hour >= 17 && hour < 20) return 1.3; // Вечерний час пик
    if (hour >= 20 && hour < 22) return 1.1; // Вечер
    return 1.4; // Ночь (22:00 - 06:00)
  }

  /**
   * Множители по дням недели
   */
  getDayMultiplier(requestTime) {
    const day = requestTime.getDay();
    
    switch (day) {
      case 0: return 1.1; // Воскресенье
      case 1: return 1.0; // Понедельник
      case 2: return 1.0; // Вторник
      case 3: return 1.0; // Среда
      case 4: return 1.0; // Четверг
      case 5: return 1.2; // Пятница
      case 6: return 1.3; // Суббота
      default: return 1.0;
    }
  }

  /**
   * Расчет рейтинга водителя для сортировки
   */
  calculateDriverScore(driver, cost, eta) {
    // Компоненты рейтинга
    const priceScore = (1 / cost) * 100;           // Чем дешевле, тем лучше
    const speedScore = (1 / eta) * 50;             // Чем быстрее прибытие, тем лучше
    const ratingScore = driver.rating * 20;        // Рейтинг водителя
    const experienceScore = Math.min(driver.tripsCount / 100, 1) * 10; // Опыт
    
    return priceScore + speedScore + ratingScore + experienceScore;
  }

  /**
   * Категоризация водителя
   */
  categorizeDriver(driver, cost) {
    if (driver.rating >= 4.7 && cost > 20) return 'premium';
    if (cost <= 15) return 'economy';
    return 'standard';
  }

  /**
   * Сортировка и группировка водителей
   */
  sortAndGroupDrivers(driversWithCost) {
    // Сортировка по общему рейтингу
    const sorted = driversWithCost.sort((a, b) => b.score - a.score);
    
    // Группировка по категориям
    const grouped = {
      all: sorted,
      economy: sorted.filter(d => d.category === 'economy'),
      standard: sorted.filter(d => d.category === 'standard'),
      premium: sorted.filter(d => d.category === 'premium'),
      fastest: [...sorted].sort((a, b) => a.logistics.estimatedArrival - b.logistics.estimatedArrival)
    };

    return grouped;
  }

  /**
   * Выбор лучших вариантов для показа клиенту
   */
  selectBestOptions(groupedDrivers, preferences = {}) {
    const maxOptions = preferences.maxOptions || 5;
    
    // Выбираем лучшие варианты из каждой категории
    const bestOptions = [];
    
    // Лучший эконом вариант
    if (groupedDrivers.economy.length > 0) {
      bestOptions.push({
        ...groupedDrivers.economy[0],
        label: 'Эконом',
        description: 'Самый доступный вариант'
      });
    }
    
    // Самый быстрый
    if (groupedDrivers.fastest.length > 0) {
      const fastest = groupedDrivers.fastest[0];
      if (!bestOptions.find(o => o.driverId.toString() === fastest.driverId.toString())) {
        bestOptions.push({
          ...fastest,
          label: 'Быстрый',
          description: `Прибытие через ${fastest.logistics.estimatedArrival} мин`
        });
      }
    }
    
    // Премиум вариант
    if (groupedDrivers.premium.length > 0) {
      const premium = groupedDrivers.premium[0];
      if (!bestOptions.find(o => o.driverId.toString() === premium.driverId.toString())) {
        bestOptions.push({
          ...premium,
          label: 'Премиум',
          description: 'Высокий рейтинг и комфорт'
        });
      }
    }
    
    // Добавляем остальные лучшие варианты до максимума
    for (const driver of groupedDrivers.all) {
      if (bestOptions.length >= maxOptions) break;
      
      if (!bestOptions.find(o => o.driverId.toString() === driver.driverId.toString())) {
        bestOptions.push({
          ...driver,
          label: 'Стандарт',
          description: 'Оптимальное соотношение цены и качества'
        });
      }
    }

    return bestOptions.slice(0, maxOptions);
  }

  /**
   * Вспомогательные методы
   */
  
  calculateDistance(point1, point2) {
    // Формула гаверсинуса для расчета расстояния между двумя точками
    const R = 6371; // Радиус Земли в км
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  estimateTime(distance) {
    // Простая оценка времени: 30 км/ч средняя скорость в городе
    return Math.round(distance / 30 * 60); // в минутах
  }

  async calculateETA(driverLocation, pickupLocation) {
    const distance = this.calculateDistance(driverLocation, pickupLocation);
    return Math.round(distance / 40 * 60); // 40 км/ч для подачи
  }

  isAirportLocation(location) {
    // Проверка, является ли локация аэропортом
    // Координаты аэропорта Риги: 56.9236, 23.9711
    const airportCoords = { latitude: 56.9236, longitude: 23.9711 };
    const distance = this.calculateDistance(location, airportCoords);
    return distance < 5; // В радиусе 5 км от аэропорта
  }

  isAirportRoute(routeInfo) {
    return this.isAirportLocation(routeInfo.pickup) || this.isAirportLocation(routeInfo.dropoff);
  }

  isDriverWorkingTime(driver, requestTime) {
    // Проверка рабочих часов водителя
    // Пока что все водители работают 24/7
    return true;
  }

  async getActiveRidesCount(location) {
    // Подсчет активных поездок в радиусе
    return await Ride.countDocuments({
      status: { $in: ['accepted', 'started'] },
      // Здесь должна быть фильтрация по геолокации
    });
  }

  async getAvailableDriversCount(location) {
    // Подсчет доступных водителей в радиусе
    return await Driver.countDocuments({
      isOnline: true,
      isAvailable: true,
      // Здесь должна быть фильтрация по геолокации
    });
  }
}

module.exports = new DriverSelectionService();

