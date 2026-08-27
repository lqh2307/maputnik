import { degToRad, max, min, radToDeg } from "../Number";
import { BBox, Point, Unit } from "../../types/Common";

/**
 * Calculate Euclidean distance between two points.
 * @param {Point} a First point [x, y]
 * @param {Point} b Second point [x, y]
 * @returns {number} Euclidean distance
 *
 * @example
 * ```ts
 * getDistance([0, 0], [3, 4]); // 5
 * ```
 */
export function getDistance(a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];

  return Math.hypot(dx, dy);
}

/**
 * Calculate the total perimeter (or length) of a ring/linestring.
 * @param ring Ordered [x, y] vertices.
 * @param isClosed When true, include the closing segment back to the first point.
 * @returns Total perimeter/length in the coordinate units.
 *
 * @example
 * ```ts
 * getPerimeter([[0, 0], [0, 10], [10, 10], [10, 0]], true); // 40
 * ```
 */
export function getPerimeter(ring: Point[], isClosed: boolean = false): number {
  if (!Array.isArray(ring) || ring.length < 2) {
    return 0;
  }

  const points: Point[] = isClosed ? makeValidCloseRing(ring) : ring;
  let totalDistance: number = 0;

  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += getDistance(points[i], points[i + 1]);
  }

  return totalDistance;
}

/**
 * Get the bounding box [minX, minY, maxX, maxY] for a set of points or polygon rings.
 * @param {Point[]} points Array of points
 * @returns {BBox} Bounding box [minX, minY, maxX, maxY]
 *
 * @example
 * ```ts
 * getBoundingBox([[0, 0], [10, 5], [2, 8]]); // [0, 0, 10, 8]
 * ```
 */
export function getBoundingBox(points: Point[]): BBox {
  if (!points.length) {
    return;
  }

  let minX: number = points[0][0];
  let minY: number = points[0][1];
  let maxX: number = points[0][0];
  let maxY: number = points[0][1];

  for (let i = 1; i < points.length; i++) {
    const [x, y]: Point = points[i];

    if (x < minX) {
      minX = x;
    }

    if (x > maxX) {
      maxX = x;
    }

    if (y < minY) {
      minY = y;
    }

    if (y > maxY) {
      maxY = y;
    }
  }

  return [minX, minY, maxX, maxY];
}

/**
 * Check if a point lies inside a polygon using the Ray-Casting algorithm.
 * Handles outer ring containment and checks holes (inner rings) if present.
 * @param {Point} point The point [x, y] to test
 * @param {Point[][]} coords Array of rings (first is outer, subsequent are holes)
 * @returns {boolean} True if point is inside polygon
 *
 * @example
 * ```ts
 * isPointInPolygon([5, 5], [[[0, 0], [0, 10], [10, 10], [10, 0]]]); // true
 * ```
 */
