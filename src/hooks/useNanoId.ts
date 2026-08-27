import { nanoid } from "nanoid";
import React from "react";

/**
 * Generate a unique ID that stays stable across renders.
 * @param prefix Optional text prepended to the stable id.
 * @param suffix Optional text appended to the stable id.
 * @returns Stable unique id for the lifetime of the component.
 */
export function useNanoId(prefix?: string, suffix?: string): string {
  const idRef = React.useRef<string>(nanoid());

  return `${prefix ?? ""}${idRef.current}${suffix ?? ""}`;
}
