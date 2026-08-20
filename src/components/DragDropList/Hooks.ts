import { DragDropMonitorHandlers, InsertionIndicator } from "./Types";
import { WindowSize } from "../../types/Window";
import React from "react";
import {
  useDragDropMonitor,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/react";
import {
  createBoundedInsertionIndicator,
  getSortableInsertionIndex,
  getPointerInsertionIndex,
  createInsertionLayout,
  getElementLayoutBox,
  InsertionRectSource,
  getSortableElement,
  InsertionLayout,
} from "./Utils";

/** Performs use raf style overlay. */
function useRafStyleOverlay<T>({
  apply,
  onClear,
  onCleanup,
}: {
  apply: (element: HTMLDivElement, value: T) => void;
  onClear?: () => void;
  onCleanup?: () => void;
}) {
  const frameRef = React.useRef<number>(undefined);
  const overlayRef = React.useRef<HTMLDivElement>(undefined);
  const pendingValueRef = React.useRef<T>(undefined);

  const hide = React.useCallback((): void => {
    overlayRef.current?.style.setProperty("display", "none");
  }, []);

  const schedule = React.useCallback(
    (value?: T): void => {
      pendingValueRef.current = value;

      if (frameRef.current !== undefined) {
        return;
      }

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = undefined;

        const element = overlayRef.current;
        const pendingValue = pendingValueRef.current;

        if (!element || pendingValue === undefined) {
          hide();
          return;
        }

        element.style.setProperty("display", "block");

        apply(element, pendingValue);
      });
    },
    [apply, hide]
  );

  const clear = React.useCallback((): void => {
    pendingValueRef.current = undefined;

    onClear?.();

    if (frameRef.current !== undefined) {
      cancelAnimationFrame(frameRef.current);

      frameRef.current = undefined;
    }

    hide();
  }, [hide, onClear]);

  React.useEffect(() => {
    return () => {
      clear();
      onCleanup?.();
    };
  }, [clear, onCleanup]);

  return React.useMemo(() => {
    return {
      clear,
      overlayRef,
      schedule,
    };
  }, [clear, schedule]);
}

/** React hook for sortable target overlay. */
export function useSortableTargetOverlay({
  droppableId,
}: {
  droppableId: string;
}) {
  const containerElementRef = React.useRef<Element>(undefined);
  const applyOverlayStyle = React.useCallback(
    (element: HTMLDivElement, rect: WindowSize): void => {
      element.style.left = `${rect.left}px`;
      element.style.top = `${rect.top}px`;
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
    },
    []
  );
  const { clear, overlayRef, schedule } = useRafStyleOverlay<WindowSize>({
    apply: applyOverlayStyle,
  });

  const setContainerElement = React.useCallback((element: Element): void => {
    containerElementRef.current = element;
  }, []);

  const updateFromEvent = React.useCallback(
    (event: DragStartEvent | DragOverEvent): void => {
      const target: any = event.operation.target;
      const targetElement: Element = getSortableElement(target);

      if (
        String(target?.group ?? droppableId) !== droppableId ||
        !targetElement
      ) {
        schedule();

        return;
      }

      const containerElement = containerElementRef.current;

      if (!containerElement) {
        schedule();

        return;
      }

      schedule(getElementLayoutBox(targetElement, containerElement));
    },
    [droppableId, schedule]
  );

  return React.useMemo(() => {
    return {
      dragEnd: clear,
      dragOver: updateFromEvent,
      dragStart: updateFromEvent,
      overlayRef,
      setContainerElement,
    };
  }, [clear, updateFromEvent]);
}

