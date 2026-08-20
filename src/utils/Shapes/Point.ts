/**
 * Utility functions for working with points in shapes.
 * @param {number[]} points Points array [x1, y1, x2, y2, ...]
 * @returns {number[]} New array with cloned points
 *
 * @example
 * ```ts
 * clonePoints(0); // New array with cloned points
 * ```
 */
export function clonePoints(points: number[]): number[] {
  return points.slice();
}

/**
 * Reverse point order for a flat points array.
 * @param {number[]} points Points [x1, y1, ...]
 * @returns {number[]} Reversed points
 *
 * @example
 * ```ts
 * reversePoints(0); // Reversed points
 * ```
 */
export function reversePoints(points: number[]): number[] {
  const len: number = points.length;
  const result: number[] = new Array<number>(len);

  let j: number = 0;

  for (let i = len - 2; i >= 0; i -= 2) {
    result[j++] = points[i];
    result[j++] = points[i + 1];
  }

  return result;
}

/**
 * Pick points by index (point index, not array index).
 * @param {number[]} points Points [x1, y1, ...]
 * @param {number[]} indices Point indices to pick
 * @returns {number[]} Picked points
 *
 * @example
 * ```ts
 * pickPoints(0, 0); // Picked points
 * ```
 */
export function pickPoints(points: number[], indices: number[]): number[] {
  const len: number = indices.length;
  const result: number[] = new Array<number>(len * 2);

  let j: number = 0;

  for (let k = 0; k < len; k++) {
    const i: number = indices[k] * 2;

    result[j++] = points[i];
    result[j++] = points[i + 1];
  }

  return result;
}

/**
 * Create interpolated points along a Bezier curve.
 * Only applies for 3+ points, otherwise returns original points.
 * @param {number[]} points Bezier control points [x0, y0, x1, y1, ...]
 * @param {number} pointsPerSegment Number of points per segment (default: 5 * points.length)
 * @returns {number[]} Sampled points
 *
 * @example
 * ```ts
 * createBezierCurvePoints(0, 0); // Sampled points
 * ```
 */
export function createBezierCurvePoints(
  points: number[],
  pointsPerSegment?: number
): number[] {
  const count: number = points.length / 2;

  // Only process if 3 or more points
  if (count < 3) {
    return points;
  }

  const stepsPerSegment: number = pointsPerSegment ?? 5 * points.length; // Bezier has only 1 segment
  const result: number[] = new Array<number>((stepsPerSegment + 1) * 2);
  const n: number = count - 1; // Degree of Bezier

  // Pre-allocate working array for De Casteljau
  const px: number[] = new Array<number>(count);
  const py: number[] = new Array<number>(count);

  for (let i = 0; i <= stepsPerSegment; i++) {
    const t: number = i / stepsPerSegment;
    const mt: number = 1 - t;

    // Copy control points
    for (let k = 0; k < count; k++) {
      px[k] = points[k * 2];
      py[k] = points[k * 2 + 1];
    }

    // De Casteljau algorithm
    for (let level = 1; level <= n; level++) {
      for (let k = 0; k <= n - level; k++) {
        px[k] = px[k] * mt + px[k + 1] * t;
        py[k] = py[k] * mt + py[k + 1] * t;
      }
    }

    result[i * 2] = px[0];
    result[i * 2 + 1] = py[0];
  }

  return result;
}

/**
 * Create interpolated points along a Catmull-Rom spline.
 * Only applies for 3+ points, otherwise returns original points.
 * @param {number[]} points Control points [x1, y1, ...]
 * @param {number} [pointsPerSegment] Number of points per segment (default: 10)
 * @returns {number[]} Sampled points
 *
 * @example
 * ```ts
 * createCatmullRomCurvePoints(0, 0); // Sampled points
 * ```
 * @param {number} pointsPerSegment Input value.
 */
