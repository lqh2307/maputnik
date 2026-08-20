import { PositionTooltipProp, TooltipInfo, PositionTooltipAPI } from "./Types";
import { Box, Portal, SxProps, Theme } from "@mui/material";
import { Vector2d } from "konva/lib/types";
import React from "react";

/** Renders the PositionTooltip component. */
export const PositionTooltip = React.memo(
  React.forwardRef<PositionTooltipAPI, PositionTooltipProp>(
    (
      {
        position,
        children,
        container,
        offset = {
          x: 10,
          y: 10,
        },
        sx = {},
        ...props
      },
      ref
    ): React.JSX.Element => {
      const [targetOffset, setTargetOffset] = React.useState<Vector2d>(offset);
      const [targetPosition, setTargetPosition] =
        React.useState<Vector2d>(position);
      const [targetChildren, setTargetChildren] =
        React.useState<React.ReactNode>(children);

      React.useImperativeHandle(ref, () => {
        return {
          update: (info: TooltipInfo): void => {
            setTargetOffset(info.offset ?? offset);

            setTargetPosition(info.position ?? position);

            setTargetChildren(info.children ?? children);
          },
          reset: (): void => {
            setTargetOffset(offset);

            setTargetPosition(position);

            setTargetChildren(children);
          },
        };
      }, [offset, position, children]);

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
          pointerEvents: "none",
          zIndex: 1500,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "0.25rem",
          padding: "0.25rem",
          backgroundColor: "background.paper",
          color: "text.primary",
          fontSize: "12px",
          whiteSpace: "nowrap",
          ...sx,
        } as SxProps<Theme>;
      }, [targetPosition, targetOffset, sx]);

      return (
        <Portal container={container}>
          <Box sx={boxSx} {...props}>
            {targetChildren}
          </Box>
        </Portal>
      );
    }
  )
);
