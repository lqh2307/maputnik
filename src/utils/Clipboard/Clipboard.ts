import { SVG_WHITESPACE_PATTERN } from "../SVG/Constants";

/** Absolute image URL accepted from clipboard HTML/text. */
const CLIPBOARD_IMAGE_URL_PATTERN: RegExp =
  /^(?:https?:\/\/|blob:|data:image\/)/i;
/** URL-like scheme check used before resolving relative clipboard sources. */
const CLIPBOARD_IMAGE_SCHEME_PATTERN: RegExp =
  /^(?:https?:|blob:|data:image\/)/i;
/** Fast marker for HTML containing an image element. */
const CLIPBOARD_IMAGE_MARKER_PATTERN: RegExp = /<img\b/i;
/** Fallback matcher for image tags when DOMParser is unavailable. */
const CLIPBOARD_IMAGE_TAG_PATTERN: RegExp = /<img\b[^>]*>/gi;
/** Fallback matcher for src-like attributes on an image tag. */
const CLIPBOARD_IMAGE_ATTRIBUTE_PATTERN: RegExp =
  /\b(?:src|data-src|data-original)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i;

/** Minimal drag-event shape shared by React and native browser handlers. */
export type DataTransferEvent = {
  dataTransfer?: DataTransfer;
};

/** Area that owns native copy/cut/paste while the pointer is inside it. */
export type ClipboardScope = "shapes" | "tabs";

let activeEditorClipboardScope: ClipboardScope;

/**
 * Mark the editor area currently under the pointer as the clipboard owner.
 * @param scope Clipboard scope that should receive native shortcuts.
 */
export function setClipboardScope(scope: ClipboardScope): void {
  activeEditorClipboardScope = scope;
}

/**
 * Clear a clipboard owner without accidentally clearing a newer owner.
 * @param scope Scope attempting to release ownership.
 */
export function clearClipboardScope(scope: ClipboardScope): void {
  if (activeEditorClipboardScope === scope) {
    activeEditorClipboardScope = undefined;
  }
}

/**
 * Return whether `scope` currently owns editor clipboard shortcuts.
 * @param scope Scope to test.
 * @returns Whether the scope is hovered or was most recently registered.
 */
export function isEditorClipboardScopeActive(scope: ClipboardScope): boolean {
  if (typeof document !== "undefined") {
    const hoveredScope: Element = document.querySelector(
      "[data-editor-clipboard-scope]:hover"
    );

    if (hoveredScope) {
      return hoveredScope.getAttribute("data-editor-clipboard-scope") === scope;
    }
  }

  return activeEditorClipboardScope === scope;
}

/**
 * Get image blobs from the clipboard.
 * @param {ClipboardEvent} e Optional paste event (falls back to Clipboard API)
 * @returns {Promise<Blob[]>} Image blobs, or empty array
 *
 * @example
 * ```ts
 * await getImageBlobsFromClipboard(event); // image blobs from clipboard files/items, or [] when no image exists
 * ```
 */
export async function getImageBlobsFromClipboard(
  e?: ClipboardEvent
): Promise<Blob[]> {
  try {
    const mime: string = "image/";

    const blobs: Blob[] = [];

    if (e?.clipboardData) {
      if (e.clipboardData.files?.length) {
        for (const file of e.clipboardData.files) {
          if (file.type.startsWith(mime)) {
            blobs.push(file);
          }
        }
      }

      if (!blobs.length && e.clipboardData.items?.length) {
        for (const item of e.clipboardData.items) {
          if (item.type.startsWith(mime)) {
            const blob: File = item.getAsFile();
            if (blob) {
              blobs.push(blob);

              break;
            }
          }
        }
      }
    }

    if (
      !blobs.length &&
      typeof navigator !== "undefined" &&
      navigator.clipboard?.read
    ) {
      for (const item of await navigator.clipboard.read()) {
        const imageType: string = item.types.find((type) => {
          return type.startsWith(mime);
        });

        if (imageType) {
          blobs.push(await item.getType(imageType));
        }
      }
    }

    return blobs;
  } catch (error) {
    console.error("Error getting image blobs from clipboard:", error);

    return [];
  }
}

/**
 * Get plain text from the clipboard.
 * @param {ClipboardEvent} e Optional paste event (falls back to Clipboard API)
 * @returns {Promise<string>} Plain text, or empty string
 *
 * @example
 * ```ts
 * await getTextPlainFromClipboard(event); // plain text from the paste event/Clipboard API, or ""
 * ```
 */
