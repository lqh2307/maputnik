import { StoredAccessToken } from "./Types";
import { getValue } from "../LocalStorage";

/** Performs get access token. */
export function getAccessToken(): string {
  try {
    const storedToken = getValue<StoredAccessToken | string>("access_token");

    if (typeof storedToken === "string") {
      return storedToken;
    }

    if (!storedToken?.value) {
      return;
    }

    if (storedToken.expiry && storedToken.expiry <= Date.now()) {
      return;
    }

    return storedToken.value;
  } catch {
    return;
  }
}
