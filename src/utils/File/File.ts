import { Format } from "../../types/Common";
import { isURL } from "../Request";
import JSZip from "jszip";
import {
  stringToObjectURL,
  urlToObjectURL,
  EncodeType,
  urlToBlob,
} from "../Image";

/**
 * Creates a zip archive from URL-like file sources.
 *
 * Each value is fetched through `urlToBlob`, so pass HTTP/HTTPS URLs, data URLs,
 * or object URLs.
 *
 * @example
 * ```ts
 * const zipUrl = await zipFiles({
 *   "preview.png": previewUrl,
 *   "metadata.json": metadataUrl,
 * }); // resolves to zip archive as a data URL or object URL.
 * ```
 *
 * @param {Record<string, string>} files Map of archive file names to source URLs.
 * @param {EncodeType} type Output encoding strategy, defaulting to `base64DataURL`.
 * @returns {Promise<string>} Zip archive as a data URL or object URL.
 */
export async function zipFiles(
  files: Record<string, string>,
  type?: EncodeType
): Promise<string> {
  const zip: JSZip = new JSZip();

  await Promise.all(
    Object.keys(files).map(async (fileName) => {
      zip.file(fileName, await urlToBlob(files[fileName]));
    })
  );

  if (type === "objectURL") {
    return URL.createObjectURL(
      await zip.generateAsync({
        type: "blob",
      })
    );
  }

  return `data:application/zip;base64,${await zip.generateAsync({
    type: "base64",
  })}`;
}

/**
 * Triggers a browser download for a source URL or blob.
 *
 * Non-URL string input is treated as raw file content and its MIME type is
 * inferred from `fileName`.
 *
 * @example
 * ```ts
 * await saveToFile(new Blob(["hello"]), "hello.txt");
 * ```
 *
 * @param {string | Blob} src Data source: URL, data URL, object URL, raw string, or blob.
 * @param {string} fileName Download file name.
 * @returns A promise resolved after the temporary download link is triggered.
 */
export async function saveToFile(
  src: string | Blob,
  fileName: string
): Promise<void> {
  let url: string;

  if (src instanceof Blob) {
    url = URL.createObjectURL(src);
  } else {
    if (src.startsWith("blob:")) {
      url = src;
    } else if (isURL(src)) {
      url = await urlToObjectURL(src);
    } else {
      url = await stringToObjectURL(src, getFileExt(fileName));
    }
  }

  const a: HTMLAnchorElement = document.createElement("a");

  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Returns the extension part of a file name as a known format.
 *
 * @example
 * ```ts
 * const format = getFileExt("preview.png"); // "png" // "png"
 * ```
 *
 * @param {string} fileName File name or path-like string.
 * @returns {Format} Characters after the final dot, cast to `Format`.
 */
export function getFileExt(fileName: string): Format {
  return fileName?.slice(fileName.lastIndexOf(".") + 1) as Format;
}