export async function getTextPlainFromClipboard(
  e?: ClipboardEvent
): Promise<string> {
  try {
    const mime: string = "text/plain";

    let plainText: string = "";

    if (e?.clipboardData) {
      plainText = e.clipboardData.getData(mime);
    }

    if (!plainText && navigator.clipboard) {
      if (navigator.clipboard.readText) {
        plainText = await navigator.clipboard.readText();
      }

      if (!plainText && navigator.clipboard.read) {
        for (const item of await navigator.clipboard.read()) {
          if (item.types.includes(mime)) {
            const blob: Blob = await item.getType(mime);

            return await blob.text();
          }
        }
      }
    }

    return plainText;
  } catch (error) {
    console.error("Error getting plain text from clipboard:", error);

    return "";
  }
}

/** Clipboard content consumed by the editor's unified paste flow. */
export type ClipboardContent = {
  /** First available `text/plain` value. */
  textPlain: string;
  /** All available image blobs. */
  imageBlobs: Blob[];
  /** Image sources found in clipboard HTML or a direct image URL. */
  imageSources: string[];
};

/** Normalize a source copied from an HTML image before it is loaded. */
function normalizeClipboardImageSource(
  value: string,
  baseURL?: string
): string {
  let source: string = value?.trim();

  if (!source || source.startsWith("#")) {
    return;
  }

  if (source.startsWith("//")) {
    source = `${
      typeof location !== "undefined" && location.protocol
        ? location.protocol
        : "https:"
    }${source}`;
  } else if (baseURL && !CLIPBOARD_IMAGE_SCHEME_PATTERN.test(source)) {
    try {
      source = new URL(source, baseURL).toString();
    } catch {
      return;
    }
  }

  return CLIPBOARD_IMAGE_URL_PATTERN.test(source) ? source : undefined;
}

/** Extract image URLs from HTML/plain-text clipboard representations. */
function appendClipboardImageSources(
  sources: string[],
  textHTML: string,
  textPlain: string
): void {
  const sourceCount: number = sources.length;
  const addSource = (value: string, baseURL?: string): void => {
    const source: string = normalizeClipboardImageSource(value, baseURL);

    if (source && !sources.includes(source)) {
      sources.push(source);
    }
  };

  if (textHTML && CLIPBOARD_IMAGE_MARKER_PATTERN.test(textHTML)) {
    try {
      const parsedHTML: Document =
        typeof DOMParser !== "undefined"
          ? new DOMParser().parseFromString(textHTML, "text/html")
          : undefined;
      const baseURL: string =
        parsedHTML?.querySelector("base")?.href ??
        (typeof document !== "undefined" ? document.baseURI : undefined);

      if (parsedHTML) {
        parsedHTML.querySelectorAll("img").forEach((image) => {
          addSource(image.getAttribute("src"), baseURL);
          addSource(image.getAttribute("data-src"), baseURL);
          addSource(image.getAttribute("data-original"), baseURL);

          const srcSet: string = image.getAttribute("srcset");
          if (srcSet) {
            addSource(srcSet.trim().split(SVG_WHITESPACE_PATTERN)[0], baseURL);
          }
        });
      }
    } catch {
      // Fall back to the lightweight parser below when DOMParser is unavailable.
    }

    if (sources.length === sourceCount) {
      let imageTagMatch: RegExpExecArray;

      while ((imageTagMatch = CLIPBOARD_IMAGE_TAG_PATTERN.exec(textHTML))) {
        const sourceMatch: RegExpExecArray =
          CLIPBOARD_IMAGE_ATTRIBUTE_PATTERN.exec(imageTagMatch[0]);
        addSource(sourceMatch?.[1] ?? sourceMatch?.[2] ?? sourceMatch?.[3]);
      }
    }
  }

  // Some browsers expose only the copied image URL as text/plain.
  if (
    sources.length === sourceCount &&
    textPlain &&
    !textPlain.includes("\n")
  ) {
    addSource(textPlain);
  }
}

/**
 * Read text and images from one clipboard snapshot.
 *
 * Native paste events are read synchronously from `clipboardData`. For a
 * programmatic paste, `navigator.clipboard.read()` is invoked once; image
 * blobs are preferred and HTML is parsed only when no image blob is present.
 * `readText()` is used only when the richer read API is unavailable.
 *
 * @param event - Optional native paste event.
 * @returns Plain text and image blobs from the same clipboard snapshot.
 */