export function createCatmullRomCurvePoints(
  points: number[],
  pointsPerSegment?: number
): number[] {
  const count: number = points.length / 2;

  // Only process if 3 or more points
  if (count < 3) {
    return points;
  }

  const stepsPerSegment: number = pointsPerSegment || 10;
  const numSegments = count - 1;

  // Total points = (stepsPerSegment * numSegments) + 1
  const totalPoints: number = stepsPerSegment * numSegments + 1;
  const result: number[] = new Array<number>(totalPoints * 2);

  let resultIdx: number = 0;

  for (let i = 0; i < numSegments; i++) {
    // Get 4 control points for segment i -> i+1
    const p0x: number = i === 0 ? points[0] : points[(i - 1) * 2];
    const p0y: number = i === 0 ? points[1] : points[(i - 1) * 2 + 1];

    const p1x: number = points[i * 2];
    const p1y: number = points[i * 2 + 1];

    const p2x: number = points[(i + 1) * 2];
    const p2y: number = points[(i + 1) * 2 + 1];

    const p3x: number = i + 2 < count ? points[(i + 2) * 2] : p2x;
    const p3y: number = i + 2 < count ? points[(i + 2) * 2 + 1] : p2y;

    // Precompute coefficients (Catmull-Rom matrix)
    const cx: number = 0.5 * (2 * p1x);
    const bx: number = 0.5 * (-p0x + p2x);
    const ax: number = 0.5 * (2 * p0x - 5 * p1x + 4 * p2x - p3x);
    const dx: number = 0.5 * (-p0x + 3 * p1x - 3 * p2x + p3x);

    const cy: number = 0.5 * (2 * p1y);
    const by: number = 0.5 * (-p0y + p2y);
    const ay: number = 0.5 * (2 * p0y - 5 * p1y + 4 * p2y - p3y);
    const dy: number = 0.5 * (-p0y + 3 * p1y - 3 * p2y + p3y);

    // Generate points for this segment
    const maxJ: number = i === count - 2 ? stepsPerSegment : stepsPerSegment;

    for (let j = 0; j <= maxJ; j++) {
      const t: number = j / stepsPerSegment;
      const t2: number = t * t;
      const t3: number = t2 * t;

      const x: number = cx + bx * t + ax * t2 + dx * t3;
      const y: number = cy + by * t + ay * t2 + dy * t3;

      result[resultIdx++] = x;
      result[resultIdx++] = y;
    }
  }

  return result;
}

/**
 * Create interpolated points along a Half circle.
 * Only applies for 2+ points, otherwise returns original points.
 * @param {number[]} points Points [x0, y0, x1, y1, ...]
 * @param {number} [pointsPerSegment] Number of points per segment (default: 20)
 * @param {boolean} [lower] Upper (true = lower, false = upper, undefined = zigzag)
 * @returns {number[]} Sampled points
 *
 * @example
 * ```ts
 * createHalfCirclePoints(0, 0, false); // Sampled points
 * ```
 * @param {number} pointsPerSegment Input value.
 * @param {boolean} lower Input value.
 */
export function createHalfCirclePoints(
  points: number[],
  pointsPerSegment?: number,
  lower?: boolean
): number[] {
  const count: number = points.length / 2;

  // Only process if 2 or more points
  if (count < 2) {
    return points;
  }

  const stepsPerSegment: number = pointsPerSegment ?? 20;
  const numSegments: number = count - 1;

  // Total points = (stepsPerSegment * numSegments) + 1
  const totalPoints: number = numSegments * stepsPerSegment + 1;
  const result: number[] = new Array<number>(totalPoints * 2);

  let resultIdx: number = 0;

  // First point
  result[resultIdx++] = points[0];
  result[resultIdx++] = points[1];

  for (let i = 0; i < numSegments; i++) {
    const i2: number = i * 2;

    // center
    const cx: number = (points[i2] + points[i2 + 2]) * 0.5;
    const cy: number = (points[i2 + 1] + points[i2 + 3]) * 0.5;

    // radius
    const dx: number = points[i2 + 2] - points[i2];
    const dy: number = points[i2 + 3] - points[i2 + 1];
    const r: number = Math.hypot(dx, dy) * 0.5;

    // direction
    const isLower: boolean = lower !== undefined ? lower : i % 2 === 1;
    const startAngle: number = Math.atan2(points[i2 + 1] - cy, points[i2] - cx);
    const step: number = (isLower ? -1 : 1) * (Math.PI / stepsPerSegment);
    const cosStep: number = Math.cos(step);
    const sinStep: number = Math.sin(step);

    let x: number = Math.cos(startAngle);
    let y: number = Math.sin(startAngle);

    for (let j = 1; j < stepsPerSegment; j++) {
      const nx: number = x * cosStep - y * sinStep;
      const ny: number = x * sinStep + y * cosStep;

      x = nx;
      y = ny;

      result[resultIdx++] = cx + x * r;
      result[resultIdx++] = cy + y * r;
    }

    // Last point segment
    result[resultIdx++] = points[i2 + 2];
    result[resultIdx++] = points[i2 + 3];
  }

  return result;
}

