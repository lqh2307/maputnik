import { isHasRotation, isHasScale, isHasSkew } from "./Transform";
import { getImageSourceSize, ImageSourceLike } from "./Render";
import { detectContentTypeFromFormat } from "../Utils";
import { ImageFormat } from "../../types/Common";
import { createLineDash } from "../Shapes/Line";
import { degToRad, max, min } from "../Number";
import { colorToRGBAString } from "../Color";
import {
  createCatmullRomCurvePoints,
  createBezierCurvePoints,
} from "../Shapes";
import {
  CreateCanvasOption,
  TransformOption,
  PolylineOption,
  CurveOption,
  ImageOption,
  EncodeType,
  TextOption,
  LineOption,
  RectOption,
} from "./Types";

/**
 * Creates a canvas and optionally paints its background and border.
 *
 * `width` and `height` describe the content area. When a visible stroke is
 * provided, the backing canvas grows by the stroke width and the border is
 * centered on the original content boundary.
 *
 * @example
 * ```ts
 * const canvas = createCanvas({
 *   size: { width: 800, height: 600 },
 *   background: { color: WHITE_COLOR },
 *   stroke: { color: BLACK_COLOR, width: 2 },
 * }); // Newly created canvas element.
 * ```
 *
 * @param {CreateCanvasOption} option Canvas creation and initial paint options.
 * @returns {HTMLCanvasElement} Newly created canvas element.
 */
export function createCanvas(option: CreateCanvasOption): HTMLCanvasElement {
  // Create canvas element
  const canvas: HTMLCanvasElement = (option.document ?? document).createElement(
    "canvas"
  );

  // Assign id if provided
  if (option.id) {
    canvas.id = option.id;
  }

  // Expand by half the stroke width on every side of the content boundary.
  const overflow: number = option.stroke ? option.stroke.width : 0;

  canvas.width = option.size.width + overflow;
  canvas.height = option.size.height + overflow;

  const offsetX: number = (canvas.width - option.size.width) / 2;
  const offsetY: number = (canvas.height - option.size.height) / 2;

  const hasGlobalAlpha: boolean = option.globalAlpha !== undefined;

  if (option.background || option.stroke || hasGlobalAlpha) {
    // Get 2D rendering context with optional attributes
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    ctx.save();

    // Apply alpha to the initialized background and border.
    if (hasGlobalAlpha) {
      ctx.globalAlpha = option.globalAlpha;
    }

    // Assign background color if provided
    if (option.background) {
      ctx.fillStyle = colorToRGBAString(
        option.background.color,
        option.background.opacity
      );

      ctx.fillRect(offsetX, offsetY, option.size.width, option.size.height);
    }

    // Center the stroke on the original content boundary.
    if (option.stroke) {
      ctx.strokeStyle = colorToRGBAString(
        option.stroke.color,
        option.stroke.opacity
      );
      ctx.lineCap = option.stroke.lineCap;
      ctx.lineJoin = option.stroke.lineJoin;
      ctx.lineWidth = option.stroke.width;
      ctx.setLineDash(createLineDash(option.stroke.style ?? "solid"));

      ctx.strokeRect(offsetX, offsetY, option.size.width, option.size.height);
    }

    ctx.restore();
  }

  return canvas;
}

/**
 * Exports a canvas as a base64 data URL or blob-backed object URL.
 *
 * @example
 * ```ts
 * const png = await exportCanvas(canvas, "png");
 * const blobUrl = await exportCanvas(canvas, "jpeg", "objectURL"); // resolves to encoded image URL.
 * ```
 *
 * @param {HTMLCanvasElement} canvas Canvas element to export.
 * @param {ImageFormat} format Output image format, defaulting to `png`.
 * @param {EncodeType} type Output encoding strategy, defaulting to `base64DataURL`.
 * @returns {Promise<string>} Encoded image URL.
 */
export async function exportCanvas(
  canvas: HTMLCanvasElement,
  format?: ImageFormat,
  type?: EncodeType
): Promise<string> {
  const mimeType: string = detectContentTypeFromFormat(format ?? "png");

  if (type === "objectURL") {
    return await new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, mimeType);
    });
  }

  return canvas.toDataURL(mimeType);
}

