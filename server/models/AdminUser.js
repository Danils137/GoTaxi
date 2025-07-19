const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Определение ролей и их иерархии
const ROLES = {
  // Сотрудники GoTaxi
  SUPER_ADMIN: 'super_admin',
  OPS_MANAGER: 'ops_manager', 
  SUPPORT_AGENT: 'support_agent',
  FINANCE_MANAGER: 'finance_manager',
  MARKETING_MANAGER: 'marketing_manager',
  
  // Владельцы автопарков
  FLEET_OWNER: 'fleet_owner',
  FLEET_MANAGER: 'fleet_manager',
  FLEET_DISPATCHER: 'fleet_dispatcher',
  
  // Государственные контролеры
  TAX_INSPECTOR: 'tax_inspector',
  TRANSPORT_REGULATOR: 'transport_regulator',
  SAFETY_INSPECTOR: 'safety_inspector',
  DATA_PROTECTION_OFFICER: 'data_protection_officer',
  
  // Аудиторы
  INTERNAL_AUDITOR: 'internal_auditor',
  COMPLIANCE_OFFICER: 'compliance_officer'
};

// Определение разрешений
const PERMISSIONS = {
  // Управление пользователями
  CREATE_USERS: 'create_users',
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  BLOCK_USERS: 'block_users',
  
  // Управление водителями
  APPROVE_DRIVERS: 'approve_drivers',
  VIEW_DRIVERS: 'view_drivers',
  EDIT_DRIVERS: 'edit_drivers',
  BLOCK_DRIVERS: 'block_drivers',
  VIEW_DRIVER_DOCUMENTS: 'view_driver_documents',
  
  // Управление тарифами
  MODERATE_TARIFFS: 'moderate_tariffs',
  SET_TARIFF_LIMITS: 'set_tariff_limits',
  VIEW_TARIFFS: 'view_tariffs',
  
  // Финансы
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  VIEW_TAX_REPORTS: 'view_tax_reports',
  MANAGE_PAYOUTS: 'manage_payouts',
  EXPORT_FINANCIAL_DATA: 'export_financial_data',
  
  // Система
  SYSTEM_SETTINGS: 'system_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  BACKUP_SYSTEM: 'backup_system',
  
  // Отчетность
  GENERATE_REPORTS: 'generate_reports',
  EXPORT_DATA: 'export_data',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Поддержка
  HANDLE_SUPPORT_TICKETS: 'handle_support_tickets',
  VIEW_USER_PROFILES: 'view_user_profiles',
  
  // Маркетинг
  MANAGE_PROMOTIONS: 'manage_promotions',
  VIEW_MARKETING_ANALYTICS: 'view_marketing_analytics'
};

// Иерархия ролей (уровни доступа)
const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 10,
  [ROLES.OPS_MANAGER]: 8,
  [ROLES.FINANCE_MANAGER]: 7,
  [ROLES.MARKETING_MANAGER]: 6,
  [ROLES.FLEET_OWNER]: 5,
  [ROLES.FLEET_MANAGER]: 4,
  [ROLES.SUPPORT_AGENT]: 4,
  [ROLES.FLEET_DISPATCHER]: 3,
  [ROLES.INTERNAL_AUDITOR]: 6,
  [ROLES.COMPLIANCE_OFFICER]: 5,
  [ROLES.TAX_INSPECTOR]: 4,
  [ROLES.TRANSPORT_REGULATOR]: 4,
  [ROLES.SAFETY_INSPECTOR]: 4,
  [ROLES.DATA_PROTECTION_OFFICER]: 5
};

