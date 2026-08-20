import { gradientColorStopSchema, numberArraySchema } from "./common";

/** Validation schema for guide lines. */
export const guideLinesSchema: object = {
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
    data: {
      type: "string",
    },
    strokeColor: {
      type: "string",
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
      minimum: 0,
    },
    strokeLineJoin: {
      enum: ["miter", "round", "bevel"],
    },
    strokeLineCap: {
      enum: ["butt", "round", "square"],
    },
    strokePriority: {
      enum: ["color", "linear-gradient"],
    },
    strokeLinearGradientStartPointX: {
      type: "number",
    },
    strokeLinearGradientStartPointY: {
      type: "number",
    },
    strokeLinearGradientEndPointX: {
      type: "number",
    },
    strokeLinearGradientEndPointY: {
      type: "number",
    },
    strokeLinearGradientColorStop: gradientColorStopSchema,
    enabled: {
      type: "boolean",
    },
    strokeOpacity: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    threshold: {
      type: "number",
    },
    stick: {
      type: "boolean",
    },
    distanceXs: numberArraySchema,
    distanceYs: numberArraySchema,
  },
};
