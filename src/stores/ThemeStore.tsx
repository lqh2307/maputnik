import { ThemeMode } from "../components/AppTheme";
import { ThemeAction, ThemeStore } from "./Types";
import { DEFAULT_THEME_MODE } from "../configs";
import { create } from "zustand";

/** Zustand hook for the application theme preference. */
export const useThemeStore = create<ThemeStore & ThemeAction>()((set) => {
  // =========================
  // Start Methods
  // =========================

  /** Updates the application theme preference. */
  function setTheme(themeMode: ThemeMode): void {
    set({
      themeMode,
    });
  }

  // =========================
  // End Methods
  // =========================

  return {
    // =========================
    // Attributes
    // =========================

    themeMode: DEFAULT_THEME_MODE,

    // =========================
    // Methods
    // =========================

    setTheme,
  };
});
