import { JSONPath, JSONValue, ParseStringJSON, ParseStringXML } from "./Types";

/**
 * Deep clone a JSON-serializable value via JSON stringify/parse.
 * Note: drops functions, `undefined`, `Date`, `Map`, `Set`, `BigInt`, and
 * loses prototypes. Only use for plain data objects/arrays.
 * @param {any} obj Input value to clone
 * @returns {any} Deeply cloned value, or `undefined`
 *
 * @example
 * ```ts
 * deepClone(undefined); // Deeply cloned value, or `undefined`
 * ```
 */
export function deepClone(obj?: any): any {
  if (obj !== undefined) {
    return JSON.parse(JSON.stringify(obj));
  }
}

/**
 * Create a new object with properties updated from `updates`.
 * Does not mutate the original object.
 * @param {any} obj Source object
 * @param {any} updates Partial object to merge in
 * @param {boolean} isDeepClone If true, deep clone `obj` before merging
 * @returns {any} New object containing merged properties
 *
 * @example
 * ```ts
 * updateObjects(undefined, undefined, false); // New object containing merged properties
 * ```
 */
export function updateObjects(
  obj: any,
  updates: any,
  isDeepClone: boolean
): any {
  const newObj: any = isDeepClone
    ? deepClone(obj)
    : {
        ...obj,
      };

  Object.assign(newObj, updates);

  return newObj;
}

/**
 * Assign specified keys from `source` to `target` if they exist in `source`.
 * @param {any} target The object to assign properties to (mutated in place)
 * @param {any} source The object to copy properties from
 * @param {string[]} omitKeys An array of keys to omit from `source` when assigning to `target`
 * @returns {any} The updated `target` object
 *
 * @example
 * ```ts
 * assignObject(undefined, undefined, "value"); // The updated `target` object
 * ```
 */
export function assignObject(
  target: any,
  source: any,
  omitKeys: string[]
): any {
  if (!target || !source) {
    return target;
  }

  const keysSet: Set<string> = new Set(omitKeys);

  for (const key in source) {
    if (!keysSet.has(key)) {
      target[key] = source[key];
    }
  }

  return target;
}

/**
 * Create a new array with values at specified indices replaced.
 * Indices outside the array bounds are ignored.
 * @param {any} arr Source array
 * @param {number[]} indexs Indices to update
 * @param {any} values Values to assign (values[i] -> arr[indexs[i]])
 * @param {boolean} isDeepClone If true, deep clone `arr` before updating
 * @returns {any} New array with updated values (does not modify original)
 *
 * @example
 * ```ts
 * updateArrays(undefined, 0, undefined, false); // New array with updated values (does not modify original)
 * ```
 */
export function updateArrays(
  arr: any,
  indexs: number[],
  values: any,
  isDeepClone: boolean
): any {
  const newArr: any = isDeepClone ? deepClone(arr) : [...arr];

  indexs.forEach((index) => {
    return (newArr[index] = values[index]);
  });

  return newArr;
}

/**
 * Return elements from `arr1` that are not present in `arr2`.
 * @param {string[]} arr1 Primary array
 * @param {string[]} arr2 Exclusion array
 * @param {boolean} emptyAsUndefined If true, return `undefined` when no differences
 * @returns {string[]} Difference array or `undefined` when empty and `emptyAsUndefined` is true
 *
 * @example
 * ```ts
 * differenceArray("value", "value", false); // Difference array or `undefined` when empty and `emptyAsUndefined` is true
 * ```
 */
export function differenceArray(
  arr1: string[],
  arr2: string[],
  emptyAsUndefined: boolean
): string[] {
  const arr2Set: Set<string> = new Set(arr2);
  const result: string[] = [];

  arr1.forEach((item) => {
    if (!arr2Set.has(item)) {
      result.push(item);
    }
  });

  if (result.length) {
    return result;
  }

  return emptyAsUndefined ? undefined : result;
}

/**
 * Remove items that appear in `arr2` from a nested array structure.
 * Input may be a string, an array of strings, or nested arrays of strings.
 * If removals empty a nested array, it is collapsed/removed:
 * - Empty array -> `undefined`
 * - Single item array -> that item
 * @param {any} arr1 Nested array structure
 * @param {any} arr2 Values to remove
 * @returns {any} Updated structure after removals (may be string, array, or `undefined`)
 *
 * @example
 * ```ts
 * removeNestedArrayItems(undefined, undefined); // Updated structure after removals (may be string, array, or `undefined`)
 * ```
 */
