import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft, Image } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Chat, Message, User } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  users: User[];
  currentUser: User;
  loading?: boolean;
  error?: string | null;
  onSendMessage: (content: string, type?: 'text' | 'image') => void;
  onBack?: () => void;
  getChatName: (chat: Chat, currentUserId: string) => string;
  getChatAvatar: (chat: Chat, currentUserId: string) => string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  users,
  currentUser,
  loading = false,
  error,
  onSendMessage,
  onBack,
  getChatName,
  getChatAvatar,
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        onSendMessage(imageData, 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const formatMessageTime = (date: Date) => {
    try {
      const messageDate = new Date(date);
      const now = new Date();
      const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return messageDate.toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return formatDistanceToNow(messageDate, { 
          addSuffix: true, 
          locale: ru 
        });
      }
    } catch {
      return '';
    }
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId) || currentUser;
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === currentUser.id;
    const sender = getUserById(message.senderId);
    const prevMessage = messages[index - 1];
    const showAvatar = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);
    const showName = !isOwn && chat?.type === 'group' && showAvatar;

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isOwn && (
          <div className="mr-3">
            {showAvatar ? (
              <Avatar
                src={sender.avatar}
                name={sender.name}
                size="sm"
              />
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        )}

        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
          {showName && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-3">
              {sender.name}
            </p>
          )}
          
          <div
            className={`
              px-4 py-2 rounded-2xl
              ${isOwn 
                ? 'bg-primary-500 text-white rounded-br-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
              }
            `}
          >
            {message.type === 'image' ? (
              <img
                src={message.content}
                alt="Shared image"
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
          
          <div className={`flex items-center mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatMessageTime(message.timestamp)}
            </span>
            {isOwn && (
              <span className={`ml-2 text-xs ${message.isRead ? 'text-primary-500' : 'text-gray-400'}`}>
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Выберите чат
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Выберите чат из списка, чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  const chatName = getChatName(chat, currentUser.id);
  const chatAvatar = getChatAvatar(chat, currentUser.id);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <Avatar
              src={chatAvatar}
              name={chatName}
              size="md"
            />
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {chatName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {chat.type === 'group' 
                  ? `${chat.participants.length} участников`
                  : 'В сети'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        )}

        {error && (
          <div className="mb-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Начните общение, отправив первое сообщение
            </p>
          </div>
        )}

        {!loading && !error && messages.map((message, index) => 
          renderMessage(message, index)
        )}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="mr-3">
              <div className="w-8 h-8" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Введите сообщение..."
              className="
                w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                resize-none
              "
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          <Button
            type="submit"
            disabled={!messageText.trim()}
            className="mb-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

