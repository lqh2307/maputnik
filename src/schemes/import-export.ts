import { selectionRectangleSchema } from "./selection-rectangle";
import { transformersSchema } from "./transformers";
import { guideLinesSchema } from "./guide-lines";
import { eraserSchema } from "./eraser";
import { globalSchema } from "./global";
import { maskSchema } from "./mask";

/** Validation schema for import export. */
export const importExportSchema: object = {
  type: "object",
  properties: {
    global: globalSchema,
    eraser: eraserSchema,
    guideLines: guideLinesSchema,
    selectionRectangle: selectionRectangleSchema,
    transformers: transformersSchema,
    mask: maskSchema,
  },
  required: [
    "global",
    "eraser",
    "guideLines",
    "selectionRectangle",
    "transformers",
  ],
};
