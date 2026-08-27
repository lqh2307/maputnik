/**
 * Get a value from local storage by key.
 * @param {string} key Storage key
 * @param fallback Optional value returned when the key is missing.
 * @returns Parsed JSON value, or fallback when missing.
 *
 * @example
 * ```ts
 * getValue("missing-key", "fallback"); // "fallback"
 * ```
 */
export function getValue<T>(key: string, fallback?: T): T {
  try {
    const value: string = localStorage.getItem(key);

    return value ? JSON.parse(value) : fallback;
  } catch {
    console.warn("Error getting value from local storage");

    return fallback;
  }
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
  try {
    return localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("Error setting value in local storage");
  }
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