export function isPointInPolygon(point: Point, coords: Point[][]): boolean {
  if (!coords || !coords.length || !coords[0].length) {
    return false;
  }

  const isPointInRing = (pt: Point, ring: Point[]): boolean => {
    const [px, py]: Point = pt;

    let inside: boolean = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi]: Point = ring[i];
      const [xj, yj]: Point = ring[j];

      if (
        yi > py !== yj > py &&
        px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }

    return inside;
  };

  const inOuter: boolean = isPointInRing(point, coords[0]);
  if (!inOuter) {
    return false;
  }

  for (let i = 1; i < coords.length; i++) {
    if (isPointInRing(point, coords[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Simplify a polyline/ring using the Ramer-Douglas-Peucker (RDP) algorithm.
 * @param {Point[]} points Array of points [x, y]
 * @param {number} tolerance Maximum allowable perpendicular distance
 * @returns {Point[]} Simplified array of points
 *
 * @example
 * ```ts
 * simplifyPoints([[0,0], [1,0.1], [2,-0.1], [3,0]], 0.5); // [[0, 0], [3, 0]]
 * ```
 */
export function simplifyPoints(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2 || tolerance <= 0) {
    return points;
  }

  const sqTolerance: number = tolerance * tolerance;

  function getSqSegDist(p: Point, p1: Point, p2: Point): number {
    let x: number = p1[0];
    let y: number = p1[1];
    let dx: number = p2[0] - x;
    let dy: number = p2[1] - y;

    if (dx !== 0 || dy !== 0) {
      const t: number =
        ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2[0];
        y = p2[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p[0] - x;
    dy = p[1] - y;

    return dx * dx + dy * dy;
  }

  function simplifyDPStep(
    pts: Point[],
    first: number,
    last: number,
    sqTol: number,
    simplified: Point[]
  ) {
    let maxSqDist: number = sqTol;
    let index: number = -1;

    for (let i = first + 1; i < last; i++) {
      const sqDist: number = getSqSegDist(pts[i], pts[first], pts[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTol && index !== -1) {
      if (index - first > 1) {
        simplifyDPStep(pts, first, index, sqTol, simplified);
      }

      simplified.push(pts[index]);

      if (last - index > 1) {
        simplifyDPStep(pts, index, last, sqTol, simplified);
      }
    }
  }

  const result: Point[] = [points[0]];

  simplifyDPStep(points, 0, points.length - 1, sqTolerance, result);

  result.push(points[points.length - 1]);

  return result;
}

/**
 * Check if the ring points are arranged in Clockwise (CW) order.
 * @param {Point[]} ring Array of points [x, y]
 * @returns {boolean} True if clockwise, false if counter-clockwise (CCW)
 *
 * @example
 * ```ts
 * isClockwise([[0, 0], [0, 1], [1, 1], [1, 0]]); // true
 * ```
 */
export function isClockwise(ring: Point[]): boolean {
  let sum: number = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    sum += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
  }

  return sum > 0;
}

/**
 * Ensure a ring of points is closed by checking if the first and last points are the same.
 * If they are not the same, append the first point to the end of the array to close the ring.
 * @param {Point[]} ring Array of points [x, y]
 * @returns {Point[]} The original ring if it's already closed, or a new array with the first point appended if it was not closed
 *
 * @example
 * ```ts
 * makeValidCloseRing([]); // The original ring if it's already closed, or a new array with the first point appended if it was not closed
 * ```
 */
export function makeValidCloseRing(ring?: Point[]): Point[] {
  if (!Array.isArray(ring) || ring.length < 2) {
    return ring ?? [];
  }

  const first: Point = ring[0];
  const last: Point = ring[ring.length - 1];

  if (first[0] === last[0] && first[1] === last[1]) {
    return ring;
  }

  const newRing: Point[] = ring.slice();
  newRing.push(first);

  return newRing;
}

/**
 * Calculate the area of a polygon defined by an array of rings (arrays of points).
 * Uses the shoelace formula to calculate the area of the outer ring (first array of points) and ignores holes.
 * @param {Point[][]} coords Array of rings, where each ring is an array of points [x, y]
 * @returns {number} The area of the polygon
 *
 * @example
 * ```ts
 * getPolygonArea([]); // The area of the polygon
 * ```
 */
export function getPolygonArea(coords: Point[][]): number {
  const ring: Point[] = makeValidCloseRing(coords?.[0]);

  if (ring.length < 4) {
    return 0;
  }

  let area: number = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }

  return Math.abs(area) * 0.5;
}

/**
 * Calculate the centroid of a polygon defined by an array of rings (arrays of points).
 * Uses the formula for polygon centroids, which accounts for the shape of the polygon.
 * Only considers the outer ring (first array of points) and ignores holes.
 * @param {Point[][]} coords Array of rings, where each ring is an array of points [x, y]
 * @returns {Point} The centroid [x, y] of the polygon
 *
 * @example
 * ```ts
 * getPolygonCentroid([]); // The centroid [x, y] of the polygon
 * ```
 */
export function getPolygonCentroid(coords: Point[][]): Point {
  const ring: Point[] = makeValidCloseRing(coords?.[0]);
  if (!ring.length) {
    return;
  }

  let area: number = 0;
  let x: number = 0;
  let y: number = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const f: number = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];

    x += (ring[i][0] + ring[i + 1][0]) * f;
    y += (ring[i][1] + ring[i + 1][1]) * f;

    area += f;
  }

  area *= 0.5;

  if (!area) {
    return ring[0];
  }

  return [x / (6 * area), y / (6 * area)];
}

const geometryBBoxes = new WeakMap();

type GeometryLike = {
  type: string;
  coordinates?: unknown;
  geometries?: GeometryLike[];
};

/**
 * Calculate a geometry bounding box without allocating an intermediate list
 * of every coordinate. The WeakMap also avoids repeating this work while a
 * feature is evaluated by multiple filters or output builders.
 * @param {GeoJSON.Geometry} geometry GeoJSON geometry
 * @returns {BBox} [minX, minY, maxX, maxY]
 */
export function getGeometryBBox(geometry: GeometryLike): BBox {
  if (!geometry || typeof geometry !== "object") {
    return;
  }

  const cached: BBox = geometryBBoxes.get(geometry);
  if (cached) {
    return cached;
  }

  let minX: number = Infinity;
  let minY: number = Infinity;
  let maxX: number = -Infinity;
  let maxY: number = -Infinity;

  const visit = (value: any) => {
    if (!Array.isArray(value)) {
      return;
    }

    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      minX = min(minX, value[0]);
      minY = min(minY, value[1]);
      maxX = max(maxX, value[0]);
      maxY = max(maxY, value[1]);

      return;
    }

    for (const child of value) {
      visit(child);
    }
  };

  if (geometry.type === "GeometryCollection") {
    for (const child of geometry.geometries ?? []) {
      const bbox: BBox = getGeometryBBox(child);
      if (bbox) {
        minX = min(minX, bbox[0]);
        minY = min(minY, bbox[1]);
        maxX = max(maxX, bbox[2]);
        maxY = max(maxY, bbox[3]);
      }
    }
  } else {
    visit(geometry.coordinates);
  }

  if (minX === Infinity) {
    return;
  }

  const bbox: BBox = [minX, minY, maxX, maxY];

  geometryBBoxes.set(geometry, bbox);

  return bbox;
}

const EARTH_RADIUS = 6371008.8; // Bán kính Trái Đất trung bình (mét)

/**
 * Calculate Great-Circle distance between two coordinates [lng, lat] using Haversine formula.
 * Equivalent to: @turf/distance
 * @param from Start coordinate as [longitude, latitude] in decimal degrees.
 * @param to End coordinate as [longitude, latitude] in decimal degrees.
 * @param units Output unit; "m" returns meters and "km" returns kilometers.
 * @returns Great-circle distance between the coordinates.
 */
export function getHaversineDistance(
  from: Point,
  to: Point,
  units: Unit = "m"
): number {
  const dLat: number = degToRad(to[1] - from[1]);
  const dLng: number = degToRad(to[0] - from[0]);
  const lat1: number = degToRad(from[1]);
  const lat2: number = degToRad(to[1]);

  const a: number =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceInMeters: number = EARTH_RADIUS * c;

  return units === "km" ? distanceInMeters / 1000 : distanceInMeters;
}

/**
 * Calculate the initial bearing (compass heading) from point A to point B in degrees (-180 to 180).
 * Equivalent to: @turf/bearing
 * @param {Point} from [lng, lat]
 * @param {Point} to [lng, lat]
 * @returns {number} Bearing in degrees from North
 */
export function getBearing(from: Point, to: Point): number {
  const lon1: number = degToRad(from[0]);
  const lon2: number = degToRad(to[0]);
  const lat1: number = degToRad(from[1]);
  const lat2: number = degToRad(to[1]);

  const a: number = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const b: number =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  return radToDeg(Math.atan2(a, b));
}

/**
 * Calculate the destination coordinate given a starting point, distance, and bearing.
 * Equivalent to: @turf/destination
 * @param {Point} origin [lng, lat]
 * @param {number} distance Distance to travel in meters
 * @param {number} bearing Bearing in degrees (-180 to 180 or 0 to 360)
 * @returns {Point} Destination [lng, lat]
 */
export function getDestination(
  origin: Point,
  distance: number,
  bearing: number
): Point {
  const lon1: number = degToRad(origin[0]);
  const lat1: number = degToRad(origin[1]);
  const bearingRad: number = degToRad(bearing);
  const radians: number = distance / EARTH_RADIUS;

  const lat2: number = Math.asin(
    Math.sin(lat1) * Math.cos(radians) +
      Math.cos(lat1) * Math.sin(radians) * Math.cos(bearingRad)
  );

  const lon2: number =
    lon1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(radians) * Math.cos(lat1),
      Math.cos(radians) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [radToDeg(lon2), radToDeg(lat2)];
}

/**
 * Calculate midpoint between two points on a plane or simple sphere.
 * Equivalent to: @turf/midpoint
 * @param {Point} a First point [x, y]
 * @param {Point} b Second point [x, y]
 * @returns {Point} Midpoint [x, y]
 */
export function getMidpoint(a: Point, b: Point): Point {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/**
 * Check if two line segments [p1, p2] and [p3, p4] intersect, and return the intersection point if any.
 * Equivalent to: @turf/line-intersect (single pair segment)
 * @param {Point} p1 Start of segment 1
 * @param {Point} p2 End of segment 1
 * @param {Point} p3 Start of segment 2
 * @param {Point} p4 End of segment 2
 * @returns {Point} Intersection point [x, y] or null if parallel / non-intersecting
 */
export function getLineIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point {
  const denom: number =
    (p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]);
  if (denom === 0) {
    return;
  } // Đoạn thẳng song song hoặc trùng

  const ua: number =
    ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) /
    denom;
  const ub: number =
    ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) /
    denom;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return [p1[0] + ua * (p2[0] - p1[0]), p1[1] + ua * (p2[1] - p1[1])];
  }

  return;
}

