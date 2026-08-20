/**
 * DragDropList flow
 *
 * This folder wraps the low-level @dnd-kit/react APIs into a small list API that
 * can be reused by flat lists, horizontal tab lists, and nested lists.
 *
 * Render-time structure:
 *
 *   <DragDropProvider>                         // Created by DragDropList when
 *     <Box sx={sx}>                            // withContext=true. Nested lists
 *       insertion gap 0?                       // may set withContext=false and
 *       <SortableRow index={0} />              // share a provider from a parent.
 *       insertion gap 1?
 *       <SortableRow index={1} />
 *       insertion gap 2?
 *     </Box>
 *   </DragDropProvider>
 *
 * Runtime drag flow:
 *
 *   pointer down on handleRef
 *        |
 *        v
 *   useSortable starts dragging after the configured sensor distance
 *        |
 *        v
 *   dnd-kit tracks source:
 *     - source.id: item id
 *     - source.initialIndex: original index
 *     - source.index: current sortable index when hovering sortable rows
 *     - source.group / initialGroup: droppable list id
 *        |
 *        v
 *   pointer moves over either:
 *     - a SortableRow, for row-to-row sorting and native push/displace preview
 *     - a DropableBox insertion gap, when gaps are enabled as real droppables
 *
 *   When insertionDroppableDisabled=true:
 *     - insertion gaps stay rendered for the "drop here" indicator
 *     - gaps are disabled in dnd-kit collision detection
 *     - SortableRow remains the active target, so dnd-kit's displacement
 *       animation keeps working
 *     - DragDropList highlights the visual gap from the sortable target index,
 *       with a pointer-position fallback for spaces between rows
 *        |
 *        v
 *   useDragDropMonitor observes onDragEnd(event)
 *        |
 *        v
 *   owning layout reads event.operation.source / target and updates its store.
 *
 * Important ownership rule:
 * DragDropList only registers draggable/droppable DOM nodes and reports dnd-kit
 * events. It does not mutate item order. The caller must calculate the final
 * destination index and update the backing data source.
 */
export * from "./DragDropList";
export * from "./DropableBox";
export * from "./SortableRow";
export * from "./Hooks";
export * from "./Types";
export * from "./Utils";
