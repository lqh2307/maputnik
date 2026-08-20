import { TimerCallbackHandler } from "./Types";
import React from "react";

/**
 * Run a callback repeatedly at a fixed interval.
 * @param {TimerCallbackHandler} callback Interval callback
 * @param {number} delay Delay in milliseconds
 * @returns {void}
 */
export function useInterval(
  callback: TimerCallbackHandler,
  delay: number
): void {
  const callbackRef = React.useRef<TimerCallbackHandler>(callback);

  /**
   * Keep the latest callback available to the interval.
   */
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
      callbackRef.current?.();
    }, delay);

    return () => {
      clearInterval(intervalId);
    };
  }, [delay]);
}
