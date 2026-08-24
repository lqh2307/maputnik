/**
 * Close the current window
 */
export function closeWindow(): void {
  // Browser tabs opened by open can be closed programmatically.
  if (opener && !opener.closed) {
    close();

    return;
  }

  // A tab opened directly from a URL cannot be closed by the page, so return
  // to the page from which the editor was opened instead.
  if (history.length > 1) {
    history.back();
  }
}

/**
 * Toggle fullscreen mode
 * @param isFull - true for fullscreen, false to exit fullscreen
 */
export async function setFullscreen(isFull?: boolean): Promise<void> {
  const elem = document.documentElement;

  try {
    if (isFull) {
      await elem.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  } catch (error) {
    console.error("Failed to toggle fullscreen mode", error);
  }
}
