import { TileSize, Point, BBox, Size } from "../../types/Common";
import proj4, { ProjectionDefinition } from "proj4";
import { limitValue, max, min } from "../Number";
import { WindowSize } from "../../types/Window";
import { Vector2d } from "konva/lib/types";
import { convertLength } from "../Utils";
import { Coordinate } from "../Map";
import {
  LonLat4326ToPixelTransform,
  PixelToLonLat4326Transform,
  CalculateResolutionOption,
  PyramidTileRangesOption,
  LonLat4326ToPixelOption,
  PixelToLonLat4326Option,
  CalculateMaxZoomOption,
  XYZFromLonLatZOption,
  BBoxFromTilesOption,
  CalculateBBoxOption,
  CalculateSizeOption,
  TilesFromBBoxOption,
  XYZFromPixelZOption,
  LonLatFromXYZOption,
  TransformSRSOption,
  ZoomToScaleOption,
  ScaleToZoomOption,
  TileBoundsOption,
  SplitBBoxOption,
  RealBBoxOption,
  TileXYZ,
} from "./Types";
import {
  DEFAULT_TILE_SIZE,
  TOTAL_DEGREES,
  DEFAULT_PPI,
  MAX_ZOOM,
  MIN_ZOOM,
  MAX_LAT,
  MAX_LON,
} from "./Constants";

/** Detect proj4 definitions that use geographic longitude/latitude units. */
const GEOGRAPHIC_REGEX: RegExp = /\+proj=(?:longlat|latlong)\b/;
/** Radius of the Earth in meters for spherical calculations. */
const SPHERICAL_RADIUS: number = 6378137.0;
/** Full turn in radians, used by spherical geometry formulas. */
const TWO_PI = 2 * Math.PI;
/** Circumference of the Earth in meters for spherical calculations. */
const MAX_GM: number = TWO_PI * SPHERICAL_RADIUS;
/** Maximum latitude supported by Web Mercator (EPSG:3857) in degrees. */
const MAX_CAL_LAT: number = 85.051129;

/**
 * https://epsg.io/4756
 */
proj4.defs(
  "EPSG:4756",
  "+proj=longlat +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +no_defs +type=crs"
);
/**
 * https://epsg.io/3405
 */
proj4.defs(
  "EPSG:3405",
  "+proj=utm +zone=48 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs +type=crs"
);
/**
 * https://epsg.io/3406
 */
proj4.defs(
  "EPSG:3406",
  "+proj=utm +zone=49 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs +type=crs"
);

/**
 * Check whether an SRS uses geographic (longitude/latitude) coordinates.
 *
 * Projected systems such as UTM return false, while geographic systems such
 * as EPSG:4326 and EPSG:4756 return true.
 *
 * @param {string} srs EPSG code or proj4 definition.
 * @returns {boolean} True when the SRS is geographic.
 */
export function isGeographicSRS(srs?: string): boolean {
  if (GEOGRAPHIC_REGEX.test(srs)) {
    return true;
  }

  const definition: ProjectionDefinition = proj4.defs(
    srs
  ) as ProjectionDefinition;

  return (
    definition?.projName === "longlat" || definition?.projName === "latlong"
  );
}

/**
 * Convert WGS84 (EPSG:4326) longitude/latitude to Web Mercator (EPSG:3857) x/y.
 * @param {Coordinate} coordinate Coordinate object with `lng` and `lat` properties
 * @returns {Vector2d} Point in meters (Web Mercator)
 *
 * @example
 * ```ts
 * lonLat4326ToXY3857({ x: 0, y: 0 }); // Point in meters (Web Mercator)
 * ```
 */
export function lonLat4326ToXY3857(coordinate: Coordinate): Vector2d {
  return {
    x:
      limitValue(coordinate.lng, -MAX_LON, MAX_LON) *
      (Math.PI / MAX_LON) *
      SPHERICAL_RADIUS,
    y:
      Math.log(
        Math.tan(
          (Math.PI *
            (limitValue(coordinate.lat, -MAX_CAL_LAT, MAX_CAL_LAT) + MAX_LAT)) /
            TOTAL_DEGREES
        )
      ) * SPHERICAL_RADIUS,
  };
}

