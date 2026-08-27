import { DEFAULT_REQUEST_TIMEOUT, SECURITY_URL } from "../../configs";
import { GetUserOption, UserDetail } from "./Types";
import { requestToURL } from "../../utils/Request";
import { AxiosResponse } from "axios";

/**
 * Retrieve detailed user information by identifier from security service.
 *
 * @param options User request options including user identifier.
 * @param token Optional bearer token.
 * @returns The response containing user details.
 */
export async function getUser(
  options: GetUserOption,
  token?: string
): Promise<AxiosResponse<UserDetail>> {
  return requestToURL({
    method: "GET",
    url: `${SECURITY_URL}/users/${options.id}`,
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
