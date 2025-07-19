import express, { Response } from 'express';
import { RequestWithUser } from '../types';
import { authMiddleware } from '../middleware/auth';
import { messageValidation } from '../middleware/validation';
import Chat from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';

const router = express.Router();

// Get all chats for current user
router.get('/', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name email avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get messages for a specific chat
router.get('/:chatId/messages', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Проверяем, что пользователь участвует в чате
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: req.user.id 
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    const messages = await Message.find({ chatId })
      .populate('senderId', 'name avatar')
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Возвращаем сообщения в правильном порядке (старые сначала)
    res.json(messages.reverse());
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message to chat
router.post('/:chatId/message', authMiddleware, messageValidation, async (req: RequestWithUser, res: Response) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text' } = req.body;
    
    // Проверяем, что пользователь участвует в чате
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: req.user.id 
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    const message = new Message({
      chatId,
      senderId: req.user.id,
      content,
      type,
      timestamp: new Date(),
      isRead: false,
    });
    
    await message.save();
    await message.populate('senderId', 'name avatar');

    // Обновляем чат
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    // Отправляем сообщение через Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('new_message', message);
    }

    res.json(message);
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Create new chat
router.post('/create', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { participants, type = 'private', name } = req.body;
    
    // Добавляем текущего пользователя к участникам
    const allParticipants = [...new Set([req.user.id, ...participants])];
    
    // Для приватных чатов проверяем, что участников только 2
    if (type === 'private' && allParticipants.length !== 2) {
      return res.status(400).json({ error: 'Private chat must have exactly 2 participants' });
    }
    
    // Проверяем, существует ли уже такой приватный чат
    if (type === 'private') {
      const existingChat = await Chat.findOne({
        type: 'private',
        participants: { $all: allParticipants, $size: 2 }
      });
      
      if (existingChat) {
        return res.json(existingChat);
      }
    }
    
    const chat = new Chat({
      type,
      name: type === 'group' ? name : undefined,
      participants: allParticipants,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await chat.save();
    await chat.populate('participants', 'name email avatar isOnline lastSeen');
    
    res.json(chat);
  } catch (error) {
    console.error('Failed to create chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Mark messages as read
router.post('/:chatId/read', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const { chatId } = req.params;
    
    // Проверяем, что пользователь участвует в чате
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: req.user.id 
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Отмечаем все сообщения как прочитанные
    await Message.updateMany(
      { chatId, senderId: { $ne: req.user.id }, isRead: false },
      { isRead: true }
    );
    
    // Отправляем уведомление через Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('messages_read', { 
        chatId, 
        userId: req.user.id 
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get all users (for creating new chats)
router.get('/users/all', authMiddleware, async (req: RequestWithUser, res: Response) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user.id } 
    }).select('name email avatar isOnline lastSeen');
    
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;

