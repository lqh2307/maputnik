import React from "react";

/**
 * Keep the latest value in a ref.
 * @param {T} value Current value
 * @returns {React.RefObject<T>} Ref containing the latest value
 */
export function useLatest<T>(value: T): React.RefObject<T> {
  const valueRef = React.useRef<T>(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
}
