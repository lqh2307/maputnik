import { TransformOption } from "./Types";

/**
 * Check if shape has non-zero translation.
 * @param {TransformOption} option Shape options
 * @returns {boolean} True if translated
 *
 * @example
 * ```ts
 * isHasTransition({ x: 10 }); // true
 * ```
 */
export function isHasTransition(option: TransformOption): boolean {
  return Boolean(option.x || option.y);
}

/**
 * Reset translation to (0,0) and optionally apply to a shape.
 * @param {TransformOption} option Shape options
 * @returns {TransformOption} Translation attrs
 *
 * @example
 * ```ts
 * createResetTransition({}); // Translation attrs
 * ```
 */
export function createResetTransition(
  option?: TransformOption
): TransformOption {
  const attrs: TransformOption = {
    x: 0,
    y: 0,
  };

  if (option) {
    Object.assign(option, attrs);
  }

  return attrs;
}

/**
 * Check if shape has non-default scale (ignores sign flip).
 * @param {TransformOption} option Shape options
 * @returns {boolean} True if scale differs from 1 or -1
 *
 * @example
 * ```ts
 * isHasScale({ scaleX: 1.25 }); // true
 * ```
 */
export function isHasScale(option: TransformOption): boolean {
  return (
    (option.scaleX !== undefined && option.scaleX !== 1) ||
    (option.scaleY !== undefined && option.scaleY !== 1)
  );
}

/**
 * Reset scale to 1 (preserves flip sign) and optionally apply to a shape.
 * @param {TransformOption} option Shape options
 * @returns {TransformOption} Scale attrs
 *
 * @example
 * ```ts
 * createResetScale({}); // Scale attrs
 * ```
 */
export function createResetScale(option?: TransformOption): TransformOption {
  const attrs: TransformOption = {
    scaleX: 1,
    scaleY: 1,
  };

  if (option) {
    Object.assign(option, attrs);
  }

  return attrs;
}

/**
 * Check if shape has non-zero skew.
 * @param {TransformOption} option Shape options
 * @returns {boolean} True if skew differs from 0
 *
 * @example
 * ```ts
 * isHasSkew({ skewY: 15 }); // true
 * ```
 */
export function isHasSkew(option: TransformOption): boolean {
  return Boolean(option.skewX || option.skewY);
}

/**
 * Reset skew to 0 and optionally apply to a shape.
 * @param {TransformOption} option Shape options
 * @returns {TransformOption} Skew attrs
 *
 * @example
 * ```ts
 * createResetSkew({}); // Skew attrs
 * ```
 */
export function createResetSkew(option?: TransformOption): TransformOption {
  const attrs: TransformOption = {
    skewX: 0,
    skewY: 0,
  };

  if (option) {
    Object.assign(option, attrs);
  }

  return attrs;
}

/**
 * Check if shape has any non-default transform.
 * @param {TransformOption} option Shape options
 * @returns {boolean} True if transform differs from defaults
 *
 * @example
 * ```ts
 * isHasTransform({ rotation: 45 }); // true
 * ```
 */
export function isHasTransform(option: TransformOption): boolean {
  return Boolean(
    option.x ||
    option.y ||
    (option.scaleX !== undefined && option.scaleX !== 1) ||
    (option.scaleY !== undefined && option.scaleY !== 1) ||
    option.skewX ||
    option.skewY ||
    option.rotation
  );
}

/**
 * Reset transform to defaults and optionally apply to a shape.
 * @param {TransformOption} option Shape options
 * @returns {TransformOptionTransform} Transform attrs
 *
 * @example
 * ```ts
 * createResetTransform({}); // Transform attrs
 * ```
 */
export function createResetTransform(
  option?: TransformOption
): TransformOption {
  const attrs: TransformOption = {
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    x: 0,
    y: 0,
  };

  if (option) {
    Object.assign(option, attrs);
  }

  return attrs;
}

/**
 * Check if shape has any non-default rotation.
 * @param {TransformOption} option Shape options
 * @returns {boolean} True if rotation differs from defaults
 *
 * @example
 * ```ts
 * isHasRotation({ rotation: 45 }); // true
 * ```
 */
export function isHasRotation(option: TransformOption): boolean {
  return Boolean(option.rotation);
}

/**
 * Reset rotation to defaults and optionally apply to a shape.
 * @param {TransformOption} option Shape options
 * @returns {TransformOptionTransform} Transform attrs
 *
 * @example
 * ```ts
 * createResetRotation({}); // Transform attrs
 * ```
 */
export function createResetRotation(option?: TransformOption): TransformOption {
  const attrs: TransformOption = {
    rotation: 0,
  };

  if (option) {
    Object.assign(option, attrs);
  }

  return attrs;
}