/**
 * Create interpolated points representing a half-ellipse (or half-circle) per segment.
 *
 * The input is a flattened `[x0,y0,x1,y1,...]` points array. For each segment:
 * - If only endpoints are provided, the segment is treated as a half-circle arc.
 * - If a mid control point exists, the segment is treated as a half-ellipse.
 *
 * @param {number[]} points - Flattened points array `[x0,y0,x1,y1,...]`.
 * @param {number} [pointsPerSegment] - Number of interpolation steps per segment (default: 20).
 * @param {boolean} [lower] - If true, generate the lower half; if false, generate the upper half.
 *   When omitted, alternates per segment (useful for multi-segment shapes).
 * @returns {number[]} Flattened interpolated points array.
 *
 * @example
 * ```ts
 * createHalfEllipsePoints(0, 0, false); // Flattened interpolated points array.
 * ```
 * @param {number} pointsPerSegment Input value.
 * @param {boolean} lower Input value.
 */
export function createHalfEllipsePoints(
  points: number[],
  pointsPerSegment?: number,
  lower?: boolean
): number[] {
  const count: number = points.length / 2;

  if (count < 2) {
    return points;
  }

  const stepsPerSegment: number = pointsPerSegment ?? 20;
  const result: number[] = [];

  let i2 = 0;
  let segmentIndex = 0;

  while (i2 < points.length - 2) {
    const x0 = points[i2];
    const y0 = points[i2 + 1];

    const hasMid = points.length - i2 >= 6;

    const x2 = hasMid ? points[i2 + 4] : points[i2 + 2];
    const y2 = hasMid ? points[i2 + 5] : points[i2 + 3];

    const cx = (x0 + x2) * 0.5;
    const cy = (y0 + y2) * 0.5;

    const isLower = lower !== undefined ? lower : segmentIndex % 2 === 1;

    if (!hasMid) {
      // Half circle (no mid control point)
      const r = Math.hypot(x0 - cx, y0 - cy);
      const startAngle = Math.atan2(y0 - cy, x0 - cx);
      const step = (isLower ? -1 : 1) * (Math.PI / stepsPerSegment);

      for (let j = 0; j <= stepsPerSegment; j++) {
        const angle = startAngle + step * j;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        result.push(x, y);
      }
    } else {
      // Half ellipse (uses mid control point)
      const x1 = points[i2 + 2];
      const y1 = points[i2 + 3];

      // Vector from center to P0
      const vx = x0 - cx;
      const vy = y0 - cy;

      // Vector from center to P1 (mid control point)
      const ux = x1 - cx;
      const uy = y1 - cy;

      // Semi-major axis length
      const a = Math.hypot(vx, vy);

      // Unit vector along major axis
      const majorAxisX = vx / a;
      const majorAxisY = vy / a;

      // Unit vector along minor axis (perpendicular to major axis)
      const minorAxisX = -majorAxisY;
      const minorAxisY = majorAxisX;

      // Angle of P0 in the ellipse coordinate system
      const angleP0 = Math.atan2(vy, vx);

      // Angle of P1 in the ellipse coordinate system
      const angleP1 = Math.atan2(uy, ux);

      // Parameter t of P1 (angular delta from P0 to P1 along the ellipse)
      let t = angleP1 - angleP0;

      // Normalize t to [0, PI] because we draw only half an ellipse
      if (t < 0) {
        t += Math.PI * 2;
      }
      if (t > Math.PI) {
        t = 2 * Math.PI - t;
      }

      // Projection of P1 onto the minor axis
      const projOnMinor = ux * minorAxisX + uy * minorAxisY;

      // Compute semi-minor axis b from ellipse param equation:
      // y = b * sin(t) => b = |y| / sin(t)
      const b = (projOnMinor > 0 ? projOnMinor : -projOnMinor) / Math.sin(t);

      const direction = isLower ? -1 : 1;
      const stepT = Math.PI / stepsPerSegment;

      for (let j = 0; j <= stepsPerSegment; j++) {
        const t_param = j * stepT;
        const cosT = Math.cos(t_param);
        const sinT = Math.sin(t_param);

        const px = a * cosT;
        const py = b * sinT * direction;

        const x = cx + px * majorAxisX + py * minorAxisX;
        const y = cy + px * majorAxisY + py * minorAxisY;

        result.push(x, y);
      }
    }

    i2 += hasMid ? 4 : 2;

    segmentIndex++;
  }

  return result;
}
