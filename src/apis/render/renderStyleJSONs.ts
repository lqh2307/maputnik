import { DEFAULT_REQUEST_TIMEOUT, IMAGE_PROCESS_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { RenderStyleJSONsOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Render multiple MapLibre style overlays to images.
 *
 * @param options Map style overlays and request settings.
 * @returns The response containing the rendered map images.
 */
export async function renderStyleJSONs(
  options: RenderStyleJSONsOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "POST",
    url: `${IMAGE_PROCESS_URL}/renders/stylejsons`,
    body: options.overlays,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