/**
 * Convert Web Mercator (EPSG:3857) x/y to WGS84 (EPSG:4326) longitude/latitude.
 * @param {Vector2d} point Point in meters
 * @returns {Coordinate} Coordinate object with `lng` and `lat` properties
 *
 * @example
 * ```ts
 * xy3857ToLonLat4326({ x: 0, y: 0 }); // Coordinate object with `lng` and `lat` properties
 * ```
 */
export function xy3857ToLonLat4326(point: Vector2d): Coordinate {
  return {
    lng: limitValue(
      (point.x / SPHERICAL_RADIUS) * (MAX_LON / Math.PI),
      -MAX_LON,
      MAX_LON
    ),
    lat: limitValue(
      Math.atan(Math.sinh(point.y / SPHERICAL_RADIUS)) * (MAX_LON / Math.PI),
      -MAX_CAL_LAT,
      MAX_CAL_LAT
    ),
  };
}

/**
 * Convert WGS84 lon/lat/z to XYZ tile indices at a zoom level.
 * @param {XYZFromLonLatZOption} option Options for conversion
 * @returns {TileXYZ} XYZ tile indices
 *
 * @example
 * ```ts
 * getXYZFromLonLatZ({}); // XYZ tile indices
 * ```
 */
export function getXYZFromLonLatZ(option: XYZFromLonLatZOption): TileXYZ {
  const maxTile: number = 1 << option.z;

  let x =
    (0.5 + limitValue(option.lng, -MAX_LON, MAX_LON) / TOTAL_DEGREES) * maxTile;
  let y =
    (0.5 -
      Math.log(
        Math.tan(
          (Math.PI *
            (limitValue(option.lat, -MAX_CAL_LAT, MAX_CAL_LAT) + MAX_LAT)) /
            TOTAL_DEGREES
        )
      ) /
        TWO_PI) *
    maxTile;

  if (option.scheme === "tms") {
    y = maxTile - y;
  }

  return {
    x: limitValue(Math.floor(x), 0, maxTile - 1),
    y: limitValue(Math.floor(y), 0, maxTile - 1),
    z: option.z,
  };
}

/**
 * Convert global pixel coordinates/z to XYZ tile indices.
 * @param {XYZFromPixelZOption} option Options for conversion
 * @returns {TileXYZ} XYZ tile indices
 *
 * @example
 * ```ts
 * getXYZFromPixelZ({}); // XYZ tile indices
 * ```
 */
export function getXYZFromPixelZ(option: XYZFromPixelZOption): TileXYZ {
  const tileSize: TileSize = option.tileSize || DEFAULT_TILE_SIZE;

  if (option.scheme === "tms") {
    option.pxY = tileSize * (1 << option.z) - option.pxY;
  }

  return {
    x: Math.floor(option.pxX / tileSize),
    y: Math.floor(option.pxY / tileSize),
    z: option.z,
  };
}

/**
 * Get lon/lat from tile indices.
 * @param {LonLatFromXYZOption} option Options for conversion
 * @returns {Coordinate} Coordinate object with `lng` and `lat` properties
 *
 * @example
 * ```ts
 * getLonLatFromXYZ({}); // Coordinate object with `lng` and `lat` properties
 * ```
 */
export function getLonLatFromXYZ(option: LonLatFromXYZOption): Coordinate {
  const maxTile: number = 1 << option.z;

  if (option.scheme === "tms") {
    option.y = maxTile - 1 - option.y;
  }

  if (option.position === "center") {
    option.x += 0.5;
    option.y += 0.5;
  } else if (option.position === "bottomRight") {
    option.x += 1;
    option.y += 1;
  }

  return {
    lng: TOTAL_DEGREES * (option.x / maxTile - 0.5),
    lat:
      (TOTAL_DEGREES *
        Math.atan(Math.exp(Math.PI * (1 - (2 * option.y) / maxTile)))) /
        Math.PI -
      MAX_LAT,
  };
}

/**
 * Get tile bounds in WGS84.
 * @param {TileBoundsOption} option Options for getting tile bounds
 * @returns {BBox} BBox in [minLon, minLat, maxLon, maxLat] in degrees
 *
 * @example
 * ```ts
 * getTileBounds4326({}); // BBox in [minLon, minLat, maxLon, maxLat] in degrees
 * ```
 */
