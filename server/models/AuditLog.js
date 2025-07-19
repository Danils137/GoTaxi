const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  // Пользователь, выполнивший действие
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  
  // Тип действия
  action: {
    type: String,
    required: true,
    enum: [
      // Управление пользователями
      'CREATE_USER', 'VIEW_USER', 'EDIT_USER', 'DELETE_USER', 'BLOCK_USER', 'UNBLOCK_USER',
      
      // Управление водителями
      'APPROVE_DRIVER', 'REJECT_DRIVER', 'VIEW_DRIVER', 'EDIT_DRIVER', 'BLOCK_DRIVER', 'UNBLOCK_DRIVER',
      'VIEW_DRIVER_DOCUMENTS', 'UPLOAD_DRIVER_DOCUMENT', 'APPROVE_DRIVER_DOCUMENT', 'REJECT_DRIVER_DOCUMENT',
      
      // Управление тарифами
      'MODERATE_TARIFF', 'APPROVE_TARIFF', 'REJECT_TARIFF', 'SET_TARIFF_LIMIT', 'VIEW_TARIFF',
      
      // Финансовые операции
      'VIEW_FINANCIAL_REPORT', 'EXPORT_FINANCIAL_DATA', 'VIEW_TAX_REPORT', 'MANAGE_PAYOUT',
      'PROCESS_PAYMENT', 'REFUND_PAYMENT',
      
      // Системные операции
      'CHANGE_SYSTEM_SETTINGS', 'VIEW_AUDIT_LOG', 'BACKUP_SYSTEM', 'RESTORE_SYSTEM',
      'UPDATE_SYSTEM', 'RESTART_SERVICE',
      
      // Отчетность
      'GENERATE_REPORT', 'EXPORT_DATA', 'VIEW_ANALYTICS', 'SCHEDULE_REPORT',
      
      // Поддержка
      'HANDLE_SUPPORT_TICKET', 'VIEW_USER_PROFILE', 'SEND_NOTIFICATION',
      
      // Маркетинг
      'CREATE_PROMOTION', 'EDIT_PROMOTION', 'DELETE_PROMOTION', 'VIEW_MARKETING_ANALYTICS',
      
      // Безопасность
      'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_CHANGE', 'ENABLE_2FA', 'DISABLE_2FA',
      'UNAUTHORIZED_ACCESS_ATTEMPT', 'UNAUTHORIZED_IP_ACCESS', 'UNAUTHORIZED_ROLE_ACCESS',
      'UNAUTHORIZED_ORGANIZATION_ACCESS', 'UNAUTHORIZED_REGION_ACCESS',
      
      // Административные действия
      'CREATE_ADMIN', 'EDIT_ADMIN', 'DELETE_ADMIN', 'CHANGE_ADMIN_ROLE', 'RESET_ADMIN_PASSWORD'
    ]
  },
  
  // Категория действия для группировки
  category: {
    type: String,
    enum: ['USER_MANAGEMENT', 'DRIVER_MANAGEMENT', 'FINANCIAL', 'SYSTEM', 'SECURITY', 'SUPPORT', 'ANALYTICS'],
    required: true
  },
  
  // Уровень важности
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  
  // Статус операции
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS'
  },
  
  // Детали действия
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Объект, над которым выполнялось действие
  targetType: {
    type: String,
    enum: ['User', 'Driver', 'AdminUser', 'Tariff', 'Ride', 'Payment', 'Report', 'System', 'Promotion']
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  // Данные до изменения (для отслеживания изменений)
  oldValues: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Новые данные после изменения
  newValues: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Технические данные
  ip: {
    type: String,
    required: true
  },
  
  userAgent: {
    type: String,
    required: true
  },
  
  // HTTP данные запроса
  httpMethod: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  
  endpoint: {
    type: String
  },
  
  requestBody: {
    type: mongoose.Schema.Types.Mixed
  },
  
  responseStatus: {
    type: Number
  },
  
  // Время выполнения операции в миллисекундах
  executionTime: {
    type: Number
  },
  
  // Дополнительные метаданные
  sessionId: String,
  
  correlationId: String, // Для связи связанных операций
  
  // Геолокация (если доступна)
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Флаги для специальных случаев
  isAutomated: {
    type: Boolean,
    default: false
  },
  
  requiresReview: {
    type: Boolean,
    default: false
  },
  
  isReviewed: {
    type: Boolean,
    default: false
  },
  
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  
  reviewedAt: Date,
  
  reviewNotes: String
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, createdAt: -1 });
AuditLogSchema.index({ severity: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ ip: 1, createdAt: -1 });
AuditLogSchema.index({ correlationId: 1 });
AuditLogSchema.index({ requiresReview: 1, isReviewed: 1 });

