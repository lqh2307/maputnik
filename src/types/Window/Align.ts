/** Horizontal alignment within a container. */
export type HorizontalAlign = "left" | "center" | "right";
/** Vertical alignment within a container. */
export type VerticalAlign = "top" | "middle" | "bottom";
/** Combined horizontal and vertical alignment. */
export type Align = {
  /** Horizontal alignment. */
  horizontal: HorizontalAlign;
  /** Vertical alignment. */
  vertical: VerticalAlign;
};
