import { DEFAULT_REQUEST_TIMEOUT, IMAGE_PROCESS_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { GetStyleOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Retrieve a map style by hosted identifier or direct URL.
 *
 * @param options Style locator and request settings.
 * @returns The response containing the style document.
 */
export async function getStyle(
  options: GetStyleOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "GET",
    url: options.url
      ? options.url
      : `${IMAGE_PROCESS_URL}/styles/${options.id}/style.json?raw=${options.raw ?? "false"}&compression=${options.compression ?? "false"}`,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
