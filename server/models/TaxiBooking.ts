import mongoose, { Schema } from 'mongoose';
import { TaxiBooking } from '../types';

const TaxiBookingSchema = new Schema<TaxiBooking>({
  userId: { type: String, ref: 'User', required: true },
  pickupLocation: { type: String, required: true },
  destination: { type: String, required: true },
  pickupTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  driverId: { type: Schema.Types.ObjectId, ref: 'User' },
  driverName: { type: String },
  driverPhone: { type: String },
  vehicleInfo: { type: String },
  estimatedPrice: { type: Number },
  actualPrice: { type: Number },
  completedAt: { type: Date },
});

export default mongoose.model<TaxiBooking>('TaxiBooking', TaxiBookingSchema);