export function getTileBounds4326(option: TileBoundsOption): BBox {
  const tl: Coordinate = getLonLatFromXYZ({
    x: option.x,
    y: option.y,
    z: option.z,
    position: "topLeft",
    scheme: option.scheme,
  });
  const br: Coordinate = getLonLatFromXYZ({
    x: option.x,
    y: option.y,
    z: option.z,
    position: "bottomRight",
    scheme: option.scheme,
  });

  return [tl.lng, br.lat, br.lng, tl.lat];
}

/**
 * Get tile bounds in Web Mercator.
 * @param {TileBoundsOption} option Options for getting tile bounds
 * @returns {BBox} BBox in [minX, minY, maxX, maxY] in meters
 *
 * @example
 * ```ts
 * getTileBounds3857({}); // BBox in [minX, minY, maxX, maxY] in meters
 * ```
 */
export function getTileBounds3857(option: TileBoundsOption): BBox {
  const tlM: Vector2d = lonLat4326ToXY3857(
    getLonLatFromXYZ({
      x: option.x,
      y: option.y,
      z: option.z,
      position: "topLeft",
      scheme: option.scheme,
    })
  );
  const brM: Vector2d = lonLat4326ToXY3857(
    getLonLatFromXYZ({
      x: option.x,
      y: option.y,
      z: option.z,
      position: "bottomRight",
      scheme: option.scheme,
    })
  );

  return [tlM.x, tlM.y, brM.x, brM.y];
}

/**
 * Get tile ranges at a different zoom level that overlap the input tile.
 * @param {PyramidTileRangesOption} option Options for calculating pyramid tile ranges
 * @returns {{ x: Point; y: Point }} Ranges for x/y
 *
 * @example
 * ```ts
 * getPyramidTileRanges({ x: 0, y: 0, z: 1, deltaZ: 1 }); // } Ranges for x/y
 * ```
 */
export function getPyramidTileRanges(option: PyramidTileRangesOption): {
  x: Point;
  y: Point;
} {
  const factor: number = 1 << option.deltaZ;

  const minX: number = option.x * factor;
  const maxX: number = (option.x + 1) * factor - 1;
  const minY: number = option.y * factor;
  const maxY: number = (option.y + 1) * factor - 1;

  if (option.scheme === "tms") {
    const maxTileIndex: number = (1 << (option.z + option.deltaZ)) - 1;

    return {
      x: [minX, maxX],
      y: [maxTileIndex - maxY, maxTileIndex - minY],
    };
  }

  return {
    x: [minX, maxX],
    y: [minY, maxY],
  };
}

/**
 * Split a bbox into grid cells by lon/lat steps.
 * @param {SplitBBoxOption} option Options for splitting
 * @returns {BBox[]} Array of grid cells
 *
 * @example
 * ```ts
 * splitBBox([0, 0, 1, 1]); // Array of grid cells
 * ```
 */
export function splitBBox(option: SplitBBoxOption): BBox[] {
  const result: BBox[] = [];

  /** Split one numeric interval at aligned step boundaries. */
  function splitStep(start: number, end: number, step: number): Point[] {
    const ranges: Point[] = [];

    let cur: number = Math.ceil(start / step) * step;

    if (cur > end) {
      return [[start, end]];
    }

    if (start < cur) {
      ranges.push([start, cur]);
    }

    while (cur + step <= end) {
      ranges.push([cur, cur + step]);

      cur += step;
    }

    if (cur < end) {
      ranges.push([cur, end]);
    }

    return ranges;
  }

  const lonRanges: Point[] = option.lonStep
    ? splitStep(option.bounds[0], option.bounds[2], option.lonStep)
    : [[option.bounds[0], option.bounds[2]]];
  const latRanges: Point[] = option.latStep
    ? splitStep(option.bounds[1], option.bounds[3], option.latStep)
    : [[option.bounds[1], option.bounds[3]]];

  for (const [lonStart, lonEnd] of lonRanges) {
    for (const [latStart, latEnd] of latRanges) {
      result.push([lonStart, latStart, lonEnd, latEnd]);
    }
  }

  return result;
}

