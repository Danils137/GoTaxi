# 🚗 GoTaxi - Европейская система заказа такси

Полнофункциональная система заказа такси с уникальным чатом между клиентами, соответствующая европейским стандартам и законодательству Латвии.

## 🌟 Уникальные особенности

- **💬 Чат между клиентами** - Революционная функция для общения пассажиров
- **🚗 Заказ такси** - Быстрый поиск и заказ ближайших водителей  
- **💰 Прямые платежи** - Клиенты платят напрямую водителям (без комиссий)
- **🇪🇺 Европейские стандарты** - Соответствие законодательству Латвии и ЕС
- **💶 Тарифы в евро** - Все цены в европейской валюте
- **⚖️ Правовая информация** - Права и обязанности для клиентов и водителей
- **🌍 Реальное время** - WebSocket для мгновенных обновлений
- **🗺️ Централизованные карты** - Безопасная интеграция Google Maps через сервер

## 🏗 Оптимизированная архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLIENT-APP    │    │     ADMIN       │    │     DRIVER      │
│   (React/Vite)  │    │   (React)       │    │ (React Native)  │
│   Порт: 3001    │    │   Порт: 3000    │    │   (Мобильное)   │
│                 │    │                 │    │                 │
│ • Чат клиентов  │    │ • Модерация     │    │ • Управление    │
│ • Заказ такси   │    │ • Статистика    │    │   тарифами      │
│ • Права/обязан. │    │ • Тарифы        │    │ • Права/обязан. │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     SERVER      │
                    │  (Node.js/TS)   │
                    │   Порт: 5000    │
                    │                 │
                    │ • API Gateway   │
                    │ • WebSocket     │
                    │ • Google Maps   │
                    │ • Тарифы EUR    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   (Database)    │
                    └─────────────────┘
```

### 📱 Компоненты системы

1. **SERVER** - Node.js/Express API с MongoDB и централизованными сервисами
2. **CLIENT-APP** - React приложение для клиентов (чат + такси + права)
3. **ADMIN** - Панель управления тарифами, модерация, статистика
4. **DRIVER** - React Native приложение для водителей с управлением тарифами

## 🛠 Технологический стек

### Backend:
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** с **Mongoose**
- **Socket.IO** для WebSocket
- **JWT** для аутентификации
- **Google Maps API** (централизованно)
- **Stripe Connect** для прямых платежей

### Frontend:
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** для стилизации
- **Socket.IO Client** для реального времени
- **Axios** для HTTP запросов
- **React Router** для навигации

### Mobile:
- **React Native** + **Expo**
- **TypeScript** поддержка
- **Native Base** UI компоненты
- **React Navigation**

## 📁 Структура проекта

```
GoTaxi/
├── server/                    # API сервер
│   ├── routes/               # API маршруты
│   │   ├── auth.ts          # Аутентификация
│   │   ├── chat.ts          # Чат между клиентами
│   │   ├── ride.ts          # Управление поездками
│   │   ├── driver.ts        # Управление водителями
│   │   ├── maps.ts          # Google Maps API
│   │   ├── tariff.js        # Система тарифов (EUR)
│   │   └── payments.ts      # Прямые платежи
│   ├── models/              # MongoDB модели
│   │   ├── User.js          # Пользователи
│   │   ├── Chat.js          # Чаты
│   │   ├── Ride.js          # Поездки
│   │   ├── Driver.js        # Водители
│   │   └── Tariff.js        # Тарифы
│   ├── middleware/          # Middleware
│   ├── types/               # TypeScript типы
│   └── server.ts            # Главный файл сервера
├── client-app/              # CLIENT приложение
│   ├── src/
│   │   ├── components/      # UI компоненты
│   │   │   ├── auth/        # Аутентификация
│   │   │   ├── chat/        # Чат компоненты
│   │   │   ├── taxi/        # Такси компоненты
│   │   │   ├── legal/       # Права и обязанности
│   │   │   ├── tariff/      # Отображение тарифов
│   │   │   └── ui/          # Базовые UI компоненты
│   │   ├── hooks/           # React хуки
│   │   │   ├── useAuth.ts   # Аутентификация
│   │   │   ├── useChat.ts   # Чат функциональность
│   │   │   ├── useTaxi.ts   # Такси функциональность
│   │   │   └── useMaps.ts   # Карты
│   │   ├── api/             # API клиент
│   │   └── types/           # TypeScript типы
├── admin/                   # Административная панель
│   ├── src/
│   │   └── components/
│   │       └── tariff/      # Управление тарифами
│   │           └── TariffManagement.tsx
├── driver/                  # Приложение водителей
│   ├── src/
│   │   └── components/
│   │       ├── legal/       # Права и обязанности
│   │       │   └── DriverRights.tsx
│   │       └── tariff/      # Управление тарифами
│   │           └── TariffManager.tsx
└── docs/                    # Документация
    ├── MIGRATION_GUIDE.md   # Руководство по миграции
    ├── LEGAL_REQUIREMENTS_LATVIA.md  # Правовые требования
    ├── OPTIMIZATION_ANALYSIS.md     # Анализ оптимизации
    └── DEPLOYMENT_STRATEGY.md       # Стратегия развертывания
