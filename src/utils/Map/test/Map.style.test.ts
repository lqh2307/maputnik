declare const jest: {
  mock: (
    moduleName: string,
    factory: () => unknown,
    options?: { virtual?: boolean }
  ) => void;
};
declare function describe(name: string, test: () => void): void;
declare function it(name: string, test: () => Promise<void>): void;
declare function expect(value: unknown): {
  toBe: (expected: unknown) => void;
};

jest.mock("mime", () => {
  return {
    __esModule: true,
    default: {
      getType: () => {
        return undefined;
      },
    },
  };
});
jest.mock("color", () => {
  return {
    __esModule: true,
    default: () => {
      return undefined;
    },
  };
});
jest.mock("konva", () => {
  return require("konva/konva.js");
});
jest.mock(
  "svgo/browser",
  () => {
    return {
      optimize: (svg: string) => {
        return {
          data: svg,
        };
      },
    };
  },
  {
    virtual: true,
  }
);
jest.mock("nanoid", () => {
  return {
    nanoid: () => {
      return "generated-id";
    },
  };
});
jest.mock("../../Canvas", () => {
  return {
    exportCanvas: async () => {
      return undefined;
    },
  };
});
jest.mock("maplibre-gl", () => {
  return {
    Map: class {},
    FullscreenControl: class {},
    NavigationControl: class {},
    GeolocateControl: class {},
    TerrainControl: class {},
    GlobeControl: class {},
    ScaleControl: class {},
  };
});

import {
  MAP_DEM_SOURCE_ID,
  MAP_HILLSHADE_LAYER_ID,
  MAP_CONTOUR_LAYER_ID,
  MAP_CONTOUR_LABEL_LAYER_ID,
  MAP_CONTOUR_SOURCE_ID,
  MAP_ELEVATION_POINT_LAYER_ID,
  MAP_ELEVATION_POINT_LABEL_LAYER_ID,
  MAP_ELEVATION_POINT_SOURCE_ID,
  createMap,
  upsertMapLayers,
  upsertStyle,
} from "../Map";

describe("createMap", () => {
  it("returns a usable map immediately when sync is enabled", async () => {
    const map = await createMap({
      container: {} as HTMLElement,
      style: "style-url",
      sync: true,
    });

    expect(map).toBe(map);
    expect(typeof map.on).toBe("function");
  });
});

describe("upsertStyle", () => {
  it("waits for the new style to load before resolving", async () => {
    const listeners: Record<string, (...args: any[]) => void> = {};
    let listenerAttachedBeforeSetStyle: boolean = false;
    let resolved: boolean = false;

    const map = {
      once: (event: string, listener: (...args: any[]) => void): void => {
        listeners[event] = listener;
      },
      off: (event: string, listener: (...args: any[]) => void): void => {
        if (listeners[event] === listener) {
          delete listeners[event];
        }
      },
      // Simulate the previous style already being ready. This must not allow
      // upsertStyle to resolve before style.load from the replacement style.
      isStyleLoaded: (): boolean => {
        return true;
      },
      loaded: (): boolean => {
        return true;
      },
      isMoving: (): boolean => {
        return false;
      },
      setStyle: (): void => {
        listenerAttachedBeforeSetStyle = !!listeners["style.load"];
      },
    };

    const update = upsertStyle(map as never, "next-style", 1000).then(() => {
      resolved = true;
    });

    await Promise.resolve();

    expect(listenerAttachedBeforeSetStyle).toBe(true);
    expect(resolved).toBe(false);

    listeners["style.load"]();
    await update;

    expect(resolved).toBe(true);
  });

  it("accepts a loaded style when MapLibre omits the style.load event", async () => {
    const listeners: Record<string, (...args: any[]) => void> = {};
    let styleApplied: boolean = false;
    const map = {
      once: (event: string, listener: (...args: any[]) => void): void => {
        listeners[event] = listener;
      },
      off: (event: string, listener: (...args: any[]) => void): void => {
        if (listeners[event] === listener) {
          delete listeners[event];
        }
      },
      isStyleLoaded: (): boolean => {
        return styleApplied;
      },
      loaded: (): boolean => {
        return true;
      },
      isMoving: (): boolean => {
        return false;
      },
      setStyle: (): void => {
        styleApplied = true;
      },
    };

    await upsertStyle(map as never, "cached-style", 0);

    expect(styleApplied).toBe(true);
  });
});

