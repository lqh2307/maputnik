import { CoordinateFormat, DMSH, Hemisphere } from "../../types/Common";
import { CreateRangeNumber } from "./Types";

const INTEGER_REGEX: RegExp = /-?\d+/;
const FLOAT_REGEX: RegExp = /-?\d+(\.\d+)?/;
const DMS_NUMBER_REGEX: RegExp = /[-+]?\d+(?:\.\d+)?/g;
const DMS_HEMISPHERE_REGEX: RegExp = /[NSEW]/i;
const NUMBER_PATTERN: RegExp = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

export const DEFAULT_TOLERANCE: number = 1e-9;

/**
 * Converts a comma-separated string into an array of numbers.
 *
 * @param value Number list, separated by commas or whitespace.
 * @param def Value returned when no number can be parsed.
 * @param digit Maximum number of fractional digits retained per value.
 * @returns Parsed numbers.
 * @example
 * parseNumberList("3, 4, 5"); // [3, 4, 5]
 */
export function parseNumberList(
  value: unknown,
  def?: number[],
  digit: number = 3
): number[] {
  const matches: string[] = String(value ?? "").match(NUMBER_PATTERN);
  if (!matches?.length) {
    return def;
  }

  return matches.map((match: string) => {
    return parseNumber(match, undefined, digit);
  });
}

/**
 * Safely convert a value to a finite number.
 *
 * @param value Value to convert.
 * @param def Value returned when conversion is invalid (default: 0).
 * @param digit Number of fraction digits to keep without rounding (default: 3).
 * @returns A finite number or the default value.
 * @example
 * parseNumber("1.25"); // 1.25
 * parseNumber("width: 42px"); // 42
 * parseNumber("1,000"); // 1000
 * parseNumber("invalid", 10); // 10
 * parseNumber(Infinity, 10); // 10
 */
export function parseNumber(
  value: unknown,
  def?: number,
  digit: number = 3
): number {
  const matches: string[] = String(value ?? "").match(NUMBER_PATTERN);
  if (!matches?.length) {
    return def;
  }

  const factor: number = 10 ** digit;

  return Math.trunc(Number(matches.join("")) * factor) / factor;
}

/**
 * Clamp a number within min/max bounds.
 * @param {number} value Input value
 * @param {number} min Minimum bound
 * @param {number} max Maximum bound
 * @returns {number} Clamped value
 * @example
 * limitValue(12, 0, 10); // 10
 * limitValue(-2, 0, 10); // 0
 * limitValue(5, 0, 10); // 5
 * limitValue(12, undefined, 10); // 10
 * limitValue(-2, 0); // 0
 */
export function limitValue(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) {
    value = min;
  }

  if (max !== undefined && value > max) {
    value = max;
  }

  return value;
}

/**
 * Get the maximum value in an array.
 * @param {number[]} values Input values
 * @returns {number} Max value, or undefined if empty
 * @example
 * maxValue([1, 7, 3]); // 7
 * maxValue([-4, -2, -9]); // -2
 * maxValue([]); // undefined
 */
export function maxs(values: number[]): number {
  if (values?.length) {
    let value: number = values[0];

    for (let i = 1; i < values.length; i++) {
      if (value < values[i]) {
        value = values[i];
      }
    }

    return value;
  }
}

/**
 * Get the minimum value in an array.
 * @param {number[]} values Input values
 * @returns {number} Min value, or undefined if empty
 * @example
 * minValue([1, 7, 3]); // 1
 * minValue([-4, -2, -9]); // -9
 * minValue([]); // undefined
 */
export function mins(values: number[]): number {
  if (values?.length) {
    let value: number = values[0];

    for (let i = 1; i < values.length; i++) {
      if (value > values[i]) {
        value = values[i];
      }
    }

    return value;
  }
}

/**
 * Extract a number from a string.
 * @param {string} strNumber Input string
 * @param {boolean} isFloat If true, matches floats; otherwise integers
 * @param {number} defaultNumber Default if no match (default: 0)
 * @returns {number} Parsed value or default
 * @example
 * fixNumber("width: 42px"); // 42
 * fixNumber("left: -42px"); // -42
 * fixNumber("scale: 1.25", true); // 1.25
 * fixNumber("scale: -1.25", true); // -1.25
 * fixNumber("none", true, 10); // 10
 */
