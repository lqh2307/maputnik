import { isHasRotation, isHasScale, isHasSkew } from "../Canvas";
import { CreateImageOption, EncodeType } from "./Types";
import { detectContentTypeFromFormat } from "../Utils";
import { createCanvas, exportCanvas } from "../Canvas";
import { Fit, Position } from "../../types/Window";
import { degToRad, max, min } from "../Number";
import { colorToRGBAString } from "../Color";
import axios, { AxiosResponse } from "axios";
import { Format } from "../../types/Common";
import { Vector2d } from "konva/lib/types";
import { hasAnyFields } from "../Object";
import { isURL } from "../Request";

/************************************* To Blob *************************************/

/**
 * Converts raw text into a `Blob`.
 *
 * The optional `format` is translated to a MIME type with
 * `detectContentTypeFromFormat`.
 *
 * @example
 * ```ts
 * const svgBlob = stringToBlob("<svg />", "svg"); // { size: svgBlob.size, type: svgBlob.type } // { size: 7, type: "image/svg+xml" }
 * ```
 *
 * @param {string} str Text content to store in the blob.
 * @param {Format} format Optional file/content format used to set the blob MIME type.
 * @returns {Blob} A blob containing `str`.
 */
export function stringToBlob(str: string, format?: Format): Blob {
  return new Blob(
    [str],
    format
      ? {
          type: detectContentTypeFromFormat(format),
        }
      : undefined
  );
}

/**
 * Downloads a URL and returns the response body as a `Blob`.
 *
 * @example
 * ```ts
 * const pngBlob = await urlToBlob("/preview.png"); // resolves to the fetched blob data.
 * ```
 *
 * @param {string} url HTTP/HTTPS URL, data URL, or object URL to fetch.
 * @returns {Promise<Blob>} The fetched blob data.
 * @throws Re-throws the request error when the URL cannot be fetched.
 */
