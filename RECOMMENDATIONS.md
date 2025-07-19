# Рекомендации по унификации и настройке системы GoTaxi

## 1. Унификация мобильных приложений

### Текущая ситуация:
- **GOTAXI**: Next.js (веб-приложение)
- **DRIVER**: React Native/Expo (мобильное приложение)

### Рекомендации:

#### Вариант 1: Полная унификация с React Native/Expo (РЕКОМЕНДУЕТСЯ)
**Преимущества:**
- Единая кодовая база для iOS и Android
- Общие компоненты и логика
- Упрощенная поддержка и разработка
- Expo обеспечивает простое развертывание

**Действия:**
1. Переписать GOTAXI с Next.js на React Native/Expo
2. Использовать Expo Router для навигации
3. Общие компоненты в shared библиотеке
4. Единый стиль и UI kit

#### Вариант 2: Гибридный подход с общими компонентами
**Если нужно сохранить Next.js:**
- Создать shared библиотеку с бизнес-логикой
- Использовать React Native Web для GOTAXI
- Общие API клиенты и типы TypeScript

### Рекомендуемая структура:
```
/apps
  /gotaxi-mobile     # React Native/Expo (клиенты)
  /driver-mobile     # React Native/Expo (водители)
  /admin-web         # React/Vite (админка)
  /server           # Node.js/Express

/packages
  /shared-ui        # Общие компоненты
  /shared-api       # API клиенты
  /shared-types     # TypeScript типы
  /shared-utils     # Утилиты
```

## 2. Централизованный Google Maps API ключ

### Архитектура безопасности:

#### Серверная прокси для Maps API
```typescript
// server/routes/maps.ts
router.get('/api/maps/config', authenticateToken, (req, res) => {
  res.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    // Дополнительные настройки карт
    defaultCenter: { lat: 55.7558, lng: 37.6176 }, // Москва
    defaultZoom: 12
  });
});

router.post('/api/maps/geocode', authenticateToken, async (req, res) => {
  // Прокси запросы к Google Geocoding API
  const { address } = req.body;
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  res.json(await response.json());
});
```

#### Клиентская реализация:
```typescript
// shared-api/maps.ts
export const getMapsConfig = async () => {
  const response = await apiClient.get('/api/maps/config');
  return response.data;
};

export const geocodeAddress = async (address: string) => {
  const response = await apiClient.post('/api/maps/geocode', { address });
  return response.data;
};
```

### Преимущества:
- API ключ не попадает в клиентский код
- Централизованное управление квотами
- Возможность кэширования на сервере
- Дополнительная безопасность и контроль

## 3. Система прямых платежей водителю

### Архитектура платежей:

#### Вариант 1: Stripe Connect (РЕКОМЕНДУЕТСЯ)
```typescript
// Водитель создает Stripe Connect аккаунт
const account = await stripe.accounts.create({
  type: 'express',
  country: 'RU',
  email: driver.email,
});

// При завершении поездки - прямой перевод
const transfer = await stripe.transfers.create({
  amount: rideAmount * 100, // в копейках
  currency: 'rub',
  destination: driver.stripeAccountId,
  description: `Оплата за поездку #${rideId}`,
});
```

#### Вариант 2: Эскроу система
```typescript
// Деньги блокируются при начале поездки
const paymentIntent = await stripe.paymentIntents.create({
  amount: estimatedAmount * 100,
  currency: 'rub',
  capture_method: 'manual', // Не списывать сразу
});

// При завершении поездки - перевод водителю
const transfer = await stripe.transfers.create({
  amount: finalAmount * 100,
  currency: 'rub',
  destination: driver.stripeAccountId,
});
```

### Схема работы:
1. **Регистрация водителя**: Создание Stripe Connect аккаунта
2. **Заказ поездки**: Блокировка средств на карте клиента
3. **Завершение поездки**: Прямой перевод водителю
4. **Комиссия платформы**: Удерживается автоматически

## 4. Обновленная архитектура API

### Новые эндпоинты:

```typescript
// Карты
GET  /api/maps/config          # Конфигурация карт
POST /api/maps/geocode         # Геокодирование
POST /api/maps/directions      # Маршруты
POST /api/maps/places          # Поиск мест

// Платежи
POST /api/payments/setup-driver    # Настройка Stripe для водителя
POST /api/payments/create-intent   # Создание платежного намерения
POST /api/payments/transfer        # Перевод водителю
GET  /api/payments/history         # История платежей

// Поездки (обновленные)
POST /api/rides/estimate          # Оценка стоимости
POST /api/rides/book             # Бронирование с блокировкой средств
PUT  /api/rides/:id/complete     # Завершение с переводом
```

## 5. Переменные окружения

### SERVER (.env)
```env
# База данных
MONGODB_URI=mongodb://localhost:27017/gotaxi
JWT_SECRET=your-super-secret-jwt-key

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyAgudeX0Gb1AL168b47UBS1PcoNVbOBTnI

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Сервер
PORT=5000
NODE_ENV=development
```

### КЛИЕНТСКИЕ ПРИЛОЖЕНИЯ (.env)
```env
# Только URL сервера, без API ключей
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
EXPO_PUBLIC_APP_NAME=GoTaxi
```

## 6. План миграции

### Этап 1: Настройка сервера (1-2 дня)
1. Добавить эндпоинты для карт
2. Настроить Stripe Connect
3. Обновить API для прямых платежей

### Этап 2: Унификация клиентов (3-5 дней)
1. Создать новое React Native приложение для клиентов
2. Перенести логику из Next.js
3. Настроить общие компоненты

### Этап 3: Интеграция и тестирование (2-3 дня)
1. Подключить все компоненты
2. Тестировать платежи
3. Тестировать карты

### Этап 4: Развертывание (1 день)
1. Настроить production окружение
2. Развернуть на серверах
3. Публикация в App Store/Google Play

## 7. Технические детали

### Структура проекта после унификации:
```
gotaxi/
├── apps/
│   ├── client-mobile/     # React Native (клиенты)
│   ├── driver-mobile/     # React Native (водители)  
│   ├── admin-web/         # React/Vite (админка)
│   └── server/           # Node.js API
├── packages/
│   ├── shared-ui/        # Общие компоненты
│   ├── shared-api/       # API клиенты
│   ├── shared-types/     # TypeScript типы
│   └── shared-utils/     # Утилиты
└── tools/
    ├── build/            # Скрипты сборки
    └── deploy/           # Скрипты развертывания
```

### Рекомендуемые инструменты:
- **Monorepo**: Nx или Lerna
- **State Management**: Zustand (легче Redux)
- **UI Kit**: Tamagui или NativeBase
- **Navigation**: Expo Router
- **Maps**: react-native-maps + Google Maps
- **Payments**: @stripe/stripe-react-native

