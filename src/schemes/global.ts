import { selectionRectangleSchema } from "./selection-rectangle";
import { transformersSchema } from "./transformers";
import { guideLinesSchema } from "./guide-lines";
import { stringSetLikeSchema } from "./common";
import { eraserSchema } from "./eraser";
import { shapesSchema } from "./shapes";
import { maskSchema } from "./mask";
import { tabsSchema } from "./tabs";

/** Validation schema for global. */
export const globalSchema: object = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    title: {
      type: "string",
    },
    type: {
      enum: ["report", "template", "component"],
    },
    fileId: {
      type: "string",
    },
    init: {
      type: "boolean",
    },
    newTab: {
      type: "boolean",
    },
    language: {
      type: "string",
    },
    themeMode: {
      enum: ["black", "blue", "grey", "white", "system", "light", "dark"],
    },
    maxHistory: {
      type: "number",
    },
    shapeDefaults: {
      type: "object",
      properties: {
        strokeColor: {
          type: "string",
        },
        strokeWidth: {
          type: "number",
          minimum: 0,
        },
        strokeOpacity: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        textStrokeColor: {
          type: "string",
        },
        textStrokeWidth: {
          type: "number",
          minimum: 0,
        },
        textStrokeOpacity: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        backgroundStrokeColor: {
          type: "string",
        },
        backgroundStrokeWidth: {
          type: "number",
          minimum: 0,
        },
        backgroundStrokeOpacity: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        shadowColor: {
          type: "string",
        },
        shadowOpacity: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        fillColor: {
          type: "string",
        },
        fillOpacity: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        textFillColor: {
          type: "string",
        },
        textFillOpacity: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        backgroundFillColor: {
          type: "string",
        },
        backgroundFillOpacity: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        width: {
          type: "number",
          exclusiveMinimum: 0,
        },
        height: {
          type: "number",
          exclusiveMinimum: 0,
        },
        radius: {
          type: "number",
          exclusiveMinimum: 0,
        },
        radiusX: {
          type: "number",
          exclusiveMinimum: 0,
        },
        radiusY: {
          type: "number",
          exclusiveMinimum: 0,
        },
        innerRadius: {
          type: "number",
          exclusiveMinimum: 0,
        },
        outerRadius: {
          type: "number",
          exclusiveMinimum: 0,
        },
      },
    },
    activeIndex: {
      type: "number",
    },
    tabs: tabsSchema,
    transformers: transformersSchema,
    selectionRectangle: selectionRectangleSchema,
    mask: maskSchema,
    guideLines: guideLinesSchema,
    eraser: eraserSchema,
    guide: {
      type: "boolean",
    },
    about: {
      type: "boolean",
    },
    generalSetting: {
      type: "boolean",
    },
    exportReport: {
      type: "boolean",
    },
    importReport: {
      type: "boolean",
    },
    saveAs: {
      type: "boolean",
    },
    edit: {
      type: "boolean",
    },
    close: {
      type: "boolean",
    },
    logout: {
      type: "boolean",
    },
    profile: {
      type: "boolean",
    },
    uploadImage: {
      type: "boolean",
    },
    uploadVideo: {
      type: "boolean",
    },
    selectBGFromImage: {
      type: "boolean",
    },
    selectBGFromMap: {
      type: "boolean",
    },
    copiedShapes: shapesSchema,
    edittedIds: stringSetLikeSchema,
    croppedIds: stringSetLikeSchema,
    selectedIds: stringSetLikeSchema,
    singleSelectedIds: stringSetLikeSchema,
    controlSelectedIds: stringSetLikeSchema,
    cellSelectedIds: stringSetLikeSchema,
    lastShapesUpdate: {
      type: "number",
    },
    lastStageUpdate: {
      type: "number",
    },
  },
  required: ["activeIndex", "tabs"],
};
