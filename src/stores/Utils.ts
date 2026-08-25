import { LayerSpecification, StyleSpecification } from "maplibre-gl";
import { ViewState } from "react-map-gl/maplibre";
import { DEFAULT_STYLE } from "../layouts/Constants";
import { GlobalStore, DialogStore } from "./Types";
import { cloneStyle, normalizeStyleSourceTypes } from "../layouts/Utils";
import { produce, type Draft } from "immer";

/** Browser persistence key for the active MapLibre style document. */
const EDITOR_STYLE_STORAGE_KEY: string = "maputnik-mui-style";

/** Browser persistence key for the in-memory layer clipboard. */
const EDITOR_LAYER_CLIPBOARD_KEY: string = "maputnik-mui-layer-clipboard";

/** Maximum number of undo snapshots retained for the editor history stack. */
export const EDITOR_MAX_HISTORY: number = 80;

/** Loads the last valid Maputnik style or returns a fresh default style. */
export function loadPersistedEditorStyle(): StyleSpecification {
  try {
    const value: string = localStorage.getItem(EDITOR_STYLE_STORAGE_KEY);
    if (value) {
      const style: StyleSpecification = JSON.parse(value) as StyleSpecification;
      if (style.version === 8 && Array.isArray(style.layers) && style.sources) {
        return normalizeStyleSourceTypes(style);
      }
    }
  } catch {
    // Fall through when storage access or persisted JSON is invalid.
  }

  return cloneStyle(DEFAULT_STYLE);
}

/** Persists the current Maputnik style when browser storage is available. */
export function persistEditorStyle(style: StyleSpecification): void {
  try {
    localStorage.setItem(EDITOR_STYLE_STORAGE_KEY, JSON.stringify(style));
  } catch {
    // The editor remains usable when storage is unavailable.
  }
}

/** Loads the internal layer clipboard from browser storage. */
export function loadEditorLayerClipboard(): LayerSpecification {
  try {
    const value: string = localStorage.getItem(EDITOR_LAYER_CLIPBOARD_KEY);
    return value ? (JSON.parse(value) as LayerSpecification) : undefined;
  } catch {
    return undefined;
  }
}

/** Persists the internal Maputnik layer clipboard. */
export function persistEditorLayerClipboard(layer: LayerSpecification): void {
  try {
    localStorage.setItem(EDITOR_LAYER_CLIPBOARD_KEY, JSON.stringify(layer));
  } catch {
    // The in-memory clipboard remains usable when storage is unavailable.
  }
}

/** Creates one immutable style commit and updates its history snapshots. */
export function commitEditorStyle(
  state: GlobalStore,
  producer: (draft: StyleSpecification) => void,
  selectedLayerId: string = state.selectedLayerId
): Partial<GlobalStore> {
  const nextStyle = produce(state.style, (draft: Draft<StyleSpecification>) => {
    producer(draft as unknown as StyleSpecification);
  }) as StyleSpecification;

  if (nextStyle === state.style) {
    return {};
  }

  persistEditorStyle(nextStyle);

  return {
    style: nextStyle,
    selectedLayerId,
    dirty: true,
    history: {
      past: [...state.history.past, cloneStyle(state.style)].slice(
        -EDITOR_MAX_HISTORY
      ),
      future: [],
    },
  };
}

/** Derives the controlled map camera from the style root camera fields. */
export function getStyleViewState(
  style: StyleSpecification
): Partial<ViewState> {
  return {
    longitude: style.center?.[0] ?? 0,
    latitude: style.center?.[1] ?? 0,
    zoom: style.zoom ?? 1,
    bearing: style.bearing ?? 0,
    pitch: style.pitch ?? 0,
  };
}

/** Returns the initial state attributes for `useDialogStore`. */
export function createInitDialog(): DialogStore {
  return {
    about: undefined,
    code: undefined,
    export: undefined,
    generalSetting: undefined,
    guide: undefined,
    open: undefined,
    profile: undefined,
    settings: undefined,
    shortcuts: undefined,
    sources: undefined,
  };
}

/** Returns the default initial attributes for `useGlobalStore`. */
export function createInitGlobalStore(
  initialStyle: StyleSpecification = loadPersistedEditorStyle()
): GlobalStore {
  return {
    style: initialStyle,
    selectedLayerId: initialStyle.layers[0]?.id,
    search: "",
    layerTypeFilter: "all",
    collapsedGroups: new Set(),
    inspectorFeatures: [],
    layerClipboard: loadEditorLayerClipboard(),
    viewState: getStyleViewState(initialStyle),
    history: {
      past: [],
      future: [],
    },
    dirty: false,
  };
}
