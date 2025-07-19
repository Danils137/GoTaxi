const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  // Основная информация о стране
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 2,
    match: /^[A-Z]{2}$/
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  nameLocal: {
    type: String,
    required: true,
    trim: true
  },
  
  // Валюта и экономика
  currency: {
    code: {
      type: String,
      required: true,
      uppercase: true,
      length: 3
    },
    symbol: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  
  // Языки
  languages: [{
    code: {
      type: String,
      required: true,
      lowercase: true,
      length: 2
    },
    name: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // Временная зона
  timezone: {
    type: String,
    required: true
  },
  
  // Географические данные
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  
  // Регулирование такси
  taxiRegulations: {
    licenseRequired: {
      type: Boolean,
      default: true
    },
    
    insuranceRequired: {
      type: Boolean,
      default: true
    },
    
    vehicleInspectionRequired: {
      type: Boolean,
      default: true
    },
    
    backgroundCheckRequired: {
      type: Boolean,
      default: true
    },
    
    requiredDocuments: [{
      type: String,
      enum: [
        'driving_license',
        'taxi_license', 
        'vehicle_registration',
        'insurance_certificate',
        'medical_certificate',
        'criminal_background_check',
        'vehicle_inspection_certificate',
        'tax_certificate'
      ]
    }],
    
    minimumAge: {
      type: Number,
      default: 21
    },
    
    minimumExperience: {
      type: Number, // в годах
      default: 2
    }
  },
  
  // Ценообразование подписок
  subscriptionPricing: {
    driver: {
      monthly: {
        type: Number,
        default: 9.99
      },
      yearly: {
        type: Number,
        default: 99.99
      },
      currency: {
        type: String,
        default: function() {
          return this.currency.code;
        }
      }
    },
    
    company: {
      monthly: {
        type: Number,
        default: 49.99
      },
      yearly: {
        type: Number,
        default: 499.99
      },
      currency: {
        type: String,
        default: function() {
          return this.currency.code;
        }
      }
    },
    
    enterprise: {
      monthly: {
        type: Number,
        default: 199.99
      },
      yearly: {
        type: Number,
        default: 1999.99
      },
      currency: {
        type: String,
        default: function() {
          return this.currency.code;
        }
      }
    }
  },
  
  // Налогообложение
  taxation: {
    vatRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 21
    },
    
    taxReportingRequired: {
      type: Boolean,
      default: true
    },
    
    taxReportingFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'quarterly'
    }
  },
  
  // Статус в системе
  isActive: {
    type: Boolean,
    default: true
  },
  
  isLaunched: {
    type: Boolean,
    default: false
  },
  
  launchDate: Date,
  
  // Приоритет запуска (1 = высший)
  launchPriority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Статистика
  statistics: {
    totalDrivers: {
      type: Number,
      default: 0
    },
    
    totalCompanies: {
      type: Number,
      default: 0
    },
    
    totalUsers: {
      type: Number,
      default: 0
    },
    
    totalRides: {
      type: Number,
      default: 0
    },
    
    monthlyRevenue: {
      type: Number,
      default: 0
    }
  },
  
  // Контактная информация
  supportContact: {
    email: String,
    phone: String,
    address: String
  },
  
  // Настройки локализации
  localization: {
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '24h'
    },
    
    distanceUnit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    },
    
    numberFormat: {
      decimalSeparator: {
        type: String,
        default: ','
      },
      thousandsSeparator: {
        type: String,
        default: ' '
      }
    }
  },
  
  // Метаданные
  notes: String,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  }
}, {
  timestamps: true
});

// Индексы
CountrySchema.index({ code: 1 });
CountrySchema.index({ isActive: 1, isLaunched: 1 });
CountrySchema.index({ launchPriority: 1 });

// Виртуальные поля
CountrySchema.virtual('fullName').get(function() {
  return `${this.name} (${this.code})`;
});

CountrySchema.virtual('defaultLanguage').get(function() {
  return this.languages.find(lang => lang.isDefault) || this.languages[0];
});

CountrySchema.virtual('formattedCurrency').get(function() {
  return `${this.currency.symbol} ${this.currency.code}`;
});

