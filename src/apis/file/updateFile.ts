import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { getFileExt } from "../../utils/File";
import { UpdateFileOption } from "./Types";
import { AxiosResponse } from "axios";
import FormData from "form-data";

/**
 * Replace the content and optional metadata of a stored file.
 *
 * @param options Replacement file payload and request settings.
 * @returns The response returned by the file service.
 */
export async function updateFile(
  options: UpdateFileOption
): Promise<AxiosResponse> {
  const fileName: string = options.fileName;

  const form: FormData = new FormData();
  form.append("file", options.blob, fileName);
  form.append("format", options.format ?? getFileExt(fileName));

  return await requestToURL({
    method: "PUT",
    url: `${IMAGE_STORAGE_URL}/files/${options.id}`,
    body: form,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
