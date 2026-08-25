import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { LayerSpecification } from "maplibre-gl";
import { SelectInput } from "../../components/SelectInput";
import { TooltipButton } from "../../components/TooltipButton";
import { useGlobalStore } from "../../stores";
import { sourceSupportsLayer } from "../Utils";
import { LAYER_TYPES } from "../Constants";
import { AddLayerDialogProp } from "./Types";
import { LayerTypeIcon } from "./LayerTypeIcon";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the layer type and source picker dialog. */
export const AddLayerDialog = React.memo(
  ({ open, onClose }: AddLayerDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const sources = useGlobalStore((state) => {
      return state.style.sources;
    });

    const addLayer = useGlobalStore((state) => {
      return state.addLayer;
    });

    const [type, setType] = React.useState<LayerSpecification["type"]>("fill");
    const [sourceId, setSourceId] = React.useState("");

    const compatibleSources = React.useMemo(() => {
      return Object.entries(sources).filter(([, source]) => {
        return sourceSupportsLayer(source, type);
      });
    }, [sources, type]);

    React.useEffect(() => {
      if (type === "background") {
        setSourceId("");
      } else if (
        !compatibleSources.some(([id]) => {
          return id === sourceId;
        })
      ) {
        setSourceId(compatibleSources[0]?.[0] ?? "");
      }
    }, [type, sourceId, compatibleSources]);

    const submit = React.useCallback(() => {
      addLayer(type, sourceId || undefined);
      onClose();
    }, [onClose, sourceId, type]);

    const styles = React.useMemo(() => {
      return {
        content: {
          pt: 1,
        },
        item: {
          alignItems: "center",
        },
      };
    }, []);

    const handler = React.useMemo(() => {
      return {
        typeChange: (value: string): void => {
          setType(value as LayerSpecification["type"]);
        },
        sourceChange: (value: string): void => {
          setSourceId(value);
        },
      };
    }, []);

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>{t("leftBar.layers.addTitle")}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={styles.content}>
            <SelectInput
              label={t("leftBar.layers.type")}
              value={type}
              onChange={handler.typeChange}
              options={LAYER_TYPES.map((value) => {
                return {
                  value,
                  title: t(`common.layerType.${value}`),
                  menuItemProp: {
                    children: (
                      <Stack direction="row" spacing={1} sx={styles.item}>
                        <LayerTypeIcon type={value} fontSize={"small"} />
                        <span>{t(`common.layerType.${value}`)}</span>
                      </Stack>
                    ),
                  },
                };
              })}
            />

            {type !== "background" && (
              <SelectInput
                label={t("leftBar.layers.source")}
                value={sourceId}
                onChange={handler.sourceChange}
                options={compatibleSources.map(([id]) => {
                  return {
                    title: id,
                    value: id,
                  };
                })}
              />
            )}

            {type !== "background" && compatibleSources.length === 0 && (
              <Typography variant={"body2"} color={"warning.main"}>
                {t("leftBar.layers.sourceRequired")}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <TooltipButton
            title={t("topBar.actions.cancel")}
            variant={"text"}
            onClick={onClose}
          >
            {t("topBar.actions.cancel")}
          </TooltipButton>

          <TooltipButton
            title={t("leftBar.layers.addTitle")}
            variant={"contained"}
            onClick={submit}
            disabled={type !== "background" && !sourceId}
          >
            {t("leftBar.layers.addTitle")}
          </TooltipButton>
        </DialogActions>
      </Dialog>
    );
  }
);
