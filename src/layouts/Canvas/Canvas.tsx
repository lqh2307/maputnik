import { Box } from "@mui/material";
import { MapCanvas } from "./MapCanvas";
import { FULL_SIZE } from "../../configs/styles";
import React from "react";

/** Renders the map canvas layout container component. */
export const Canvas = React.memo((): React.JSX.Element => {
  const styles = React.useMemo(() => {
    return {
      root: {
        ...FULL_SIZE,
        position: "relative",
        overflow: "hidden",
      },
    };
  }, []);

  return (
    <Box sx={styles.root}>
      <MapCanvas />
    </Box>
  );
});
