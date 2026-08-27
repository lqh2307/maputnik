import { GetTargetTrajectoryOption, Track } from "./Types";
import { DEFAULT_REQUEST_TIMEOUT } from "../../configs";
import { requestToURL } from "../../utils/Request";
import { AxiosResponse } from "axios";

/**
 * Fetch target trajectory snapshots over an optional time range.
 *
 * @param options Time range and cancellation settings.
 * @param token Optional bearer token for the trajectory service.
 * @returns The response containing target tracks.
 */
export async function getTargetTrajectory(
  options: GetTargetTrajectoryOption,
  token?: string
): Promise<AxiosResponse<Track[]>> {
  const query = new URLSearchParams();

  if (options.from !== undefined) {
    query.set("from", String(options.from));
  }
  if (options.to !== undefined) {
    query.set("to", String(options.to));
  }

  return requestToURL({
    method: "POST",
    url: `https://release.c4i.vn/replay-track/replay/track/static?${query}`,
    headers: {
      Accept: "application/json, text/plain",
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
