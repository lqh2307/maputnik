import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import Map, {
  GeolocateControl,
  Marker,
  NavigationControl,
  ScaleControl,
  ViewStateChangeEvent,
  type MapLayerMouseEvent,
  type MarkerDragEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useGlobalStore, useMapModeStore } from "../../stores";
import { summarizeFeature, validateStyleDocument } from "../Utils";
import { HoverInspector } from "./Types";
import { useTranslation } from "react-i18next";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const MAP_ATTRIBUTION_CONTROL = {
  compact: true,
};

const INSPECTOR_WIDTH: number = 320;
const INSPECTOR_FEATURE_HEIGHT: number = 180;
const INSPECTOR_COORDINATE_HEIGHT: number = 120;
const INSPECTOR_OFFSET: number = 14;

type MarkerPosition = {
  longitude: number;
  latitude: number;
};

function getInspectorPosition(
  event: MapLayerMouseEvent,
  fallbackHeight: number,
  inspectorElement?: HTMLDivElement
): Pick<HoverInspector, "x" | "y"> {
  const container = event.target.getContainer();
  const width: number = Math.min(
    inspectorElement?.offsetWidth || INSPECTOR_WIDTH,
    Math.max(0, container.clientWidth - 16)
  );
  const height: number = inspectorElement?.offsetHeight || fallbackHeight;

  return {
    x: Math.max(
      8,
      Math.min(
        event.point.x + INSPECTOR_OFFSET,
        container.clientWidth - width - 8
      )
    ),
    y: Math.max(
      8,
      Math.min(
        event.point.y + INSPECTOR_OFFSET,
        container.clientHeight - height - 8
      )
    ),
  };
}

function createInspector(
  event: MapLayerMouseEvent,
  feature: HoverInspector["feature"],
  pinned: boolean,
  inspectorElement?: HTMLDivElement
): HoverInspector {
  const position = getInspectorPosition(
    event,
    feature ? INSPECTOR_FEATURE_HEIGHT : INSPECTOR_COORDINATE_HEIGHT,
    inspectorElement
  );

  return {
    kind: feature ? "feature" : "coordinate",
    feature,
    longitude: event.lngLat.lng,
    latitude: event.lngLat.lat,
    pinned,
    ...position,
  };
}

