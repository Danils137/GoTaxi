import express from 'express';

const router = express.Router();

// Public config endpoint to expose Google Maps API key
router.get('/public', (req, res) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleMapsApiKey) {
    return res.status(500).json({ message: 'Google Maps API key not configured' });
  }
  res.json({ googleMapsApiKey });
});

export default router;
