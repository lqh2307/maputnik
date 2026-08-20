import { Format, Unit } from "../../types/Common";
import { WindowSize } from "../../types/Window";
import { ToFromPixelOption } from "./Types";
import mime from "mime";

/**
 * Delay execution for a number of milliseconds.
 * @param {number} ms Delay time in milliseconds (>= 0)
 * @returns {Promise<void>} Resolves after delay
 *
 * @example
 * ```ts
 * await delay(0); // resolves on the next timer tick without returning a value.
 * ```
 */
export async function delay(ms: number): Promise<void> {
  if (ms >= 0) {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

/**
 * Get MIME type from a file format.
 * @param {Format} format File format (e.g., "png", "jpg", "json")
 * @returns {string} MIME type string, or undefined if unknown
 *
 * @example
 * ```ts
 * detectContentTypeFromFormat("png"); // "image/png"
 * ```
 */
export function detectContentTypeFromFormat(format: Format): string {
  return mime.getType(format);
}

const PAPER_BASE_SIZE: Record<string, WindowSize> = {
  a: {
    width: 841,
    height: 1189,
  },
  b: {
    width: 1000,
    height: 1414,
  },
  c: {
    width: 917,
    height: 1297,
  },
};

/**
 * Calculate the dimensions of a paper size based on its type (e.g., "A4", "B5").
 * Supports types A, B, and C with numeric sizes. For example, "A4" or "B5".
 * The size is calculated by starting from the base dimensions of the type (A, B, or C) and halving the dimensions for each increment in the numeric size.
 * @param {string} paperType Paper type string (e.g., "A4", "B5")
 * @returns {WindowSize} Dimensions of the paper size in pixels, or undefined if the input format is invalid or unknown
 *
 * @example
 * ```ts
 * calculatePaperSize("A1"); // { width: 594, height: 841 }
 * ```
 */
export function calculatePaperSize(paperType: string): WindowSize {
  const match: RegExpMatchArray = paperType
    ?.toLowerCase()
    .match(/^([abc])(\d+)$/);
  if (!match) {
    return;
  }

  const size: WindowSize = PAPER_BASE_SIZE[match[1]]
    ? {
        ...PAPER_BASE_SIZE[match[1]],
      }
    : undefined;
  if (!size) {
    return;
  }

  for (let i = 0; i < Number(match[2]); i++) {
    const newWidth: number = Math.floor(size.height / 2);

    size.height = size.width;
    size.width = newWidth;
  }

  return size;
}

/**
 * Check if the browser is Safari.
 * @returns {boolean} True if Safari
 *
 * @example
 * ```ts
 * isSafari(); // returns true in Safari user agents, otherwise false.
 * ```
 */
export function isSafari(): boolean {
  const ua: string = navigator.userAgent.toLowerCase();

  return (
    ua.includes("safari") &&
    !ua.includes("chrome") &&
    !ua.includes("crios") &&
    !ua.includes("fxios")
  );
}

const UNIT_FACTORS: Record<string, number> = {
  km: 1000,
  hm: 100,
  dam: 10,
  m: 1,
  dm: 0.1,
  cm: 0.01,
  mm: 0.001,
};

/**
 * Convert a length between metric units.
 * @param {number} value Numeric value
 * @param {Unit} from Source unit
 * @param {Unit} to Target unit
 * @returns {number} Converted value
 *
 * @example
 * ```ts
 * convertLength(1, "m", "cm"); // 100
 * ```
 */
export function convertLength(value: number, from: Unit, to: Unit): number {
  return (
    (value * (UNIT_FACTORS[from] ?? UNIT_FACTORS["m"])) /
    (UNIT_FACTORS[to] ?? UNIT_FACTORS["m"])
  );
}

/**
 * Convert a metric length to pixels using DPI.
 * @param {ToPixelOption} option Conversion options
 * @returns {number} Value in pixels
 *
 * @example
 * ```ts
 * toPixel({ value: 0.0254, unit: "m", ppi: 96 }); // 96
 * ```
 */
export function toPixel(option: ToFromPixelOption): number {
  const value: number =
    (option.value *
      (option.ppi ?? 96) *
      (UNIT_FACTORS[option.unit] ?? UNIT_FACTORS["m"])) /
    0.0254;

  return option.round ? Math.round(value) : value;
}

/**
 * Convert pixels to a metric length using DPI.
 * @param {FromPixelOption} option Conversion options
 * @returns {number} Value in target unit
 *
 * @example
 * ```ts
 * fromPixel({ value: 96, unit: "m", ppi: 96 }); // 0.0254
 * ```
 */
export function fromPixel(option: ToFromPixelOption): number {
  const value: number =
    (option.value * 0.0254) /
    ((option.ppi ?? 96) * (UNIT_FACTORS[option.unit] ?? UNIT_FACTORS["m"]));

  return option.round ? Math.round(value) : value;
}
