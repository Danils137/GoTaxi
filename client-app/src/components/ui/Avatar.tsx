import React from 'react';
import { BaseComponentProps } from '../../types';

interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  name,
  isOnline,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        rounded-full overflow-hidden flex items-center justify-center
        ${src ? 'bg-gray-200 dark:bg-gray-700' : name ? generateColorFromName(name) : 'bg-gray-400'}
      `}>
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : name ? (
          <span className={`font-medium text-white ${textSizeClasses[size]}`}>
            {getInitials(name)}
          </span>
        ) : (
          <svg 
            className={`${sizeClasses[size]} text-gray-400`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </div>
      
      {isOnline !== undefined && (
        <div className={`
          absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800
          ${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
          ${isOnline ? 'bg-green-400' : 'bg-gray-400'}
        `} />
      )}
    </div>
  );
};