export async function urlToBlob(url: string): Promise<Blob> {
  try {
    const response: AxiosResponse = await axios.get(url, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching URL as Blob:", error);

    throw error;
  }
}

/************************************* To Base64 data URL *************************************/

/**
 * Reads a `Blob` as a base64 data URL.
 *
 * @example
 * ```ts
 * const dataUrl = await blobToBase64DataURL(file); // resolves to base64 data URL containing the blob data.
 * ```
 *
 * @param {Blob} blob Blob to encode.
 * @returns {Promise<string>} Base64 data URL containing the blob data.
 * @throws Re-throws `FileReader` errors.
 */
export async function blobToBase64DataURL(blob: Blob): Promise<string> {
  try {
    return await new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onabort = (err) => {
        return reject(err);
      };
      reader.onerror = (err) => {
        return reject(err);
      };
      reader.onload = () => {
        return resolve(reader.result as string);
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting Blob to base64 data URL:", error);

    throw error;
  }
}

/**
 * Converts raw text into a base64 data URL.
 *
 * @example
 * ```ts
 * const svgUrl = await stringToBase64DataURL("<svg />", "svg"); // resolves to base64 data URL containing `str`.
 * ```
 *
 * @param {string} str Text content to encode.
 * @param {Format} format Optional file/content format used to set the data URL MIME type.
 * @returns {Promise<string>} Base64 data URL containing `str`.
 */
export async function stringToBase64DataURL(
  str: string,
  format?: Format
): Promise<string> {
  return await blobToBase64DataURL(
    new Blob(
      [str],
      format
        ? {
            type: detectContentTypeFromFormat(format),
          }
        : undefined
    )
  );
}

/**
 * Downloads a URL and converts the response body to a base64 data URL.
 *
 * @example
 * ```ts
 * const dataUrl = await urlToBase64DataURL("/preview.png"); // resolves to base64 data URL containing the fetched data.
 * ```
 *
 * @param {string} url HTTP/HTTPS URL, data URL, or object URL to fetch.
 * @returns {Promise<string>} Base64 data URL containing the fetched data.
 * @throws Re-throws request or `FileReader` errors.
 */
export async function urlToBase64DataURL(url: string): Promise<string> {
  try {
    const response: AxiosResponse = await axios.get(url, {
      responseType: "blob",
    });

    return await new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onabort = (err) => {
        return reject(err);
      };
      reader.onerror = (err) => {
        return reject(err);
      };
      reader.onload = () => {
        return resolve(reader.result as string);
      };

      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error("Error converting URL to base64 data URL:", error);

    throw error;
  }
}

/************************************* To Object URL *************************************/

/**
 * Downloads a URL and creates a browser object URL from the response blob.
 *
 * The caller is responsible for revoking the returned URL when it is no longer
 * needed.
 *
 * @example
 * ```ts
 * const objectUrl = await urlToObjectURL("/preview.png");
 * URL.revokeObjectURL(objectUrl); // resolves to object URL pointing to the fetched blob.
 * ```
 *
 * @param {string} url HTTP/HTTPS URL to fetch.
 * @returns {Promise<string>} Object URL pointing to the fetched blob.
 * @throws Re-throws the request error when the URL cannot be fetched.
 */
export async function urlToObjectURL(url: string): Promise<string> {
  try {
    const response: AxiosResponse = await axios.get(url, {
      responseType: "blob",
    });

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error converting URL to object URL:", error);

    throw error;
  }
}

/**
 * Converts raw text into a blob-backed object URL.
 *
 * The caller is responsible for revoking the returned URL when it is no longer
 * needed.
 *
 * @example
 * ```ts
 * const objectUrl = await stringToObjectURL("<svg />", "svg");
 * URL.revokeObjectURL(objectUrl); // resolves to object URL pointing to the generated blob.
 * ```
 *
 * @param {string} str Text content to store in the object URL.
 * @param {Format} format Optional file/content format used to set the blob MIME type.
 * @returns {Promise<string>} Object URL pointing to the generated blob.
 */
export async function stringToObjectURL(
  str: string,
  format?: Format
): Promise<string> {
  return URL.createObjectURL(
    new Blob(
      [str],
      format
        ? {
            type: detectContentTypeFromFormat(format),
          }
        : undefined
    )
  );
}

/************************************* To String *************************************/

/**
 * Reads a `Blob` as plain text.
 *
 * @example
 * ```ts
 * const json = await blobToString(blob); // resolves to text content from the blob.
 * ```
 *
 * @param {Blob} blob Blob to read.
 * @returns {Promise<string>} Text content from the blob.
 * @throws Re-throws `FileReader` errors.
 */
export async function blobToString(blob: Blob): Promise<string> {
  try {
    return await new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onabort = (err) => {
        return reject(err);
      };
      reader.onerror = (err) => {
        return reject(err);
      };
      reader.onload = () => {
        return resolve(reader.result as string);
      };

      reader.readAsText(blob);
    });
  } catch (error) {
    console.error("Error converting Blob to string:", error);

    throw error;
  }
}

/**
 * Downloads a URL and returns the response body as text.
 *
 * @example
 * ```ts
 * const svg = await urlToString("/shape.svg"); // resolves to text response body.
 * ```
 *
 * @param {string} url HTTP/HTTPS URL, data URL, or object URL to fetch.
 * @returns {Promise<string>} Text response body.
 * @throws Re-throws the request error when the URL cannot be fetched.
 */
export async function urlToString(url: string): Promise<string> {
  try {
    const response: AxiosResponse = await axios.get(url, {
      responseType: "text",
    });

    return response.data;
  } catch (error) {
    console.error("Error converting URL to string:", error);

    throw error;
  }
}

/************************************* Image *************************************/

