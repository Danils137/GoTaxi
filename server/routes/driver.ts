import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Find nearby drivers endpoint
router.post('/nearby', authMiddleware, async (req: Request, res: Response) => {
  const { lat, lng, radius = 5 } = req.body; // radius in km

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    const nearbyDrivers = await User.find({
      role: 'driver',
      isOnline: true,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).select('-password');

    res.status(200).json({
      drivers: nearbyDrivers,
      count: nearbyDrivers.length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: `Internal server error: ${message}` });
  }
});

// Get driver location endpoint
router.get('/:driverId/location', authMiddleware, async (req: Request, res: Response) => {
  const { driverId } = req.params;

  try {
    const driver = await User.findById(driverId).select('location status');
    
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.status(200).json({
      location: driver.location?.coordinates,
      status: driver.status
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: `Internal server error: ${message}` });
  }
});

// Update driver location endpoint
router.put('/:driverId/location', authMiddleware, async (req: Request, res: Response) => {
  const { driverId } = req.params;
  const { lat, lng, status } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    const driver = await User.findById(driverId);
    
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update location (GeoJSON: [longitude, latitude])
    driver.location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };

    if (status) {
      driver.status = status;
    }

    await driver.save();

    res.status(200).json({
      message: 'Location updated',
      location: driver.location.coordinates,
      status: driver.status
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: `Internal server error: ${message}` });
  }
});

export default router;
