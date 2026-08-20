import { Box, SxProps, Theme } from "@mui/material";
import { useDroppable } from "@dnd-kit/react";
import { DropableBoxProp } from "./Types";
import React from "react";

/** Performs dropable box inner. */
function DropableBoxInner({
  id,
  children,
  sx = {},
  activeSx = {},
  active,
  disabled,
  type,
  accept,
  collisionPriority,
}: DropableBoxProp) {
  // useDroppable expects the latest DOM element reference. Keeping our own ref
  // lets us pass the element object to dnd-kit while still assigning it through
  // the normal React ref callback below.
  const elementRef = React.useRef<Element>(undefined);

  const droppable: any = useDroppable({
    id,
    disabled,
    type,
    accept,
    collisionPriority,
    element: elementRef,
  });
  const { isDropTarget, ref } = droppable;

  const setRef = React.useCallback(
    (element: Element): void => {
      elementRef.current = element;

      // Register the DOM node with dnd-kit so collision detection can include
      // this box as a target.
      ref(element);
    },
    [ref]
  );

  const boxSx = React.useMemo<SxProps<Theme>>(() => {
    return active || (!disabled && isDropTarget)
      ? ({
          ...sx,
          ...activeSx,
        } as SxProps<Theme>)
      : sx;
  }, [active, activeSx, disabled, isDropTarget, sx]);

  return (
    <Box ref={setRef} sx={boxSx}>
      {children}
    </Box>
  );
}

/** Renders the DropableBox component. */
export const DropableBox = React.memo(DropableBoxInner);