/**
 * Draws a polyline (connected line segments) with optional fill and stroke.
 *
 * @example
 * ```ts
 * drawPolyline(canvas, {
 *   points: [50, 100, 150, 50, 250, 150, 350, 80],
 *   stroke: { color: "#3498DB", width: 3, style: "solid" }
 * });
 *
 * drawPolyline(canvas, {
 *   points: [250, 50, 400, 150, 350, 300, 150, 300, 100, 150],
 *   closed: true,
 *   fill: { color: "#4CAF50", opacity: 0.7 },
 *   stroke: { color: "#000", width: 2, style: "solid" }
 * });
 * ```
 *
 * @param {HTMLCanvasElement} canvas Canvas to draw on.
 * @param {PolylineOption} option Polyline points, closed flag, fill, and stroke options.
 * @returns {HTMLCanvasElement} Canvas with polyline drawn.
 */
export function drawPolyline(
  canvas: HTMLCanvasElement,
  option: PolylineOption
): HTMLCanvasElement {
  if (
    !option.points?.length ||
    option.points.length < 4 ||
    option.points.length % 2
  ) {
    return canvas;
  }

  const { closed, points, stroke, fill, transform }: PolylineOption = option;

  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  ctx.save();

  transformCtx(ctx, transform);

  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);

  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i], points[i + 1]);
  }

  if (closed) {
    ctx.closePath();

    if (fill) {
      ctx.fillStyle = colorToRGBAString(fill.color, fill.opacity);

      ctx.fill();
    }
  }

  if (stroke) {
    ctx.strokeStyle = colorToRGBAString(stroke.color, stroke.opacity);
    ctx.lineWidth = stroke.width;
    ctx.setLineDash(createLineDash(stroke.style));

    if (stroke.lineCap) {
      ctx.lineCap = stroke.lineCap;
    }

    if (stroke.lineJoin) {
      ctx.lineJoin = stroke.lineJoin;
    }

    ctx.stroke();
  }

  ctx.restore();

  return canvas;
}

/**
 * Draws a sampled Catmull-Rom or Bezier curve with optional fill and stroke.
 *
 * @example
 * ```ts
 * drawCurve(canvas, {
 *   points: [50, 100, 150, 50, 250, 150, 350, 80],
 *   type: "curve",
 *   stroke: { color: "#3498DB", width: 3, style: "solid" },
 * }); // returns the canvas with curve drawn.
 * ```
 *
 * @param {HTMLCanvasElement} canvas Canvas to draw on.
 * @param {CurveOption} option Curve control points, interpolation, fill, and stroke options.
 * @returns {HTMLCanvasElement} Canvas with curve drawn.
 */
export function drawCurve(
  canvas: HTMLCanvasElement,
  option: CurveOption
): HTMLCanvasElement {
  if (
    !option.points?.length ||
    option.points.length < 4 ||
    option.points.length % 2
  ) {
    return canvas;
  }

  const {
    closed,
    points,
    stroke,
    fill,
    transform,
    type,
    pointsPerSegment,
  }: CurveOption = option;

  const sampledPoints: number[] =
    type === "bezier"
      ? createBezierCurvePoints(points, pointsPerSegment)
      : createCatmullRomCurvePoints(points, pointsPerSegment);

  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  ctx.save();

  transformCtx(ctx, transform);

  ctx.beginPath();
  ctx.moveTo(sampledPoints[0], sampledPoints[1]);

  for (let i = 2; i < sampledPoints.length; i += 2) {
    ctx.lineTo(sampledPoints[i], sampledPoints[i + 1]);
  }

  if (closed) {
    ctx.closePath();

    if (fill) {
      ctx.fillStyle = colorToRGBAString(fill.color, fill.opacity);

      ctx.fill();
    }
  }

  if (stroke) {
    ctx.strokeStyle = colorToRGBAString(stroke.color, stroke.opacity);
    ctx.lineWidth = stroke.width;
    ctx.setLineDash(createLineDash(stroke.style));

    if (stroke.lineCap) {
      ctx.lineCap = stroke.lineCap;
    }

    if (stroke.lineJoin) {
      ctx.lineJoin = stroke.lineJoin;
    }

    ctx.stroke();
  }

  ctx.restore();

  return canvas;
}

/**
 * Draws one line segment with optional transform and stroke styling.
 *
 * @example
 * ```ts
 * drawLine(canvas, {
 *   points: [120, 0],
 *   stroke: { color: BLACK_COLOR, opacity: 1, width: 2, style: "solid" },
 * }); // returns the canvas with line drawn.
 * ```
 *
 * @param {HTMLCanvasElement} canvas Canvas to draw on.
 * @param {LineOption} option Line geometry, transform, and stroke options.
 * @returns {HTMLCanvasElement} Canvas with line drawn.
 */
