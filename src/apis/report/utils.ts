/**
 * Convert a report kind name to its backend numeric code.
 *
 * @param str Report kind name.
 * @returns The matching numeric code, or `undefined` for an unknown kind.
 */
export function parseStringToType(str: string): number {
  if (str === "report") {
    return 1;
  } else if (str === "template") {
    return 2;
  } else if (str === "component") {
    return 3;
  }
}

/**
 * Convert a backend report kind code to its name.
 *
 * @param num Backend report kind code.
 * @returns The matching kind name, or `undefined` for an unknown code.
 */
export function parseTypeToString(num: number): string {
  if (num === 1) {
    return "report";
  } else if (num === 2) {
    return "template";
  } else if (num === 3) {
    return "component";
  }
}
