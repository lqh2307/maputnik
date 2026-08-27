import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { UpdateReportOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Replace an existing report record.
 *
 * @param options Updated report metadata and request settings.
 * @returns The response returned by the report service.
 */
export async function updateReport(
  options: UpdateReportOption
): Promise<AxiosResponse> {
  const { controller, ...option }: UpdateReportOption = options;

  return await requestToURL({
    method: "PUT",
    url: `${IMAGE_STORAGE_URL}/reports/${option.id}`,
    body: option,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: controller?.signal,
  });
}
