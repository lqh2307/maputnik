import { Orientation, Align, Fit } from "../../types/Window";
import { LineStyle } from "../../types/Line";
import {
  CoordinateFrameSide,
  FrameStyle,
  ImageFormat,
  TileSize,
  BBox,
  Size,
} from "../../types/Common";

/** Coordinate notation used for labels in a geographic frame. */
export type CoordinateLabelFormat = "DD" | "DDM" | "DMS" | "DMSH";

/** Source images included in a PDF render. */
export type RenderPDFInput = {
  /** Data URLs or URLs of images to render. */
  images: string[];
};

/** Appearance of each rendered PDF page. */
export type RenderPDFPreview = {
  /** Raster format used for page previews. */
  format?: ImageFormat;
  /** Preview width in pixels. */
  width?: number;
  /** Preview height in pixels. */
  height?: number;
  /** Color of the page border. */
  lineColor?: string;
  /** Width of the page border. */
  lineWidth?: number;
  /** Stroke pattern of the page border. */
  lineStyle?: LineStyle;
};

/** Layout of images placed on a PDF page. */
export type RenderPDFGrid = {
  /** Number of grid rows. */
  row?: number;
  /** Number of grid columns. */
  column?: number;
  /** Horizontal page margin. */
  marginX?: number;
  /** Vertical page margin. */
  marginY?: number;
  /** Horizontal gap between grid cells. */
  gapX?: number;
  /** Vertical gap between grid cells. */
  gapY?: number;
};

/** Output and layout settings for a PDF render. */
export type RenderPDFOutput = {
  /** Alignment of content within each page. */
  alignContent?: Align;
  /** Whether the response is base64 encoded. */
  base64?: boolean;
  /** Whether output is converted to grayscale. */
  grayscale?: boolean;
  /** PDF page orientation. */
  orientation?: Orientation;
  /** Paper dimensions as `[width, height]`. */
  paperSize: Size;
  /** Image fitting strategy within a grid cell. */
  fit?: Fit;
  /** Grid configuration for image placement. */
  grid?: RenderPDFGrid;
  /** Page alignment used when paginating images. */
  pagination?: Align;
};

/** Request payload for standard PDF rendering. */
export type RenderPDFOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Images to render. */
  input: RenderPDFInput;
  /** Optional page-preview styling. */
  preview?: RenderPDFPreview;
  /** Output and page-layout settings. */
  output: RenderPDFOutput;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** An image and its desired output resolution for scale-preserving PDF rendering. */
export type RenderKeepRatioPDFImage = {
  /** Image data URL or URL. */
  image: string;
  /** Optional target resolution as `[width, height]`. */
  resolution?: Size;
};

/** Source images included in a scale-preserving PDF render. */
export type RenderKeepRatioPDFInput = {
  /** Images and optional resolutions to render. */
  images: RenderKeepRatioPDFImage[];
};

/** Appearance settings for scale-preserving PDF pages. */
export type RenderKeepRatioPDFPreview = {
  /** Raster format used for page previews. */
  format?: ImageFormat;
  /** Preview width in pixels. */
  width?: number;
  /** Preview height in pixels. */
  height?: number;
  /** Color of the page border. */
  lineColor?: string;
  /** Width of the page border. */
  lineWidth?: number;
  /** Stroke pattern of the page border. */
  lineStyle?: LineStyle;
  /** Background color of the page. */
  pageColor?: string;
  /** Font size used on the page. */
  pageSize?: number;
  /** Font family used on the page. */
  pageFont?: string;
};

/** Output settings for a scale-preserving PDF render. */
export type RenderKeepRatioPDFOutput = {
  /** Alignment of content within each page. */
  alignContent?: Align;
  /** Whether the response is base64 encoded. */
  base64?: boolean;
  /** Whether output is converted to grayscale. */
  grayscale?: boolean;
  /** PDF page orientation. */
  orientation?: Orientation;
  /** Paper dimensions as `[width, height]`. */
  paperSize: Size;
};

/** Request payload for scale-preserving PDF rendering. */
export type RenderKeepRatioPDFOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Images to render. */
  input: RenderKeepRatioPDFInput;
  /** Optional page-preview styling. */
  preview?: RenderKeepRatioPDFPreview;
  /** Output settings. */
  output: RenderKeepRatioPDFOutput;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Request settings for rendering one MapLibre style definition. */
export type RenderStyleJSONOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Optional identifier of the stored style. */
  styleId?: string;
  /** Inline MapLibre style definition. */
  styleJSON?: any;
  /** Map zoom level. */
  zoom: number;
  /** Geographic bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds: BBox;
  /** Device-pixel-ratio multiplier for tiles. */
  tileScale: number;
  /** Tile edge length in pixels. */
  tileSize: TileSize;
  /** Whether the response is base64 encoded. */
  base64?: boolean;
  /** Whether output is converted to grayscale. */
  grayscale?: boolean;
  /** Output image format. */
  format: ImageFormat;
  /** Optional output width in pixels. */
  width?: number;
  /** Optional output height in pixels. */
  height?: number;
  /** Map pitch in degrees. */
  pitch?: number;
  /** Map bearing in degrees. */
  bearing?: number;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Request settings for rendering multiple MapLibre style overlays. */
export type RenderStyleJSONsOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Style overlays to render. */
  overlays: RenderStyleJSONOption[];
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Request settings for rasterizing one SVG image. */
export type RenderSVGOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** SVG markup or image source to rasterize. */
  image: string;
  /** Optional output width in pixels. */
  width?: number;
  /** Optional output height in pixels. */
  height?: number;
  /** Output image format. */
  format: ImageFormat;
  /** Whether the response is base64 encoded. */
  base64?: boolean;
  /** Whether output is converted to grayscale. */
  grayscale?: boolean;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Request settings for rasterizing multiple SVG overlays. */