/**
 * Find the closest point on a line segment to a given point.
 * Equivalent to: @turf/point-to-line-distance core projection
 * @param {Point} pt The reference point [x, y]
 * @param {Point} start Segment start [x, y]
 * @param {Point} end Segment end [x, y]
 * @returns {Point} Closest projected point on the segment
 */
export function getNearestPointOnSegment(
  pt: Point,
  start: Point,
  end: Point
): Point {
  const dx: number = end[0] - start[0];
  const dy: number = end[1] - start[1];

  if (dx === 0 && dy === 0) {
    return start;
  }

  const clampedT: number = max(
    0,
    min(
      1,
      ((pt[0] - start[0]) * dx + (pt[1] - start[1]) * dy) / (dx * dx + dy * dy)
    )
  );

  return [start[0] + clampedT * dx, start[1] + clampedT * dy];
}

/**
 * Compute the Convex Hull of a 2D point cloud using Andrew's Monotone Chain algorithm (O(n log n)).
 * Equivalent to: @turf/convex
 * @param {Point[]} points Array of points [x, y]
 * @returns {Point[]} Outer hull ring in CCW order
 */
export function getConvexHull(points: Point[]): Point[] {
  if (points.length <= 2) {
    return points.slice();
  }

  // Sắp xếp toạ độ tăng dần theo x (nếu bằng thì theo y)
  const sorted: Point[] = points.slice().sort((a, b) => {
    return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0];
  });

  const cross = (o: Point, a: Point, b: Point): number => {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  };

  // Build lower hull
  const lower: Point[] = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  // Build upper hull
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Generate a circle polygon (approximate ring of N points) around a center point.
 * Equivalent to: @turf/circle
 * @param center Center coordinate as [longitude, latitude].
 * @param radius Radius in meters.
 * @param steps Number of vertices used for the approximation (minimum 3).
 * @returns Closed [longitude, latitude] ring, including a repeated first point.
 */
