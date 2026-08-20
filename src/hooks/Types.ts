/**
 * Options for useFetchAPI.
 */
export type UseFetchAPIProp = {
  /** Resource URL. */
  url: string;
  /** Options available for selection. */
  options: any;
};

/**
 * A function that has been throttled and can be canceled or flushed.
 */
export type ThrottledFunction<T extends (...args: any[]) => any> = ((
  ...args: Parameters<T>
) => void) & {
  /** Executes the cancel action. */
  cancel: () => void;
  /** Executes the flush action. */
  flush: () => void;
};

/**
 * A callback that can be invoked with a DOM event.
 */
export type EventCallbackHandler = (e: Event) => void;

/**
 * A timer callback.
 */
export type TimerCallbackHandler = () => void;

/**
 * A function that can be canceled or flushed.
 */
export type Cancelable = {
  /** Configuration for clear. */
  clear(): void;
  /** Configuration for flush. */
  flush(): void;
};
