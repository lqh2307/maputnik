import { requestToURL } from "../../utils/Request";
import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { DownloadFileOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Download the content of a stored file.
 *
 * @param options File identifier and response settings.
 * @returns The response containing the requested file.
 */
export async function downloadFile(
  options: DownloadFileOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "GET",
    url: `${IMAGE_STORAGE_URL}/files/${options.id}/download`,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
    responseType: options.responseType,
  });
}