/**
 * Loads an image source into an `HTMLImageElement`.
 *
 * String input is treated as a URL when `isURL` accepts it; otherwise it is
 * treated as SVG text. Blob input is encoded according to `type`.
 *
 * @example
 * ```ts
 * const image = await loadImageSrc("/preview.png");
 * ctx.drawImage(image, 0, 0); // resolves to loaded image element with `crossOrigin` set to `anonymous`.
 * ```
 *
 * @param {string | Blob} src Image source: URL, data URL, object URL, SVG text, or blob.
 * @param {EncodeType} type Encoding strategy used before assigning `img.src`.
 * @returns {Promise<HTMLImageElement>} Loaded image element with `crossOrigin` set to `anonymous`.
 * @throws Rejects when source conversion or image loading fails.
 */
export async function loadImageSrc(
  src: string | Blob,
  type?: EncodeType
): Promise<HTMLImageElement> {
  if (type === "objectURL") {
    let targetSrc: string;

    if (src instanceof Blob) {
      targetSrc = URL.createObjectURL(src);
    } else if (isURL(src)) {
      targetSrc = await urlToObjectURL(src);
    } else {
      targetSrc = await stringToObjectURL(src, "svg");
    }

    return await new Promise((resolve, reject) => {
      const img: HTMLImageElement = new Image();

      img.crossOrigin = "anonymous";
      img.onload = () => {
        return resolve(img);
      };
      img.onabort = reject;
      img.onerror = reject;
      // img.onended = () => URL.revokeObjectURL(targetSrc);
      // Note: Do not revoke here as image may need to buffer more data.
      // Call URL.revokeObjectURL(targetSrc) manually when image is no longer needed.

      img.src = targetSrc;
    });
  } else {
    let targetSrc: string;

    if (src instanceof Blob) {
      targetSrc = await blobToBase64DataURL(src);
    } else if (isURL(src)) {
      targetSrc = await urlToBase64DataURL(src);
    } else {
      targetSrc = await stringToBase64DataURL(src, "svg");
    }

    return await new Promise((resolve, reject) => {
      const img: HTMLImageElement = new Image();

      img.crossOrigin = "anonymous";
      img.onload = () => {
        return resolve(img);
      };
      img.onabort = reject;
      img.onerror = reject;
      // img.onended = () => URL.revokeObjectURL(targetSrc);
      // Note: Do not revoke here as image may need to buffer more data.
      // Call URL.revokeObjectURL(targetSrc) manually when image is no longer needed.

      img.src = targetSrc;
    });
  }
}

/**
 * Extracts or converts an image element source.
 *
 * Existing data URLs and blob URLs are returned directly when they already
 * match the requested encoding strategy.
 *
 * @example
 * ```ts
 * const dataUrl = await extractImageSrc(image, "base64DataURL"); // resolves to image source as a base64 data URL or object URL.
 * ```
 *
 * @param {HTMLImageElement} img Image element to read from.
 * @param {EncodeType} type Desired encoding strategy for the returned source.
 * @returns {Promise<string>} Image source as a base64 data URL or object URL.
 */
export async function extractImageSrc(
  img: HTMLImageElement,
  type?: EncodeType
): Promise<string> {
  if (type === "objectURL") {
    if (img.src.startsWith("blob:")) {
      return img.src;
    } else if (isURL(img.src)) {
      return await urlToObjectURL(img.src);
    } else {
      return await stringToObjectURL(img.src, "svg");
    }
  } else {
    if (img.src.startsWith("data:")) {
      return img.src;
    } else if (isURL(img.src)) {
      return await urlToBase64DataURL(img.src);
    } else {
      return await stringToBase64DataURL(img.src, "svg");
    }
  }
}

/**
 * Runs the image processing pipeline and exports the final canvas.
 *
 * The pipeline order is create/load, extend, composite, extract, resize, color
 * effect, transform, opacity, then export.
 *
 * @example
 * ```ts
 * const output = await createImageOutput({
 *   data: "/input.png",
 *   resize: { size: { width: 1024, height: 768 }, fit: "contain" },
 *   format: "png",
 * }); // resolves to base64 data URL or object URL for the processed image.
 * ```
 *
 * @param {CreateImageOption} options Image creation, transform, effect, and output options.
 * @returns {Promise<string>} Base64 data URL or object URL for the processed image.
 */
