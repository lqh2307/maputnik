import React from "react";
import {
  CheckCircleOutlineRounded,
  CodeRounded,
  ErrorOutlineRounded,
  FilterAltRounded,
  InfoOutlined,
  LayersRounded,
  SearchRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import latestSpec from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { FilterSpecification, LayerSpecification } from "maplibre-gl";
import { useGlobalStore } from "../../stores";
import { sourceSupportsLayer, validateStyleDocument } from "../Utils";
import { LAYER_TYPES } from "../Constants";
import { EditableLayer, LayerSection } from "../Types";
import { LayerTypeIcon } from "../LeftBar/LayerTypeIcon";
import { PropertyField } from "./PropertyField";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { NewAccordion } from "../../components/NewAccordion";
import { CODE_TEXTAREA } from "../../configs/styles";
import {
  CommitTextFieldProp,
  JsonSectionProp,
  StyleSpecificationSchema,
} from "./Types";
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
      fullWidth
      size={"small"}
    />
  );
}

/** Renders an editable JSON document section. */
function JsonSection({
  value,
  onCommit,
  emptyValue,
}: JsonSectionProp): React.JSX.Element {
  const { t } = useTranslation("editor");

  const [draft, setDraft] = React.useState(
    JSON.stringify(value ?? emptyValue, null, 2)
  );

  const [error, setError] = React.useState<string>();
  React.useEffect(() => {
    setDraft(JSON.stringify(value ?? emptyValue, null, 2));
  }, [value, emptyValue]);

  const handler = React.useMemo(() => {
    return {
      change: (value: string): void => {
        setDraft(value);
      },
      commit: (): void => {
        try {
          onCommit(JSON.parse(draft));
          setError(undefined);
        } catch (reason) {
          setError(
            reason instanceof Error
              ? reason.message
              : t("properties.invalidJson")
          );
        }
      },
      keyDown: (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          handler.commit();
        }
      },
    };
  }, [draft, onCommit, t]);

  const styles = React.useMemo(() => {
    return {
      input: {
        p: 1.25,
        ...CODE_TEXTAREA,
      },
    };
  }, []);

  return (
    <TextInput
      value={draft}
      onChange={handler.change}
      onBlur={handler.commit}
      onKeyDown={handler.keyDown}
      multiline
      minRows={8}
      maxRows={24}
      fullWidth
      error={!!error}
      helperText={error ?? t("properties.applyHint")}
      sx={styles.input}
    />
  );
}

/** Renders feature inspection results pinned from the map. */
function InspectorResults(): React.JSX.Element | null {
  const { t } = useTranslation("editor");

  const features = useGlobalStore((state) => {
    return state.inspectorFeatures;
  });

  const styles = React.useMemo(() => {
    return {
      accordion: {
        flexShrink: 0,
      },
      details: {
        p: 0,
        maxHeight: 260,
        overflow: "auto",
        gap: 0,
      },
      feature: {
        p: 1.25,
        borderTop: 1,
        borderColor: "divider",
      },
      row: {
        alignItems: "center",
      },
      icon: {
        fontSize: 16,
      },
      label: {
        fontWeight: 700,
      },
      chip: {
        height: 20,
      },
      pre: {
        m: 0,
        mt: 1,
        fontSize: 10.5,
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
      },
    };
  }, []);
  if (!features.length) {
    return null;
  }

  return (
    <NewAccordion
      defaultExpanded
      sx={styles.accordion}
      expandIcon={<InfoOutlined fontSize="small" />}
      summary={
        <Typography variant="subtitle2">
          {t("properties.inspected", {
            count: features.length,
          })}
        </Typography>
      }
      detailsProps={{
        sx: styles.details,
      }}
    >
      {features.map((feature, index) => {
        return (
          <Box
            key={`${feature.layer.id}-${feature.id ?? index}`}
            sx={styles.feature}
          >
            <Stack direction="row" spacing={1} sx={styles.row}>
              <LayerTypeIcon type={feature.layer.type} sx={styles.icon} />

              <Typography variant="caption" sx={styles.label}>
                {feature.layer.id}
              </Typography>
              <Chip
                size={"small"}
                label={feature.geometryType}
                sx={styles.chip}
              />
            </Stack>

            <Box component="pre" sx={styles.pre}>
              {JSON.stringify(feature.properties, null, 2)}
            </Box>
          </Box>
        );
      })}
    </NewAccordion>
  );
}

