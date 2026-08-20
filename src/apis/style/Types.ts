/** Parameters for retrieving a map style. */
export type GetStyleOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Identifier of the hosted style. */
  id?: string;
  /** Direct style URL, which takes precedence over {@link id}. */
  url?: string;
  /** Whether to request the unprocessed style definition. */
  raw?: boolean;
  /** Whether to request a compressed response. */
  compression?: boolean;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Parameters for retrieving the available map styles. */
export type GetStyleListOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Whether to request a compressed response. */
  compression?: boolean;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
  /** Use fallback */
  useFallback?: boolean;
};

/** Metadata for a style available from the style service. */
export type StyleItem = {
  /** Unique style identifier. */
  id: string;
  /** URL of the style document. */
  url: string;
  /** Display name of the style. */
  name: string;
  /** Optional preview-image URL. */
  thumbnail?: string;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