// Разрешения по ролям
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.OPS_MANAGER]: [
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.APPROVE_DRIVERS,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.EDIT_DRIVERS,
    PERMISSIONS.BLOCK_DRIVERS,
    PERMISSIONS.VIEW_DRIVER_DOCUMENTS,
    PERMISSIONS.MODERATE_TARIFFS,
    PERMISSIONS.VIEW_TARIFFS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.HANDLE_SUPPORT_TICKETS,
    PERMISSIONS.VIEW_USER_PROFILES
  ],
  
  [ROLES.SUPPORT_AGENT]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.BLOCK_DRIVERS,
    PERMISSIONS.VIEW_DRIVER_DOCUMENTS,
    PERMISSIONS.HANDLE_SUPPORT_TICKETS,
    PERMISSIONS.VIEW_USER_PROFILES
  ],
  
  [ROLES.FINANCE_MANAGER]: [
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.MANAGE_PAYOUTS,
    PERMISSIONS.EXPORT_FINANCIAL_DATA,
    PERMISSIONS.MODERATE_TARIFFS,
    PERMISSIONS.SET_TARIFF_LIMITS,
    PERMISSIONS.VIEW_TARIFFS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  
  [ROLES.MARKETING_MANAGER]: [
    PERMISSIONS.MANAGE_PROMOTIONS,
    PERMISSIONS.VIEW_MARKETING_ANALYTICS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.GENERATE_REPORTS
  ],
  
  [ROLES.FLEET_OWNER]: [
    PERMISSIONS.VIEW_DRIVERS, // только своих
    PERMISSIONS.EDIT_DRIVERS, // только своих
    PERMISSIONS.VIEW_DRIVER_DOCUMENTS, // только своих
    PERMISSIONS.VIEW_FINANCIAL_REPORTS, // только своих
    PERMISSIONS.VIEW_TARIFFS, // только своих
    PERMISSIONS.VIEW_ANALYTICS // только своих
  ],
  
  [ROLES.FLEET_MANAGER]: [
    PERMISSIONS.VIEW_DRIVERS, // только своего автопарка
    PERMISSIONS.EDIT_DRIVERS, // только своего автопарка
    PERMISSIONS.VIEW_DRIVER_DOCUMENTS, // только своего автопарка
    PERMISSIONS.VIEW_FINANCIAL_REPORTS, // только своего автопарка
    PERMISSIONS.VIEW_ANALYTICS // только своего автопарка
  ],
  
  [ROLES.FLEET_DISPATCHER]: [
    PERMISSIONS.VIEW_DRIVERS, // только своего автопарка
    PERMISSIONS.VIEW_ANALYTICS // только своего автопарка
  ],
  
  [ROLES.TAX_INSPECTOR]: [
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.EXPORT_FINANCIAL_DATA,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.GENERATE_REPORTS
  ],
  
  [ROLES.TRANSPORT_REGULATOR]: [
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.APPROVE_DRIVERS,
    PERMISSIONS.BLOCK_DRIVERS,
    PERMISSIONS.VIEW_DRIVER_DOCUMENTS,
    PERMISSIONS.SET_TARIFF_LIMITS,
    PERMISSIONS.VIEW_TARIFFS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  
  [ROLES.SAFETY_INSPECTOR]: [
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.VIEW_DRIVER_DOCUMENTS,
    PERMISSIONS.BLOCK_DRIVERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.GENERATE_REPORTS
  ],
  
  [ROLES.DATA_PROTECTION_OFFICER]: [
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_USER_PROFILES,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  [ROLES.INTERNAL_AUDITOR]: [
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  
  [ROLES.COMPLIANCE_OFFICER]: [
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.VIEW_DRIVER_DOCUMENTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS
  ]
};

const AdminUserSchema = new mongoose.Schema({
  // Основная информация
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Роль и разрешения
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true
  },
  
  permissions: [{
    type: String,
    enum: Object.values(PERMISSIONS)
  }],
  
  accessLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 1
  },
  
  // Организационная принадлежность
  organization: {
    type: String,
    required: function() {
      return [ROLES.FLEET_OWNER, ROLES.FLEET_MANAGER, ROLES.FLEET_DISPATCHER,
              ROLES.TAX_INSPECTOR, ROLES.TRANSPORT_REGULATOR, ROLES.SAFETY_INSPECTOR].includes(this.role);
    }
  },
  
  organizationType: {
    type: String,
    enum: ['gotaxi', 'fleet', 'government', 'audit'],
    required: true
  },
  
  // Ограничения доступа
  ipRestrictions: [{
    type: String,
    validate: {
      validator: function(ip) {
        return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip);
      },
      message: 'Неверный формат IP адреса'
    }
  }],
  
  allowedRegions: [{
    type: String,
    enum: ['Riga', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils', 'Rezekne']
  }],
  
  // Безопасность
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: String,
  
  lastLogin: Date,
  
  lastLoginIP: String,
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: Date,
  
  // Статус
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Метаданные
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  
  notes: String,
  
  // Временные ограничения
  accessValidFrom: Date,
  accessValidUntil: Date
}, {
  timestamps: true
});

// Виртуальные поля
AdminUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

AdminUserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Индексы
AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ role: 1 });
AdminUserSchema.index({ organization: 1 });
AdminUserSchema.index({ isActive: 1 });

// Middleware для хеширования пароля
AdminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware для установки разрешений по роли
AdminUserSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    this.permissions = ROLE_PERMISSIONS[this.role] || [];
    this.accessLevel = ROLE_HIERARCHY[this.role] || 1;
  }
  next();
});

// Методы экземпляра
AdminUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

AdminUserSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

AdminUserSchema.methods.hasAnyPermission = function(permissions) {
  return permissions.some(permission => this.permissions.includes(permission));
};

AdminUserSchema.methods.canAccessOrganization = function(organizationId) {
  // Super admin может получить доступ ко всем организациям
  if (this.role === ROLES.SUPER_ADMIN) return true;
  
  // Пользователи GoTaxi могут получить доступ ко всем организациям
  if (this.organizationType === 'gotaxi') return true;
  
  // Остальные только к своей организации
  return this.organization === organizationId;
};

AdminUserSchema.methods.canAccessRegion = function(region) {
  // Если нет ограничений по регионам, доступ разрешен
  if (!this.allowedRegions || this.allowedRegions.length === 0) return true;
  
  return this.allowedRegions.includes(region);
};

AdminUserSchema.methods.incrementLoginAttempts = function() {
  // Если у нас есть предыдущая блокировка и она истекла, сбросить
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Если достигли максимального количества попыток и аккаунт не заблокирован, заблокировать
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 часа
  }
  
  return this.updateOne(updates);
};

AdminUserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Статические методы
AdminUserSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

AdminUserSchema.statics.findByOrganization = function(organization) {
  return this.find({ organization, isActive: true });
};

AdminUserSchema.statics.findWithPermission = function(permission) {
  return this.find({ 
    permissions: permission, 
    isActive: true 
  });
};

// Экспорт констант для использования в других модулях
AdminUserSchema.statics.ROLES = ROLES;
AdminUserSchema.statics.PERMISSIONS = PERMISSIONS;
AdminUserSchema.statics.ROLE_HIERARCHY = ROLE_HIERARCHY;
AdminUserSchema.statics.ROLE_PERMISSIONS = ROLE_PERMISSIONS;

module.exports = mongoose.model('AdminUser', AdminUserSchema);

