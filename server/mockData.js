
// Mock данные для демонстрации без MongoDB
const mockUsers = [
  { id: '1', name: 'Иван Петров', email: 'ivan@example.com', role: 'customer' },
  { id: '2', name: 'Мария Сидорова', email: 'maria@example.com', role: 'customer' },
  { id: '3', name: 'Алексей Водитель', email: 'driver@example.com', role: 'driver' }
];

const mockChats = [
  { id: '1', participants: ['1', '2'], name: 'Общий чат', lastMessage: 'Привет! Как дела?' },
  { id: '2', participants: ['1', '3'], name: 'Чат с водителем', lastMessage: 'Еду к вам' }
];

const mockRides = [
  { id: '1', customerId: '1', driverId: '3', status: 'completed', origin: 'Москва, Красная площадь', destination: 'Москва, Арбат', price: 350 }
];

module.exports = { mockUsers, mockChats, mockRides };

