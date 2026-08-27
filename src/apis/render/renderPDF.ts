import { DEFAULT_REQUEST_TIMEOUT, IMAGE_PROCESS_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { RenderPDFOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Render images into a PDF with the requested grid and output settings.
 *
 * @param options PDF source images and output settings.
 * @returns The response containing the rendered PDF.
 */
export async function renderPDF(
  options: RenderPDFOption
): Promise<AxiosResponse> {
  const { controller, ...option }: RenderPDFOption = options;

  return await requestToURL({
    method: "POST",
    url: `${IMAGE_PROCESS_URL}/renders/pdf`,
    body: option,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: controller?.signal,
  });
}
