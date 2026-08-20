import {
  AddRounded,
  ExpandMoreRounded,
  FolderRounded,
  LayersRounded,
  SearchRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { LayerSpecification } from "maplibre-gl";
import { useDialogStore, useGlobalStore } from "../../stores";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { AddLayerDialog } from "./AddLayerDialog";
import { LAYER_TYPES } from "../Constants";
import { LayerDragState, LayerGroup } from "./Types";
import { getLayerGroup } from "./Utils";
import { LayerRow } from "./LayerRow";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the searchable and reorderable layer tree panel. */
export const LayerPanel = React.memo((): React.JSX.Element => {
  const { t } = useTranslation("editor");

  const layers = useGlobalStore((state) => {
    return state.style.layers;
  });

  const search = useGlobalStore((state) => {
    return state.search;
  });

  const typeFilter = useGlobalStore((state) => {
    return state.layerTypeFilter;
  });

  const collapsedGroups = useGlobalStore((state) => {
    return state.collapsedGroups;
  });

  const setSearch = useGlobalStore((state) => {
    return state.setSearch;
  });

  const setTypeFilter = useGlobalStore((state) => {
    return state.setLayerTypeFilter;
  });

  const toggleGroup = useGlobalStore((state) => {
    return state.toggleGroup;
  });

  const updateDialog = useDialogStore((state) => {
    return state.updateDialog;
  });

  const [addOpen, setAddOpen] = React.useState(false);
  const [dragState, setDragState] = React.useState<LayerDragState>({});

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
      },
      headerRow: {
        mb: 1,
        alignItems: "center",
      },
      title: {
        flex: 1,
      },
      filter: {
        width: 104,
        flexShrink: 0,
      },
      list: {
        flex: 1,
        overflow: "auto",
        p: 0.75,
      },
      group: {
        mb: 0.5,
      },
      groupHeader: {
        height: 34,
        px: 0.75,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        cursor: "pointer",
        borderRadius: 1,
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
      folder: {
        fontSize: 17,
        color: "text.secondary",
      },
      groupTitle: {
        flex: 1,
        fontWeight: 700,
      },
      groupLayers: {
        pl: 1.25,
      },
      empty: {
        py: 5,
        color: "text.secondary",
        alignItems: "center",
      },
      footer: {
        p: 1,
        borderTop: 1,
        borderColor: "divider",
      },
    };
  }, []);

  const handler = React.useMemo(() => {
    return {
      add: (): void => {
        setAddOpen(true);
      },
      search: (value: string): void => {
        setSearch(value);
      },
      filter: (value: string): void => {
        setTypeFilter(value);
      },
      sources: (): void => {
        updateDialog({
          sources: true,
        });
      },
      closeAdd: (): void => {
        setAddOpen(false);
      },
      group: (id: string) => {
        return (): void => {
          toggleGroup(id);
        };
      },
    };
  }, [setSearch, setTypeFilter, toggleGroup, updateDialog]);

  const groups = React.useMemo(() => {
    const groupMap = new Map<string, LayerGroup>();
    [...layers].reverse().forEach((layer: LayerSpecification) => {
      const descriptor = getLayerGroup(layer);
      if (!groupMap.has(descriptor.id)) {
        groupMap.set(descriptor.id, {
          ...descriptor,
          layers: [],
        });
      }
      groupMap.get(descriptor.id)!.layers.push(layer);
    });
    return [...groupMap.values()]
      .map((group) => {
        return {
          ...group,
          layers: group.layers.filter((layer) => {
            return (
              (typeFilter === "all" || layer.type === typeFilter) &&
              layer.id.toLowerCase().includes(search.trim().toLowerCase())
            );
          }),
        };
      })
      .filter((group) => {
        return group.layers.length > 0;
      });
  }, [layers, search, typeFilter]);

  return (
    <Box component="aside" sx={styles.root}>
      <Box sx={styles.header}>
        <Stack direction="row" spacing={1} sx={styles.headerRow}>
          <LayersRounded fontSize="small" color="primary" />

          <Typography variant="subtitle2" sx={styles.title}>
            {t("layers.title")}
          </Typography>

          <Button
            size={"small"}
            variant="contained"
            startIcon={<AddRounded />}
            onClick={handler.add}
          >
            {t("actions.add")}
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextInput
            size={"small"}
            value={search}
            onChange={handler.search}
            multiline={false}
            placeholder={t("layers.search")}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <SelectInput
            value={typeFilter}
            onChange={handler.filter}
            sx={styles.filter}
            options={[
              {
                value: "all",
                title: t("layers.all"),
              },
              ...LAYER_TYPES.map((type) => {
                return {
                  value: type,
                  title: type,
                };
              }),
            ]}
          />
        </Stack>
      </Box>

      <Box sx={styles.list}>
        {groups.map((group) => {
          const collapsed = collapsedGroups.has(group.id);
          return (
            <Box key={group.id} sx={styles.group}>
              <Box onClick={handler.group(group.id)} sx={styles.groupHeader}>
                <ExpandMoreRounded sx={styles.expand(collapsed)} />

                <FolderRounded sx={styles.folder} />

                <Typography variant="caption" noWrap sx={styles.groupTitle}>
                  {group.id === "style:root"
                    ? t("layers.styleGroup")
                    : group.title}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {group.layers.length}
                </Typography>
              </Box>

              <Collapse in={!collapsed} unmountOnExit>
                <Stack spacing={0.25} sx={styles.groupLayers}>
                  {group.layers.map((layer) => {
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
            </Box>
          );
        })}

        {groups.length === 0 && (
          <Stack spacing={1} sx={styles.empty}>
            <LayersRounded />

            <Typography variant="body2">{t("layers.empty")}</Typography>
          </Stack>
        )}
      </Box>

      <Box sx={styles.footer}>
        <Button
          fullWidth
          size={"small"}
          variant="outlined"
          startIcon={<AddRounded />}
          onClick={handler.sources}
        >
          {t("layers.manageSources")}
        </Button>
      </Box>

      <AddLayerDialog open={addOpen} onClose={handler.closeAdd} />
    </Box>
  );
});
