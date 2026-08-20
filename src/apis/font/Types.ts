/** Parameters for loading the available font catalogue. */
export type GetFontsOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
