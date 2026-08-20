import { BBox, Point, TileScheme, TileSize, Unit } from "../../types/Common";
import { WindowSize } from "../../types/Window";
import { Vector2d } from "konva/lib/types";
import { Coordinate } from "../Map";

/** Options used when calculating the size of a map. */
export type CalculateSizeOption = {
  /** Optional map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds?: BBox;
  /** Optional zoom level override. */
  zoom?: number;
  /** Optional scale factor in meters. */
  scale?: number;
  /** Tile size in pixels. */
  tileSize?: TileSize;
  /** Pixels per inch when rendering. */
  ppi?: number;
};

/** Options used when splitting a map bounds into grid cells. */
export type SplitBBoxOption = {
  /** Map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds: BBox;
  /** Optional longitude step size. */
  lonStep?: number;
  /** Optional latitude step size. */
  latStep?: number;
};

/** Options used when calculating a map bounds from size and zoom. */
export type CalculateBBoxOption = {
  /** Zoom level. */
  zoom: number;
  /** Optional scale factor in meters. */
  scale?: number;
  /** Optional center as `[lng, lat]`. */
  center?: Point;
  /** Image size in pixels. */
  size: WindowSize;
  /** Tile size in pixels. */
  tileSize?: TileSize;
  /** Pixels per inch when rendering. */
  ppi?: number;
};

/** Options used when converting a tile index range to a map bounds. */
export type BBoxFromTilesOption = {
  /** X tile index range as `[minX, maxX]`. */
  x: Point;
  /** Y tile index range as `[minY, maxY]`. */
  y: Point;
  /** Zoom level. */
  z: number;
  /** Tile scheme, either "xyz" or "tms". */
  scheme?: TileScheme;
};

/** Options used when converting a map bounds to a tile index range. */
export type TilesFromBBoxOption = {
  /** Map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds: BBox;
  /** Zoom level. */
  z: number;
  /** Tile scheme, either "xyz" or "tms". */
  scheme?: TileScheme;
};

/** Options used when snapping a map bounds to tile boundaries. */
export type RealBBoxOption = TilesFromBBoxOption;

/** Options used when converting lon/lat to pixel x/y inside a rendered map bounds image. */
export type LonLat4326ToPixelOption = {
  /** Longitude in EPSG:4326. */
  lng?: number;
  /** Latitude in EPSG:4326. */
  lat?: number;
  /** Optional map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds?: BBox;
  /** Optional center as `[lng, lat]`. */
  center?: Point;
  /** Optional zoom level. Used with `center` to convert pixel size to map bounds. */
  zoom?: number;
  /** Optional scale factor in meters. */
  scale?: number;
  /** Image size in pixels. */
  size: WindowSize;
  /** Tile size in pixels, kept for caller context. */
  tileSize?: TileSize;
  /** Pixels per inch when rendering. */
  ppi?: number;
};

/** Options used when converting pixel x/y inside a rendered map bounds image to lon/lat. */
export type PixelToLonLat4326Option = {
  /** X coordinate in the target image. */
  x?: number;
  /** Y coordinate in the target image. */
  y?: number;
  /** Optional map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds?: BBox;
  /** Optional center as `[lng, lat]`. */
  center?: Point;
  /** Optional zoom level. Used with `center` to convert pixel size to map bounds. */
  zoom?: number;
  /** Optional scale factor in meters. */
  scale?: number;
  /** Image size in pixels. */
  size: WindowSize;
  /** Tile size in pixels, kept for caller context. */
  tileSize?: TileSize;
  /** Pixels per inch when rendering. */
  ppi?: number;
};

/** Response used when creating a reusable lon/lat to pixel transform. */
export type LonLat4326ToPixelTransform = {
  /** Executes the transform action. */
  transform: (coordinate: Coordinate) => Vector2d;
};

/** Response used when creating a reusable pixel to lon/lat transform. */
export type PixelToLonLat4326Transform = {
  /** Executes the transform action. */
  transform: (point: Vector2d) => Coordinate;
};