export function removeNestedArrayItems(arr1: any, arr2: any): any {
  const removeSet: Set<any> = new Set(arr2);

  /** Remove matching leaves recursively and collapse empty/single-item arrays. */
  function helper(node: any): any {
    // leaf
    if (!isArray(node)) {
      return removeSet.has(node) ? undefined : node;
    }

    let result: any;

    for (let i = 0; i < node.length; i++) {
      const oldItem: any = node[i];
      const newItem: any = helper(oldItem);

      // chưa có thay đổi
      if (!result) {
        if (newItem !== oldItem) {
          result = node.slice(0, i);

          if (newItem !== undefined) {
            result.push(newItem);
          }
        }
      } else {
        if (newItem !== undefined) {
          result.push(newItem);
        }
      }
    }

    // không đổi → return original
    if (result === undefined) {
      return node;
    }

    // collapse
    const rlen: number = result.length;
    if (rlen === 0) {
      return;
    } else if (rlen === 1) {
      return result[0];
    }

    return result;
  }

  return helper(arr1);
}

/**
 * Find the index of `target` in a nested array `arr`, and whether it is nested.
 * @param {any} arr A nested array to search through
 * @param {any} target The value to find
 * @returns {{ index: number; isNested: boolean }} An object containing:
 *   - `index`: the index of the first occurrence of `target` in `arr` (or -1 if not found)
 *   - `isNested`: true if `target` is found within a nested array, false if found at top level
 *
 * @example
 * ```ts
 * findNestedArrayItem([1, [2]], 2); // true when the condition is satisfied, otherwise false.
 * ```
 */
export function findNestedArrayItem(
  arr: any,
  target: any
): {
  index: number;
  isNested: boolean;
} {
  /** Return whether `target` occurs anywhere inside a nested array. */
  function hasTarget(arr: any, target: any): boolean {
    if (!isArray(arr)) {
      return false;
    }

    for (const item of arr) {
      if (item === target || (isArray(item) && hasTarget(item, target))) {
        return true;
      }
    }

    return false;
  }

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return {
        index: i,
        isNested: false,
      };
    }

    if (hasTarget(arr[i], target)) {
      return {
        index: i,
        isNested: true,
      };
    }
  }

  return {
    index: -1,
    isNested: false,
  };
}

/**
 * Compare two string arrays.
 * @param {string[]} arr1 First array
 * @param {string[]} arr2 Second array
 * @param {boolean} order If true, compare by order; if false, compare as sets
 * @returns {boolean} True if arrays are equal under the chosen comparison
 *
 * @example
 * ```ts
 * compareArray("value", "value", false); // true when the condition is satisfied, otherwise false.
 * ```
 */
export function compareArray(
  arr1: string[],
  arr2: string[],
  order?: boolean
): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  if (order) {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  } else {
    const setA: Set<string> = new Set(arr1);
    if (setA.size !== arr2.length) {
      return false;
    }

    return arr2.every((item) => {
      return setA.has(item);
    });
  }
}

/**
 * Clear all properties from an object, leaving it empty.
 * @param {any} obj The object to clear (mutated in place)
 * @returns {any} The cleared object (now empty)
 *
 */
export function clearObject(obj: any): any {
  if (!obj) {
    return;
  }

  for (const key in obj) {
    delete obj[key];
  }

  return obj;
}

/**
 * Check if any of the specified fields exist in the object.
 * @param {any} obj The object to check
 * @param {string[]} fields An array of field names to check for
 * @returns {boolean} True if at least one field exists in the object, false otherwise
 *
 * @example
 * ```ts
 * hasAnyFields(undefined, ["value"]); // false
 * ```
 */
export function hasAnyFields(obj: any, fields: string[]): boolean {
  if (!obj) {
    return false;
  }

  return fields.some((field) => {
    return field in obj;
  });
}

/**
 * Check if all of the specified fields exist in the object.
 * @param {any} obj The object to check
 * @param {string[]} fields An array of field names to check for
 * @returns {boolean} True if all fields exist in the object, false otherwise
 *
 * @example
 * ```ts
 * hasAllFields(undefined, ["value"]); // false
 * ```
 */
