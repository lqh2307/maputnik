/** RGBA channels used to represent a color. */
export type RGBA = {
  /** Red channel value. */
  r?: number;
  /** Green channel value. */
  g?: number;
  /** Blue channel value. */
  b?: number;
  /** Alpha channel value. */
  a?: number;
};

/** Source and replacement colors used when transforming SVG markup. */
export type SVGColor = {
  /** Color found in the source SVG. */
  originColor?: string;
  /** Color that replaces {@link originColor}. */
  targetColor?: string;
};

/** Supported color-processing effects. */
export type ColorEffect =
  "origin" | "grayscale" | "sepia" | "invert" | "solarize";

export type ColorType = "color" | "linear-gradient" | "radial-gradient";
