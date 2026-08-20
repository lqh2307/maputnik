import { ThemeMode, ThemeTokenMap } from "./Types";

/** Provides normalize theme mode. */
export function normalizeThemeMode(themeMode: string): ThemeMode {
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

/** Performs get token value. */
export function getTokenValue(
  map: ThemeTokenMap,
  name: string,
  fallback: string
): string {
  return map[name]?.value ?? fallback;
}
