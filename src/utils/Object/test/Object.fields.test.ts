declare function describe(name: string, test: () => void): void;
declare function it(name: string, test: () => void): void;
declare function expect(value: unknown): {
  toBe: (expected: unknown) => void;
};

import { hasAllFields, hasAnyFields } from "../Object";

describe("object field checks", () => {
  it("returns false for missing objects", () => {
    expect(hasAnyFields(undefined, ["width", "height"])).toBe(false);
    expect(hasAnyFields(null, ["width", "height"])).toBe(false);
    expect(hasAllFields(undefined, ["width", "height"])).toBe(false);
    expect(hasAllFields(null, ["width", "height"])).toBe(false);
  });

  it("checks own and inherited fields on objects", () => {
    const object = Object.create({
      width: 100,
    });
    object.height = 50;

    expect(hasAnyFields(object, ["width", "depth"])).toBe(true);
    expect(hasAllFields(object, ["width", "height"])).toBe(true);
    expect(hasAllFields(object, ["width", "depth"])).toBe(false);
  });
});
