import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
    { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
    { code: 'et', name: 'Eesti', flag: '🇪🇪' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <Globe className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {languages.find(lang => lang.code === language)?.flag}
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as any)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                language === lang.code 
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;