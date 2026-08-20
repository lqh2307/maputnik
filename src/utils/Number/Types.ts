/** Defines create range number. */
export type CreateRangeNumber = {
  /** Start of the range. */
  start: number;
  /** End of the range. */
  end: number;
  /** Number of evenly spaced interior points. */
  pointsPerSegment?: number;
  /** Fixed interval between values. */
  step?: number;
  /** Alignment origin used with `step` (default: 0). */
  origin?: number;
  /** Exclude the start value from the result (default: false). */
  excludeStart?: boolean;
  /** Exclude the end value from the result (default: false). */
  excludeEnd?: boolean;
};