export function fixNumber(
  strNumber: string,
  isFloat?: boolean,
  defaultNumber?: number
): number {
  const match: RegExpMatchArray = strNumber?.match(
    isFloat ? FLOAT_REGEX : INTEGER_REGEX
  );

  return match ? Number(match[0]) : (defaultNumber ?? 0);
}

/**
 * Normalize angle to the -180..180 range.
 * @param {number} deg Angle in degrees
 * @returns {number} Normalized angle
 * @example
 * normalize180(180); // 180
 * normalize180(270); // -90
 * normalize180(-270); // 90
 * normalize180(540); // 180
 */
export function normalize180(deg: number): number {
  let d: number = deg % 360;
  if (d > 180) {
    d -= 360;
  } else if (d < -180) {
    d += 360;
  }

  return d;
}

/**
 * Normalize angle to the -360..360 range.
 * @param {number} deg Angle in degrees
 * @returns {number} Normalized angle
 * @example
 * normalize360(360); // 0
 * normalize360(270); // 270
 * normalize360(-90); // 270
 * normalize360(-450); // 270
 */
export function normalize360(deg: number): number {
  let d: number = deg % 360;
  if (d < 0) {
    d += 360;
  }

  return d;
}

/**
 * Convert an angle from degrees to radians.
 * @param {number} angle Angle in degrees
 * @returns {number} Angle in radians
 * @example
 * degToRad(0); // 0
 * degToRad(180); // Math.PI
 * degToRad(90); // Math.PI / 2
 */
export function degToRad(angle: number): number {
  return (angle / 180) * Math.PI;
}

/**
 * Convert an angle from radians to degrees.
 * @param {number} angle Angle in radians
 * @returns {number} Angle in degrees
 * @example
 * radToDeg(0); // 0
 * radToDeg(Math.PI); // 180
 * radToDeg(Math.PI / 2); // 90
 */
export function radToDeg(angle: number): number {
  return (180 * angle) / Math.PI;
}

/**
 * Convert decimal degrees to a DMSH object.
 * @param {number} deg Decimal degrees
 * @param {boolean} isLon If provided, adds E/W for longitude or N/S for latitude
 * @returns {DMSH} DMS object (normalized to -180..180)
 * @example
 * convertDEGToDMSH(105.5); // { degree: 105, minute: 30, second: 0 }
 * convertDEGToDMSH(105.9999); // { degree: 106, minute: 0, second: 0 }
 * convertDEGToDMSH(-181); // { degree: 179, minute: 0, second: 0 }
 */
export function convertDEGToDMSH(deg: number, isLon?: boolean): DMSH {
  const normalized: number = normalize180(deg % 360);

  const absolute: number = normalized > 0 ? normalized : -normalized;
  let degree: number = Math.floor(absolute);
  const minuteNotTruncated: number = (absolute - degree) * 60;
  let minute: number = Math.floor(minuteNotTruncated);
  let second: number = Math.round((minuteNotTruncated - minute) * 60);

  if (second === 60) {
    minute += 1;

    second = 0;
  }

  if (minute === 60) {
    degree += 1;

    minute = 0;
  }

  return {
    degree: isLon !== undefined ? degree : normalized >= 0 ? degree : -degree,
    minute: minute,
    second: second,
    hemisphere:
      isLon !== undefined
        ? isLon
          ? normalized >= 0
            ? "E"
            : "W"
          : normalized >= 0
            ? "N"
            : "S"
        : undefined,
  };
}

/**
 * Convert decimal degrees to a formatted coordinate string.
 * @param {number} value The coordinate value (latitude or longitude)
 * @param {boolean} isLatitude Indicates whether the value is a latitude (true) or longitude (false)
 * @param {CoordinateFormat} format The desired format for the coordinate label (e.g., "DD", "DDM", "DMS", "DMSH")
 * @returns {string} Formatted coordinate string
 * @example
 * convertDEGToDMSHString(106, false, "DD"); // "106°"
 * convertDEGToDMSHString(-106.25, false, "DDM"); // "-106°15'"
 * convertDEGToDMSHString(-106.25, false, "DMS"); // "-106°15'"
 * convertDEGToDMSHString(106.25, false, "DMSH"); // "106°15'E"
 */
