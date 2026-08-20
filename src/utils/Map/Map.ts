import { CreateMapOption, RenderMapOption, MapEvent } from "./Types";
import { calculateSize, scaleToZoom } from "../Spatial";
import { WindowSize } from "../../types/Window";
import { isValidBBox } from "../Validator";
import { BBox } from "../../types/Common";
import { exportCanvas } from "../Canvas";
import {
  StyleSpecification,
  LayerSpecification,
  FullscreenControl,
  NavigationControl,
  GeolocateControl,
  TerrainControl,
  GeoJSONSource,
  GlobeControl,
  ScaleControl,
  Map,
} from "maplibre-gl";

type MapZoomOption = Pick<
  CreateMapOption,
  "zoom" | "scale" | "ppi" | "tileSize"
>;

/** Resolve a configured map scale to zoom without mutating the caller's options. */
function getMapZoom(option: MapZoomOption): number {
  return option.scale
    ? scaleToZoom({
        scale: option.scale,
        ppi: option.ppi,
        tileSize: option.tileSize,
      })
    : option.zoom;
}

const MAP_RECT_SOURCE_ID: string = "rect-source";
/** Configuration constant for map rect fill id. */
export const MAP_RECT_FILL_ID: string = "rect-fill";
const MAP_RECT_LINE_ID: string = "rect-line";
const MAP_RECT_LAYERS: LayerSpecification[] = [
  {
    id: MAP_RECT_FILL_ID,
    source: MAP_RECT_SOURCE_ID,
    type: "fill",
    paint: {
      "fill-color": "#ffaa44",
      "fill-opacity": 0.3,
    },
  },
  {
    id: MAP_RECT_LINE_ID,
    source: MAP_RECT_SOURCE_ID,
    type: "line",
    paint: {
      "line-color": "#ffaa44",
      "line-width": 2,
      "line-opacity": 0.8,
    },
  },
];

/**
 * Wait for a specific map event to occur, with an optional timeout.
 *
 * The event listener covers future events, while an immediate readiness check
 * handles maps that have already loaded or become idle.
 *
 * @param {Map} map The MapLibre map instance.
 * @param {MapEvent} event The name of the event to wait for ("load", "styledata", "style.load", or "idle").
 * @param {number} timeout The maximum time to wait, in milliseconds. When omitted or negative, waits indefinitely.
 * @param {() => void} action Optional action to run after listeners are attached. When provided, readiness from the previous map state is ignored.
 * @returns {Promise<void>} Resolves when the event condition is satisfied, or rejects on timeout/error.
 *
 * @example
 * ```ts
 * await waitMapEvent(map, "load", 5000);
 * await waitMapEvent(map, "styledata", 5000);
 * await waitMapEvent(map, "idle", 10000);
 * ```
 */
function waitMapEvent(
  map: Map,
  event: MapEvent,
  timeout?: number,
  action?: () => void
): Promise<void> {
  if (!map) {
    return;
  }

  return new Promise<void>((resolve, reject) => {
    let settled: boolean;
    let timeoutId: ReturnType<typeof setTimeout>;

    /** Performs is event ready. */
    function isEventReady(): boolean {
      if (event === "idle") {
        return map.loaded() && !!map.isStyleLoaded() && !map.isMoving();
      } else if (event === "styledata" || event === "style.load") {
        return !!map.isStyleLoaded();
      } else {
        return map.loaded();
      }
    }

    /** Performs cleanup. */
    function cleanup(): void {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);

        timeoutId = undefined;
      }

      map.off(event, finish);
      map.off("error", onError);
    }

    /** Performs finish. */
    function finish(): void {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve();
    }

    /** Performs on error. */
    function onError(e: ErrorEvent): void {
      if (settled) {
        return;
      }

      settled = true;

      cleanup();

      reject(e.error ?? e);
    }

    map.once(event, finish);
    map.once("error", onError);

    if (action) {
      try {
        action();
      } catch (error) {
        settled = true;
        cleanup();
        reject(error);
        return;
      }

      if (settled) {
        return;
      }
    } else if (isEventReady()) {
      finish();
      return;
    }

    if (timeout >= 0) {
      timeoutId = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;

        cleanup();

        reject(new Error(`Map ${event} event timed out after ${timeout}ms`));
      }, timeout);
    }
  });
}

/**
 * Create a new MapLibre map instance with the specified options.
 * @param {CreateMapOption} option Configuration options for the map.
 * @returns {Map | Promise<Map>} A Promise that resolves to the created MapLibre map instance.
 *
 * @example
 * ```ts
 * await createMap({}); // resolves to a Promise that resolves to the created MapLibre map instance.
 * ```
 */
