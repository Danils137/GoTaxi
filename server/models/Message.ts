import mongoose, { Schema } from 'mongoose';
import { Message } from '../types';

const MessageSchema = new Schema<Message>({
  chatId: { 
    type: String, 
    required: [true, 'Chat ID is required'],
    validate: {
      validator: (v: string) => mongoose.Types.ObjectId.isValid(v),
      message: 'Invalid chat ID format'
    }
  },
  senderId: { 
    type: String, 
    ref: 'User', 
    required: [true, 'Sender ID is required'],
    validate: {
      validator: (v: string) => mongoose.Types.ObjectId.isValid(v),
      message: 'Invalid user ID format'
    }
  },
  content: { 
    type: String, 
    required: [true, 'Message content is required'],
    minlength: [1, 'Message cannot be empty']
  },
  type: { 
    type: String, 
    enum: {
      values: ['text', 'image', 'file'],
      message: 'Invalid message type'
    },
    default: 'text' 
  },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  replyTo: { 
    type: String,
    validate: {
      validator: function(v: string | undefined) {
        return !v || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid reply message ID format'
    }
  },
});

// Add pre-save validation
MessageSchema.pre('save', function(next) {
  if (!this.content || this.content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }
  next();
});

export default mongoose.model<Message>('Message', MessageSchema);
