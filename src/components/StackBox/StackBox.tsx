import { Stack, SxProps, Theme } from "@mui/material";
import { StackBoxProp } from "./Types";
import React from "react";

/** Renders the StackBox component. */
export const StackBox = React.memo(
  ({
    display = "flex",
    sx = {},
    children,
    ...props
  }: StackBoxProp): React.JSX.Element => {
    const stackSx: SxProps<Theme> = React.useMemo(() => {
      return {
        display: display,
        flexDirection: "row",
        gap: "0.5rem",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        ...sx,
      } as SxProps<Theme>;
    }, [display, sx]);

    return (
      display !== "none" && (
        <Stack {...props} sx={stackSx}>
          {children}
        </Stack>
      )
    );
  }
);