/** React hook for bounded insertion overlay. */
export function useBoundedInsertionOverlay({
  getSourceDroppableId,
  getItemElement,
  getTargetElement,
}: {
  getSourceDroppableId: (source: any) => string;
  getItemElement?: (element: Element) => Element;
  getTargetElement?: (element: Element) => Element;
}) {
  const itemElementByDropRef = React.useRef<Map<string, Map<number, Element>>>(
    new Map()
  );
  const itemRectByDropRef = React.useRef<
    Map<string, Map<number, InsertionRectSource>>
  >(new Map());
  const listElementByDropRef = React.useRef<Map<string, Element>>(new Map());
  const dropTaskRef = React.useRef<number>(0);

  const applyOverlayStyle = React.useCallback(
    (element: HTMLDivElement, indicator: InsertionIndicator): void => {
      element.style.left = `${indicator.left}px`;
      element.style.top = `${indicator.top}px`;
      element.style.width = `${indicator.width}px`;
    },
    []
  );
  const clearItemRects = React.useCallback((): void => {
    itemRectByDropRef.current.clear();
  }, []);
  const cancelDeferredDrop = React.useCallback((): void => {
    dropTaskRef.current++;
  }, []);
  const { clear, overlayRef, schedule } =
    useRafStyleOverlay<InsertionIndicator>({
      apply: applyOverlayStyle,
      onClear: clearItemRects,
      onCleanup: cancelDeferredDrop,
    });

  const deferDrop = React.useCallback((callback: () => void): void => {
    const task = dropTaskRef.current + 1;

    dropTaskRef.current = task;

    queueMicrotask(() => {
      if (dropTaskRef.current !== task) {
        return;
      }

      callback();
    });
  }, []);

  const registerListElement = React.useCallback(
    (droppableId: string, element: Element): void => {
      if (element) {
        listElementByDropRef.current.set(droppableId, element);
      } else {
        listElementByDropRef.current.delete(droppableId);
      }
    },
    []
  );

  const registerItemElement = React.useCallback(
    (droppableId: string, index: number, element: Element): void => {
      if (!element) {
        itemElementByDropRef.current.get(droppableId)?.delete(index);
        return;
      }

      const itemElement: Element = getItemElement?.(element) ?? element;
      let itemElementByIndex = itemElementByDropRef.current.get(droppableId);

      if (!itemElementByIndex) {
        itemElementByIndex = new Map();
        itemElementByDropRef.current.set(droppableId, itemElementByIndex);
      }

      itemElementByIndex.set(index, itemElement);
    },
    [getItemElement]
  );

  const dragStart = React.useCallback(
    (event: DragStartEvent): void => {
      const droppableId: string = getSourceDroppableId(event.operation.source);
      const itemElementByIndex = itemElementByDropRef.current.get(droppableId);
      const rectByIndex: Map<number, InsertionRectSource> = new Map();

      itemElementByIndex?.forEach((element, index) => {
        rectByIndex.set(index, element.getBoundingClientRect());
      });

      itemRectByDropRef.current = rectByIndex.size
        ? new Map([[droppableId, rectByIndex]])
        : new Map();
    },
    [getSourceDroppableId]
  );

  const dragOver = React.useCallback(
    (event: DragOverEvent): void => {
      const source: any = event.operation.source;
      const target: any = event.operation.target;
      const droppableId: string = getSourceDroppableId(source);
      const itemElements: Map<number, Element> =
        itemElementByDropRef.current.get(droppableId);
      const listElement: Element =
        listElementByDropRef.current.get(droppableId);

      if (!itemElements || !listElement) {
        schedule(undefined);
        return;
      }

      const sourceSnapshot: InsertionRectSource = itemRectByDropRef.current
        .get(droppableId)
        ?.get(source?.initialIndex);
      const targetElement: Element = getSortableElement(target);

      schedule(
        createBoundedInsertionIndicator(
          droppableId,
          event.operation.position,
          listElement,
          itemElements,
          source,
          target,
          sourceSnapshot,
          targetElement
            ? (getTargetElement?.(targetElement) ?? targetElement)
            : undefined
        )
      );
    },
    [getSourceDroppableId, getTargetElement, schedule]
  );

  return React.useMemo(() => {
    return {
      clear,
      deferDrop,
      dragStart,
      dragOver,
      overlayRef,
      registerItemElement,
      registerListElement,
    };
  }, [
    clear,
    deferDrop,
    dragStart,
    dragOver,
    registerItemElement,
    registerListElement,
  ]);
}

/**
 * Registers drag/drop monitor handlers that run after the current event tick.
 *
 * dnd-kit monitor callbacks can fire while React and dnd-kit are still
 * finalizing internal state. This hook defers each provided handler with a
 * zero-delay timer and always calls the latest handler reference.
 *
 * Example:
 *
 * useDeferredDragDropMonitor({
 *   onDragStart: handleDragStart,
 *   onDragOver: handleDragOver,
 *   onDragEnd: handleDragEnd,
 * });
 *
 * Result:
 * onDragStart/onDragOver/onDragEnd are subscribed to dnd-kit and invoked on
 * the next macrotask with the original event payload.
 *
 * Notes:
 * - Handler changes do not re-register the monitor callbacks.
 * - Pending timers are cleared when the component unmounts.
 * - Missing handlers are ignored.
 *
 * @param handlers
 * Optional dnd-kit monitor handlers to invoke after the current event tick.
 *
 * @returns
 * Nothing. The hook only registers side effects.
 *
 * Time complexity: O(1) per event
 * Space complexity: O(t)
 *   - t = number of pending deferred callbacks
 */
export function useDeferredDragDropMonitor(
  handlers: DragDropMonitorHandlers
): void {
  const handlersRef = React.useRef<DragDropMonitorHandlers>(handlers);
  const timersRef = React.useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  /**
   * Keep the latest callback available for deferred execution, but don't trigger re-renders when it changes.
   */
  React.useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const defer = React.useCallback(
    (handlerName: keyof DragDropMonitorHandlers, event: any): void => {
      const handler: any = handlersRef.current[handlerName];
      if (!handler) {
        return;
      }

      const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
        timersRef.current.delete(timer);

        handler(event);
      }, 0);

      timersRef.current.add(timer);
    },
    []
  );

  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => {
        return clearTimeout(timer);
      });
      timersRef.current.clear();
    };
  }, []);

  useDragDropMonitor(
    React.useMemo<DragDropMonitorHandlers>(() => {
      return {
        onDragStart: (event) => {
          return defer("onDragStart", event);
        },
        onDragOver: (event) => {
          return defer("onDragOver", event);
        },
        onDragEnd: (event) => {
          return defer("onDragEnd", event);
        },
      };
    }, [defer])
  );
}

