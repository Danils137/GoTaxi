import React from 'react';
import { MessageCircle, Car, User, Settings } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: 'chats' | 'profile' | 'settings';
  unreadCount: number;
  hasActiveRide: boolean;
  onTabChange: (tab: 'chats' | 'profile' | 'settings') => void;
  onTaxiClick: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  unreadCount,
  hasActiveRide,
  onTabChange,
  onTaxiClick,
}) => {
  const tabs = [
    {
      key: 'chats' as const,
      label: 'Чаты',
      icon: MessageCircle,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      key: 'taxi' as const,
      label: 'Такси',
      icon: Car,
      badge: hasActiveRide ? '!' : undefined,
      onClick: onTaxiClick,
    },
    {
      key: 'profile' as const,
      label: 'Профиль',
      icon: User,
    },
    {
      key: 'settings' as const,
      label: 'Настройки',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden">
      <div className="grid grid-cols-4 h-16">
        {tabs.map(({ key, label, icon: Icon, badge, onClick }) => {
          const isActive = activeTab === key;
          const handleClick = onClick || (() => onTabChange(key as any));

          return (
            <button
              key={key}
              onClick={handleClick}
              className={`
                flex flex-col items-center justify-center space-y-1 relative
                transition-colors duration-200
                ${isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                
                {badge && (
                  <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                    {typeof badge === 'number' && badge > 99 ? '99+' : badge}
                  </div>
                )}
              </div>
              
              <span className="text-xs font-medium">
                {label}
              </span>
              
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

