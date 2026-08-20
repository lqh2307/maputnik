/**
 * Create font style string based on italic/bold options.
 * @param {boolean} italic Italic option
 * @param {boolean} bold Bold option
 * @returns {string} Font style string
 *
 * @example
 * ```ts
 * createFontStyle(false, false); // Font style string
 * ```
 */
export function createFontStyle(italic?: boolean, bold?: boolean): string {
  if (italic && bold) {
    return "italic bold";
  } else if (italic) {
    return "italic";
  } else if (bold) {
    return "bold";
  } else {
    return "normal";
  }
}
