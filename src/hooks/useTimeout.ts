import { TimerCallbackHandler } from "./Types";
import React from "react";

/**
 * Run a callback once after a delay.
 * @param {TimerCallbackHandler} callback Timer callback
 * @param {number} delay Delay in milliseconds
 * @returns {void}
 */
export function useTimeout(
  callback: TimerCallbackHandler,
  delay: number
): void {
  const callbackRef = React.useRef<TimerCallbackHandler>(callback);

  /**
   * Keep the latest callback available to the timer.
   */
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      callbackRef.current?.();
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay]);
}