/** Renders the interactive MapLibre canvas. */
export const MapCanvas = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const style = useGlobalStore((state) => {
    return state.style;
  });

  const mapMode = useMapModeStore((state) => {
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

  const selectLayer = useGlobalStore((state) => {
    return state.selectLayer;
  });

  const [loaded, setLoaded] = React.useState(false);
  const [mapError, setMapError] = React.useState<string>();
  const [hoverInspector, setHoverInspector] = React.useState<HoverInspector>();
  const [markerPosition, setMarkerPosition] = React.useState<MarkerPosition>();
  const mapModeRef = React.useRef(mapMode);
  const hoverMoveEventRef = React.useRef<MapLayerMouseEvent>(undefined);
  const hoverMoveFrameRef = React.useRef<number>(undefined);
  const hoverInspectorRef = React.useRef<HoverInspector>(undefined);
  const inspectorElementRef = React.useRef<HTMLDivElement>(undefined);

  mapModeRef.current = mapMode;
  hoverInspectorRef.current = hoverInspector;

  const cancelHoverMove = React.useCallback((): void => {
    cancelAnimationFrame(hoverMoveFrameRef.current);
    hoverMoveFrameRef.current = undefined;
    hoverMoveEventRef.current = undefined;
  }, []);

  const clearHoverInspector = React.useCallback((): void => {
    cancelHoverMove();
    setHoverInspector(undefined);
  }, [cancelHoverMove]);

  const clearInspectorBox = React.useCallback((): void => {
    clearHoverInspector();
    setInspectorFeatures([]);
  }, [clearHoverInspector, setInspectorFeatures]);

  const clearPinnedInspector = React.useCallback((): void => {
    clearInspectorBox();
    setMarkerPosition(undefined);
  }, [clearInspectorBox]);

  const issues = React.useMemo(() => {
    return validateStyleDocument(style);
  }, [style]);

  const handleClick = React.useCallback(
    (event: MapLayerMouseEvent): void => {
      const features = event.target.queryRenderedFeatures(event.point);
      const feature = features[0];

      if (feature?.layer?.id) {
        selectLayer(feature.layer.id);
      }

      if (mapMode !== "inspect") {
        return;
      }

      setHoverInspector(
        createInspector(
          event,
          feature ? summarizeFeature(feature) : undefined,
          true,
          inspectorElementRef.current
        )
      );
      setMarkerPosition({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      });
      setInspectorFeatures(features.slice(0, 30).map(summarizeFeature));
    },
    [mapMode, selectLayer, setInspectorFeatures]
  );

  const updateHoverInspector = React.useCallback(
    (event: MapLayerMouseEvent): void => {
      if (mapModeRef.current !== "inspect") {
        clearHoverInspector();
        return;
      }

      if (hoverInspectorRef.current?.pinned) {
        return;
      }

      const features = event.target.queryRenderedFeatures(event.point);
      const feature = features[0];

      setHoverInspector(
        createInspector(
          event,
          feature ? summarizeFeature(feature) : undefined,
          false,
          inspectorElementRef.current
        )
      );
    },
    [clearHoverInspector]
  );

  const handleMouseMove = React.useCallback(
    (event: MapLayerMouseEvent): void => {
      if (mapModeRef.current !== "inspect") {
        clearHoverInspector();
        return;
      }

      hoverMoveEventRef.current = event;

      if (hoverMoveFrameRef.current !== undefined) {
        return;
      }

      hoverMoveFrameRef.current = requestAnimationFrame(() => {
        hoverMoveFrameRef.current = undefined;

        const pendingEvent: MapLayerMouseEvent = hoverMoveEventRef.current;
        hoverMoveEventRef.current = undefined;

        if (pendingEvent) {
          updateHoverInspector(pendingEvent);
        }
      });
    },
    [clearHoverInspector, updateHoverInspector]
  );

  React.useEffect(() => {
    if (mapMode !== "inspect") {
      clearPinnedInspector();
    }
  }, [clearPinnedInspector, mapMode]);

  React.useEffect(() => {
    return () => {
      cancelHoverMove();
    };
  }, [cancelHoverMove]);

  const hoverProperties = React.useMemo(() => {
    return Object.entries(hoverInspector?.feature?.properties ?? {});
  }, [hoverInspector]);

  const handleMarkerDragEnd = React.useCallback(
    (event: MarkerDragEvent): void => {
      const longitude: number = event.lngLat.lng;
      const latitude: number = event.lngLat.lat;

      setMarkerPosition({
        longitude,
        latitude,
      });
      setHoverInspector((current) => {
        if (!current?.pinned) {
          return current;
        }

        return {
          ...current,
          longitude,
          latitude,
        };
      });
    },
    []
  );

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
      leaveMap: (): void => {
        if (!hoverInspectorRef.current?.pinned) {
          clearHoverInspector();
        }
      },
      leaveCanvas: clearInspectorBox,
      contextMenu: (event: MapLayerMouseEvent): void => {
        event.originalEvent.preventDefault();
        clearPinnedInspector();
      },
      markerDragEnd: handleMarkerDragEnd,
      close: clearInspectorBox,
    };
  }, [
    clearHoverInspector,
    clearInspectorBox,
    clearPinnedInspector,
    handleMarkerDragEnd,
    setViewState,
    t,
  ]);

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
      inspector: {
        position: "absolute",
        zIndex: 2,
        left: hoverInspector?.x,
        top: hoverInspector?.y,
        width: INSPECTOR_WIDTH,
        maxWidth: "calc(100% - 32px)",
        maxHeight: "42%",
        overflow: "auto",
        boxSizing: "border-box",
        p: "14px 15px 12px",
        border: "1px solid #c4d8f0",
        borderLeft: "4px solid #0065ff",
        borderRadius: "8px",
        bgcolor: "#fff",
        color: "#202328",
        pointerEvents: "auto",
        fontFamily: "sans-serif",
        fontSize: 13,
        lineHeight: 1.45,
      },
      inspectorTitle: {
        display: "block",
        fontWeight: 700,
      },
      inspectorClose: {
        float: "right",
        minWidth: 0,
        m: 0,
        ml: 1,
        p: 0,
        border: 0,
        borderRadius: 0,
        bgcolor: "transparent",
        color: "#515f70",
        fontSize: 22,
        lineHeight: 1,
        opacity: 0.8,
        "&:hover": {
          bgcolor: "transparent",
          color: "#0065ff",
          opacity: 1,
        },
      },
      propertyList: {
        m: "10px 0 0",
        p: 0,
      },
      propertyRow: {
        display: "grid",
        gridTemplateColumns: "minmax(90px, 35%) 1fr",
        gap: 1,
        py: 0.5,
        borderTop: "1px solid #e3e8ef",
        overflowWrap: "anywhere",
      },
      propertyName: {
        color: "#515f70",
      },
      propertyValue: {
        m: 0,
        whiteSpace: "pre-wrap",
      },
      emptyProperties: {
        color: "#515f70",
      },
      error: {
        position: "absolute",
        left: 12,
        bottom: 34,
        maxWidth: 520,
      },
    };
  }, [hoverInspector]);

  const inspectorFeature = hoverInspector?.feature;

  return (
    <Box sx={styles.root} onMouseLeave={handler.leaveCanvas}>
      <Map
        {...viewState}
        mapStyle={style}
        onMove={handler.move}
        onLoad={handler.load}
        onError={handler.error}
        onClick={handleClick}
        onContextMenu={handler.contextMenu}
        onMouseMove={handleMouseMove}
        onMouseLeave={handler.leaveMap}
        cursor={
          mapMode === "inspect"
            ? hoverInspector?.kind === "feature"
              ? "pointer"
              : ""
            : "grab"
        }
        attributionControl={MAP_ATTRIBUTION_CONTROL}
        reuseMaps
        style={MAP_CONTAINER_STYLE}
      >
        <NavigationControl position={"top-right"} visualizePitch />

        <GeolocateControl position={"top-right"} />

        <ScaleControl position={"bottom-right"} />

        {mapMode === "inspect" && markerPosition && (
          <Marker
            longitude={markerPosition.longitude}
            latitude={markerPosition.latitude}
            color={"#0065ff"}
            draggable
            onDragEnd={handler.markerDragEnd}
          />
        )}
      </Map>

      {!loaded && (
        <Paper elevation={2} sx={styles.loading}>
          <Stack direction="row" spacing={1.5} sx={styles.loadingContent}>
            <CircularProgress size={20} />

            <Typography variant={"body2"}>{t("map.loading")}</Typography>
          </Stack>
        </Paper>
      )}

      {mapMode === "inspect" && hoverInspector && (
        <Paper ref={inspectorElementRef} elevation={0} sx={styles.inspector}>
          <IconButton
            aria-label={t("map.closeInspector")}
            onClick={handler.close}
            sx={styles.inspectorClose}
          >
            <CloseRounded fontSize={"inherit"} />
          </IconButton>

          {inspectorFeature ? (
            <>
              <Box component="strong" sx={styles.inspectorTitle}>
                {inspectorFeature.sourceLayer || t("map.feature")}
              </Box>

              <Box component="dl" sx={styles.propertyList}>
                <Box component="div" sx={styles.propertyRow}>
                  <Box component="dt" sx={styles.propertyName}>
                    {t("properties.type")}
                  </Box>
                  <Box component="dd" sx={styles.propertyValue}>
                    {inspectorFeature.geometryType}
                  </Box>
                </Box>

                <Box component="div" sx={styles.propertyRow}>
                  <Box component="dt" sx={styles.propertyName}>
                    {t("map.coordinates")}
                  </Box>
                  <Box component="dd" sx={styles.propertyValue}>
                    {`[${hoverInspector.longitude}, ${hoverInspector.latitude}]`}
                  </Box>
                </Box>

                {hoverProperties.map(([name, value]) => {
                  return (
                    <Box component="div" key={name} sx={styles.propertyRow}>
                      <Box component="dt" sx={styles.propertyName}>
                        {name}
                      </Box>
                      <Box component="dd" sx={styles.propertyValue}>
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value)
                          : String(value)}
                      </Box>
                    </Box>
                  );
                })}

                {!hoverProperties.length && (
                  <Box component="div" sx={styles.emptyProperties}>
                    {t("map.noProperties")}
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <>
              <Box component="strong" sx={styles.inspectorTitle}>
                {t("map.position")}
              </Box>

              <Box component="dl" sx={styles.propertyList}>
                <Box component="div" sx={styles.propertyRow}>
                  <Box component="dt" sx={styles.propertyName}>
                    {t("map.coordinates")}
                  </Box>
                  <Box component="dd" sx={styles.propertyValue}>
                    {`[${hoverInspector.longitude}, ${hoverInspector.latitude}]`}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      )}

      {(mapError || issues.length > 0) && (
        <Alert severity={"warning"} variant={"filled"} sx={styles.error}>
          {mapError ??
            `${issues.length} style validation issue${issues.length === 1 ? "" : "s"}`}
        </Alert>
      )}
    </Box>
  );
});
