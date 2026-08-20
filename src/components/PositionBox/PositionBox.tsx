import { PositionBoxAPI, PositionBoxInfo, PositionBoxProp } from "./Types";
import { Box, Portal, SxProps, Theme } from "@mui/material";
import { useEventListener } from "../../hooks";
import { Vector2d } from "konva/lib/types";
import React from "react";

/** Renders the PositionBox component. */
export const PositionBox = React.memo(
  React.forwardRef<PositionBoxAPI, PositionBoxProp>(
    (
      {
        position,
        children,
        container,
        offset = {
          x: 0,
          y: 0,
        },
        sx = {},
        closeOnClickAway,
        closeOnClickInside,
        ...props
      },
      ref
    ): React.JSX.Element => {
      const boxRef = React.useRef<HTMLDivElement>(undefined);
      const [targetOffset, setTargetOffset] = React.useState<Vector2d>(offset);
      const [targetPosition, setTargetPosition] =
        React.useState<Vector2d>(position);
      const [targetChildren, setTargetChildren] =
        React.useState<React.ReactNode>(children);

      React.useImperativeHandle(ref, () => {
        return {
          update: (info?: PositionBoxInfo): void => {
            setTargetOffset(info?.offset ?? offset);

            setTargetPosition(info?.position ?? position);

            setTargetChildren(info?.children ?? children);
          },
          reset: (): void => {
            setTargetOffset(offset);

            setTargetPosition(position);

            setTargetChildren(children);
          },
        };
      }, [children, offset, position]);

      const boxSx = React.useMemo(() => {
        return {
          display: targetPosition ? "flex" : "none",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.25rem",
          overflow: "hidden",
          position: container ? "absolute" : "fixed",
          top: targetPosition?.y
            ? targetPosition.y + targetOffset.y
            : undefined,
          left: targetPosition?.x
            ? targetPosition.x + targetOffset.x
            : undefined,
          zIndex: 1500,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "0.25rem",
          padding: "0.25rem",
          backgroundColor: "background.paper",
          ...sx,
        } as SxProps<Theme>;
      }, [targetPosition, targetOffset, sx]);

      const reset = React.useCallback((): void => {
        setTargetOffset(offset);

        setTargetPosition(position);

        setTargetChildren(children);
      }, [children, offset, position]);

      const isClickInsideBox = React.useCallback(
        (event: MouseEvent): boolean => {
          if (boxRef.current?.contains(event.target as HTMLElement)) {
            return true;
          }

          const clickedElement = document.elementsFromPoint(
            event.clientX,
            event.clientY
          );

          for (const element of clickedElement) {
            if (
              element.classList.contains("MuiPopover-root") ||
              element.classList.contains("MuiPopper-root") ||
              element.classList.contains("MuiMenu-paper") ||
              element.classList.contains("MuiList-root")
            ) {
              return true;
            }
          }

          return false;
        },
        []
      );

      const handleClose = React.useCallback(
        (event?: MouseEvent): void => {
          if (!closeOnClickAway) {
            return;
          }

          if (event && isClickInsideBox(event)) {
            return;
          }

          reset();
        },
        [closeOnClickAway, isClickInsideBox, reset]
      );

      useEventListener(
        targetPosition && closeOnClickAway ? window : undefined,
        "mousedown",
        handleClose
      );

      const onClickHandler = React.useCallback(
        (e: React.MouseEvent<HTMLDivElement>): void => {
          e.stopPropagation();

          if (closeOnClickInside) {
            reset();
          }
        },
        [closeOnClickInside, reset]
      );

      return (
        <Portal container={container}>
          <Box ref={boxRef} onClick={onClickHandler} sx={boxSx} {...props}>
            {targetChildren}
          </Box>
        </Portal>
      );
    }
  )
);
