import React from "react";
import {
  CodeRounded,
  FilterAltRounded,
  FormatPaintRounded,
  LayersRounded,
  ViewQuiltRounded,
  SearchRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  InputAdornment,
  Stack,
  Tabs,
  Typography,
} from "@mui/material";
import latestSpec from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { FilterSpecification, LayerSpecification } from "maplibre-gl";
import { useGlobalStore } from "../../stores";
import { sourceSupportsLayer, validateStyleDocument } from "../Utils";
import { LAYER_TYPES } from "../Constants";
import { EditableLayer, LayerSection } from "../Types";
import { JSONEditor } from "../../components/JSONEditor";
import { PropertyField } from "./PropertyField";
import { FilterEditor } from "./FilterEditor";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { TooltipTab } from "../../components/TooltipTab";
import { JSONValue } from "../../utils/Object";
import { CommitTextFieldProp, StyleSpecificationSchema } from "./Types";
import { useTranslation } from "react-i18next";

/** Renders a text field that commits on blur or Enter. */
function CommitTextField({
  label,
  value,
  onCommit,
  error,
}: CommitTextFieldProp): React.JSX.Element {
  const [draft, setDraft] = React.useState(String(value ?? ""));

  React.useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);

  const handler = React.useMemo(() => {
    return {
      change: (value: string): void => {
        setDraft(value);
      },
      commit: (): void => {
        onCommit(draft);
      },
      keyDown: (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === "Enter") {
          handler.commit();
        }
      },
    };
  }, [draft, onCommit]);

  return (
    <TextInput
      label={label}
      value={draft}
      onChange={handler.change}
      onBlur={handler.commit}
      onKeyDown={handler.keyDown}
      error={error}
    />
  );
}

