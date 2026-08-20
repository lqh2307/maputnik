import { EventCallbackHandler } from "./Types";
import React from "react";

/** React hook for event listener. */
export function useEventListener(
  target: EventTarget,
  eventName: string,
  callback: EventCallbackHandler,
  options?: boolean | AddEventListenerOptions
): void {
  const callbackRef = React.useRef<EventCallbackHandler>(callback);

  /**
   * Keep the latest callback available to the event listener.
   */
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const element: EventTarget = target;
    if (!element?.addEventListener) {
      return;
    }

    const listener = (event: Event): void => {
      callbackRef.current?.(event);
    };

    element.addEventListener(eventName, listener, options);

    return () => {
      element.removeEventListener(eventName, listener, options);
    };
  }, [target, eventName, options]);
}
