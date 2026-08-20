import { Box } from "@mui/material";
import { LayerPanel } from "./LayerPanel";
import React from "react";

/** Renders the LeftBar container layout component. */
export const LeftBar = React.memo((): React.JSX.Element => {
  const styles = React.useMemo(() => {
    return {
      root: {
        width: 300,
        minWidth: 260,
        height: "100%",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      },
    };
  }, []);

  return (
    <Box sx={styles.root}>
      <LayerPanel />
    </Box>
  );
});
