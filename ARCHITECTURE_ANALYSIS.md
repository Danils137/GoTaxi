# Анализ архитектуры системы GoTaxi

## Обзор системы

Система GoTaxi состоит из 4 основных компонентов:

### 1. SERVER (Серверная часть)
- **Технологии**: Node.js, TypeScript, Express.js
- **База данных**: MongoDB (Mongoose)
- **Порт**: 5000 (по умолчанию)
- **Функции**:
  - REST API для всех операций
  - WebSocket поддержка (Socket.IO)
  - Аутентификация JWT
  - Управление пользователями, водителями, поездками
  - Чат функциональность
  - Карты и геолокация

**API Маршруты**:
- `/api/auth` - Аутентификация
- `/api/taxi` - Управление такси
- `/api/driver` - Управление водителями
- `/api/ride` - Управление поездками
- `/api/chat` - Чат функциональность
- `/api/map` - Карты и геолокация
- `/api/config` - Конфигурация

### 2. ADMIN (Административная панель)
- **Технологии**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Lucide React
- **Порт**: 3000 (dev), 4173 (preview)
- **Функции**:
  - Управление пользователями и водителями
  - Мониторинг поездок
  - Аналитика и отчеты
  - Настройки системы
  - Аудит логи

**Зависимости**:
- axios - HTTP клиент для API
- socket.io-client - WebSocket соединение
- recharts - Графики и аналитика
- @types/google.maps - Интеграция с Google Maps

### 3. GOTAXI (Клиентское приложение)
- **Технологии**: Next.js 15, React 18, TypeScript
- **UI**: Material-UI, Tailwind CSS
- **Порт**: 5050
- **Функции**:
  - Заказ такси
  - Отслеживание поездки
  - Оплата (Stripe интеграция)
  - Профиль пользователя
  - История поездок
  - Многоязычность (i18next)

**Ключевые зависимости**:
- @mui/material - UI компоненты
- @reduxjs/toolkit - Управление состоянием
- @stripe/react-stripe-js - Платежи
- google-map-react - Карты
- axios - HTTP клиент
- socket.io-client - Реальное время

### 4. DRIVER (Приложение для водителей)
- **Технологии**: React Native, Expo, TypeScript
- **Навигация**: Expo Router
- **Функции**:
  - Регистрация и аутентификация водителей
  - Получение заказов
  - Навигация и GPS
  - Управление статусом (онлайн/офлайн)
  - Заработок и статистика
  - Профиль водителя

**Ключевые зависимости**:
- expo - Платформа разработки
- expo-location - Геолокация
- expo-camera - Камера для документов
- socket.io-client - Реальное время
- axios - HTTP клиент

## Архитектура взаимодействия

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ADMIN PANEL   │    │   CLIENT APP    │    │   DRIVER APP    │
│   (React/Vite)  │    │   (Next.js)     │    │ (React Native)  │
│   Port: 3000    │    │   Port: 5050    │    │   (Mobile)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ HTTP/WebSocket       │ HTTP/WebSocket       │ HTTP/WebSocket
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       SERVER            │
                    │   (Node.js/Express)     │
                    │   Port: 5000            │
                    │                         │
                    │   ┌─────────────────┐   │
                    │   │   MongoDB       │   │
                    │   │   Database      │   │
                    │   └─────────────────┘   │
                    └─────────────────────────┘
```

## Протоколы взаимодействия

### HTTP REST API
Все компоненты взаимодействуют с сервером через REST API:
- **Аутентификация**: JWT токены
- **CORS**: Настроен для портов 3000, 5000, 5050, 8082
- **Формат данных**: JSON

### WebSocket (Socket.IO)
Для реального времени:
- **Чат между пользователями и водителями**
- **Отслеживание местоположения в реальном времени**
- **Уведомления о новых заказах**
- **Обновления статуса поездки**

### База данных
- **MongoDB** с Mongoose ODM
- **Коллекции**: Users, Drivers, Rides, Chats, Configs
- **Индексы**: Геопространственные для поиска ближайших водителей

## Конфигурация портов

- **SERVER**: 5000
- **ADMIN**: 3000 (dev), 4173 (preview)
- **GOTAXI**: 5050
- **DRIVER**: Expo dev server (обычно 8081)

## Переменные окружения

Каждый компонент имеет свой `.env` файл:

### SERVER (.env)
```
MONGODB_URI=mongodb://localhost:27017/gotaxi
JWT_SECRET=your_jwt_secret
PORT=5000
```

### ADMIN (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### GOTAXI (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### DRIVER (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Следующие шаги

1. **Настройка конфигурации** - Обновление всех .env файлов
2. **Установка зависимостей** - npm install для всех компонентов
3. **Запуск MongoDB** - Настройка базы данных
4. **Тестирование соединений** - Проверка API и WebSocket
5. **Развертывание** - Настройка production окружения

