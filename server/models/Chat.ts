import mongoose, { Schema } from 'mongoose';
import { Chat } from '../types';

const ChatSchema = new Schema<Chat>({
  type: { type: String, enum: ['private', 'group'], required: true },
  name: { type: String },
  participants: [{ type: String, ref: 'User' }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  unreadCount: { type: Number, default: 0 },
  isTyping: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  avatar: { type: String },
});

export default mongoose.model<Chat>('Chat', ChatSchema);
