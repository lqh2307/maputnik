/**
 * Public state and action contracts for the editor stores.
 *
 * Store state types describe serializable editor data together with reactive
 * UI/runtime flags. Action types expose the imperative API used by React
 * components and layout bars.
 */

import { InspectorFeature, LayerSection, MapMode } from "../layouts/Types";
import { ThemeMode } from "../components/AppTheme";
import { ViewState } from "react-map-gl/maplibre";
import {
  SourceSpecification,
  LayerSpecification,
  StyleSpecification,
} from "maplibre-gl";

/** Defines where a moved style layer is placed relative to its target. */
export type LayerPlacement = "before" | "after";

/** Defines undo and redo snapshots for the Maputnik style editor. */
export type EditorHistoryState = {
  /** Ordered snapshots of previously committed style documents. */
  past: StyleSpecification[];
  /** Ordered snapshots of undone style documents available for redo. */
  future: StyleSpecification[];
};

/**
 * Attributes representing the reactive state of the global Maputnik editor.
 */
export type GlobalStore = {
  /** Current MapLibre style document being edited. */
  style: StyleSpecification;
  /** Selected style layer identifier, if one is active. */
  selectedLayerId?: string;
  /** Interaction mode of the map canvas: explore or feature inspection. */
  mapMode: MapMode;
  /** UI theme selection used by the application shell. */
  themeMode: ThemeMode;
  /** Free-text search filter applied by the layer list. */
  search: string;
  /** Layer type filter used while browsing the layer panel. */
  layerTypeFilter: string;
  /** Set of source-group IDs currently collapsed in the layer tree. */
  collapsedGroups: Set<string>;
  /** Last rendered feature payloads recorded through map inspection. */
  inspectorFeatures: InspectorFeature[];
  /** Cached layer payload prepared for paste/duplicate workflows. */
  layerClipboard?: LayerSpecification;
  /** Current MapLibre camera and viewport state for the map canvas. */
  viewState: Partial<ViewState>;
  /** Undo/redo history snapshots for the style document. */
  history: EditorHistoryState;
  /** Whether the current style differs from the last persisted state. */
  dirty: boolean;
};

/**
 * Action methods exposed by `useGlobalStore` for style mutations and editor interactions.
 */
export type GlobalAction = {
  /** Switches the map interaction mode between navigation and feature inspection. */
  setMapMode: (mode: MapMode) => void;
  /** Updates the application theme preference. */
  setTheme: (theme: ThemeMode) => void;
  /** Stores the current layer search query. */
  setSearch: (search: string) => void;
  /** Applies the layer-type filter in the left panel. */
  setLayerTypeFilter: (type: string) => void;
  /** Toggles the collapsed state of a source group in the layer panel. */
  toggleGroup: (groupId: string) => void;
  /** Stores the feature list currently pinned from map hover/click inspection. */
  setInspectorFeatures: (features: InspectorFeature[]) => void;
  /** Merges partial camera state into the current map viewport. */
  setViewState: (viewState: Partial<ViewState>) => void;
  /** Sets the active layer ID or clears the selection. */
  selectLayer: (layerId?: string) => void;
  /** Replaces the current document with a loaded style, resetting transient inspect state. */
  loadStyle: (style: StyleSpecification) => void;
  /** Replaces the current style document while preserving editor history semantics. */
  replaceStyle: (style: StyleSpecification) => void;
  /** Resets the editor to the built-in default style template. */
  newStyle: () => void;
  /** Applies a partial patch to the root style object. */
  updateRoot: (patch: Partial<StyleSpecification>) => void;
  /** Creates a new layer of the supplied type and optional source binding. */
  addLayer: (type: LayerSpecification["type"], sourceId?: string) => void;
  /** Updates a specific layer record or renames it while keeping source semantics aligned. */
  updateLayer: (layerId: string, patch: Partial<LayerSpecification>) => void;
  /** Updates a single property on a layer sub-object such as paint/layout metadata. */
  updateLayerProperty: (
    layerId: string,
    section: LayerSection,
    property: string,
    value: unknown
  ) => void;
  /** Removes a layer from the active style document. */
  deleteLayer: (layerId: string) => void;
  /** Duplicates a layer and inserts the copy immediately after the source layer. */
  duplicateLayer: (layerId: string) => void;
  /** Copies a layer into the editor clipboard. */
  copyLayer: (layerId: string) => void;
  /** Inserts the current clipboard layer immediately after the selected layer. */
  pasteLayer: () => void;
  /** Toggles the visibility flag on a layer's layout block. */
  toggleLayerVisibility: (layerId: string) => void;
  /** Reorders layers relative to another item, optionally before/after placement. */
  moveLayer: (
    activeId: string,
    overId: string,
    placement?: LayerPlacement
  ) => void;
  /** Creates or updates a source entry and rewrites dependent layer references if the source ID changes. */
  upsertSource: (
    sourceId: string,
    source: SourceSpecification,
    previousId?: string
  ) => void;
  /** Removes a source and all layers using it from the current style. */
  deleteSource: (sourceId: string) => void;
  /** Reverts the current style to the previous snapshot in the undo stack. */
  undo: () => void;
  /** Restores a future snapshot from the redo stack. */
  redo: () => void;
  /** Marks the current style as persisted and clears the dirty flag. */
  markSaved: () => void;
};

/** Combined state and actions type for backwards compatibility. */
export type EditorState = GlobalStore & GlobalAction;

/** Runtime visibility state for editor dialogs. */
export type DialogStore = {
  /** Whether the JSON code editor is open. */
  code?: boolean;

  /** Whether the style export dialog is open. */
  export?: boolean;

  /** Whether the style open dialog is open. */
  open?: boolean;

  /** Whether the editor settings dialog is open. */
  settings?: boolean;

  /** Whether the keyboard shortcuts dialog is open. */
  shortcuts?: boolean;

  /** Whether the sources dialog is open. */
  sources?: boolean;
};

/** Actions exposed by `useDialogStore`. */
export type DialogAction = {
  /** Shallow-merges one or more dialog visibility values. */
  updateDialog: (opt?: DialogStore) => boolean;
  /** Close every editor dialog without changing any other store. */
  closeDialogs: () => void;
};
