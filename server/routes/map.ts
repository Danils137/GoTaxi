import express from 'express';
import User from '../models/User';
import TaxiBooking from '../models/TaxiBooking';

const router = express.Router();

// Get online drivers and clients
router.get('/online', async (req, res) => {
  try {
    // Get online drivers
    const drivers = await User.find({ 
      role: 'driver',
      isOnline: true, 
      location: { $exists: true } 
    }, 'location name vehicleType');

    // Get active clients (those with ongoing rides)
    const activeClients = await TaxiBooking.find({
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    });

    // Format client locations
    const clients = activeClients.map(booking => ({
      location: booking.pickupLocation,
      name: 'Client', // Временное решение
      type: 'client'
    }));

    res.json({
      drivers: drivers.map(d => ({ ...d.toObject(), type: 'driver' })),
      clients
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
