import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { DeleteFileOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Delete a stored file by identifier.
 *
 * @param options File identifier and request settings.
 * @returns The response returned by the file service.
 */
export async function deleteFile(
  options: DeleteFileOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "DELETE",
    url: `${IMAGE_STORAGE_URL}/files/${options.id}`,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
