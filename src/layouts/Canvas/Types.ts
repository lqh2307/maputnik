import { InspectorFeature } from "../Types";

/** Describes the transient feature inspector displayed over the map. */
export type HoverInspector = {
  /** Summary of the primary inspected feature under cursor. */
  feature: InspectorFeature;
  /** Total count of features found at the cursor point. */
  featureCount: number;
  /** Viewport X coordinate for the inspector popover. */
  x: number;
  /** Viewport Y coordinate for the inspector popover. */
  y: number;
};
