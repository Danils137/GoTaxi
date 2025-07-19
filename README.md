# GoTaxi - Система заказа такси с чатом

GoTaxi - это полнофункциональная система заказа такси с уникальной возможностью общения между клиентами. Система состоит из 4 основных компонентов:

- **SERVER** - Node.js/Express API сервер с MongoDB
- **CLIENT** - React/Vite клиентское приложение с чатом и заказом такси
- **ADMIN** - Административная панель для управления системой
- **DRIVER** - React Native/Expo приложение для водителей

## 🚀 Особенности

### ✨ Уникальные функции:
- **Чат между клиентами** - общение, координация совместных поездок
- **Прямые платежи водителю** - без комиссий платформы
- **Централизованный Google Maps API** - безопасность и контроль квот
- **Реальное время** - WebSocket для чатов и отслеживания поездок

### 🛠 Технологии:
- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo
- **Maps**: Google Maps API (централизованно)
- **Real-time**: WebSocket (Socket.IO)

## 📁 Структура проекта

```
GoTaxi/
├── server/           # API сервер
│   ├── routes/       # API маршруты
│   ├── models/       # MongoDB модели
│   ├── middleware/   # Middleware функции
│   └── types/        # TypeScript типы
├── client-app/       # CLIENT приложение (React)
│   ├── src/
│   │   ├── components/  # UI компоненты
│   │   ├── hooks/       # React хуки
│   │   ├── api/         # API клиент
│   │   └── types/       # TypeScript типы
│   └── dist/         # Собранное приложение
├── admin/            # Административная панель
├── driver/           # Приложение для водителей
└── docs/             # Документация
```

## 🔧 Установка и настройка

### Предварительные требования:
- Node.js 18+
- MongoDB
- Google Maps API ключ
- npm или yarn

### 1. Клонирование репозитория
```bash
git clone https://github.com/Danils137/GoTaxi.git
cd GoTaxi
```

### 2. Настройка сервера
```bash
cd server
npm install

# Создайте .env файл
cp .env.example .env
```

Настройте переменные окружения в `.env`:
```env
# База данных
MONGODB_URI=mongodb://localhost:27017/gotaxi

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Сервер
PORT=5000
NODE_ENV=development
```

### 3. Настройка CLIENT приложения
```bash
cd ../client-app
npm install

# Создайте .env файл
cp .env.example .env
```

Настройте переменные окружения в `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Запуск системы

### 1. Запуск MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS (с Homebrew)
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Запуск сервера
```bash
cd server
npm run dev
```
Сервер запустится на http://localhost:5000

### 3. Запуск CLIENT приложения
```bash
cd client-app
npm run dev
```
CLIENT приложение запустится на http://localhost:3001

### 4. Запуск других компонентов (опционально)
```bash
# Административная панель
cd admin
npm run dev

# Приложение для водителей
cd driver
npm start
```

## 📱 Использование

### Для клиентов (CLIENT приложение):
1. Откройте http://localhost:3001
2. Зарегистрируйтесь или войдите в систему
3. **Чат**: Общайтесь с другими клиентами
4. **Такси**: Заказывайте поездки
5. **Переключение**: Легко переключайтесь между чатом и такси

### Для водителей (DRIVER приложение):
1. Установите Expo Go на телефон
2. Запустите `npm start` в папке driver
3. Отсканируйте QR код
4. Зарегистрируйтесь как водитель
5. Принимайте заказы и получайте оплату напрямую

### Для администраторов (ADMIN панель):
1. Откройте административную панель
2. Войдите с правами администратора
3. Управляйте пользователями, водителями и поездками
4. Просматривайте статистику и аналитику

## 🔗 API Документация

### Основные эндпоинты:

#### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

#### Чат
- `GET /api/chat` - Список чатов
- `GET /api/chat/:id/messages` - Сообщения чата
- `POST /api/chat/:id/message` - Отправить сообщение
- `POST /api/chat/create` - Создать чат

#### Поездки
- `GET /api/ride` - Список поездок
- `POST /api/ride/estimate` - Расчет стоимости
- `POST /api/ride/book` - Заказать поездку
- `POST /api/ride/:id/cancel` - Отменить поездку

#### Карты (централизованно)
- `GET /api/maps/config` - Конфигурация карт
- `POST /api/maps/geocode` - Геокодирование
- `POST /api/maps/directions` - Построение маршрута
- `POST /api/maps/places/search` - Поиск мест

## 🔌 WebSocket События

### Чат события:
- `new_message` - Новое сообщение
- `user_typing` - Пользователь печатает
- `messages_read` - Сообщения прочитаны

### Такси события:
- `new_ride_request` - Новый заказ
- `ride_accepted` - Заказ принят
- `ride_started` - Поездка началась
- `ride_completed` - Поездка завершена
- `driver_location` - Местоположение водителя

## 🏗 Архитектура

### Компоненты системы:
1. **API Server** - Центральный сервер с бизнес-логикой
2. **CLIENT App** - Веб-приложение для клиентов
3. **DRIVER App** - Мобильное приложение для водителей
4. **ADMIN Panel** - Панель администрирования

### Потоки данных:
1. **Чат**: CLIENT ↔ Server ↔ WebSocket ↔ CLIENT
2. **Такси**: CLIENT → Server → DRIVER → Server → CLIENT
3. **Карты**: CLIENT → Server → Google Maps API → Server → CLIENT
4. **Платежи**: CLIENT → DRIVER (напрямую)

## 🔒 Безопасность

- JWT токены для аутентификации
- CORS настроен для всех компонентов
- Google Maps API ключ скрыт на сервере
- Валидация данных на сервере
- Защищенные WebSocket соединения

## 🚀 Развертывание

### Production сборка:
```bash
# Сервер
cd server
npm run build
npm start

# CLIENT приложение
cd client-app
npm run build
# Разверните dist/ на веб-сервере
```

### Docker (опционально):
```bash
# Создайте Docker образы для каждого компонента
docker-compose up -d
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:
1. Проверьте документацию
2. Создайте Issue в GitHub
3. Свяжитесь с командой разработки

---

**GoTaxi** - Революция в мире такси с социальными функциями! 🚗💬

