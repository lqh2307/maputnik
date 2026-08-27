const ESCAPED_STRING_VALUES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  '"': "&quot;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};

/**
 * Normalize a string for case/diacritic-insensitive matching.
 * @param s Text to lowercase and normalize before matching.
 * @param form Unicode normalization form passed to `String#normalize`.
 * @returns Lowercase text with combining diacritical marks removed.
 *
 * @example
 * ```ts
 * normalizeString("Café", "NFD"); // "cafe"
 * ```
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
 * @param str Text whose space-separated words should be capitalized.
 * @returns Text with the first character of each word uppercased.
 *
 * @example
 * ```ts
 * capitalizeWords("incident response"); // "Incident Response"
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
 * Escape all XML special characters for generated XML/SVG.
 * @param value Text to escape before embedding in markup.
 * @returns Text with ampersand, quote, apostrophe, angle-bracket entities.
 */
export function escapeString(value: string): string {
  return value.replace(/[&"'<>]/g, (character) => {
    return ESCAPED_STRING_VALUES[character];
  });
}
