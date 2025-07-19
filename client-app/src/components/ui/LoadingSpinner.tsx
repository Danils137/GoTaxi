import React from 'react';
import { BaseComponentProps } from '../../types';

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-4 border-t-transparent rounded-full animate-spin
        `}
      />
    </div>
  );
};

