import { InsertionIndicator, SortableReorder } from "./Types";
import { isSortable } from "@dnd-kit/react/sortable";
import { WindowSize } from "../../types/Window";
import { max, min } from "../../utils/Number";
import { Axis2D } from "../../types/Common";

/** Defines the InsertionLayout type. */
export type InsertionLayout = {
  axis: Axis2D;
  centers: {
    index: number;
    value: number;
  }[];
  itemCount: number;
};

/** Defines the InsertionRectSource type. */
export type InsertionRectSource = Element | DOMRect;

const getInsertionRect = (source: InsertionRectSource): DOMRect => {
  return "getBoundingClientRect" in source
    ? source.getBoundingClientRect()
    : source;
};

/**
 * Resolves the DOM element owned by a dnd-kit sortable source or target.
 *
 * dnd-kit can expose the element through different shapes depending on the
 * event phase. This helper keeps the rest of the drag logic independent from
 * that event detail.
 *
 * Example:
 *
 * const element = getSortableElement(event.operation.source);
 *
 * Result:
 * element === event.operation.source.sortable.element
 *
 * Notes:
 * - Returns `undefined` when the sortable payload does not contain an element.
 * - The helper does not validate whether the payload is sortable.
 *
 * @param sortable
 * dnd-kit sortable source or target payload.
 *
 * @returns
 * The sortable DOM element when it can be resolved.
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export const getSortableElement = (sortable: any): Element => {
  return sortable?.sortable?.element ?? sortable?.element;
};

/**
 * Calculates an element layout box relative to a container.
 *
 * This helper prefers offset-based coordinates when both nodes are HTMLElements
 * in the same DOM tree. It falls back to bounding rect coordinates for SVG,
 * foreign elements, or detached nodes.
 *
 * Example:
 *
 * const box = getElementLayoutBox(rowElement, listElement);
 *
 * Result:
 * {
 *   left: 0,
 *   top: 32,
 *   width: 240,
 *   height: 28
 * }
 *
 * Notes:
 * - Returned `left` and `top` are relative to `containerElement`.
 * - Container scroll is included in the fallback path.
 * - No DOM styles are changed.
 *
 * @param element
 * Element whose layout box should be measured.
 *
 * @param containerElement
 * Container used as the coordinate origin.
 *
 * @returns
 * The element box in container-relative coordinates.
 *
 * Time complexity: O(h)
 * Space complexity: O(1)
 *   - h = number of offset parents between the element and container
 */
