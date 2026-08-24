import latestSpec from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import type { PropertySpec } from "../../layouts/RightBar/Types";

type RawStyleSpec = {
  $root?: Record<string, PropertySpec>;
  [key: string]: unknown;
};

/** The versioned MapLibre style specification bundled with the editor. */
export const MAPLIBRE_STYLE_SPEC: RawStyleSpec =
  latestSpec as unknown as RawStyleSpec;

/** Return a typed specification table, or an empty table when unavailable. */
export function getStyleSpecSection(
  name: string
): Record<string, PropertySpec> {
  const value = MAPLIBRE_STYLE_SPEC[name];

  return value && typeof value === "object"
    ? (value as Record<string, PropertySpec>)
    : {};
}

/** Return all editable root-level properties except collections handled elsewhere. */
export function getRootPropertySpecs(): Record<string, PropertySpec> {
  const root = MAPLIBRE_STYLE_SPEC.$root ?? {};

  return Object.fromEntries(
    Object.entries(root).filter(([name]) => {
      return name !== "version" && name !== "sources" && name !== "layers";
    })
  );
}

/** Return the source properties for a MapLibre source type. */
export function getSourcePropertySpecs(
  sourceType: string
): Record<string, PropertySpec> {
  return getStyleSpecSection(`source_${sourceType}`)["*"]
    ? getStyleSpecSection(`source_${sourceType}`)
    : getStyleSpecSection("source");
}

/** Return the common layer property specifications. */
export function getLayerPropertySpecs(): Record<string, PropertySpec> {
  return getStyleSpecSection("layer");
}

/** Return the layout or paint specifications for one layer type. */
export function getLayerSectionSpecs(
  section: "layout" | "paint",
  layerType: string
): Record<string, PropertySpec> {
  return getStyleSpecSection(`${section}_${layerType}`);
}

/** Return the layer types advertised by the bundled style specification. */
export function getStyleLayerTypes(): string[] {
  const values = getLayerPropertySpecs().type?.values;

  return values ? Object.keys(values) : [];
}

/** Return the source types advertised by the bundled style specification. */
export function getStyleSourceTypes(): string[] {
  return Object.keys(MAPLIBRE_STYLE_SPEC)
    .filter((name) => {
      return name.startsWith("source_");
    })
    .map((name) => {
      return name.slice("source_".length);
    });
}
