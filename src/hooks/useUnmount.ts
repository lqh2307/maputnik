import { TimerCallbackHandler } from "./Types";
import React from "react";

/**
 * Run a callback once when the component unmounts.
 * @param {TimerCallbackHandler} callback Unmount callback
 * @returns {void}
 */
export function useUnmount(callback: TimerCallbackHandler): void {
  const callbackRef = React.useRef<TimerCallbackHandler>(callback);

  /**
   * Keep the latest callback available for cleanup.
   */
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    return () => {
      callbackRef.current?.();
    };
  }, []);
}
