import { runtimeTokens } from "../../configs/runtime";
import { requestToURL } from "../../utils/Request";
import { SearchGeocodingOption } from "./Types";
import { AxiosResponse } from "axios";
import {
  MAPTILER_DEFAULT_TOKEN,
  MAPTILER_GEOCODING_URL,
  DEFAULT_TIMEOUT,
} from "../../configs";

/** Returns the configured MapTiler API key, ignoring the demo placeholder. */
export function getMapTilerApiKey(): string | undefined {
  const candidates = [runtimeTokens.maptiler, runtimeTokens.openmaptiles];

  return candidates.find((token) => {
    return Boolean(token && token !== MAPTILER_DEFAULT_TOKEN);
  });
}

/** Search places with MapTiler's public forward-geocoding API. */
export async function searchGeocoding(
  options: SearchGeocodingOption
): Promise<AxiosResponse> {
  const key = options.key ?? getMapTilerApiKey();

  if (!key) {
    throw new Error("MapTiler API key is not configured");
  }

  const query = encodeURIComponent(options.query.trim());
  const params = new URLSearchParams({
    key,
    limit: String(options.limit ?? 5),
    proximity:
      options.proximity === undefined
        ? "ip"
        : Array.isArray(options.proximity)
          ? options.proximity.join(",")
          : options.proximity,
    fuzzyMatch: String(options.fuzzyMatch ?? true),
  });

  if (options.language) {
    params.set("language", options.language);
  }

  if (options.mtsid) {
    params.set("mtsid", options.mtsid);
  }

  return await requestToURL({
    method: "GET",
    url: `${MAPTILER_GEOCODING_URL}/${query}.json?${params.toString()}`,
    responseType: "json",
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    signal: options.controller?.signal,
  });
}
