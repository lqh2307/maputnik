import { InspectorFeature } from "../Types";

/** Describes the transient feature inspector displayed over the map. */
export type HoverInspector = {
  /** Whether the inspector is showing a rendered feature or map coordinates. */
  kind: "feature" | "coordinate";
  /** Summary of the primary inspected feature under cursor, when present. */
  feature?: InspectorFeature;
  /** Longitude at the pointer or pinned marker. */
  longitude: number;
  /** Latitude at the pointer or pinned marker. */
  latitude: number;
  /** Whether pointer movement should leave this inspector visible. */
  pinned: boolean;
  /** Viewport X coordinate for the inspector popover. */
  x: number;
  /** Viewport Y coordinate for the inspector popover. */
  y: number;
};
