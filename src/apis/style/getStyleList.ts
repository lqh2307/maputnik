import { requestToURL } from "../../utils/Request";
import { GetStyleListOption } from "./Types";
import { AxiosResponse } from "axios";
import {
  DEFAULT_REQUEST_TIMEOUT,
  IMAGE_PROCESS_URL,
  MAP_STYLES,
} from "../../configs";

/**
 * Retrieve the catalogue of available map styles.
 *
 * @param options Request settings.
 * @returns The response containing the style catalogue.
 */
export async function getStyleList(
  options: GetStyleListOption
): Promise<AxiosResponse> {
  try {
    return await requestToURL({
      method: "GET",
      url: `${IMAGE_PROCESS_URL}/styles/styles.json?compression=${options.compression ?? "false"}`,
      responseType: "json",
      timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
      signal: options.controller?.signal,
    });
  } catch (error) {
    if (!options.useFallback) {
      throw error;
    }

    console.warn("Error fetching styles, use fallback:", error);

    return {
      data: MAP_STYLES,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    } as AxiosResponse;
  }
}
