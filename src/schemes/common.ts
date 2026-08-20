/** Validation schema for number array. */
export const numberArraySchema: object = {
  type: "array",
  items: {
    type: "number",
  },
};

/** Validation schema for one persisted fill or stroke gradient color stop. */
export const gradientColorStopSchema: object = {
  type: "array",
  items: {
    type: "object",
    properties: {
      color: {
        type: "string",
      },
      opacity: {
        type: "number",
        minimum: 0,
        maximum: 1,
      },
      offset: {
        type: "number",
        minimum: 0,
        maximum: 1,
      },
    },
  },
};

/** Validation schema for string array. */
export const stringArraySchema: object = {
  type: "array",
  items: {
    type: "string",
  },
};

/** Validation schema for boolean record. */
export const booleanRecordSchema: object = {
  type: "object",
  additionalProperties: {
    type: "boolean",
  },
};

/** Validation schema for string set like. */
export const stringSetLikeSchema: object = {
  oneOf: [
    {
      type: "array",
      items: {
        type: "string",
      },
    },
    {
      type: "object",
    },
  ],
};

/** Validation schema for window rect. */
export const windowRectSchema: object = {
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
  },
};

/** Validation schema for point. */
export const pointSchema: object = {
  type: "object",
  properties: {
    x: {
      type: "number",
    },
    y: {
      type: "number",
    },
  },
};

/** Validation schema for bbox. */
export const bboxSchema: object = {
  type: "array",
  items: {
    type: "number",
  },
  minItems: 4,
  maxItems: 4,
};

/** Validation schema for group. */
export const groupSchema: object = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    kind: {
      enum: ["shape", "group", "persistent-group"],
    },
    children: {
      type: "array",
      items: {
        type: "object",
      },
    },
  },
};

/** Validation schema for nested shape. */
export const nestedShapeSchema: object = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    type: {
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
    text: {
      type: "string",
    },
  },
};

/** Validation schema for motion. */
export const motionSchema: object = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    type: {
      enum: [
        "move",
        "rotate",
        "zoom",
        "explode",
        "fade",
        "pulse",
        "fly",
        "bounce",
      ],
    },
    order: {
      type: "number",
    },
    duration: {
      type: "number",
    },
    delayStart: {
      type: "number",
    },
    easing: {
      type: "string",
    },
    triggerStart: {
      enum: ["on-click", "with-previous", "after-previous"],
    },
    triggerShapeId: {
      type: "string",
    },
    repeatCount: {
      type: "number",
    },
    autoReverse: {
      type: "boolean",
    },
    path: {
      type: "array",
      items: pointSchema,
    },
    to: {
      oneOf: [
        {
          type: "number",
        },
        pointSchema,
      ],
    },
    by: {
      oneOf: [
        {
          type: "number",
        },
        pointSchema,
      ],
    },
    toX: {
      type: "number",
    },
    toY: {
      type: "number",
    },
    scaleTo: {
      type: "number",
    },
    opacityTo: {
      type: "number",
    },
    hideAtEnd: {
      type: "boolean",
    },
    fromOpacity: {
      type: "number",
    },
    toOpacity: {
      type: "number",
    },
    direction: {
      enum: ["left", "right", "up", "down"],
    },
    distance: {
      type: "number",
    },
    mode: {
      enum: ["in", "out"],
    },
  },
  required: ["id", "type"],
};

/** Validation schema for transition. */
export const transitionSchema: object = {
  type: "object",
  properties: {
    type: {
      enum: ["none", "fade", "wipe", "push", "zoom"],
    },
    duration: {
      type: "number",
    },
    direction: {
      enum: ["left", "right", "up", "down"],
    },
    easing: {
      enum: ["ease", "ease-in", "ease-out", "ease-in-out", "linear"],
    },
  },
  required: ["type"],
};

/** Validation schema for konva rect config. */
export const konvaRectConfigSchema: object = {
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
    fill: {
      type: "string",
    },
    stroke: {
      type: "string",
    },
    strokeWidth: {
      type: "number",
    },
    opacity: {
      type: "number",
    },
    cornerRadius: {
      oneOf: [
        {
          type: "number",
        },
        numberArraySchema,
      ],
    },
  },
};
