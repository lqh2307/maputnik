import {
  DataObjectRounded,
  FullscreenExitTwoTone,
  FullscreenTwoTone,
  TroubleshootRounded,
} from "@mui/icons-material";
import { Stack } from "@mui/material";
import { setFullscreen } from "../../utils/Window";
import { useDialogStore, useMapModeStore } from "../../stores";
import { ToolbarAction } from "./ToolbarAction";
import { TopBarActionProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders map inspection, JSON, and fullscreen actions. */
export const TopBarAction = React.memo(
  ({ compact = false }: TopBarActionProp): React.JSX.Element => {
    const { t } = useTranslation();

    const translate = React.useCallback(
      (section: string, options?: Record<string, string>): string => {
        return t(`topBar.actions.${section}`, options);
      },
      [t]
    );

    const translateMap = React.useCallback(
      (section: string): string => {
        return t(`topBar.map.${section}`);
      },
      [t]
    );

    const mapMode = useMapModeStore((state) => {
      return state.mapMode;
    });

    const codeEditorOpen = useDialogStore((state) => {
      return state.code;
    });

    const setMapMode = useMapModeStore((state) => {
      return state.setMapMode;
    });

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const [isFullscreen, setIsFullscreen] = React.useState(() => {
      return Boolean(document.fullscreenElement);
    });

    const handleFullscreenChange = React.useCallback(() => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }, []);

    React.useEffect(() => {
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      };
    }, []);

    const handler = React.useMemo(() => {
      return {
        toggleInspect: (): void => {
          setMapMode(mapMode === "inspect" ? "map" : "inspect");
        },
        toggleJson: (): void => {
          updateDialog({
            code: !codeEditorOpen,
          });
        },
        toggleFullscreen: (): void => {
          setFullscreen(!document.fullscreenElement);
        },
      };
    }, [codeEditorOpen, mapMode]);

    const styles = React.useMemo(() => {
      return {
        stack: {
          alignItems: "center",
        },
      };
    }, []);

    return (
      <Stack direction="row" spacing={0.5} sx={styles.stack}>
        <ToolbarAction
          title={translateMap("inspectMode")}
          icon={<TroubleshootRounded />}
          active={mapMode === "inspect"}
          onClick={handler.toggleInspect}
        />

        {compact && (
          <ToolbarAction
            title={translate("editJson")}
            icon={<DataObjectRounded />}
            onClick={handler.toggleJson}
          />
        )}

        <ToolbarAction
          title={translate(isFullscreen ? "exitFullscreen" : "fullscreen")}
          icon={
            isFullscreen ? <FullscreenExitTwoTone /> : <FullscreenTwoTone />
          }
          onClick={handler.toggleFullscreen}
        />
      </Stack>
    );
  }
);
