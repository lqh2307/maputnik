import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
  StorageRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { useDialogStore, useGlobalStore } from "../../stores";
import { TooltipButton } from "../../components/TooltipButton";
import { SourcesDialogProp, SourceDraft } from "./Types";
import { SourceEditor } from "./SourceEditor";
import { useTranslation } from "react-i18next";
import React from "react";
import { TOOLBAR_ICON_BUTTON_STYLE } from "../../configs";

const EMPTY_SOURCES: Record<string, SourceSpecification> = {};
const EMPTY_LAYERS: LayerSpecification[] = [];

/** Renders source management dialog for the current style document. */
export const SourcesDialog = React.memo(
  ({ open = false }: SourcesDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const sources =
      useGlobalStore((state) => {
        return open ? state.style.sources : undefined;
      }) ?? EMPTY_SOURCES;

    const layers =
      useGlobalStore((state) => {
        return open ? state.style.layers : undefined;
      }) ?? EMPTY_LAYERS;

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const deleteSource = useGlobalStore((state) => {
      return state.deleteSource;
    });

    const [draft, setDraft] = React.useState<SourceDraft>();
    const [adding, setAdding] = React.useState(false);

    const closeEditor = React.useCallback((): void => {
      setAdding(false);
      setDraft(undefined);
    }, []);

    const close = React.useCallback((): void => {
      updateDialog({
        sources: false,
      });
    }, []);

    const handler = React.useMemo(() => {
      return {
        addClick: (): void => {
          setAdding(true);
        },
        editClick: (id: string, source: SourceDraft["source"]) => {
          return (): void => {
            setDraft({
              previousId: id,
              id,
              source,
            });
          };
        },
        deleteClick: (id: string) => {
          return (): void => {
            deleteSource(id);
          };
        },
      };
    }, []);

    const styles = React.useMemo(() => {
      return {
        titleStack: {
          alignItems: "center",
        },
        spacer: {
          flex: 1,
        },
        cardContent: {
          py: 1.5,
        },
        row: {
          alignItems: "center",
        },
        sourceLabel: {
          flex: 1,
        },
        action: {
          minWidth: 28,
          width: 28,
          height: 28,
          p: 0,
          color: "text.secondary",
          ...TOOLBAR_ICON_BUTTON_STYLE,
        },
        deleteAction: {
          minWidth: 28,
          width: 28,
          height: 28,
          p: 0,
          color: "error.main",
          ...TOOLBAR_ICON_BUTTON_STYLE,
          "&&:hover": {
            ...TOOLBAR_ICON_BUTTON_STYLE["&&:hover"],
            borderColor: "error.main",
            color: "error.main",
          },
        },
      };
    }, []);

    return (
      <>
        <Dialog open={open} onClose={close} fullWidth maxWidth="md">
          <DialogTitle>
            <Stack direction="row" spacing={1} sx={styles.titleStack}>
              <StorageRounded />

              <span>{t("dialog.sourceData")}</span>

              <Box sx={styles.spacer} />

              <TooltipButton
                title={t("dialog.sourceAdd")}
                size={"small"}
                variant={"contained"}
                startIcon={<AddRounded />}
                onClick={handler.addClick}
              >
                {t("dialog.sourceAdd")}
              </TooltipButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={1}>
              {Object.entries(sources).map(([id, source]) => {
                const layerCount = layers.filter((layer) => {
                  return "source" in layer && layer.source === id;
                }).length;
                const sourceTypeLabel = t(`common.sourceType.${source.type}`);

                return (
                  <Card key={id} variant={"outlined"}>
                    <CardContent sx={styles.cardContent}>
                      <Stack direction="row" spacing={1} sx={styles.row}>
                        <Box sx={styles.sourceLabel}>
                          <Typography variant={"subtitle2"} noWrap>
                            {id}
                          </Typography>

                          <Typography
                            variant={"caption"}
                            color={"text.secondary"}
                          >
                            {t("dialog.sourceSummary", {
                              type: sourceTypeLabel,
                              count: layerCount,
                            })}
                          </Typography>
                        </Box>

                        <TooltipButton
                          title={t("topBar.actions.edit")}
                          icon={<EditRounded fontSize={"small"} />}
                          fullWidth={false}
                          onClick={handler.editClick(id, source)}
                          sx={styles.action}
                        />

                        <TooltipButton
                          title={t("topBar.actions.delete")}
                          icon={<DeleteOutlineRounded fontSize={"small"} />}
                          fullWidth={false}
                          onClick={handler.deleteClick(id)}
                          sx={styles.deleteAction}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}

              {!Object.keys(sources).length && (
                <Alert severity={"info"}>{t("dialog.emptySources")}</Alert>
              )}
            </Stack>
          </DialogContent>

          <DialogActions>
            <TooltipButton
              title={t("topBar.actions.close")}
              variant={"text"}
              onClick={close}
            >
              {t("topBar.actions.close")}
            </TooltipButton>
          </DialogActions>
        </Dialog>

        {(adding || draft) && (
          <SourceEditor open draft={draft} onClose={closeEditor} />
        )}
      </>
    );
  }
);
