import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { Chat, Message, User } from '../types';

export const useChat = (currentUserId?: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка чатов при инициализации
  useEffect(() => {
    if (currentUserId) {
      loadChats();
      setupSocketListeners();
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [currentUserId]);

  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (activeChat && !messages[activeChat]) {
      loadChatMessages(activeChat);
    }
  }, [activeChat]);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const chatsData = await apiClient.getChats();
      setChats(chatsData);
      
      // Извлекаем уникальных пользователей из чатов
      const allUsers = new Map<string, User>();
      chatsData.forEach((chat: Chat) => {
        chat.participants.forEach((participantId: string) => {
          // В реальном приложении здесь будет запрос пользователей
          // Пока используем заглушку
          if (!allUsers.has(participantId)) {
            allUsers.set(participantId, {
              id: participantId,
              name: `User ${participantId}`,
              isOnline: Math.random() > 0.5,
              avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
            });
          }
        });
      });
      
      setUsers(Array.from(allUsers.values()));
    } catch (error: any) {
      console.error('Failed to load chats:', error);
      setError('Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (chatId: string, page = 1) => {
    try {
      const messagesData = await apiClient.getChatMessages(chatId, page);
      
      setMessages(prev => ({
        ...prev,
        [chatId]: page === 1 ? messagesData : [...(prev[chatId] || []), ...messagesData]
      }));
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      setError('Не удалось загрузить сообщения');
    }
  };

  const sendMessage = async (chatId: string, content: string, type: 'text' | 'image' = 'text') => {
    try {
      const newMessage = await apiClient.sendMessage(chatId, content, type);
      
      // Добавляем сообщение локально для мгновенного отображения
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage]
      }));

      // Обновляем последнее сообщение в чате
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
          : chat
      ));

      return newMessage;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError('Не удалось отправить сообщение');
      throw error;
    }
  };

  const markAsRead = async (chatId: string) => {
    try {
      // Отмечаем сообщения как прочитанные локально
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(msg => ({ ...msg, isRead: true }))
      }));

      // Обнуляем счетчик непрочитанных
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ));

      // Отправляем на сервер (если есть соответствующий API)
      // await apiClient.markMessagesAsRead(chatId);
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const createChat = async (participants: string[], type: 'private' | 'group' = 'private', name?: string) => {
    try {
      const newChat = await apiClient.createChat(participants, type, name);
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (error: any) {
      console.error('Failed to create chat:', error);
      setError('Не удалось создать чат');
      throw error;
    }
  };

  const setupSocketListeners = () => {
    const socket = apiClient.getSocket();
    if (!socket) return;

    // Слушаем новые сообщения
    socket.on('new_message', (message: Message) => {
      setMessages(prev => ({
        ...prev,
        [message.chatId]: [...(prev[message.chatId] || []), message]
      }));

      // Обновляем чат
      setChats(prev => prev.map(chat => 
        chat.id === message.chatId 
          ? { 
              ...chat, 
              lastMessage: message, 
              updatedAt: new Date(),
              unreadCount: chat.id === activeChat ? 0 : chat.unreadCount + 1
            }
          : chat
      ));
    });

    // Слушаем статус прочтения
    socket.on('message_read', (data: { chatId: string; messageId: string; userId: string }) => {
      setMessages(prev => ({
        ...prev,
        [data.chatId]: (prev[data.chatId] || []).map(msg => 
          msg.id === data.messageId ? { ...msg, isRead: true } : msg
        )
      }));
    });

    // Слушаем статус онлайн/офлайн пользователей
    socket.on('user_online', (data: { userId: string; isOnline: boolean }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, isOnline: data.isOnline, lastSeen: data.isOnline ? undefined : new Date() }
          : user
      ));
    });

    // Слушаем индикатор печати
    socket.on('user_typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
      // Можно добавить состояние для отображения "пользователь печатает..."
      console.log(`User ${data.userId} is ${data.isTyping ? 'typing' : 'not typing'} in chat ${data.chatId}`);
    });
  };

  const cleanupSocketListeners = () => {
    const socket = apiClient.getSocket();
    if (!socket) return;

    socket.off('new_message');
    socket.off('message_read');
    socket.off('user_online');
    socket.off('user_typing');
  };

  const joinChat = (chatId: string) => {
    apiClient.joinChat(chatId);
    setActiveChat(chatId);
  };

  const leaveChat = (chatId: string) => {
    apiClient.leaveChat(chatId);
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  const getChatName = useCallback((chat: Chat, currentUserId: string): string => {
    if (chat.type === 'group') {
      return chat.name || 'Групповой чат';
    }
    
    const otherUserId = chat.participants.find(id => id !== currentUserId);
    const otherUser = users.find(user => user.id === otherUserId);
    return otherUser?.name || 'Неизвестный пользователь';
  }, [users]);

  const getChatAvatar = useCallback((chat: Chat, currentUserId: string): string => {
    if (chat.type === 'group') {
      return chat.avatar || 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2';
    }
    
    const otherUserId = chat.participants.find(id => id !== currentUserId);
    const otherUser = users.find(user => user.id === otherUserId);
    return otherUser?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2';
  }, [users]);

  const getUnreadCount = useCallback(() => {
    return chats.reduce((total, chat) => total + chat.unreadCount, 0);
  }, [chats]);

  return {
    chats,
    messages,
    users,
    activeChat,
    loading,
    error,
    setActiveChat: joinChat,
    sendMessage,
    markAsRead,
    createChat,
    loadChatMessages,
    getChatName,
    getChatAvatar,
    getUnreadCount,
    joinChat,
    leaveChat,
  };
};

