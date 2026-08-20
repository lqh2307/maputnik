const ESCAPED_STRING_VALUES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  '"': "&quot;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};

/**
 * Normalize a string for case/diacritic-insensitive matching.
 * @param {string} s Input string
 * @param {"NFC" | "NFD" | "NFKC" | "NFKD"} [form] Unicode normalization form
 * @returns {string} Normalized string
 *
 * @example
 * ```ts
 * normalizeString("value", undefined); // Normalized string
 * ```
 * @param {"NFC" | "NFD" | "NFKC" | "NFKD"} form Input value.
 */
export function normalizeString(
  s: string,
  form?: "NFC" | "NFD" | "NFKC" | "NFKD"
): string {
  return s
    ?.toLowerCase()
    .normalize(form)
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Capitalize the first letter of each word.
 * @param {string} str Input string
 * @returns {string} Capitalized string
 *
 * @example
 * ```ts
 * capitalizeWords("value"); // Capitalized string
 * ```
 */
export function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) => {
      return word.length > 0 ? word[0].toUpperCase() + word.slice(1) : "";
    })
    .join(" ");
}

/**
 * Escapes all XML special characters so a string can be safely embedded in
 * XML or SVG text and attribute values.
 */
export function escapeString(value: string): string {
  return value.replace(/[&"'<>]/g, (character) => {
    return ESCAPED_STRING_VALUES[character];
  });
}
