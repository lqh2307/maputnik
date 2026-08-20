import { LayerSpecification } from "maplibre-gl";
import React from "react";

export * from "../../components/LayerTypeIcon/Types";

/** Defines one source-based group in the layer tree. */
export type LayerGroup = {
  /** Unique group identifier (e.g. source ID or style:root). */
  id: string;
  /** Human-readable title for the group. */
  title: string;
  /** Ordered list of style layers belonging to this group. */
  layers: LayerSpecification[];
};

/** Defines the current native drag operation in the layer tree. */
export type LayerDragState = {
  /** Identifier of the layer currently being dragged. */
  activeId?: string;
  /** Identifier of the layer currently hovered over. */
  overId?: string;
  /** Drop edge indicating whether insertion is before or after. */
  edge?: "top" | "bottom";
};

/** Defines LayerRow component props. */
export type LayerRowProp = {
  /** Style layer document rendered by the row. */
  layer: LayerSpecification;
  /** Active drag operation state. */
  dragState: LayerDragState;
  /** State updater for active drag coordinates. */
  setDragState: React.Dispatch<React.SetStateAction<LayerDragState>>;
};

/** Defines AddLayerDialog component props. */
export type AddLayerDialogProp = {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Callback fired when the dialog is dismissed. */
  onClose: () => void;
};
