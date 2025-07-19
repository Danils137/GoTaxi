import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-taxi';
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