export function drawLine(
  canvas: HTMLCanvasElement,
  option: LineOption
): HTMLCanvasElement {
  if (!option.stroke || !option.points?.length) {
    return canvas;
  }

  const { points, stroke, transform }: LineOption = option;

  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  ctx.save();

  transformCtx(ctx, transform);

  ctx.strokeStyle = colorToRGBAString(stroke.color, stroke.opacity);
  ctx.lineWidth = stroke.width;
  ctx.setLineDash(createLineDash(stroke.style));

  if (stroke.lineCap) {
    ctx.lineCap = stroke.lineCap;
  }

  if (stroke.lineJoin) {
    ctx.lineJoin = stroke.lineJoin;
  }

  ctx.beginPath();

  ctx.moveTo(0, 0);
  ctx.lineTo(points[0], points[1]);

  ctx.stroke();

  ctx.restore();

  return canvas;
}

/**
 * Draws a rectangle with optional fill and full-border stroke.
 *
 * @example
 * ```ts
 * drawRect(canvas, {
 *   transform: { x: 20, y: 20 },
 *   width: 800,
 *   height: 600,
 *   fill: { color: "#fff", opacity: 0.5 },
 *   stroke: { color: "#000", width: 2, style: "solid" },
 * }); // returns the canvas with rectangle fill and border drawn.
 * ```
 *
 * @param {HTMLCanvasElement} canvas Canvas to draw on.
 * @param {RectOption} option Rect geometry, transform, fill, and stroke options.
 * @returns {HTMLCanvasElement} Canvas with rectangle fill and border drawn.
 */
export function drawRect(
  canvas: HTMLCanvasElement,
  option: RectOption
): HTMLCanvasElement {
  if (!option.width || !option.height) {
    return canvas;
  }

  const { width, height, stroke, fill, transform }: RectOption = option;

  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  ctx.save();

  transformCtx(ctx, transform);

  if (fill) {
    ctx.fillStyle = colorToRGBAString(fill.color, fill.opacity);

    ctx.fillRect(0, 0, width, height);
  }

  if (option.stroke) {
    ctx.strokeStyle = colorToRGBAString(stroke.color, stroke.opacity);
    ctx.lineWidth = stroke.width;
    ctx.setLineDash(createLineDash(stroke.style));

    if (stroke.lineCap) {
      ctx.lineCap = stroke.lineCap;
    }

    if (stroke.lineJoin) {
      ctx.lineJoin = stroke.lineJoin;
    }

    ctx.strokeRect(0, 0, width, height);
  }

  ctx.restore();

  return canvas;
}

/**
 * Draws a loaded image source with an optional destination size and transform.
 *
 * @example
 * ```ts
 * drawImage(canvas, {
 *   image,
 *   transform: { x: 20, y: 30, rotation: 15 },
 *   width: 320,
 *   height: 180,
 * }); // returns the canvas with the image drawn.
 * ```
 *
 * @param {HTMLCanvasElement} canvas Canvas to draw on.
 * @param {ImageOption} option Image source, destination size, and transform.
 * @returns {HTMLCanvasElement} Canvas with image drawn.
 */
