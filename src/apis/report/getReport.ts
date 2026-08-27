import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { GetReportOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Retrieve a report record by identifier.
 *
 * @param options Report identifier and request settings.
 * @returns The response containing the requested report.
 */
export async function getReport(
  options: GetReportOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "GET",
    url: `${IMAGE_STORAGE_URL}/reports/${options.id}`,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