/** Options used when converting lon/lat/z to XYZ tile indices. */
export type XYZFromLonLatZOption = {
  /** Longitude in EPSG:4326. */
  lng: number;
  /** Latitude in EPSG:4326. */
  lat: number;
  /** Zoom level. */
  z: number;
  /** Tile scheme, either "xyz" or "tms". */
  scheme?: TileScheme;
};

/** Options used when converting pixel coordinates/z to XYZ tile indices. */
export type XYZFromPixelZOption = {
  /** X coordinate in pixels. */
  pxX: number;
  /** Y coordinate in pixels. */
  pxY: number;
  /** Zoom level. */
  z: number;
  /** Tile scheme, either "xyz" or "tms". */
  scheme?: TileScheme;
  /** Tile size in pixels. */
  tileSize?: TileSize;
};

/** Options used when getting lon/lat from XYZ tile indices. */
export type LonLatFromXYZOption = {
  /** X tile index. */
  x: number;
  /** Y tile index. */
  y: number;
  /** Zoom level. */
  z: number;
  /** Position within the tile to get the lon/lat for. */
  position?: "center" | "topLeft" | "bottomRight";
  /** Tile scheme, either "xyz" or "tms". */
  scheme?: TileScheme;
};

/** Options used when getting tile bounds. **/
export type TileBoundsOption = {
  /** X tile index. */
  x: number;
  /** Y tile index. */
  y: number;
  /** Zoom level. */
  z: number;
  /** Tile scheme, either "xyz" or "tms". */
  scheme?: TileScheme;
};

/** Options used when calculating zoom level from scale factor in meters or vice versa. */
export type ZoomToScaleOption = {
  /** Zoom level. */
  zoom: number;
  /** Tile size in pixels. */
  tileSize?: TileSize;
  /** Pixels per inch when rendering. */
  ppi?: number;
};

/** Options used when calculating scale factor in meters from zoom level or vice versa. */
export type ScaleToZoomOption = {
  /** Scale factor in meters. */
  scale: number;
  /** Tile size in pixels. */
  tileSize?: TileSize;
  /** Pixels per inch when rendering. */
  ppi?: number;
};

/** XYZ tile indices. */
export type TileXYZ = {
  /** X tile index. */
  x: number;
  /** Y tile index. */
  y: number;
  /** Zoom level. */
  z: number;
};

/** Options used when calculating pyramid tile ranges. */
export type PyramidTileRangesOption = {
  /** Zoom level. */
  z: number;
  /** X tile index. */
  x: number;
  /** Y tile index. */
  y: number;
  /** Delta zoom level. */
  deltaZ: number;
  /** Tile scheme, either "xyz" or "tms". */
  scheme?: TileScheme;
};

/** Options used when calculating the maximum zoom level for a given map bounds and image size. */
export type CalculateResolutionOption = {
  /** Map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds: BBox;
  /** Image size in pixels. */
  size: WindowSize;
  /** Unit of measurement, e.g., "meters" or "degrees". */
  unit?: Unit;
};

/** Options used when calculating the maximum zoom level for a given map bounds and image size. */
export type CalculateMaxZoomOption = {
  /** Map bounds as `[minLon, minLat, maxLon, maxLat]`. */
  bounds: BBox;
  /** Image size in pixels. */
  size: WindowSize;
  /** Tile size in pixels. */
  tileSize?: TileSize;
};

/** Options used when transforming a point between coordinate reference systems. */
export type TransformSRSOption = {
  /** Point `[x, y]`; for geographic SRS use `[lon, lat]`. */
  point?: Point;
  /** Map bounds; for geographic SRS use `[minLon, minLat, maxLon, maxLat]`. */
  bounds?: BBox;
  /** Source SRS, e.g. `"EPSG:4326"`. */
  srcSRS: string;
  /** Destination SRS, e.g. `"EPSG:3857"`. */
  dstSRS: string;
};
