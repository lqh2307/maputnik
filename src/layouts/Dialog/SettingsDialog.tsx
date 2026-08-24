import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
} from "@mui/material";
import { StyleSpecification } from "maplibre-gl";
import { JSONEditor } from "../../components/JSONEditor";
import { TooltipButton } from "../../components/TooltipButton";
import { TooltipTab } from "../../components/TooltipTab";
import { JSONValue } from "../../utils/Object";
import { getRootPropertySpecs } from "../Utils";
import { SpecObjectEditor } from "../RightBar/SpecObjectEditor";
import { useDialogStore, useGlobalStore } from "../../stores";
import { SettingsDialogProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the schema-driven root style editor and complete JSON fallback. */
export const SettingsDialog = React.memo(
  ({ open = false }: SettingsDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const style = useGlobalStore((state) => {
      return state.style;
    });

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const updateStyleValue = useGlobalStore((state) => {
      return state.updateStyleValue;
    });

    const replaceStyle = useGlobalStore((state) => {
      return state.replaceStyle;
    });

    const [advanced, setAdvanced] = React.useState(false);

    const close = React.useCallback((): void => {
      updateDialog({
        settings: false,
      });
    }, [updateDialog]);

    const handler = React.useMemo(() => {
      return {
        tabChange: (_event: React.SyntheticEvent, value: string): void => {
          setAdvanced(value === "advanced");
        },
        rootChange: (name: string, value: unknown): void => {
          updateStyleValue([name], value);
        },
        fullStyleChange: (value: JSONValue): void => {
          if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            value.version === 8 &&
            Array.isArray(value.layers) &&
            value.sources &&
            typeof value.sources === "object" &&
            !Array.isArray(value.sources)
          ) {
            replaceStyle(value as StyleSpecification);
          }
        },
      };
    }, [replaceStyle, updateStyleValue]);

    const styles = React.useMemo(() => {
      return {
        tabs: {
          mb: 1,
        },
        editor: {
          height: "58vh",
          minHeight: 420,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
        },
      };
    }, []);

    return (
      <Dialog open={open} onClose={close} fullWidth maxWidth="md">
        <DialogTitle>{t("dialog.settingsTitle")}</DialogTitle>

        <DialogContent dividers>
          <Tabs
            value={advanced ? "advanced" : "general"}
            onChange={handler.tabChange}
            sx={styles.tabs}
          >
            <TooltipTab
              title={t("dialog.general")}
              value="general"
              label={t("dialog.general")}
            />
            <TooltipTab
              title={t("dialog.advanced")}
              value="advanced"
              label={t("dialog.advanced")}
            />
          </Tabs>

          {advanced ? (
            <Box sx={styles.editor}>
              <JSONEditor
                embedded
                title={t("dialog.advanced")}
                value={style as unknown as JSONValue}
                onChange={handler.fullStyleChange}
              />
            </Box>
          ) : (
            <SpecObjectEditor
              value={style as unknown as Record<string, unknown>}
              specs={getRootPropertySpecs()}
              onChange={handler.rootChange}
            />
          )}
        </DialogContent>

        <DialogActions>
          <TooltipButton
            title={t("actions.close")}
            variant={"text"}
            onClick={close}
          >
            {t("actions.close")}
          </TooltipButton>
        </DialogActions>
      </Dialog>
    );
  }
);
