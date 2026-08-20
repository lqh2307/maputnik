/** Options for loading an icon catalogue. */
export type GetIconsOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;

  /** Icon catalogue to load. */
  type: "basic" | "military";

  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
