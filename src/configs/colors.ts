import colorTokens from "./color/color.json";
import { ThemeMode } from "../components/AppTheme";

/** Defines the TokenItem type. */
type TokenItem = {
  value: string;
};

/** Defines the ThemeTokenMap type. */
type ThemeTokenMap = Record<string, TokenItem>;

/** Defines the ThemeTokenName type. */
type ThemeTokenName = "Black" | "Blue" | "Grey" | "White";

/** Defines the LegacyThemeMode type. */
type LegacyThemeMode = ThemeMode | "light" | "dark";

/** Performs normalize theme mode. */
function normalizeThemeMode(themeMode: LegacyThemeMode): ThemeMode {
  if (themeMode === "dark") {
    return "black";
  }

  if (themeMode === "light") {
    return "white";
  }

  if (
    themeMode === "black" ||
    themeMode === "blue" ||
    themeMode === "grey" ||
    themeMode === "white" ||
    themeMode === "system"
  ) {
    return themeMode;
  }

  return "system";
}

/** Performs resolve theme token name. */
function resolveThemeTokenName(
  themeMode: LegacyThemeMode,
  prefersDarkMode: boolean
): ThemeTokenName {
  const resolvedThemeMode: ThemeMode = normalizeThemeMode(themeMode);

  if (resolvedThemeMode === "system") {
    return prefersDarkMode ? "Black" : "White";
  }

  if (resolvedThemeMode === "black") {
    return "Black";
  }

  if (resolvedThemeMode === "blue") {
    return "Blue";
  }

  if (resolvedThemeMode === "grey") {
    return "Grey";
  }

  return "White";
}

/** Performs get theme token map. */
function getThemeTokenMap(tokenName: ThemeTokenName): ThemeTokenMap {
  return ((colorTokens as Record<string, ThemeTokenMap>)[tokenName] ??
    {}) as ThemeTokenMap;
}

/** Performs get token value. */
function getTokenValue(
  map: ThemeTokenMap,
  name: string,
  fallback: string
): string {
  return map[name]?.value ?? fallback;
}

const lightTokenMap: ThemeTokenMap = getThemeTokenMap("White");

/** Configuration constant for ui color. */
export const UI_COLOR = {
  accent: getTokenValue(lightTokenMap, "border-selected", "#0065ff"),
  accentShadow: "0 2px 8px rgba(0, 101, 255, 0.35)",
  success: getTokenValue(lightTokenMap, "bg-badge-success", "#36b37e"),
  warning: getTokenValue(lightTokenMap, "bg-badge-warning", "#ffab00"),
  error: getTokenValue(lightTokenMap, "bg-badge-error", "#fa4d56"),
};

/** Configuration constant for interactive hover style. */
export const INTERACTIVE_HOVER_STYLE = {
  cursor: "pointer",
  transition:
    "border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
  "&&:hover": {
    outline: `2px solid ${UI_COLOR.accent}`,
    boxShadow: UI_COLOR.accentShadow,
    transform: "translateY(-2px)",
    backgroundColor: "action.hover",
  },
};

/** Performs is dark theme. */
export function isDarkTheme(
  themeMode: LegacyThemeMode,
  prefersDarkMode: boolean
): boolean {
  return resolveThemeTokenName(themeMode, prefersDarkMode) === "Black";
}

/** Performs get surface palette. */
export function getSurfacePalette(
  themeMode: LegacyThemeMode,
  prefersDarkMode: boolean
): {
  barBackgroundColor: string;
  borderColor: string;
  panelBorderColor: string;
  toggleButtonBg: string;
  checkerPrimaryColor: string;
  checkerSecondaryColor: string;
} {
  const tokenName: ThemeTokenName = resolveThemeTokenName(
    themeMode,
    prefersDarkMode
  );

  const tokenMap: ThemeTokenMap = getThemeTokenMap(tokenName);

  return {
    barBackgroundColor: getTokenValue(tokenMap, "bg-sidebar", "#f4f5f7"),
    borderColor: getTokenValue(tokenMap, "border-default", "#dce3ea"),
    panelBorderColor: getTokenValue(tokenMap, "border-card", "#dce3ea"),
    toggleButtonBg: getTokenValue(tokenMap, "bg-button-icon", "#f0f2f5"),
    checkerPrimaryColor: getTokenValue(tokenMap, "bg-row-light", "#eef1f5"),
    checkerSecondaryColor: getTokenValue(tokenMap, "bg-row-dark", "#e6e9ee"),
  };
}

// Defined colors
export const BLACK_COLOR: string = "#000000";
export const WHITE_COLOR: string = "#ffffff";
export const GRAY_COLOR: string = "#555555";
export const LIGHT_GRAY_COLOR: string = "#dddddd";
export const RED_COLOR: string = "#ff0000";

export const YELLOW_COLOR: string = "#ffff00";
export const ORANGE_COLOR: string = "#ffa500";

export const GREEN_COLOR: string = "#00ff00";
export const LIME_COLOR: string = "#a5ff00";

export const BLUE_COLOR: string = "#0000ff";
export const LIGHT_BLUE_COLOR: string = "#00a5ff";

export const CYAN_COLOR: string = "#00ffff";
export const LIGHT_CYAN_COLOR: string = "#a5ffff";

export const MAGENTA_COLOR: string = "#ff00ff";
export const LIGHT_MAGENTA_COLOR: string = "#ffa5ff";

export const TRANSPARENT_COLOR: string = "rgba(255,255,255,0)";
