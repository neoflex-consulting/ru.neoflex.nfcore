import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from "react-i18next";
import i18nextXHRBackend from "i18next-xhr-backend";

i18n
    .use(i18nextXHRBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        lng: 'en',
        fallbackLng: ['en'],
        debug: true,
        ns: ['common', 'packages'],
        defaultNS: 'common',
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",

        }
    });

export default i18n;