export async function getClipboardContent(
  event?: ClipboardEvent
): Promise<ClipboardContent> {
  const content: ClipboardContent = {
    textPlain: "",
    imageBlobs: [],
    imageSources: [],
  };

  try {
    if (event?.clipboardData) {
      content.textPlain = event.clipboardData.getData("text/plain");

      if (event.clipboardData.files?.length) {
        for (const file of event.clipboardData.files) {
          if (file.type.startsWith("image/")) {
            content.imageBlobs.push(file);
          }
        }
      }

      if (!content.imageBlobs.length && event.clipboardData.items?.length) {
        for (const item of event.clipboardData.items) {
          if (!item.type.startsWith("image/")) {
            continue;
          }

          const image: File = item.getAsFile();

          if (image) {
            content.imageBlobs.push(image);

            break;
          }
        }
      }

      if (!content.imageBlobs.length) {
        appendClipboardImageSources(
          content.imageSources,
          event.clipboardData.getData("text/html"),
          content.textPlain
        );
      }

      // Keep native paste handling synchronous. If the browser exposes a
      // richer image Blob only through navigator.clipboard, pasteShapes will
      // request it only after direct data/HTML loading fails.
      return content;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return content;
    }

    if (navigator.clipboard.read) {
      const items: ClipboardItems = await navigator.clipboard.read();
      const hasImageType: boolean = items.some((item) => {
        return item.types.some((type) => {
          return type.startsWith("image/");
        });
      });

      for (const item of items) {
        const plainTextType: string = item.types.find((type) => {
          return type === "text/plain";
        });

        const htmlType: string = item.types.find((type) => {
          return type === "text/html";
        });

        const imageType: string = item.types.find((type) => {
          return type.startsWith("image/");
        });

        if (!content.textPlain && plainTextType) {
          content.textPlain = await (await item.getType(plainTextType)).text();
        }

        if (htmlType && !hasImageType) {
          const textHTML: string = await (await item.getType(htmlType)).text();

          appendClipboardImageSources(
            content.imageSources,
            textHTML,
            content.textPlain
          );
        }

        if (imageType) {
          content.imageBlobs.push(await item.getType(imageType));
        }
      }

      return content;
    }

    if (navigator.clipboard.readText) {
      content.textPlain = await navigator.clipboard.readText();
    }

    appendClipboardImageSources(content.imageSources, "", content.textPlain);

    return content;
  } catch (error) {
    console.error("Error reading clipboard content:", error);

    // Some browsers expose `readText()` while denying the richer `read()`
    // permission. Keep text-based editor payloads (including cross-tab image
    // payloads) pasteable in that case.
    if (
      !event?.clipboardData &&
      typeof navigator !== "undefined" &&
      navigator.clipboard?.readText
    ) {
      try {
        content.textPlain = await navigator.clipboard.readText();
        appendClipboardImageSources(
          content.imageSources,
          "",
          content.textPlain
        );
      } catch {
        // Return the content collected before the permission failure.
      }
    }

    return content;
  }
}

/**
 * Check if the clipboard contains image data.
 * @param e Optional paste event; omitted uses the asynchronous Clipboard API.
 * @returns true when at least one image MIME item/source is available.
 *
 * @example
 * ```ts
 * await hasImageInClipboard(event); // true when an image is available
 * ```
 */
