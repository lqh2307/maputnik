/**
 * Create a debounced function.
 *
 * @example
 * ```ts
 * const [debounced, cancel] = debounce((value: string) => console.log(value), 300);
 * debounced("hello");
 * cancel();
 * ```
 *
 * @param {T} func Function to debounce
 * @param {number} delay Delay in milliseconds
 * @returns {[(...args: Parameters<T>) => void, () => void]} [debounced, cancel]
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debounced = function (...args: Parameters<T>): void {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      return func(...args);
    }, delay);
  };

  const cancel = () => {
    clearTimeout(timeoutId);
  };

  return [debounced, cancel];
}
