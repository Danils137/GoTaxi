import express from 'express';
import axios from 'axios';

const router = express.Router();

// Middleware для проверки аутентификации (предполагается, что уже существует)
// import { authenticateToken } from '../middleware/auth';

// Получение конфигурации карт
router.get('/config', async (req, res) => {
  try {
    res.json({
      // API ключ отправляется только аутентифицированным пользователям
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
      defaultCenter: { 
        lat: 55.7558, 
        lng: 37.6176 
      }, // Москва по умолчанию
      defaultZoom: 12,
      mapStyles: {
        // Можно добавить кастомные стили карт
        default: [],
        dark: [], // Темная тема
        minimal: [] // Минималистичный стиль
      }
    });
  } catch (error) {
    console.error('Error getting maps config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Прокси для геокодирования (адрес -> координаты)
router.post('/geocode', async (req, res) => {
  try {
    const { address, language = 'ru' } = req.body;
    
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        language,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error geocoding address:', error);
    res.status(500).json({ message: 'Geocoding failed' });
  }
});

// Обратное геокодирование (координаты -> адрес)
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng, language = 'ru' } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        language,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({ message: 'Reverse geocoding failed' });
  }
});

// Построение маршрута
router.post('/directions', async (req, res) => {
  try {
    const { 
      origin, 
      destination, 
      waypoints = [], 
      mode = 'driving',
      language = 'ru',
      avoidTolls = false,
      avoidHighways = false 
    } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required' });
    }

    const params: any = {
      origin,
      destination,
      mode,
      language,
      key: process.env.GOOGLE_MAPS_API_KEY
    };

    if (waypoints.length > 0) {
      params.waypoints = waypoints.join('|');
    }

    if (avoidTolls) params.avoid = 'tolls';
    if (avoidHighways) params.avoid = params.avoid ? `${params.avoid}|highways` : 'highways';

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting directions:', error);
    res.status(500).json({ message: 'Directions request failed' });
  }
});

// Поиск мест
router.post('/places/search', async (req, res) => {
  try {
    const { 
      query, 
      location, 
      radius = 5000, 
      type = 'establishment',
      language = 'ru' 
    } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const params: any = {
      query,
      language,
      key: process.env.GOOGLE_MAPS_API_KEY
    };

    if (location) {
      params.location = location;
      params.radius = radius;
    }

    if (type) {
      params.type = type;
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ message: 'Places search failed' });
  }
});

// Автодополнение для адресов
router.post('/places/autocomplete', async (req, res) => {
  try {
    const { 
      input, 
      location, 
      radius = 5000,
      types = 'address',
      language = 'ru' 
    } = req.body;
    
    if (!input) {
      return res.status(400).json({ message: 'Input is required' });
    }

    const params: any = {
      input,
      types,
      language,
      key: process.env.GOOGLE_MAPS_API_KEY
    };

    if (location) {
      params.location = location;
      params.radius = radius;
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error in places autocomplete:', error);
    res.status(500).json({ message: 'Places autocomplete failed' });
  }
});

// Расчет расстояния и времени между точками
router.post('/distance-matrix', async (req, res) => {
  try {
    const { 
      origins, 
      destinations, 
      mode = 'driving',
      language = 'ru',
      units = 'metric' 
    } = req.body;
    
    if (!origins || !destinations) {
      return res.status(400).json({ message: 'Origins and destinations are required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: Array.isArray(origins) ? origins.join('|') : origins,
        destinations: Array.isArray(destinations) ? destinations.join('|') : destinations,
        mode,
        language,
        units,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error calculating distance matrix:', error);
    res.status(500).json({ message: 'Distance matrix calculation failed' });
  }
});

export default router;

