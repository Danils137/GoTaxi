const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const AuditLog = require('../models/AuditLog');

// Middleware для проверки JWT токена
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен доступа не предоставлен'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }
    
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Аккаунт деактивирован'
      });
    }
    
    if (admin.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Аккаунт временно заблокирован'
      });
    }
    
    // Проверка срока действия доступа
    if (admin.accessValidUntil && admin.accessValidUntil < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Срок действия доступа истек'
      });
    }
    
    // Проверка IP ограничений
    if (admin.ipRestrictions && admin.ipRestrictions.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!admin.ipRestrictions.includes(clientIP)) {
        // Логирование подозрительной активности
        await AuditLog.create({
          userId: admin._id,
          action: 'UNAUTHORIZED_IP_ACCESS',
          details: {
            attemptedIP: clientIP,
            allowedIPs: admin.ipRestrictions
          },
          ip: clientIP,
          userAgent: req.get('User-Agent'),
          severity: 'HIGH'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Доступ с данного IP адреса запрещен'
        });
      }
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Токен истек'
      });
    }
    
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Middleware для проверки разрешений
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }
      
      if (!admin.hasPermission(permission)) {
        // Логирование попытки несанкционированного доступа
        await AuditLog.create({
          userId: admin._id,
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          details: {
            requiredPermission: permission,
            userPermissions: admin.permissions,
            endpoint: req.originalUrl,
            method: req.method
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'MEDIUM'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Недостаточно прав доступа',
          requiredPermission: permission
        });
      }
      
      // Логирование успешного доступа
      await AuditLog.create({
        userId: admin._id,
        action: permission,
        details: {
          endpoint: req.originalUrl,
          method: req.method,
          body: req.method !== 'GET' ? req.body : undefined
        },
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'LOW'
      });
      
      next();
    } catch (error) {
      console.error('Ошибка проверки разрешений:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  };
};

// Middleware для проверки нескольких разрешений (любое из них)
const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }
      
      if (!admin.hasAnyPermission(permissions)) {
        await AuditLog.create({
          userId: admin._id,
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          details: {
            requiredPermissions: permissions,
            userPermissions: admin.permissions,
            endpoint: req.originalUrl,
            method: req.method
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'MEDIUM'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Недостаточно прав доступа',
          requiredPermissions: permissions
        });
      }
      
      next();
    } catch (error) {
      console.error('Ошибка проверки разрешений:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  };
};

// Middleware для проверки роли
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }
      
      if (!roleArray.includes(admin.role)) {
        await AuditLog.create({
          userId: admin._id,
          action: 'UNAUTHORIZED_ROLE_ACCESS',
          details: {
            requiredRoles: roleArray,
            userRole: admin.role,
            endpoint: req.originalUrl,
            method: req.method
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'MEDIUM'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Недостаточный уровень доступа',
          requiredRoles: roleArray
        });
      }
      
      next();
    } catch (error) {
      console.error('Ошибка проверки роли:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  };
};

// Middleware для проверки доступа к организации
const requireOrganizationAccess = (organizationField = 'organizationId') => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      const organizationId = req.params[organizationField] || req.body[organizationField] || req.query[organizationField];
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }
      
      if (!admin.canAccessOrganization(organizationId)) {
        await AuditLog.create({
          userId: admin._id,
          action: 'UNAUTHORIZED_ORGANIZATION_ACCESS',
          details: {
            requestedOrganization: organizationId,
            userOrganization: admin.organization,
            endpoint: req.originalUrl,
            method: req.method
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'HIGH'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Доступ к данной организации запрещен'
        });
      }
      
      next();
    } catch (error) {
      console.error('Ошибка проверки доступа к организации:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  };
};

// Middleware для проверки доступа к региону
const requireRegionAccess = (regionField = 'region') => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      const region = req.params[regionField] || req.body[regionField] || req.query[regionField];
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }
      
      if (region && !admin.canAccessRegion(region)) {
        await AuditLog.create({
          userId: admin._id,
          action: 'UNAUTHORIZED_REGION_ACCESS',
          details: {
            requestedRegion: region,
            allowedRegions: admin.allowedRegions,
            endpoint: req.originalUrl,
            method: req.method
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'MEDIUM'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Доступ к данному региону запрещен'
        });
      }
      
      next();
    } catch (error) {
      console.error('Ошибка проверки доступа к региону:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  };
};

// Middleware для ограничения по времени
const requireTimeAccess = () => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      const now = new Date();
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }
      
      if (admin.accessValidFrom && admin.accessValidFrom > now) {
        return res.status(403).json({
          success: false,
          message: 'Доступ еще не активирован'
        });
      }
      
      if (admin.accessValidUntil && admin.accessValidUntil < now) {
        return res.status(403).json({
          success: false,
          message: 'Срок действия доступа истек'
        });
      }
      
      next();
    } catch (error) {
      console.error('Ошибка проверки временного доступа:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  };
};

// Middleware для обновления времени последнего входа
const updateLastLogin = async (req, res, next) => {
  try {
    const admin = req.admin;
    
    if (admin) {
      await AdminUser.findByIdAndUpdate(admin._id, {
        lastLogin: new Date(),
        lastLoginIP: req.ip
      });
    }
    
    next();
  } catch (error) {
    console.error('Ошибка обновления времени входа:', error);
    next(); // Не блокируем запрос из-за этой ошибки
  }
};

// Комбинированный middleware для полной проверки
const requireFullAccess = (permission, options = {}) => {
  const middlewares = [authenticateAdmin];
  
  if (options.updateLogin !== false) {
    middlewares.push(updateLastLogin);
  }
  
  if (options.timeAccess !== false) {
    middlewares.push(requireTimeAccess());
  }
  
  if (permission) {
    middlewares.push(requirePermission(permission));
  }
  
  if (options.organization) {
    middlewares.push(requireOrganizationAccess(options.organization));
  }
  
  if (options.region) {
    middlewares.push(requireRegionAccess(options.region));
  }
  
  return middlewares;
};

module.exports = {
  authenticateAdmin,
  requirePermission,
  requireAnyPermission,
  requireRole,
  requireOrganizationAccess,
  requireRegionAccess,
  requireTimeAccess,
  updateLastLogin,
  requireFullAccess
};

