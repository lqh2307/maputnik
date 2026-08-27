import { DEFAULT_REQUEST_TIMEOUT } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { GetIconsOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Load the requested icon catalogue from bundled assets.
 *
 * @param options Icon catalogue and request settings.
 * @returns The HTTP response containing the icon catalogue.
 */
export async function getIcons(
  options: GetIconsOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "GET",
    url: `./assets/icons/${options.type}.json`,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
