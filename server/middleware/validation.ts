import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation rules for user registration
export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone('lv-LV').withMessage('Invalid phone number')
];

// Validation rules for user login
export const loginValidation = [
  body('password').notEmpty().withMessage('Password is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone('lv-LV').withMessage('Invalid phone number')
];

// Validation rules for sending messages
export const messageValidation = [
  body('chatId').notEmpty().withMessage('Chat ID is required'),
  body('content').notEmpty().withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
];

// Validation rules for taxi booking
export const taxiBookingValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('pickupLocation').notEmpty().withMessage('Pickup location is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('pickupTime').notEmpty().isISO8601().withMessage('Invalid pickup time format')
];

// Middleware to handle validation errors
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
