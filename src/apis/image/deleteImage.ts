import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { DeleteFileOption } from "../file";
import { AxiosResponse } from "axios";

/**
 * Delete an image record by identifier.
 *
 * @param options Image identifier and request settings.
 * @returns The response returned by the image service.
 */
export async function deleteImageList(
  options: DeleteFileOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "DELETE",
    url: `${IMAGE_STORAGE_URL}/images/${options.id}`,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
