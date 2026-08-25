import { Box, Divider, Stack, useMediaQuery, useTheme } from "@mui/material";
import { TopBarHistory } from "./History";
import { TopBarAction } from "./Action";
import { TopBarTools } from "./Tools";
import { TopBarIO } from "./IO";
import { TopBarGeocoding } from "./Geocoding";
import { TopBarGeneralSetting } from "./GeneralSetting";
import { TopBarHelp } from "./Help";
import { TopBarClose } from "./Close";
import { TopBarProfile } from "./Profile";
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
        flexDirection: "row",
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
        width: "90%",
        height: "100%",
        boxSizing: "border-box",
        px: 1,
      },
      profile: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        width: "10%",
        minWidth: 48,
        height: "100%",
        boxSizing: "border-box",
        borderLeft: 1,
        borderColor: "divider",
      },
      group: {
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        gap: 0.5,
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
        <Stack direction="row" sx={styles.group}>
          <TopBarIO />
        </Stack>

        {/* Editing and style data */}
        <Stack direction="row" sx={styles.group}>
          <TopBarHistory />

          <TopBarTools compact={compact} />
        </Stack>

        {/* Map search and viewport actions */}
        <Stack direction="row" sx={styles.group}>
          <TopBarGeocoding />

          <TopBarAction compact={compact} />
        </Stack>

        {/* Application actions */}
        <Stack direction="row" sx={styles.group}>
          <TopBarGeneralSetting />

          <TopBarHelp />

          <TopBarClose />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={styles.profile}>
        <TopBarProfile />
      </Stack>
    </Box>
  );
});
