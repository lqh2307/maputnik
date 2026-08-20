import React from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Map, {
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  ViewStateChangeEvent,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useGlobalStore } from "../../stores";
import { summarizeFeature, validateStyleDocument } from "../Utils";
import { HoverInspector } from "./Types";
import { useTranslation } from "react-i18next";

/** Renders the interactive MapLibre canvas. */
export const MapCanvas = React.memo((): React.JSX.Element => {
  const { t } = useTranslation("editor");

  const style = useGlobalStore((state) => {
    return state.style;
  });

  const mapMode = useGlobalStore((state) => {
    return state.mapMode;
  });

  const viewState = useGlobalStore((state) => {
    return state.viewState;
  });

  const setViewState = useGlobalStore((state) => {
    return state.setViewState;
  });

  const setInspectorFeatures = useGlobalStore((state) => {
    return state.setInspectorFeatures;
  });

  const [loaded, setLoaded] = React.useState(false);
  const [mapError, setMapError] = React.useState<string>();
  const [hoverInspector, setHoverInspector] = React.useState<HoverInspector>();

  const issues = React.useMemo(() => {
    return validateStyleDocument(style);
  }, [style]);

  const handleClick = React.useCallback(
    (event: MapLayerMouseEvent) => {
      if (mapMode !== "inspect") {
        return;
      }
      const features = event.target.queryRenderedFeatures(event.point);
      setInspectorFeatures(features.slice(0, 30).map(summarizeFeature));
    },
    [mapMode, setInspectorFeatures]
  );

  const handleMouseMove = React.useCallback(
    (event: MapLayerMouseEvent) => {
      if (mapMode !== "inspect") {
        setHoverInspector(undefined);
        return;
      }

      const features = event.target.queryRenderedFeatures(event.point);
      const feature = features[0];
      if (!feature) {
        setHoverInspector(undefined);
        return;
      }

      const container = event.target.getContainer();
      const tooltipWidth = 270;
      const tooltipHeight = 210;
      setHoverInspector({
        feature: summarizeFeature(feature),
        featureCount: features.length,
        x:
          event.point.x + tooltipWidth + 20 > container.clientWidth
            ? Math.max(8, event.point.x - tooltipWidth - 14)
            : event.point.x + 14,
        y:
          event.point.y + tooltipHeight + 20 > container.clientHeight
            ? Math.max(8, event.point.y - tooltipHeight - 14)
            : event.point.y + 14,
      });
    },
    [mapMode]
  );

  React.useEffect(() => {
    if (mapMode !== "inspect") {
      setHoverInspector(undefined);
    }
  }, [mapMode]);

  const hoverProperties = React.useMemo(() => {
    return Object.entries(hoverInspector?.feature.properties ?? {}).slice(0, 5);
  }, [hoverInspector]);

  const handler = React.useMemo(() => {
    return {
      move: (event: ViewStateChangeEvent): void => {
        setViewState(event.viewState);
      },
      load: (): void => {
        setLoaded(true);
        setMapError(undefined);
      },
      error: (event: {
        error?: {
          message?: string;
        };
      }): void => {
        setMapError(event.error?.message ?? t("map.error"));
      },
      leave: (): void => {
        setHoverInspector(undefined);
      },
    };
  }, [setViewState, t]);

  const styles = React.useMemo(() => {
    return {
      root: {
        position: "relative",
        width: "100%",
        height: "100%",
        bgcolor: "grey.200",
      },
      loading: {
        position: "absolute",
        inset: "50% auto auto 50%",
        transform: "translate(-50%, -50%)",
        p: 2,
      },
      loadingContent: {
        alignItems: "center",
      },
      mode: {
        position: "absolute",
        top: 12,
        left: 12,
      },
      inspector: {
        position: "absolute",
        zIndex: 3,
        left: hoverInspector?.x,
        top: hoverInspector?.y,
        width: 270,
        p: 1.25,
        pointerEvents: "none",
        border: 1,
        borderColor: "primary.main",
        bgcolor: "background.paper",
        animation: "inspect-pop 120ms ease-out",
        "@keyframes inspect-pop": {
          from: {
            opacity: 0,
            transform: "translateY(4px) scale(.98)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0) scale(1)",
          },
        },
      },
      inspectorHeader: {
        alignItems: "center",
        mb: 0.75,
      },
      inspectorTitle: {
        minWidth: 0,
        flex: 1,
      },
      propertyName: {
        width: 92,
        flexShrink: 0,
      },
      propertyValue: {
        flex: 1,
      },
      inspectorHint: {
        display: "block",
        mt: 0.75,
        fontWeight: 600,
      },
      error: {
        position: "absolute",
        left: 12,
        bottom: 34,
        maxWidth: 520,
      },
    };
  }, [hoverInspector]);

  return (
    <Box sx={styles.root}>
      <Map
        {...viewState}
        mapStyle={style}
        onMove={handler.move}
        onLoad={handler.load}
        onError={handler.error}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handler.leave}
        cursor={
          mapMode === "inspect"
            ? hoverInspector
              ? "pointer"
              : "crosshair"
            : "grab"
        }
        attributionControl={{
          compact: true,
        }}
        reuseMaps
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <NavigationControl position="top-right" visualizePitch />

        <FullscreenControl position="top-right" />

        <GeolocateControl position="top-right" />

        <ScaleControl position="bottom-right" />
      </Map>

      {!loaded && (
        <Paper elevation={2} sx={styles.loading}>
          <Stack direction="row" spacing={1.5} sx={styles.loadingContent}>
            <CircularProgress size={20} />

            <Typography variant="body2">{t("map.loading")}</Typography>
          </Stack>
        </Paper>
      )}

      {mapMode === "inspect" && (
        <Chip color="primary" label={t("map.hoverInspect")} sx={styles.mode} />
      )}

      {mapMode === "inspect" && hoverInspector && (
        <Paper elevation={8} sx={styles.inspector}>
          <Stack direction="row" spacing={1} sx={styles.inspectorHeader}>
            <Box sx={styles.inspectorTitle}>
              <Typography variant="subtitle2" noWrap>
                {hoverInspector.feature.layer.id}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {hoverInspector.feature.geometryType}
              </Typography>
            </Box>

            <Chip
              size={"small"}
              color="primary"
              variant="outlined"
              label={hoverInspector.feature.layer.type}
            />
          </Stack>
          <Stack spacing={0.35}>
            {hoverProperties.map(([name, value]) => {
              return (
                <Stack key={name} direction="row" spacing={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={styles.propertyName}
                  >
                    {name}
                  </Typography>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={styles.propertyValue}
                  >
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </Typography>
                </Stack>
              );
            })}
            {!hoverProperties.length && (
              <Typography variant="caption" color="text.secondary">
                Feature has no properties
              </Typography>
            )}
          </Stack>
          <Typography
            variant="caption"
            color="primary.main"
            sx={styles.inspectorHint}
          >
            Click to pin {hoverInspector.featureCount} feature
            {hoverInspector.featureCount === 1 ? "" : "s"}
          </Typography>
        </Paper>
      )}

      {(mapError || issues.length > 0) && (
        <Alert severity="warning" variant="filled" sx={styles.error}>
          {mapError ??
            `${issues.length} style validation issue${issues.length === 1 ? "" : "s"}`}
        </Alert>
      )}
    </Box>
  );
});
