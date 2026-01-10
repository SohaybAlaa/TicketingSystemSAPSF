import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import language resources
import ar from "./locale/ar.json";
import en from "./locale/en.json";

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ar", // Set initial language
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
