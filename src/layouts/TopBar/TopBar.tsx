import { Box, Divider, Stack, useMediaQuery, useTheme } from "@mui/material";
import { TopBarHistory } from "./History";
import { TopBarAction } from "./Action";
import { TopBarTools } from "./Tools";
import { TopBarIO } from "./IO";
import { TopBarGeocoding } from "./Geocoding";
import { useElementResize } from "../../hooks";
import React from "react";

/** Renders the complete TopBar layout component. */
export const TopBar = React.memo((): React.JSX.Element => {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));
  const [isOverflowing, setIsOverflowing] = React.useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(undefined);

  const checkOverflow = React.useCallback(() => {
    const menu = menuRef.current;

    setIsOverflowing(Boolean(menu && menu.scrollWidth > menu.clientWidth));
  }, []);

  useElementResize(menuRef, checkOverflow);

  const styles = React.useMemo(() => {
    return {
      root: {
        display: "flex",
        width: "100%",
        height: "100%",
        minWidth: 0,
        overflow: "hidden",
        bgcolor: "background.paper",
        color: "text.primary",
      },
      menu: {
        display: "flex",
        alignItems: "center",
        overflowX: "auto",
        overflowY: "hidden",
        minWidth: 0,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        px: 1,
      },
    };
  }, []);

  const menuSx = React.useMemo(() => {
    return {
      ...styles.menu,
      justifyContent: isOverflowing ? "flex-start" : "center",
    };
  }, [isOverflowing, styles.menu]);

  return (
    <Box sx={styles.root}>
      <Stack
        ref={menuRef}
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={1}
        sx={menuSx}
      >
        {/* File actions */}
        <TopBarIO />

        {/* History and layer clipboard */}
        <TopBarHistory />

        {/* JSON, source, and style tools */}
        <TopBarTools compact={compact} />

        {/* Location search */}
        <TopBarGeocoding />

        {/* Map interaction and global editor actions */}
        <TopBarAction compact={compact} />
      </Stack>
    </Box>
  );
});
