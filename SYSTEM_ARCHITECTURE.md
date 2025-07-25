# 🏗 Архитектура системы GoTaxi

## 📊 Схема подключений

```
                    ┌─────────────────┐
                    │   MONGODB       │
                    │   База данных   │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │     SERVER      │
                    │  Node.js/Express│
                    │   Socket.IO     │
                    │   Port: 5000    │
                    └─────────┬───────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
    ┌───────▼──────┐ ┌───────▼──────┐ ┌───────▼──────┐
    │   CLIENT     │ │    DRIVER    │ │    ADMIN     │
    │ React/Vite   │ │React Native  │ │   React      │
    │Port: 3001    │ │   Expo       │ │ Port: 3000   │
    │              │ │              │ │              │
    │• Чат клиентов│ │• Прием заказов│ │• Управление  │
    │• Заказ такси │ │• GPS трекинг │ │• Статистика  │
    │• Карты       │ │• Навигация   │ │• Мониторинг  │
    └──────────────┘ └──────────────┘ └──────────────┘
```

## ✅ Подключения к серверу

### 🎯 **CLIENT приложение** → SERVER
- **Статус**: ✅ **ПОДКЛЮЧЕНО**
- **Протокол**: HTTP REST API + WebSocket
- **Порт**: 3001 → 5000
- **Функции**:
  - Аутентификация пользователей
  - Чат между клиентами
  - Заказ и отслеживание поездок
  - Получение данных карт через сервер

### 🚗 **DRIVER приложение** → SERVER  
- **Статус**: ✅ **ПОДКЛЮЧЕНО** (через существующие API)
- **Протокол**: HTTP REST API + WebSocket
- **Функции**:
  - Регистрация и аутентификация водителей
  - Получение заказов от клиентов
  - Обновление статуса поездки
  - Отправка GPS координат в реальном времени

### 👨‍💼 **ADMIN панель** → SERVER
- **Статус**: ✅ **ПОДКЛЮЧЕНО** (через существующие API)
- **Протокол**: HTTP REST API + WebSocket
- **Порт**: 3000 → 5000
- **Функции**:
  - Управление пользователями и водителями
  - Мониторинг поездок
  - Статистика и аналитика
  - Настройки системы

## 🔄 Потоки данных

### 1. **Заказ поездки**:
```
CLIENT → SERVER → DRIVER → SERVER → CLIENT
  ↓        ↓        ↓        ↓        ↓
Заказ → Сохранение → Уведомление → Принятие → Подтверждение
```

### 2. **Чат между клиентами**:
```
CLIENT A → SERVER → CLIENT B
    ↓        ↓         ↓
Сообщение → WebSocket → Получение
```

### 3. **Отслеживание поездки**:
```
DRIVER → SERVER → CLIENT
   ↓        ↓        ↓
GPS → WebSocket → Карта
```

### 4. **Администрирование**:
```
ADMIN → SERVER → DATABASE
  ↓       ↓         ↓
Действие → API → Изменения
```

## 🌐 API Endpoints (общие для всех)

### Аутентификация:
- `POST /api/auth/login` - Вход (CLIENT, DRIVER, ADMIN)
- `POST /api/auth/register` - Регистрация
- `GET /api/auth/me` - Текущий пользователь

### Поездки:
- `GET /api/ride` - Список поездок
- `POST /api/ride/book` - Заказать (CLIENT)
- `POST /api/ride/accept` - Принять (DRIVER)
- `PUT /api/ride/:id/status` - Обновить статус

### Чат:
- `GET /api/chat` - Список чатов (CLIENT)
- `POST /api/chat/:id/message` - Отправить сообщение

### Карты:
- `GET /api/maps/config` - Конфигурация карт
- `POST /api/maps/directions` - Маршруты

### Администрирование:
- `GET /api/admin/users` - Пользователи (ADMIN)
- `GET /api/admin/drivers` - Водители (ADMIN)
- `GET /api/admin/stats` - Статистика (ADMIN)

## 🔌 WebSocket События

### Для CLIENT:
- `new_message` - Новое сообщение в чате
- `ride_accepted` - Поездка принята водителем
- `driver_location` - Местоположение водителя

### Для DRIVER:
- `new_ride_request` - Новый заказ поездки
- `ride_cancelled` - Поездка отменена клиентом

### Для ADMIN:
- `system_alert` - Системные уведомления
- `new_user_registered` - Новый пользователь
- `ride_completed` - Поездка завершена

## 🔒 Безопасность

### Аутентификация:
- **JWT токены** для всех приложений
- **Роли пользователей**: customer, driver, admin
- **Middleware проверки** на сервере

### CORS настройки:
```javascript
// В server/server.ts
app.use(cors({
  origin: [
    'http://localhost:3001', // CLIENT
    'http://localhost:3000', // ADMIN
    'exp://localhost:19000'  // DRIVER (Expo)
  ]
}));
```

## 📱 Особенности каждого приложения

### CLIENT (Клиенты):
- **Уникальная функция**: Чат между клиентами
- **Основные экраны**: Чаты, Заказ такси, Профиль
- **Платежи**: Напрямую водителю (наличные/карта)

### DRIVER (Водители):
- **Мобильное приложение** (React Native/Expo)
- **GPS трекинг** в реальном времени
- **Прием заказов** и навигация
- **Получение оплаты** напрямую от клиентов

### ADMIN (Администраторы):
- **Веб-панель** для управления
- **Мониторинг** всех поездок
- **Управление пользователями** и водителями
- **Статистика** и аналитика

## 🎯 Заключение

**ДА, ВЫ ПРАВИЛЬНО ПОНЯЛИ!** 

Все три приложения подключены к одному центральному серверу:
- **CLIENT** ✅ подключен к SERVER
- **DRIVER** ✅ подключен к SERVER  
- **ADMIN** ✅ подключен к SERVER

Сервер является **единой точкой входа** для всех данных и бизнес-логики, что обеспечивает:
- Централизованное управление
- Безопасность данных
- Синхронизацию между приложениями
- Масштабируемость системы

