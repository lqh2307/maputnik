import { Box } from "@mui/material";
import { PropertyPanel } from "./PropertyPanel";
import React from "react";

/** Renders the RightBar container layout component. */
export const RightBar = React.memo((): React.JSX.Element => {
  const styles = React.useMemo(() => {
    return {
      root: {
        width: "100%",
        minWidth: 0,
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
      <PropertyPanel />
    </Box>
  );
});
