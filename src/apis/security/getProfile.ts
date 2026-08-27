import { DEFAULT_REQUEST_TIMEOUT, SECURITY_URL } from "../../configs";
import { GetProfileOption, UserProfile } from "./Types";
import { requestToURL } from "../../utils/Request";
import { AxiosResponse } from "axios";

/**
 * Retrieve current user profile from security service.
 *
 * @param options Profile request options and cancellation settings.
 * @param token Optional bearer token.
 * @returns The response containing user profile data.
 */
export async function getProfile(
  options: GetProfileOption = {},
  token?: string
): Promise<AxiosResponse<UserProfile>> {
  return requestToURL({
    method: "GET",
    url: `${SECURITY_URL}/profile`,
    headers: {
      Accept: "application/json",
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