/**
 * Calculate pixel size for a bbox at zoom level.
 * Zoom/scale + bounds => size
 * @param option Bounds plus zoom/scale and optional tile-display settings.
 * @returns Pixel width and height of the projected bounds.
 */
export function calculateSize(option: CalculateSizeOption): WindowSize {
  const tileSize: TileSize = option.tileSize || DEFAULT_TILE_SIZE;

  const zoom: number =
    option.zoom ??
    scaleToZoom({
      scale: option.scale,
      tileSize,
      ppi: option.ppi,
    });

  const bl: Vector2d = lonLat4326ToXY3857({
    lng: option.bounds[0],
    lat: option.bounds[1],
  });
  const tr: Vector2d = lonLat4326ToXY3857({
    lng: option.bounds[2],
    lat: option.bounds[3],
  });

  const resolution: number = MAX_GM / (tileSize * Math.pow(2, zoom));

  return {
    width: Math.round((tr.x - bl.x) / resolution),
    height: Math.round((tr.y - bl.y) / resolution),
  };
}

/**
 * Calculate bbox for an image size at zoom level around a center point.
 * Size + zoom/scale + center => bounds
 * This is the inverse of {@link calculateSize}.
 * @param {CalculateBBoxOption} option Options for calculation
 * @returns {BBox} [minLon, minLat, maxLon, maxLat] in EPSG:4326
 *
 * @example
 * ```ts
 * calculateBBox([0, 0, 1, 1]); // [minLon, minLat, maxLon, maxLat] in EPSG:4326
 * ```
 */
export function calculateBBox(option: CalculateBBoxOption): BBox {
  const tileSize: TileSize = option.tileSize || DEFAULT_TILE_SIZE;

  const resolution: number =
    MAX_GM /
    (tileSize *
      Math.pow(
        2,
        option.zoom ??
          scaleToZoom({
            scale: option.scale,
            tileSize,
            ppi: option.ppi,
          })
      ));

  const widthM: number = option.size.width * resolution;
  const heightM: number = option.size.height * resolution;

  const center: Vector2d = lonLat4326ToXY3857({
    lng: option.center[0],
    lat: option.center[1],
  });

  const bl: Coordinate = xy3857ToLonLat4326({
    x: center.x - widthM / 2,
    y: center.y - heightM / 2,
  });
  const tr: Coordinate = xy3857ToLonLat4326({
    x: center.x + widthM / 2,
    y: center.y + heightM / 2,
  });

  return [
    min(bl.lng, tr.lng),
    min(bl.lat, tr.lat),
    max(bl.lng, tr.lng),
    max(bl.lat, tr.lat),
  ];
}

/**
 * Convert tile index range to bbox (outer bounds).
 * @param {BBoxFromTilesOption} option Options for conversion
 * @returns {BBox} [lonMin, latMin, lonMax, latMax]
 *
 * @example
 * ```ts
 * getBBoxFromTiles([0, 0, 1, 1]); // [lonMin, latMin, lonMax, latMax]
 * ```
 */
export function getBBoxFromTiles(option: BBoxFromTilesOption): BBox {
  const tl: Coordinate = getLonLatFromXYZ({
    x: option.x[0],
    y: option.y[0],
    z: option.z,
    position: "topLeft",
    scheme: option.scheme,
  });
  const br: Coordinate = getLonLatFromXYZ({
    x: option.x[1],
    y: option.y[1],
    z: option.z,
    position: "bottomRight",
    scheme: option.scheme,
  });

  return [
    min(tl.lng, br.lng),
    min(tl.lat, br.lat),
    max(tl.lng, br.lng),
    max(tl.lat, br.lat),
  ];
}

/**
 * Convert bbox to tile index range.
 * @param {TilesFromBBoxOption} option Options for conversion
 * @returns {BBox} [minX, minY, maxX, maxY]
 *
 * @example
 * ```ts
 * getTilesFromBBox([0, 0, 1, 1]); // [minX, minY, maxX, maxY]
 * ```
 */