// Составной индекс для поиска по пользователю и времени
AuditLogSchema.index({ userId: 1, createdAt: -1, action: 1 });

// TTL индекс для автоматического удаления старых логов (через 2 года)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

// Виртуальные поля
AuditLogSchema.virtual('user', {
  ref: 'AdminUser',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Middleware для автоматического определения категории
AuditLogSchema.pre('save', function(next) {
  if (!this.category) {
    const action = this.action;
    
    if (action.includes('USER')) {
      this.category = 'USER_MANAGEMENT';
    } else if (action.includes('DRIVER')) {
      this.category = 'DRIVER_MANAGEMENT';
    } else if (action.includes('FINANCIAL') || action.includes('PAYMENT') || action.includes('PAYOUT')) {
      this.category = 'FINANCIAL';
    } else if (action.includes('SYSTEM') || action.includes('BACKUP') || action.includes('SETTINGS')) {
      this.category = 'SYSTEM';
    } else if (action.includes('UNAUTHORIZED') || action.includes('LOGIN') || action.includes('PASSWORD') || action.includes('2FA')) {
      this.category = 'SECURITY';
    } else if (action.includes('SUPPORT') || action.includes('TICKET')) {
      this.category = 'SUPPORT';
    } else if (action.includes('REPORT') || action.includes('ANALYTICS') || action.includes('EXPORT')) {
      this.category = 'ANALYTICS';
    } else {
      this.category = 'SYSTEM';
    }
  }
  
  // Автоматическое определение уровня важности
  if (!this.severity || this.severity === 'LOW') {
    const action = this.action;
    
    if (action.includes('UNAUTHORIZED') || action.includes('FAILED') || action.includes('DELETE')) {
      this.severity = 'HIGH';
    } else if (action.includes('BLOCK') || action.includes('REJECT') || action.includes('CHANGE') || action.includes('EDIT')) {
      this.severity = 'MEDIUM';
    } else if (action.includes('CRITICAL') || action.includes('SYSTEM')) {
      this.severity = 'CRITICAL';
    }
  }
  
  // Определение необходимости ревью
  if (this.severity === 'HIGH' || this.severity === 'CRITICAL') {
    this.requiresReview = true;
  }
  
  next();
});

// Статические методы
AuditLogSchema.statics.findByUser = function(userId, limit = 100) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email role');
};

AuditLogSchema.statics.findByAction = function(action, limit = 100) {
  return this.find({ action })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email role');
};

AuditLogSchema.statics.findBySeverity = function(severity, limit = 100) {
  return this.find({ severity })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email role');
};

AuditLogSchema.statics.findSecurityEvents = function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    category: 'SECURITY',
    createdAt: { $gte: since }
  })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email role');
};

AuditLogSchema.statics.findFailedLogins = function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    action: 'FAILED_LOGIN',
    createdAt: { $gte: since }
  })
    .sort({ createdAt: -1 });
};

AuditLogSchema.statics.findUnauthorizedAttempts = function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    action: { $regex: /^UNAUTHORIZED/ },
    createdAt: { $gte: since }
  })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email role');
};

AuditLogSchema.statics.getStatsByUser = function(userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        lastAction: { $max: '$createdAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

AuditLogSchema.statics.getStatsByAction = function(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        lastOccurrence: { $max: '$createdAt' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Методы экземпляра
AuditLogSchema.methods.markAsReviewed = function(reviewerId, notes) {
  this.isReviewed = true;
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);

