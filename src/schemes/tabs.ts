import { gradientColorStopSchema, transitionSchema } from "./common";
import { shapesSchema } from "./shapes";
import { stageSchema } from "./stage";

/** Validation schema for tabs. */
export const tabsSchema: object = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      title: {
        type: "string",
      },
      note: {
        type: "string",
      },
      preview: {
        type: "string",
      },
      visible: {
        type: "boolean",
      },
      stage: stageSchema,
      background: {
        type: "object",
        properties: {
          backgroundFillColor: {
            type: "string",
          },
          backgroundFillOpacity: {
            type: "number",
            minimum: 0,
            maximum: 1,
          },
          backgroundFillPriority: {
            enum: ["color", "linear-gradient", "radial-gradient"],
          },
          backgroundFillRule: {
            enum: ["nonzero", "evenodd"],
          },
          backgroundFillLinearGradientStartPointX: {
            type: "number",
          },
          backgroundFillLinearGradientStartPointY: {
            type: "number",
          },
          backgroundFillLinearGradientEndPointX: {
            type: "number",
          },
          backgroundFillLinearGradientEndPointY: {
            type: "number",
          },
          backgroundFillLinearGradientColorStop: gradientColorStopSchema,
          backgroundFillRadialGradientStartPointX: {
            type: "number",
          },
          backgroundFillRadialGradientStartPointY: {
            type: "number",
          },
          backgroundFillRadialGradientEndPointX: {
            type: "number",
          },
          backgroundFillRadialGradientEndPointY: {
            type: "number",
          },
          backgroundFillRadialGradientStartRadius: {
            type: "number",
            minimum: 0,
          },
          backgroundFillRadialGradientEndRadius: {
            type: "number",
            minimum: 0,
          },
          backgroundFillRadialGradientColorStop: gradientColorStopSchema,
          backgroundImageURL: {
            type: "string",
          },
        },
      },
      transition: transitionSchema,
      shapes: shapesSchema,
      history: {
        type: "object",
        properties: {
          history: {
            type: "array",
            items: shapesSchema,
          },
          historyIndex: {
            type: "number",
          },
        },
      },
    },
    required: ["stage", "shapes"],
  },
  minItems: 1,
};
