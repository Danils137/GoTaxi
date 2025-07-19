import { Router, Response } from 'express';
import { RequestWithUser } from '../types';
import TaxiBooking from '../models/TaxiBooking';
import Driver from '../models/Driver';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all rides for current user
router.get('/', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = { customerId: req.user.id };
    
    if (status) {
      filter.status = status;
    }
    
    const rides = await TaxiBooking.find(filter)
      .populate('driverId', 'name phone rating vehicle avatar')
      .sort({ createdAt: -1 });
    
    res.json(rides);
  } catch (error: unknown) {
    console.error('Failed to fetch rides:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to fetch rides: ${message}` });
  }
});

// Get specific ride by ID
router.get('/:rideId', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { rideId } = req.params;
    
    const ride = await TaxiBooking.findOne({
      _id: rideId,
      customerId: req.user.id
    }).populate('driverId', 'name phone rating vehicle avatar');
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    res.json(ride);
  } catch (error: unknown) {
    console.error('Failed to fetch ride:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to fetch ride: ${message}` });
  }
});

// Estimate ride cost and duration
router.post('/estimate', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    
    // Здесь должна быть логика расчета через Google Maps API
    // Пока используем заглушку
    const distance = Math.random() * 20 + 2; // 2-22 км
    const duration = distance * 3 + Math.random() * 10; // примерно 3 мин на км + пробки
    const basePrice = 50; // базовая цена
    const pricePerKm = 15; // цена за км
    const price = basePrice + (distance * pricePerKm);
    
    const estimate = {
      distance: Math.round(distance * 100) / 100,
      duration: Math.round(duration),
      price: Math.round(price),
      route: null // Здесь будет маршрут от Google Maps
    };
    
    res.json(estimate);
  } catch (error: unknown) {
    console.error('Failed to estimate ride:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to estimate ride: ${message}` });
  }
});

// Book a new ride
router.post('/book', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { origin, destination, scheduledFor, notes } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    
    // Создаем новую поездку
    const ride = new TaxiBooking({
      customerId: req.user.id,
      origin,
      destination,
      status: 'pending',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await ride.save();
    
    // Отправляем уведомление водителям через Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new_ride_request', ride);
    }
    
    res.json(ride);
  } catch (error: unknown) {
    console.error('Failed to book ride:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to book ride: ${message}` });
  }
});

// Cancel a ride
router.post('/:rideId/cancel', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    
    const ride = await TaxiBooking.findOne({
      _id: rideId,
      customerId: req.user.id
    });
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (!['pending', 'accepted', 'driver_assigned'].includes(ride.status)) {
      return res.status(400).json({ error: 'Cannot cancel ride in current status' });
    }
    
    ride.status = 'cancelled';
    ride.updatedAt = new Date();
    await ride.save();
    
    // Отправляем уведомление через Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('ride_cancelled', { 
        rideId: ride._id, 
        reason: reason || 'Cancelled by customer' 
      });
      
      if (ride.driverId) {
        io.to(`driver_${ride.driverId}`).emit('ride_cancelled', {
          rideId: ride._id,
          reason: reason || 'Cancelled by customer'
        });
      }
    }
    
    res.json({ success: true, message: 'Ride cancelled successfully' });
  } catch (error: unknown) {
    console.error('Failed to cancel ride:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to cancel ride: ${message}` });
  }
});

// Get pending ride requests (for drivers)
router.get('/pending/all', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const pendingRides = await TaxiBooking.find({ status: 'pending' })
      .populate('customerId', 'name phone avatar')
      .sort({ createdAt: -1 });
    
    res.json(pendingRides);
  } catch (error: unknown) {
    console.error('Failed to fetch pending rides:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to fetch pending rides: ${message}` });
  }
});

// Accept a ride request (for drivers)
router.put('/:rideId/accept', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { rideId } = req.params;
    
    const ride = await TaxiBooking.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ error: 'Ride is not available' });
    }

    // Получаем информацию о водителе
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) {
      return res.status(400).json({ error: 'Driver profile not found' });
    }

    ride.status = 'accepted';
    ride.driverId = req.user.id;
    ride.updatedAt = new Date();
    await ride.save();

    // Отправляем уведомления через Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`customer_${ride.customerId}`).emit('ride_accepted', {
        rideId: ride._id,
        driver: {
          id: req.user.id,
          name: driver.name,
          phone: driver.phone,
          rating: driver.rating,
          vehicle: driver.vehicle,
          avatar: driver.avatar
        }
      });
    }

    res.json({ 
      success: true,
      message: 'Ride accepted',
      ride
    });
  } catch (error: unknown) {
    console.error('Failed to accept ride:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to accept ride: ${message}` });
  }
});

// Start a ride (for drivers)
router.post('/:rideId/start', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { rideId } = req.params;
    
    const ride = await TaxiBooking.findOne({
      _id: rideId,
      driverId: req.user.id
    });
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({ error: 'Ride cannot be started' });
    }

    ride.status = 'in_progress';
    ride.updatedAt = new Date();
    await ride.save();

    // Отправляем уведомления через Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`customer_${ride.customerId}`).emit('ride_started', {
        rideId: ride._id
      });
    }

    res.json({ 
      success: true,
      message: 'Ride started',
      ride
    });
  } catch (error: unknown) {
    console.error('Failed to start ride:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to start ride: ${message}` });
  }
});

// Complete a ride (for drivers)
router.post('/:rideId/complete', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { rideId } = req.params;
    const { finalPrice, actualDistance, actualDuration } = req.body;
    
    const ride = await TaxiBooking.findOne({
      _id: rideId,
      driverId: req.user.id
    });
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'in_progress') {
      return res.status(400).json({ error: 'Ride cannot be completed' });
    }

    ride.status = 'completed';
    ride.finalPrice = finalPrice;
    ride.actualDistance = actualDistance;
    ride.actualDuration = actualDuration;
    ride.updatedAt = new Date();
    await ride.save();

    // Отправляем уведомления через Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`customer_${ride.customerId}`).emit('ride_completed', {
        rideId: ride._id,
        finalPrice
      });
    }

    res.json({ 
      success: true,
      message: 'Ride completed',
      ride
    });
  } catch (error: unknown) {
    console.error('Failed to complete ride:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: `Failed to complete ride: ${message}` });
  }
});

export default router;

