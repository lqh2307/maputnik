import { requestToURL } from "../../utils/Request";
import { IMAGE_STORAGE_URL } from "../../configs";
import { DEFAULT_TIMEOUT } from "./constants";
import { SearchImageOption } from "./Types";
import { AxiosResponse } from "axios";

/**
 * Search image records with optional paging, sorting, and filters.
 *
 * @param options Search criteria and request settings.
 * @returns The response containing the matching images.
 */
export async function searchImage(
  options: SearchImageOption
): Promise<AxiosResponse> {
  const { desc, controller, size, page, ...filters }: SearchImageOption =
    options;

  let url = `${IMAGE_STORAGE_URL}/images/search?page[size]=${size ?? 9999}&page[page]=0${page ?? 0}`;

  for (const field in filters) {
    url += `&filter[${field}]=${filters[field]}`;
  }

  if (desc) {
    url += "&sort=-updated_at";
  }

  return await requestToURL({
    method: "GET",
    url: url,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    signal: controller?.signal,
  });
}