export function drawImage(
  canvas: HTMLCanvasElement,
  option: ImageOption
): HTMLCanvasElement {
  if (!option.image) {
    return canvas;
  }

  const { image, width, height, fit, clear, transform }: ImageOption = option;

  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  if (clear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();

  transformCtx(ctx, transform);

  if (width === undefined || height === undefined) {
    ctx.drawImage(image, 0, 0);
  } else if (!fit || fit === "fill") {
    ctx.drawImage(image, 0, 0, width, height);
  } else {
    const { width: sourceWidth, height: sourceHeight } = getImageSourceSize(
      image as unknown as ImageSourceLike
    );

    if (sourceWidth > 0 && sourceHeight > 0) {
      const scale =
        fit === "contain" || fit === "inside"
          ? min(width / sourceWidth, height / sourceHeight)
          : max(width / sourceWidth, height / sourceHeight);
      const targetWidth = sourceWidth * scale;
      const targetHeight = sourceHeight * scale;

      if (fit === "cover" || fit === "outside") {
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();
      }

      ctx.drawImage(
        image,
        (width - targetWidth) / 2,
        (height - targetHeight) / 2,
        targetWidth,
        targetHeight
      );
    }
  }

  ctx.restore();

  return canvas;
}

/**
 * Draws one rotated tick or axis label with explicit canvas text layout.
 *
 * @example
 * ```ts
 * drawText(canvas, {
 *   text: "106E",
 *   transform: { x: 400, y: 620, rotation: 0 },
 *   fill: { color: "#000", opacity: 1 },
 *   stroke: { color: "#fff", opacity: 1, width: 2 },
 *   font: { font: "sans-serif", size: 12, align: "center", baseline: "top" },
 * }); // returns the canvas with text drawn.
 * ```
 *
 * @param {HTMLCanvasElement} canvas Canvas to draw on.
 * @param {TextOption} option Label text, transform, font, align, and baseline options.
 * @returns {HTMLCanvasElement} Canvas with text drawn.
 */
export function drawText(
  canvas: HTMLCanvasElement,
  option: TextOption
): HTMLCanvasElement {
  if (!option.font || !option.text) {
    return canvas;
  }

  const { text, font, stroke, fill, transform }: TextOption = option;

  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  ctx.save();

  transformCtx(ctx, transform);

  ctx.font = `${font.size}px ${font.font}`;
  ctx.textAlign = font.align;
  ctx.textBaseline = font.baseline;

  if (stroke) {
    ctx.strokeStyle = colorToRGBAString(stroke.color, stroke.opacity);
    ctx.lineWidth = stroke.width;
    ctx.setLineDash(createLineDash(stroke.style));

    if (stroke.lineCap) {
      ctx.lineCap = stroke.lineCap;
    }

    if (stroke.lineJoin) {
      ctx.lineJoin = stroke.lineJoin;
    }

    ctx.strokeText(text, 0, 0);
  }

  if (fill) {
    ctx.fillStyle = colorToRGBAString(fill.color, fill.opacity);

    ctx.fillText(text, 0, 0);
  }

  ctx.restore();

  return canvas;
}

/**
 * Draw arrowheads at the ends of a polyline on an existing canvas.
 *
 * @param canvas Canvas to mutate.
 * @param points Flat `[x, y, ...]` polyline coordinates.
 * @param twoHead Whether to draw a head at both ends instead of only the end.
 * @param width Arrowhead base width.
 * @param height Arrowhead length.
 */
export function drawArrow(
  canvas: HTMLCanvasElement,
  points: number[],
  twoHead?: boolean,
  width?: number,
  height?: number
): void {
  if (!points?.length || !width || !height) {
    return;
  }

  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  /** Draw one arrowhead from the source point toward the target point. */
  function drawHead(fx: number, fy: number, tx: number, ty: number): void {
    const dx: number = tx - fx;
    const dy: number = ty - fy;
    const len: number = Math.hypot(dx, dy);
    if (len === 0) {
      return;
    }

    const ux: number = dx / len;
    const uy: number = dy / len;

    const px: number = -uy;
    const py: number = ux;

    const baseX: number = tx - ux * height;
    const baseY: number = ty - uy * height;

    const leftX: number = baseX + (px * width) / 2;
    const leftY: number = baseY + (py * width) / 2;

    const rightX: number = baseX - (px * width) / 2;
    const rightY: number = baseY - (py * width) / 2;

    ctx.beginPath();

    ctx.moveTo(tx, ty);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);

    ctx.closePath();

    ctx.fill();
  }

  if (points.length === 2) {
    drawHead(points[0], points[1], points[0] + height, points[1]);

    if (twoHead) {
      drawHead(points[0] + height, points[1], points[0], points[1]);
    }
  } else {
    const len: number = points.length;

    drawHead(
      points[len - 4],
      points[len - 3],
      points[len - 2],
      points[len - 1]
    );

    if (twoHead) {
      drawHead(points[2], points[3], points[0], points[1]);
    }
  }
}

/**
 * Apply a shape transform to a 2D canvas context.
 *
 * Operations are applied in renderer order: translation, skew, scale and
 * rotation. The context is mutated and returned for fluent drawing code.
 * @param ctx Canvas context to transform.
 * @param opt Optional transform attributes; omitted values use identity defaults.
 * @returns The same transformed context.
 */
function transformCtx(
  ctx: CanvasRenderingContext2D,
  opt?: TransformOption
): CanvasRenderingContext2D {
  if (opt) {
    ctx.translate(opt.x ?? 0, opt.y ?? 0);

    if (isHasSkew(opt)) {
      ctx.transform(1, opt.skewY ?? 0, opt.skewX ?? 0, 1, 0, 0);
    }

    if (isHasScale(opt)) {
      ctx.scale(opt.scaleX ?? 1, opt.scaleY ?? 1);
    }

    if (isHasRotation(opt)) {
      ctx.rotate(degToRad(opt.rotation));
    }
  }

  return ctx;
}
