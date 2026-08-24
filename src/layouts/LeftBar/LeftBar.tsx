import { LayersRounded, StorageRounded } from "@mui/icons-material";
import { Box, Tabs } from "@mui/material";
import { TooltipTab } from "../../components/TooltipTab";
import { useTranslation } from "react-i18next";
import { LayerPanel } from "./LayerPanel";
import { SourcePanel } from "./SourcePanel";
import React from "react";

/** Renders the LeftBar container layout component. */
export const LeftBar = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();
  const [tab, setTab] = React.useState<"layers" | "sources">("layers");

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
      tabs: {
        flexShrink: 0,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      },
      panel: (active: boolean) => {
        return {
          display: active ? "flex" : "none",
          flex: 1,
          minHeight: 0,
        };
      },
    };
  }, []);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.tabs}>
        <Tabs
          value={tab}
          onChange={(_event, value: string) => {
            setTab(value as "layers" | "sources");
          }}
          variant="fullWidth"
        >
          <TooltipTab
            title={t("leftBar.layer")}
            value="layers"
            icon={<LayersRounded fontSize="small" />}
          />
          <TooltipTab
            title={t("leftBar.source")}
            value="sources"
            icon={<StorageRounded fontSize="small" />}
          />
        </Tabs>
      </Box>

      <Box sx={styles.panel(tab === "layers")}>
        <LayerPanel />
      </Box>
      <Box sx={styles.panel(tab === "sources")}>
        <SourcePanel />
      </Box>
    </Box>
  );
});
