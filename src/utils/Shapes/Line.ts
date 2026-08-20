import { LineStyle } from "../../types/Line";

/**
 * Clone an array of lines, creating new objects with copied points.
 * @param {T[]} items Array of line items to clone
 * @returns {T[]} New array of cloned line items
 *
 * @example
 * ```ts
 * cloneLines([]); // New array of cloned line items
 * ```
 */
export function cloneLines<T extends { points?: number[] }>(items: T[]): T[] {
  return items.map((item) => {
    return {
      ...item,
      points: item.points.slice(),
    };
  });
}

const LINE_DASHES: Record<LineStyle, number[]> = {
  none: [0, 0],
  solid: [5, 0],
  dashed: [10, 5],
  longDashed: [10, 10],
  dotted: [2, 5],
  dashedDot: [10, 5, 2, 5],
};

/**
 * Get dash pattern by line style.
 * @param {LineStyle} style Line style
 * @returns {number[]} Dash array (empty for solid/none)
 *
 * @example
 * ```ts
 * createLineDash("value"); // Dash array (empty for solid/none)
 * ```
 */
export function createLineDash(style: LineStyle): number[] {
  return LINE_DASHES[style];
}
