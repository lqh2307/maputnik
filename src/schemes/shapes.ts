import { shapeBoxSchema } from "./shape-box";
import {
  nestedShapeSchema,
  numberArraySchema,
  windowRectSchema,
  motionSchema,
  groupSchema,
} from "./common";

/** Validation schema for shape. */
export const shapeSchema: Record<string, unknown> = {
  type: "object",
};

shapeSchema.properties = {
  id: {
    type: "string",
  },
  name: {
    type: "string",
  },
  type: {
    enum: [
      "table",
      "image",
      "video",
      "ellipse",
      "circle",
      "rectangle",
      "convex-polygon",
      "concave-polygon",
      "text",
      "label",
      "text-path",
      "path",
      "free-drawing",
      "arrow-flat-bottom",
      "arrow-convex-bottom",
      "arrow-concave-bottom",
      "basic-arrow",
      "two-directional-arrow",
      "three-directional-arrow",
      "bidirectional-arrow",
      "multi-directional-arrow",
      "complex-line",
      "complex-path",
      "svg",
      "symbol",
      "ring",
      "wedge",
    ],
  },
  box: shapeBoxSchema,
  x: {
    type: "number",
  },
  y: {
    type: "number",
  },
  width: {
    type: "number",
  },
  height: {
    type: "number",
  },
  offsetX: {
    type: "number",
  },
  offsetY: {
    type: "number",
  },
  scaleX: {
    type: "number",
  },
  scaleY: {
    type: "number",
  },
  skewX: {
    type: "number",
  },
  skewY: {
    type: "number",
  },
  rotation: {
    type: "number",
  },
  opacity: {
    type: "number",
  },
  visible: {
    type: "boolean",
  },

  listening: {
    type: "boolean",
  },
  draggable: {
    type: "boolean",
  },

  lng: {
    type: "number",
  },
  lat: {
    type: "number",
  },
  coordinates: numberArraySchema,
  points: numberArraySchema,
  mainPoints: numberArraySchema,
  mainCoordinates: numberArraySchema,

  clip: {
    type: "object",
    properties: {
      x: {
        type: "number",
      },
      y: {
        type: "number",
      },
      width: {
        type: "number",
      },
      height: {
        type: "number",
      },
      scaleX: {
        type: "number",
      },
      scaleY: {
        type: "number",
      },
      rotation: {
        type: "number",
      },
    },
  },
  clearRects: {
    type: "array",
    items: windowRectSchema,
  },
  group: groupSchema,

  fill: {
    type: "string",
  },
  fillColor: {
    type: "string",
  },
  fillOpacity: {
    type: "number",
  },
  stroke: {
    type: "string",
  },
  strokeColor: {
    type: "string",
  },
  strokeOpacity: {
    type: "number",
  },
  strokeWidth: {
    type: "number",
  },
  strokeDash: numberArraySchema,
  strokeDashOffset: {
    type: "number",
  },
  strokeMiterLimit: {
    type: "number",
  },
  strokeLineCap: {
    type: "string",
  },
  strokeLineJoin: {
    type: "string",
  },
  closed: {
    type: "boolean",
  },
  tension: {
    type: "number",
  },
  data: {
    type: "string",
  },

  imageURL: {
    type: "string",
  },
  videoURL: {
    type: "string",
  },
  play: {
    type: "boolean",
  },
  speed: {
    type: "number",
  },
  volume: {
    type: "number",
  },
  loop: {
    type: "boolean",
  },
  inverse: {
    type: "boolean",
  },

  svgString: {
    type: "string",
  },
  svgColors: {
    type: "object",
    additionalProperties: {
      type: "string",
    },
  },
  svgElements: {
    type: "array",
    items: nestedShapeSchema,
  },

  text: {
    type: "string",
  },
  fontFamily: {
    type: "string",
  },
  fontSize: {
    type: "number",
  },
  fontStyle: {
    type: "string",
  },
  fontVariant: {
    type: "string",
  },
  lineHeight: {
    type: "number",
  },
  padding: {
    type: "number",
  },
  align: {
    type: "string",
  },
  verticalAlign: {
    type: "string",
  },
  wrap: {
    enum: ["word", "char", "none"],
  },
  ellipsis: {
    type: "boolean",
  },
  direction: {
    enum: ["ltr", "rtl"],
  },
  bold: {
    type: "boolean",
  },
  italic: {
    type: "boolean",
  },
  textFillColor: {
    type: "string",
  },
  textFillOpacity: {
    type: "number",
  },
  textStrokeColor: {
    type: "string",
  },
  textStrokeOpacity: {
    type: "number",
  },
  textStrokeWidth: {
    type: "number",
  },
  textStrokeDash: numberArraySchema,
  textStrokeLineJoin: {
    type: "string",
  },
  textStrokeLineCap: {
    type: "string",
  },

  backgroundFillColor: {
    type: "string",
  },
  backgroundFillOpacity: {
    type: "number",
  },
  backgroundStrokeColor: {
    type: "string",
  },
  backgroundStrokeOpacity: {
    type: "number",
  },
  backgroundStrokeWidth: {
    type: "number",
  },
  backgroundStrokeDash: numberArraySchema,
  backgroundStrokeLineJoin: {
    type: "string",
  },
  backgroundStrokeLineCap: {
    type: "string",
  },
  cornerRadius: {
    oneOf: [
      {
        type: "number",
      },
      numberArraySchema,
    ],
  },

  blurRadius: {
    type: "number",
  },
  brightness: {
    type: "number",
  },
  contrast: {
    type: "number",
  },
  embossStrength: {
    type: "number",
  },
  embossWhiteLevel: {
    type: "number",
  },
  embossDirection: {
    enum: [
      "top-left",
      "top",
      "top-right",
      "right",
      "bottom-right",
      "bottom",
      "bottom-left",
      "left",
    ],
  },
  embossBlend: {
    type: "boolean",
  },
  enhance: {
    type: "number",
  },
  kaleidoscopePower: {
    type: "number",
  },
  kaleidoscopeAngle: {
    type: "number",
  },
  noise: {
    type: "number",
  },
  pixelSize: {
    type: "number",
  },
  levels: {
    type: "number",
  },
  rgbaColor: {
    type: "string",
  },
  alpha: {
    type: "number",
  },
  threshold: {
    type: "number",
  },
  blurFilter: {
    type: "boolean",
  },
  brightnessFilter: {
    type: "boolean",
  },
  contrastFilter: {
    type: "boolean",
  },
  embossFilter: {
    type: "boolean",
  },
  enhanceFilter: {
    type: "boolean",
  },
  grayscaleFilter: {
    type: "boolean",
  },
  invertFilter: {
    type: "boolean",
  },
  maskFilter: {
    type: "boolean",
  },
  noiseFilter: {
    type: "boolean",
  },
  pixelateFilter: {
    type: "boolean",
  },
  posterizeFilter: {
    type: "boolean",
  },
  rgbaFilter: {
    type: "boolean",
  },
  sepiaFilter: {
    type: "boolean",
  },
  solarizeFilter: {
    type: "boolean",
  },
  thresholdFilter: {
    type: "boolean",
  },
  kaleidoscopeFilter: {
    type: "boolean",
  },

  drawingMode: {
    type: "string",
  },
  freeDrawingLines: {
    type: "array",
    items: nestedShapeSchema,
  },
  complexLines: {
    type: "array",
    items: nestedShapeSchema,
  },
  complexPaths: {
    type: "array",
    items: nestedShapeSchema,
  },

  colWidths: numberArraySchema,
  rowHeights: numberArraySchema,
  rowOrder: {
    type: "array",
    items: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  cells: {
    type: "object",
    additionalProperties: nestedShapeSchema,
  },
  row: {
    type: "number",
  },
  col: {
    type: "number",
  },
  rowSpan: {
    type: "number",
  },
  colSpan: {
    type: "number",
  },

  move: {
    type: "boolean",
  },
  hidden: {
    type: "boolean",
  },

  motions: {
    type: "array",
    items: motionSchema,
  },

  modelURL: {
    type: "string",
  },
  modelAutoFit: {
    type: "boolean",
  },
  depth: {
    type: "number",
    minimum: 0,
    maximum: 10000,
  },
  elevation: {
    type: "number",
    minimum: -10000,
    maximum: 10000,
  },
  renderMode: {
    enum: ["auto", "solid", "cutout"],
  },
  bevelEnabled: {
    type: "boolean",
  },
  bevelSize: {
    type: "number",
    minimum: 0,
    maximum: 1000,
  },
  bevelThickness: {
    type: "number",
    minimum: 0,
    maximum: 1000,
  },
  bevelSegments: {
    type: "number",
    minimum: 0,
    maximum: 8,
  },
  rotationX: {
    type: "number",
    minimum: -360,
    maximum: 360,
  },
  rotationY: {
    type: "number",
    minimum: -360,
    maximum: 360,
  },
  scaleZ: {
    type: "number",
    minimum: -10,
    maximum: 10,
  },
  color: {
    type: "string",
  },
  roughness: {
    type: "number",
    minimum: 0,
    maximum: 1,
  },
  metalness: {
    type: "number",
    minimum: 0,
    maximum: 1,
  },
  emissiveColor: {
    type: "string",
  },
  emissiveIntensity: {
    type: "number",
    minimum: 0,
    maximum: 10,
  },
  side: {
    enum: ["front", "back", "double"],
  },
  transparent: {
    type: "boolean",
  },
  depthTest: {
    type: "boolean",
  },
  depthWrite: {
    type: "boolean",
  },
  polygonOffset: {
    type: "boolean",
  },
  polygonOffsetFactor: {
    type: "number",
  },
  polygonOffsetUnits: {
    type: "number",
  },
  alphaTest: {
    type: "number",
    minimum: 0,
    maximum: 1,
  },
  cutoutSlices: {
    type: "number",
    minimum: 0,
    maximum: 32,
  },
  castShadow: {
    type: "boolean",
  },
  receiveShadow: {
    type: "boolean",
  },
  followTerrain: {
    type: "boolean",
  },
  wireframe: {
    type: "boolean",
  },
  flatShading: {
    type: "boolean",
  },
};

/** Validation schema for shapes. */
export const shapesSchema: object = {
  type: "array",
  items: shapeSchema,
};
