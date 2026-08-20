import axios, { AxiosResponse, isCancel } from "axios";
import { StatusCodes } from "http-status-codes";
import { RequestToURLOption } from "./Types";

/**
 * Check if a string is a URL (blob, data, http, or https).
 * @param {string} data Input string
 * @returns {boolean} True if the string is a URL, false otherwise
 *
 * @example
 * ```ts
 * isURL("value"); // true when the condition is satisfied, otherwise false.
 * ```
 */
export function isURL(data: string): boolean {
  if (
    data.startsWith("blob:") ||
    data.startsWith("data:") ||
    data.startsWith("http")
  ) {
    return true;
  }

  return false;
}

/**
 * Abort an HTTP request and optionally create a new AbortController.
 * @param {AbortController} controller Controller to abort
 * @param {boolean} create If true, create and return a new controller
 * @returns {AbortController} New controller when `create` is true
 *
 * @example
 * ```ts
 * abortRequest(controller, false); // New controller when `create` is true
 * ```
 */
export function abortRequest(
  controller: AbortController,
  create?: boolean
): AbortController {
  if (controller) {
    controller.abort();
  }

  if (create) {
    return new AbortController();
  }
}

/** Throw a standard abort error when a cancellable operation was aborted. */
export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }
}

/**
 * Make an HTTP request with axios and validate the response.
 * @param {RequestToURLOption} options Request options
 * @returns {Promise<AxiosResponse>} Axios response
 * @throws Error with `statusCode` if status is outside 200-299 (excluding 204)
 *
 * @example
 * ```ts
 * await requestToURL({}); // resolves to Axios response.
 * ```
 */
export async function requestToURL(
  options: RequestToURLOption
): Promise<AxiosResponse> {
  try {
    return await axios({
      method: options.method,
      url: options.url,
      timeout: options.timeout,
      responseType: options.responseType,
      headers: options.headers,
      data: options.body,
      signal: options.signal,
      decompress: options.decompress,
      validateStatus: (status) => {
        return (
          StatusCodes.OK <= status &&
          status < StatusCodes.MULTIPLE_CHOICES &&
          status !== StatusCodes.NO_CONTENT
        );
      },
    });
  } catch (error: any) {
    if (isCancel(error)) {
      throw error;
    }

    console.error("Error making HTTP request:", error);

    if (error.response) {
      error.message = `Status code: ${error.response.status} - ${error.response.statusText}`;
      error.statusCode = error.response.status;
    } else if (error.request) {
      error.message = "No response received";
    }

    throw error;
  }
}
