import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { CreateReportOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Create a report record in the report service.
 *
 * @param options Report metadata and request settings.
 * @returns The response returned by the report service.
 */
export async function createReport(
  options: CreateReportOption
): Promise<AxiosResponse> {
  const { controller, ...option }: CreateReportOption = options;

  return await requestToURL({
    method: "POST",
    url: `${IMAGE_STORAGE_URL}/reports`,
    body: option,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: controller?.signal,
  });
}