export function getTilesFromBBox(option: TilesFromBBoxOption): BBox {
  const tl: TileXYZ = getXYZFromLonLatZ({
    lng: option.bounds[0],
    lat: option.bounds[3],
    z: option.z,
    scheme: option.scheme,
  });
  const br: TileXYZ = getXYZFromLonLatZ({
    lng: option.bounds[2],
    lat: option.bounds[1],
    z: option.z,
    scheme: option.scheme,
  });

  return [min(tl.x, br.x), min(tl.y, br.y), max(tl.x, br.x), max(tl.y, br.y)];
}

/**
 * Snap bbox to tile boundaries at a zoom level.
 * @param {RealBBoxOption} option Options for snapping
 * @returns {BBox} Snapped bbox
 *
 * @example
 * ```ts
 * getRealBBox([0, 0, 1, 1]); // Snapped bbox
 * ```
 */
export function getRealBBox(option: RealBBoxOption): BBox {
  const [xMin, yMin, xMax, yMax]: BBox = getTilesFromBBox(option);

  return getBBoxFromTiles({
    x: [xMin, xMax],
    y: [yMin, yMax],
    z: option.z,
    scheme: option.scheme,
  });
}

/**
 * Get bbox from a center point and radius in meters.
 * @param {Coordinate} center Center point in EPSG:4326
 * @param {number} radius Radius in meters
 * @returns {BBox} BBox in [minLon, minLat, maxLon, maxLat] in EPSG:4326
 *
 * @example
 * ```ts
 * getBBoxFromCircle({ x: 0, y: 0 }, 0); // BBox in [minLon, minLat, maxLon, maxLat] in EPSG:4326
 * ```
 */
export function getBBoxFromCircle(center: Coordinate, radius: number): BBox {
  const point: Vector2d = lonLat4326ToXY3857(center);

  const bl: Coordinate = xy3857ToLonLat4326({
    x: point.x - radius,
    y: point.y - radius,
  });
  const tr: Coordinate = xy3857ToLonLat4326({
    x: point.x + radius,
    y: point.y + radius,
  });

  return [bl.lng, bl.lat, tr.lng, tr.lat];
}

/**
 * Get bbox from an array of points.
 * When `points` is empty, returns [0, 0, 0, 0].
 * @param {Point[]} points Array of [lon, lat]
 * @returns {BBox} [minLon, minLat, maxLon, maxLat]
 *
 * @example
 * ```ts
 * getBBoxFromPoints([]); // [minLon, minLat, maxLon, maxLat]
 * ```
 */
export function getBBoxFromPoints(points: Point[]): BBox {
  const bbox: BBox = [Infinity, Infinity, -Infinity, -Infinity];

  points.forEach((point) => {
    bbox[0] = min(bbox[0], point[0]);
    bbox[1] = min(bbox[1], point[1]);
    bbox[2] = max(bbox[2], point[0]);
    bbox[3] = max(bbox[3], point[1]);
  });

  bbox[0] = limitValue(bbox[0], -MAX_LON, MAX_LON);
  bbox[2] = limitValue(bbox[2], -MAX_LON, MAX_LON);
  bbox[1] = limitValue(bbox[1], -MAX_CAL_LAT, MAX_CAL_LAT);
  bbox[3] = limitValue(bbox[3], -MAX_CAL_LAT, MAX_CAL_LAT);

  return bbox;
}

/**
 * Get intersection of two bboxes.
 * When they do not intersect, returns [0, 0, 0, 0].
 * @param {BBox} bbox1 [minLon, minLat, maxLon, maxLat]
 * @param {BBox} bbox2 [minLon, minLat, maxLon, maxLat]
 * @returns {BBox} Intersection bbox
 *
 * @example
 * ```ts
 * getIntersectBBox([0, 0, 1, 1], [0, 0, 1, 1]); // Intersection bbox
 * ```
 */
export function getIntersectBBox(bbox1: BBox, bbox2: BBox): BBox {
  const minLon: number = max(bbox1[0], bbox2[0]);
  const minLat: number = max(bbox1[1], bbox2[1]);
  const maxLon: number = min(bbox1[2], bbox2[2]);
  const maxLat: number = min(bbox1[3], bbox2[3]);

  if (minLon >= maxLon || minLat >= maxLat) {
    return;
  }

  return [minLon, minLat, maxLon, maxLat];
}

