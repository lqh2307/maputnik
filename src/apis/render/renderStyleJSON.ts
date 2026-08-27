import { DEFAULT_REQUEST_TIMEOUT, IMAGE_PROCESS_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { RenderStyleJSONOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Render one MapLibre style definition to an image.
 *
 * @param options Map style and output settings.
 * @returns The response containing the rendered map image.
 */
export async function renderStyleJSON(
  options: RenderStyleJSONOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "POST",
    url: `${IMAGE_PROCESS_URL}/renders/stylejson`,
    body: options,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
