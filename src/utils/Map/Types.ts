import { BBox, ImageFormat, Point, TileSize } from "../../types/Common";
import { WindowSize } from "../../types/Window";
import { EncodeType } from "../Image";
import {
  WebGLContextAttributesWithType,
  AttributionControlOptions,
  FullscreenControlOptions,
  NavigationControlOptions,
  GeolocateControlOptions,
  TerrainSpecification,
  ScaleControlOptions,
  SourceSpecification,
  StyleSpecification,
  MapGeoJSONFeature,
  MapLibreEvent,
  MapMouseEvent,
} from "maplibre-gl";

/** Defines map event. */
export type MapEvent = "load" | "styledata" | "style.load" | "idle";

/** Options used when creating a new MapLibre map instance. */
export type CreateMapOption = {
  /** The HTML element to initialize the map in. */
  container: HTMLElement;

  /** Whether interactive. */
  interactive?: boolean;

  /** WebGL context attributes used by MapLibre and any shared custom layers. */
  canvasContextAttributes?: WebGLContextAttributesWithType;

  /** Configuration for attribution control. */
  attributionControl?: false | AttributionControlOptions;

  /** Configuration for scale control. */
  scaleControl?: ScaleControlOptions;

  /** Configuration for navigation control. */
  navigationControl?: NavigationControlOptions;

  /** Configuration for terrain control. */
  terrainControl?: TerrainSpecification;

  /** Configuration for fullscreen control. */
  fullscreenControl?: FullscreenControlOptions;

  /** Configuration for geolocate control. */
  geolocateControl?: GeolocateControlOptions;

  /** Whether globe control. */
  globeControl?: boolean;

  /** Whether logo control. */
  logoControl?: boolean;

  /** Map style URL/string or MapLibre style spec object. */
  style?: string | StyleSpecification;
  /** Map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds?: BBox;
  /** Optional map center as `[lng, lat]`. */
  center?: Point;
  /** Optional zoom level. */
  zoom?: number;
  /** Lowest allowed MapLibre zoom level. */
  minZoom?: number;
  /** Highest allowed MapLibre zoom level. */
  maxZoom?: number;
  /** Optional scale factor in meters. */
  scale?: number;
  /** Tile scale multiplier. */
  tileScale?: number;
  /** Tile size in pixels. */
  tileSize?: TileSize;
  /** Pitch angle in degrees. */
  pitch?: number;
  /** Bearing/rotation in degrees. */
  bearing?: number;
  /** Pixels per inch when rendering. */
  ppi?: number;
  /** Timeout in milliseconds for map loading and rendering. Omit or use a negative value to wait indefinitely. */
  timeout?: number;
  /** When true, create the MapLibre instance immediately without waiting for the style to load. */
  sync?: boolean;

  /** Callback function that is called when the map has finished moving. */
  onMoveEnd?: (e: MapLibreEvent) => void;
  /** Event callback for mouse move. */
  onMouseMove?: (e: MapMouseEvent) => void;
  /** Event callback for mouse down. */
  onMouseDown?: (e: MapMouseEvent) => void;
  /** Event callback for mouse up. */
  onMouseUp?: (e: MapMouseEvent) => void;
  /** Event callback for mouse out. */
  onMouseOut?: (e: MapMouseEvent) => void;
};

/** Options used when rendering a MapLibre style to a static image. */
export type RenderMapOption = {
  /** Map style URL/string or MapLibre style spec object. */
  style: string | StyleSpecification;
  /** Optional explicit render size. Used with center/zoom for viewport based rendering. */
  size?: WindowSize;
  /** Map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds?: BBox;
  /** Optional map center as `[lng, lat]`. */
  center?: Point;
  /** Optional zoom level. */
  zoom?: number;
  /** Optional scale factor in meters. */
  scale?: number;
  /** Tile scale multiplier. */
  tileScale?: number;
  /** Tile size in pixels. */
  tileSize?: TileSize;
  /** Pitch angle in degrees. */
  pitch?: number;
  /** Bearing/rotation in degrees. */
  bearing?: number;
  /** Output format (e.g., png, jpeg). */
  format?: ImageFormat;
  /** Output encoding type (base64 data URL or object URL). */
  type?: EncodeType;
  /** Pixels per inch when rendering. */
  ppi?: number;
  /** Timeout in milliseconds for rendering. Omit or use a negative value to wait indefinitely. */
  timeout?: number;
};

/** Geographic coordinate in WGS84 degrees. */
export type Coordinate = {
  /** Longitude in degrees. */
  lng?: number;
  /** Latitude in degrees. */
  lat?: number;
};

/** Defines mutable URL-bearing fields shared by style sources. */
export type StyleResource = SourceSpecification & {
  url?: string;
  tiles?: string[];
  urls?: string[];
  data?: unknown;
};

/** Defines the serializable feature data displayed by the inspector. */
export type InspectorFeature = Pick<
  MapGeoJSONFeature,
  "id" | "properties" | "source" | "sourceLayer" | "state"
> & {
  layer: {
    id: string;
    type: string;
  };
  geometryType: string;
};

/** Defines one style validation issue displayed by the editor. */
export type StyleValidationIssue = {
  message: string;
  line?: number;
  layerId?: string;
  sourceId?: string;
};
