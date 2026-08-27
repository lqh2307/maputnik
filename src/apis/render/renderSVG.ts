import { DEFAULT_REQUEST_TIMEOUT, IMAGE_PROCESS_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { RenderSVGOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Rasterize a single SVG source.
 *
 * @param options SVG source and output settings.
 * @returns The response containing the rasterized SVG.
 */
export async function renderSVG(
  options: RenderSVGOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "POST",
    url: `${IMAGE_PROCESS_URL}/renders/svg`,
    body: options,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
