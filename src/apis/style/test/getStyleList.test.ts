declare const jest: {
  mock: (moduleName: string, factory: () => unknown) => void;
  fn: (...args: any[]) => any;
};
declare function describe(name: string, test: () => void): void;
declare function it(name: string, test: () => Promise<void>): void;
declare const expect: any;

jest.mock("../../../utils/Request", () => {
  return {
    requestToURL: jest.fn(),
  };
});

import { getStyleList } from "../getStyleList";
import { requestToURL } from "../../../utils/Request";

describe("getStyleList fallback", () => {
  it("returns a proper Axios-like response when the request fails and fallback is enabled", async () => {
    const mockedRequestToURL = requestToURL as any;

    mockedRequestToURL.mockRejectedValueOnce(new Error("request failed"));

    const response = await getStyleList({
      useFallback: true,
    });

    expect(response).toBeTruthy();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toEqual(
      expect.objectContaining({
        name: "Demotiles",
        url: "https://demotiles.maplibre.org/style.json",
      })
    );
  });

  it("rethrows the original error when fallback is disabled", async () => {
    const mockedRequestToURL = requestToURL as any;

    const error = new Error("request failed");
    mockedRequestToURL.mockRejectedValueOnce(error);

    await expect(
      getStyleList({
        useFallback: false,
      })
    ).rejects.toThrow("request failed");
  });
});
