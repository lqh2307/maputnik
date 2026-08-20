/** Defines parse string json. */
export type ParseStringJSON = {
  /** Configuration for result. */
  result: JSONValue;
  /** Configuration for error. */
  error?: Error;
};

/** Defines parse string xml. */
export type ParseStringXML = {
  /** Configuration for result. */
  result: Document;
  /** Configuration for error. */
  error?: Error;
};

/** Defines jsonvalue. */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | {
      [key: string]: JSONValue;
    };

/** Defines jsonpath. */
export type JSONPath = (string | number)[];
