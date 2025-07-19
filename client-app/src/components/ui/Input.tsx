import React from 'react';
import { BaseComponentProps } from '../../types';

interface InputProps extends BaseComponentProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'search';
  placeholder?: string;
  value?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  error,
  disabled = false,
  required = false,
  icon,
  className = '',
  onChange,
  onFocus,
  onBlur,
}) => {
  const inputId = React.useId();

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`
            block w-full rounded-lg border border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-white 
            placeholder-gray-500 dark:placeholder-gray-400
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

