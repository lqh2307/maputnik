import { LayerSpecification } from "maplibre-gl";

/** Resolves the display group for one style layer based on its source. */
export function getLayerGroup(layer: LayerSpecification): {
  id: string;
  title: string;
} {
  if ("source" in layer && typeof layer.source === "string") {
    return {
      id: `source:${layer.source}`,
      title: layer.source,
    };
  }
  return {
    id: "style:root",
    title: "Style layers",
  };
}
