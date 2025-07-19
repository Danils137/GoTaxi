import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { registerValidation, loginValidation, validate } from '../middleware/validation';

interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

const router = Router();

router.post('/register', [...registerValidation, validate], async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  const { name, email, phone, password } = req.body;
  try {
    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'Name, password, and either email or phone are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name, 
        email, 
        phone, 
        avatar: user.avatar, 
        isOnline: user.isOnline 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', [...loginValidation, validate], async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, phone, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    await User.findByIdAndUpdate(user._id, { isOnline: true, lastSeen: new Date() });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        avatar: user.avatar, 
        isOnline: true 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate((req as any).user.id, { 
      isOnline: false, 
      lastSeen: new Date() 
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
