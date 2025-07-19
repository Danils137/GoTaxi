const mongoose = require('mongoose');

const tariffSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Базовые тарифы в евро
  baseFare: {
    type: Number,
    required: true,
    min: 0,
    default: 2.50,
    description: 'Базовый тариф за посадку (€)'
  },
  
  pricePerKm: {
    type: Number,
    required: true,
    min: 0,
    default: 1.20,
    description: 'Цена за километр (€)'
  },
  
  pricePerMinute: {
    type: Number,
    required: true,
    min: 0,
    default: 0.30,
    description: 'Цена за минуту ожидания/простоя (€)'
  },
  
  minimumFare: {
    type: Number,
    required: true,
    min: 0,
    default: 5.00,
    description: 'Минимальная стоимость поездки (€)'
  },
  
  // Дополнительные тарифы
  nightSurcharge: {
    type: Number,
    default: 0.50,
    min: 0,
    description: 'Ночная надбавка за км (€) с 22:00 до 06:00'
  },
  
  weekendSurcharge: {
    type: Number,
    default: 0.20,
    min: 0,
    description: 'Надбавка за выходные дни за км (€)'
  },
  
  airportSurcharge: {
    type: Number,
    default: 2.00,
    min: 0,
    description: 'Надбавка за поездки из/в аэропорт (€)'
  },
  
  // Настройки валюты и региона
  currency: {
    type: String,
    required: true,
    default: 'EUR',
    enum: ['EUR'],
    description: 'Валюта (только евро для Европы)'
  },
  
  region: {
    type: String,
    required: true,
    default: 'Riga',
    enum: ['Riga', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils', 'Other'],
    description: 'Регион работы'
  },
  
  // Временные ограничения
  validFrom: {
    type: Date,
    default: Date.now,
    description: 'Дата начала действия тарифа'
  },
  
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 год
    description: 'Дата окончания действия тарифа'
  },
  
  // Статус и настройки
  isActive: {
    type: Boolean,
    default: true,
    description: 'Активен ли тариф'
  },
  
  isApproved: {
    type: Boolean,
    default: false,
    description: 'Одобрен ли тариф администрацией'
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: 'Кто одобрил тариф'
  },
  
  approvedAt: {
    type: Date,
    description: 'Когда одобрен тариф'
  },
  
  // Описание и комментарии
  description: {
    type: String,
    maxlength: 500,
    description: 'Описание тарифа'
  },
  
  adminNotes: {
    type: String,
    maxlength: 1000,
    description: 'Заметки администратора'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Индексы для оптимизации запросов
tariffSchema.index({ driverId: 1, isActive: 1 });
tariffSchema.index({ region: 1, isActive: 1, isApproved: 1 });
tariffSchema.index({ validFrom: 1, validUntil: 1 });

// Виртуальные поля
tariffSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.isApproved && 
         this.validFrom <= now && 
         this.validUntil >= now;
});

// Методы экземпляра
tariffSchema.methods.calculateFare = function(distance, duration, options = {}) {
  const { isNight = false, isWeekend = false, isAirport = false } = options;
  
  let baseCost = this.baseFare;
  let distanceCost = distance * this.pricePerKm;
  let timeCost = duration * this.pricePerMinute;
  
  // Ночная надбавка
  if (isNight) {
    distanceCost += distance * this.nightSurcharge;
  }
  
  // Надбавка за выходные
  if (isWeekend) {
    distanceCost += distance * this.weekendSurcharge;
  }
  
  // Надбавка за аэропорт
  if (isAirport) {
    baseCost += this.airportSurcharge;
  }
  
  const totalCost = baseCost + distanceCost + timeCost;
  
  return {
    baseFare: this.baseFare,
    distanceCost: parseFloat(distanceCost.toFixed(2)),
    timeCost: parseFloat(timeCost.toFixed(2)),
    surcharges: {
      night: isNight ? parseFloat((distance * this.nightSurcharge).toFixed(2)) : 0,
      weekend: isWeekend ? parseFloat((distance * this.weekendSurcharge).toFixed(2)) : 0,
      airport: isAirport ? this.airportSurcharge : 0
    },
    subtotal: parseFloat(totalCost.toFixed(2)),
    total: parseFloat(Math.max(totalCost, this.minimumFare).toFixed(2)),
    currency: this.currency,
    minimumApplied: totalCost < this.minimumFare
  };
};

tariffSchema.methods.approve = function(adminId) {
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

tariffSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Статические методы
tariffSchema.statics.findActiveForDriver = function(driverId) {
  return this.findOne({
    driverId,
    isActive: true,
    isApproved: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  });
};

tariffSchema.statics.findByRegion = function(region, onlyApproved = true) {
  const query = {
    region,
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  };
  
  if (onlyApproved) {
    query.isApproved = true;
  }
  
  return this.find(query).populate('driverId', 'name email phone');
};

tariffSchema.statics.getAverageTariffs = function(region) {
  return this.aggregate([
    {
      $match: {
        region,
        isActive: true,
        isApproved: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      }
    },
    {
      $group: {
        _id: '$region',
        avgBaseFare: { $avg: '$baseFare' },
        avgPricePerKm: { $avg: '$pricePerKm' },
        avgPricePerMinute: { $avg: '$pricePerMinute' },
        avgMinimumFare: { $avg: '$minimumFare' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Middleware для валидации
tariffSchema.pre('save', function(next) {
  // Проверяем, что validUntil больше validFrom
  if (this.validUntil <= this.validFrom) {
    return next(new Error('Дата окончания должна быть больше даты начала'));
  }
  
  // Проверяем разумность тарифов
  if (this.baseFare > 50) {
    return next(new Error('Базовый тариф не может превышать 50€'));
  }
  
  if (this.pricePerKm > 10) {
    return next(new Error('Цена за километр не может превышать 10€'));
  }
  
  if (this.pricePerMinute > 2) {
    return next(new Error('Цена за минуту не может превышать 2€'));
  }
  
  next();
});

// Middleware для логирования изменений
tariffSchema.post('save', function(doc) {
  console.log(`Тариф ${doc._id} сохранен для водителя ${doc.driverId}`);
});

module.exports = mongoose.model('Tariff', tariffSchema);