export function createMap(option: CreateMapOption): Map | Promise<Map> {
  try {
    const map: Map = new Map({
      container: option.container,
      interactive: option.interactive,
      canvasContextAttributes: option.canvasContextAttributes ?? {
        antialias: true,
      },
      maplibreLogo: option.logoControl,
      attributionControl: option.attributionControl ?? false,
      style: option.style,
      bounds: option.bounds,
      center: option.center,
      zoom: getMapZoom(option),
      minZoom: option.minZoom,
      maxZoom: option.maxZoom,
      pitch: option.pitch ?? 0,
      bearing: option.bearing ?? 0,
      pixelRatio: option.tileScale ?? 1,
    });

    if (option.scaleControl) {
      map.addControl(new ScaleControl(option.scaleControl));
    }

    if (option.fullscreenControl) {
      map.addControl(new FullscreenControl(option.fullscreenControl));
    }

    if (option.navigationControl) {
      map.addControl(new NavigationControl(option.navigationControl));
    }

    if (option.terrainControl) {
      map.addControl(new TerrainControl(option.terrainControl));
    }

    if (option.geolocateControl) {
      map.addControl(new GeolocateControl(option.geolocateControl));
    }

    if (option.globeControl) {
      map.addControl(new GlobeControl());
    }

    if (option.onMoveEnd) {
      map.on("moveend", option.onMoveEnd);
    }

    if (option.onMouseMove) {
      map.on("mousemove", option.onMouseMove);
    }

    if (option.onMouseDown) {
      map.on("mousedown", option.onMouseDown);
    }

    if (option.onMouseUp) {
      map.on("mouseup", option.onMouseUp);
    }

    if (option.onMouseOut) {
      map.on("mouseout", option.onMouseOut);
    }

    if (option.sync) {
      return map;
    }

    return waitMapEvent(
      map,
      option.style ? "styledata" : "load",
      option.timeout
    ).then(() => {
      return map;
    });
  } catch (error) {
    console.error("Error initializing map:", error);

    throw error;
  }
}

/**
 * Replace the style of an existing MapLibre map and wait for it to load.
 *
 * @param map MapLibre instance to update.
 * @param style Style URL or inline style specification.
 * @param timeout Optional maximum wait passed to the map-event helper.
 * @returns A promise that resolves when the new style is ready.
 */
export async function upsertStyle(
  map: Map,
  style: string | StyleSpecification,
  timeout?: number
): Promise<void> {
  if (!map || !style) {
    return;
  }

  // Listen before setStyle(): style events can be emitted while setStyle is
  // applying the new style. Waiting for the next style.load also prevents the
  // old style's ready state from resolving the promise too early.
  try {
    await waitMapEvent(map, "style.load", timeout, () => {
      return map.setStyle(style);
    });
  } catch (error) {
    // MapLibre can finish applying an equivalent/cached style without
    // delivering another style.load event to this listener. Treat the loaded
    // state as success; only propagate a timeout when the style is still not
    // ready.
    if (map.isStyleLoaded()) {
      return;
    }

    throw error;
  }
}

/**
 * Render a map and return an base64 data url or object URL (blob URL).
 * @param {RenderMapOption} option Configuration options for rendering the map.
 * @returns {Promise<string>} A Promise that resolves to the rendered map as a base64 data URL or object URL (blob URL).
 *
 * @example
 * ```ts
 * await renderMap({}); // resolves to a Promise that resolves to the rendered map as a base64 data URL or object URL (blob URL).
 * ```
 */
export async function renderMap(option: RenderMapOption): Promise<string> {
  // Calculate the size of the virtual map container.
  const size: WindowSize = option.size ?? calculateSize(option);

  // Create virtual element
  const container: HTMLDivElement = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = `-${size.width}px`;
  container.style.top = `-${size.height}px`;
  container.style.width = `${size.width}px`;
  container.style.height = `${size.height}px`;
  container.style.overflow = "hidden";
  container.style.visibility = "hidden";
  document.body.appendChild(container);

  let map: Map;

  try {
    map = new Map({
      container: container,
      interactive: false,
      maplibreLogo: false,
      attributionControl: false,
      style: option.style,
      bounds: option.size ? undefined : option.bounds,
      center: option.center,
      zoom: getMapZoom(option),
      pitch: option.pitch ?? 0,
      bearing: option.bearing ?? 0,
      pixelRatio: option.tileScale ?? 1,
    });

    await waitMapEvent(map, "idle", option.timeout);

    return await exportCanvas(map.getCanvas(), option.format, option.type);
  } catch (error) {
    console.error("Error initializing map:", error);

    throw error;
  } finally {
    map?.remove();

    container.remove();
  }
}

/** Provides upsert rect. */
export async function upsertRect(
  map: Map,
  bbox?: BBox,
  timeout?: number
): Promise<void> {
  if (!map) {
    return;
  }

  if (isValidBBox(bbox, true)) {
    const data: any = {
      type: "Polygon",
      coordinates: [
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[1]],
          [bbox[2], bbox[3]],
          [bbox[0], bbox[3]],
          [bbox[0], bbox[1]],
        ],
      ],
    };

    const source: GeoJSONSource = map.getSource(MAP_RECT_SOURCE_ID);
    if (source) {
      source.setData(data);
    } else {
      map.addSource(MAP_RECT_SOURCE_ID, {
        type: "geojson",
        data,
      });

      MAP_RECT_LAYERS.forEach((layer) => {
        map.addLayer(layer);
      });
    }
  } else {
    MAP_RECT_LAYERS.forEach((layer) => {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    });

    if (map.getSource(MAP_RECT_SOURCE_ID)) {
      map.removeSource(MAP_RECT_SOURCE_ID);
    }
  }

  await waitMapEvent(map, "styledata", timeout);
}

/** Provides hover rect. */
export async function hoverRect(
  map: Map,
  hover?: boolean,
  timeout?: number
): Promise<void> {
  if (!map?.getLayer(MAP_RECT_FILL_ID)) {
    return;
  }

  const opacity: number = hover ? 0.8 : 0.3;

  if (map.getPaintProperty(MAP_RECT_FILL_ID, "fill-opacity") === opacity) {
    return;
  } else {
    map.setPaintProperty(MAP_RECT_FILL_ID, "fill-opacity", opacity);

    await waitMapEvent(map, "styledata", timeout);
  }
}

/** Set or reset the cursor style on a Map container. */
export function setMapCursor(map: Map, style?: string): void {
  map?.getCanvas().style.setProperty("cursor", style ?? "");
}
