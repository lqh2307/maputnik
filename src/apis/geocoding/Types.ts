/** A longitude/latitude pair returned by MapTiler. */
export type GeocodingCoordinates = [number, number];

/** Minimal GeoJSON geometry shape needed to focus the map. */
export type GeocodingGeometry = {
  type?: string;
  coordinates?: number[];
};

/** MapTiler forward-geocoding feature fields used by the editor. */
export type GeocodingFeature = {
  id?: string;
  type?: string;
  center?: GeocodingCoordinates;
  place_name?: string;
  text?: string;
  geometry?: GeocodingGeometry;
};

/** MapTiler forward-geocoding response. */
export type GeocodingResponse = {
  type?: string;
  features?: GeocodingFeature[];
};

/** Options for a MapTiler forward-geocoding request. */
export type SearchGeocodingOption = {
  /** Text to search for. */
  query: string;
  /** Optional MapTiler key override, useful for callers and tests. */
  key?: string;
  /** Preferred ISO 639-1 result language. */
  language?: string;
  /** Maximum number of suggestions. */
  limit?: number;
  /** Bias results toward the caller's IP location or a coordinate pair. */
  proximity?: "ip" | GeocodingCoordinates;
  /** Enable typo-tolerant matching. */
  fuzzyMatch?: boolean;
  /** Optional MapTiler session identifier. */
  mtsid?: string;
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
