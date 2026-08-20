import { Box, Portal, SxProps, Theme } from "@mui/material";
import { RestrictToElement } from "@dnd-kit/dom/modifiers";
import { DraggableBoxProps } from "./Types";
import { useNanoId } from "../../hooks";
import React from "react";
import {
  useDragDropMonitor,
  DragDropProvider,
  DragMoveEvent,
  PointerSensor,
  useDraggable,
  DragEndEvent,
} from "@dnd-kit/react";

/** Renders the draggable content inside its drag/drop context. */
const DraggablePaperContent = ({
  id,
  defaultPosition = {
    x: 10,
    y: 10,
  },
  children,
  containerRef,
  draggable = true,
  sx = {},
  ...props
}: DraggableBoxProps): React.JSX.Element => {
  const targetId: string = id ?? useNanoId();

  const [position, setPosition] = React.useState(defaultPosition);
  const [transform, setTransform] = React.useState(() => {
    return {
      x: 0,
      y: 0,
    };
  });

  const modifiers = React.useMemo(() => {
    return [
      RestrictToElement.configure({
        element: () => {
          return containerRef?.current;
        },
      }),
    ];
  }, [containerRef]);

  const sensors = React.useMemo(() => {
    return [
      PointerSensor.configure({
        preventActivation: (e: PointerEvent) => {
          const target: Element = e.target as Element;

          return !!target?.closest?.(".cannot-draggable");
        },
      }),
    ];
  }, []);

  const { ref, handleRef, isDragging } = useDraggable({
    id: targetId,
    disabled: !draggable,
    modifiers,
    sensors,
  });

  useDragDropMonitor(
    React.useMemo(() => {
      return {
        onDragMove: (event: DragMoveEvent) => {
          if (String(event.operation.source?.id) !== targetId) {
            return;
          }

          setTransform(event.operation.transform);
        },
        onDragEnd: (event: DragEndEvent) => {
          if (String(event.operation.source?.id) !== targetId) {
            return;
          }

          const { x, y } = event.operation.transform;

          setPosition((p) => {
            return {
              x: p.x + x,
              y: p.y + y,
            };
          });

          setTransform({
            x: 0,
            y: 0,
          });
        },
      };
    }, [targetId])
  );

  const boxSx = React.useMemo(() => {
    return {
      cursor: draggable ? (isDragging ? "grabbing" : "move") : "default",
      userSelect: "none",
      position: "absolute",
      top: position.y,
      left: position.x,
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      touchAction: "none",
      zIndex: 1500,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "0.25rem",
      padding: "0.25rem",
      backgroundColor: "background.paper",
      ...sx,
    } as SxProps<Theme>;
  }, [draggable, isDragging, position, transform, sx]);

  const createRef = React.useCallback(
    (el: Element) => {
      ref(el);

      handleRef(el);
    },
    [ref, handleRef]
  );

  return (
    <Portal container={containerRef?.current}>
      <Box ref={createRef} {...props} sx={boxSx}>
        {children}
      </Box>
    </Portal>
  );
};

/** Renders the DraggablePaper component. */
export const DraggablePaper = React.memo(
  (props: DraggableBoxProps): React.JSX.Element => {
    return (
      <DragDropProvider>
        <DraggablePaperContent {...props} />
      </DragDropProvider>
    );
  }
);
