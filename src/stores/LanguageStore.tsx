import { LanguageAction, LanguageStore } from "./Types";
import { DEFAULT_LANGUAGE } from "../configs";
import i18n from "../locales/i18n";
import { create } from "zustand";

/** Zustand hook for the application language preference. */
export const useLanguageStore = create<LanguageStore & LanguageAction>()((
  set
) => {
  // =========================
  // Start Methods
  // =========================

  /** Updates the application language and syncs with i18n and localStorage. */
  function setLanguage(language: string): void {
    set(() => {
      i18n.changeLanguage(language);

      return {
        language,
      };
    });
  }

  // =========================
  // End Methods
  // =========================

  return {
    // =========================
    // Attributes
    // =========================

    language: DEFAULT_LANGUAGE,

    // =========================
    // Methods
    // =========================

    setLanguage,
  };
});
