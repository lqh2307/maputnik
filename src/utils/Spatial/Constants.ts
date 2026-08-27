import { TileSize } from "../../types/Common";

export const TOTAL_DEGREES = 360;

/** Maximum longitude in degrees for EPSG:4326 normalization. */
export const MAX_LON: number = 180;
/** Maximum latitude in degrees for EPSG:4326 normalization. */
export const MAX_LAT: number = 90;

/** Minimum zoom level for Web Mercator (EPSG:3857). */
export const MIN_ZOOM: number = 0;
/** Maximum zoom level for Web Mercator (EPSG:3857). */
export const MAX_ZOOM: number = 25;

/** Default tile size in pixels for Web Mercator (EPSG:3857). */
export const DEFAULT_TILE_SIZE: TileSize = 512;

/** Default pixels per inch (PPI) for screen resolution. */
export const DEFAULT_PPI: number = 96;