/**
 * Check if two bboxes intersect (works for any coordinate system).
 * @param {BBox} bbox1 [minLon, minLat, maxLon, maxLat]
 * @param {BBox} bbox2 [minLon, minLat, maxLon, maxLat]
 * @returns {boolean} True if they intersect
 *
 * @example
 * ```ts
 * isIntersectBBoxs([0, 0, 1, 1], [0.5, 0.5, 2, 2]); // true
 * ```
 */
export function isIntersectBBoxs(bbox1: BBox, bbox2: BBox): boolean {
  if (
    max(bbox1[0], bbox1[2]) <= min(bbox2[0], bbox2[2]) ||
    min(bbox1[0], bbox1[2]) >= max(bbox2[0], bbox2[2]) ||
    max(bbox1[1], bbox1[3]) <= min(bbox2[1], bbox2[3]) ||
    min(bbox1[1], bbox1[3]) >= max(bbox2[1], bbox2[3])
  ) {
    return false;
  }

  return true;
}

/**
 * Check if a point is inside a bbox (inclusive).
 * @param {BBox} bbox Bounds in [minLon, minLat, maxLon, maxLat]
 * @param {Coordinate} coordinate { lng, lat }
 * @returns {boolean} True if inside
 *
 * @example
 * ```ts
 * isIntersectBBoxPoint([0, 0, 1, 1], { lng: 0.5, lat: 0.5 }); // true
 * ```
 */
export function isIntersectBBoxPoint(
  bbox: BBox,
  coordinate: Coordinate
): boolean {
  return (
    coordinate.lng >= min(bbox[0], bbox[2]) &&
    coordinate.lng <= max(bbox[0], bbox[2]) &&
    coordinate.lat >= min(bbox[1], bbox[3]) &&
    coordinate.lat <= max(bbox[1], bbox[3])
  );
}

/**
 * Get bounding box that covers both input bboxes.
 * @param {BBox} bbox1 [minLon, minLat, maxLon, maxLat]
 * @param {BBox} bbox2 [minLon, minLat, maxLon, maxLat]
 * @returns {BBox} Cover bbox
 *
 * @example
 * ```ts
 * getCoverBBox([0, 0, 1, 1], [0, 0, 1, 1]); // Cover bbox
 * ```
 */
export function getCoverBBox(bbox1: BBox, bbox2: BBox): BBox {
  return [
    min(min(bbox1[0], bbox1[2]), min(bbox2[0], bbox2[2])),
    min(min(bbox1[1], bbox1[3]), min(bbox2[1], bbox2[3])),
    max(max(bbox1[0], bbox1[2]), max(bbox2[0], bbox2[2])),
    max(max(bbox1[1], bbox1[3]), max(bbox2[1], bbox2[3])),
  ];
}

/**
 * Convert zoom to scale.
 * @param {ZoomToScaleOption} option Options for conversion
 * @returns {number} Scale
 *
 * @example
 * ```ts
 * zoomToScale(0); // Scale
 * ```
 */
export function zoomToScale(option: ZoomToScaleOption): number {
  const { zoom, tileSize = DEFAULT_TILE_SIZE, ppi = DEFAULT_PPI } = option;

  return (ppi * (MAX_GM / tileSize / Math.pow(2, zoom))) / 0.0254;
}

/**
 * Convert scale to zoom.
 * @param {ScaleToZoomOption} option Options for conversion
 * @returns {number} Zoom level
 *
 * @example
 * ```ts
 * scaleToZoom(0); // Zoom level
 * ```
 */
export function scaleToZoom(option: ScaleToZoomOption): number {
  const { scale, tileSize = DEFAULT_TILE_SIZE, ppi = DEFAULT_PPI } = option;

  return Math.log2(ppi * (MAX_GM / tileSize / scale / 0.0254));
}

/**
 * Calculate resolution for a bbox and image size.
 * @param {CalculateResolutionOption} option Options for calculation
 * @returns {Size} Resolution in specified unit (default: meters) as [xRes, yRes]
 *
 * @example
 * ```ts
 * calculateResolution({}); // Resolution in specified unit (default: meters) as [xRes, yRes]
 * ```
 */
