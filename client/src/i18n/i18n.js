import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import prekladov
import translationSK from './locales/sk/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  sk: {
    translation: translationSK
  },
  en: {
    translation: translationEN
  }
};

// Inicializácia i18next
i18n
  // detekcia jazyka
  .use(LanguageDetector)
  // prepojenie s React (i18n)
  .use(initReactI18next)
  // inicializácia
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // nie je potrebné pre React
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: true,
    },
  });

export default i18n; 