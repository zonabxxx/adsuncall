import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import prekladov
import translationSK from './i18n/locales/sk/translation.json';
import translationEN from './i18n/locales/en/translation.json';

// Force set language to SK
if (typeof window !== 'undefined') {
  localStorage.setItem('i18nextLng', 'sk');
}

// Jednoduchá synchronná inicializácia i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      sk: {
        translation: translationSK
      },
      en: {
        translation: translationEN
      }
    },
    lng: 'sk',
    fallbackLng: 'sk',
    interpolation: {
      escapeValue: false
    },
    debug: false
  });

// Override t function to handle objects as translations
const originalT = i18n.t.bind(i18n);
i18n.t = function(key, options) {
  const value = originalT(key, options);
  
  if (typeof value === 'object' && value !== null) {
    console.warn(`Key returned object: ${key}`);
    return key; 
  }
  
  return value;
};

export default i18n; 