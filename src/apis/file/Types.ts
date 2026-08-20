import { Format } from "../../types/Common";
import { ResponseType } from "axios";

/** Parameters for downloading a stored file. */
export type DownloadFileOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Identifier of the file to download. */
  id: string;
  /** Axios response body format. */
  responseType?: ResponseType;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Parameters for deleting a stored file. */
export type DeleteFileOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Identifier of the file to delete. */
  id: string;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Payload for uploading a new file. */
export type UploadFileOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Optional client-provided file identifier. */
  id?: string;
  /** Binary content to upload. */
  blob: Blob;
  /** Name assigned to the uploaded file. */
  fileName: string;
  /** Optional declared file format. */
  format?: Format;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Payload for replacing an existing stored file. */
export type UpdateFileOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Identifier of the file to replace. */
  id: string;
  /** Replacement binary content. */
  blob: Blob;
  /** Optional replacement file name. */
  fileName?: string;
  /** Optional declared file format. */
  format?: Format;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