export function hasAllFields(obj: any, fields: string[]): boolean {
  if (!obj) {
    return false;
  }

  return fields.every((field) => {
    return field in obj;
  });
}

/**
 * Check if the values of the specified fields are equal between two objects.
 * @param {any} obj1 The first object to compare
 * @param {any} obj2 The second object to compare
 * @param {string[]} fields An array of field names to compare
 * @returns {boolean} True if all specified fields have equal values in both objects, false otherwise
 *
 * @example
 * ```ts
 * isEqualFields(undefined, undefined, "value"); // true when the condition is satisfied, otherwise false.
 * ```
 */
export function isEqualFields(obj1: any, obj2: any, fields: string[]): boolean {
  return fields.every((field) => {
    return obj1[field] === obj2[field];
  });
}

/**
 * Remove specified fields from an object.
 * @param {any} obj The object to modify
 * @param {string[]} fields An array of field names to remove
 * @returns {any} The modified object
 *
 * @example
 * ```ts
 * removeFields(undefined, "value"); // The modified object
 * ```
 */
export function removeFields(obj: any, fields: string[]): any {
  for (const key of fields) {
    delete obj[key];
  }

  return obj;
}

/**
 * Pick specified fields from an object.
 * @param {any} obj The object to modify
 * @param {string[]} fields An array of field names to pick
 * @returns {any} The pick object
 *
 * @example
 * ```ts
 * pickFields(undefined, "value"); // The pick object
 * ```
 */
