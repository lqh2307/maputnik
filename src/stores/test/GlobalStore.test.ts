import { useGlobalStore } from "../GlobalStore";
import { DEFAULT_STYLE } from "../../layouts/Constants";
import { LayerSpecification, StyleSpecification } from "maplibre-gl";

describe("GlobalStore", () => {
  beforeEach(() => {
    useGlobalStore.getState().newStyle();
  });

  it("initializes with default style and empty history", () => {
    const state = useGlobalStore.getState();
    expect(state.style.version).toBe(8);
    expect(state.history.past).toHaveLength(0);
    expect(state.history.future).toHaveLength(0);
    expect(state.dirty).toBe(false);
  });

  it("updates map mode and theme preference", () => {
    useGlobalStore.getState().setMapMode("inspect");
    expect(useGlobalStore.getState().mapMode).toBe("inspect");

    useGlobalStore.getState().setTheme("black");
    expect(useGlobalStore.getState().themeMode).toBe("black");
  });

  it("adds and selects a new layer", () => {
    useGlobalStore.getState().addLayer("fill", "openstreetmap");
    const state = useGlobalStore.getState();
    const lastLayer = state.style.layers.at(-1);

    expect(lastLayer?.type).toBe("fill");
    expect(state.selectedLayerId).toBe(lastLayer?.id);
    expect(state.dirty).toBe(true);
    expect(state.history.past).toHaveLength(1);
  });

  it("updates layer properties", () => {
    const state = useGlobalStore.getState();
    const firstLayerId = state.style.layers[0].id;

    useGlobalStore
      .getState()
      .updateLayerProperty(firstLayerId, "paint", "background-opacity", 0.5);

    const updated = useGlobalStore.getState().style
      .layers[0] as LayerSpecification & {
      paint?: { "background-opacity"?: number };
    };
    expect(updated.paint?.["background-opacity"]).toBe(0.5);
  });

  it("handles layer duplication, copy, and paste", () => {
    const firstLayerId = useGlobalStore.getState().style.layers[0].id;
    useGlobalStore.getState().duplicateLayer(firstLayerId);

    const layersAfterDuplication = useGlobalStore.getState().style.layers;
    expect(layersAfterDuplication).toHaveLength(3);

    useGlobalStore.getState().copyLayer(firstLayerId);
    expect(useGlobalStore.getState().layerClipboard?.id).toBe(firstLayerId);

    useGlobalStore.getState().pasteLayer();
    expect(useGlobalStore.getState().style.layers).toHaveLength(4);
  });

  it("supports undo and redo", () => {
    const initialCount = useGlobalStore.getState().style.layers.length;
    useGlobalStore.getState().addLayer("line");
    expect(useGlobalStore.getState().style.layers.length).toBe(
      initialCount + 1
    );

    useGlobalStore.getState().undo();
    expect(useGlobalStore.getState().style.layers.length).toBe(initialCount);

    useGlobalStore.getState().redo();
    expect(useGlobalStore.getState().style.layers.length).toBe(
      initialCount + 1
    );
  });

  it("upserts and deletes sources", () => {
    useGlobalStore.getState().upsertSource("test-source", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    expect(
      useGlobalStore.getState().style.sources["test-source"]
    ).toBeDefined();

    useGlobalStore.getState().deleteSource("test-source");
    expect(
      useGlobalStore.getState().style.sources["test-source"]
    ).toBeUndefined();
  });
});
