import { gradientColorStopSchema, numberArraySchema } from "./common";

/** Validation schema for mask. */
export const maskSchema: object = {
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
    strokeWidth: {
      type: "number",
    },
    strokeDash: numberArraySchema,
    fillColor: {
      type: "string",
    },
    fillOpacity: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    fillPriority: {
      enum: ["color", "linear-gradient", "radial-gradient"],
    },
    fillRule: {
      enum: ["nonzero", "evenodd"],
    },
    fillLinearGradientStartPointX: {
      type: "number",
    },
    fillLinearGradientStartPointY: {
      type: "number",
    },
    fillLinearGradientEndPointX: {
      type: "number",
    },
    fillLinearGradientEndPointY: {
      type: "number",
    },
    fillLinearGradientColorStop: gradientColorStopSchema,
    fillRadialGradientStartPointX: {
      type: "number",
    },
    fillRadialGradientStartPointY: {
      type: "number",
    },
    fillRadialGradientEndPointX: {
      type: "number",
    },
    fillRadialGradientEndPointY: {
      type: "number",
    },
    fillRadialGradientStartRadius: {
      type: "number",
      minimum: 0,
    },
    fillRadialGradientEndRadius: {
      type: "number",
      minimum: 0,
    },
    fillRadialGradientColorStop: gradientColorStopSchema,
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
    strokeColor: {
      type: "string",
    },
    strokeOpacity: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    enabled: {
      type: "boolean",
    },
  },
};
