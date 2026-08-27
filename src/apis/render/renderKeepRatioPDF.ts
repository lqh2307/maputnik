import { DEFAULT_REQUEST_TIMEOUT, IMAGE_PROCESS_URL } from "../../configs";
import { RenderKeepRatioPDFOption } from "./Types";
import { requestToURL } from "../../utils/Request";
import { AxiosResponse } from "axios";

/**
 * Render images into a scale-preserving PDF.
 *
 * @param options PDF source images and output settings.
 * @returns The response containing the rendered PDF.
 */
export async function renderKeepRatioPDF(
  options: RenderKeepRatioPDFOption
): Promise<AxiosResponse> {
  const { controller, ...option }: RenderKeepRatioPDFOption = options;

  return await requestToURL({
    method: "POST",
    url: `${IMAGE_PROCESS_URL}/renders/high-quality-pdf`,
    body: option,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: controller?.signal,
  });
}
