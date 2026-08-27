import { Box, Stack, Tooltip, SxProps, Theme } from "@mui/material";
import { IconContentProp } from "./Types";
import React from "react";

/** Renders the IconContent component. */
export const IconContent = React.memo(
  ({
    display = "flex",
    title,
    icon,
    children,
    sx = {},
    ...props
  }: IconContentProp): React.JSX.Element => {
    const stackSx = React.useMemo(() => {
      return {
        flexDirection: "row",
        gap: icon ? "1rem" : undefined,
        alignItems: "center",
        width: "100%",
        display,
        ...sx,
      } as SxProps<Theme>;
    }, [sx, display, icon]);

    return (
      <Stack sx={stackSx} {...props}>
        {icon && (
          <Tooltip title={title}>
            <Box>{icon}</Box>
          </Tooltip>
        )}

        {children}
      </Stack>
    );
  }
);
