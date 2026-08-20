import { bboxSchema, numberArraySchema } from "./common";

/** Validation schema for stage. */
export const stageSchema: object = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
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
    contentWidth: {
      type: "number",
    },
    contentHeight: {
      type: "number",
    },
    stageRatio: {
      type: "number",
    },
    stageBBox: bboxSchema,
    stageExpand: {
      type: "boolean",
    },
    stageSizeType: {
      enum: ["followImage", "followMap"],
    },
    stageSRID: {
      type: "string",
    },
    move: {
      type: "boolean",
    },
    backgroundOpacity: {
      type: "number",
    },
    backgroundStyleURL: {
      type: "string",
    },
    backgroundStyleCenterLng: {
      type: "number",
    },
    backgroundStyleCenterLat: {
      type: "number",
    },
    backgroundStyleZoom: {
      type: "number",
    },
    terrainEnabled: {
      type: "boolean",
    },
    hillshadeEnabled: {
      type: "boolean",
    },
    contourEnabled: {
      type: "boolean",
    },
    elevationPointEnabled: {
      type: "boolean",
    },
    gridEnabled: {
      type: "boolean",
    },
    gridMajorIntervalLongitude: {
      type: "number",
    },
    gridMajorIntervalLatitude: {
      type: "number",
    },
    gridMinorIntervalLongitude: {
      type: "number",
    },
    gridMinorIntervalLatitude: {
      type: "number",
    },
    gridOriginLongitude: {
      type: "number",
    },
    gridOriginLatitude: {
      type: "number",
    },
    gridMajorLongitudeWidth: {
      type: "number",
    },
    gridMajorLongitudeDash: numberArraySchema,
    gridMajorLongitudeColor: {
      type: "string",
    },
    gridMajorLongitudeOpacity: {
      type: "number",
    },
    gridMajorLatitudeWidth: {
      type: "number",
    },
    gridMajorLatitudeDash: numberArraySchema,
    gridMajorLatitudeColor: {
      type: "string",
    },
    gridMajorLatitudeOpacity: {
      type: "number",
    },
    gridMinorLongitudeWidth: {
      type: "number",
    },
    gridMinorLongitudeDash: numberArraySchema,
    gridMinorLongitudeColor: {
      type: "string",
    },
    gridMinorLongitudeOpacity: {
      type: "number",
    },
    gridMinorLatitudeWidth: {
      type: "number",
    },
    gridMinorLatitudeDash: numberArraySchema,
    gridMinorLatitudeColor: {
      type: "string",
    },
    gridMinorLatitudeOpacity: {
      type: "number",
    },
    frameEnabled: {
      type: "boolean",
    },
    frameStyle: {
      enum: ["standard", "fancy"],
    },
    frameSpace: {
      type: "number",
    },
    frameCoordinateFormat: {
      enum: ["DD", "DDM", "DMS", "DMSH"],
    },
    frameLongitudeInterval: {
      type: "number",
    },
    frameLatitudeInterval: {
      type: "number",
    },
    frameMinorLongitudeInterval: {
      type: "number",
    },
    frameMinorLatitudeInterval: {
      type: "number",
    },
    frameTitle: {
      type: "string",
    },
    frameXAxisLabel: {
      type: "string",
    },
    frameYAxisLabel: {
      type: "string",
    },
    frameBackgroundColor: {
      type: "string",
    },
    frameBackgroundOpacity: {
      type: "number",
    },
    frameTopSide: {
      type: "string",
    },
    frameRightSide: {
      type: "string",
    },
    frameBottomSide: {
      type: "string",
    },
    frameLeftSide: {
      type: "string",
    },
    frameTickDirection: {
      enum: ["out", "in", "both"],
    },
    frameXTickEnd: {
      type: "boolean",
    },
    frameYTickEnd: {
      type: "boolean",
    },
    frameInnerWidth: {
      type: "number",
    },
    frameInnerDash: numberArraySchema,
    frameInnerColor: {
      type: "string",
    },
    frameInnerOpacity: {
      type: "number",
    },
    frameOuterWidth: {
      type: "number",
    },
    frameOuterDash: numberArraySchema,
    frameOuterColor: {
      type: "string",
    },
    frameOuterOpacity: {
      type: "number",
    },
    frameMajorTickWidth: {
      type: "number",
    },
    frameMajorTickSize: {
      type: "number",
    },
    frameMajorTickDash: numberArraySchema,
    frameMajorTickColor: {
      type: "string",
    },
    frameMajorTickOpacity: {
      type: "number",
    },
    frameMinorTickWidth: {
      type: "number",
    },
    frameMinorTickSize: {
      type: "number",
    },
    frameMinorTickDash: numberArraySchema,
    frameMinorTickColor: {
      type: "string",
    },
    frameMinorTickOpacity: {
      type: "number",
    },
    frameMajorTickLabelSize: {
      type: "number",
    },
    frameMajorTickLabelFont: {
      type: "string",
    },
    frameMajorTickLabelColor: {
      type: "string",
    },
    frameMajorTickLabelOpacity: {
      type: "number",
    },
    frameMajorTickLabelAlign: {
      type: "string",
    },
    frameMajorTickLabelBaseline: {
      type: "string",
    },
    frameMajorTickLabelRotation: {
      type: "number",
    },
    frameMinorTickLabelSize: {
      type: "number",
    },
    frameMinorTickLabelFont: {
      type: "string",
    },
    frameMinorTickLabelColor: {
      type: "string",
    },
    frameMinorTickLabelOpacity: {
      type: "number",
    },
    frameMinorTickLabelAlign: {
      type: "string",
    },
    frameMinorTickLabelBaseline: {
      type: "string",
    },
    frameMinorTickLabelRotation: {
      type: "number",
    },
    frameXTickLabelOffset: {
      type: "number",
    },
    frameYTickLabelOffset: {
      type: "number",
    },
    frameMajorTickLabelOffset: {
      type: "number",
    },
    frameMinorTickLabelOffset: {
      type: "number",
    },
    frameTopLeftLabelOffset: {
      type: "number",
    },
    frameTopRightLabelOffset: {
      type: "number",
    },
    frameBottomRightLabelOffset: {
      type: "number",
    },
    frameBottomLeftLabelOffset: {
      type: "number",
    },
    frameTitleSize: {
      type: "number",
    },
    frameTitleFont: {
      type: "string",
    },
    frameTitleColor: {
      type: "string",
    },
    frameTitleOpacity: {
      type: "number",
    },
    frameTitleAlign: {
      type: "string",
    },
    frameTitleBaseline: {
      type: "string",
    },
    frameTitleOffset: {
      type: "number",
    },
    frameAxisLabelSize: {
      type: "number",
    },
    frameAxisLabelFont: {
      type: "string",
    },
    frameAxisLabelColor: {
      type: "string",
    },
    frameAxisLabelOpacity: {
      type: "number",
    },
    frameAxisLabelAlign: {
      type: "string",
    },
    frameAxisLabelBaseline: {
      type: "string",
    },
    frameAxisLabelOffset: {
      type: "number",
    },
    frameFancySize: {
      type: "number",
    },
    frameFancyColor: {
      type: "string",
    },
    frameFancyOpacity: {
      type: "number",
    },
    frameFancyAlternateColor: {
      type: "string",
    },
    frameFancyAlternateOpacity: {
      type: "number",
    },
    frameFancyStepLongitude: {
      type: "number",
    },
    frameFancyStepLatitude: {
      type: "number",
    },
  },
};