export const getElementLayoutBox = (
  element: Element,
  containerElement: Element
): WindowSize => {
  if (
    !(element instanceof HTMLElement) ||
    !(containerElement instanceof HTMLElement) ||
    !containerElement.contains(element)
  ) {
    const rect = element.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();

    return {
      left: rect.left - containerRect.left + containerElement.scrollLeft,
      top: rect.top - containerRect.top + containerElement.scrollTop,
      width: rect.width,
      height: rect.height,
    };
  }

  let left = element.offsetLeft;
  let top = element.offsetTop;
  let offsetParent = element.offsetParent;

  while (
    offsetParent instanceof HTMLElement &&
    offsetParent !== containerElement
  ) {
    left += offsetParent.offsetLeft;
    top += offsetParent.offsetTop;
    offsetParent = offsetParent.offsetParent;
  }

  return {
    left,
    top,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
};

/**
 * Resolves the insertion index when a sortable item is dragged over another
 * sortable item in the same ordered list.
 *
 * The target index is adjusted when the source originally appeared before the
 * target, because removing the source shifts the remaining items left/up by
 * one slot.
 *
 * Example:
 *
 * getSortableInsertionIndex(
 *   { initialIndex: 1 },
 *   { index: 3 }
 * )
 *
 * Result:
 * 4
 *
 * Example:
 *
 * getSortableInsertionIndex(
 *   { initialIndex: 3 },
 *   { index: 1 }
 * )
 *
 * Result:
 * 1
 *
 * Notes:
 * - Returns `undefined` when either payload is not sortable.
 * - Returns `undefined` when required indexes are missing.
 *
 * @param source
 * Sortable item being dragged.
 *
 * @param target
 * Sortable item currently under the pointer.
 *
 * @returns
 * Destination insertion index, or `undefined` when it cannot be calculated.
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export const getSortableInsertionIndex = (source: any, target: any): number => {
  if (
    !isSortable(source) ||
    !isSortable(target) ||
    !Number.isInteger(source.initialIndex) ||
    !Number.isInteger(target.index)
  ) {
    return;
  }

  return source.initialIndex < target.index ? target.index + 1 : target.index;
};

/**
 * Builds a same-container reorder description from a drag end event.
 *
 * This helper validates the dnd-kit event and returns only meaningful reorder
 * operations. Cross-container moves, canceled drags, invalid indexes, and
 * no-op drops are ignored by returning `undefined`.
 *
 * Example:
 *
 * const reorder = getSortableReorder(event, 5, "root");
 *
 * Result:
 * {
 *   sourceDroppableId: "root",
 *   destinationDroppableId: "root",
 *   sourceIndex: 1,
 *   destinationIndex: 3
 * }
 *
 * Notes:
 * - Destination index is clamped to the current list bounds.
 * - `getSourceDroppableId` can restore a source group id from custom payloads.
 * - This helper does not mutate the item array.
 *
 * @param event
 * dnd-kit drag end event.
 *
 * @param itemCount
 * Number of sortable items in the source list.
 *
 * @param rootDroppableId
 * Fallback droppable id used when the sortable payload has no group.
 *
 * @param getSourceDroppableId
 * Optional resolver for the original source droppable id.
 *
 * @returns
 * A reorder operation, or `undefined` when the event should be ignored.
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export const getSortableReorder = (
  event: any,
  itemCount: number,
  rootDroppableId: string,
  getSourceDroppableId?: (source: any) => string
): SortableReorder => {
  if (event?.canceled) {
    return;
  }

  const source: any = event?.operation?.source;

  if (!isSortable(source)) {
    return;
  }

  const sourceDroppableId: string =
    getSourceDroppableId?.(source) ??
    String(source.initialGroup ?? rootDroppableId);
  const destinationDroppableId: string = String(
    source.group ?? rootDroppableId
  );
  const sourceIndex: number = source.initialIndex;
  const destinationIndex: number = source.index;

  if (
    destinationDroppableId !== sourceDroppableId ||
    !Number.isInteger(sourceIndex) ||
    !Number.isInteger(destinationIndex) ||
    sourceIndex < 0 ||
    sourceIndex >= itemCount ||
    itemCount <= 0
  ) {
    return;
  }

  const clampedDestinationIndex: number = max(
    0,
    min(destinationIndex, itemCount - 1)
  );

  if (clampedDestinationIndex === sourceIndex) {
    return;
  }

  return {
    source,
    sourceDroppableId,
    destinationDroppableId,
    sourceIndex,
    destinationIndex: clampedDestinationIndex,
  };
};

/**
 * Creates a compact insertion layout snapshot for pointer-based drop indexes.
 *
 * The layout stores each item center on the dominant axis so future drag-over
 * events can calculate an insertion index without reading every DOM rect again.
 *
 * Example:
 *
 * const layout = createInsertionLayout(itemElements, 3, "y");
 *
 * Result:
 * {
 *   axis: "y",
 *   centers: [
 *     { index: 0, value: 12 },
 *     { index: 1, value: 40 },
 *     { index: 2, value: 68 }
 *   ],
 *   itemCount: 3
 * }
 *
 * Notes:
 * - Empty or hidden elements are ignored.
 * - When `axis` is omitted, the wider total bounds choose `x`; otherwise `y`.
 * - Returned centers are sorted by coordinate, not by original map order.
 *
 * @param itemElements
 * Map from item index to its DOM element.
 *
 * @param itemCount
 * Total number of items in the list.
 *
 * @param axis
 * Optional axis override for horizontal or vertical lists.
 *
 * @returns
 * Insertion layout snapshot, or `undefined` when no measurable items exist.
 *
 * Time complexity: O(n log n)
 * Space complexity: O(n)
 *   - n = number of measurable item elements
 */
export const createInsertionLayout = (
  itemElements: Map<number, Element>,
  itemCount: number,
  axis?: Axis2D
): InsertionLayout => {
  if (!itemElements?.size) {
    return;
  }

  const entries: {
    index: number;
    rect: DOMRect;
  }[] = [];
  const bounds = {
    left: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    top: Number.POSITIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY,
  };

  itemElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    entries.push({
      index,
      rect,
    });

    if (!axis) {
      bounds.left = min(bounds.left, rect.left);
      bounds.right = max(bounds.right, rect.right);
      bounds.top = min(bounds.top, rect.top);
      bounds.bottom = max(bounds.bottom, rect.bottom);
    }
  });

  if (!entries.length) {
    return;
  }

  const resolvedAxis: Axis2D =
    axis ??
    (bounds.right - bounds.left > bounds.bottom - bounds.top ? "x" : "y");

  return {
    axis: resolvedAxis,
    centers: entries
      .map(({ index, rect }) => {
        return {
          index,
          value:
            resolvedAxis === "x"
              ? rect.left + rect.width / 2
              : rect.top + rect.height / 2,
        };
      })
      .sort((a, b) => {
        return a.value - b.value;
      }),
    itemCount,
  };
};

