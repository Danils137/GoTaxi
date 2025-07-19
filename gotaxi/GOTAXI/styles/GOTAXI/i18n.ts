import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './public/locales/en/common.json';
import ru from './public/locales/ru/common.json';
import lv from './public/locales/lv/common.json';

i18n
  .use(initReactI18next) // подключаем initReactI18next
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      lv: { translation: lv },
    },
    lng: 'en', // Язык по умолчанию
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
