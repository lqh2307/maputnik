import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { DeleteReportOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Delete a report record by identifier.
 *
 * @param options Report identifier and request settings.
 * @returns The response returned by the report service.
 */
export async function deleteReport(
  options: DeleteReportOption
): Promise<AxiosResponse> {
  return await requestToURL({
    method: "DELETE",
    url: `${IMAGE_STORAGE_URL}/reports/${options.id}`,
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
