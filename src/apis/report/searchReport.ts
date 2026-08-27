import { DEFAULT_REQUEST_TIMEOUT, IMAGE_STORAGE_URL } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { SearchReportOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Search report records with optional paging, sorting, and filters.
 *
 * @param options Search criteria and request settings.
 * @returns The response containing the matching reports.
 */
export async function searchReport(
  options: SearchReportOption
): Promise<AxiosResponse> {
  const { desc, controller, size, page, ...filters }: SearchReportOption =
    options;

  let url = `${IMAGE_STORAGE_URL}/reports/search?page[size]=${size ?? 9999}&page[page]=${page ?? 0}`;

  for (const field in filters) {
    url += `&filter[${field}]=${filters[field]}`;
  }

  if (desc) {
    url += "&sort=-updated_at";
  }

  return await requestToURL({
    method: "GET",
    url,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: controller?.signal,
  });
}
