import {
  LayerSpecification,
  MapGeoJSONFeature,
  SourceSpecification,
  StyleSpecification,
} from "maplibre-gl";
import {
  validateStyleMin,
  type ValidationError,
} from "@maplibre/maplibre-gl-style-spec";
import { runtimeTokens, type RuntimeTokens } from "../../configs/runtime";
import { InspectorFeature, StyleResource, StyleValidationIssue } from "./Types";
import { saveToFile } from "../File";

type TokenName = keyof RuntimeTokens;

/** Special characters regex for filename and ID normalization. */
const REPLACE_FILE_REGEX = /[^\w.-]/g;

/** Default placeholder token used for demo MapTiler examples when a real token is unavailable. */
const MAPTILER_DEFAULT_TOKEN = "get_your_own_OpIi9ZULNHzrESv6T2vL";

/** Creates an independent clone of a MapLibre style document. */
export function cloneStyle(style: StyleSpecification): StyleSpecification {
  return structuredClone(style);
}

/** Creates a stable unique identifier from a human-readable seed and existing list. */
export function createUniqueId(
  seed: string,
  existingIds: Iterable<string>
): string {
  const ids = new Set(existingIds);
  const normalized = seed.trim().replace(REPLACE_FILE_REGEX, "-");

  if (!ids.has(normalized)) {
    return normalized;
  }

  let suffix = 2;
  while (ids.has(`${normalized}-${suffix}`)) {
    suffix += 1;
  }

  return `${normalized}-${suffix}`;
}

/** Creates a style layer with sensible defaults for its type. */
export function createLayer(
  type: LayerSpecification["type"],
  id: string,
  sourceId?: string
): LayerSpecification {
  const layer: Record<string, unknown> = {
    id,
    type,
  };

  if (type !== "background" && sourceId) {
    layer.source = sourceId;
  }

  if (type === "background") {
    layer.paint = {
      "background-color": "#dfe7ef",
    };
  } else if (type === "fill") {
    layer.paint = {
      "fill-color": "#4f8dd6",
      "fill-opacity": 0.65,
    };
  } else if (type === "line") {
    layer.paint = {
      "line-color": "#266bb5",
      "line-width": 2,
    };
  } else if (type === "circle") {
    layer.paint = {
      "circle-color": "#e64a5f",
      "circle-radius": 5,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1,
    };
  } else if (type === "heatmap") {
    layer.paint = {
      "heatmap-radius": 20,
      "heatmap-opacity": 0.8,
    };
  } else if (type === "fill-extrusion") {
    layer.paint = {
      "fill-extrusion-color": "#7f8fa4",
      "fill-extrusion-height": 12,
      "fill-extrusion-opacity": 0.85,
    };
  } else if (type === "raster") {
    layer.paint = {
      "raster-opacity": 1,
    };
  } else if (type === "symbol") {
    layer.layout = {
      "text-field": ["coalesce", ["get", "name"], ""],
      "text-size": 14,
    };
    layer.paint = {
      "text-color": "#1f2937",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1,
    };
  }

  return layer as LayerSpecification;
}

/** Creates a deep layer copy with a new unique identifier. */
export function duplicateLayer(
  layer: LayerSpecification,
  existingIds: Iterable<string>
): LayerSpecification {
  return {
    ...structuredClone(layer),
    id: createUniqueId(`${layer.id}-copy`, existingIds),
  } as LayerSpecification;
}

/** Whether a MapLibre source can back the supplied layer type. */
export function sourceSupportsLayer(
  source: SourceSpecification,
  layerType: string
): boolean {
  if (!source) {
    return false;
  }
  if (layerType === "background") {
    return false;
  }
  if (layerType === "raster") {
    return source.type === "raster" || source.type === "image";
  }
  if (layerType === "hillshade" || layerType === "color-relief") {
    return source.type === "raster-dem";
  }

  return source.type === "vector" || source.type === "geojson";
}

/** Validates a style and maps issues into editor-friendly contracts. */
export function validateStyleDocument(
  style: StyleSpecification
): StyleValidationIssue[] {
  try {
    return validateStyleMin(style as StyleSpecification).map(
      (issue: ValidationError) => {
        const path: string = issue.message ?? "";
        const layerMatch = String(path).match(/layers\[(\d+)\]/);
        const sourceMatch = String(path).match(/sources\.([^.:\s]+)/);
        const layerIndex = layerMatch ? Number(layerMatch[1]) : undefined;

        return {
          message: issue.message,
          line: issue.line,
          layerId:
            layerIndex === undefined ? undefined : style.layers[layerIndex]?.id,
          sourceId: sourceMatch?.[1],
        };
      }
    );
  } catch (error) {
    return [
      {
        message: error instanceof Error ? error.message : String(error),
      },
    ];
  }
}

/** Downloads a style document as formatted JSON file. */
export async function downloadStyle(
  style: StyleSpecification,
  name?: string
): Promise<void> {
  await saveToFile(
    JSON.stringify(style),
    `${
      name ||
      style.name?.trim().replace(REPLACE_FILE_REGEX, "-").toLowerCase() ||
      "style"
    }.json`
  );
}

function resolveStyleResourceUrl(value: string, baseUrl: string): string {
  if (!value || /^[a-z][a-z\d+.-]*:/i.test(value)) {
    return value;
  }

  const placeholders: string[] = [];

  const protectedValue = value.replace(/\{[^}]+\}/g, (placeholder) => {
    placeholders.push(placeholder);
    return `__MAPUTNIK_TOKEN_${placeholders.length - 1}__`;
  });
  let resolved = new URL(protectedValue, baseUrl).toString();
  placeholders.forEach((placeholder, index) => {
    resolved = resolved.replace(`__MAPUTNIK_TOKEN_${index}__`, placeholder);
  });

  return resolved;
}

