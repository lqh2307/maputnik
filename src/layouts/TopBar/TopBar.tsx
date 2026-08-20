import { AppBar, Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { TopBarHistory } from "./History";
import { TopBarAction } from "./Action";
import { TopBarTools } from "./Tools";
import { TopBarBrand } from "./Brand";
import { TopBarIO } from "./IO";
import React from "react";

/** Renders the complete TopBar layout component. */
export const TopBar = React.memo((): React.JSX.Element => {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));

  const styles = React.useMemo(() => {
    return {
      root: {
        borderBottom: 1,
        borderColor: "divider",
        zIndex: 3,
      },
      toolbar: {
        minHeight: 52,
        gap: 1,
        px: 1.5,
      },
      spacer: {
        flex: 1,
      },
    };
  }, []);

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={styles.root}>
      <Toolbar variant="dense" sx={styles.toolbar}>
        <TopBarBrand />

        <TopBarIO />

        <TopBarHistory />

        <TopBarTools compact={compact} />

        <Box sx={styles.spacer} />

        <TopBarAction compact={compact} />
      </Toolbar>
    </AppBar>
  );
});
