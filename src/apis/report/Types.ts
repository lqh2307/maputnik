/** Report metadata persisted by the report service. */
export type Report = {
  /** Unique report identifier. */
  id?: string;
  /** Display name of the report. */
  name?: string;
  /** Identifier of the file containing the report JSON. */
  json_file_id?: string;
  /** Identifier of the report preview image. */
  image_file_id?: string;
  /** Numeric report kind used by the backend. */
  type?: number;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Payload for creating a report. */
export type CreateReportOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Optional client-provided report identifier. */
  id?: string;
  /** Display name of the new report. */
  name: string;
  /** Identifier of the file containing the report JSON. */
  json_file_id: string;
  /** Identifier of the report preview image. */
  image_file_id?: string;
  /** Numeric report kind used by the backend. */
  type: number;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Payload for updating an existing report. */
export type UpdateReportOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Identifier of the report to update. */
  id: string;
  /** Updated display name. */
  name: string;
  /** Identifier of the updated report JSON file. */
  json_file_id: string;
  /** Identifier of the updated report preview image. */
  image_file_id: string;
  /** Updated numeric report kind. */
  type: number;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Parameters for retrieving a report by identifier. */
export type GetReportOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Identifier of the report to retrieve. */
  id: string;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Parameters for deleting a report. */
export type DeleteReportOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Identifier of the report to delete. */
  id: string;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Paging, sorting, and filtering parameters for report search. */
export type SearchReportOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Whether results are ordered by most recently updated first. */
  desc?: boolean;
  /** Maximum number of results per page. */
  size?: number;
  /** Zero-based page number. */
  page?: number;
  /** Optional report identifier filter. */
  id?: string;
  /** Optional report name filter. */
  name?: string;
  /** Optional report JSON file identifier filter. */
  json_file_id?: string;
  /** Optional report preview image identifier filter. */
  image_file_id?: string;
  /** Optional numeric report kind filter. */
  type?: number;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
