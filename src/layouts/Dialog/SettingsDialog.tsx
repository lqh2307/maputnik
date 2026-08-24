import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tabs,
} from "@mui/material";
import { StyleSpecification } from "maplibre-gl";
import { useDialogStore, useGlobalStore } from "../../stores";
import { CoordinateInput } from "../../components/CoordinateInput";
import { JSONEditor } from "../../components/JSONEditor";
import { NumberInput } from "../../components/NumberInput";
import { TextInput } from "../../components/TextInput";
import { TooltipButton } from "../../components/TooltipButton";
import { TooltipTab } from "../../components/TooltipTab";
import { JSONValue } from "../../utils/Object";
import { SettingsDialogProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders root style and editor appearance settings dialog. */
export const SettingsDialog = React.memo(
  ({ open = false }: SettingsDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const style = useGlobalStore((state) => {
      return state.style;
    });

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const updateRoot = useGlobalStore((state) => {
      return state.updateRoot;
    });

    const [advanced, setAdvanced] = React.useState(false);

    const advancedValue = React.useMemo(() => {
      return Object.fromEntries(
        Object.entries({
          metadata: style.metadata ?? {},
          light: style.light,
          terrain: style.terrain,
          projection: style.projection,
          transition: style.transition,
        }).filter(([, value]) => {
          return value !== undefined;
        })
      ) as JSONValue;
    }, [style]);

    const close = React.useCallback((): void => {
      updateDialog({
        settings: false,
      });
    }, [updateDialog]);

    const handler = React.useMemo(() => {
      return {
        tabChange: (_: React.SyntheticEvent, value: string): void => {
          setAdvanced(value === "advanced");
        },
        nameChange: (value: string): void => {
          updateRoot({
            name: value,
          });
        },
        glyphsChange: (value: string): void => {
          updateRoot({
            glyphs: value,
          });
        },
        spriteChange: (value: string): void => {
          updateRoot({
            sprite: value,
          });
        },
        longitudeChange: (value: number): void => {
          updateRoot({
            center: [value, style.center?.[1] ?? 0],
          });
        },
        latitudeChange: (value: number): void => {
          updateRoot({
            center: [style.center?.[0] ?? 0, value],
          });
        },
        zoomChange: (value: number): void => {
          updateRoot({
            zoom: value,
          });
        },
        bearingChange: (value: number): void => {
          updateRoot({
            bearing: value,
          });
        },
        pitchChange: (value: number): void => {
          updateRoot({
            pitch: value,
          });
        },
        advancedChange: (value: JSONValue): void => {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            updateRoot(value as Partial<StyleSpecification>);
          }
        },
      };
    }, [style.center, updateRoot]);

    const styles = React.useMemo(() => {
      return {
        tabs: {
          mb: 2,
        },
        advancedBox: {
          height: "58vh",
          minHeight: 420,
          overflow: "hidden",
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

          {!advanced ? (
            <Stack spacing={2}>
              <TextInput
                label={t("dialog.styleName")}
                value={style.name ?? ""}
                onChange={handler.nameChange}
                multiline={false}
                size={"small"}
              />

              <TextInput
                label={t("dialog.glyphsUrl")}
                value={style.glyphs ?? ""}
                onChange={handler.glyphsChange}
                multiline={false}
                size={"small"}
              />

              <TextInput
                label={t("dialog.spriteUrl")}
                value={
                  typeof style.sprite === "string"
                    ? style.sprite
                    : JSON.stringify(style.sprite ?? "")
                }
                onChange={handler.spriteChange}
                multiline={false}
                size={"small"}
              />

              <Stack direction="row" spacing={1}>
                <CoordinateInput
                  decimalLabel={t("dialog.longitude")}
                  value={style.center?.[0] ?? 0}
                  isLat={false}
                  showModeToggle={false}
                  onChange={handler.longitudeChange}
                  size={"small"}
                  fullWidth
                />

                <CoordinateInput
                  decimalLabel={t("dialog.latitude")}
                  value={style.center?.[1] ?? 0}
                  isLat
                  showModeToggle={false}
                  onChange={handler.latitudeChange}
                  size={"small"}
                  fullWidth
                />

                <NumberInput
                  label={t("dialog.zoom")}
                  value={style.zoom ?? 0}
                  onChange={handler.zoomChange}
                  size={"small"}
                  fullWidth
                />
              </Stack>

              <Stack direction="row" spacing={1}>
                <NumberInput
                  label={t("dialog.bearing")}
                  value={style.bearing ?? 0}
                  onChange={handler.bearingChange}
                  size={"small"}
                  fullWidth
                />

                <NumberInput
                  label={t("dialog.pitch")}
                  value={style.pitch ?? 0}
                  onChange={handler.pitchChange}
                  size={"small"}
                  fullWidth
                />
              </Stack>
            </Stack>
          ) : (
            <Box sx={styles.advancedBox}>
              <JSONEditor
                embedded
                title={t("dialog.advanced")}
                value={advancedValue}
                onChange={handler.advancedChange}
              />
            </Box>
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
