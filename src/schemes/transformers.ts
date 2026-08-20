import { konvaRectConfigSchema } from "./common";

/** Validation schema for transformer. */
export const transformerSchema: object = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    enabledAnchors: {
      type: "array",
      items: {
        type: "string",
      },
    },
    rotateEnabled: {
      type: "boolean",
    },
    resizeEnabled: {
      type: "boolean",
    },
    flipEnabled: {
      type: "boolean",
    },
    keepRatio: {
      type: "boolean",
    },
    centeredScaling: {
      type: "boolean",
    },
    borderEnabled: {
      type: "boolean",
    },
    borderStrokeColor: {
      type: "string",
    },
    borderStrokeWidth: {
      type: "number",
    },
    borderStrokeDash: {
      type: "array",
      items: {
        type: "number",
      },
    },
    anchorFillColor: {
      type: "string",
    },
    anchorStrokeColor: {
      type: "string",
    },
    anchorStrokeWidth: {
      type: "number",
    },
    anchorSize: {
      type: "number",
    },
    rotateAnchorOffset: {
      type: "number",
    },
    rotationSnaps: {
      type: "array",
      items: {
        type: "number",
      },
    },
    rotaterAnchorOption: konvaRectConfigSchema,
    topCenterAnchorOption: konvaRectConfigSchema,
    bottomCenterAnchorOption: konvaRectConfigSchema,
    middleLeftAnchorOption: konvaRectConfigSchema,
    middleRightAnchorOption: konvaRectConfigSchema,
    topLeftAnchorOption: konvaRectConfigSchema,
    topRightAnchorOption: konvaRectConfigSchema,
    bottomLeftAnchorOption: konvaRectConfigSchema,
    bottomRightAnchorOption: konvaRectConfigSchema,
  },
};

/** Validation schema for transformers. */
export const transformersSchema: object = {
  type: "object",
  additionalProperties: transformerSchema,
};
