# 🔄 Руководство по миграции GoTaxi

## 📋 Обзор изменений

Система GoTaxi была оптимизирована для повышения эффективности и соответствия европейским стандартам.

### ✅ **Что изменилось:**

#### 🗂 **Архитектура проекта:**
```
БЫЛО:                    СТАЛО:
├── server/             ├── server/           # Node.js API
├── admin/              ├── admin/            # Админ панель  
├── driver/             ├── driver/           # React Native для водителей
├── gotaxi/             ├── client-app/       # React для клиентов (НОВОЕ)
└── client-app/         └── (gotaxi удален)   # Дублирование устранено
```

#### 💰 **Система тарифов:**
- **Валюта**: Все цены в евро (EUR)
- **Тарифы**: Базовый тариф + цена за км/мин
- **Надбавки**: Ночные, выходные, аэропорт
- **Модерация**: Обязательное одобрение администратором
- **Регионы**: Поддержка городов Латвии

#### ⚖️ **Правовое соответствие:**
- **Права пассажиров**: Интегрированы в CLIENT приложение
- **Права водителей**: Интегрированы в DRIVER приложение
- **Законодательство**: Соответствие требованиям Латвии и ЕС
- **Лицензирование**: Информация о требованиях AD

#### 💳 **Платежная система:**
- **Прямые платежи**: Клиент → Водитель (без комиссий платформы)
- **Stripe Connect**: Для обработки платежей
- **Прозрачность**: Полная видимость тарифов

## 🚀 **Миграция с старой версии**

### 1. **Обновление кодовой базы**

```bash
# Клонирование обновленной версии
git clone https://github.com/Danils137/GoTaxi.git
cd GoTaxi

# Удаление старых зависимостей
rm -rf */node_modules
```

### 2. **Настройка переменных окружения**

#### **Server (.env):**
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

#### **Client-app (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### **Admin (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. **Установка зависимостей**

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

### 4. **Настройка базы данных**

```bash
# Запуск MongoDB
sudo systemctl start mongodb

# Или через Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. **Запуск системы**

```bash
# Терминал 1: Сервер
cd server && npm run dev

# Терминал 2: Клиентское приложение
cd client-app && npm run dev

# Терминал 3: Админ панель
cd admin && npm start

# Терминал 4: Приложение водителей
cd driver && npm start
```

## 🔧 **Обновление существующих данных**

### **Миграция тарифов:**

```javascript
// Скрипт миграции тарифов в евро
db.tariffs.updateMany(
  { currency: { $ne: "EUR" } },
  { 
    $set: { 
      currency: "EUR",
      // Конвертация из других валют при необходимости
    }
  }
);
```

### **Добавление новых полей:**

```javascript
// Добавление полей для надбавок
db.tariffs.updateMany(
  { nightSurcharge: { $exists: false } },
  { 
    $set: { 
      nightSurcharge: 0.50,
      weekendSurcharge: 0.20,
      airportSurcharge: 2.00,
      isApproved: false
    }
  }
);
```

## 📱 **Мобильные приложения**

### **Текущее состояние:**
- **CLIENT**: React веб-приложение (порт 3001)
- **DRIVER**: React Native/Expo приложение

### **Рекомендации для production:**

#### **Вариант 1: Конвертация CLIENT в React Native**
```bash
# Создание мобильной версии CLIENT
npx create-expo-app mobile-client
# Перенос логики из веб-версии
```

#### **Вариант 2: PWA для CLIENT**
```bash
# Добавление PWA поддержки
npm install @vite/plugin-pwa
# Настройка service worker
```

## 🌍 **Развертывание в production**

### **Рекомендуемая архитектура:**

```
┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   MongoDB       │
│   (Nginx)       │    │   Cluster       │
└─────────────────┘    └─────────────────┘
         │                       │
┌─────────────────┐    ┌─────────────────┐
│   Server        │────│   Redis         │
│   (Node.js)     │    │   (Sessions)    │
└─────────────────┘    └─────────────────┘
         │
┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Admin Panel   │
│   (Static)      │    │   (Static)      │
└─────────────────┘    └─────────────────┘
```

### **Docker Compose:**

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  server:
    build: ./server
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    environment:
      - NODE_ENV=production

  client:
    build: ./client-app
    ports:
      - "3001:80"

  admin:
    build: ./admin
    ports:
      - "3000:80"

volumes:
  mongodb_data:
```

## 🔒 **Безопасность**

### **Обновленные требования:**

1. **API ключи**: Только на сервере
2. **JWT токены**: Короткий срок жизни + refresh tokens
3. **CORS**: Строгая настройка доменов
4. **Rate limiting**: Защита от DDoS
5. **Input validation**: Валидация всех входных данных

### **Настройка HTTPS:**

```nginx
server {
    listen 443 ssl;
    server_name gotaxi.lv;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api {
        proxy_pass http://localhost:5000;
    }
    
    location / {
        proxy_pass http://localhost:3001;
    }
}
```

## 📊 **Мониторинг**

### **Рекомендуемые инструменты:**

- **Логирование**: Winston + ELK Stack
- **Метрики**: Prometheus + Grafana  
- **Ошибки**: Sentry
- **Uptime**: Pingdom/UptimeRobot

### **Ключевые метрики:**

- Время отклика API
- Количество активных поездок
- Ошибки аутентификации
- Использование тарифов по регионам

## 🆘 **Поддержка**

### **Контакты:**
- **Техническая поддержка**: tech@gotaxi.lv
- **Документация**: https://docs.gotaxi.lv
- **GitHub Issues**: https://github.com/Danils137/GoTaxi/issues

### **Часто задаваемые вопросы:**

**Q: Как мигрировать существующих пользователей?**
A: Используйте скрипты миграции в папке `/scripts/migration/`

**Q: Совместимы ли старые мобильные приложения?**
A: Частично. Рекомендуется обновление до новой версии API.

**Q: Как настроить тарифы для нового региона?**
A: Добавьте регион в список `regions` в коде и создайте тариф через админ панель.

---

**Дата обновления**: {new Date().toLocaleDateString('lv-LV')}  
**Версия**: 2.0  
**Статус**: Готово к production

