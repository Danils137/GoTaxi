# 🧮 Документация алгоритмов ценообразования GoTaxi

## 📋 Содержание
1. [Обзор системы](#обзор-системы)
2. [Алгоритм подбора водителей](#алгоритм-подбора-водителей)
3. [Система динамического ценообразования](#система-динамического-ценообразования)
4. [Формулы расчета стоимости](#формулы-расчета-стоимости)
5. [Тестовые сценарии](#тестовые-сценарии)
6. [API документация](#api-документация)

---

## 🎯 Обзор системы

### Принципы работы
- **Индивидуальные тарифы**: каждый водитель устанавливает свои цены
- **Динамическое ценообразование**: автоматическая корректировка по спросу
- **Справедливая конкуренция**: прозрачный алгоритм подбора
- **Максимизация доходов**: рекомендации для водителей

### Архитектура
```
Клиент → API подбора → Алгоритм фильтрации → Расчет стоимости → Ранжирование → Результат
```

---

## 🔍 Алгоритм подбора водителей

### 1. Фильтрация доступных водителей

#### Критерии фильтрации:
```javascript
const availabilityFilter = {
  isOnline: true,
  isAvailable: true,
  distance: <= 10km,
  carCapacity: >= passengerCount,
  hasValidLicense: true,
  isApproved: true
}
```

#### Географическая фильтрация:
- **Радиус поиска**: 10 км от точки подачи
- **Приоритет**: ближайшие водители получают бонус к рейтингу
- **Зоны**: учет особых зон (аэропорт, центр города)

### 2. Расчет стоимости для каждого водителя

#### Базовая формула:
```
Итоговая стоимость = (Базовый тариф + Стоимость расстояния + Стоимость времени + Надбавки) × Множитель спроса
```

#### Детализация:
```javascript
const calculatePrice = (driver, route, time) => {
  const baseFare = driver.tariff.baseFare;
  const distanceCost = route.distance * driver.tariff.pricePerKm;
  const timeCost = route.duration * driver.tariff.pricePerMinute;
  
  const surcharges = calculateSurcharges(driver.tariff, time, route);
  const demandMultiplier = getDynamicMultiplier(time, route.pickup);
  
  return (baseFare + distanceCost + timeCost + surcharges.total) * demandMultiplier;
}
```

### 3. Система скоринга водителей

#### Формула скоринга:
```javascript
const calculateDriverScore = (driver, pricing, logistics) => {
  const priceScore = (1 / pricing.totalCost) * 100;      // Чем дешевле, тем лучше
  const speedScore = (1 / logistics.estimatedArrival) * 50; // Чем быстрее, тем лучше
  const ratingScore = driver.rating * 20;                  // Рейтинг водителя
  const experienceScore = Math.min(driver.tripsCount / 100, 1) * 30; // Опыт
  
  return priceScore + speedScore + ratingScore + experienceScore;
}
```

#### Весовые коэффициенты:
- **Цена**: 40% (приоритет доступности)
- **Скорость прибытия**: 20% (важность времени)
- **Рейтинг**: 25% (качество сервиса)
- **Опыт**: 15% (надежность)

### 4. Категоризация предложений

#### Алгоритм группировки:
```javascript
const categorizeDrivers = (drivers) => {
  const sorted = drivers.sort((a, b) => a.pricing.totalCost - b.pricing.totalCost);
  const priceRange = sorted[sorted.length - 1].pricing.totalCost - sorted[0].pricing.totalCost;
  
  return {
    economy: sorted.filter(d => d.pricing.totalCost <= sorted[0].pricing.totalCost + priceRange * 0.3),
    standard: sorted.filter(d => d.pricing.totalCost > sorted[0].pricing.totalCost + priceRange * 0.3 && 
                                d.pricing.totalCost <= sorted[0].pricing.totalCost + priceRange * 0.7),
    premium: sorted.filter(d => d.pricing.totalCost > sorted[0].pricing.totalCost + priceRange * 0.7)
  };
}
```

---

## 📈 Система динамического ценообразования

### 1. Компоненты множителя спроса

#### Базовые факторы:
```javascript
const dynamicFactors = {
  demandSupply: calculateDemandSupplyRatio(location, time),    // 0.8 - 2.0
  timeOfDay: getTimeMultiplier(time),                         // 0.9 - 1.5
  dayOfWeek: getDayMultiplier(time),                          // 0.95 - 1.3
  weather: getWeatherMultiplier(location, time),              // 1.0 - 1.4
  events: getEventMultiplier(location, time),                 // 1.0 - 2.0
  seasonal: getSeasonalMultiplier(time)                       // 0.9 - 1.2
}
```

#### Формула итогового множителя:
```javascript
const finalMultiplier = Math.min(
  Math.max(
    demandSupply * timeOfDay * dayOfWeek * weather * events * seasonal,
    0.8  // Минимальный множитель
  ),
  2.5    // Максимальный множитель
);
```

### 2. Расчет спроса и предложения

#### Алгоритм:
```javascript
const calculateDemandSupplyRatio = (location, time) => {
  const activeRides = getActiveRidesInRadius(location, 5); // 5 км радиус
  const availableDrivers = getAvailableDriversInRadius(location, 10); // 10 км радиус
  const pendingRequests = getPendingRequestsInRadius(location, 5);
  
  const demand = activeRides + pendingRequests * 1.5; // Ожидающие заказы весят больше
  const supply = availableDrivers;
  
  if (supply === 0) return 2.0; // Максимальный множитель при отсутствии водителей
  
  const ratio = demand / supply;
  
  // Преобразование в множитель
  if (ratio <= 0.5) return 0.9;      // Низкий спрос
  if (ratio <= 1.0) return 1.0;      // Нормальный спрос
  if (ratio <= 1.5) return 1.2;      // Умеренный спрос
  if (ratio <= 2.0) return 1.5;      // Высокий спрос
  return 1.8;                         // Очень высокий спрос
}
```

### 3. Временные множители

#### По времени суток:
```javascript
const timeMultipliers = {
  '00:00-06:00': 1.3,  // Ночь
  '06:00-08:00': 1.2,  // Раннее утро
  '08:00-10:00': 1.4,  // Утренний час пик
  '10:00-16:00': 1.0,  // День
  '16:00-19:00': 1.5,  // Вечерний час пик
  '19:00-22:00': 1.1,  // Вечер
  '22:00-24:00': 1.2   // Поздний вечер
}
```

#### По дням недели:
```javascript
const dayMultipliers = {
  monday: 1.0,
  tuesday: 1.0,
  wednesday: 1.0,
  thursday: 1.1,
  friday: 1.2,
  saturday: 1.3,
  sunday: 1.1
}
```

### 4. Погодные условия

#### Множители по погоде:
```javascript
const weatherMultipliers = {
  clear: 1.0,
  cloudy: 1.0,
  rain: 1.25,
  heavy_rain: 1.4,
  snow: 1.35,
  storm: 1.5,
  fog: 1.15
}
```

---

## 💰 Формулы расчета стоимости

### 1. Базовый расчет

#### Основная формула:
```
Общая стоимость = Базовый тариф + (Расстояние × Цена за км) + (Время × Цена за минуту) + Надбавки
```

#### С учетом динамического ценообразования:
```
Итоговая стоимость = Общая стоимость × Множитель спроса
```

### 2. Надбавки

#### Типы надбавок:
```javascript
const surcharges = {
  night: {
    condition: hour >= 22 || hour < 6,
    type: 'per_km',
    amount: driver.tariff.nightSurcharge || 0.5
  },
  weekend: {
    condition: day === 'saturday' || day === 'sunday',
    type: 'percentage',
    amount: driver.tariff.weekendSurcharge || 0.2
  },
  airport: {
    condition: isAirportRoute(pickup, dropoff),
    type: 'fixed',
    amount: driver.tariff.airportSurcharge || 2.0
  }
}
```

### 3. Минимальная стоимость

#### Правило минимальной стоимости:
```javascript
const minimumFare = Math.max(
  driver.tariff.minimumFare || 3.0,
  driver.tariff.baseFare + 1.0
);

const finalPrice = Math.max(calculatedPrice, minimumFare);
```

---

## 🧪 Тестовые сценарии

### Сценарий 1: Обычная поездка в будний день

**Условия:**
- Время: Вторник, 14:00
- Маршрут: Центр Риги → Торговый центр (8 км, 15 мин)
- Погода: Ясно
- Спрос: Нормальный

**Водитель А (Эконом):**
```javascript
const tariff = {
  baseFare: 2.50,
  pricePerKm: 1.20,
  pricePerMinute: 0.30
}

const calculation = {
  baseFare: 2.50,
  distanceCost: 8 * 1.20 = 9.60,
  timeCost: 15 * 0.30 = 4.50,
  surcharges: 0.00,
  subtotal: 16.60,
  demandMultiplier: 1.0,
  total: 16.60
}
```

**Водитель Б (Премиум):**
```javascript
const tariff = {
  baseFare: 3.50,
  pricePerKm: 1.60,
  pricePerMinute: 0.40
}

const calculation = {
  baseFare: 3.50,
  distanceCost: 8 * 1.60 = 12.80,
  timeCost: 15 * 0.40 = 6.00,
  surcharges: 0.00,
  subtotal: 22.30,
  demandMultiplier: 1.0,
  total: 22.30
}
```

### Сценарий 2: Поездка в час пик с дождем

**Условия:**
- Время: Пятница, 18:00
- Маршрут: Офисный район → Жилой район (12 км, 25 мин)
- Погода: Дождь
- Спрос: Высокий

**Множители:**
```javascript
const multipliers = {
  timeOfDay: 1.5,      // Час пик
  dayOfWeek: 1.2,      // Пятница
  weather: 1.25,       // Дождь
  demandSupply: 1.3,   // Высокий спрос
  final: 1.5 * 1.2 * 1.25 * 1.3 = 2.925 → 2.5 (ограничение)
}
```

**Расчет для водителя:**
```javascript
const calculation = {
  baseFare: 2.50,
  distanceCost: 12 * 1.20 = 14.40,
  timeCost: 25 * 0.30 = 7.50,
  surcharges: 0.00,
  subtotal: 24.40,
  demandMultiplier: 2.5,
  total: 61.00
}
```

### Сценарий 3: Ночная поездка в аэропорт

**Условия:**
- Время: Суббота, 02:00
- Маршрут: Центр → Аэропорт (15 км, 20 мин)
- Погода: Ясно
- Спрос: Низкий

**Надбавки:**
```javascript
const surcharges = {
  night: 15 * 0.50 = 7.50,    // Ночная надбавка за км
  airport: 2.00,              // Надбавка за аэропорт
  total: 9.50
}
```

**Расчет:**
```javascript
const calculation = {
  baseFare: 2.50,
  distanceCost: 15 * 1.20 = 18.00,
  timeCost: 20 * 0.30 = 6.00,
  surcharges: 9.50,
  subtotal: 36.00,
  demandMultiplier: 1.3 * 1.3 * 0.9 = 1.52, // Ночь × Суббота × Низкий спрос
  total: 54.72
}
```

---

## 📡 API документация

### 1. Поиск водителей

**Endpoint:** `POST /api/ride-matching/find-drivers`

**Request:**
```json
{
  "pickup": {
    "latitude": 56.9496,
    "longitude": 24.1052,
    "address": "Центр Риги"
  },
  "dropoff": {
    "latitude": 56.9240,
    "longitude": 24.0859,
    "address": "Аэропорт Рига"
  },
  "requestTime": "2024-01-15T18:30:00Z",
  "passengerCount": 2,
  "preferences": {
    "maxOptions": 5,
    "region": "Riga"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "options": [
      {
        "driverId": "driver_123",
        "driver": {
          "name": "Андрей Петров",
          "rating": 4.8,
          "tripsCount": 1250,
          "carModel": "Toyota Camry",
          "carColor": "Черный",
          "licensePlate": "AB-1234"
        },
        "pricing": {
          "baseFare": 2.50,
          "distanceCost": 18.00,
          "timeCost": 6.00,
          "surcharges": {
            "night": 0.00,
            "weekend": 0.00,
            "airport": 2.00,
            "total": 2.00
          },
          "demandMultiplier": 1.5,
          "totalCost": 42.75,
          "currency": "EUR"
        },
        "logistics": {
          "estimatedArrival": 5,
          "estimatedTripTime": 20,
          "distance": 15.2
        },
        "score": 85.6,
        "category": "standard",
        "label": "Быстрый",
        "description": "Опытный водитель с высоким рейтингом"
      }
    ],
    "pricingInfo": {
      "finalMultiplier": 1.5,
      "level": "moderate",
      "explanation": "Умеренный спрос, вечерний час пик"
    },
    "requestId": "req_1642267800_abc123",
    "validUntil": "2024-01-15T18:35:00Z"
  }
}
```

### 2. Расчет стоимости

**Endpoint:** `POST /api/ride-matching/calculate-price`

**Request:**
```json
{
  "driverId": "driver_123",
  "pickup": {
    "latitude": 56.9496,
    "longitude": 24.1052
  },
  "dropoff": {
    "latitude": 56.9240,
    "longitude": 24.0859
  },
  "requestTime": "2024-01-15T18:30:00Z"
}
```

### 3. Информация о ценообразовании

**Endpoint:** `GET /api/ride-matching/pricing-info`

**Query Parameters:**
- `latitude` - широта
- `longitude` - долгота  
- `region` - регион (по умолчанию "Riga")

---

## 🔧 Настройка и конфигурация

### Переменные окружения

```env
# Ограничения алгоритма
MAX_SEARCH_RADIUS=10          # км
MAX_DEMAND_MULTIPLIER=2.5     # максимальный множитель
MIN_DEMAND_MULTIPLIER=0.8     # минимальный множитель
MAX_DRIVER_OPTIONS=8          # максимум вариантов для клиента

# Веса скоринга
PRICE_WEIGHT=0.4
SPEED_WEIGHT=0.2
RATING_WEIGHT=0.25
EXPERIENCE_WEIGHT=0.15

# Тайм-ауты
PRICE_VALIDITY_MINUTES=5      # время действия цены
DRIVER_RESPONSE_TIMEOUT=30    # время ответа водителя
```

### Региональные настройки

```javascript
const regionSettings = {
  Riga: {
    currency: 'EUR',
    minimumFare: 3.00,
    maxSearchRadius: 15,
    airportSurcharge: 2.00
  },
  Daugavpils: {
    currency: 'EUR', 
    minimumFare: 2.50,
    maxSearchRadius: 10,
    airportSurcharge: 1.50
  }
}
```

---

## 📊 Мониторинг и аналитика

### Ключевые метрики

1. **Конверсия заказов**: % заказов, завершившихся поездкой
2. **Время ответа**: среднее время принятия заказа водителем
3. **Точность ценообразования**: отклонение итоговой цены от расчетной
4. **Удовлетворенность**: рейтинги клиентов и водителей

### Логирование

```javascript
const logPricingDecision = {
  requestId: 'req_123',
  timestamp: '2024-01-15T18:30:00Z',
  location: { lat: 56.9496, lng: 24.1052 },
  driversFound: 5,
  selectedDriver: 'driver_123',
  finalPrice: 42.75,
  demandMultiplier: 1.5,
  factors: {
    timeOfDay: 1.5,
    weather: 1.0,
    demandSupply: 1.2
  }
}
```

---

## 🚀 Оптимизация производительности

### Кэширование

1. **Тарифы водителей**: кэш на 5 минут
2. **Погодные данные**: кэш на 15 минут  
3. **Маршруты**: кэш на 1 час
4. **Статистика спроса**: кэш на 2 минуты

### Индексы базы данных

```javascript
// MongoDB индексы для оптимизации
db.drivers.createIndex({ 
  location: "2dsphere", 
  isOnline: 1, 
  isAvailable: 1 
});

db.rides.createIndex({ 
  createdAt: 1, 
  status: 1, 
  "pickup.coordinates": "2dsphere" 
});
```

---

## 🔮 Будущие улучшения

### Машинное обучение

1. **Предсказание спроса**: ML модель для прогноза пиков
2. **Оптимизация маршрутов**: AI для лучших путей
3. **Персонализация**: индивидуальные рекомендации тарифов

### Дополнительные факторы

1. **Пробки**: интеграция с данными о трафике
2. **События**: автоматическое определение мероприятий
3. **Сезонность**: учет праздников и каникул

---

*Документация обновлена: 19 января 2025*
*Версия алгоритма: 1.0*

