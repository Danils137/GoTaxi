import React from 'react';
import { Bell, Search, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <header className="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border px-6 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              className="input pl-10 w-80"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSelector />
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={t('header.switchTheme').replace('{mode}', theme === 'light' ? t('header.dark') : t('header.light'))}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            ) : (
              <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
          
          <button className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-600 dark:text-slate-400">{t('header.lastLogin')}:</span>
            <span className="text-slate-900 dark:text-slate-100 font-medium">{t('header.today')}, 9:24 AM</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;