```

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/Danils137/GoTaxi.git
cd GoTaxi
```

### 2. Установка зависимостей
```bash
# Сервер
cd server && npm install

# Клиентское приложение
cd ../client-app && npm install

# Админ панель
cd ../admin && npm install

# Приложение водителей
cd ../driver && npm install
```

### 3. Настройка переменных окружения

#### Server (.env):
```env
# База данных
MONGODB_URI=mongodb://localhost:27017/gotaxi

# JWT
JWT_SECRET=your_jwt_secret_here

# Google Maps (централизованный)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Stripe (для прямых платежей)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# CORS
CLIENT_URL=http://localhost:3001
ADMIN_URL=http://localhost:3000
DRIVER_URL=http://localhost:3002
```

#### Client-app (.env):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Запуск MongoDB
```bash
# Локально
sudo systemctl start mongodb

# Или через Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Запуск приложений
```bash
# Терминал 1: Сервер
cd server && npm run dev

# Терминал 2: Клиентское приложение
cd client-app && npm run dev

# Терминал 3: Админ панель
cd admin && npm start

# Терминал 4: Приложение водителей (для разработки)
cd driver && npm start
```

### 6. Доступ к приложениям
- **CLIENT**: http://localhost:3001
- **ADMIN**: http://localhost:3000
- **SERVER API**: http://localhost:5000
- **DRIVER**: Expo приложение (мобильное)

## 💶 Система тарифов

### Структура тарифа:
```javascript
{
  baseFare: 2.50,           // Базовый тариф (посадка) в EUR
  pricePerKm: 1.20,         // Цена за километр в EUR
  pricePerMinute: 0.30,     // Цена за минуту в EUR
  minimumFare: 5.00,        // Минимальная стоимость в EUR
  nightSurcharge: 0.50,     // Ночная надбавка (22:00-06:00) в EUR/км
  weekendSurcharge: 0.20,   // Надбавка за выходные в EUR/км
  airportSurcharge: 2.00,   // Надбавка за аэропорт в EUR
  region: "Riga",           // Регион работы
  currency: "EUR",          // Валюта (всегда EUR)
  isApproved: false         // Статус модерации
}
```

### Поддерживаемые регионы:
- **Riga** (Рига)
- **Daugavpils** (Даугавпилс)
- **Liepaja** (Лиепая)
- **Jelgava** (Елгава)
- **Jurmala** (Юрмала)
- **Ventspils** (Вентспилс)
- **Other** (Другие)

## 🔌 API Endpoints

### Аутентификация:
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь

### Чат:
- `GET /api/chat` - Список чатов
- `POST /api/chat` - Создание чата
- `GET /api/chat/:id/messages` - Сообщения чата
- `POST /api/chat/:id/messages` - Отправка сообщения

### Поездки:
- `POST /api/ride/book` - Заказ поездки
- `GET /api/ride/active` - Активные поездки
- `PUT /api/ride/:id/status` - Обновление статуса

### Тарифы:
- `GET /api/tariff/driver/:id` - Тариф водителя
- `POST /api/tariff/calculate` - Расчет стоимости
- `POST /api/tariff` - Создание тарифа (водитель)
- `GET /api/tariff/admin/pending` - Тарифы на модерации (админ)
- `POST /api/tariff/admin/:id/approve` - Одобрение тарифа (админ)

### Карты:
- `GET /api/maps/config` - Конфигурация карт
- `POST /api/maps/geocode` - Геокодирование
- `POST /api/maps/directions` - Построение маршрута
- `POST /api/maps/distance` - Расчет расстояния

## 🔄 WebSocket События

### Чат:
- `join_chat` - Присоединение к чату
- `leave_chat` - Покидание чата
- `new_message` - Новое сообщение
- `user_typing` - Пользователь печатает

### Поездки:
- `ride_requested` - Новый заказ
- `ride_accepted` - Заказ принят
- `ride_started` - Поездка началась
- `ride_completed` - Поездка завершена
- `location_update` - Обновление местоположения

## ⚖️ Правовое соответствие

### Для клиентов (CLIENT-APP):
- ✅ Права пассажиров согласно законодательству Латвии
- ✅ Обязанности при использовании такси
- ✅ Правила поведения в салоне
- ✅ Процедуры подачи жалоб
- ✅ Информация о тарифах и оплате

### Для водителей (DRIVER APP):
- ✅ Требования к лицензированию (AD)
- ✅ Права и обязанности водителей
- ✅ Технические требования к автомобилю
- ✅ Языковые требования (латышский B2)
- ✅ Штрафы и ответственность
- ✅ Санитарные требования (COVID-19)

## 🔒 Безопасность

### Аутентификация:
- **JWT токены** с коротким сроком жизни
- **Refresh токены** для обновления
- **Хеширование паролей** с bcrypt
- **Rate limiting** для защиты от атак

### API безопасность:
- **CORS** настройка для разрешенных доменов
- **Валидация входных данных** на всех endpoints
- **Централизованные API ключи** (Google Maps)
- **HTTPS** в production окружении

## 📱 Мобильные приложения

### Текущее состояние:
- **CLIENT**: React веб-приложение (адаптивное)
- **DRIVER**: React Native/Expo приложение

### Планы развития:
1. **PWA версия CLIENT** для мобильных устройств
2. **React Native версия CLIENT** для App Store/Google Play
3. **Единая кодовая база** для iOS и Android

## 🚀 Развертывание

### Development:
```bash
# Запуск всех сервисов
npm run dev:all
```

### Production:
```bash
# Сборка приложений
npm run build:all

# Запуск в production режиме
npm run start:prod
```

### Docker:
```bash
# Сборка и запуск через Docker Compose
docker-compose up -d
```

## 📊 Мониторинг и аналитика

### Метрики:
- Количество активных пользователей
- Статистика поездок по регионам
- Средние тарифы по городам
- Время отклика API
- Ошибки и исключения

### Инструменты:
- **Winston** для логирования
- **Prometheus** для метрик
- **Grafana** для визуализации
- **Sentry** для отслеживания ошибок

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

- **Email**: support@gotaxi.lv
- **GitHub Issues**: [https://github.com/Danils137/GoTaxi/issues](https://github.com/Danils137/GoTaxi/issues)
- **Документация**: [docs/](docs/)

## 🙏 Благодарности

- Команде разработчиков GoTaxi
- Сообществу React и Node.js
- Дорожной администрации Латвии за правовую информацию
- Всем тестировщикам и пользователям

---

**Сделано с ❤️ для европейского рынка такси**

**Версия**: 2.0  
**Статус**: Готово к production  
**Последнее обновление**: {new Date().toLocaleDateString('lv-LV')}

