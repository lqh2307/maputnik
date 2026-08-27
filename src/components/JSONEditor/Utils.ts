import { isArray, isRecord, JSONValue } from "../../utils/Object";

export type JSONStats = {
  nodes: number;
  containers: number;
};

/**
 * Count nodes and container nodes in a JSON value.
 * @param value JSON value to traverse recursively.
 * @returns Node count and the subset representing arrays/objects.
 */
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

/**
 * Resolve the syntax-highlight color for a JSON value.
 * @param value JSON value whose primitive/container type determines the color.
 * @returns CSS color string used by the JSON editor.
 */
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

/**
 * Add line and column information to a JSON parse error when available.
 * @param error Error thrown by `JSON.parse`.
 * @param source Original JSON text used to calculate the position.
 * @returns Error message with a one-based line and column suffix when possible.
 */
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

/**
 * Normalize an arbitrary thrown value into an `Error` instance.
 * @param error Thrown value, which may not itself be an `Error`.
 * @returns Existing error or a new error containing the value's string form.
 */
export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Build a compact label for a JSON value.
 * @param value JSON value to describe.
 * @returns `Array(n)`, `Object(n)`, `null`, or the primitive type name.
 */
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
