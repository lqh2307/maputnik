import Color, { ColorInstance } from "color";
import { RGBA } from "../../types/Color";
import { limitValue } from "../Number";

const COLOR_REGEX: RegExp =
  /(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b|rgba?\([^)]+\)|hsla?\([^)]+\)|\b[a-zA-Z]+\b)/g;

/**
 * Convert a color string to RGBA components.
 * @param {string} color Color string (`rgb`, `rgba`, or hex)
 * @param {number} alpha Optional alpha override (0-1)
 * @returns {RGBA} RGBA object, or undefined if input is invalid
 *
 * @example
 * ```ts
 * colorToRGBA("#ff0000", 0.5); // { r: 255, g: 0, b: 0, a: 0.5 }
 * ```
 */
export function colorToRGBA(color?: string, alpha?: number): RGBA {
  if (!color) {
    return;
  }

  try {
    const c: ColorInstance = Color(color);

    return {
      r: c.red(),
      g: c.green(),
      b: c.blue(),
      a: alpha !== undefined ? limitValue(alpha, 0, 1) : c.alpha(),
    };
  } catch {
    return;
  }
}

/**
 * Convert a color string to an `rgba(...)` string.
 * @param {string} color Color string (`rgb`, `rgba`, or hex)
 * @param {number} alpha Optional alpha override (0-1)
 * @returns {string} RGBA string, or undefined if input is invalid
 *
 * @example
 * ```ts
 * colorToRGBAString("#ff0000", 0.5); // "rgba(255,0,0,0.5)"
 * ```
 */
export function colorToRGBAString(color?: string, alpha?: number): string {
  const rgba: RGBA = colorToRGBA(color, alpha);
  if (!rgba) {
    return;
  }

  return `rgba(${rgba.r},${rgba.g},${rgba.b},${alpha === undefined ? 1 : (rgba.a ?? 1)})`;
}

/**
 * Generate a random hex color.
 * @returns {string} Hex string (e.g., "#A1B2C3")
 *
 * @example
 * ```ts
 * createRandomHex(); // returns a random string matching /^#[0-9a-f]{6}$/.
 * ```
 */
export function createRandomHex(): string {
  return `#${Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0")}${Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0")}${Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0")}`;
}

/**
 * Generate a random RGBA string.
 * @returns {string} RGBA string (e.g., "rgba(255, 128, 0, 0.7)")
 *
 * @example
 * ```ts
 * createRandomRGBAString(); // returns a random string in the form "rgba(r,g,b,a)".
 * ```
 */
export function createRandomRGBAString(): string {
  return `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.random()})`;
}

/**
 * Extract valid color tokens from a string.
 * @param {string} str Input string
 * @returns {string[]} Array of color strings
 *
 * @example
 * ```ts
 * extractColors("fill: #ff0000; stroke: rgba(0,0,0,0.5);"); // ["#ff0000", "rgba(0,0,0,0.5)"]
 * ```
 */
export function extractColors(str: string): string[] {
  const result: string[] = [];

  const matches: RegExpMatchArray = str.match(COLOR_REGEX);
  if (!matches) {
    return result;
  }

  for (const m of matches) {
    try {
      Color(m);

      result.push(m);
    } catch {}
  }

  return result;
}
