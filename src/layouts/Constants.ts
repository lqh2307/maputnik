import { StyleSpecification } from "maplibre-gl";
import {
  getStyleLayerTypes,
  getStyleSourceTypes,
} from "../utils/Map/StyleSpec";

export const REPLACE_FILE_REGEX: RegExp = /[^a-zA-Z0-9-_]+/gi;

export const SOURCE_TYPES: readonly string[] = getStyleSourceTypes();

export const LAYER_TYPES: readonly string[] = getStyleLayerTypes();

export const DEFAULT_STYLE: StyleSpecification = {
  version: 8,
  name: "Untitled style",
  metadata: {
    "maputnik:renderer": "mlgljs",
  },
  center: [105.85, 21.03],
  zoom: 4,
  bearing: 0,
  pitch: 0,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    openstreetmap: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#e9eef3",
      },
    },
    {
      id: "openstreetmap",
      type: "raster",
      source: "openstreetmap",
      paint: {
        "raster-opacity": 1,
      },
    },
  ],
};
