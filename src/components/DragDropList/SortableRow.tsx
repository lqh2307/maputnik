import { PointerActivationConstraints } from "@dnd-kit/dom";
import { useSortable } from "@dnd-kit/react/sortable";
import { PointerSensor } from "@dnd-kit/react";
import { SortableRowProps } from "./Types";
import { useNanoId } from "../../hooks";
import React from "react";

const SORTABLE_SENSORS: any = [
  PointerSensor.configure({
    activationConstraints: () => {
      return [
        // Require a short movement before dragging starts. This prevents normal
        // clicks, text selection, and context-menu interactions from immediately
        // becoming drag operations.
        new PointerActivationConstraints.Distance({
          value: 5, // Pixels of movement required to activate pointer sensor.
        }),
      ];
    },
  }),
];

/** Performs sortable row inner. */
function SortableRowInner<T>({
  id,
  item,
  index,
  group,
  type,
  disabled,
  sortablePlugins,
  onItemElement,
  renderItem,
}: SortableRowProps<T>) {
  // The fallback keeps the hook usable for simple local lists. Production
  // reorderable data should still provide a stable id through item.id or
  // setItemId so dnd-kit can preserve identity across renders.
  const fallbackId: string = useNanoId();

  const targetId: string = id ?? (item as any).id ?? fallbackId;

  const sortable: any = useSortable({
    id: targetId,
    index,
    // group is the sortable list id. dnd-kit uses it to tell which list the
    // row belongs to and exposes it on event.operation.source.
    group,
    // type/accept controls compatibility with other sortable rows and
    // insertion DropableBox targets.
    type,
    accept: type,
    sensors: SORTABLE_SENSORS,
    disabled,
    plugins: sortablePlugins,
  });

  const itemRef = React.useCallback(
    (element: Element): void => {
      if (!onItemElement) {
        sortable.ref(element);
        return;
      }

      onItemElement(index, element);

      if (element) {
        sortable.ref(element);
      }
    },
    [index, onItemElement, sortable.ref]
  );

  return renderItem({
    id: targetId,
    item,
    index,
    handle: {
      // Attach ref to the element that should move with the sortable item.
      ref: itemRef,
      // Attach handleRef to the smaller interactive element that starts
      // dragging. It can be the same DOM node as ref for full-row dragging.
      handleRef: sortable.handleRef,
    },
    snapshot: {
      // Snapshot flags are passed through so callers can style rows without
      // importing dnd-kit APIs in each layout. Keep them lazy so rows that do
      // not read snapshot flags do not subscribe to dnd-kit's reactive updates.
      get isDragging() {
        return sortable.isDragging;
      },
      get isDropping() {
        return sortable.isDropping;
      },
      get isDragSource() {
        return sortable.isDragSource;
      },
      get isDropTarget() {
        return sortable.isDropTarget;
      },
    },
  });
}

/** Renders the SortableRow component. */
export const SortableRow = React.memo(
  SortableRowInner
) as typeof SortableRowInner;
