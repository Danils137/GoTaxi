import { Router, Request, Response } from 'express';
import { taxiBookingValidation } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import TaxiBooking from '../models/TaxiBooking';

interface RequestTaxiRequest {
  userId: string;
  pickupLocation: string;
  destination: string;
  pickupTime: string;
}

interface UpdateStatusRequest {
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
}

const router = Router();

// Get Google Maps API key
router.get('/map-key', async (req, res) => {
  res.json({ key: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY' });
});

// Create taxi booking
router.post('/bookings', authMiddleware, taxiBookingValidation, async (req: Request, res: Response) => {
  try {
    const { userId, pickupLocation, destination, pickupTime } = req.body;
    const booking = new TaxiBooking({ 
      userId, 
      pickupLocation, 
      destination, 
      pickupTime: new Date(pickupTime) 
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: message });
  }
});

router.get('/status/:id', async (req: Request<{id: string}>, res: Response) => {
  try {
    const booking = await TaxiBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: message });
  }
});

router.put('/status/:id', async (req: Request<{id: string}, {}, UpdateStatusRequest>, res: Response) => {
  try {
    const { status } = req.body;
    const booking = await TaxiBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(booking);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: message });
  }
});

export default router;
