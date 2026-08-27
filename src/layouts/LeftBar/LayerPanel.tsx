import {
  AddRounded,
  ExpandMoreRounded,
  FolderRounded,
  SearchRounded,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { LayerSpecification } from "maplibre-gl";
import { useGlobalStore } from "../../stores";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { TooltipButton } from "../../components/TooltipButton";
import { AddLayerDialog } from "./AddLayerDialog";
import { LAYER_TYPES } from "../Constants";
import { LayerDragState, LayerGroup } from "./Types";
import { getLayerGroup } from "./Utils";
import { LayerRow } from "./LayerRow";
import { useTranslation } from "react-i18next";
import React from "react";
import { TOOLBAR_ICON_BUTTON_STYLE } from "../../configs";

/** Renders the searchable and reorderable layer tree panel. */
export const LayerPanel = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

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
        bgcolor: "background.paper",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
        zIndex: 1,
      },
      filter: {
        width: 104,
        flexShrink: 0,
      },
      addButton: {
        mt: 1,
        minHeight: 32,
        p: 0,
        color: "text.secondary",
        ...TOOLBAR_ICON_BUTTON_STYLE,
      },
      list: {
        flex: 1,
        overflow: "auto",
        p: 0.75,
        bgcolor: "background.default",
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
      closeAdd: (): void => {
        setAddOpen(false);
      },
      group: (id: string) => {
        return (): void => {
          toggleGroup(id);
        };
      },
    };
  }, []);

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
        <Stack direction="row" spacing={1}>
          <TextInput
            value={search}
            onChange={handler.search}
            multiline={false}
            placeholder={t("leftBar.layers.search")}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position={"start"}>
                    <SearchRounded fontSize={"small"} />
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
                title: t("leftBar.layers.all"),
              },
              ...LAYER_TYPES.map((type) => {
                return {
                  value: type,
                  title: t(`common.layerType.${type}`),
                };
              }),
            ]}
          />
        </Stack>

        <TooltipButton
          title={t("common.button.add")}
          variant={"outlined"}
          icon={<AddRounded />}
          fullWidth
          onClick={handler.add}
          sx={styles.addButton}
        />
      </Box>

      <Box sx={styles.list}>
        {groups.map((group) => {
          const collapsed = collapsedGroups.has(group.id);
          return (
            <Box key={group.id} sx={styles.group}>
              <Box onClick={handler.group(group.id)} sx={styles.groupHeader}>
                <ExpandMoreRounded sx={styles.expand(collapsed)} />

                <FolderRounded sx={styles.folder} />

                <Typography variant={"caption"} noWrap sx={styles.groupTitle}>
                  {group.id === "style:root"
                    ? t("leftBar.layers.styleGroup")
                    : group.title}
                </Typography>

                <Typography variant={"caption"} color={"text.secondary"}>
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
            <Typography variant={"body2"}>
              {t("leftBar.layers.empty")}
            </Typography>
          </Stack>
        )}
      </Box>

      <AddLayerDialog open={addOpen} onClose={handler.closeAdd} />
    </Box>
  );
});
