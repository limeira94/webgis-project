import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './en-US.json';
import translationPT from './pt-BR.json';

const resources = {
  'en-US': {
    translation: translationEN
  },
  'pt-BR': {
    translation: translationPT
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: false,

    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
