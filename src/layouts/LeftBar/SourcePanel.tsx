import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
  ExpandMoreRounded,
  SearchRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Collapse,
  InputAdornment,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { LayerSpecification, SourceSpecification } from "maplibre-gl";
import React from "react";
import { TooltipButton } from "../../components/TooltipButton";
import { TextInput } from "../../components/TextInput";
import { useGlobalStore } from "../../stores";
import { SourceEditor } from "../Dialog/SourceEditor";
import { SourceDraft } from "../Dialog/Types";
import { LayerDragState } from "./Types";
import { LayerRow } from "./LayerRow";
import { useTranslation } from "react-i18next";
import { TOOLBAR_ICON_BUTTON_STYLE } from "../../configs";

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

  const [search, setSearch] = React.useState("");
  const [collapsedSources, setCollapsedSources] = React.useState<Set<string>>(
    new Set()
  );
  const [dragState, setDragState] = React.useState<LayerDragState>({});
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
      search: (value: string): void => {
        setSearch(value);
      },
      toggle: (id: string) => {
        return (): void => {
          setCollapsedSources((current) => {
            const next = new Set(current);
            if (next.has(id)) {
              next.delete(id);
            } else {
              next.add(id);
            }
            return next;
          });
        };
      },
    };
  }, []);

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
      addButton: {
        mt: 1,
        minHeight: 32,
        p: 0,
        color: "text.secondary",
        ...TOOLBAR_ICON_BUTTON_STYLE,
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
      list: {
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        p: 1,
        bgcolor: "background.default",
      },
      source: {
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      },
      sourceHeader: {
        minHeight: 62,
        p: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        cursor: "pointer",
        "&:hover": {
          bgcolor: "action.hover",
        },
      },
      expand: (collapsed: boolean) => {
        return {
          fontSize: 18,
          transform: collapsed ? "rotate(-90deg)" : "none",
          transition: "transform 120ms",
        };
      },
      sourceLayers: {
        p: 0.75,
        bgcolor: "background.default",
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
      empty: {
        py: 5,
        color: "text.secondary",
        alignItems: "center",
      },
    };
  }, []);

  const query = search.trim().toLowerCase();
  const sourceGroups = React.useMemo(() => {
    return Object.entries(sources)
      .map(([id, source]) => {
        const sourceTypeLabel = t(
          `common.sourceType.${source.type}`
        ).toLowerCase();
        const sourceTypeValue = source.type.replace(/[-_]/g, " ").toLowerCase();
        const sourceMatches =
          !query ||
          id.toLowerCase().includes(query) ||
          sourceTypeValue.includes(query) ||
          sourceTypeLabel.includes(query);
        const sourceLayers = layers.filter((layer: LayerSpecification) => {
          return "source" in layer && layer.source === id;
        });
        const visibleLayers = sourceMatches
          ? sourceLayers
          : sourceLayers.filter((layer) => {
              return layer.id.toLowerCase().includes(query);
            });

        return {
          id,
          source,
          sourceMatches,
          layers: visibleLayers,
        };
      })
      .filter((group) => {
        return !query || group.sourceMatches || group.layers.length > 0;
      });
  }, [layers, query, sources, t]);

  return (
    <>
      <Box component="aside" sx={styles.root}>
        <Box sx={styles.header}>
          <TextInput
            value={search}
            onChange={handler.search}
            multiline={false}
            placeholder={t("leftBar.sources.search")}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize={"small"} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TooltipButton
            title={t("leftBar.sources.add")}
            variant="outlined"
            icon={<AddRounded />}
            fullWidth
            onClick={handler.add}
            sx={styles.addButton}
          />
        </Box>

        <Box sx={styles.list}>
          <Stack spacing={1}>
            {sourceGroups.map(({ id, source, layers: sourceLayers }) => {
              const collapsed = collapsedSources.has(id);
              const sourceTypeLabel = t(`common.sourceType.${source.type}`);

              return (
                <Paper key={id} variant="outlined" sx={styles.source}>
                  <Box onClick={handler.toggle(id)} sx={styles.sourceHeader}>
                    <ExpandMoreRounded sx={styles.expand(collapsed)} />

                    <Box sx={styles.sourceId}>
                      <Typography variant="subtitle2" noWrap>
                        {id}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={styles.sourceSummary}
                      >
                        {t("leftBar.sources.summary", {
                          type: sourceTypeLabel,
                          count: sourceLayers.length,
                        })}
                      </Typography>
                    </Box>

                    <TooltipButton
                      title={t("leftBar.sources.edit")}
                      icon={<EditRounded fontSize={"small"} />}
                      fullWidth={false}
                      onClick={(_value, event) => {
                        event.stopPropagation();
                        handler.edit(id, source);
                      }}
                      sx={styles.action}
                    />

                    <TooltipButton
                      title={t("leftBar.sources.delete")}
                      icon={<DeleteOutlineRounded fontSize={"small"} />}
                      fullWidth={false}
                      onClick={(_value, event) => {
                        event.stopPropagation();
                        handler.remove(id);
                      }}
                      sx={styles.deleteAction}
                    />
                  </Box>

                  {sourceLayers.length > 0 && (
                    <Collapse in={!collapsed} unmountOnExit>
                      <Stack spacing={0.25} sx={styles.sourceLayers}>
                        {sourceLayers.map((layer) => {
                          return (
                            <LayerRow
                              key={layer.id}
                              layer={layer}
                              dragState={dragState}
                              setDragState={setDragState}
                            />
                          );
                        })}
                      </Stack>
                    </Collapse>
                  )}
                </Paper>
              );
            })}

            {!sourceGroups.length && (
              <Alert severity="info">
                {Object.keys(sources).length
                  ? t("leftBar.sources.noMatch")
                  : t("leftBar.sources.empty")}
              </Alert>
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
