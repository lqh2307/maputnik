import { Fit, Position, WindowSize } from "../../types/Window";
import { ImageFormat } from "../../types/Common";
import { ColorEffect } from "../../types/Color";
import { LineStyle } from "../../types/Line";
import { BoxRect } from "../../types/Box";

/** Output encoding strategy used by image utilities. */
export type EncodeType = "base64DataURL" | "objectURL";

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

/** Options for extending (adding padding to) an image/canvas. */
export type ExtendOption = {
  /** Padding box in pixels. */
  extend: BoxRect;

  /** Fill style for the extended area (default: transparent - rgba(255,255,255,0)). */
  background?: FillOption;
};

/** Options for compositing another image onto a base canvas. */
export type CompositeOption = {
  /** Source image (HTTP/HTTPS URL, data URL, or object URL). */
  input: string;

  /** Left offset in pixels. */
  left: number;
  /** Top offset in pixels. */
  top: number;

  /** Background fill for the composite operation (default: transparent - rgba(255,255,255,0)). */
  background?: FillOption;
};

/** Options for extracting a rectangular region from an image/canvas. */
export type ExtractOption = WindowSize;

/** Options for resizing an image while preserving aspect ratio if desired. */
export type ResizeOption = {
  /** Target size in pixels. */
  size?: WindowSize;

  /** Fitting strategy when both width and height are provided. */
  fit?: Fit;
  /** Positioning strategy when the image is fitted/cropped. */
  position?: Position;
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

/**
 * High-level image creation pipeline options.
 * Most fields are optional and have sensible defaults inside the implementation.
 */
export type CreateImageOption = {
  /** Source image (HTTP/HTTPS URL, data URL, or object URL). */
  data?: string;
  /** Output image format (default: png). */
  format?: ImageFormat;
  /** Output encoding type (default: base64DataURL). */
  type?: EncodeType;

  /** Color effect to apply (default: origin). */
  colorEffect?: ColorEffect;
  /** Output opacity from 0 (transparent) to 1 (opaque). */
  opacity?: number;

  /** Options for transforming. */
  transform?: TransformOption;
  /** Options for creating a blank input canvas instead of loading `data`. */
  create?: CreateCanvasOption;
  /** Images to draw over the input canvas before subsequent processing. */
  composites?: CompositeOption[];
  /** Rectangular region to crop from the input canvas. */
  extract?: ExtractOption;
  /** Padding to add around the input canvas. */
  extend?: ExtendOption;
  /** Target dimensions and fitting behavior for resizing the image. */
  resize?: ResizeOption;
};