export function getCirclePolygon(
  center: Point,
  radius: number,
  steps: number = 64
): Point[] {
  const coordinates: Point[] = [];
  const count: number = max(3, Math.floor(steps));
  for (let i = 0; i < count; i++) {
    const bearing = (i * 360) / count;
    coordinates.push(getDestination(center, radius, bearing));
  }
  coordinates.push(coordinates[0]); // Đóng vòng
  return coordinates;
}

export type GeometryType = "Point" | "LineString" | "Polygon";

export interface CustomGeometry {
  type: GeometryType;
  coordinates: Point | Point[] | Point[][];
}

/**
 * Check whether a point lies on a line segment within a numeric tolerance.
 * @param pt Point being tested.
 * @param start Segment start point.
 * @param end Segment end point.
 * @param epsilon Maximum cross-product/distance error accepted.
 * @returns true when pt lies between start and end.
 */
export function isPointOnSegment(
  pt: Point,
  start: Point,
  end: Point,
  epsilon: number = 1e-9
): boolean {
  const [px, py] = pt;
  const [x1, y1] = start;
  const [x2, y2] = end;

  // Cross product = 0 nghĩa là 3 điểm thẳng hàng
  const cross = (py - y1) * (x2 - x1) - (px - x1) * (y2 - y1);
  if (Math.abs(cross) > epsilon) {
    return false;
  }

  // Dot product kiểm tra xem điểm có nằm trong khoảng giữa start và end không
  const dot = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
  if (dot < 0) {
    return false;
  }

  const lenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (dot > lenSq + epsilon) {
    return false;
  }

  return true;
}

