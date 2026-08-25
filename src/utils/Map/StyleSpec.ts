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
  const canonicalType = normalizeStyleSourceType(sourceType);
  const section = Object.keys(MAPLIBRE_STYLE_SPEC).find((name) => {
    if (!name.startsWith("source_")) {
      return false;
    }

    const typeSpec = getStyleSpecSection(name).type;
    return Boolean(
      typeSpec?.values &&
      Object.prototype.hasOwnProperty.call(typeSpec.values, canonicalType)
    );
  });

  return section ? getStyleSpecSection(section) : {};
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
  return Object.keys(MAPLIBRE_STYLE_SPEC).flatMap((name) => {
    if (!name.startsWith("source_")) {
      return [];
    }

    const values = getStyleSpecSection(name).type?.values;
    return values ? Object.keys(values) : [];
  });
}

/** Converts legacy editor aliases into the canonical MapLibre source type. */
export function normalizeStyleSourceType(sourceType: string): string {
  return sourceType === "raster_dem" ? "raster-dem" : sourceType;
}
