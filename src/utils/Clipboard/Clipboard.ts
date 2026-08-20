/** Minimal drag-event shape shared by React and native browser handlers. */
export type DataTransferEvent = {
  dataTransfer?: DataTransfer;
};

/** Area that owns native copy/cut/paste while the pointer is inside it. */
export type ClipboardScope = "shapes" | "tabs";

let activeEditorClipboardScope: ClipboardScope;

/** Mark the editor area currently under the pointer as the clipboard owner. */
export function setClipboardScope(scope: ClipboardScope): void {
  activeEditorClipboardScope = scope;
}

/** Clear a clipboard owner without accidentally clearing a newer owner. */
export function clearClipboardScope(scope: ClipboardScope): void {
  if (activeEditorClipboardScope === scope) {
    activeEditorClipboardScope = undefined;
  }
}

/** Return whether `scope` currently owns editor clipboard shortcuts. */
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

    let blobs: Blob[] = [];

    if (e?.clipboardData) {
      if (e.clipboardData.files?.length) {
        for (const file of Array.from(e.clipboardData.files)) {
          if (file.type.startsWith(mime)) {
            blobs.push(file);
          }
        }
      }

      if (!blobs.length && e.clipboardData.items?.length) {
        for (const item of Array.from(e.clipboardData.items)) {
          if (item.type.startsWith(mime)) {
            const blob: File = item.getAsFile();
            if (blob) {
              blobs.push(blob);
            }
          }
        }
      }
    }

    if (!blobs.length && navigator.clipboard?.read) {
      for (const item of await navigator.clipboard.read()) {
        for (const type of item.types) {
          if (type.startsWith(mime)) {
            blobs.push(await item.getType(type));

            break;
          }
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
};

/**
 * Read text and images from one clipboard snapshot.
 *
 * Native paste events are read synchronously from `clipboardData`. For a
 * programmatic paste, `navigator.clipboard.read()` is invoked once and all
 * supported MIME types are extracted from the returned items. `readText()` is
 * used only when the richer read API is unavailable.
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
  };

  try {
    if (event?.clipboardData) {
      content.textPlain = event.clipboardData.getData("text/plain");

      if (event.clipboardData.files?.length) {
        content.imageBlobs = Array.from(event.clipboardData.files).filter(
          (file) => {
            return file.type.startsWith("image/");
          }
        );
      }

      if (!content.imageBlobs.length && event.clipboardData.items?.length) {
        for (const item of Array.from(event.clipboardData.items)) {
          if (!item.type.startsWith("image/")) {
            continue;
          }

          const image: File = item.getAsFile();

          if (image) {
            content.imageBlobs.push(image);
          }
        }
      }

      return content;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return content;
    }

    if (navigator.clipboard.read) {
      const items: ClipboardItems = await navigator.clipboard.read();

      for (const item of items) {
        for (const type of item.types) {
          if (!content.textPlain && type === "text/plain") {
            content.textPlain = await (await item.getType(type)).text();
          } else if (type.startsWith("image/")) {
            content.imageBlobs.push(await item.getType(type));
          }
        }
      }

      return content;
    }

    if (navigator.clipboard.readText) {
      content.textPlain = await navigator.clipboard.readText();
    }

    return content;
  } catch (error) {
    console.error("Error reading clipboard content:", error);

    return content;
  }
}

/**
 * Check if the clipboard contains image data.
 * @param {ClipboardEvent} e Optional paste event (falls back to Clipboard API)
 * @returns {Promise<boolean>} True if an image exists
 *
 * @example
 * ```ts
 * await hasImageInClipboard(event); // true when the condition is satisfied, otherwise false.
 * ```
 */
export async function hasImageInClipboard(
  e?: ClipboardEvent
): Promise<boolean> {
  try {
    const mime: string = "image/";

    if (e?.clipboardData) {
      if (e.clipboardData.files?.length) {
        return Array.from(e.clipboardData.files).some((file) => {
          return file.type.startsWith(mime);
        });
      }

      if (e.clipboardData.items?.length) {
        return Array.from(e.clipboardData.items).some((item) => {
          return item.type.startsWith(mime);
        });
      }
    }

    if (navigator.clipboard?.read) {
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
 * @param {ClipboardEvent} e Optional paste event (falls back to Clipboard API)
 * @returns {Promise<boolean>} True if text exists
 *
 * @example
 * ```ts
 * await hasTextPlainInClipboard(event); // true when the condition is satisfied, otherwise false.
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

    let blobs: Blob[] = [];

    if (e.dataTransfer) {
      if (e.dataTransfer.files?.length) {
        for (const file of Array.from(e.dataTransfer.files)) {
          if (file.type.startsWith(mime)) {
            blobs.push(file);
          }
        }
      }

      if (!blobs.length && e.dataTransfer.items?.length) {
        for (const item of Array.from(e.dataTransfer.items)) {
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
        for (const item of Array.from(e.dataTransfer.items)) {
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