/**
 * Tìm tất cả các giao điểm giữa 2 đường Polyline/LineString (Point[])
 * Tương đương: @turf/line-intersect
 * @param {Point[]} line1 Danh sách điểm đường thứ nhất
 * @param {Point[]} line2 Danh sách điểm đường thứ hai
 * @returns {Point[]} Danh sách các điểm giao nhau (loại bỏ trùng lặp)
 */
export function intersectLineWithLine(line1: Point[], line2: Point[]): Point[] {
  const intersections: Point[] = [];

  for (let i = 0; i < line1.length - 1; i++) {
    for (let j = 0; j < line2.length - 1; j++) {
      const pt = getLineIntersection(
        line1[i],
        line1[i + 1],
        line2[j],
        line2[j + 1]
      );
      if (pt) {
        // Tránh lưu toạ độ bị duplicate
        const exists = intersections.some((p) => {
          return Math.hypot(p[0] - pt[0], p[1] - pt[1]) < 1e-7;
        });
        if (!exists) {
          intersections.push(pt);
        }
      }
    }
  }

  return intersections;
}

/**
 * Tìm tất cả các điểm giao cắt giữa một đường Polyline và viền của một Polygon.
 * @param {Point[]} line Toạ độ Polyline
 * @param {Point[][]} polygon Mảng các ring [outerRing, ...holes]
 * @returns {Point[]} Danh sách toạ độ các điểm cắt qua biên
 */
export function intersectLineWithPolygon(
  line: Point[],
  polygon: Point[][]
): Point[] {
  const intersections: Point[] = [];

  for (const ring of polygon) {
    const closedRing = makeValidCloseRing(ring);
    const pts = intersectLineWithLine(line, closedRing);
    for (const pt of pts) {
      const exists = intersections.some((p) => {
        return Math.hypot(p[0] - pt[0], p[1] - pt[1]) < 1e-7;
      });
      if (!exists) {
        intersections.push(pt);
      }
    }
  }

  return intersections;
}

