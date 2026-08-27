import { DEFAULT_REQUEST_TIMEOUT, IMAGE_PROCESS_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { RenderSVGsOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Rasterize multiple SVG overlays.
 *
 * @param options SVG overlays and request settings.
 * @returns The response containing the rasterized overlays.
 */
export async function renderSVGs(
  options: RenderSVGsOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "POST",
    url: `${IMAGE_PROCESS_URL}/renders/svgs`,
    body: options.overlays,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
