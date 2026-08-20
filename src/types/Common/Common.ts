/** Supported raster-tile edge lengths in pixels. */
export type TileSize = 256 | 512;
/** Tile row-origin convention. */
export type TileScheme = "tms" | "xyz";
/** Geographic bounding box as `[minLongitude, minLatitude, maxLongitude, maxLatitude]`. */
export type BBox = [number, number, number, number];
/** Generic rectangular extent as `[minX, minY, maxX, maxY]`. */
export type Extent = [number, number, number, number];
/** Two-dimensional coordinate as `[x, y]` or `[longitude, latitude]` by context. */
export type Point = [number, number];
/** Two-dimensional size as `[width, height]`. */
export type Size = [number, number];

/** Metric distance unit. */
export type Unit = "km" | "hm" | "dam" | "m" | "dm" | "cm" | "mm";

/** Supported raster image formats. */
export type ImageFormat = "png" | "jpg" | "jpeg" | "gif" | "webp" | "svg";
/** Supported video-container formats. */
export type VideoFormat = "mp4" | "webm";
/** Supported text-based export formats. */
export type TextFormat = "pbf" | "xml" | "json" | "geojson" | "pdf";
/** Supported binary archive formats. */
export type BlobFormat = "zip";
/** Any supported file format. */
export type Format = ImageFormat | VideoFormat | TextFormat | BlobFormat;

/** Cardinal hemisphere used with a geographic coordinate. */
export type Hemisphere = "N" | "S" | "E" | "W";

/** Geographic coordinate represented in degrees, minutes, seconds, and hemisphere. */
export type DMSH = {
  /** Whole-degree component. */
  degree: number;
  /** Minute component. */
  minute: number;
  /** Second component. */
  second: number;
  /** Optional cardinal hemisphere. */
  hemisphere?: Hemisphere;
};

/** Relative layer-order operation. */
export type LayerAction = "back" | "front" | "backward" | "forward";
/** Geographic coordinate axis. */
export type AxisGlobe = "longitude" | "latitude";
/** Cartesian two-dimensional axis. */
export type Axis2D = "x" | "y";
/** Cartesian three-dimensional axis. */
export type Axis3D = "x" | "y" | "z";
/** Start or end edge along an axis. */
export type Edge = "start" | "end";

/** Coordinate label output format. */
export type CoordinateFormat = "DD" | "DDM" | "DMS" | "DMSH";
/** Visual style used by a coordinate frame. */
export type FrameStyle = "standard" | "fancy";
/** Rendering mode for one side of a coordinate frame. */
export type CoordinateFrameSide = "none" | "line" | "ticks" | "annotated";
export type WindowSide = "top" | "right" | "bottom" | "left";
