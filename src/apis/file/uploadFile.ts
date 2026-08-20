import { requestToURL } from "../../utils/Request";
import { IMAGE_STORAGE_URL } from "../../configs";
import { getFileExt } from "../../utils/File";
import { DEFAULT_TIMEOUT } from "./constants";
import { UploadFileOption } from "./Types";
import { AxiosResponse } from "axios";
import FormData from "form-data";

/**
 * Upload a new file to the file service.
 *
 * @param options File payload and request settings.
 * @returns The response returned by the file service.
 */
export async function uploadFile(
  options: UploadFileOption
): Promise<AxiosResponse> {
  const fileName: string = options.fileName;

  const form: FormData = new FormData();
  form.append("file", options.blob, fileName);
  form.append("format", options.format ?? getFileExt(fileName));

  return await requestToURL({
    method: "POST",
    url: `${IMAGE_STORAGE_URL}/files`,
    body: form,
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    signal: options.controller?.signal,
  });
}
