import {
  DarkModeRounded,
  DataObjectRounded,
  HelpOutlineRounded,
  LightModeRounded,
  MapRounded,
  SettingsRounded,
  TranslateRounded,
  TroubleshootRounded,
} from "@mui/icons-material";
import { Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  useDialogStore,
  useLanguageStore,
  useMapModeStore,
  useThemeStore,
} from "../../stores";
import { ToolbarAction } from "./ToolbarAction";
import { TopBarActionProp } from "./Types";
import { useTranslation } from "react-i18next";
import { MapMode } from "../Types";
import React from "react";

/** Renders global editor actions: Map/Inspect mode switcher, Theme toggle, Language toggle, Shortcuts. */
export const TopBarAction = React.memo(
  ({ compact = false }: TopBarActionProp): React.JSX.Element => {
    const { t } = useTranslation();

    const mapMode = useMapModeStore((state) => {
      return state.mapMode;
    });

    const theme = useThemeStore((state) => {
      return state.themeMode;
    });

    const language = useLanguageStore((state) => {
      return state.language;
    });

    const codeEditorOpen = useDialogStore((state) => {
      return state.code;
    });

    const setMapMode = useMapModeStore((state) => {
      return state.setMapMode;
    });

    const setTheme = useThemeStore((state) => {
      return state.setTheme;
    });

    const setLanguage = useLanguageStore((state) => {
      return state.setLanguage;
    });

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const handler = React.useMemo(() => {
      return {
        mapMode: (
          _event: React.MouseEvent<HTMLElement>,
          value: MapMode
        ): void => {
          if (value) {
            setMapMode(value);
          }
        },
        toggleJson: (): void => {
          updateDialog({
            code: !codeEditorOpen,
          });
        },
        settings: (): void => {
          updateDialog({
            settings: true,
          });
        },
        cycleTheme: (): void => {
          setTheme(
            theme === "system"
              ? "black"
              : theme === "black"
                ? "blue"
                : theme === "blue"
                  ? "grey"
                  : theme === "grey"
                    ? "white"
                    : "system"
          );
        },
        toggleLanguage: (): void => {
          setLanguage(language === "english" ? "vietnamese" : "english");
        },
        shortcuts: (): void => {
          updateDialog({
            shortcuts: true,
          });
        },
      };
    }, [
      codeEditorOpen,
      language,
      setLanguage,
      setMapMode,
      setTheme,
      theme,
      updateDialog,
    ]);

    const styles = React.useMemo(() => {
      return {
        stack: {
          alignItems: "center",
        },
        modeGroup: {
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          overflow: "hidden",
          "& .MuiToggleButton-root": {
            border: 0,
            borderRadius: 0,
            minWidth: 34,
            px: 0.75,
            "& + .MuiToggleButton-root": {
              borderLeft: 1,
              borderColor: "divider",
            },
          },
        },
      };
    }, []);

    return (
      <Stack direction="row" spacing={0.5} sx={styles.stack}>
        <ToggleButtonGroup
          exclusive
          size={"small"}
          value={mapMode}
          onChange={handler.mapMode}
          aria-label={t("map.interaction")}
          sx={styles.modeGroup}
        >
          <ToggleButton value="map" aria-label={t("map.mode")}>
            <MapRounded fontSize={"small"} />
          </ToggleButton>

          <ToggleButton value="inspect" aria-label={t("map.inspectMode")}>
            <TroubleshootRounded fontSize={"small"} />
          </ToggleButton>
        </ToggleButtonGroup>

        {compact && (
          <ToolbarAction
            title={t("actions.editJson")}
            icon={<DataObjectRounded />}
            onClick={handler.toggleJson}
          />
        )}

        <ToolbarAction
          title={t("actions.settings")}
          icon={<SettingsRounded />}
          onClick={handler.settings}
        />

        <ToolbarAction
          title={t("actions.theme", {
            theme,
          })}
          icon={theme === "black" ? <DarkModeRounded /> : <LightModeRounded />}
          onClick={handler.cycleTheme}
        />

        <ToolbarAction
          title={t("actions.language")}
          icon={<TranslateRounded />}
          onClick={handler.toggleLanguage}
        />

        <ToolbarAction
          title={t("actions.shortcuts")}
          icon={<HelpOutlineRounded />}
          onClick={handler.shortcuts}
        />
      </Stack>
    );
  }
);
