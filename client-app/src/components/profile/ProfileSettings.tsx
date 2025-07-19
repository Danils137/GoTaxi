import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Moon, Sun, LogOut, Save, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { User as UserType, Theme } from '../../types';

interface ProfileSettingsProps {
  user: UserType;
  theme: Theme;
  onUpdateProfile: (data: any) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onBack?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  theme,
  onUpdateProfile,
  onToggleTheme,
  onLogout,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Профиль и настройки
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Профиль
            </h2>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="xl"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-2 shadow-lg hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <Input
                label="Имя"
                value={formData.name}
                onChange={handleInputChange('name')}
                disabled={!isEditing}
                icon={<User className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                disabled={!isEditing}
                icon={<Mail className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label="Телефон"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={!isEditing}
                placeholder="Не указан"
                icon={<Phone className="w-4 h-4 text-gray-400" />}
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3">
                <Button
                  onClick={handleSave}
                  loading={saving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Настройки
          </h2>

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Темная тема
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {theme === 'dark' ? 'Включена' : 'Выключена'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onToggleTheme}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Уведомления
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Получать уведомления о новых сообщениях и поездках
                </p>
              </div>
              
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Звуковые уведомления
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Воспроизводить звук при получении сообщений
                </p>
              </div>
              
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            О приложении
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Версия</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Последнее обновление</span>
              <span>19.07.2025</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              className="w-full text-gray-600 dark:text-gray-400"
            >
              Политика конфиденциальности
            </Button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <Button
            variant="danger"
            onClick={onLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
};

