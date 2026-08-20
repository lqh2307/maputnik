import { LayerSpecification } from "maplibre-gl";

export * from "../utils/Map/Types";

/** Public contracts shared by the Maputnik editor layouts and store. */

/** Defines how pointer interaction is interpreted by the map canvas. */
export type MapMode = "map" | "inspect";

/** Defines the editable paint or layout section of a style layer. */
export type LayerSection = "paint" | "layout";

/** Defines the mutable layer fields managed by the property panel. */
export type EditableLayer = LayerSpecification & {
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  filter?: unknown;
  source?: string;
  "source-layer"?: string;
};