describe("upsertMapLayers", () => {
  it("does not reapply terrain and hillshade that already match", async () => {
    let mutationCount: number = 0;
    const map = {
      getStyle: () => {
        return {
          layers: [
            {
              id: "labels",
              type: "symbol",
            },
          ],
        };
      },
      getTerrain: () => {
        return {
          source: MAP_DEM_SOURCE_ID,
          exaggeration: 1,
        };
      },
      getLayer: (id: string) => {
        return id === MAP_HILLSHADE_LAYER_ID ? {} : undefined;
      },
      getSource: (id: string) => {
        return id === MAP_DEM_SOURCE_ID ? {} : undefined;
      },
      setTerrain: (): void => {
        mutationCount += 1;
      },
      addSource: (): void => {
        mutationCount += 1;
      },
      removeSource: (): void => {
        mutationCount += 1;
      },
      addLayer: (): void => {
        mutationCount += 1;
      },
      removeLayer: (): void => {
        mutationCount += 1;
      },
    };

    await upsertMapLayers(map as never, {
      terrainEnabled: true,
      hillshadeEnabled: true,
      contourEnabled: false,
    });

    expect(mutationCount).toBe(0);
  });

  it("passes the contour URL directly and adds its elevation labels", async () => {
    let labelLayerCount: number = 0;
    let matchingSourceLayerCount: number = 0;
    let urlSourceCount: number = 0;

    function createMapMock(): Record<string, unknown> {
      const layers: Record<string, unknown> = {};
      const sources: Record<string, unknown> = {};

      return {
        getStyle: () => {
          return {
            layers: [],
          };
        },
        getTerrain: () => {
          return null;
        },
        getLayer: (id: string) => {
          return layers[id];
        },
        getSource: (id: string) => {
          return sources[id];
        },
        setTerrain: () => {
          return undefined;
        },
        addSource: (id: string, source: unknown): void => {
          sources[id] = source;
          const sourceOption = source as { url?: string; tiles?: unknown };
          if (
            id === MAP_CONTOUR_SOURCE_ID &&
            sourceOption.url &&
            !sourceOption.tiles
          ) {
            urlSourceCount += 1;
          }
        },
        removeSource: (id: string): void => {
          delete sources[id];
        },
        addLayer: (layer: { id: string; "source-layer"?: string }): void => {
          layers[layer.id] = layer;
          if (layer.id === MAP_CONTOUR_LABEL_LAYER_ID) {
            labelLayerCount += 1;
          }
          if (
            (layer.id === MAP_CONTOUR_LAYER_ID ||
              layer.id === MAP_CONTOUR_LABEL_LAYER_ID) &&
            layer["source-layer"] === "CONTOUR_LINE"
          ) {
            matchingSourceLayerCount += 1;
          }
        },
        removeLayer: (id: string): void => {
          delete layers[id];
        },
      };
    }

    const stageOption = {
      terrainEnabled: false,
      hillshadeEnabled: false,
      contourEnabled: true,
    };

    await upsertMapLayers(createMapMock() as never, stageOption);
    await upsertMapLayers(createMapMock() as never, stageOption);

    expect(labelLayerCount).toBe(2);
    expect(matchingSourceLayerCount).toBe(4);
    expect(urlSourceCount).toBe(2);
  });

  it("adds elevation points and their ELEV labels from the configured URL", async () => {
    const layers: Record<string, any> = {};
    const sources: Record<string, any> = {};
    const map = {
      getStyle: () => {
        return {
          layers: [],
        };
      },
      getTerrain: () => {
        return null;
      },
      getLayer: (id: string) => {
        return layers[id];
      },
      getSource: (id: string) => {
        return sources[id];
      },
      setTerrain: () => {
        return undefined;
      },
      addSource: (id: string, source: unknown): void => {
        sources[id] = source;
      },
      removeSource: (id: string): void => {
        delete sources[id];
      },
      addLayer: (layer: { id: string }): void => {
        layers[layer.id] = layer;
      },
      removeLayer: (id: string): void => {
        delete layers[id];
      },
    };

    await upsertMapLayers(map as never, {
      terrainEnabled: false,
      hillshadeEnabled: false,
      contourEnabled: false,
      elevationPointEnabled: true,
    });

    expect(sources[MAP_ELEVATION_POINT_SOURCE_ID]?.type).toBe("vector");
    expect(!!sources[MAP_ELEVATION_POINT_SOURCE_ID]?.url).toBe(true);
    expect(layers[MAP_ELEVATION_POINT_LAYER_ID]?.["source-layer"]).toBe(
      "ELEVATION_POINT"
    );
    expect(
      layers[MAP_ELEVATION_POINT_LABEL_LAYER_ID]?.layout?.["text-field"]
    ).toBe("{ELEV}");
  });
});
