/** Geometry variants used by complex-line drawing. */
export type ComplexDrawingMode =
  | "straight"
  | "curve"
  | "bezier"
  | "horizontal"
  | "vertical"
  | "half-circle-upper"
  | "half-circle-lower"
  | "half-ellipse-upper"
  | "half-ellipse-lower";

/** Supported freehand and constrained complex-shape drawing modes. */
export type DrawingMode =
  | `complex-line-${ComplexDrawingMode}`
  | `complex-path-${ComplexDrawingMode}`
  | "free-drawing";
