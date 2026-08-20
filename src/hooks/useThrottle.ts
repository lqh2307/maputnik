import { ThrottledFunction } from "./Types";
import React from "react";

/**
 * Create a throttled callback that stays stable across renders.
 * @param {T} func Callback to throttle
 * @param {number} delay Delay in milliseconds
 * @returns {ThrottledFunction<T>} Throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ThrottledFunction<T> {
  const funcRef = React.useRef<T>(func);
  const lastRef = React.useRef<number>(0);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const argsRef = React.useRef<Parameters<T>>(undefined);

  /**
   * Keep the latest callback available for throttling.
   */
  React.useEffect(() => {
    funcRef.current = func;
  }, [func]);

  /**
   * Clear any pending trailing invocation.
   */
  const clearTimer = React.useCallback((): void => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = undefined;
    }
  }, []);

  /**
   * Invoke the latest callback with the provided arguments.
   */
  const invoke = React.useCallback((args: Parameters<T>): void => {
    lastRef.current = Date.now();

    argsRef.current = undefined;

    funcRef.current?.(...args);
  }, []);

  const throttled = React.useMemo<ThrottledFunction<T>>(() => {
    const callback = ((...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastRef.current;

      if (lastRef.current === 0 || elapsed >= delay) {
        clearTimer();

        invoke(args);

        return;
      }

      argsRef.current = args;

      if (timeoutRef.current === undefined) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = undefined;

          if (argsRef.current) {
            invoke(argsRef.current);
          }
        }, delay - elapsed);
      }
    }) as ThrottledFunction<T>;

    callback.cancel = () => {
      clearTimer();

      argsRef.current = undefined;
    };

    callback.flush = () => {
      if (argsRef.current) {
        clearTimer();

        invoke(argsRef.current);
      }
    };

    return callback;
  }, [delay]);

  React.useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return throttled;
}
