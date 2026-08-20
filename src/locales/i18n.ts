import translationVI from "./vietnamese/translation.json";
import translationEN from "./english/translation.json";
import editorEN from "./english/editor.json";
import editorVI from "./vietnamese/editor.json";
import { initReactI18next } from "react-i18next";
import i18n from "i18next";

const resources = {
  english: {
    translation: translationEN,
    editor: editorEN,
  },
  vietnamese: {
    translation: translationVI,
    editor: editorVI,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("maputnik-language") || "vietnamese",
  fallbackLng: "vietnamese",
  supportedLngs: ["english", "vietnamese"],
  ns: ["translation", "editor"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
