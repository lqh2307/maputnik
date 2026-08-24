import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
  StorageRounded,
} from "@mui/icons-material";
import { Alert, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { SourceSpecification } from "maplibre-gl";
import React from "react";
import { TooltipButton } from "../../components/TooltipButton";
import { useGlobalStore } from "../../stores";
import { SourceEditor } from "../Dialog/SourceEditor";
import { SourceDraft } from "../Dialog/Types";
import { useTranslation } from "react-i18next";

/** Renders the searchable source list and source editor entry points. */
export const SourcePanel = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const sources = useGlobalStore((state) => {
    return state.style.sources;
  });

  const layers = useGlobalStore((state) => {
    return state.style.layers;
  });

  const deleteSource = useGlobalStore((state) => {
    return state.deleteSource;
  });

  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState<SourceDraft>();

  const handler = React.useMemo(() => {
    return {
      add: (): void => {
        setAdding(true);
      },
      edit: (id: string, source: SourceSpecification): void => {
        setDraft({
          id,
          previousId: id,
          source,
        });
      },
      remove: (id: string): void => {
        deleteSource(id);
      },
      closeEditor: (): void => {
        setAdding(false);
        setDraft(undefined);
      },
    };
  }, [deleteSource]);

  const styles = React.useMemo(() => {
    return {
      root: {
        width: "100%",
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      },
      header: {
        p: 1.25,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
        zIndex: 1,
      },
      headerRow: {
        alignItems: "center",
      },
      title: {
        flex: 1,
      },
      iconButton: {
        minWidth: 34,
        width: 34,
        height: 34,
        p: 0,
      },
      list: {
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        p: 1,
        bgcolor: "background.default",
      },
      source: {
        p: 1.25,
        borderColor: "divider",
        bgcolor: "background.paper",
      },
      sourceHeader: {
        alignItems: "center",
      },
      sourceId: {
        flex: 1,
        minWidth: 0,
        fontWeight: 700,
      },
      sourceSummary: {
        display: "block",
        mt: 0.25,
      },
      action: {
        minWidth: 28,
        width: 28,
        height: 28,
        p: 0,
      },
      empty: {
        py: 5,
        color: "text.secondary",
        alignItems: "center",
      },
    };
  }, []);

  return (
    <>
      <Box component="aside" sx={styles.root}>
        <Box sx={styles.header}>
          <Stack direction="row" spacing={1} sx={styles.headerRow}>
            <StorageRounded fontSize="small" />

            <Typography variant="subtitle2" sx={styles.title}>
              {t("sources.title")}
            </Typography>

            <TooltipButton
              title={t("sources.add")}
              variant="contained"
              icon={<AddRounded />}
              aria-label={t("sources.add")}
              fullWidth={false}
              onClick={handler.add}
              sx={styles.iconButton}
            />
          </Stack>
        </Box>

        <Box sx={styles.list}>
          <Stack spacing={1}>
            {Object.entries(sources).map(([id, source]) => {
              const layerCount = layers.filter((layer) => {
                return "source" in layer && layer.source === id;
              }).length;

              return (
                <Paper key={id} variant="outlined" sx={styles.source}>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={styles.sourceHeader}
                  >
                    <Box
                      sx={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={styles.sourceId}
                      >
                        {id}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={styles.sourceSummary}
                      >
                        {t("sources.summary", {
                          type: source.type,
                          count: layerCount,
                        })}
                      </Typography>
                    </Box>

                    <Chip size="small" label={source.type} />

                    <TooltipButton
                      title={t("sources.edit")}
                      icon={<EditRounded fontSize="small" />}
                      aria-label={t("sources.edit")}
                      fullWidth={false}
                      onClick={() => {
                        return handler.edit(id, source);
                      }}
                      sx={styles.action}
                    />

                    <TooltipButton
                      title={t("sources.delete")}
                      icon={<DeleteOutlineRounded fontSize="small" />}
                      aria-label={t("sources.delete")}
                      fullWidth={false}
                      color="error"
                      onClick={() => {
                        return handler.remove(id);
                      }}
                      sx={styles.action}
                    />
                  </Stack>
                </Paper>
              );
            })}

            {!Object.keys(sources).length && (
              <Alert severity="info">{t("sources.empty")}</Alert>
            )}
          </Stack>
        </Box>
      </Box>

      {(adding || draft) && (
        <SourceEditor open draft={draft} onClose={handler.closeEditor} />
      )}
    </>
  );
});
