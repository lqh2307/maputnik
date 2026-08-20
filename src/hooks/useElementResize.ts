import React from "react";

/**
 * Track element size with a resize listener.
 * @returns {void}
 */
export function useElementResize<T extends HTMLElement>(
  ref: React.RefObject<T>,
  func: (entry?: ResizeObserverEntry) => void
): void {
  const funcRef = React.useRef<(entry?: ResizeObserverEntry) => void>(func);

  React.useEffect(() => {
    funcRef.current = func;
  }, [func]);

  React.useEffect(() => {
    const elm: T = ref.current;
    if (!elm) {
      return;
    }

    let animationFrameId: number;
    let pendingEntry: ResizeObserverEntry;

    const resizeObs: ResizeObserver = new ResizeObserver((entries) => {
      pendingEntry = entries[0];

      cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        funcRef.current(pendingEntry);
      });
    });

    resizeObs.observe(elm);

    return () => {
      cancelAnimationFrame(animationFrameId);

      resizeObs.disconnect();
    };
  }, [ref]);
}
