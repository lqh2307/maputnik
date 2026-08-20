import React from "react";

/**
 * Run a callback on every animation frame while mounted.
 * @param {FrameRequestCallback} callback RAF callback
 * @returns {void}
 */
export function useRAF(callback: FrameRequestCallback): void {
  const callbackRef = React.useRef<FrameRequestCallback>(callback);

  /**
   * Keep the latest callback available to the RAF loop.
   */
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    let frameId: number = 0;

    const loop = (time: DOMHighResTimeStamp): void => {
      callbackRef.current?.(time);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
}