export function calculateResolution(option: CalculateResolutionOption): Size {
  // Convert bbox from EPSG:4326 to EPSG:3857
  const bl: Vector2d = lonLat4326ToXY3857({
    lng: option.bounds[0],
    lat: option.bounds[1],
  });
  const tr: Vector2d = lonLat4326ToXY3857({
    lng: option.bounds[2],
    lat: option.bounds[3],
  });

  // Convert resolution to the specified unit
  return [
    convertLength((tr.x - bl.x) / option.size.width, "m", option.unit),
    convertLength((tr.y - bl.y) / option.size.height, "m", option.unit),
  ];
}

/**
 * Calculate max zoom needed to render a bbox at a given pixel size.
 * @param {CalculateMaxZoomOption} option Options for calculation
 * @returns {number} Max zoom (0-25)
 *
 * @example
 * ```ts
 * calculateMaxZoom(0); // Max zoom (0-25)
 * ```
 */
export function calculateMaxZoom(option: CalculateMaxZoomOption): number {
  const tileSize: TileSize = option.tileSize || DEFAULT_TILE_SIZE;

  const [xRes, yRes]: Size = calculateResolution({
    bounds: option.bounds,
    size: option.size,
    unit: "m",
  });

  return limitValue(
    Math.round(Math.log2(MAX_GM / tileSize / min(xRes, yRes))),
    MIN_ZOOM,
    MAX_ZOOM
  );
}

/**
 * Create a reusable transform from WGS84 lon/lat to pixel coordinates inside a rendered bbox image.
 * Uses Web Mercator (EPSG:3857) so the result matches tile-based rendering.
 * @param {LonLat4326ToPixelOption} option Transform options
 * @returns {LonLat4326ToPixelTransform} Transform function that maps coordinates to positions relative to the top-left of the bbox
 *
 * @example
 * ```ts
 * createLonLat4326ToPixelTransform({}); // Transform function that maps coordinates to positions relative to the top-left of the bbox
 * ```
 */
export function createLonLat4326ToPixelTransform(
  option: LonLat4326ToPixelOption
): LonLat4326ToPixelTransform {
  let tl: Vector2d;
  let br: Vector2d;

  if (option.center) {
    const tileSize: TileSize = option.tileSize || DEFAULT_TILE_SIZE;

    const resolution: number =
      MAX_GM /
      (tileSize *
        Math.pow(
          2,
          option.zoom ??
            scaleToZoom({
              scale: option.scale,
              tileSize,
              ppi: option.ppi,
            })
        ));

    const widthM: number = option.size.width * resolution;
    const heightM: number = option.size.height * resolution;

    const center: Vector2d = lonLat4326ToXY3857({
      lng: option.center[0],
      lat: option.center[1],
    });

    tl = {
      x: center.x - widthM / 2,
      y: center.y + heightM / 2,
    };
    br = {
      x: center.x + widthM / 2,
      y: center.y - heightM / 2,
    };
  } else {
    tl = lonLat4326ToXY3857({
      lng: option.bounds[0],
      lat: option.bounds[3],
    });
    br = lonLat4326ToXY3857({
      lng: option.bounds[2],
      lat: option.bounds[1],
    });
  }

  return {
    transform: (coordinate: Coordinate): Vector2d => {
      const point: Vector2d = lonLat4326ToXY3857(coordinate);

      return {
        x: ((point.x - tl.x) / (br.x - tl.x)) * option.size.width,
        y: ((tl.y - point.y) / (tl.y - br.y)) * option.size.height,
      };
    },
  };
}

/**
 * Convert WGS84 lon/lat to pixel coordinates inside a rendered bbox image.
 * @param {LonLat4326ToPixelOption} option Conversion options
 * @returns {Vector2d} Position relative to the top-left of the bbox
 *
 * @example
 * ```ts
 * lonLat4326ToPixel({}); // Position relative to the top-left of the bbox
 * ```
 */
export function lonLat4326ToPixel(option: LonLat4326ToPixelOption): Vector2d {
  return createLonLat4326ToPixelTransform(option).transform({
    lng: option.lng,
    lat: option.lat,
  });
}

