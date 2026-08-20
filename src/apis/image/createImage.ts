import { requestToURL } from "../../utils/Request";
import { IMAGE_STORAGE_URL } from "../../configs";
import { DEFAULT_TIMEOUT } from "./constants";
import { CreateImageOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Create an image metadata record for an uploaded file.
 *
 * @param options Image metadata and request settings.
 * @returns The response returned by the image service.
 */
export async function createImage(
  options: CreateImageOption
): Promise<AxiosResponse> {
  const { controller, ...option }: CreateImageOption = options;

  return await requestToURL({
    method: "POST",
    url: `${IMAGE_STORAGE_URL}/images`,
    body: option,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    signal: controller?.signal,
  });
}