/**
 * Tracks the active insertion index for a sortable list.
 *
 * The hook stores item elements, snapshots their layout when dragging starts,
 * and updates the active insertion slot during drag-over events. Updates are
 * scheduled with `requestAnimationFrame` so rapid pointer movement does not
 * force a state update for every raw event.
 *
 * Example:
 *
 * const insertion = useInsertionIndicator({
 *   enabled: true,
 *   itemCount: items.length,
 * });
 *
 * insertion.setItemElement(index, element);
 * insertion.start(event);
 * insertion.over(event);
 * insertion.isActive(index);
 * insertion.end();
 *
 * Result:
 * `isActive(index)` returns true for the slot where the insertion indicator
 * should be rendered.
 *
 * Notes:
 * - The hook does nothing while `enabled` is false.
 * - Registered elements are kept in a ref to avoid re-rendering on every row.
 * - Timers and animation frames are cleaned up on unmount.
 *
 * @param options
 * Hook configuration.
 *
 * @param options.enabled
 * Whether insertion tracking should be active.
 *
 * @param options.itemCount
 * Number of items in the sortable list.
 *
 * @returns
 * Stable callbacks for list rows and dnd-kit monitor events.
 *
 * Time complexity: O(n) when a layout snapshot is created, O(1) otherwise
 * Space complexity: O(n)
 *   - n = number of registered item elements
 */
export function useInsertionIndicator({
  enabled,
  itemCount,
}: {
  enabled: boolean;
  itemCount: number;
}) {
  const [activeIndex, setActiveIndex] = React.useState<number>(undefined);
  const itemElementsRef = React.useRef<Map<number, Element>>(new Map());
  const insertionLayoutRef = React.useRef<InsertionLayout>(undefined);
  const frameRef = React.useRef<number>(undefined);
  const clearTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingIndexRef = React.useRef<number>(undefined);

  const schedule = React.useCallback((index: number): void => {
    pendingIndexRef.current = index;

    if (clearTimerRef.current !== undefined) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = undefined;
    }

    if (frameRef.current !== undefined) {
      return;
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = undefined;
      setActiveIndex(pendingIndexRef.current);
    });
  }, []);

  const clear = React.useCallback((): void => {
    pendingIndexRef.current = undefined;

    if (frameRef.current !== undefined) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }

    if (clearTimerRef.current !== undefined) {
      clearTimeout(clearTimerRef.current);
    }

    clearTimerRef.current = setTimeout(() => {
      clearTimerRef.current = undefined;
      setActiveIndex(undefined);
    }, 0);
  }, []);

  React.useEffect(() => {
    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }

      if (clearTimerRef.current !== undefined) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  const setItemElement = React.useCallback(
    (index: number, element: Element): void => {
      if (!enabled) {
        return;
      }

      if (element) {
        itemElementsRef.current.set(index, element);
      } else {
        itemElementsRef.current.delete(index);
      }
    },
    [enabled]
  );

  const start = React.useCallback(
    (event: any): void => {
      if (!enabled) {
        return;
      }

      insertionLayoutRef.current = createInsertionLayout(
        itemElementsRef.current,
        itemCount
      );

      schedule(
        getSortableInsertionIndex(
          event.operation.source,
          event.operation.target
        ) ??
          getPointerInsertionIndex(
            event.operation.position,
            insertionLayoutRef.current
          )
      );
    },
    [enabled, itemCount, schedule]
  );

  const over = React.useCallback(
    (event: any): void => {
      if (!enabled) {
        return;
      }

      const sortableIndex = getSortableInsertionIndex(
        event.operation.source,
        event.operation.target
      );

      if (Number.isInteger(sortableIndex)) {
        schedule(sortableIndex);
        return;
      }

      insertionLayoutRef.current ??= createInsertionLayout(
        itemElementsRef.current,
        itemCount
      );

      schedule(
        getPointerInsertionIndex(
          event.operation.position,
          insertionLayoutRef.current
        )
      );
    },
    [enabled, itemCount, schedule]
  );

  const end = React.useCallback((): void => {
    if (!enabled) {
      return;
    }

    clear();
    insertionLayoutRef.current = undefined;
  }, [clear, enabled]);

  const isActive = React.useCallback(
    (index: number): boolean => {
      return enabled && activeIndex === index;
    },
    [activeIndex, enabled]
  );

  return React.useMemo(() => {
    return {
      end,
      isActive,
      over,
      setItemElement,
      start,
    };
  }, [end, isActive, over, setItemElement, start]);
}