/** Resolves relative style resource URLs against a style document base URL. */
export function resolveStyleResourceUrls(
  input: StyleSpecification,
  baseUrl: string
): StyleSpecification {
  const style: StyleSpecification = cloneStyle(input);

  if (typeof style.sprite === "string") {
    style.sprite = resolveStyleResourceUrl(style.sprite, baseUrl);
  }
  if (typeof style.glyphs === "string") {
    style.glyphs = resolveStyleResourceUrl(style.glyphs, baseUrl);
  }

  Object.values(style.sources ?? {}).forEach((source) => {
    const resource: StyleResource = source as StyleResource;
    if (typeof resource.url === "string") {
      resource.url = resolveStyleResourceUrl(resource.url, baseUrl);
    }
    if (Array.isArray(resource.tiles)) {
      resource.tiles = resource.tiles.map((tile: string) => {
        return resolveStyleResourceUrl(tile, baseUrl);
      });
    }
    if (Array.isArray(resource.urls)) {
      resource.urls = resource.urls.map((url: string) => {
        return resolveStyleResourceUrl(url, baseUrl);
      });
    }
    if (typeof resource.data === "string") {
      resource.data = resolveStyleResourceUrl(resource.data, baseUrl);
    }
  });

  return style;
}

/** Maps one rendered MapLibre feature into structured inspector data. */
export function summarizeFeature(feature: MapGeoJSONFeature): InspectorFeature {
  return {
    id: feature.id,
    properties: feature.properties ?? {},
    source: feature.source,
    sourceLayer: feature.sourceLayer,
    state: feature.state ?? {},
    layer: {
      id: feature.layer?.id ?? "unknown",
      type: feature.layer?.type ?? "unknown",
    },
    geometryType: feature.geometry?.type ?? "Unknown",
  };
}

function detectTokenName(url: string, sourceName?: string): TokenName {
  if (/\.(?:tilehosting|maptiler)\.com/i.test(url)) {
    return "openmaptiles";
  }
  if (/\.thunderforest\.com/i.test(url)) {
    return "thunderforest";
  }
  if (/\.locationiq\.com/i.test(url)) {
    return "locationiq";
  }
  if (/\.stadiamaps\.com/i.test(url)) {
    return "stadia";
  }
  if (sourceName === "openmaptiles") {
    return "openmaptiles";
  }
  if (sourceName?.startsWith("thunderforest")) {
    return "thunderforest";
  }
  if (sourceName === "locationiq") {
    return "locationiq";
  }
  if (sourceName === "stadia") {
    return "stadia";
  }
  return undefined;
}

function getAccessToken(
  tokenName: TokenName,
  style?: StyleSpecification
): string {
  const metadata = (style?.metadata ?? {}) as Record<string, unknown>;

  const styleToken = metadata[`maputnik:${tokenName}_access_token`];
  return typeof styleToken === "string" && styleToken
    ? styleToken
    : runtimeTokens[tokenName];
}

function replaceUrlAccessToken(
  url: string,
  style?: StyleSpecification,
  sourceName?: string
): string {
  const tokenName = detectTokenName(url, sourceName);
  if (!tokenName) {
    return url;
  }

  const token = getAccessToken(tokenName, style);
  if (!token) {
    return url;
  }

  let nextUrl = url.replaceAll("{key}", token);
  if (tokenName === "openmaptiles") {
    nextUrl = nextUrl.replaceAll(MAPTILER_DEFAULT_TOKEN, token);
  }
  if (
    tokenName === "stadia" &&
    !/[?&](?:api_key|key)=/i.test(nextUrl) &&
    token
  ) {
    nextUrl += `${nextUrl.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(token)}`;
  }
  return nextUrl;
}

/** Replaces an access-token placeholder in one preset URL. */
export function replacePresetUrlAccessToken(url: string): string {
  return replaceUrlAccessToken(url);
}

/** Replaces supported access-token placeholders throughout a style. */
export function replaceStyleAccessTokens(
  input: StyleSpecification
): StyleSpecification {
  const style: StyleSpecification = cloneStyle(input);

  if (typeof style.glyphs === "string") {
    style.glyphs = replaceUrlAccessToken(style.glyphs, style);
  }
  if (typeof style.sprite === "string") {
    style.sprite = replaceUrlAccessToken(style.sprite, style);
  } else if (Array.isArray(style.sprite)) {
    style.sprite = style.sprite.map((sprite) => {
      return {
        ...sprite,
        url:
          typeof sprite.url === "string"
            ? replaceUrlAccessToken(sprite.url, style)
            : sprite.url,
      };
    });
  }

  Object.entries(style.sources ?? {}).forEach(([sourceName, source]) => {
    const resource: StyleResource = source as StyleResource;
    if (typeof resource.url === "string") {
      resource.url = replaceUrlAccessToken(resource.url, style, sourceName);
    }
    if (Array.isArray(resource.tiles)) {
      resource.tiles = resource.tiles.map((url: string) => {
        return replaceUrlAccessToken(url, style, sourceName);
      });
    }
    if (Array.isArray(resource.urls)) {
      resource.urls = resource.urls.map((url: string) => {
        return replaceUrlAccessToken(url, style, sourceName);
      });
    }
    if (typeof resource.data === "string") {
      resource.data = replaceUrlAccessToken(resource.data, style, sourceName);
    }
  });

  return style;
}