export type RenderSVGsOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** SVG overlays to rasterize. */
  overlays: RenderSVGOption[];
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Base image and geographic extent used when drawing a coordinate frame. */
export type AddFrameInput = {
  /** Image data URL or URL to decorate. */
  image: string;
  /** Geographic bounds represented by the image. */
  bounds: BBox;
};

/** Additional image rendered over the framed base image. */
export type AddFrameOverlay = {
  /** Overlay image data URL or URL. */
  image: string;
  /** Optional geographic bounds of the overlay. */
  bounds?: BBox;
};

/** Visual settings for the coordinate frame. */
export type AddFrameFrame = {
  /** Frame thickness in pixels. */
  frame?: number;
  /** Gap between the image and the frame in pixels. */
  space?: number;
  /** Frame background color. */
  background?: string;
  /** Overall frame style. */
  style?: FrameStyle;
  /** Rendering mode for each frame side. */
  sides?: {
    /** Rendering mode for the top side. */
    top?: CoordinateFrameSide;
    /** Rendering mode for the right side. */
    right?: CoordinateFrameSide;
    /** Rendering mode for the bottom side. */
    bottom?: CoordinateFrameSide;
    /** Rendering mode for the left side. */
    left?: CoordinateFrameSide;
  };
  /** Inner border appearance. */
  inner?: {
    /** Border color. */
    color?: string;
    /** Border width in pixels. */
    width?: number;
    /** Border stroke pattern. */
    style?: LineStyle;
  };
  /** Outer border appearance. */
  outer?: {
    /** Border color. */
    color?: string;
    /** Border width in pixels. */
    width?: number;
    /** Border stroke pattern. */
    style?: LineStyle;
  };
  /** Decorative settings used by the fancy frame style. */
  fancy?: {
    /** Size of a decorative cell in pixels. */
    size?: number;
    /** Primary decorative color. */
    color?: string;
    /** Alternating decorative color. */
    alternateColor?: string;
    /** Horizontal decorative-cell spacing. */
    stepX?: number;
    /** Vertical decorative-cell spacing. */
    stepY?: number;
  };
  /** Coordinate notation used for labels. */
  format?: CoordinateLabelFormat;
  /** Longitude interval between coordinate annotations. */
  longitudeAnnotationInterval?: number;
  /** Latitude interval between coordinate annotations. */
  latitudeAnnotationInterval?: number;
  /** Longitude interval between tick marks. */
  longitudeTickInterval?: number;
  /** Latitude interval between tick marks. */
  latitudeTickInterval?: number;
  /** Width of major tick marks in pixels. */
  majorTickWidth?: number;
  /** Width of minor tick marks in pixels. */
  minorTickWidth?: number;
  /** Length of major tick marks in pixels. */
  majorTickSize?: number;
  /** Length of minor tick marks in pixels. */
  minorTickSize?: number;
  /** Font size of major tick labels. */
  majorTickLabelSize?: number;
  /** Font size of minor tick labels. */
  minorTickLabelSize?: number;
  /** Color of major tick marks. */
  majorTickColor?: string;
  /** Color of minor tick marks. */
  minorTickColor?: string;
  /** Color of major tick labels. */
  majorTickLabelColor?: string;
  /** Color of minor tick labels. */
  minorTickLabelColor?: string;
  /** Font family of major tick labels. */
  majorTickLabelFont?: string;
  /** Font family of minor tick labels. */
  minorTickLabelFont?: string;
  /** Horizontal offset of x-axis labels. */
  xTickLabelOffset?: number;
  /** Vertical offset of y-axis labels. */
  yTickLabelOffset?: number;
  /** Whether x-axis ticks terminate at the frame edge. */
  xTickEnd?: boolean;
  /** Rotation of major x-axis labels in degrees. */
  xTickMajorLabelRotation?: number;
  /** Rotation of minor x-axis labels in degrees. */
  xTickMinorLabelRotation?: number;
  /** Rotation of major y-axis labels in degrees. */
  yTickMajorLabelRotation?: number;
  /** Whether y-axis ticks terminate at the frame edge. */
  yTickEnd?: boolean;
  /** Rotation of minor y-axis labels in degrees. */
  yTickMinorLabelRotation?: number;
};

/** Geographic grid intervals drawn in the frame. */
export type AddFrameGrid = {
  /** Longitude interval between major grid lines. */
  majorLongitudeInterval?: number;
  /** Latitude interval between major grid lines. */
  majorLatitudeInterval?: number;
  /** Longitude interval between minor grid lines. */
  minorLongitudeInterval?: number;
  /** Latitude interval between minor grid lines. */
  minorLatitudeInterval?: number;
};

/** Encoding settings for the framed image. */
export type AddFrameOutput = {
  /** Output image format. */
  format?: ImageFormat;
  /** Whether the response is base64 encoded. */
  base64?: boolean;
  /** Whether output is converted to grayscale. */
  grayscale?: boolean;
};

/** Request payload for drawing a coordinate frame around an image. */
export type AddFrameOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Base image and its geographic extent. */
  input: AddFrameInput;
  /** Optional images composited over the base image. */
  overlays?: AddFrameOverlay[];
  /** Optional frame styling. */
  frame?: AddFrameFrame;
  /** Optional geographic grid settings. */
  grid?: AddFrameGrid;
  /** Output encoding settings. */
  output: AddFrameOutput;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