export function pickFields(obj: any, fields: string[]): any {
  const result: any = {};

  for (const key of fields) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Check if the values of the specified fields are different between two objects.
 * @param {any} obj1 The first object to compare
 * @param {any} obj2 The second object to compare
 * @param {string[]} fields An array of field names to compare
 * @returns {boolean} True if any specified field has a different value in the two objects, false otherwise
 *
 * @example
 * ```ts
 * isDifferentFields(undefined, undefined, "value"); // true when the condition is satisfied, otherwise false.
 * ```
 */
export function isDifferentFields(
  obj1: any,
  obj2: any,
  fields: string[]
): boolean {
  return fields.some((field) => {
    return obj1[field] !== obj2[field];
  });
}

/**
 * Parse a JSON string and return the result or a fallback value if parsing fails.
 * @param {string} value The JSON string to parse
 * @param {JSONValue} [fallback] The optional fallback value to return if parsing fails
 * @returns {ParseStringJSON} An object containing the parsed result and an optional error if parsing failed
 *
 * @example
 * ```ts
 * parseStringJSON("value", undefined); // An object containing the parsed result and an optional error if parsing failed
 * ```
 * @param {JSONValue} fallback Input value.
 */
export function parseStringJSON(
  value: string,
  fallback?: JSONValue
): ParseStringJSON {
  try {
    return {
      result: JSON.parse(value),
    };
  } catch (error) {
    return {
      result: fallback,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Parse an XML string and return the document or a fallback value if parsing
 * fails. XML parser errors are returned as `Error` instances, matching
 * `parseStringJSON`.
 * @param {string} value The XML string to parse
 * @param {Document} [fallback] The optional fallback document to return if parsing fails
 * @returns {ParseStringXML} The parsed XML document and an optional parse error
 */
export function parseStringXML(
  value: string,
  fallback?: Document
): ParseStringXML {
  try {
    const result: Document = new DOMParser().parseFromString(
      value,
      "application/xml"
    );
    const parserError: Element = result.querySelector("parsererror");

    if (parserError) {
      throw new Error(parserError.textContent?.trim() || "XML is invalid.");
    }

    return {
      result,
    };
  } catch (error) {
    return {
      result: fallback,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Check if a value is a plain object (i.e., not an array, function, or other type).
 * @param {any} value The value to check
 * @returns {value is Record<string, any>} True if the value is a plain object, false otherwise
 *
 * @example
 * ```ts
 * isRecord(undefined); // True if the value is a plain object, false otherwise
 * ```
 */
export function isRecord(value: any): value is Record<string, any> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

/**
 * Check if a value is an array.
 * @param {any} value The value to check
 * @returns {value is any[]} True if the value is an array, false otherwise
 *
 * @example
 * ```ts
 * isArray(undefined); // True if the value is an array, false otherwise
 * ```
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

const isJSONRecord = (
  value: JSONValue
): value is {
  [key: string]: JSONValue;
} => {
  return Object.prototype.toString.call(value) === "[object Object]";
};

const hasOwnKey = (value: object, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(value, key);
};

const createJSONContainer = (nextSegment: JSONPath[number]): JSONValue => {
  return typeof nextSegment === "number" ? [] : {};
};

/** Encode a JSON path into a collision-free key suitable for maps. */
export const getJSONPathKey = (path: JSONPath): string => {
  return JSON.stringify(path);
};

/** Return the value at a JSON path, or `undefined` when the path is invalid. */
export const getJSONValueAtPath = (
  value: JSONValue,
  path: JSONPath
): JSONValue => {
  let currentValue: JSONValue = value;

  for (const segment of path) {
    if (
      Array.isArray(currentValue) &&
      typeof segment === "number" &&
      segment >= 0 &&
      segment < currentValue.length
    ) {
      currentValue = currentValue[segment];
    } else if (
      isJSONRecord(currentValue) &&
      typeof segment === "string" &&
      hasOwnKey(currentValue, segment)
    ) {
      currentValue = currentValue[segment];
    } else {
      return;
    }
  }

  return currentValue;
};

/**
 * Set a value at a JSON path. By default, only containers on the changed
 * branch are cloned; set `mutable` to true to update those containers in place.
 * Missing intermediate containers are created from the next path segment.
 */
export const setNestedValue = (
  value: any,
  path: JSONPath[number][],
  nextValue: any,
  mutable: boolean = false
): any => {
  if (path.length === 0) {
    return nextValue;
  }

  const [segment, ...remainingPath] = path;

  if (Array.isArray(value) && typeof segment === "number") {
    if (segment < 0 || !Number.isInteger(segment)) {
      return value;
    }

    const currentChild = value[segment];
    const updatedChild = remainingPath.length
      ? setNestedValue(
          currentChild ?? createJSONContainer(remainingPath[0]),
          remainingPath,
          nextValue,
          mutable
        )
      : nextValue;

    if (currentChild === updatedChild && segment in value) {
      return value;
    }

    if (mutable) {
      value[segment] = updatedChild;

      return value;
    }

    const nextArray = [...value];
    nextArray[segment] = updatedChild;

    return nextArray;
  }

  if (!isJSONRecord(value) || typeof segment !== "string") {
    return value;
  }

  const currentChild = value[segment];
  const updatedChild = remainingPath.length
    ? setNestedValue(
        currentChild ?? createJSONContainer(remainingPath[0]),
        remainingPath,
        nextValue,
        mutable
      )
    : nextValue;

  if (currentChild === updatedChild && hasOwnKey(value, segment)) {
    return value;
  }

  if (mutable) {
    value[segment] = updatedChild;

    return value;
  }

  return {
    ...value,
    [segment]: updatedChild,
  };
};

/**
 * Delete the value at a JSON path. By default, only containers on the changed
 * branch are cloned; set `mutable` to true to update those containers in place.
 */
export const deleteNestedValue = (
  value: any,
  path: JSONPath[number][],
  mutable: boolean = false
): any => {
  if (path.length === 0) {
    return value;
  }

  const [segment, ...remainingPath] = path;

  if (Array.isArray(value) && typeof segment === "number") {
    if (segment < 0 || segment >= value.length || !Number.isInteger(segment)) {
      return value;
    }

    if (remainingPath.length === 0) {
      if (mutable) {
        value.splice(segment, 1);

        return value;
      }

      return value.filter((_, index) => {
        return index !== segment;
      });
    }

    const currentChild = value[segment];
    const updatedChild = deleteNestedValue(
      currentChild,
      remainingPath,
      mutable
    );

    if (currentChild === updatedChild) {
      return value;
    }

    if (mutable) {
      value[segment] = updatedChild;

      return value;
    }

    const nextArray = [...value];
    nextArray[segment] = updatedChild;

    return nextArray;
  }

  if (
    !isJSONRecord(value) ||
    typeof segment !== "string" ||
    !hasOwnKey(value, segment)
  ) {
    return value;
  }

  if (remainingPath.length === 0) {
    if (mutable) {
      delete value[segment];

      return value;
    }

    const nextRecord = {
      ...value,
    };
    delete nextRecord[segment];

    return nextRecord;
  }

  const currentChild = value[segment];
  const updatedChild = deleteNestedValue(currentChild, remainingPath, mutable);

  if (currentChild === updatedChild) {
    return value;
  }

  if (mutable) {
    value[segment] = updatedChild;

    return value;
  }

  return {
    ...value,
    [segment]: updatedChild,
  };
};

/** Rename an object key at `parentPath`, preserving key order and values. */
export const renameJSONKeyAtPath = (
  value: JSONValue,
  parentPath: JSONPath,
  oldKey: string,
  newKey: string,
  mutable: boolean = false
): JSONValue => {
  const normalizedKey = newKey.trim();
  const parent = getJSONValueAtPath(value, parentPath);

  if (
    !normalizedKey ||
    oldKey === normalizedKey ||
    !isJSONRecord(parent) ||
    !hasOwnKey(parent, oldKey) ||
    hasOwnKey(parent, normalizedKey)
  ) {
    return value;
  }

  const renamedParent = Object.keys(parent).reduce<{
    [key: string]: JSONValue;
  }>((result, key) => {
    result[key === oldKey ? normalizedKey : key] = parent[key];

    return result;
  }, {});

  if (mutable) {
    Object.keys(parent).forEach((key) => {
      return delete parent[key];
    });
    Object.assign(parent, renamedParent);

    return value;
  }

  return setNestedValue(value, parentPath, renamedParent);
};

/** Add a default child to an array or object at `path`. */
export const addJSONChildAtPath = (
  value: JSONValue,
  path: JSONPath,
  mutable: boolean = false
): JSONValue => {
  const parent = getJSONValueAtPath(value, path);

  if (Array.isArray(parent)) {
    if (mutable) {
      parent.push(null);

      return value;
    }

    return setNestedValue(value, path, [...parent, null]);
  }

  if (!isJSONRecord(parent)) {
    return value;
  }

  let index = 1;
  let key = "newKey";

  while (hasOwnKey(parent, key)) {
    key = `newKey${index}`;
    index += 1;
  }

  if (mutable) {
    parent[key] = "";

    return value;
  }

  return setNestedValue(value, path, {
    ...parent,
    [key]: "",
  });
};

/** Sort object keys recursively while preserving array item order. */
export const sortJSONKeys = (value: JSONValue): JSONValue => {
  if (Array.isArray(value)) {
    return value.map(sortJSONKeys);
  }

  if (isJSONRecord(value)) {
    return Object.keys(value)
      .sort((firstKey, secondKey) => {
        return firstKey.localeCompare(secondKey);
      })
      .reduce<{
        [key: string]: JSONValue;
      }>((sorted, key) => {
        sorted[key] = sortJSONKeys(value[key]);

        return sorted;
      }, {});
  }

  return value;
};

/** Return map entries that expand every object and array in a JSON value. */
export const getExpandedJSONPathKeys = (
  value: JSONValue,
  path: JSONPath = [],
  expanded: Record<string, boolean> = {}
): Record<string, boolean> => {
  if (!Array.isArray(value) && !isJSONRecord(value)) {
    return expanded;
  }

  expanded[getJSONPathKey(path)] = true;

  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      return getExpandedJSONPathKeys(child, [...path, index], expanded);
    });
  } else {
    Object.entries(value).forEach(([key, child]) => {
      return getExpandedJSONPathKeys(child, [...path, key], expanded);
    });
  }

  return expanded;
};

/** Ensure a user-provided filename uses the `.json` extension. */
export const normalizeJSONFileName = (fileName: string): string => {
  return fileName.trim().toLowerCase().endsWith(".json")
    ? fileName.trim()
    : `${fileName.trim() || "data"}.json`;
};

/**
 * Apply default values from `defaults` to `target` for any keys that are undefined in `target`.
 * @param target The target object to apply defaults to
 * @param [defaults] The object containing default values
 * @param [keys] Keys allowed to be copied from `defaults`
 */
export function applyDefaults<T extends Record<string, any>>(
  target: T,
  defaults?: Partial<T>,
  keys?: Array<keyof T | string>
): T {
  if (!defaults) {
    return target;
  }

  for (const key of keys ?? Object.keys(defaults)) {
    const val: any = (defaults as any)[key];

    if (val !== undefined && (target as any)[key] === undefined) {
      (target as any)[key] = val;
    }
  }

  return target;
}

/** Return an existing set or materialize another iterable as a set. */
export function toSet<T>(i: Iterable<T>): Set<T> {
  return i instanceof Set ? i : new Set(i);
}
