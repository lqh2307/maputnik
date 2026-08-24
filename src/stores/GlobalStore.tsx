import { GlobalAction, GlobalStore, LayerPlacement, StylePath } from "./Types";
import { EditableLayer, LayerSection } from "../layouts/Types";
import { DEFAULT_STYLE } from "../layouts/Constants";
import {
  LayerSpecification,
  SourceSpecification,
  StyleSpecification,
} from "maplibre-gl";
import { ViewState } from "react-map-gl/maplibre";
import { create } from "zustand";
import {
  sourceSupportsLayer,
  createUniqueId,
  duplicateLayer,
  createLayer,
  cloneStyle,
} from "../layouts/Utils";
import {
  persistEditorLayerClipboard,
  loadPersistedEditorStyle,
  loadEditorLayerClipboard,
  persistEditorStyle,
  EDITOR_MAX_HISTORY,
  commitEditorStyle,
} from "./Utils";
import { deleteNestedValue, setNestedValue } from "../utils/Object";

const initialStyle: StyleSpecification = loadPersistedEditorStyle();

/** Zustand hook for Maputnik style and workspace state. */
export const useGlobalStore = create<GlobalStore & GlobalAction>()((set) => {
  // =========================
  // Start Methods
  // =========================

  /** Stores the current layer search query. */
  function setSearch(search: string): void {
    set({
      search,
    });
  }

  /** Applies the layer-type filter in the left panel. */
  function setLayerTypeFilter(layerTypeFilter: string): void {
    set({
      layerTypeFilter,
    });
  }

  /** Toggles the collapsed state of a source group in the layer panel. */
  function toggleGroup(groupId: string): void {
    set((state) => {
      const collapsedGroups = new Set(state.collapsedGroups);
      if (collapsedGroups.has(groupId)) {
        collapsedGroups.delete(groupId);
      } else {
        collapsedGroups.add(groupId);
      }
      return {
        collapsedGroups,
      };
    });
  }

  /** Stores the feature list currently pinned from map hover/click inspection. */
  function setInspectorFeatures(
    inspectorFeatures: GlobalStore["inspectorFeatures"]
  ): void {
    set({
      inspectorFeatures,
    });
  }

  /** Merges partial camera state into the current map viewport. */
  function setViewState(patch: Partial<ViewState>): void {
    set((state) => {
      return {
        viewState: {
          ...state.viewState,
          ...patch,
        },
      };
    });
  }

  /** Sets the active layer ID or clears the selection. */
  function selectLayer(selectedLayerId?: string): void {
    set({
      selectedLayerId,
    });
  }

  /** Replaces the current document with a loaded style, resetting transient inspect state. */
  function loadStyle(style: StyleSpecification): void {
    const nextStyle = cloneStyle(style);
    persistEditorStyle(nextStyle);
    set({
      style: nextStyle,
      selectedLayerId: nextStyle.layers[0]?.id,
      inspectorFeatures: [],
      viewState: {
        longitude: nextStyle.center?.[0] ?? 0,
        latitude: nextStyle.center?.[1] ?? 0,
        zoom: nextStyle.zoom ?? 1,
        bearing: nextStyle.bearing ?? 0,
        pitch: nextStyle.pitch ?? 0,
      },
      history: {
        past: [],
        future: [],
      },
      dirty: false,
    });
  }

  /** Resets the editor to the built-in default style template. */
  function newStyle(): void {
    const style = cloneStyle(DEFAULT_STYLE);
    persistEditorStyle(style);
    set({
      style,
      selectedLayerId: style.layers[0]?.id,
      inspectorFeatures: [],
      viewState: {
        longitude: style.center?.[0] ?? 0,
        latitude: style.center?.[1] ?? 0,
        zoom: style.zoom ?? 1,
        bearing: style.bearing ?? 0,
        pitch: style.pitch ?? 0,
      },
      history: {
        past: [],
        future: [],
      },
      dirty: false,
    });
  }

  /** Replaces the current style document while preserving editor history semantics. */
  function replaceStyle(style: StyleSpecification): void {
    set((state) => {
      return commitEditorStyle(
        state,
        (draft) => {
          Object.keys(draft).forEach((key) => {
            return Reflect.deleteProperty(draft, key);
          });
          Object.assign(draft, cloneStyle(style));
        },
        style.layers.some((layer) => {
          return layer.id === state.selectedLayerId;
        })
          ? state.selectedLayerId
          : style.layers[0]?.id
      );
    });
  }

  /** Applies a partial patch to the root style object. */
  function updateRoot(patch: Partial<StyleSpecification>): void {
    set((state) => {
      return commitEditorStyle(state, (draft) => {
        Object.assign(draft, patch);
      });
    });
  }

  /** Sets one nested style value and removes its key when the value is undefined. */
  function updateStyleValue(path: StylePath, value: unknown): void {
    if (!path.length) {
      return;
    }

    set((state) => {
      return commitEditorStyle(state, (draft) => {
        if (value === undefined) {
          deleteNestedValue(draft, path, true);
        } else {
          setNestedValue(draft, path, value, true);
        }
      });
    });
  }

  /** Creates a new layer of the supplied type and optional source binding. */
  function addLayer(type: LayerSpecification["type"], sourceId?: string): void {
    set((state) => {
      const id = createUniqueId(
        type,
        state.style.layers.map((layer) => {
          return layer.id;
        })
      );
      return commitEditorStyle(
        state,
        (draft) => {
          draft.layers.push(createLayer(type, id, sourceId));
        },
        id
      );
    });
  }

  /** Updates a specific layer record or renames it while keeping source semantics aligned. */
  function updateLayer(
    layerId: string,
    patch: Partial<LayerSpecification>
  ): void {
    set((state) => {
      const nextId = typeof patch.id === "string" ? patch.id : layerId;
      if (
        nextId !== layerId &&
        state.style.layers.some((layer) => {
          return layer.id === nextId;
        })
      ) {
        return state;
      }
      return commitEditorStyle(
        state,
        (draft) => {
          const index = draft.layers.findIndex((layer) => {
            return layer.id === layerId;
          });
          if (index >= 0) {
            const current = draft.layers[index];
            if (patch.type && patch.type !== current.type) {
              const currentSource =
                "source" in current && typeof current.source === "string"
                  ? current.source
                  : undefined;
              const sourceId =
                currentSource &&
                sourceSupportsLayer(draft.sources[currentSource], patch.type)
                  ? currentSource
                  : Object.entries(draft.sources).find(([, source]) => {
                      return sourceSupportsLayer(source, patch.type);
                    })?.[0];
              draft.layers[index] = {
                ...createLayer(
                  patch.type as LayerSpecification["type"],
                  nextId,
                  sourceId
                ),
                id: nextId,
                minzoom: current.minzoom,
                maxzoom: current.maxzoom,
                metadata: current.metadata,
                ...(Object.prototype.hasOwnProperty.call(
                  current,
                  "source-layer"
                )
                  ? {
                      "source-layer": current["source-layer"],
                    }
                  : {}),
                ...patch,
              } as LayerSpecification;
            } else {
              draft.layers[index] = {
                ...current,
                ...patch,
              } as LayerSpecification;
            }
          }
        },
        state.selectedLayerId === layerId ? nextId : state.selectedLayerId
      );
    });
  }

  /** Updates a single property on a layer sub-object such as paint/layout metadata. */
  function updateLayerProperty(
    layerId: string,
    section: LayerSection,
    property: string,
    value: unknown
  ): void {
    set((state) => {
      return commitEditorStyle(state, (draft) => {
        const layer = draft.layers.find((item) => {
          return item.id === layerId;
        }) as EditableLayer;
        if (!layer) {
          return;
        }
        const values = {
          ...(layer[section] ?? {}),
        };
        if (value === undefined) {
          delete values[property];
        } else {
          values[property] = value;
        }
        if (Object.keys(values).length) {
          layer[section] = values;
        } else {
          delete layer[section];
        }
      });
    });
  }

  /** Removes a layer from the active style document. */
  function deleteLayer(layerId: string): void {
    set((state) => {
      const index = state.style.layers.findIndex((layer) => {
        return layer.id === layerId;
      });
      const nextSelection =
        state.style.layers[index - 1]?.id ?? state.style.layers[index + 1]?.id;
      return commitEditorStyle(
        state,
        (draft) => {
          draft.layers = draft.layers.filter((layer) => {
            return layer.id !== layerId;
          });
        },
        state.selectedLayerId === layerId
          ? nextSelection
          : state.selectedLayerId
      );
    });
  }

  /** Duplicates a layer and inserts the copy immediately after the source layer. */
  function duplicateLayerAction(layerId: string): void {
    set((state) => {
      const index = state.style.layers.findIndex((layer) => {
        return layer.id === layerId;
      });
      if (index < 0) {
        return state;
      }
      const copy = duplicateLayer(
        state.style.layers[index],
        state.style.layers.map((layer) => {
          return layer.id;
        })
      );
      return commitEditorStyle(
        state,
        (draft) => {
          draft.layers.splice(index + 1, 0, copy);
        },
        copy.id
      );
    });
  }

  /** Copies a layer into the editor clipboard. */
  function copyLayer(layerId: string): void {
    set((state) => {
      const layer = state.style.layers.find((item) => {
        return item.id === layerId;
      });
      if (!layer) {
        return state;
      }
      const layerClipboard = structuredClone(layer);
      try {
        persistEditorLayerClipboard(layerClipboard);
        void navigator.clipboard
          ?.writeText(
            JSON.stringify(
              {
                type: "maputnik-layer",
                version: 1,
                layer: layerClipboard,
              },
              null,
              2
            )
          )
          .catch(() => {
            return undefined;
          });
      } catch {
        // Internal clipboard remains available if browser clipboard is denied.
      }
      return {
        layerClipboard,
      };
    });
  }

  /** Inserts the current clipboard layer immediately after the selected layer. */
  function pasteLayer(): void {
    set((state) => {
      if (!state.layerClipboard) {
        return state;
      }
      const copy = duplicateLayer(
        state.layerClipboard,
        state.style.layers.map((layer) => {
          return layer.id;
        })
      );
      const selectedIndex = state.style.layers.findIndex((layer) => {
        return layer.id === state.selectedLayerId;
      });
      const insertIndex =
        selectedIndex < 0 ? state.style.layers.length : selectedIndex + 1;
      return commitEditorStyle(
        state,
        (draft) => {
          draft.layers.splice(insertIndex, 0, copy);
        },
        copy.id
      );
    });
  }

  /** Toggles the visibility flag on a layer's layout block. */
  function toggleLayerVisibility(layerId: string): void {
    set((state) => {
      return commitEditorStyle(state, (draft) => {
        const layer = draft.layers.find((item) => {
          return item.id === layerId;
        }) as EditableLayer;
        if (!layer) {
          return;
        }
        const layout = {
          ...(layer.layout ?? {}),
        };
        layout.visibility = layout.visibility === "none" ? "visible" : "none";
        layer.layout = layout;
      });
    });
  }

  /** Reorders layers relative to another item, optionally before/after placement. */
  function moveLayer(
    activeId: string,
    overId: string,
    placement: LayerPlacement = "before"
  ): void {
    set((state) => {
      const from = state.style.layers.findIndex((layer) => {
        return layer.id === activeId;
      });
      const to = state.style.layers.findIndex((layer) => {
        return layer.id === overId;
      });
      if (from < 0 || to < 0 || from === to) {
        return state;
      }
      return commitEditorStyle(state, (draft) => {
        const [layer] = draft.layers.splice(from, 1);
        const targetIndex = draft.layers.findIndex((item) => {
          return item.id === overId;
        });
        const insertIndex =
          placement === "after" ? targetIndex + 1 : targetIndex;
        draft.layers.splice(insertIndex, 0, layer);
      });
    });
  }

  /** Creates or updates a source entry and rewrites dependent layer references if the source ID changes. */
  function upsertSource(
    sourceId: string,
    source: SourceSpecification,
    previousId?: string
  ): void {
    set((state) => {
      return commitEditorStyle(state, (draft) => {
        const previous = previousId ?? sourceId;
        if (previous !== sourceId) {
          delete draft.sources[previous];
          draft.layers = draft.layers.map((layer) => {
            return "source" in layer && layer.source === previous
              ? ({
                  ...layer,
                  source: sourceId,
                } as LayerSpecification)
              : layer;
          });
        }
        draft.sources[sourceId] = source;
      });
    });
  }

  /** Removes a source and all layers using it from the current style. */
  function deleteSource(sourceId: string): void {
    set((state) => {
      const remainingLayers = state.style.layers.filter((layer) => {
        return !("source" in layer) || layer.source !== sourceId;
      });
      const selectedLayerId = remainingLayers.some((layer) => {
        return layer.id === state.selectedLayerId;
      })
        ? state.selectedLayerId
        : remainingLayers[0]?.id;
      return commitEditorStyle(
        state,
        (draft) => {
          delete draft.sources[sourceId];
          draft.layers = draft.layers.filter((layer) => {
            return !("source" in layer) || layer.source !== sourceId;
          });
        },
        selectedLayerId
      );
    });
  }

  /** Reverts the current style to the previous snapshot in the undo stack. */
  function undo(): void {
    set((state) => {
      const previous = state.history.past.at(-1);
      if (!previous) {
        return state;
      }
      persistEditorStyle(previous);
      return {
        style: cloneStyle(previous),
        selectedLayerId: previous.layers.some((layer) => {
          return layer.id === state.selectedLayerId;
        })
          ? state.selectedLayerId
          : previous.layers[0]?.id,
        history: {
          past: state.history.past.slice(0, -1),
          future: [cloneStyle(state.style), ...state.history.future].slice(
            0,
            EDITOR_MAX_HISTORY
          ),
        },
        dirty: true,
      };
    });
  }

  /** Restores a future snapshot from the redo stack. */
  function redo(): void {
    set((state) => {
      const next = state.history.future[0];
      if (!next) {
        return state;
      }
      persistEditorStyle(next);
      return {
        style: cloneStyle(next),
        selectedLayerId: next.layers.some((layer) => {
          return layer.id === state.selectedLayerId;
        })
          ? state.selectedLayerId
          : next.layers[0]?.id,
        history: {
          past: [...state.history.past, cloneStyle(state.style)].slice(
            -EDITOR_MAX_HISTORY
          ),
          future: state.history.future.slice(1),
        },
        dirty: true,
      };
    });
  }

  /** Marks the current style as persisted and clears the dirty flag. */
  function markSaved(): void {
    set({
      dirty: false,
    });
  }

  // =========================
  // End Methods
  // =========================

  return {
    // =========================
    // Attributes
    // =========================

    style: initialStyle,
    selectedLayerId: initialStyle.layers[0]?.id,
    search: "",
    layerTypeFilter: "all",
    collapsedGroups: new Set(),
    inspectorFeatures: [],
    layerClipboard: loadEditorLayerClipboard(),
    viewState: {
      longitude: initialStyle.center?.[0] ?? 0,
      latitude: initialStyle.center?.[1] ?? 0,
      zoom: initialStyle.zoom ?? 1,
      bearing: initialStyle.bearing ?? 0,
      pitch: initialStyle.pitch ?? 0,
    },
    history: {
      past: [],
      future: [],
    },
    dirty: false,

    // =========================
    // Methods
    // =========================

    setSearch,
    setLayerTypeFilter,
    toggleGroup,
    setInspectorFeatures,
    setViewState,
    selectLayer,
    loadStyle,
    replaceStyle,
    newStyle,
    updateRoot,
    updateStyleValue,
    addLayer,
    updateLayer,
    updateLayerProperty,
    deleteLayer,
    duplicateLayer: duplicateLayerAction,
    copyLayer,
    pasteLayer,
    toggleLayerVisibility,
    moveLayer,
    upsertSource,
    deleteSource,
    undo,
    redo,
    markSaved,
  };
});