/** Renders the selected layer's data and style properties. */
export const PropertyPanel = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const style = useGlobalStore((state) => {
    return state.style;
  });

  const selectedLayerId = useGlobalStore((state) => {
    return state.selectedLayerId;
  });

  const updateLayer = useGlobalStore((state) => {
    return state.updateLayer;
  });

  const updateProperty = useGlobalStore((state) => {
    return state.updateLayerProperty;
  });

  const [tab, setTab] = React.useState<
    "properties" | "paint" | "layout" | "filter" | "metadata"
  >("properties");

  const [propertySearch, setPropertySearch] = React.useState("");

  const layer = style.layers.find((item) => {
    return item.id === selectedLayerId;
  }) as LayerSpecification;

  const editableLayer: EditableLayer = layer as EditableLayer;
  const activeSection: LayerSection | undefined =
    tab === "paint" || tab === "layout" ? tab : undefined;

  const issues = React.useMemo(() => {
    return validateStyleDocument(style);
  }, [style]);

  const layerIssues = issues.filter((issue) => {
    return issue.layerId === selectedLayerId;
  });

  const styles = React.useMemo(() => {
    return {
      root: {
        width: "100%",
        height: "100%",
        borderLeft: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      },
      empty: {
        flex: 1,
        color: "text.secondary",
        p: 3,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      },
      header: {
        px: 0,
        pt: 0,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
        zIndex: 1,
      },
      warning: {
        m: 1.25,
      },
      scroll: {
        flex: 1,
        overflow: "auto",
        bgcolor: "background.default",
      },
      section: {
        p: 1.25,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      },
      sticky: {
        position: "sticky",
        top: 0,
        zIndex: 1,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      },
      search: {
        p: 1,
      },
      noMatch: {
        p: 4,
        textAlign: "center",
      },
      jsonEditor: {
        height: "calc(100vh - 120px)",
        minHeight: 360,
      },
    };
  }, []);

  const handler = React.useMemo(() => {
    return {
      tabChange: (_event: React.SyntheticEvent, value: string): void => {
        setTab(
          value as "properties" | "paint" | "layout" | "filter" | "metadata"
        );
      },
      searchChange: (value: string): void => {
        setPropertySearch(value);
      },
      layerIdCommit: (id: string): void => {
        if (id.trim()) {
          updateLayer(layer.id, {
            id: id.trim(),
          });
        }
      },
      layerTypeChange: (value: string): void => {
        return updateLayer(layer.id, {
          type: value as LayerSpecification["type"],
        });
      },
      sourceChange: (value: string): void => {
        return updateLayer(layer.id, {
          source: value,
        });
      },
      sourceLayerCommit: (value: string): void => {
        return updateLayer(layer.id, {
          "source-layer": value,
        });
      },
      zoomCommit: (key: "minzoom" | "maxzoom") => {
        return (value: string): void => {
          return updateLayer(layer.id, {
            [key]: value === "" ? undefined : Number(value),
          });
        };
      },
      propertyChange: (name: string) => {
        return (value: unknown): void => {
          if (activeSection) {
            updateProperty(layer.id, activeSection, name, value);
          }
        };
      },
      filterCommit: (filter: unknown): void => {
        return updateLayer(layer.id, {
          filter: filter as FilterSpecification,
        });
      },
      metadataCommit: (metadata: unknown): void => {
        return updateLayer(layer.id, {
          metadata,
        });
      },
    };
  }, [activeSection, updateLayer, updateProperty, layer]);

  const propertySpecs = React.useMemo(() => {
    if (!layer || !activeSection) {
      return [];
    }
    const schema =
      (latestSpec as unknown as StyleSpecificationSchema)[
        `${activeSection}_${layer.type}`
      ] ?? {};
    const values: Record<string, unknown> = editableLayer[activeSection] ?? {};
    const query = propertySearch.trim().toLowerCase();
    return Object.entries(schema)
      .filter(([name]) => {
        return name !== "visibility" && (!query || name.includes(query));
      })
      .sort(([nameA], [nameB]) => {
        const overriddenA = values[nameA] !== undefined ? 0 : 1;
        const overriddenB = values[nameB] !== undefined ? 0 : 1;
        return overriddenA - overriddenB || nameA.localeCompare(nameB);
      });
  }, [activeSection, layer, propertySearch]);

  if (!layer) {
    return (
      <Box component="aside" sx={styles.root}>
        <Stack spacing={1} sx={styles.empty}>
          <LayersRounded />
          <Typography variant={"body2"}>
            {t("properties.selectLayer")}
          </Typography>
        </Stack>
      </Box>
    );
  }

  const sourceOptions = Object.entries(style.sources).filter(([, source]) => {
    return sourceSupportsLayer(source, layer.type);
  });

  return (
    <Box component="aside" sx={styles.root}>
      <Box sx={styles.header}>
        <Tabs value={tab} onChange={handler.tabChange} variant={"fullWidth"}>
          <TooltipTab
            title={t("properties.style")}
            value="properties"
            icon={<LayersRounded />}
            aria-label={t("properties.style")}
          />
          <TooltipTab
            title={t("properties.paint")}
            value="paint"
            icon={<FormatPaintRounded />}
            aria-label={t("properties.paint")}
          />
          <TooltipTab
            title={t("properties.layout")}
            value="layout"
            icon={<ViewQuiltRounded />}
            aria-label={t("properties.layout")}
          />
          <TooltipTab
            title={t("properties.filter")}
            value="filter"
            icon={<FilterAltRounded />}
            aria-label={t("properties.filter")}
          />
          <TooltipTab
            title={t("properties.meta")}
            value="metadata"
            icon={<CodeRounded />}
            aria-label={t("properties.meta")}
          />
        </Tabs>
      </Box>

      <Box sx={styles.scroll}>
        {tab === "properties" && (
          <>
            {layerIssues.length > 0 && (
              <Alert severity={"warning"} sx={styles.warning}>
                {layerIssues[0].message}
              </Alert>
            )}

            <Stack spacing={1.25} sx={styles.section}>
              <CommitTextField
                label={t("properties.layerId")}
                value={layer.id}
                onCommit={handler.layerIdCommit}
              />

              <SelectInput
                label={t("properties.type")}
                value={layer.type}
                options={LAYER_TYPES.map((type) => {
                  return {
                    title: type,
                    value: type,
                  };
                })}
                onChange={handler.layerTypeChange}
              />
              {layer.type !== "background" && (
                <SelectInput
                  label={t("properties.source")}
                  value={
                    "source" in layer && typeof layer.source === "string"
                      ? layer.source
                      : ""
                  }
                  options={sourceOptions.map(([sourceId]) => {
                    return {
                      title: sourceId,
                      value: sourceId,
                    };
                  })}
                  onChange={handler.sourceChange}
                />
              )}
              {"source" in layer && layer.source && (
                <CommitTextField
                  label={t("properties.sourceLayer")}
                  value={editableLayer["source-layer"]}
                  onCommit={handler.sourceLayerCommit}
                />
              )}
              <Stack direction="row" spacing={1}>
                <CommitTextField
                  label={t("properties.minZoom")}
                  value={layer.minzoom}
                  onCommit={handler.zoomCommit("minzoom")}
                />
                <CommitTextField
                  label={t("properties.maxZoom")}
                  value={layer.maxzoom}
                  onCommit={handler.zoomCommit("maxzoom")}
                />
              </Stack>
            </Stack>
          </>
        )}
        {activeSection && (
          <>
            <Box sx={styles.sticky}>
              <TextInput
                value={propertySearch}
                onChange={handler.searchChange}
                multiline={false}
                placeholder={t("properties.search", {
                  section: activeSection,
                })}
                sx={styles.search}
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
            </Box>
            {propertySpecs.map(([name, spec]) => {
              return (
                <PropertyField
                  key={name}
                  name={name}
                  spec={spec}
                  value={editableLayer[activeSection]?.[name]}
                  onChange={handler.propertyChange(name)}
                />
              );
            })}
            {propertySpecs.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={styles.noMatch}
              >
                {t("properties.noMatch", {
                  section: activeSection,
                })}
              </Typography>
            )}
          </>
        )}
        {tab === "filter" && (
          <FilterEditor
            value={editableLayer.filter}
            onChange={handler.filterCommit}
          />
        )}
        {tab === "metadata" && (
          <Box sx={styles.jsonEditor}>
            <JSONEditor
              embedded
              compact
              value={(layer.metadata ?? {}) as JSONValue}
              onChange={handler.metadataCommit}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
});
