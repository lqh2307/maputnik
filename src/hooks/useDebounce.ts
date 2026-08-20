import { Cancelable } from "./Types";
import React from "react";

/**
 * Create a debounced callback that stays stable across renders.
 * @param {T} callback Callback to debounce
 * @param {number} delay Delay in milliseconds
 * @returns {((...args: Parameters<T>) => void) & Cancelable} debounced callback
 */
export function useDebounce<T extends (...args: any) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) & Cancelable {
  const callbackRef = React.useRef<T>(callback);

  /**
   * Keep the latest callback available for debouncing.
   */
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debounced = React.useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let lastArgs: Parameters<T>;

    const clear = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);

        timeoutId = undefined;
      }
    };

    const callback = ((...args: Parameters<T>) => {
      lastArgs = args;

      clear();

      timeoutId = setTimeout(() => {
        timeoutId = undefined;

        if (lastArgs) {
          callbackRef.current?.(...lastArgs);
        }

        lastArgs = undefined;
      }, delay);
    }) as ((...args: Parameters<T>) => void) & Cancelable;

    callback.clear = () => {
      clear();

      lastArgs = undefined;
    };

    callback.flush = () => {
      if (!lastArgs) {
        return;
      }

      clear();

      callbackRef.current?.(...lastArgs);

      lastArgs = undefined;
    };

    return callback;
  }, [delay]);

  React.useEffect(() => {
    return () => {
      debounced.clear();
    };
  }, [debounced]);

  return debounced;
}
