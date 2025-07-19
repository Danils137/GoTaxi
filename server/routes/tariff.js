const express = require('express');
const router = express.Router();
const Tariff = require('../models/Tariff');
const auth = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');

// Middleware для проверки роли водителя
const requireDriver = (req, res, next) => {
  if (req.user.role !== 'driver' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Доступ разрешен только водителям и администраторам' 
    });
  }
  next();
};

// Middleware для проверки роли администратора
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Доступ разрешен только администраторам' 
    });
  }
  next();
};

// Валидация тарифа
const tariffValidation = [
  body('baseFare')
    .isFloat({ min: 0, max: 50 })
    .withMessage('Базовый тариф должен быть от 0 до 50€'),
  body('pricePerKm')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Цена за км должна быть от 0 до 10€'),
  body('pricePerMinute')
    .isFloat({ min: 0, max: 2 })
    .withMessage('Цена за минуту должна быть от 0 до 2€'),
  body('minimumFare')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Минимальная стоимость должна быть от 0 до 100€'),
  body('region')
    .isIn(['Riga', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils', 'Other'])
    .withMessage('Неверный регион'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов')
];

// GET /api/tariff/my - Получить тариф текущего водителя
router.get('/my', auth, requireDriver, async (req, res) => {
  try {
    const tariff = await Tariff.findActiveForDriver(req.user.id);
    
    if (!tariff) {
      return res.status(404).json({ 
        error: 'Активный тариф не найден',
        message: 'Создайте новый тариф или активируйте существующий'
      });
    }
    
    res.json({
      success: true,
      tariff,
      isValid: tariff.isValid
    });
  } catch (error) {
    console.error('Ошибка получения тарифа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/tariff/driver/:driverId - Получить тариф конкретного водителя
router.get('/driver/:driverId', 
  param('driverId').isMongoId().withMessage('Неверный ID водителя'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const tariff = await Tariff.findActiveForDriver(req.params.driverId)
        .populate('driverId', 'name email phone rating');
      
      if (!tariff) {
        return res.status(404).json({ 
          error: 'Активный тариф не найден для данного водителя' 
        });
      }
      
      res.json({
        success: true,
        tariff
      });
    } catch (error) {
      console.error('Ошибка получения тарифа водителя:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

// GET /api/tariff/region/:region - Получить тарифы по региону
router.get('/region/:region',
  param('region').isIn(['Riga', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils', 'Other'])
    .withMessage('Неверный регион'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const tariffs = await Tariff.findByRegion(req.params.region);
      const averages = await Tariff.getAverageTariffs(req.params.region);
      
      res.json({
        success: true,
        region: req.params.region,
        tariffs,
        averages: averages[0] || null,
        count: tariffs.length
      });
    } catch (error) {
      console.error('Ошибка получения тарифов региона:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

// POST /api/tariff/calculate - Расчет стоимости поездки
router.post('/calculate', [
  body('driverId').isMongoId().withMessage('Неверный ID водителя'),
  body('distance').isFloat({ min: 0 }).withMessage('Расстояние должно быть положительным числом'),
  body('duration').isFloat({ min: 0 }).withMessage('Время должно быть положительным числом'),
  body('isNight').optional().isBoolean(),
  body('isWeekend').optional().isBoolean(),
  body('isAirport').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { driverId, distance, duration, isNight, isWeekend, isAirport } = req.body;
    
    const tariff = await Tariff.findActiveForDriver(driverId);
    if (!tariff) {
      return res.status(404).json({ 
        error: 'Активный тариф не найден для данного водителя' 
      });
    }
    
    const calculation = tariff.calculateFare(distance, duration, {
      isNight,
      isWeekend,
      isAirport
    });
    
    res.json({
      success: true,
      calculation,
      tariff: {
        id: tariff._id,
        driverId: tariff.driverId,
        region: tariff.region
      }
    });
  } catch (error) {
    console.error('Ошибка расчета стоимости:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/tariff - Создать новый тариф (только водители)
router.post('/', auth, requireDriver, tariffValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Деактивируем старые тарифы водителя
    await Tariff.updateMany(
      { driverId: req.user.id, isActive: true },
      { isActive: false }
    );
    
    const tariffData = {
      ...req.body,
      driverId: req.user.id,
      currency: 'EUR', // Принудительно устанавливаем евро
      isActive: true,
      isApproved: false // Требует одобрения администратора
    };
    
    const tariff = new Tariff(tariffData);
    await tariff.save();
    
    res.status(201).json({
      success: true,
      message: 'Тариф создан и отправлен на модерацию',
      tariff,
      note: 'Тариф будет активен после одобрения администратором'
    });
  } catch (error) {
    console.error('Ошибка создания тарифа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/tariff/:id - Обновить тариф
router.put('/:id', 
  auth, 
  requireDriver,
  param('id').isMongoId().withMessage('Неверный ID тарифа'),
  tariffValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const tariff = await Tariff.findOne({
        _id: req.params.id,
        driverId: req.user.id
      });
      
      if (!tariff) {
        return res.status(404).json({ error: 'Тариф не найден' });
      }
      
      // Обновляем поля
      Object.assign(tariff, req.body);
      tariff.isApproved = false; // Требует повторного одобрения
      tariff.approvedBy = undefined;
      tariff.approvedAt = undefined;
      
      await tariff.save();
      
      res.json({
        success: true,
        message: 'Тариф обновлен и отправлен на модерацию',
        tariff
      });
    } catch (error) {
      console.error('Ошибка обновления тарифа:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

// DELETE /api/tariff/:id - Деактивировать тариф
router.delete('/:id',
  auth,
  requireDriver,
  param('id').isMongoId().withMessage('Неверный ID тарифа'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const tariff = await Tariff.findOne({
        _id: req.params.id,
        driverId: req.user.id
      });
      
      if (!tariff) {
        return res.status(404).json({ error: 'Тариф не найден' });
      }
      
      await tariff.deactivate();
      
      res.json({
        success: true,
        message: 'Тариф деактивирован'
      });
    } catch (error) {
      console.error('Ошибка деактивации тарифа:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

// === АДМИНСКИЕ МАРШРУТЫ ===

// GET /api/tariff/admin/pending - Получить тарифы на модерации
router.get('/admin/pending', auth, requireAdmin, async (req, res) => {
  try {
    const pendingTariffs = await Tariff.find({
      isApproved: false,
      isActive: true
    }).populate('driverId', 'name email phone');
    
    res.json({
      success: true,
      tariffs: pendingTariffs,
      count: pendingTariffs.length
    });
  } catch (error) {
    console.error('Ошибка получения тарифов на модерации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/tariff/admin/:id/approve - Одобрить тариф
router.post('/admin/:id/approve',
  auth,
  requireAdmin,
  param('id').isMongoId().withMessage('Неверный ID тарифа'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const tariff = await Tariff.findById(req.params.id);
      if (!tariff) {
        return res.status(404).json({ error: 'Тариф не найден' });
      }
      
      await tariff.approve(req.user.id);
      
      res.json({
        success: true,
        message: 'Тариф одобрен',
        tariff
      });
    } catch (error) {
      console.error('Ошибка одобрения тарифа:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

// POST /api/tariff/admin/:id/reject - Отклонить тариф
router.post('/admin/:id/reject',
  auth,
  requireAdmin,
  param('id').isMongoId().withMessage('Неверный ID тарифа'),
  [body('reason').notEmpty().withMessage('Укажите причину отклонения')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const tariff = await Tariff.findById(req.params.id);
      if (!tariff) {
        return res.status(404).json({ error: 'Тариф не найден' });
      }
      
      tariff.isActive = false;
      tariff.adminNotes = req.body.reason;
      await tariff.save();
      
      res.json({
        success: true,
        message: 'Тариф отклонен',
        reason: req.body.reason
      });
    } catch (error) {
      console.error('Ошибка отклонения тарифа:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

// GET /api/tariff/admin/statistics - Статистика по тарифам
router.get('/admin/statistics', auth, requireAdmin, async (req, res) => {
  try {
    const stats = await Tariff.aggregate([
      {
        $group: {
          _id: '$region',
          totalTariffs: { $sum: 1 },
          activeTariffs: {
            $sum: { $cond: [{ $and: ['$isActive', '$isApproved'] }, 1, 0] }
          },
          pendingTariffs: {
            $sum: { $cond: [{ $and: ['$isActive', { $not: '$isApproved' }] }, 1, 0] }
          },
          avgBaseFare: { $avg: '$baseFare' },
          avgPricePerKm: { $avg: '$pricePerKm' },
          avgMinimumFare: { $avg: '$minimumFare' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totalStats = await Tariff.aggregate([
      {
        $group: {
          _id: null,
          totalTariffs: { $sum: 1 },
          activeTariffs: {
            $sum: { $cond: [{ $and: ['$isActive', '$isApproved'] }, 1, 0] }
          },
          pendingTariffs: {
            $sum: { $cond: [{ $and: ['$isActive', { $not: '$isApproved' }] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      byRegion: stats,
      total: totalStats[0] || { totalTariffs: 0, activeTariffs: 0, pendingTariffs: 0 }
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