/**
 * Creates a visual insertion indicator that stays bounded to a droppable list.
 *
 * This function combines the current pointer, list bounds, item rectangles,
 * and dnd-kit sortable payloads to decide where the insertion line should be
 * drawn during a drag operation.
 *
 * Example:
 *
 * const indicator = createBoundedInsertionIndicator(
 *   "root",
 *   event.operation.position,
 *   listElement,
 *   itemElements,
 *   event.operation.source,
 *   event.operation.target
 * );
 *
 * Result:
 * {
 *   droppableId: "root",
 *   index: 2,
 *   left: 16,
 *   top: 84,
 *   width: 240
 * }
 *
 * Notes:
 * - Returns `undefined` when the pointer is outside the list tolerance.
 * - Source and target snapshots avoid layout jumps while dnd-kit moves nodes.
 * - The returned coordinates are viewport-based and ready for overlay drawing.
 *
 * @param droppableId
 * Droppable container id that owns the indicator.
 *
 * @param position
 * dnd-kit pointer position payload.
 *
 * @param listElement
 * DOM element for the droppable list.
 *
 * @param itemElements
 * Map from item index to current element or stored rectangle.
 *
 * @param source
 * Sortable item being dragged.
 *
 * @param target
 * Sortable item currently under the pointer.
 *
 * @param sourceSnapshot
 * Optional stored source rectangle from drag start.
 *
 * @param targetSnapshot
 * Optional stored target rectangle from drag over.
 *
 * @returns
 * Insertion indicator geometry, or `undefined` when it should not be shown.
 *
 * Time complexity: O(n)
 * Space complexity: O(n)
 *   - n = number of measurable item rectangles
 */
