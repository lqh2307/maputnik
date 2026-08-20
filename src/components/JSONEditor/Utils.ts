import { isArray, isRecord } from "../../utils/Object";
import { JSONValue } from "../../utils/Object";

export type JSONStats = {
  nodes: number;
  containers: number;
};

/** Counts all values and containers in a JSON structure. */
export function getJSONStats(value: JSONValue): JSONStats {
  if (isArray(value)) {
    return value.reduce<JSONStats>(
      (stats, child) => {
        const childStats: JSONStats = getJSONStats(child);

        return {
          nodes: stats.nodes + childStats.nodes,
          containers: stats.containers + childStats.containers,
        };
      },
      {
        nodes: 1,
        containers: 1,
      }
    );
  }

  if (isRecord(value)) {
    return Object.values(value).reduce<JSONStats>(
      (stats, child) => {
        const childStats: JSONStats = getJSONStats(child);

        return {
          nodes: stats.nodes + childStats.nodes,
          containers: stats.containers + childStats.containers,
        };
      },
      {
        nodes: 1,
        containers: 1,
      }
    );
  }

  return {
    nodes: 1,
    containers: 0,
  };
}

/** Returns the editor color associated with a JSON value type. */
export function getJSONValueColor(value: JSONValue): string {
  if (value === null) {
    return "#64748b";
  }

  if (typeof value === "string") {
    return "#b45309";
  }

  if (typeof value === "number") {
    return "#0369a1";
  }

  if (typeof value === "boolean") {
    return "#7c3aed";
  }

  return "#172033";
}

/** Adds line and column information when the JSON parser exposes a position. */
export function getJSONParseErrorMessage(error: Error, source: string): string {
  const position: number = Number(
    error.message.match(/position\s+(\d+)/i)?.[1]
  );

  if (!Number.isFinite(position)) {
    return error.message;
  }

  const beforeError: string = source.slice(0, position);
  const line: number = beforeError.split("\n").length;

  return `${error.message} (line ${line}, column ${position - beforeError.lastIndexOf("\n")})`;
}

/** Normalizes thrown values before forwarding them to error callbacks. */
export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/** Provides value label. */
export function valueLabel(value: JSONValue): string {
  if (isArray(value)) {
    return `Array(${value.length})`;
  }

  if (isRecord(value)) {
    return `Object(${Object.keys(value).length})`;
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}