export async function createImageOutput(
  options: CreateImageOption
): Promise<string> {
  let baseCanvas: HTMLCanvasElement;

  // ========================
  // 1. CREATE/INPUT
  // ========================
  if (options.create) {
    baseCanvas = createCanvas(options.create);
  } else {
    if (!options.data) {
      return;
    }

    const img: HTMLImageElement = await loadImageSrc(options.data);

    baseCanvas = createCanvas({
      size: {
        width: img.naturalWidth,
        height: img.naturalHeight,
      },
    });

    baseCanvas.getContext("2d").drawImage(img, 0, 0);
  }

  // ========================
  // 2. EXTEND
  // ========================
  if (options.extend) {
    const newCanvas: HTMLCanvasElement = createCanvas({
      size: {
        width:
          baseCanvas.width +
          options.extend.extend.left +
          options.extend.extend.right,
        height:
          baseCanvas.height +
          options.extend.extend.top +
          options.extend.extend.bottom,
      },
      background: options.extend.background,
    });

    newCanvas
      .getContext("2d")
      .drawImage(
        baseCanvas,
        options.extend.extend.left,
        options.extend.extend.top
      );

    baseCanvas = newCanvas;
  }

  // ========================
  // 3. COMPOSITE
  // ========================
  if (options.composites) {
    const ctx: CanvasRenderingContext2D = baseCanvas.getContext("2d");

    for (const item of options.composites) {
      const img: HTMLImageElement = await loadImageSrc(item.input);

      if (
        item.background &&
        hasAnyFields(item.background, ["color", "opacity"])
      ) {
        ctx.fillStyle = colorToRGBAString(
          item.background.color,
          item.background.opacity
        );

        ctx.fillRect(item.left, item.top, img.naturalWidth, img.naturalHeight);
      }

      ctx.drawImage(img, item.left, item.top);
    }
  }

  // ========================
  // 4. EXTRACT (crop)
  // ========================
  if (options.extract) {
    const newCanvas: HTMLCanvasElement = createCanvas({
      size: {
        width: options.extract.width,
        height: options.extract.height,
      },
    });

    newCanvas
      .getContext("2d")
      .drawImage(
        baseCanvas,
        options.extract.left,
        options.extract.top,
        options.extract.width,
        options.extract.height,
        0,
        0,
        options.extract.width,
        options.extract.height
      );

    baseCanvas = newCanvas;
  }

  // ========================
  // 5. RESIZE
  // ========================
  if (options.resize) {
    let targetW: number;
    let targetH: number;

    if (!options.resize.size.width && !options.resize.size.height) {
      targetW = baseCanvas.width;
      targetH = baseCanvas.height;
    } else if (!options.resize.size.width) {
      targetW = Math.round(
        (baseCanvas.width * options.resize.size.height) / baseCanvas.height
      );
    } else if (!options.resize.size.height) {
      targetH = Math.round(
        (baseCanvas.height * options.resize.size.width) / baseCanvas.width
      );
    } else {
      targetW = options.resize.size.width;
      targetH = options.resize.size.height;
    }

    const newCanvas: HTMLCanvasElement = createCanvas({
      size: {
        width: targetW,
        height: targetH,
      },
    });

    const fit: Fit = options.resize.fit ?? "cover";

    if (fit === "fill") {
      newCanvas.getContext("2d").drawImage(baseCanvas, 0, 0, targetW, targetH);
    } else {
      const position: Position = options.resize.position ?? "center middle";

      let anchor: Vector2d;

      switch (position) {
        case "center top": {
          anchor = {
            x: 0.5,
            y: 0,
          };

          break;
        }

        case "right top": {
          anchor = {
            x: 1,
            y: 0,
          };

          break;
        }

        case "right middle": {
          anchor = {
            x: 1,
            y: 0.5,
          };

          break;
        }

        case "right bottom": {
          anchor = {
            x: 1,
            y: 1,
          };

          break;
        }

        case "center bottom": {
          anchor = {
            x: 0.5,
            y: 1,
          };

          break;
        }

        case "left bottom": {
          anchor = {
            x: 0,
            y: 1,
          };

          break;
        }

        case "left middle": {
          anchor = {
            x: 0,
            y: 0.5,
          };

          break;
        }

        case "left top": {
          anchor = {
            x: 0,
            y: 0,
          };

          break;
        }

        case "center middle": {
          anchor = {
            x: 0.5,
            y: 0.5,
          };

          break;
        }
      }

      if (fit === "contain" || fit === "inside") {
        const scale: number = min(
          targetW / baseCanvas.width,
          targetH / baseCanvas.height
        );

        const w: number = baseCanvas.width * scale;
        const h: number = baseCanvas.height * scale;

        newCanvas
          .getContext("2d")
          .drawImage(
            baseCanvas,
            (targetW - w) * anchor.x,
            (targetH - h) * anchor.y,
            w,
            h
          );
      } else {
        const scale: number = max(
          targetW / baseCanvas.width,
          targetH / baseCanvas.height
        );

        const srcW: number = targetW / scale;
        const srcH: number = targetH / scale;

        newCanvas
          .getContext("2d")
          .drawImage(
            baseCanvas,
            (baseCanvas.width - srcW) * anchor.x,
            (baseCanvas.height - srcH) * anchor.y,
            srcW,
            srcH,
            0,
            0,
            targetW,
            targetH
          );
      }
    }

    baseCanvas = newCanvas;
  }

  // ========================
  // 6. COLOR EFFECTS
  // ========================
  if (options.colorEffect && options.colorEffect !== "origin") {
    const ctx: CanvasRenderingContext2D = baseCanvas.getContext("2d");

    const imageData: ImageData = ctx.getImageData(
      0,
      0,
      baseCanvas.width,
      baseCanvas.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r: number = imageData.data[i];
      const g: number = imageData.data[i + 1];
      const b: number = imageData.data[i + 2];

      if (options.colorEffect === "grayscale") {
        const gray: number = 0.299 * r + 0.587 * g + 0.114 * b;
        imageData.data[i] = gray;
        imageData.data[i + 1] = gray;
        imageData.data[i + 2] = gray;
      } else if (options.colorEffect === "sepia") {
        const nr: number = 0.393 * r + 0.769 * g + 0.189 * b;
        const ng: number = 0.349 * r + 0.686 * g + 0.168 * b;
        const nb: number = 0.272 * r + 0.534 * g + 0.131 * b;
        imageData.data[i] = min(255, nr);
        imageData.data[i + 1] = min(255, ng);
        imageData.data[i + 2] = min(255, nb);
      } else if (options.colorEffect === "invert") {
        imageData.data[i] = 255 - r;
        imageData.data[i + 1] = 255 - g;
        imageData.data[i + 2] = 255 - b;
      } else if (options.colorEffect === "solarize") {
        imageData.data[i] = r < 128 ? r : 255 - r;
        imageData.data[i + 1] = g < 128 ? g : 255 - g;
        imageData.data[i + 2] = b < 128 ? b : 255 - b;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // ========================
  // 7. TRANSFORM
  // ========================
  if (options.transform) {
    const ctx: CanvasRenderingContext2D = baseCanvas.getContext("2d");

    ctx.translate(options.transform.x ?? 0, options.transform.y ?? 0);

    if (isHasSkew(options.transform)) {
      ctx.transform(
        1,
        options.transform.skewY ?? 0,
        options.transform.skewX ?? 0,
        1,
        0,
        0
      );
    }

    if (isHasScale(options.transform)) {
      ctx.scale(options.transform.scaleX ?? 1, options.transform.scaleY ?? 1);
    }

    if (isHasRotation(options.transform)) {
      ctx.rotate(degToRad(options.transform.rotation));
    }
  }

  // ========================
  // 8. OPACITY
  // ========================
  if (options.opacity !== undefined) {
    baseCanvas.getContext("2d").globalAlpha = options.opacity;
  }

  // ========================
  // 9. OUTPUT
  // ========================
  return await exportCanvas(baseCanvas, options.format, options.type);
}

/************************************* Video *************************************/

/**
 * Loads a video source into an `HTMLVideoElement`.
 *
 * The promise resolves after metadata is loaded so dimensions and duration are
 * available to callers.
 *
 * @example
 * ```ts
 * const video = await loadVideoSrc("/clip.mp4", "objectURL");
 * console.log(video.videoWidth, video.videoHeight); // resolves to video element with loaded metadata.
 * ```
 *
 * @param {string | Blob} src Video source: URL, data URL, object URL, SVG text, or blob.
 * @param {EncodeType} type Encoding strategy used before assigning `video.src`.
 * @returns {Promise<HTMLVideoElement>} Video element with loaded metadata.
 * @throws Rejects when source conversion or metadata loading fails.
 */
export async function loadVideoSrc(
  src: string | Blob,
  type?: EncodeType
): Promise<HTMLVideoElement> {
  if (type === "objectURL") {
    let targetSrc: string;

    if (src instanceof Blob) {
      targetSrc = URL.createObjectURL(src);
    } else if (isURL(src)) {
      targetSrc = await urlToObjectURL(src);
    } else {
      targetSrc = await stringToObjectURL(src, "svg");
    }

    return await new Promise((resolve, reject) => {
      const video: HTMLVideoElement = document.createElement("video");

      video.crossOrigin = "anonymous";
      video.onloadedmetadata = () => {
        return resolve(video);
      };
      video.onerror = (err) => {
        return reject(err);
      };
      video.onabort = (err) => {
        return reject(err);
      };
      // video.onload = () => URL.revokeObjectURL(targetSrc);
      // Note: Do not revoke here as video may need to buffer more data.
      // Call URL.revokeObjectURL(targetSrc) manually when video is no longer needed.

      video.src = targetSrc;
      video.preload = "metadata";
      video.autoplay = false;
      video.crossOrigin = "anonymous";
    });
  } else {
    let targetSrc: string;

    if (src instanceof Blob) {
      targetSrc = await blobToBase64DataURL(src);
    } else if (isURL(src)) {
      targetSrc = await urlToBase64DataURL(src);
    } else {
      targetSrc = await stringToBase64DataURL(src, "svg");
    }

    return await new Promise((resolve, reject) => {
      const video: HTMLVideoElement = document.createElement("video");

      video.crossOrigin = "anonymous";
      video.onloadedmetadata = () => {
        return resolve(video);
      };
      video.onerror = (err) => {
        return reject(err);
      };
      video.onabort = (err) => {
        return reject(err);
      };

      video.src = targetSrc;
      video.preload = "metadata";
      video.autoplay = false;
      video.crossOrigin = "anonymous";
    });
  }
}

/**
 * Extracts or converts a video element source.
 *
 * Existing data URLs and blob URLs are returned directly when they already
 * match the requested encoding strategy.
 *
 * @example
 * ```ts
 * const objectUrl = await extractVideoSrc(video, "objectURL"); // resolves to video source as a base64 data URL or object URL.
 * ```
 *
 * @param {HTMLVideoElement} vid Video element to read from.
 * @param {EncodeType} type Desired encoding strategy for the returned source.
 * @returns {Promise<string>} Video source as a base64 data URL or object URL.
 */
export async function extractVideoSrc(
  vid: HTMLVideoElement,
  type?: EncodeType
): Promise<string> {
  if (type === "objectURL") {
    if (vid.src.startsWith("blob:")) {
      return vid.src;
    } else if (isURL(vid.src)) {
      return await urlToObjectURL(vid.src);
    } else {
      return await stringToObjectURL(vid.src, "svg");
    }
  } else {
    if (vid.src.startsWith("data:")) {
      return vid.src;
    } else if (isURL(vid.src)) {
      return await urlToBase64DataURL(vid.src);
    } else {
      return await stringToBase64DataURL(vid.src, "svg");
    }
  }
}