export function convertDEGToDMSHString(
  value: number,
  isLatitude: boolean,
  format: CoordinateFormat
): string {
  if (format === "DD") {
    return `${String(parseNumber(value))}°`;
  }

  const absolute: number = Math.abs(value);
  let degree: number = Math.floor(absolute);

  if (format === "DDM") {
    let decimalMinute: number =
      Math.round((absolute - degree) * 60 * 1000) / 1000;

    if (decimalMinute === 60) {
      decimalMinute = 0;
      degree += 1;
    }

    return `${value < 0 ? "-" : ""}${degree}°${String(parseNumber(decimalMinute))}'`;
  }

  const dms: DMSH = convertDEGToDMSH(
    value,
    format === "DMSH" ? !isLatitude : undefined
  );

  return `${format !== "DMSH" && dms.degree < 0 ? "-" : ""}${Math.abs(dms.degree)}°${dms.minute ? `${dms.minute}'` : ""}${dms.second ? `${dms.second}\"` : ""}${dms.hemisphere ?? ""}`;
}

/**
 * Convert a DMSH string to decimal degrees.
 * Supports signed values and N/S/E/W hemisphere markers at either end.
 * @param {string} dmshString DMSH string
 * @returns {number} Decimal degrees (normalized to -180..180)
 * @example
 * convertDMSHStringToDEG("105° 30' 0\"E"); // 105.5
 * convertDMSHStringToDEG("10° 30' S"); // -10.5
 * convertDMSHStringToDEG("-105°30'"); // -105.5
 */
export function convertDMSHStringToDEG(dmshString: string): number {
  const values: number[] =
    dmshString?.match(DMS_NUMBER_REGEX)?.map((value: string) => {
      return Number(value);
    }) ?? [];
  if (!values.length) {
    return 0;
  }

  const [degree, minute = 0, second = 0]: number[] = values;

  return convertDMSHToDEG({
    degree: degree,
    minute: minute,
    second: second,
    hemisphere: dmshString
      .match(DMS_HEMISPHERE_REGEX)?.[0]
      ?.toUpperCase() as Hemisphere,
  });
}

/**
 * Convert a DMSH object to decimal degrees.
 * @param {DMSH} dms DMS object
 * @returns {number} Decimal degrees (normalized to -180..180)
 * @example
 * convertDMSHToDEG({ degree: 105, minute: 30, second: 0 }); // 105.5
 * convertDMSHToDEG({ degree: -105, minute: 30, second: 0 }); // -105.5
 * convertDMSHToDEG({ degree: 181, minute: 0, second: 0 }); // -179
 */
export function convertDMSHToDEG(dms: DMSH): number {
  const absDeg: number = dms.degree > 0 ? dms.degree : -dms.degree;
  const decimal: number = absDeg + dms.minute / 60 + dms.second / 3600;
  const signed: number = dms.hemisphere
    ? dms.hemisphere === "W" || dms.hemisphere === "S"
      ? -decimal
      : decimal
    : dms.degree >= 0
      ? decimal
      : -decimal;

  return normalize180(signed % 360);
}

/**
 * Create an array of numbers within a range.
 * @param {CreateRangeNumber} option Range generation options
 * @returns {number[]} Array of numbers
 * @example
 * createRangeNumber({ start: 0, end: 10, pointsPerSegment: 1 }); // [0, 5, 10]
 * createRangeNumber({ start: 0, end: 10 }); // [0, 10]
 * createRangeNumber({ start: 1, end: 10, step: 3, origin: 0 }); // [1, 3, 6, 9, 10]
 * createRangeNumber({ start: 0, end: 10, excludeStart: true }); // [10]
 * createRangeNumber({ start: 0, end: 10, excludeEnd: true }); // [0]
 * createRangeNumber({ start: 5, end: 5 }); // [5]
 * createRangeNumber({ start: 5, end: 5, excludeStart: true }); // []
 * createRangeNumber({ start: 10, end: 0 }); // []
 * createRangeNumber({ start: 0, end: 10, step: 0 }); // []
 */
