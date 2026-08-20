import { BBox, Extent } from "../../types/Common";
import { isSameNumber } from "../Number";
import Ajv from "ajv";

/**
 * Validate a finite number with optional integer and bounds checks.
 * @param {any} value Value to validate
 * @param {boolean} checkInteger If true, requires an integer
 * @param {number} min Minimum value (inclusive)
 * @param {number} max Maximum value (inclusive)
 * @returns {boolean} True if valid
 *
 * @example
 * ```ts
 * isValidNumber(undefined, false, 0, 0); // false
 * ```
 */
export function isValidNumber(
  value: any,
  checkInteger?: boolean,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return false;
  }

  if (checkInteger && !Number.isInteger(value)) {
    return false;
  }

  if (min !== undefined && value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  return true;
}

/**
 * Validate a longitude value.
 * @param {any} lon Longitude value to validate
 * @param {boolean} isWGS84 If true, enforces WGS84 bounds (-180 to 180)
 * @returns {boolean} True if valid
 *
 * @example
 * ```ts
 * isValidLongitude(undefined, false); // false
 * ```
 */
export function isValidLongitude(lon: any, isWGS84?: boolean): boolean {
  return isWGS84
    ? isValidNumber(lon, false, -180, 180)
    : isValidNumber(lon, false);
}

/**
 * Validate a latitude value.
 * @param {any} lat Latitude value to validate
 * @param {boolean} isWGS84 If true, enforces WGS84 bounds (-90 to 90)
 * @returns {boolean} True if valid
 *
 * @example
 * ```ts
 * isValidLatitude(undefined, false); // false
 * ```
 */
export function isValidLatitude(lat: any, isWGS84?: boolean): boolean {
  return isWGS84
    ? isValidNumber(lat, false, -90, 90)
    : isValidNumber(lat, false);
}

/**
 * Validate an extent array [minLon, maxLat, maxLon, minLat].
 * @param {Extent} extent Extent array
 * @param {boolean} isWGS84 If true, enforces WGS84 bounds
 * @returns {boolean} True if valid
 *
 * @example
 * ```ts
 * isValidExtent(undefined, false); // false
 * ```
 */
export function isValidExtent(extent?: Extent, isWGS84?: boolean): boolean {
  if (extent?.length !== 4) {
    return false;
  }

  if (
    !isValidLongitude(extent[0], isWGS84) ||
    !isValidLongitude(extent[2], isWGS84)
  ) {
    return false;
  }

  if (
    !isValidLatitude(extent[1], isWGS84) ||
    !isValidLatitude(extent[3], isWGS84)
  ) {
    return false;
  }

  if (extent[0] >= extent[2] || extent[1] <= extent[3]) {
    return false;
  }

  return true;
}

/**
 * Validate a bbox array [minLon, minLat, maxLon, maxLat].
 * @param {BBox} bbox BBox array
 * @param {boolean} isWGS84 If true, enforces WGS84 bounds
 * @returns {boolean} True if valid
 *
 * @example
 * ```ts
 * isValidBBox([0, 0, 1, 1], false); // true
 * ```
 */
export function isValidBBox(bbox?: BBox, isWGS84?: boolean): boolean {
  if (bbox?.length !== 4) {
    return false;
  }

  if (
    !isValidLongitude(bbox[0], isWGS84) ||
    !isValidLongitude(bbox[2], isWGS84)
  ) {
    return false;
  }

  if (
    !isValidLatitude(bbox[1], isWGS84) ||
    !isValidLatitude(bbox[3], isWGS84)
  ) {
    return false;
  }

  if (bbox[0] >= bbox[2] || bbox[1] >= bbox[3]) {
    return false;
  }

  return true;
}

/**
 * Check whether a BBox is exactly the zero box `[0, 0, 0, 0]`.
 * Note: This does not validate ordering or coordinate ranges.
 *
 * @param {BBox} value - BBox array.
 * @returns {boolean} True if the bbox is a 4-tuple and all values equal 0.
 *
 * @example
 * ```ts
 * isEmptyBBox([0, 0, 1, 1]); // false
 * ```
 */
export function isEmptyBBox(value?: BBox): boolean {
  if (value?.length !== 4) {
    return false;
  }

  return !value[0] && !value[1] && !value[2] && !value[3];
}

/**
 * Validate a map zoom level (0-25).
 * @param {any} zoom Zoom value
 * @returns {boolean} True if valid
 *
 * @example
 * ```ts
 * isValidZoom(undefined); // false
 * ```
 */
export function isValidZoom(zoom: any): boolean {
  return isValidNumber(zoom, false, 0, 25);
}

/**
 * Validate JSON data against a JSON schema (throws on error).
 * @param {object} schema JSON Schema object
 * @param {object} jsonData JSON data to validate
 * @returns {void}
 * @throws Error if schema validation fails
 *
 * @example
 * ```ts
 * validateJSON({}, {}); // validates successfully and does not throw.
 * ```
 */
export function validateJSON(schema: object, jsonData: object): void {
  try {
    const validate = new Ajv({
      allErrors: true,
    }).compile(schema);

    if (!validate(jsonData)) {
      throw validate.errors
        .map((error) => {
          return `\n\t${error.instancePath}: ${error.message}`;
        })
        .join();
    }
  } catch (error) {
    console.error("Error validating JSON data:", error);

    throw error;
  }
}

/**
 * Check if two BBoxes are the same within a tolerance.
 * @param {BBox} bbox1 First BBox array
 * @param {BBox} bbox2 Second BBox array
 * @param {number} tolerance Tolerance for comparison
 * @returns {boolean} True if the BBoxes are the same within the tolerance
 *
 * @example
 * ```ts
 * isSameBBox([0, 0, 1, 1], [0, 0, 1, 1], 0); // true
 * ```
 */
export function isSameBBox(
  bbox1: BBox,
  bbox2: BBox,
  tolerance?: number
): boolean {
  if (bbox1?.length !== 4 || bbox2?.length !== 4) {
    return false;
  }

  return !bbox1.some((value, index) => {
    return !isSameNumber(value, bbox2[index], tolerance);
  });
}
