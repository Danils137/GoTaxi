import React, { useState } from 'react';
import { Search, Plus, Settings, Car, MessageCircle, Users } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Chat, Message, User } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ChatSidebarProps {
  chats: Chat[];
  messages: Record<string, Message[]>;
  users: User[];
  activeChat: string | null;
  currentUser: User;
  unreadCount: number;
  loading?: boolean;
  error?: string | null;
  onChatSelect: (chatId: string) => void;
  onProfileClick: () => void;
  onTaxiClick: () => void;
  getChatName: (chat: Chat, currentUserId: string) => string;
  getChatAvatar: (chat: Chat, currentUserId: string) => string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  messages,
  users,
  activeChat,
  currentUser,
  unreadCount,
  loading = false,
  error,
  onChatSelect,
  onProfileClick,
  onTaxiClick,
  getChatName,
  getChatAvatar
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const filteredChats = chats.filter(chat => {
    const chatName = getChatName(chat, currentUser.id).toLowerCase();
    return chatName.includes(searchQuery.toLowerCase());
  });

  const formatLastMessageTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ru 
      });
    } catch {
      return '';
    }
  };

  const getLastMessagePreview = (chat: Chat) => {
    const chatMessages = messages[chat.id] || [];
    const lastMessage = chatMessages[chatMessages.length - 1] || chat.lastMessage;
    
    if (!lastMessage) return 'Нет сообщений';
    
    if (lastMessage.type === 'image') return '📷 Изображение';
    if (lastMessage.type === 'location') return '📍 Местоположение';
    
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="md"
              isOnline={true}
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                GoTaxi
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentUser.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onTaxiClick}
              className="relative"
            >
              <Car className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onProfileClick}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <Input
          type="search"
          placeholder="Поиск чатов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Новый чат
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onTaxiClick}
            className="flex items-center justify-center"
          >
            <Car className="w-4 h-4 mr-2" />
            Такси
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {searchQuery ? 'Чаты не найдены' : 'У вас пока нет чатов'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowNewChatModal(true)}
                className="mt-4"
              >
                Создать чат
              </Button>
            )}
          </div>
        )}

        {!loading && !error && filteredChats.map((chat) => {
          const isActive = activeChat === chat.id;
          const chatName = getChatName(chat, currentUser.id);
          const chatAvatar = getChatAvatar(chat, currentUser.id);
          const lastMessagePreview = getLastMessagePreview(chat);
          const hasUnread = chat.unreadCount > 0;

          return (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`
                flex items-center p-4 cursor-pointer transition-colors
                hover:bg-gray-50 dark:hover:bg-gray-700
                ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''}
              `}
            >
              <div className="relative">
                <Avatar
                  src={chatAvatar}
                  name={chatName}
                  size="md"
                />
                {chat.type === 'group' && (
                  <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`
                    text-sm font-medium truncate
                    ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                  `}>
                    {chatName}
                  </h3>
                  {chat.updatedAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatLastMessageTime(chat.updatedAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className={`
                    text-sm truncate
                    ${hasUnread ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}
                  `}>
                    {lastMessagePreview}
                  </p>
                  
                  {hasUnread && (
                    <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 ml-2 min-w-[20px] text-center">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Новый чат
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Выберите пользователя для начала чата:
              </p>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      // Здесь будет логика создания чата
                      console.log('Create chat with user:', user.id);
                      setShowNewChatModal(false);
                    }}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="sm"
                      isOnline={user.isOnline}
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.isOnline ? 'В сети' : 'Не в сети'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNewChatModal(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