// Методы экземпляра
CountrySchema.methods.formatPrice = function(amount) {
  const { decimalSeparator, thousandsSeparator } = this.localization.numberFormat;
  
  const formatted = amount
    .toFixed(2)
    .replace('.', decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
  return `${this.currency.symbol}${formatted}`;
};

CountrySchema.methods.getSubscriptionPrice = function(type, period = 'monthly') {
  const pricing = this.subscriptionPricing[type];
  if (!pricing) return null;
  
  return {
    amount: pricing[period],
    currency: pricing.currency,
    formatted: this.formatPrice(pricing[period])
  };
};

CountrySchema.methods.updateStatistics = function(stats) {
  Object.keys(stats).forEach(key => {
    if (this.statistics[key] !== undefined) {
      this.statistics[key] = stats[key];
    }
  });
  
  return this.save();
};

CountrySchema.methods.addRequiredDocument = function(documentType) {
  if (!this.taxiRegulations.requiredDocuments.includes(documentType)) {
    this.taxiRegulations.requiredDocuments.push(documentType);
    return this.save();
  }
  return Promise.resolve(this);
};

CountrySchema.methods.removeRequiredDocument = function(documentType) {
  const index = this.taxiRegulations.requiredDocuments.indexOf(documentType);
  if (index > -1) {
    this.taxiRegulations.requiredDocuments.splice(index, 1);
    return this.save();
  }
  return Promise.resolve(this);
};

// Статические методы
CountrySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

CountrySchema.statics.findLaunched = function() {
  return this.find({ isActive: true, isLaunched: true }).sort({ name: 1 });
};

CountrySchema.statics.findByLaunchPriority = function() {
  return this.find({ isActive: true }).sort({ launchPriority: 1, name: 1 });
};

CountrySchema.statics.findByCurrency = function(currencyCode) {
  return this.find({ 
    'currency.code': currencyCode.toUpperCase(),
    isActive: true 
  });
};

CountrySchema.statics.getStatsSummary = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalCountries: { $sum: 1 },
        launchedCountries: {
          $sum: { $cond: ['$isLaunched', 1, 0] }
        },
        totalDrivers: { $sum: '$statistics.totalDrivers' },
        totalCompanies: { $sum: '$statistics.totalCompanies' },
        totalUsers: { $sum: '$statistics.totalUsers' },
        totalRides: { $sum: '$statistics.totalRides' },
        totalRevenue: { $sum: '$statistics.monthlyRevenue' }
      }
    }
  ]);
};

CountrySchema.statics.getTopCountries = function(limit = 10) {
  return this.find({ isActive: true, isLaunched: true })
    .sort({ 'statistics.totalRides': -1 })
    .limit(limit)
    .select('name code statistics currency');
};

// Middleware
CountrySchema.pre('save', function(next) {
  // Убедиться, что есть хотя бы один язык по умолчанию
  if (this.languages.length > 0) {
    const hasDefault = this.languages.some(lang => lang.isDefault);
    if (!hasDefault) {
      this.languages[0].isDefault = true;
    }
  }
  
  // Установить валюту для подписок
  if (this.isModified('currency')) {
    this.subscriptionPricing.driver.currency = this.currency.code;
    this.subscriptionPricing.company.currency = this.currency.code;
    this.subscriptionPricing.enterprise.currency = this.currency.code;
  }
  
  next();
});

// Предустановленные страны
CountrySchema.statics.seedCountries = async function() {
  const countries = [
    {
      code: 'LV',
      name: 'Latvia',
      nameLocal: 'Latvija',
      currency: { code: 'EUR', symbol: '€', name: 'Euro' },
      languages: [
        { code: 'lv', name: 'Latvian', isDefault: true },
        { code: 'ru', name: 'Russian', isDefault: false },
        { code: 'en', name: 'English', isDefault: false }
      ],
      timezone: 'Europe/Riga',
      coordinates: { latitude: 56.9496, longitude: 24.1052 },
      isLaunched: true,
      launchPriority: 1,
      launchDate: new Date()
    },
    {
      code: 'LT',
      name: 'Lithuania',
      nameLocal: 'Lietuva',
      currency: { code: 'EUR', symbol: '€', name: 'Euro' },
      languages: [
        { code: 'lt', name: 'Lithuanian', isDefault: true },
        { code: 'ru', name: 'Russian', isDefault: false },
        { code: 'en', name: 'English', isDefault: false }
      ],
      timezone: 'Europe/Vilnius',
      coordinates: { latitude: 55.1694, longitude: 23.8813 },
      launchPriority: 2
    },
    {
      code: 'EE',
      name: 'Estonia',
      nameLocal: 'Eesti',
      currency: { code: 'EUR', symbol: '€', name: 'Euro' },
      languages: [
        { code: 'et', name: 'Estonian', isDefault: true },
        { code: 'ru', name: 'Russian', isDefault: false },
        { code: 'en', name: 'English', isDefault: false }
      ],
      timezone: 'Europe/Tallinn',
      coordinates: { latitude: 58.5953, longitude: 25.0136 },
      launchPriority: 3
    },
    {
      code: 'PL',
      name: 'Poland',
      nameLocal: 'Polska',
      currency: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
      languages: [
        { code: 'pl', name: 'Polish', isDefault: true },
        { code: 'en', name: 'English', isDefault: false }
      ],
      timezone: 'Europe/Warsaw',
      coordinates: { latitude: 51.1694, longitude: 19.1451 },
      launchPriority: 4
    },
    {
      code: 'DE',
      name: 'Germany',
      nameLocal: 'Deutschland',
      currency: { code: 'EUR', symbol: '€', name: 'Euro' },
      languages: [
        { code: 'de', name: 'German', isDefault: true },
        { code: 'en', name: 'English', isDefault: false }
      ],
      timezone: 'Europe/Berlin',
      coordinates: { latitude: 51.1657, longitude: 10.4515 },
      launchPriority: 5
    }
  ];
  
  for (const countryData of countries) {
    await this.findOneAndUpdate(
      { code: countryData.code },
      countryData,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('Country', CountrySchema);

