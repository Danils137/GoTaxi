const express = require('express');
const cors = require('cors');
const { mockUsers, mockChats, mockRides } = require('./mockData');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'http://localhost:3002', 
    'http://localhost:3000',
    'https://3002-iwbdsistdexu9zixhz9co-d8301e10.manusvm.computer',
    'https://3001-iwbdsistdexu9zixhz9co-d8301e10.manusvm.computer',
    'https://3000-iwbdsistdexu9zixhz9co-d8301e10.manusvm.computer'
  ],
  credentials: true
}));
app.use(express.json());

// Mock JWT token
const DEMO_TOKEN = 'demo-jwt-token-12345';

// Demo routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'GoTaxi Demo Server Running!', 
    status: 'success',
    features: [
      'Mock authentication',
      'Demo chat data', 
      'Sample ride data',
      'No MongoDB required'
    ]
  });
});

// Auth routes (mock)
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = mockUsers.find(u => u.email === email);
  
  if (user) {
    res.json({
      success: true,
      token: DEMO_TOKEN,
      user: user
    });
  } else {
    res.status(401).json({ message: 'User not found' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: String(mockUsers.length + 1),
    name,
    email,
    role: 'customer'
  };
  mockUsers.push(newUser);
  
  res.json({
    success: true,
    token: DEMO_TOKEN,
    user: newUser
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: mockUsers[0] // Возвращаем первого пользователя как текущего
  });
});

// Chat routes (mock)
app.get('/api/chat', (req, res) => {
  res.json({
    success: true,
    chats: mockChats
  });
});

app.get('/api/chat/:id/messages', (req, res) => {
  const chatId = req.params.id;
  const mockMessages = [
    {
      id: '1',
      chatId,
      senderId: '1',
      content: 'Привет! Как дела?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      senderName: 'Иван Петров'
    },
    {
      id: '2', 
      chatId,
      senderId: '2',
      content: 'Отлично! А у тебя как?',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      senderName: 'Мария Сидорова'
    },
    {
      id: '3',
      chatId, 
      senderId: '1',
      content: 'Тоже хорошо! Планируешь поездку на такси?',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      senderName: 'Иван Петров'
    }
  ];
  
  res.json({
    success: true,
    messages: mockMessages
  });
});

app.post('/api/chat/:id/message', (req, res) => {
  const { content } = req.body;
  const newMessage = {
    id: String(Date.now()),
    chatId: req.params.id,
    senderId: '1',
    content,
    timestamp: new Date().toISOString(),
    senderName: 'Демо Пользователь'
  };
  
  res.json({
    success: true,
    message: newMessage
  });
});

// Ride routes (mock)
app.get('/api/ride', (req, res) => {
  res.json({
    success: true,
    rides: mockRides
  });
});

app.post('/api/ride/estimate', (req, res) => {
  const { origin, destination } = req.body;
  
  res.json({
    success: true,
    estimate: {
      distance: '5.2 км',
      duration: '12 мин',
      price: 280,
      origin: origin || 'Москва, Красная площадь',
      destination: destination || 'Москва, Арбат'
    }
  });
});

app.post('/api/ride/book', (req, res) => {
  const newRide = {
    id: String(Date.now()),
    customerId: '1',
    status: 'pending',
    origin: req.body.origin,
    destination: req.body.destination,
    estimatedPrice: 280,
    createdAt: new Date().toISOString()
  };
  
  mockRides.push(newRide);
  
  res.json({
    success: true,
    ride: newRide
  });
});

// Maps routes (mock - без Google API)
app.get('/api/maps/config', (req, res) => {
  res.json({
    success: true,
    config: {
      defaultCenter: { lat: 55.7558, lng: 37.6176 }, // Москва
      defaultZoom: 12,
      demoMode: true,
      message: 'Demo mode - Google Maps API not configured'
    }
  });
});

app.post('/api/maps/geocode', (req, res) => {
  const { address } = req.body;
  res.json({
    success: true,
    results: [{
      formatted_address: address || 'Москва, Россия',
      geometry: {
        location: { lat: 55.7558, lng: 37.6176 }
      }
    }]
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableRoutes: [
      'GET /',
      'POST /api/auth/login',
      'POST /api/auth/register', 
      'GET /api/auth/me',
      'GET /api/chat',
      'GET /api/chat/:id/messages',
      'POST /api/chat/:id/message',
      'GET /api/ride',
      'POST /api/ride/estimate',
      'POST /api/ride/book',
      'GET /api/maps/config',
      'POST /api/maps/geocode'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GoTaxi Demo Server running on http://localhost:${PORT}`);
  console.log(`📱 Features available:`);
  console.log(`   ✅ Mock authentication`);
  console.log(`   ✅ Demo chat functionality`);
  console.log(`   ✅ Sample ride booking`);
  console.log(`   ✅ Basic maps integration`);
  console.log(`   ⚠️  No MongoDB required (using mock data)`);
  console.log(`   ⚠️  No real Google Maps (demo mode)`);
  console.log(`\n🌐 Test in browser: http://localhost:${PORT}`);
});

