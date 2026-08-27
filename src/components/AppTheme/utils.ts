import { ThemeMode, ThemeTokenMap } from "./Types";

/**
 * Normalize legacy theme names to the supported theme-mode union.
 * @param themeMode Requested theme (`dark`/`light` are mapped to aliases).
 * @returns Supported theme mode, defaulting to `system` for unknown values.
 */
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

/**
 * Read a theme token from a token map.
 * @param map Theme token map keyed by token name.
 * @param name Token key to read.
 * @param fallback Value returned when `name` is absent.
 * @returns The token's resolved value or `fallback`.
 */
export function getTokenValue(
  map: ThemeTokenMap,
  name: string,
  fallback: string
): string {
  return map[name]?.value ?? fallback;
}
