import { DEFAULT_REQUEST_TIMEOUT, IMAGE_PROCESS_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { AddFrameOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Add a geographic coordinate frame and optional overlays to an image.
 *
 * @param options Frame input, styling, and output settings.
 * @returns The response containing the rendered image.
 */
export async function addFrame(
  options: AddFrameOption
): Promise<AxiosResponse> {
  const { controller, ...option }: AddFrameOption = options;

  return await requestToURL({
    method: "POST",
    url: `${IMAGE_PROCESS_URL}/renders/add-frame`,
    body: option,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: controller?.signal,
  });
}
