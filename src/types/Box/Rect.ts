/** Rectangle described by its four edges and optional center point. */
export type BoxRect = {
  /** X coordinate of the left edge. */
  left: number;
  /** Y coordinate of the top edge. */
  top: number;
  /** Y coordinate of the bottom edge. */
  bottom: number;
  /** X coordinate of the right edge. */
  right: number;
  /** Optional horizontal center coordinate. */
  centerX?: number;
  /** Optional vertical center coordinate. */
  centerY?: number;
};

export type BoxScale = {
  /** Horizontal box scale; a negative value represents a horizontal flip. */
  scaleX?: number;
  /** Vertical box scale; a negative value represents a vertical flip. */
  scaleY?: number;
};
