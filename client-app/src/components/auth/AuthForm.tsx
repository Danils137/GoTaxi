import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Car } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AuthMode, LoginForm, RegisterForm } from '../../types';

interface AuthFormProps {
  mode: AuthMode;
  loading?: boolean;
  error?: string | null;
  onSubmit: (data: LoginForm | RegisterForm) => void;
  onModeChange: (mode: AuthMode) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  loading = false,
  error,
  onSubmit,
  onModeChange
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === 'register') {
      if (!formData.name.trim()) {
        errors.name = 'Имя обязательно';
      }
      
      if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
        errors.phone = 'Неверный формат телефона';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Пароли не совпадают';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Неверный формат email';
    }

    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (mode === 'login') {
      onSubmit({
        email: formData.email,
        password: formData.password
      });
    } else {
      onSubmit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? 'Вход в GoTaxi' : 'Регистрация в GoTaxi'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {mode === 'login' 
              ? 'Войдите в свой аккаунт для доступа к чатам и заказу такси'
              : 'Создайте аккаунт для общения и заказа поездок'
            }
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {mode === 'register' && (
              <Input
                label="Имя"
                type="text"
                placeholder="Введите ваше имя"
                value={formData.name}
                error={validationErrors.name}
                required
                icon={<User className="w-4 h-4 text-gray-400" />}
                onChange={handleInputChange('name')}
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="Введите ваш email"
              value={formData.email}
              error={validationErrors.email}
              required
              icon={<Mail className="w-4 h-4 text-gray-400" />}
              onChange={handleInputChange('email')}
            />

            {mode === 'register' && (
              <Input
                label="Телефон (необязательно)"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                error={validationErrors.phone}
                icon={<Phone className="w-4 h-4 text-gray-400" />}
                onChange={handleInputChange('phone')}
              />
            )}

            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={formData.password}
                error={validationErrors.password}
                required
                icon={<Lock className="w-4 h-4 text-gray-400" />}
                onChange={handleInputChange('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Input
                  label="Подтвердите пароль"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  error={validationErrors.confirmPassword}
                  required
                  icon={<Lock className="w-4 h-4 text-gray-400" />}
                  onChange={handleInputChange('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </div>

          {/* Switch mode */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
              {' '}
              <button
                type="button"
                onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