export function createRangeNumber(option: CreateRangeNumber): number[] {
  const {
    start,
    end,
    pointsPerSegment = 0,
    step,
    origin = 0,
    excludeStart,
    excludeEnd,
  }: CreateRangeNumber = option;

  // A range only progresses from a smaller value to a larger value.
  if (end < start) {
    return [];
  }

  // A zero-length range contains one shared endpoint. Excluding either end
  // removes that single value because it represents both start and end.
  if (start === end) {
    return excludeStart || excludeEnd ? [] : [start];
  }

  // When `step` is provided, generate values aligned to `origin` instead of
  // splitting the range into a fixed number of equal segments.
  if (step !== undefined) {
    // A non-positive interval cannot advance toward `end`.
    if (step <= 0) {
      return [];
    }

    // Endpoints are included by default even when they are not aligned to the
    // step sequence. Interior aligned values are inserted between them below.
    const values: number[] = excludeStart ? [] : [start];

    // The tolerance keeps a mathematically valid final step from being lost to
    // floating-point drift. Strict interior checks prevent duplicate endpoints.
    for (
      let value = Math.ceil((start - origin) / step) * step;
      value <= end - origin + step * DEFAULT_TOLERANCE;
      value += step
    ) {
      const roundedValue: number = roundDecimal(
        origin + roundToMultiple(value, step),
        12
      );

      if (roundedValue > start && roundedValue < end) {
        values.push(roundedValue);
      }
    }

    // Append the exact supplied endpoint rather than its calculated equivalent.
    if (!excludeEnd) {
      values.push(end);
    }

    return values;
  }

  // Without `step`, divide the range evenly. N interior points create N + 1
  // segments and therefore N + 2 values when both endpoints are included.
  const segmentCount: number = pointsPerSegment + 1;
  const segmentStep: number = (end - start) / segmentCount;

  const points: number[] = [];

  // Handle the exact start boundary first so the loop below only generates
  // interior points.
  if (!excludeStart) {
    points.push(start);
  }

  // Generate only the interior segment boundaries. This avoids endpoint checks
  // on every iteration while keeping the evenly spaced middle points unchanged.
  for (let i = 1; i < segmentCount; i++) {
    points.push(start + i * segmentStep);
  }

  // Append the exact end boundary separately for the same reason as `start`.
  if (!excludeEnd) {
    points.push(end);
  }

  return points;
}

/**
 * Return the maximum of two numbers, treating undefined as less than any number.
 * @param {number} a First number
 * @param {number} b Second number
 * @returns {number} Maximum of a and b, or the defined number if one is undefined
 * @example
 * max(3, 7); // 7
 * max(undefined, 7); // 7
 */
export function max(a: number, b: number): number {
  if (a === undefined) {
    return b;
  }

  if (b === undefined) {
    return a;
  }

  return a > b ? a : b;
}

/**
 * Return the minimum of two numbers, treating undefined as greater than any number.
 * @param {number} a First number
 * @param {number} b Second number
 * @returns {number} Minimum of a and b, or the defined number if one is undefined
 * @example
 * min(3, 7); // 3
 * min(undefined, 7); // 7
 */
export function min(a: number, b: number): number {
  if (a === undefined) {
    return b;
  }

  if (b === undefined) {
    return a;
  }

  return a < b ? a : b;
}

/**
 * Round a decimal number to the specified number of fraction digits.
 * Integers are returned unchanged.
 * @param {number} value Input value
 * @param {number} digits Number of fraction digits to keep
 * @returns {number} Rounded number
 * @example
 * roundDecimal(4.135, 2); // 4.14
 * roundDecimal(4, 2); // 4
 */
export function roundDecimal(value: number, digits: number): number {
  if (Number.isInteger(value)) {
    return value;
  }

  const factor: number = 10 ** max(0, Math.floor(digits ?? 0));

  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Round a number to the nearest multiple of the provided divisor.
 * @param {number} value Input value
 * @param {number} divisor Multiple step to round to
 * @returns {number} Nearest multiple of divisor
 * @example
 * roundToMultiple(4.13, 0.25); // 4.25
 * roundToMultiple(4.1, 0.25); // 4
 */
export function roundToMultiple(value: number, divisor: number): number {
  if (!divisor) {
    return value;
  }

  const absDivisor: number = Math.abs(divisor);
  const rounded: number = Math.round(value / absDivisor) * absDivisor;
  const divisorDecimalLength: number =
    absDivisor.toString().split(".")[1]?.length ?? 0;

  return roundDecimal(rounded, divisorDecimalLength);
}

/**
 * Compare two numbers for near-equality within a specified tolerance.
 * @param {number} a First number
 * @param {number} b Second number
 * @param {number} tolerance Tolerance for comparison
 * @returns {boolean} True if the numbers are equal within the tolerance, false otherwise
 * @example
 * isSameNumber(0.1 + 0.2, 0.3); // true
 * isSameNumber(1, 1.1, 0.01); // false
 */
export function isSameNumber(
  a: number,
  b: number,
  tolerance?: number
): boolean {
  if (a === undefined || b === undefined) {
    return a === b;
  }

  return Math.abs(a - b) < (tolerance ?? DEFAULT_TOLERANCE);
}
