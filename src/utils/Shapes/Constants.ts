/** Default width and height of canonical shape geometry. */
export const DEFAULT_SHAPE_WIDTH: number = 200;
export const DEFAULT_SHAPE_HEIGHT: number = 200;

/** Default table structure and cell dimensions. */
export const DEFAULT_TABLE_COL_WIDTH: number = 120;
export const DEFAULT_TABLE_ROW_HEIGHT: number = 75;
export const DEFAULT_TABLE_ROWS: number = 3;
export const DEFAULT_TABLE_COLS: number = 3;

/** Default duration used when a motion has no valid duration. */
export const DEFAULT_MOTION_DURATION_MS: number = 400;

// At scale 1, the map is displayed at this natural MapLibre zoom level.
export const NATURAL_MAP_ZOOM: number = 14;
const MIN_MAP_ZOOM: number = 0;
const MAX_MAP_ZOOM: number = 22;
const MAP_ZOOM_STEP: number = 0.4;

// General zoom/scale conversion formulas:
//   mapZoom   = naturalMapZoom + log2(stageScale)
//   stageScale = 2 ** (mapZoom - naturalMapZoom)
//   scaleFactorForZoomStep = 2 ** mapZoomStep
//
// To support a map zoom range [minMapZoom, maxMapZoom], use:
//   minStageScale = 2 ** (minMapZoom - naturalMapZoom)
//   maxStageScale = 2 ** (maxMapZoom - naturalMapZoom)
export const MIN_STAGE_SCALE: number = 2 ** (MIN_MAP_ZOOM - NATURAL_MAP_ZOOM);
export const MAX_STAGE_SCALE: number = 2 ** (MAX_MAP_ZOOM - NATURAL_MAP_ZOOM);
export const STAGE_SCALE_FACTOR: number = 2 ** MAP_ZOOM_STEP;

export const DEFAULT_CENTER_LNG: number = 105.82234262427113;
export const DEFAULT_CENTER_LAT: number = 21.056155258978833;
