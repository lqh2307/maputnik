import { requestToURL } from "../../utils/Request";
import { IMAGE_STORAGE_URL } from "../../configs";
import { DEFAULT_TIMEOUT } from "./constants";
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
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    signal: options.controller?.signal,
  });
}
