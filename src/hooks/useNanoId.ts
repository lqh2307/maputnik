import { nanoid } from "nanoid";
import React from "react";

/**
 * Generate a unique ID that stays stable across renders.
 * @param {string} [prefix] Optional prefix for the ID
 * @param {string} [suffix] Optional suffix for the ID
 * @returns {string} Unique ID
 */
export function useNanoId(prefix?: string, suffix?: string): string {
  const idRef = React.useRef<string>(nanoid());

  return `${prefix ?? ""}${idRef.current}${suffix ?? ""}`;
}
