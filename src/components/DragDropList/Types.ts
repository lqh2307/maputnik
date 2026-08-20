import { UseSortableInput } from "@dnd-kit/react/sortable";
import { WindowSize } from "../../types/Window";
import { SxProps, Theme } from "@mui/material";
import {
  UseDroppableInput,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/react";

/** Optional dnd-kit monitor callbacks used by DragDropList owners. */
export type DragDropMonitorHandlers = {
  /** Event callback for drag start. */
  onDragStart?: (event: DragStartEvent) => void;
  /** Event callback for drag over. */
  onDragOver?: (event: DragOverEvent) => void;
  /** Event callback for drag end. */
  onDragEnd?: (event: DragEndEvent) => void;
};

/** A validated same-list sortable reorder operation. */
export type SortableReorder = {
  /** Configuration for source. */
  source: any;
  /** Identifier of the associated source droppable. */
  sourceDroppableId: string;
  /** Identifier of the associated destination droppable. */
  destinationDroppableId: string;
  /** Configuration for source index. */
  sourceIndex: number;
  /** Configuration for destination index. */
  destinationIndex: number;
};

/** Absolute-position insertion indicator data for custom overlays. */
export type InsertionIndicator = WindowSize & {
  /** Identifier of the associated droppable. */
  droppableId: string;
  /** Configuration for index. */
  index: number;
};

/** Props for a standalone droppable area registered with dnd-kit. */
export type DropableBoxProp = {
  /** Globally unique droppable id. Available later as event.operation.target.id. */
  id: string;

  /** Optional visible content inside the droppable area. Insertion gaps are often empty. */
  children?: React.ReactNode;

  /** Base MUI sx style for the droppable element. */
  sx?: SxProps<Theme>;

  /** Extra style applied when active=true or dnd-kit marks this box as target. */
  activeSx?: SxProps<Theme>;

  /** Caller-controlled active state, useful for keyboard or custom hover states. */
  active?: boolean;

  /** Disables dnd-kit collision for this droppable while keeping it rendered. */
  disabled?: boolean;

  /** dnd-kit type for this droppable target. Usually matches SortableRow.type. */
  type?: UseDroppableInput["type"];

  /** Accepted draggable type(s). In this project we normally accept the same type. */
  accept?: UseDroppableInput["accept"];

  /** Collision priority used when this target overlaps sortable rows. */
  collisionPriority?: number;
};

/** Runtime dnd-kit state exposed to renderItem for styling each row. */
export type DragDropSnapshot = {
  /** True while any drag operation is affecting this row. */
  isDragging: boolean;

  /** True during the drop animation/state for this row. */
  isDropping: boolean;

  /** True only for the item currently being dragged. */
  isDragSource: boolean;

  /** True when this row is the current sortable target. */
  isDropTarget: boolean;
};

/** Ref callbacks returned by useSortable and forwarded to the caller's markup. */
export type DragDropHandle = {
  /** Attach to the root element that represents and moves with the sortable item. */
  ref: (element: Element) => void;

  /** Attach to the element that starts dragging, such as a drag handle icon. */
  handleRef: (element: Element) => void;
};

/** Arguments passed into DragDropList.renderItem for each sortable item. */
export type DragDropItem<T> = {
  /** Resolved dnd-kit id for this row. */
  id?: string;

  /** Original data item from DragDropList.items. */
  item: T;

  /** Current render index inside the owning droppableId/group. */
  index: number;

  /** Ref callbacks that must be attached for dragging to work. */
  handle: DragDropHandle;

  /** Current drag state for styling. */
  snapshot: DragDropSnapshot;
};

/** Internal props used by DragDropList to register one sortable row. */
export type SortableRowProps<T> = {
  /** Stable item id. If missing, SortableRow falls back to item.id or a nano id. */
  id?: string;

  /** Data item rendered by this row. */
  item: T;

  /** Index in the current sortable group. */
  index: number;

  /** Sortable group/list id. Exposed by dnd-kit as source.group. */
  group?: string;

  /** Compatibility type. Rows and insertion gaps interact when types match. */
  type?: string;

  /** Disables dragging for this row. */
  disabled?: boolean;

  /** Optional dnd-kit sortable plugins for specialized behavior. */
  sortablePlugins?: UseSortableInput["plugins"];

  /** Optional callback for owners that need each rendered row DOM element. */
  onItemElement?: (index: number, element: Element) => void;

  /** Render callback receives refs and snapshot flags from useSortable. */
  renderItem: (args: DragDropItem<T>) => React.ReactNode;
};

/**
 * Public API for a sortable list.
 *
 * DragDropList renders items and registers dnd-kit refs, but it does not reorder
 * data by itself. The owner handles onDragEnd, reads event.operation.source and
 * event.operation.target, then updates its own array/store.
 */
export type DragDropListProps<T> = DragDropMonitorHandlers & {
  /** Items to render as sortable rows. */
  items: T[];

  /** Unique id of this list/group. Passed to SortableRow.group. */
  droppableId: string;

  /** Disables dragging for every row in this list. */
  disabled?: boolean;

  /** Style for the outer Box that contains rows and optional insertion gaps. */
  sx?: SxProps<Theme>;

  /** Optional ref callback for the outer Box. */
  containerRef?: (element: Element) => void;

  /**
   * When true, DragDropList creates its own DragDropProvider. Use false for
   * nested lists that must participate in one shared provider.
   */
  withContext?: boolean;

  /** Render explicit droppable gaps before, between, and after rows. */
  insertionDroppable?: boolean;

  /**
   * Keeps insertion gaps visible but removes them from collision detection.
   * This preserves the native sortable row target, so dnd-kit's push/displace
   * animation still works while the gap can be highlighted visually from the
   * current sortable target or pointer position.
   */
  insertionDroppableDisabled?: boolean;

  /** dnd-kit type/accept value used for insertion gaps. */
  insertionDroppableType?: string;

  /** Base style for every insertion gap. */
  insertionDropSx?: SxProps<Theme>;

  /** Style applied when a gap is active or is the current drop target. */
  insertionDropActiveSx?: SxProps<Theme>;

  /**
   * Collision priority for insertion gaps.
   * Keep this lower than sortable rows by default so row targets still drive
   * dnd-kit's native push/displace preview when both a row and gap collide.
   */
  insertionDropCollisionPriority?: number;

  /** Optional dnd-kit sortable plugins passed to every SortableRow. */
  sortablePlugins?: UseSortableInput["plugins"];

  /** Optional caller-controlled active state for a gap at the given index. */
  setInsertionDropActive?: (index: number) => boolean;

  /** Optional callback for owners that need each rendered row DOM element. */
  setItemElement?: (index: number, element: Element) => void;

  /** Resolve a stable row id from item data. */
  setItemId?: (item: T, index: number) => string;

  /** Resolve a row type. Defaults to droppableId when omitted. */
  setItemType?: (item: T, index: number) => string;

  /** Resolve a unique insertion gap id. Useful for nested lists. */
  setInsertionDroppableId?: (index: number) => string;

  /** Render one sortable row. The returned markup must attach handle.ref. */
  renderItem: (args: DragDropItem<T>) => React.ReactNode;
};
