/**
 * API маршруты для подбора водителей и расчета стоимости поездок
 */

const express = require('express');
const router = express.Router();
const DriverSelectionService = require('../services/DriverSelectionService');
const DynamicPricingService = require('../services/DynamicPricingService');
const auth = require('../middleware/auth');

/**
 * POST /api/ride-matching/find-drivers
 * Поиск доступных водителей для поездки
 */
router.post('/find-drivers', auth, async (req, res) => {
  try {
    const {
      pickup,
      dropoff,
      requestTime,
      passengerCount = 1,
      preferences = {}
    } = req.body;

    // Валидация входных данных
    if (!pickup || !pickup.latitude || !pickup.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Некорректные координаты точки подачи'
      });
    }

    if (!dropoff || !dropoff.latitude || !dropoff.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Некорректные координаты точки назначения'
      });
    }

    // Подготовка запроса
    const rideRequest = {
      pickup,
      dropoff,
      requestTime: requestTime ? new Date(requestTime) : new Date(),
      passengerCount,
      preferences,
      userId: req.user.id
    };

    // Поиск доступных водителей
    const availableOptions = await DriverSelectionService.findAvailableDrivers(rideRequest);

    // Получение информации о динамическом ценообразовании
    const pricingInfo = await DynamicPricingService.calculateDynamicMultiplier({
      requestTime: rideRequest.requestTime,
      location: pickup,
      region: preferences.region || 'Riga'
    });

    res.json({
      success: true,
      data: {
        options: availableOptions,
        pricingInfo,
        requestId: generateRequestId(),
        validUntil: new Date(Date.now() + 5 * 60 * 1000), // 5 минут
        metadata: {
          searchRadius: preferences.maxPickupDistance || 10,
          totalDriversFound: availableOptions.length,
          averageETA: calculateAverageETA(availableOptions),
          priceRange: calculatePriceRange(availableOptions)
        }
      }
    });

  } catch (error) {
    console.error('Ошибка поиска водителей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при поиске доступных водителей',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ride-matching/calculate-price
 * Расчет стоимости поездки для конкретного водителя
 */
router.post('/calculate-price', auth, async (req, res) => {
  try {
    const {
      driverId,
      pickup,
      dropoff,
      requestTime
    } = req.body;

    if (!driverId || !pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        message: 'Отсутствуют обязательные параметры'
      });
    }

    // Получение информации о водителе
    const Driver = require('../models/Driver');
    const driver = await Driver.findById(driverId).populate('tariff');

    if (!driver || !driver.isOnline || !driver.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Водитель недоступен'
      });
    }

    // Расчет маршрута
    const routeInfo = await DriverSelectionService.calculateRoute(pickup, dropoff);

    // Расчет стоимости
    const pricingDetails = await DriverSelectionService.calculateDriverOption(
      driver,
      routeInfo,
      requestTime ? new Date(requestTime) : new Date()
    );

    res.json({
      success: true,
      data: {
        pricing: pricingDetails.pricing,
        driver: pricingDetails.driver,
        logistics: pricingDetails.logistics,
        breakdown: {
          baseFare: pricingDetails.pricing.baseFare,
          distanceCost: pricingDetails.pricing.distanceCost,
          timeCost: pricingDetails.pricing.timeCost,
          surcharges: pricingDetails.pricing.surcharges,
          demandMultiplier: pricingDetails.pricing.demandMultiplier,
          totalBeforeMultiplier: pricingDetails.pricing.baseFare + 
                                pricingDetails.pricing.distanceCost + 
                                pricingDetails.pricing.timeCost + 
                                pricingDetails.pricing.surcharges.total,
          finalTotal: pricingDetails.pricing.totalCost
        }
      }
    });

  } catch (error) {
    console.error('Ошибка расчета стоимости:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при расчете стоимости поездки',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ride-matching/pricing-info
 * Получение информации о текущем ценообразовании в регионе
 */
router.get('/pricing-info', auth, async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      region = 'Riga'
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Отсутствуют координаты'
      });
    }

    const location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    };

    // Получение информации о ценообразовании
    const pricingInfo = await DynamicPricingService.calculateDynamicMultiplier({
      requestTime: new Date(),
      location,
      region
    });

    // Получение статистики региона
    const regionStats = await DynamicPricingService.getRegionTariffStats(region);

    res.json({
      success: true,
      data: {
        currentMultiplier: pricingInfo.finalMultiplier,
        demandLevel: pricingInfo.level,
        explanation: pricingInfo.explanation,
        components: pricingInfo.components,
        regionStats: {
          averageBaseFare: regionStats.averageBaseFare,
          averagePricePerKm: regionStats.averagePricePerKm,
          averagePricePerMinute: regionStats.averagePricePerMinute
        },
        estimatedPriceRange: {
          min: Math.round((regionStats.averageBaseFare + regionStats.averagePricePerKm * 5) * pricingInfo.finalMultiplier * 100) / 100,
          max: Math.round((regionStats.averageBaseFare + regionStats.averagePricePerKm * 20) * pricingInfo.finalMultiplier * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('Ошибка получения информации о ценообразовании:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении информации о ценах',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ride-matching/book-ride
 * Бронирование поездки с выбранным водителем
 */
router.post('/book-ride', auth, async (req, res) => {
  try {
    const {
      driverId,
      pickup,
      dropoff,
      estimatedPrice,
      requestId,
      paymentMethod = 'cash',
      notes = ''
    } = req.body;

    // Валидация
    if (!driverId || !pickup || !dropoff || !estimatedPrice) {
      return res.status(400).json({
        success: false,
        message: 'Отсутствуют обязательные параметры'
      });
    }

    // Проверка доступности водителя
    const Driver = require('../models/Driver');
    const driver = await Driver.findById(driverId);

    if (!driver || !driver.isOnline || !driver.isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Водитель больше недоступен'
      });
    }

    // Создание заказа
    const Ride = require('../models/Ride');
    const newRide = new Ride({
      userId: req.user.id,
      driverId,
      pickup: {
        address: pickup.address,
        coordinates: [pickup.longitude, pickup.latitude]
      },
      dropoff: {
        address: dropoff.address,
        coordinates: [dropoff.longitude, dropoff.latitude]
      },
      estimatedPrice,
      paymentMethod,
      notes,
      status: 'pending',
      requestId,
      createdAt: new Date()
    });

    await newRide.save();

    // Обновление статуса водителя
    await Driver.findByIdAndUpdate(driverId, {
      isAvailable: false,
      currentRideId: newRide._id
    });

    // Отправка уведомления водителю (через WebSocket)
    const io = req.app.get('io');
    if (io) {
      io.to(`driver_${driverId}`).emit('new_ride_request', {
        rideId: newRide._id,
        pickup: pickup,
        dropoff: dropoff,
        estimatedPrice: estimatedPrice,
        passenger: {
          name: req.user.name,
          rating: req.user.rating || 5.0
        }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        rideId: newRide._id,
        status: 'pending',
        driver: {
          name: driver.name,
          rating: driver.rating,
          carModel: driver.carModel,
          licensePlate: driver.licensePlate,
          phone: driver.phone
        },
        estimatedArrival: 5, // минут
        message: 'Заказ отправлен водителю. Ожидайте подтверждения.'
      }
    });

  } catch (error) {
    console.error('Ошибка бронирования поездки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании заказа',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ride-matching/driver-recommendations/:driverId
 * Получение рекомендаций по тарифам для водителя
 */
router.get('/driver-recommendations/:driverId', auth, async (req, res) => {
  try {
    const { driverId } = req.params;
    const { region = 'Riga' } = req.query;

    // Проверка прав доступа (водитель может смотреть только свои рекомендации)
    if (req.user.role !== 'admin' && req.user.id !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для просмотра рекомендаций'
      });
    }

    const recommendations = await DynamicPricingService.generateTariffRecommendations(driverId, region);

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Ошибка получения рекомендаций:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении рекомендаций по тарифам',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ride-matching/market-analysis
 * Анализ рынка для администраторов
 */
router.get('/market-analysis', auth, async (req, res) => {
  try {
    // Проверка прав администратора
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для просмотра анализа рынка'
      });
    }

    const { region = 'Riga', period = '24h' } = req.query;

    // Получение статистики
    const marketData = await getMarketAnalysis(region, period);

    res.json({
      success: true,
      data: marketData
    });

  } catch (error) {
    console.error('Ошибка анализа рынка:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении анализа рынка',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Вспомогательные функции
 */

function generateRequestId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function calculateAverageETA(options) {
  if (options.length === 0) return 0;
  const totalETA = options.reduce((sum, option) => sum + option.logistics.estimatedArrival, 0);
  return Math.round(totalETA / options.length);
}

function calculatePriceRange(options) {
  if (options.length === 0) return { min: 0, max: 0 };
  
  const prices = options.map(option => option.pricing.totalCost);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100
  };
}

async function getMarketAnalysis(region, period) {
  // Здесь должна быть реализация анализа рынка
  // Для демо возвращаем заглушку
  return {
    region,
    period,
    totalRides: 1250,
    averagePrice: 12.50,
    averageWaitTime: 4.2,
    driverUtilization: 0.78,
    customerSatisfaction: 4.6,
    peakHours: ['08:00-09:00', '17:00-19:00'],
    priceMultiplierHistory: [
      { time: '00:00', multiplier: 1.0 },
      { time: '08:00', multiplier: 1.3 },
      { time: '12:00', multiplier: 1.1 },
      { time: '18:00', multiplier: 1.5 },
      { time: '22:00', multiplier: 1.2 }
    ]
  };
}

module.exports = router;

