# Инструкции по настройке и запуску системы GoTaxi

## Предварительные требования

### Системные требования:
- Node.js 18+ 
- MongoDB 6+
- Git
- Expo CLI (для мобильных приложений)

### Внешние сервисы:
- Google Maps API ключ
- Stripe аккаунт (для платежей)

## 1. Настройка сервера

### Установка зависимостей:
```bash
cd server
npm install
```

### Настройка переменных окружения:
Создайте файл `.env` в папке `server`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gotaxi
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Client URLs for redirects
CLIENT_URL=http://localhost:5050
ADMIN_URL=http://localhost:3000
DRIVER_URL=http://localhost:8081

# Environment
NODE_ENV=development
```

### Запуск сервера:
```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## 2. Настройка административной панели (Admin)

### Установка зависимостей:
```bash
cd admin
npm install
```

### Настройка переменных окружения:
Создайте файл `.env` в папке `admin`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Запуск админки:
```bash
# Разработка
npm run dev

# Сборка для продакшн
npm run build
npm run preview
```

## 3. Настройка клиентского приложения (GoTaxi)

### Установка зависимостей:
```bash
cd gotaxi
npm install
```

### Настройка переменных окружения:
Создайте файл `.env.local` в папке `gotaxi`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Запуск клиентского приложения:
```bash
# Разработка
npm run dev

# Сборка для продакшн
npm run build
npm start
```

## 4. Настройка приложения для водителей (Driver)

### Установка зависимостей:
```bash
cd driver
npm install
```

### Настройка переменных окружения:
Создайте файл `.env` в папке `driver`:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Запуск приложения для водителей:
```bash
# Разработка
npm run dev

# Сборка для веб
npm run build:web
```

## 5. Настройка MongoDB

### Установка MongoDB:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS
brew install mongodb-community

# Windows
# Скачайте с официального сайта MongoDB
```

### Запуск MongoDB:
```bash
# Ubuntu/Debian
sudo systemctl start mongodb
sudo systemctl enable mongodb

# macOS
brew services start mongodb-community

# Или вручную
mongod --dbpath /path/to/your/db
```

### Создание базы данных:
```bash
mongo
use gotaxi
# База данных будет создана автоматически при первом подключении
```

## 6. Настройка Google Maps API

### Получение API ключа:
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите следующие API:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Places API
   - Distance Matrix API
4. Создайте API ключ в разделе "Credentials"
5. Настройте ограничения для безопасности

### Настройка ограничений API ключа:
- **Application restrictions**: HTTP referrers
- **Website restrictions**: 
  - `http://localhost:3000/*` (admin)
  - `http://localhost:5050/*` (client)
  - `http://localhost:8081/*` (driver)
  - Ваши production домены

## 7. Настройка Stripe

### Создание аккаунта Stripe:
1. Зарегистрируйтесь на [Stripe](https://stripe.com/)
2. Получите тестовые ключи в Dashboard
3. Настройте Stripe Connect для платформы

### Настройка Stripe Connect:
1. В Stripe Dashboard перейдите в "Connect"
2. Настройте платформу для marketplace
3. Получите ключи для Connect

### Настройка Webhook:
1. В Stripe Dashboard перейдите в "Webhooks"
2. Добавьте endpoint: `https://yourdomain.com/api/payments/webhook`
3. Выберите события:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
4. Скопируйте webhook secret

## 8. Порядок запуска системы

### 1. Запустите MongoDB:
```bash
sudo systemctl start mongodb
# или
mongod --dbpath /path/to/your/db
```

### 2. Запустите сервер:
```bash
cd server
npm run dev
```

### 3. Запустите админку:
```bash
cd admin
npm run dev
```

### 4. Запустите клиентское приложение:
```bash
cd gotaxi
npm run dev
```

### 5. Запустите приложение для водителей:
```bash
cd driver
npm run dev
```

## 9. Проверка работоспособности

### Проверьте доступность сервисов:
- Сервер: http://localhost:5000
- Админка: http://localhost:3000
- Клиент: http://localhost:5050
- Водители: http://localhost:8081

### Проверьте API endpoints:
```bash
# Проверка здоровья сервера
curl http://localhost:5000/api/config

# Проверка конфигурации карт
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/maps/config
```

## 10. Развертывание в продакшн

### Подготовка к продакшн:
1. Обновите все `.env` файлы с production значениями
2. Настройте HTTPS для всех сервисов
3. Настройте reverse proxy (nginx)
4. Настройте мониторинг и логирование
5. Настройте автоматические бэкапы MongoDB

### Рекомендуемая архитектура продакшн:
```
[Load Balancer] -> [Nginx] -> [Node.js Servers]
                           -> [Static Files]
[MongoDB Cluster]
[Redis Cache]
[Monitoring Stack]
```

## 11. Мобильные приложения

### Сборка для iOS:
```bash
cd driver
expo build:ios
```

### Сборка для Android:
```bash
cd driver
expo build:android
```

### Публикация в App Store/Google Play:
1. Настройте app.json с правильными метаданными
2. Создайте иконки и splash screens
3. Следуйте гайдлайнам Expo для публикации

## 12. Мониторинг и логирование

### Рекомендуемые инструменты:
- **Логирование**: Winston, Morgan
- **Мониторинг**: PM2, New Relic
- **Ошибки**: Sentry
- **Аналитика**: Google Analytics, Mixpanel

### Настройка PM2 для продакшн:
```bash
npm install -g pm2

# Создайте ecosystem.config.js
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## 13. Безопасность

### Рекомендации по безопасности:
- Используйте HTTPS везде
- Настройте CORS правильно
- Используйте helmet.js для Express
- Регулярно обновляйте зависимости
- Настройте rate limiting
- Используйте strong JWT secrets
- Настройте MongoDB аутентификацию

## 14. Резервное копирование

### Настройка бэкапов MongoDB:
```bash
# Создание бэкапа
mongodump --db gotaxi --out /backup/$(date +%Y%m%d)

# Восстановление
mongorestore --db gotaxi /backup/20231201/gotaxi
```

### Автоматизация бэкапов:
```bash
# Добавьте в crontab
0 2 * * * /path/to/backup-script.sh
```

## Поддержка

При возникновении проблем:
1. Проверьте логи всех сервисов
2. Убедитесь, что все переменные окружения настроены
3. Проверьте доступность внешних сервисов (MongoDB, Stripe, Google Maps)
4. Проверьте сетевые подключения между сервисами

