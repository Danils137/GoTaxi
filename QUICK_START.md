# 🚀 Быстрый запуск GoTaxi

Этот гайд поможет вам быстро запустить систему GoTaxi для разработки и тестирования.

## ⚡ Быстрый старт (5 минут)

### 1. Предварительные требования
```bash
# Проверьте версии
node --version  # Должно быть 18+
npm --version
```

### 2. Установка зависимостей
```bash
# Сервер
cd server && npm install

# CLIENT приложение
cd ../client-app && npm install
```

### 3. Настройка переменных окружения

**Сервер** (`server/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/gotaxi
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
PORT=5000
NODE_ENV=development
```

**CLIENT** (`client-app/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Запуск MongoDB
```bash
# Если MongoDB не установлен, используйте Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Или установите локально:
# Ubuntu: sudo apt install mongodb
# macOS: brew install mongodb-community
```

### 5. Запуск системы
```bash
# Терминал 1: Сервер
cd server
npm run dev

# Терминал 2: CLIENT приложение
cd client-app
npm run dev
```

### 6. Открыть приложение
- CLIENT: http://localhost:3001 (или 3002 если 3001 занят)
- API: http://localhost:5000

## 🎯 Тестирование функций

### Регистрация и вход:
1. Откройте CLIENT приложение
2. Нажмите "Зарегистрироваться"
3. Заполните форму и создайте аккаунт
4. Войдите в систему

### Тестирование чата:
1. Создайте второй аккаунт (в приватном окне браузера)
2. В первом аккаунте нажмите "Новый чат"
3. Выберите второго пользователя
4. Отправьте сообщения в обе стороны
5. Проверьте уведомления и статусы

### Тестирование такси:
1. Нажмите кнопку "Такси" в интерфейсе
2. Введите адреса "Откуда" и "Куда"
3. Нажмите "Рассчитать стоимость"
4. Проверьте расчет поездки
5. Нажмите "Заказать поездку"

## 🔧 Решение проблем

### Проблема: Порт занят
```bash
# Найти процесс на порту
lsof -i :5000
lsof -i :3001

# Убить процесс
kill -9 <PID>
```

### Проблема: MongoDB не подключается
```bash
# Проверить статус MongoDB
sudo systemctl status mongod

# Запустить MongoDB
sudo systemctl start mongod

# Или через Docker
docker start mongodb
```

### Проблема: Google Maps не работает
1. Получите API ключ в Google Cloud Console
2. Включите следующие API:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Places API
3. Добавьте ключ в `server/.env`

### Проблема: WebSocket не подключается
1. Проверьте, что сервер запущен
2. Проверьте CORS настройки в `server/server.ts`
3. Убедитесь, что порты совпадают в `.env` файлах

## 📱 Мобильное приложение (DRIVER)

### Для тестирования приложения водителей:
```bash
# Установите Expo CLI
npm install -g @expo/cli

# Запустите приложение
cd driver
npm start

# Отсканируйте QR код в Expo Go приложении
```

## 🔍 Отладка

### Логи сервера:
```bash
cd server
npm run dev
# Смотрите консоль для ошибок API и WebSocket
```

### Логи CLIENT:
```bash
# Откройте DevTools в браузере (F12)
# Смотрите Console и Network вкладки
```

### Проверка API:
```bash
# Тест подключения к серверу
curl http://localhost:5000/api/auth/me

# Тест WebSocket (в браузере)
# Откройте DevTools → Network → WS
```

## 🎨 Кастомизация

### Изменение темы:
- Отредактируйте `client-app/tailwind.config.js`
- Цвета находятся в секции `theme.extend.colors`

### Добавление новых API:
1. Создайте маршрут в `server/routes/`
2. Добавьте метод в `client-app/src/api/client.ts`
3. Используйте в компонентах через хуки

### Изменение UI:
- Компоненты находятся в `client-app/src/components/`
- Используйте Tailwind CSS для стилизации

## 📊 Мониторинг

### Проверка состояния:
```bash
# Проверить запущенные процессы
ps aux | grep node

# Проверить порты
netstat -tulpn | grep :5000
netstat -tulpn | grep :3001
```

### Логи MongoDB:
```bash
# Подключиться к MongoDB
mongosh gotaxi

# Посмотреть коллекции
show collections

# Посмотреть пользователей
db.users.find()
```

## 🚀 Следующие шаги

После успешного запуска:
1. Изучите код в `client-app/src/components/`
2. Настройте Google Maps API
3. Добавьте реальных пользователей
4. Протестируйте все функции
5. Настройте production окружение

---

**Удачи с GoTaxi!** 🚗💨

Если что-то не работает, проверьте основной README.md или создайте Issue в GitHub.

