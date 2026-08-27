import { AxiosResponse } from "axios";
import { requestToURL } from "../../utils/Request";
import { DEFAULT_REQUEST_TIMEOUT } from "../../configs";
import { GetOnLandEventOption, OnLandEvent } from "./Types";

/**
 * Fetch on-land events from the catalog service.
 *
 * @param options Cancellation settings.
 * @param token Optional bearer token for the catalog service.
 * @returns The response containing on-land event data.
 */
export async function getOnLandEvent(
  options: GetOnLandEventOption = {},
  token?: string
): Promise<AxiosResponse<OnLandEvent[] | Record<string, unknown>>> {
  return requestToURL({
    method: "GET",
    url: "https://release.c4i.vn/catalog/on-land-event",
    headers: {
      Accept: "application/json, text/plain, */*",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    signal: options.controller?.signal,
  });
}
