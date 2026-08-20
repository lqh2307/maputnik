import { TileSize } from "../../types/Common";

/** Maximum longitude in degrees for EPSG:4326 normalization. */
export const MAX_LON: number = 180;
/** Maximum latitude in degrees for EPSG:4326 normalization. */
export const MAX_LAT: number = 90;
/** Maximum latitude supported by Web Mercator (EPSG:3857) in degrees. */
export const MAX_CAL_LAT: number = 85.051129;

/** Radius of the Earth in meters for spherical calculations. */
export const SPHERICAL_RADIUS: number = 6378137.0;
/** Circumference of the Earth in meters for spherical calculations. */
export const MAX_GM: number = 2 * Math.PI * SPHERICAL_RADIUS;

/** Minimum zoom level for Web Mercator (EPSG:3857). */
export const MIN_ZOOM: number = 0;
/** Maximum zoom level for Web Mercator (EPSG:3857). */
export const MAX_ZOOM: number = 25;

/** Default tile size in pixels for Web Mercator (EPSG:3857). */
export const DEFAULT_TILE_SIZE: TileSize = 512;

/** Default pixels per inch (PPI) for screen resolution. */
export const DEFAULT_PPI: number = 96;
