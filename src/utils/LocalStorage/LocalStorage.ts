/**
 * Get a value from local storage by key.
 * @param {string} key Storage key
 * @param {T} [fallback] Optional fallback value if key is missing
 * @returns {T} Parsed value, or undefined if missing
 *
 * @example
 * ```ts
 * getValue("missing-key", "fallback"); // "fallback"
 * ```
 */
export function getValue<T>(key: string, fallback?: T): T {
  const value: string = localStorage.getItem(key);

  return value ? JSON.parse(value) : fallback;
}

/**
 * Set a value in local storage (JSON serialized).
 * @param {string} key Storage key
 * @param {any} value Value to store
 * @returns {void}
 *
 * @example
 * ```ts
 * setValue("editor.zoom", 2); // stores "2" under the "editor.zoom" localStorage key.
 * ```
 */
export function setValue(key: string, value: any): void {
  return localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Remove a value from local storage by key.
 * @param {string} key Storage key
 * @returns {void}
 *
 * @example
 * ```ts
 * clearValue("editor.zoom"); // removes the "editor.zoom" localStorage key.
 * ```
 */
export function clearValue(key: string): void {
  return localStorage.removeItem(key);
}

/**
 * Clear all values from local storage.
 * @returns {void}
 *
 * @example
 * ```ts
 * clearAll(); // removes every key from localStorage.
 * ```
 */
export function clearAll(): void {
  return localStorage.clear();
}
