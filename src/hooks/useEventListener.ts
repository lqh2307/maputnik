import { EventCallbackHandler } from "./Types";
import React from "react";

/**
 * React hook for one stable event listener.
 * @param target EventTarget to observe.
 * @param eventName Event type, such as click or keydown.
 * @param callback Handler invoked with each event.
 * @param options Native listener options.
 */
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