/**
 * Tìm tất cả các điểm giao cắt giữa các cạnh viền của 2 Polygon.
 * @param {Point[][]} poly1 Polygon 1
 * @param {Point[][]} poly2 Polygon 2
 * @returns {Point[]} Danh sách toạ độ điểm giao nhau
 */
export function intersectPolygonWithPolygon(
  poly1: Point[][],
  poly2: Point[][]
): Point[] {
  const intersections: Point[] = [];

  for (const r1 of poly1) {
    const closed1 = makeValidCloseRing(r1);
    for (const r2 of poly2) {
      const closed2 = makeValidCloseRing(r2);
      const pts = intersectLineWithLine(closed1, closed2);
      for (const pt of pts) {
        const exists = intersections.some((p) => {
          return Math.hypot(p[0] - pt[0], p[1] - pt[1]) < 1e-7;
        });
        if (!exists) {
          intersections.push(pt);
        }
      }
    }
  }

  return intersections;
}

/**
 * Check whether two supported geometries intersect or touch.
 * Supports Point, LineString, and Polygon geometries.
 * @param geom1 First geometry.
 * @param geom2 Second geometry.
 * @returns true when the geometries share at least one point.
 */
export function booleanIntersects(
  geom1: CustomGeometry,
  geom2: CustomGeometry
): boolean {
  // 1. Point vs Point
  if (geom1.type === "Point" && geom2.type === "Point") {
    const p1 = geom1.coordinates as Point;
    const p2 = geom2.coordinates as Point;
    return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]) < 1e-9;
  }

  // 2. Point vs LineString
  if (geom1.type === "Point" && geom2.type === "LineString") {
    const pt = geom1.coordinates as Point;
    const line = geom2.coordinates as Point[];
    for (let i = 0; i < line.length - 1; i++) {
      if (isPointOnSegment(pt, line[i], line[i + 1])) {
        return true;
      }
    }
    return false;
  }
  if (geom1.type === "LineString" && geom2.type === "Point") {
    return booleanIntersects(geom2, geom1);
  }

  // 3. Point vs Polygon
  if (geom1.type === "Point" && geom2.type === "Polygon") {
    return isPointInPolygon(
      geom1.coordinates as Point,
      geom2.coordinates as Point[][]
    );
  }
  if (geom1.type === "Polygon" && geom2.type === "Point") {
    return booleanIntersects(geom2, geom1);
  }

  // 4. LineString vs LineString
  if (geom1.type === "LineString" && geom2.type === "LineString") {
    const pts = intersectLineWithLine(
      geom1.coordinates as Point[],
      geom2.coordinates as Point[]
    );
    return pts.length > 0;
  }

  // 5. LineString vs Polygon
  if (geom1.type === "LineString" && geom2.type === "Polygon") {
    const line = geom1.coordinates as Point[];
    const poly = geom2.coordinates as Point[][];

    // Có điểm cắt viền
    if (intersectLineWithPolygon(line, poly).length > 0) {
      return true;
    }

    // Hoặc toàn bộ Line nằm trọn bên trong Polygon
    if (isPointInPolygon(line[0], poly)) {
      return true;
    }

    return false;
  }
  if (geom1.type === "Polygon" && geom2.type === "LineString") {
    return booleanIntersects(geom2, geom1);
  }

  // 6. Polygon vs Polygon
  if (geom1.type === "Polygon" && geom2.type === "Polygon") {
    const p1 = geom1.coordinates as Point[][];
    const p2 = geom2.coordinates as Point[][];

    // Cạnh viền cắt nhau
    if (intersectPolygonWithPolygon(p1, p2).length > 0) {
      return true;
    }

    // Polygon1 nằm trọn trong Polygon2
    if (isPointInPolygon(p1[0][0], p2)) {
      return true;
    }

    // Polygon2 nằm trọn trong Polygon1
    if (isPointInPolygon(p2[0][0], p1)) {
      return true;
    }

    return false;
  }

  return false;
}
