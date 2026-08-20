import { requestToURL } from "../../utils/Request";
import { DEFAULT_TIMEOUT } from "./constants";
import { GetFontsOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Load the bundled font catalogue.
 *
 * @param options Request settings.
 * @returns The response containing the font catalogue.
 */
export async function getFonts(
  options: GetFontsOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "GET",
    url: "./assets/fonts/fonts.json",
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    signal: options.controller?.signal,
  });
}