/**
 * Create a reusable transform from pixel coordinates inside a rendered bbox image to WGS84 lon/lat.
 * Inverse of {@link createLonLat4326ToPixelTransform}.
 * @param {PixelToLonLat4326Option} option Transform options
 * @returns {PixelToLonLat4326Transform} Transform function that maps pixel positions to coordinates in EPSG:4326
 *
 * @example
 * ```ts
 * createPixelToLonLat4326Transform({}); // Transform function that maps pixel positions to coordinates in EPSG:4326
 * ```
 */
export function createPixelToLonLat4326Transform(
  option: PixelToLonLat4326Option
): PixelToLonLat4326Transform {
  let tl: Vector2d;
  let br: Vector2d;

  if (option.center) {
    const tileSize: TileSize = option.tileSize || DEFAULT_TILE_SIZE;

    const resolution: number =
      MAX_GM /
      (tileSize *
        Math.pow(
          2,
          option.zoom ??
            scaleToZoom({
              scale: option.scale,
              tileSize,
              ppi: option.ppi,
            })
        ));

    const widthM: number = option.size.width * resolution;
    const heightM: number = option.size.height * resolution;

    const center: Vector2d = lonLat4326ToXY3857({
      lng: option.center[0],
      lat: option.center[1],
    });

    tl = {
      x: center.x - widthM / 2,
      y: center.y + heightM / 2,
    };
    br = {
      x: center.x + widthM / 2,
      y: center.y - heightM / 2,
    };
  } else {
    tl = lonLat4326ToXY3857({
      lng: option.bounds[0],
      lat: option.bounds[3],
    });
    br = lonLat4326ToXY3857({
      lng: option.bounds[2],
      lat: option.bounds[1],
    });
  }

  return {
    transform: (point: Vector2d): Coordinate => {
      return xy3857ToLonLat4326({
        x: tl.x + (point.x / option.size.width) * (br.x - tl.x),
        y: tl.y - (point.y / option.size.height) * (tl.y - br.y),
      });
    },
  };
}

/**
 * Convert pixel coordinates inside a rendered bbox image back to WGS84 lon/lat.
 * Inverse of {@link lonLat4326ToPixel}.
 * @param {PixelToLonLat4326Option} option Conversion options
 * @returns {Coordinate} Coordinate in EPSG:4326
 *
 * @example
 * ```ts
 * pixelToLonLat4326({}); // Coordinate in EPSG:4326
 * ```
 */
export function pixelToLonLat4326(option: PixelToLonLat4326Option): Coordinate {
  return createPixelToLonLat4326Transform(option).transform({
    x: option.x,
    y: option.y,
  });
}

/**
 * Transform a point between any two coordinate reference systems.
 * Accepts EPSG codes (e.g. `"EPSG:4326"`, `"EPSG:3857"`) or proj4 definition strings.
 * @param {TransformSRSOption} option Options for transformation
 * @returns {Point} Transformed [x, y]
 *
 * @example
 * ```ts
 * transformPointSRS({}); // Transformed [x, y]
 * ```
 */
export function transformPointSRS(option: TransformSRSOption): Point {
  if (option.dstSRS === option.srcSRS) {
    return option.point;
  }

  return proj4(option.srcSRS, option.dstSRS, option.point) as Point;
}

/**
 * Transform a bounding box between coordinate reference systems.
 * All four corners are transformed and normalized back to `[minX, minY, maxX, maxY]`.
 * @param {TransformSRSOption} option Options for transformation
 * @returns {BBox} Transformed bbox
 *
 * @example
 * ```ts
 * transformBBoxSRS({}); // Transformed bbox
 * ```
 */
export function transformBBoxSRS(option: TransformSRSOption): BBox {
  if (option.dstSRS === option.srcSRS) {
    return option.bounds;
  }

  try {
    const corner1: Point = transformPointSRS({
      srcSRS: option.srcSRS,
      dstSRS: option.dstSRS,
      point: [option.bounds[0], option.bounds[1]],
    });
    const corner2: Point = transformPointSRS({
      srcSRS: option.srcSRS,
      dstSRS: option.dstSRS,
      point: [option.bounds[2], option.bounds[3]],
    });

    return [
      min(corner1[0], corner2[0]),
      min(corner1[1], corner2[1]),
      max(corner1[0], corner2[0]),
      max(corner1[1], corner2[1]),
    ];
  } catch (error) {
    console.error("Error transforming bbox:", error);

    return;
  }
}
