import translationVI from "./vietnamese/translation.json";
import translationEN from "./english/translation.json";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE } from "../configs";
import i18n from "i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: translationEN,
    },
    vi: {
      translation: translationVI,
    },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
