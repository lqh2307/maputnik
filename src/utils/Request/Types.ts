import { Method, ResponseType } from "axios";

/** Options used by `requestToURL()` to fetch a resource and convert it into a browser URL. */
export type RequestToURLOption = {
  /** Request URL. */
  url: string;
  /** HTTP method (default is implementation-defined, usually GET). */
  method?: Method;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Optional request body (for POST/PUT/PATCH). */
  body?: object;
  /** Axios response type (e.g., "blob"). */
  responseType?: ResponseType;
  /** Whether decompress. */
  decompress?: boolean;
  /** Additional request headers. */
  headers?: object;
  /** Abort signal to cancel the request. */
  signal?: AbortSignal;
};
