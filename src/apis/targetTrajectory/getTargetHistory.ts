import { GetTargetHistoryOption, TargetHistoryResponse } from "./Types";
import { DEFAULT_REQUEST_TIMEOUT } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { AxiosResponse } from "axios";

/**
 * Fetch the recorded history for a target over an optional time range.
 *
 * @param options Target identifier, time range, and cancellation settings.
 * @param token Optional bearer token for the trajectory service.
 * @returns The response containing target history data.
 */
export async function getTargetHistory(
  options: GetTargetHistoryOption,
  token?: string
): Promise<AxiosResponse<TargetHistoryResponse>> {
  const query = new URLSearchParams();

  if (options.from !== undefined) {
    query.set("from", String(options.from));
  }

  if (options.to !== undefined) {
    query.set("to", String(options.to));
  }

  return requestToURL({
    method: "GET",
    url: `https://release.c4i.vn/track-manager/history/${options.targetId}?${query}`,
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
