import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Staticky importovať preklady
import translationSK from './locales/sk/translation.json';
import translationEN from './locales/en/translation.json';

// Silne nastaviť slovenčinu, aby sa zabezpečilo, že bude použitá
localStorage.setItem('i18nextLng', 'sk');

// Inicializácia i18next
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
    debug: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Preťažiť metódu t, aby vždy vrátila samotný kľúč, ak nie je nájdený preklad
const originalT = i18n.t.bind(i18n);
i18n.t = function(key) {
  const translation = originalT(key);
  if (typeof translation === 'object') {
    console.warn(`Translation for ${key} is an object, returning key instead:`, translation);
    return key;
  }
  return translation || key; 
};

export default i18n; 