import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import enTranslation from "@/locales/en/translation.json";

const resources = {
    en: {
        translation: enTranslation,
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        debug: import.meta.env.DEV,
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
