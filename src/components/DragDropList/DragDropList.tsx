import { useDeferredDragDropMonitor, useInsertionIndicator } from "./Hooks";
import { DragDropListProps, DragDropMonitorHandlers } from "./Types";
import { Box, SxProps, Theme } from "@mui/material";
import { DragDropProvider } from "@dnd-kit/react";
import { DropableBox } from "./DropableBox";
import { SortableRow } from "./SortableRow";
import React from "react";

/**
 * This component provides a drag-and-drop context and renders a list of items that
 * can be dragged and dropped within and between lists. It also renders droppable
 * gaps between items to indicate valid drop targets and support insertion at any
 * position. The list order is not managed internally; callers must update the items prop in response to onDragEnd events.
 *
 * For simple use cases, a flat list with default ids and types, and a single droppable area, this component can be used with minimal configuration. More complex use cases, such as nested lists or multiple item types, require caller-provided ids and types that encode the necessary information to identify the source and target of drag events.
 *
 * This component is designed to be flexible and customizable, but it does not include built-in state management for the list order. Callers are responsible for updating the items prop in response to drag events, which allows for integration with various state management solutions and data structures.
 */
const DragDropListMonitor = React.memo(
  (handlers: DragDropMonitorHandlers): React.JSX.Element => {
    useDeferredDragDropMonitor(handlers);

    return null;
  }
);

/** Performs drag drop list inner. */
function DragDropListInner<T>({
  items,
  setItemId,
  setItemType,
  droppableId,
  renderItem,
  disabled,
  sx = {},
  containerRef,
  withContext = true,
  onDragStart,
  onDragOver,
  onDragEnd,
  insertionDroppable,
  insertionDroppableDisabled,
  insertionDroppableType,
  insertionDropSx,
  insertionDropActiveSx,
  insertionDropCollisionPriority = 1,
  sortablePlugins,
  setInsertionDroppableId,
  setInsertionDropActive,
  setItemElement,
}: DragDropListProps<T>) {
  const {
    end: endInsertionIndicator,
    isActive: isInsertionDropActive,
    over: overInsertionIndicator,
    setItemElement: setInsertionItemElement,
    start: startInsertionIndicator,
  } = useInsertionIndicator({
    enabled: withContext && insertionDroppable && insertionDroppableDisabled,
    itemCount: items.length,
  });
  const itemElementHandler = setItemElement ?? setInsertionItemElement;

  const dropableBoxSx = React.useMemo<SxProps<Theme>>(() => {
    return {
      position: "relative",
      zIndex: 1,
      ...insertionDropSx,
    };
  }, [insertionDropSx]);

  /**
   * Renders a droppable gap before item[index].
   *
   * For a list with N items, this component can render N + 1 gaps:
   * - index 0: before the first item
   * - index N: after the last item
   *
   * The gap id is intentionally separate from sortable item ids. Callers can
   * encode the owning list id and target insertion index in this id, then parse
   * event.operation.target.id in onDragEnd.
   */
  const renderInsertionDrop = React.useCallback(
    (index: number): React.ReactNode => {
      if (!insertionDroppable) {
        return;
      }

      // Default ids are enough for simple flat lists. Nested lists should pass
      // setInsertionDroppableId so each gap is globally unique and decodable.
      const id: string =
        setInsertionDroppableId?.(index) ?? `${droppableId}:${index}`;

      return (
        <DropableBox
          key={`insertion:${id}`}
          id={id}
          disabled={insertionDroppableDisabled}
          // type/accept should match SortableRow.type so only compatible rows
          // can activate this insertion gap.
          type={insertionDroppableType}
          accept={insertionDroppableType}
          sx={dropableBoxSx}
          activeSx={insertionDropActiveSx}
          // active is a caller-controlled override. isDropTarget inside
          // DropableBox also applies activeSx while dnd-kit considers this gap
          // the current target.
          active={
            setInsertionDropActive?.(index) ?? isInsertionDropActive(index)
          }
          collisionPriority={insertionDropCollisionPriority}
        />
      );
    },
    [
      droppableId,
      insertionDroppable,
      insertionDroppableDisabled,
      insertionDroppableType,
      insertionDropActiveSx,
      insertionDropCollisionPriority,
      dropableBoxSx,
      isInsertionDropActive,
      setInsertionDropActive,
      setInsertionDroppableId,
    ]
  );

  const content = (
    <Box ref={containerRef} sx={sx}>
      {/* Gap before the first item. */}
      {renderInsertionDrop(0)}

      {items.map((item, index) => {
        // A stable id is required by dnd-kit. Prefer caller-provided ids, then
        // item.id. SortableRow will create a fallback id only when both are
        // missing, which is fine for non-persistent lists but not ideal for
        // reorderable store data.
        const targetId: string = setItemId?.(item, index) ?? (item as any).id;

        // type identifies which draggable/droppable elements are compatible.
        // If not supplied, each list accepts only rows from its own droppableId.
        const targetType: string = setItemType?.(item, index) ?? droppableId;

        return [
          <SortableRow
            key={`sortable:${targetId ?? index}`}
            id={targetId}
            item={item}
            index={index}
            group={droppableId}
            type={targetType}
            disabled={disabled}
            sortablePlugins={sortablePlugins}
            onItemElement={itemElementHandler}
            renderItem={renderItem}
          />,

          // Gap after this item. The final item produces the "append" gap.
          renderInsertionDrop(index + 1),
        ];
      })}
    </Box>
  );

  const dragStart = React.useCallback(
    (event: any): void => {
      startInsertionIndicator(event);
      onDragStart?.(event);
    },
    [onDragStart, startInsertionIndicator]
  );

  const dragOver = React.useCallback(
    (event: any): void => {
      overInsertionIndicator(event);
      onDragOver?.(event);
    },
    [onDragOver, overInsertionIndicator]
  );

  const dragEnd = React.useCallback(
    (event: any): void => {
      endInsertionIndicator();
      onDragEnd?.(event);
    },
    [endInsertionIndicator, onDragEnd]
  );

  if (!withContext) {
    // Used by nested lists that are already wrapped in an outer
    // DragDropProvider, for example the layer tree.
    return content;
  }

  return (
    <DragDropProvider>
      <DragDropListMonitor
        onDragStart={dragStart}
        onDragOver={dragOver}
        onDragEnd={dragEnd}
      />

      {content}
    </DragDropProvider>
  );
}

/** Renders the DragDropList component. */
export const DragDropList = React.memo(
  DragDropListInner
) as typeof DragDropListInner;
