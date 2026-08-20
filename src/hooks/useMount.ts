import { TimerCallbackHandler } from "./Types";
import React from "react";

/**
 * Run a callback once when the component mounts.
 * @param {TimerCallbackHandler} callback Mount callback
 * @returns {void}
 */
export function useMount(callback: TimerCallbackHandler): void {
  const callbackRef = React.useRef<TimerCallbackHandler>(callback);

  /**
   * Keep the latest callback available to the mount effect.
   */
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    callbackRef.current?.();
  }, []);
}