/** Renders the selected layer's data and style properties. */
export const PropertyPanel = React.memo((): React.JSX.Element => {
  const { t } = useTranslation("editor");

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

  const [tab, setTab] = React.useState<"properties" | "filter" | "metadata">(
    "properties"
  );

  const [section, setSection] = React.useState<LayerSection>("paint");

  const [propertySearch, setPropertySearch] = React.useState("");

  const layer = style.layers.find((item) => {
    return item.id === selectedLayerId;
  }) as LayerSpecification;

  const editableLayer: EditableLayer = layer as EditableLayer;

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
        px: 1.25,
        pt: 1.25,
        borderBottom: 1,
        borderColor: "divider",
      },
      headerRow: {
        mb: 1.25,
        alignItems: "center",
      },
      grow: {
        minWidth: 0,
        flex: 1,
      },
      warning: {
        mb: 1,
      },
      scroll: {
        flex: 1,
        overflow: "auto",
      },
      section: {
        p: 1.25,
        borderBottom: 1,
        borderColor: "divider",
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
    };
  }, []);

  const handler = React.useMemo(() => {
    return {
      tabChange: (_event: React.SyntheticEvent, value: string): void => {
        setTab(value as "properties" | "filter" | "metadata");
      },
      sectionChange: (_event: React.SyntheticEvent, value: string): void => {
        setSection(value as LayerSection);
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
          return updateProperty(layer.id, section, name, value);
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
  }, [updateLayer, updateProperty, layer, section]);

  const propertySpecs = React.useMemo(() => {
    if (!layer) {
      return [];
    }
    const schema =
      (latestSpec as unknown as StyleSpecificationSchema)[
        `${section}_${layer.type}`
      ] ?? {};
    const values: Record<string, unknown> = editableLayer[section] ?? {};
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
  }, [layer, section, propertySearch]);

  if (!layer) {
    return (
      <Box component="aside" sx={styles.root}>
        <InspectorResults />

        <Stack spacing={1} sx={styles.empty}>
          <LayersRounded />
          <Typography variant="body2">{t("properties.selectLayer")}</Typography>
        </Stack>
      </Box>
    );
  }

  const sourceOptions = Object.entries(style.sources).filter(([, source]) => {
    return sourceSupportsLayer(source, layer.type);
  });

  return (
    <Box component="aside" sx={styles.root}>
      <InspectorResults />

      <Box sx={styles.header}>
        <Stack direction="row" spacing={1} sx={styles.headerRow}>
          <LayerTypeIcon type={layer.type} color="primary" />
          <Box sx={styles.grow}>
            <Typography variant="subtitle2" noWrap>
              {layer.id}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {t("properties.layerKind", {
                type: layer.type,
              })}
            </Typography>
          </Box>
          {layerIssues.length ? (
            <ErrorOutlineRounded color="warning" />
          ) : (
            <CheckCircleOutlineRounded color="success" />
          )}
        </Stack>

        {layerIssues.length > 0 && (
          <Alert severity="warning" sx={styles.warning}>
            {layerIssues[0].message}
          </Alert>
        )}

        <Tabs value={tab} onChange={handler.tabChange} variant="fullWidth">
          <Tab
            value="properties"
            icon={<LayersRounded />}
            iconPosition="start"
            label={t("properties.style")}
          />
          <Tab
            value="filter"
            icon={<FilterAltRounded />}
            iconPosition="start"
            label={t("properties.filter")}
          />
          <Tab
            value="metadata"
            icon={<CodeRounded />}
            iconPosition="start"
            label={t("properties.meta")}
          />
        </Tabs>
      </Box>

      <Box sx={styles.scroll}>
        {tab === "properties" && (
          <>
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

            <Box sx={styles.sticky}>
              <Tabs
                value={section}
                onChange={handler.sectionChange}
                variant="fullWidth"
              >
                <Tab value="paint" label={t("properties.paint")} />
                <Tab value="layout" label={t("properties.layout")} />
              </Tabs>
              <TextInput
                value={propertySearch}
                onChange={handler.searchChange}
                multiline={false}
                placeholder={t("properties.search", {
                  section,
                })}
                size={"small"}
                fullWidth
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
                  value={editableLayer[section]?.[name]}
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
                  section,
                })}
              </Typography>
            )}
          </>
        )}
        {tab === "filter" && (
          <JsonSection
            value={editableLayer.filter}
            emptyValue={["all"]}
            onCommit={handler.filterCommit}
          />
        )}
        {tab === "metadata" && (
          <JsonSection
            value={layer.metadata}
            emptyValue={{}}
            onCommit={handler.metadataCommit}
          />
        )}
      </Box>
    </Box>
  );
});
