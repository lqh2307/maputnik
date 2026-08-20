import { Size } from "../../types/Common";

/** Image metadata persisted by the image service. */
export type Image = {
  /** Unique image identifier. */
  id?: string;
  /** Display name of the image. */
  name?: string;
  /** Pixel dimensions as `[width, height]`. */
  resolution?: Size;
  /** Identifier of the underlying stored file. */
  file_id?: string;
};

/** Parameters for deleting an image. */
export type DeleteImageOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Identifier of the image to delete. */
  id: string;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Payload for creating an image record. */
export type CreateImageOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Optional client-provided image identifier. */
  id?: string;
  /** Display name of the image. */
  name: string;
  /** Pixel dimensions as `[width, height]`. */
  resolution?: Size;
  /** Identifier of the uploaded source file. */
  file_id: string;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Paging, sorting, and filtering parameters for image search. */
export type SearchImageOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Whether results are ordered by most recently updated first. */
  desc?: boolean;
  /** Maximum number of results per page. */
  size?: number;
  /** Zero-based page number. */
  page?: number;
  /** Optional image identifier filter. */
  id?: string;
  /** Optional image name filter. */
  name?: string;
  /** Optional pixel-dimension filter. */
  resolution?: Size;
  /** Optional stored-file identifier filter. */
  file_id?: string;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