export async function hasImageInClipboard(
  e?: ClipboardEvent
): Promise<boolean> {
  try {
    const mime: string = "image/";

    if (e?.clipboardData) {
      if (e.clipboardData.files?.length) {
        for (const file of e.clipboardData.files) {
          if (file.type.startsWith(mime)) {
            return true;
          }
        }

        return false;
      }

      if (e.clipboardData.items?.length) {
        for (const item of e.clipboardData.items) {
          if (item.type.startsWith(mime)) {
            return true;
          }
        }

        return false;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.read) {
      return (await navigator.clipboard.read()).some((item) => {
        return item.types.some((type) => {
          return type.startsWith(mime);
        });
      });
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if the clipboard contains plain text.
 * @param e Optional paste event; omitted uses the asynchronous Clipboard API.
 * @returns true when plain text is available.
 *
 * @example
 * ```ts
 * await hasTextPlainInClipboard(event); // true when text is available
 * ```
 */
export async function hasTextPlainInClipboard(
  e?: ClipboardEvent
): Promise<boolean> {
  try {
    const mime: string = "text/plain";

    if (e?.clipboardData?.getData) {
      if (e.clipboardData.getData(mime)) {
        return true;
      }
    }

    if (navigator.clipboard?.readText) {
      if (await navigator.clipboard.readText()) {
        return true;
      }

      if (navigator.clipboard.read) {
        return (await navigator.clipboard.read()).some((item) => {
          return item.types.some((type) => {
            return type === mime;
          });
        });
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Write plain text to a native clipboard event or the asynchronous Clipboard API.
 *
 * A native event is preferred because `clipboardData.setData` is synchronous,
 * standards-based, and retains the browser's user activation. Programmatic
 * actions such as a context-menu button fall back to `navigator.clipboard`.
 *
 * @param {string} text Text to copy.
 * @param {ClipboardEvent} event Optional native copy/cut event.
 * @returns {Promise<boolean>} True when the text was written successfully.
 *
 * @example
 * ```ts
 * await addTextPlainToClipboard("Copied text"); // writes "Copied text" to navigator.clipboard when supported.
 * ```
 */
export async function addTextPlainToClipboard(
  text: string,
  event?: ClipboardEvent
): Promise<boolean> {
  if (event?.clipboardData) {
    event.clipboardData.setData("text/plain", text);

    event.preventDefault();

    return true;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);

      return true;
    } catch (error) {
      console.error("Error writing plain text to clipboard:", error);

      return false;
    }
  }

  return false;
}

/**
 * Get image blobs from a DataTransfer object.
 * @param {React.DragEvent} e Drag event
 * @returns {Promise<Blob[]>} Image blobs
 *
 * @example
 * ```ts
 * await getImageBlobsFromDataTransfer(event); // image blobs from dropped files/items, or []
 * ```
 */
export async function getImageBlobsFromDataTransfer(
  e: DataTransferEvent
): Promise<Blob[]> {
  try {
    const mime: string = "image/";

    const blobs: Blob[] = [];

    if (e.dataTransfer) {
      if (e.dataTransfer.files?.length) {
        for (const file of e.dataTransfer.files) {
          if (file.type.startsWith(mime)) {
            blobs.push(file);
          }
        }
      }

      if (!blobs.length && e.dataTransfer.items?.length) {
        for (const item of e.dataTransfer.items) {
          if (item.type.startsWith(mime)) {
            const blob: File = item.getAsFile();
            if (blob) {
              blobs.push(blob);
            }
          }
        }
      }
    }

    return blobs;
  } catch (error) {
    console.error("Error getting image blobs from data transfer:", error);

    return [];
  }
}

/**
 * Get plain text from a DataTransfer object.
 * @param {React.DragEvent} e Drag event
 * @returns {Promise<string>} Plain text
 *
 * @example
 * ```ts
 * await getTextPlainFromDataTransfer(event); // dropped "text/plain" data, or ""
 * ```
 */
export async function getTextPlainFromDataTransfer(
  e: DataTransferEvent
): Promise<string> {
  try {
    const mime: string = "text/plain";

    let plainText: string = "";

    if (e.dataTransfer) {
      if (e.dataTransfer.getData) {
        plainText = e.dataTransfer.getData(mime);
      }

      if (!plainText && e.dataTransfer.items?.length) {
        for (const item of e.dataTransfer.items) {
          if (item.type === mime) {
            const blob: File = item.getAsFile();
            if (blob) {
              plainText = await blob.text();

              break;
            }
          }
        }
      }
    }

    return plainText;
  } catch (error) {
    console.error("Error getting plain text from data transfer:", error);

    return "";
  }
}

/**
 * Write plain text to a DataTransfer object.
 * @param {React.DragEvent} e Drag event
 * @param {string} text Text to copy
 * @returns {boolean} True when the text was written successfully
 *
 * @example
 * ```ts
 * addTextPlainToDataTransfer("Dragged text", event); // stores "Dragged text" under the "text/plain" data type.
 * ```
 */
export function addTextPlainToDataTransfer(
  text: string,
  e: DataTransferEvent
): boolean {
  try {
    if (e.dataTransfer?.setData) {
      e.dataTransfer.setData("text/plain", text);

      return true;
    }
  } catch (error) {
    console.error("Error writing plain text to data transfer:", error);

    return false;
  }
}
