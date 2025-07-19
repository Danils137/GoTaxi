const mongoose = require('mongoose');

const ReferralSystemSchema = new mongoose.Schema({
  // Реферер (тот, кто приглашает)
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'referrerType'
  },
  
  referrerType: {
    type: String,
    required: true,
    enum: ['Driver', 'User', 'AdminUser']
  },
  
  // Приглашенный пользователь
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'refereeType'
  },
  
  refereeType: {
    type: String,
    required: true,
    enum: ['Driver', 'User']
  },
  
  // Реферальный код
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 8
  },
  
  // Страна (для статистики по регионам)
  country: {
    type: String,
    required: true,
    length: 2,
    uppercase: true
  },
  
  // Статус реферала
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired'],
    default: 'pending'
  },
  
  // Даты активности
  invitedAt: {
    type: Date,
    default: Date.now
  },
  
  activatedAt: Date, // Когда приглашенный стал активным
  
  completedAt: Date, // Когда выполнены условия для награды
  
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней
    }
  },
  
  // Условия для получения награды
  requirements: {
    // Для водителей
    ridesCompleted: {
      type: Number,
      default: 0
    },
    
    ridesRequired: {
      type: Number,
      default: 5 // Приглашенный водитель должен выполнить 5 поездок
    },
    
    // Для пользователей
    ridesOrdered: {
      type: Number,
      default: 0
    },
    
    ridesOrderedRequired: {
      type: Number,
      default: 3 // Приглашенный пользователь должен заказать 3 поездки
    },
    
    // Минимальная сумма поездок
    totalAmount: {
      type: Number,
      default: 0
    },
    
    minimumAmount: {
      type: Number,
      default: 50 // Минимум €50 поездок
    }
  },
  
  // Награды
  rewards: {
    // Для реферера
    referrerReward: {
      type: {
        type: String,
        enum: ['bonus_rides', 'subscription_discount', 'cash_bonus', 'premium_features'],
        default: 'bonus_rides'
      },
      
      value: {
        type: Number,
        default: 10 // 10 бонусных поездок или 10% скидка
      },
      
      currency: String,
      
      claimed: {
        type: Boolean,
        default: false
      },
      
      claimedAt: Date
    },
    
    // Для приглашенного
    refereeReward: {
      type: {
        type: String,
        enum: ['welcome_bonus', 'free_rides', 'subscription_trial'],
        default: 'welcome_bonus'
      },
      
      value: {
        type: Number,
        default: 5 // €5 бонус или 5 бесплатных поездок
      },
      
      currency: String,
      
      claimed: {
        type: Boolean,
        default: false
      },
      
      claimedAt: Date
    }
  },
  
  // Метаданные
  source: {
    type: String,
    enum: ['app', 'website', 'social_media', 'word_of_mouth', 'promotion'],
    default: 'app'
  },
  
  campaign: String, // ID рекламной кампании
  
  // Дополнительная информация
  notes: String,
  
  // Статистика взаимодействий
  interactions: [{
    type: {
      type: String,
      enum: ['invite_sent', 'app_downloaded', 'registration_completed', 'first_ride', 'milestone_reached']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Индексы
ReferralSystemSchema.index({ referrerId: 1, referrerType: 1 });
ReferralSystemSchema.index({ refereeId: 1, refereeType: 1 });
ReferralSystemSchema.index({ referralCode: 1 });
ReferralSystemSchema.index({ country: 1, status: 1 });
ReferralSystemSchema.index({ status: 1, expiresAt: 1 });
ReferralSystemSchema.index({ createdAt: -1 });

// Составной индекс для поиска активных рефералов
ReferralSystemSchema.index({ 
  referrerId: 1, 
  status: 1, 
  expiresAt: 1 
});

// Виртуальные поля
ReferralSystemSchema.virtual('referrer', {
  ref: function() { return this.referrerType; },
  localField: 'referrerId',
  foreignField: '_id',
  justOne: true
});

ReferralSystemSchema.virtual('referee', {
  ref: function() { return this.refereeType; },
  localField: 'refereeId',
  foreignField: '_id',
  justOne: true
});

ReferralSystemSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

ReferralSystemSchema.virtual('isCompleted').get(function() {
  if (this.refereeType === 'Driver') {
    return this.requirements.ridesCompleted >= this.requirements.ridesRequired &&
           this.requirements.totalAmount >= this.requirements.minimumAmount;
  } else {
    return this.requirements.ridesOrdered >= this.requirements.ridesOrderedRequired &&
           this.requirements.totalAmount >= this.requirements.minimumAmount;
  }
});

ReferralSystemSchema.virtual('progress').get(function() {
  if (this.refereeType === 'Driver') {
    const ridesProgress = (this.requirements.ridesCompleted / this.requirements.ridesRequired) * 100;
    const amountProgress = (this.requirements.totalAmount / this.requirements.minimumAmount) * 100;
    return Math.min(Math.min(ridesProgress, amountProgress), 100);
  } else {
    const ridesProgress = (this.requirements.ridesOrdered / this.requirements.ridesOrderedRequired) * 100;
    const amountProgress = (this.requirements.totalAmount / this.requirements.minimumAmount) * 100;
    return Math.min(Math.min(ridesProgress, amountProgress), 100);
  }
});

// Методы экземпляра
ReferralSystemSchema.methods.updateProgress = function(rideData) {
  if (this.status !== 'active') return Promise.resolve(this);
  
  if (this.refereeType === 'Driver') {
    this.requirements.ridesCompleted += 1;
  } else {
    this.requirements.ridesOrdered += 1;
  }
  
  this.requirements.totalAmount += rideData.amount || 0;
  
  // Добавить взаимодействие
  this.interactions.push({
    type: this.refereeType === 'Driver' ? 'ride_completed' : 'ride_ordered',
    details: {
      rideId: rideData.rideId,
      amount: rideData.amount
    }
  });
  
  // Проверить завершение
  if (this.isCompleted && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
    
    this.interactions.push({
      type: 'milestone_reached',
      details: {
        requirements: this.requirements
      }
    });
  }
  
  return this.save();
};

ReferralSystemSchema.methods.activate = function() {
  if (this.status === 'pending') {
    this.status = 'active';
    this.activatedAt = new Date();
    
    this.interactions.push({
      type: 'registration_completed'
    });
    
    return this.save();
  }
  return Promise.resolve(this);
};

ReferralSystemSchema.methods.claimReferrerReward = function() {
  if (this.status === 'completed' && !this.rewards.referrerReward.claimed) {
    this.rewards.referrerReward.claimed = true;
    this.rewards.referrerReward.claimedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

ReferralSystemSchema.methods.claimRefereeReward = function() {
  if (this.status === 'active' && !this.rewards.refereeReward.claimed) {
    this.rewards.refereeReward.claimed = true;
    this.rewards.refereeReward.claimedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

ReferralSystemSchema.methods.addInteraction = function(type, details = {}) {
  this.interactions.push({
    type,
    details
  });
  return this.save();
};

// Статические методы
ReferralSystemSchema.statics.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

ReferralSystemSchema.statics.createReferral = async function(referrerId, referrerType, refereeId, refereeType, country) {
  let referralCode;
  let isUnique = false;
  
  // Генерировать уникальный код
  while (!isUnique) {
    referralCode = this.generateReferralCode();
    const existing = await this.findOne({ referralCode });
    if (!existing) isUnique = true;
  }
  
  const referral = new this({
    referrerId,
    referrerType,
    refereeId,
    refereeType,
    referralCode,
    country
  });
  
  return referral.save();
};

ReferralSystemSchema.statics.findByReferrer = function(referrerId, referrerType) {
  return this.find({ 
    referrerId, 
    referrerType 
  })
  .populate('referee')
  .sort({ createdAt: -1 });
};

ReferralSystemSchema.statics.findByCode = function(referralCode) {
  return this.findOne({ 
    referralCode: referralCode.toUpperCase(),
    status: { $in: ['pending', 'active'] },
    expiresAt: { $gt: new Date() }
  })
  .populate('referrer');
};

ReferralSystemSchema.statics.getStatsByReferrer = function(referrerId, referrerType) {
  return this.aggregate([
    {
      $match: { referrerId, referrerType }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRewards: { $sum: '$rewards.referrerReward.value' }
      }
    }
  ]);
};

ReferralSystemSchema.statics.getStatsByCountry = function(country) {
  return this.aggregate([
    {
      $match: { country }
    },
    {
      $group: {
        _id: {
          status: '$status',
          referrerType: '$referrerType'
        },
        count: { $sum: 1 },
        totalRewards: { $sum: '$rewards.referrerReward.value' }
      }
    }
  ]);
};

ReferralSystemSchema.statics.getTopReferrers = function(country, limit = 10) {
  const matchStage = country ? { country } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          referrerId: '$referrerId',
          referrerType: '$referrerType'
        },
        totalReferrals: { $sum: 1 },
        completedReferrals: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalRewards: { $sum: '$rewards.referrerReward.value' }
      }
    },
    { $sort: { completedReferrals: -1, totalReferrals: -1 } },
    { $limit: limit }
  ]);
};

ReferralSystemSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      status: { $in: ['pending', 'active'] },
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// Middleware
ReferralSystemSchema.pre('save', function(next) {
  // Автоматически истечь, если время вышло
  if (this.expiresAt < new Date() && ['pending', 'active'].includes(this.status)) {
    this.status = 'expired';
  }
  
  next();
});

// Автоматическая очистка истекших рефералов (запускается раз в день)
ReferralSystemSchema.statics.scheduleCleanup = function() {
  setInterval(async () => {
    try {
      await this.cleanupExpired();
      console.log('Expired referrals cleaned up');
    } catch (error) {
      console.error('Error cleaning up expired referrals:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 часа
};

module.exports = mongoose.model('ReferralSystem', ReferralSystemSchema);

