import { Fit, WindowSize } from "../../types/Window";
import { LineStyle } from "../../types/Line";
import { Point } from "../../types/Common";

/** Output encoding strategy used by image utilities. */
export type EncodeType = "base64DataURL" | "objectURL";
/** Defines curve type. */
export type CurveType = "curve" | "bezier";

/** Stroke options. */
export type StrokeOption = FillOption & {
  /** Border width in pixels (default: 1). */
  width?: number;
  /** Border line pattern (default: solid). */
  style?: LineStyle;

  /** Stroke line cap style. */
  lineCap?: CanvasLineCap;
  /** Stroke line join style. */
  lineJoin?: CanvasLineJoin;

  /** Stroke length in pixels, used by tick marks. */
  length?: number;
};

/** Fill options. */
export type FillOption = {
  /** Canvas fill style. */
  color?: string;

  /** Fill opacity from 0 (transparent) to 1 (opaque). */
  opacity?: number;

  /** Optional gradient-stop offset from 0 to 1. */
  offset?: number;
};

/** Defines font option. */
export type FontOption = {
  /** CSS font family used by the canvas text renderer. */
  font?: string;
  /** Font size in pixels. */
  size?: number;
  /** Horizontal text alignment. */
  align?: CanvasTextAlign;
  /** Vertical text baseline. */
  baseline?: CanvasTextBaseline;
};

/** Text drawing options. */
export type TextOption = {
  /** Optional transform applied before drawing text. */
  transform?: TransformOption;
  /** CSS font family used by the canvas text renderer. */
  font?: FontOption;
  /** Text fill styling. */
  fill?: FillOption;
  /** Text stroke styling. */
  stroke?: StrokeOption;
  /** Text content to draw. */
  text?: string;
};

/** Line drawing options. */
export type LineOption = {
  /** Optional transform applied before drawing the line polyline. */
  transform?: TransformOption;
  /** Stroke used to draw the line. */
  stroke?: StrokeOption;
  /** x/y coordinates: [x, y]. */
  points?: Point;
};

/** Polyline drawing options. */
export type PolylineOption = {
  /** Optional transform applied before drawing the polyline. */
  transform?: TransformOption;
  /** Stroke used to draw the connected segments. */
  stroke?: StrokeOption;
  /** Flat list of x/y vertices: [x1, y1, x2, y2, ...]. */
  points?: number[];
  /** Fill applied when the polyline is closed. */
  fill?: FillOption;
  /** Whether closed. */
  closed?: boolean;
};

/** Curve drawing options. */
export type CurveOption = {
  /** Optional transform applied before drawing the curve. */
  transform?: TransformOption;
  /** Stroke used to draw the sampled curve. */
  stroke?: StrokeOption;
  /** Flat list of x/y control points: [x1, y1, x2, y2, ...]. */
  points?: number[];
  /** Fill applied when the curve is closed. */
  fill?: FillOption;
  /** Whether closed. */
  closed?: boolean;
  /** Curve interpolation mode. */
  type?: CurveType;
  /** Number of sampled points per segment. */
  pointsPerSegment?: number;
};

/** Rectangle drawing options. */
export type RectOption = {
  /** Optional transform applied before drawing the rectangle. */
  transform?: TransformOption;
  /** Rectangle width in pixels. */
  width: number;
  /** Rectangle height in pixels. */
  height: number;
  /** Rectangle fill styling. */
  fill?: FillOption;
  /** Rectangle border styling. */
  stroke?: StrokeOption;
};

/** Image drawing options. */
export type ImageOption = {
  /** Optional transform applied before drawing the image. */
  transform?: TransformOption;
  /** Loaded canvas-compatible image source. */
  image: CanvasImageSource;
  /** Destination width in pixels; intrinsic width is used when omitted. */
  width?: number;
  /** Destination height in pixels; intrinsic height is used when omitted. */
  height?: number;
  /** Aspect-ratio fitting mode used inside the destination box. */
  fit?: Fit;
  /** Clear the complete target canvas before drawing. */
  clear?: boolean;
};

/** Options for creating and initializing an HTML canvas and its 2D context. */
export type CreateCanvasOption = {
  /** Optional DOM id assigned to the canvas element. */
  id?: string;
  /** Document used to create the element; useful for iframe or test contexts. */
  document?: Document;

  /** Content size in pixels, excluding the optional stroke overflow. */
  size: WindowSize;

  /** Canvas fill style (default: transparent - rgba(255,255,255,0)). */
  background?: FillOption;

  /** Border centered on the content boundary; half its width overflows each side. */
  stroke?: StrokeOption;

  /** Global alpha for the canvas (default: 1). */
  globalAlpha?: number;
};

/**
 * TransformOption is a type that represents the transformation properties of a shape.
 */
export type TransformOption = {
  /** Horizontal translation in pixels. */
  x?: number;
  /** Vertical translation in pixels. */
  y?: number;
  /** Clockwise rotation in degrees. */
  rotation?: number;
  /** Horizontal scale multiplier. */
  scaleX?: number;
  /** Vertical scale multiplier. */
  scaleY?: number;
  /** Horizontal skew factor passed to `CanvasRenderingContext2D.transform`. */
  skewX?: number;
  /** Vertical skew factor passed to `CanvasRenderingContext2D.transform`. */
  skewY?: number;
};