export const createBoundedInsertionIndicator = (
  droppableId: string,
  position: any,
  listElement: Element,
  itemElements: Map<number, InsertionRectSource>,
  source: any,
  target: any,
  sourceSnapshot?: InsertionRectSource,
  targetSnapshot?: InsertionRectSource
): InsertionIndicator => {
  const point = position?.current;

  if (!point || !listElement || !itemElements?.size) {
    return;
  }

  const listRect = listElement.getBoundingClientRect();

  const bounds = {
    left: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    top: Number.POSITIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY,
  };
  const entries: {
    index: number;
    rect: DOMRect;
  }[] = [];
  const entryRectByIndex: Map<number, DOMRect> = new Map();

  itemElements.forEach((elementOrRect, index) => {
    const rect = getInsertionRect(elementOrRect);

    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    entries.push({
      index,
      rect,
    });

    entryRectByIndex.set(index, rect);

    bounds.left = min(bounds.left, rect.left);
    bounds.right = max(bounds.right, rect.right);
    bounds.top = min(bounds.top, rect.top);
    bounds.bottom = max(bounds.bottom, rect.bottom);
  });
  entries.sort((a, b) => {
    return a.rect.top - b.rect.top;
  });

  if (!entries.length) {
    return;
  }
  const createIndicator = (
    index: number,
    top: number,
    rect?: DOMRect
  ): InsertionIndicator => {
    return {
      droppableId,
      index,
      left: rect?.left ?? bounds.left,
      top,
      width: rect?.width ?? bounds.right - bounds.left,
    };
  };
  const getEntryRect = (index: number): DOMRect => {
    return entryRectByIndex.get(index);
  };
  const sourceInitialIndex: number = source?.initialIndex;
  const sourceElement: Element = getSortableElement(source);
  const sourceEntryRect = getEntryRect(sourceInitialIndex);
  const sourceSnapshotRect = sourceSnapshot
    ? getInsertionRect(sourceSnapshot)
    : undefined;
  const sourceElementRect =
    sourceSnapshotRect ??
    (sourceElement ? getInsertionRect(sourceElement) : undefined);
  const sourceRect =
    sourceElementRect && sourceEntryRect
      ? sourceElementRect.height > sourceEntryRect.height
        ? sourceElementRect
        : sourceEntryRect
      : (sourceElementRect ?? sourceEntryRect);
  const sourceHalfHeight: number = sourceRect?.height
    ? sourceRect.height / 2
    : entries[0].rect.height / 2;
  const sourceExtraHeight: number =
    sourceRect && sourceEntryRect
      ? max(0, sourceRect.height - sourceEntryRect.height)
      : 0;
  if (
    point.x < listRect.left ||
    point.x > listRect.right ||
    point.y < listRect.top - sourceHalfHeight ||
    point.y > listRect.bottom + sourceHalfHeight
  ) {
    return;
  }
  const hasSourceInitialIndex = Number.isInteger(sourceInitialIndex);
  const sourceEntryPosition = hasSourceInitialIndex
    ? entries.findIndex((entry) => {
        return entry.index === sourceInitialIndex;
      })
    : -1;
  const getRemainingEntryRect = (slotIndex: number): DOMRect => {
    const entryPosition =
      sourceEntryPosition >= 0 && slotIndex >= sourceEntryPosition
        ? slotIndex + 1
        : slotIndex;
    const entry = entryPosition >= 0 ? entries[entryPosition] : undefined;

    if (!entry) {
      return;
    }

    if (!sourceExtraHeight || entry.index <= sourceInitialIndex) {
      return entry.rect;
    }

    return DOMRect.fromRect({
      x: entry.rect.left,
      y: entry.rect.top - sourceExtraHeight,
      width: entry.rect.width,
      height: entry.rect.height,
    });
  };
  const getSourceIndexTop = (index: number): number => {
    const sourceIndexRect = getEntryRect(index);

    return sourceIndexRect
      ? sourceIndexRect.top + sourceIndexRect.height / 2
      : undefined;
  };
  const getDropSlotTop = (index: number): number => {
    if (index === sourceInitialIndex) {
      const sourceIndexTop = getSourceIndexTop(index);

      if (sourceIndexTop !== undefined) {
        return sourceIndexTop;
      }
    }

    const slotIndex =
      hasSourceInitialIndex && index > sourceInitialIndex ? index - 1 : index;
    const beforeRect = getRemainingEntryRect(slotIndex - 1);
    const afterRect = getRemainingEntryRect(slotIndex);

    if (beforeRect && afterRect) {
      return beforeRect.bottom + (afterRect.top - beforeRect.bottom) / 2;
    }

    if (afterRect) {
      return afterRect.top - sourceHalfHeight;
    }

    return beforeRect ? beforeRect.bottom + sourceHalfHeight : bounds.top;
  };
  const getSortableInsertionIndicator = (index: number): InsertionIndicator => {
    const targetIndex: number = target?.index;

    if (!Number.isInteger(targetIndex)) {
      return createIndicator(index, getDropSlotTop(index));
    }

    if (index === sourceInitialIndex) {
      const sourceIndexRect = sourceSnapshotRect ?? getEntryRect(index);
      const sourceIndexTop =
        sourceIndexRect?.top !== undefined
          ? sourceIndexRect.top + sourceIndexRect.height / 2
          : undefined;

      if (sourceIndexRect && sourceIndexTop !== undefined) {
        return createIndicator(index, sourceIndexTop, sourceIndexRect);
      }
    }

    const dropSlotTop = getDropSlotTop(index);
    const targetRect = targetSnapshot
      ? getInsertionRect(targetSnapshot)
      : getEntryRect(targetIndex);

    if (!targetRect) {
      return createIndicator(index, dropSlotTop);
    }

    return createIndicator(index, dropSlotTop, targetRect);
  };
  const sortableIndex: number =
    String(target?.group ?? droppableId) === droppableId
      ? getSortableInsertionIndex(source, target)
      : undefined;

  if (Number.isInteger(sortableIndex)) {
    return getSortableInsertionIndicator(sortableIndex);
  }

  for (const { index, rect } of entries) {
    if (point.y < rect.top + rect.height / 2) {
      return createIndicator(index, getDropSlotTop(index), rect);
    }
  }

  return createIndicator(
    entries.length,
    getDropSlotTop(entries.length),
    entries[entries.length - 1]?.rect
  );
};

/**
 * Calculates an insertion index from a pointer position and layout snapshot.
 *
 * The pointer coordinate is compared against each item center on the layout
 * axis. The first center after the pointer becomes the insertion slot.
 *
 * Example:
 *
 * getPointerInsertionIndex(
 *   { current: { x: 0, y: 35 } },
 *   {
 *     axis: "y",
 *     centers: [
 *       { index: 0, value: 20 },
 *       { index: 1, value: 60 }
 *     ],
 *     itemCount: 2
 *   }
 * )
 *
 * Result:
 * 1
 *
 * Notes:
 * - Returns `layout.itemCount` when the pointer is after every center.
 * - Returns `undefined` when the pointer or layout is unavailable.
 *
 * @param position
 * dnd-kit pointer position payload.
 *
 * @param layout
 * Snapshot created by `createInsertionLayout`.
 *
 * @returns
 * Insertion index, or `undefined` when it cannot be calculated.
 *
 * Time complexity: O(log n)
 * Space complexity: O(1)
 *   - n = number of stored centers
 */
export const getPointerInsertionIndex = (
  position: any,
  layout: InsertionLayout
): number => {
  const point = position?.current;

  if (!point || !layout?.centers.length) {
    return;
  }

  const coordinate = point[layout.axis];
  let low = 0;
  let high = layout.centers.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if (coordinate < layout.centers[middle].value) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  return low < layout.centers.length
    ? layout.centers[low].index
    : layout.itemCount;
};
