import { Box, CircularProgress, SxProps, Theme } from "@mui/material";
import { LoadingProp } from "./Types";
import React from "react";

/** Renders the Loading component. */
export const Loading = React.memo(
  ({
    children,
    size = 40,
    open = true,
    sx = {},
    fullParent,
    ...props
  }: LoadingProp): React.JSX.Element => {
    const styles = React.useMemo(() => {
      return {
        inner: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        },
      };
    }, []);

    const boxSx = React.useMemo(() => {
      return {
        zIndex: 1550,
        backgroundColor: "action.hover",
        ...(fullParent
          ? {
              position: "fixed",
              inset: 0,
            }
          : {
              width: "100%",
              height: "100%",
            }),
        pointerEvents: "auto",
        display: open ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      } as SxProps<Theme>;
    }, [sx, fullParent, open]);

    return (
      <Box {...props} sx={boxSx}>
        <Box sx={styles.inner}>
          <CircularProgress color={"inherit"} size={size} />

          {children}
        </Box>
      </Box>
    );
  }
);
