import { Paper } from "@mui/material";
import { SearchRounded } from "@mui/icons-material";
import { isCancel } from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import React from "react";
import { PopperButton } from "../../components/PopperButton";
import {
  FreeSoloInput,
  FreeSoloInputOption,
} from "../../components/FreeSoloInput";
import { abortRequest } from "../../utils/Request";
import {
  GeocodingCoordinates,
  GeocodingFeature,
  GeocodingResponse,
  getMapTilerApiKey,
  searchGeocoding,
} from "../../apis/geocoding";
import { useGlobalStore, useLanguageStore } from "../../stores";

const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 5;
const RESULT_ZOOM = 14;
const MAPTILER_SESSION_ID = "8c0a0e55-3d13-48be-96c3-ba40830c2e4b";

function getFeatureCoordinates(
  feature: GeocodingFeature
): GeocodingCoordinates | undefined {
  const coordinates = feature.center ?? feature.geometry?.coordinates;

  if (
    !coordinates ||
    coordinates.length < 2 ||
    !Number.isFinite(coordinates[0]) ||
    !Number.isFinite(coordinates[1])
  ) {
    return undefined;
  }

  return [coordinates[0], coordinates[1]];
}

function getFeatureLabel(feature: GeocodingFeature): string | undefined {
  return feature.place_name || feature.text || feature.id;
}

/** Renders a MapTiler-powered place search in the editor top bar. */
export const TopBarGeocoding = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => {
    return state.language;
  });
  const currentZoom = useGlobalStore((state) => {
    return state.viewState.zoom;
  });
  const setViewState = useGlobalStore((state) => {
    return state.setViewState;
  });

  const [value, setValue] = React.useState<string>("");
  const [options, setOptions] = React.useState<FreeSoloInputOption[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const featuresRef = React.useRef<GeocodingFeature[]>([]);
  const selectedValueRef = React.useRef<string>("");
  const requestControllerRef = React.useRef<AbortController>(undefined);
  const requestIdRef = React.useRef<number>(0);

  const focusFeature = React.useCallback(
    (feature: GeocodingFeature): void => {
      const coordinates = getFeatureCoordinates(feature);

      if (!coordinates) {
        return;
      }

      setViewState({
        longitude: coordinates[0],
        latitude: coordinates[1],
        zoom: Math.max(currentZoom ?? 0, RESULT_ZOOM),
      });
    },
    [currentZoom, setViewState]
  );

  const handleSearch = React.useCallback(
    async (inputValue: string, bySelect: boolean): Promise<void> => {
      const nextValue = String(inputValue ?? "");
      const query = nextValue.trim();

      setValue(nextValue);

      if (bySelect) {
        selectedValueRef.current = nextValue;
        const selectedFeature = featuresRef.current.find((feature) => {
          return getFeatureLabel(feature) === nextValue;
        });

        if (selectedFeature) {
          focusFeature(selectedFeature);
        }

        setOptions([]);
        return;
      }

      if (nextValue === selectedValueRef.current) {
        return;
      }

      selectedValueRef.current = "";
      requestIdRef.current += 1;
      abortRequest(requestControllerRef.current);

      if (query.length < MIN_QUERY_LENGTH || !getMapTilerApiKey()) {
        setLoading(false);
        setOptions([]);
        featuresRef.current = [];
        return;
      }

      const requestId = requestIdRef.current;
      const controller = new AbortController();
      requestControllerRef.current = controller;
      setLoading(true);

      try {
        const response = await searchGeocoding({
          query,
          controller,
          language: language === "vietnamese" ? "vi" : "en",
          limit: RESULT_LIMIT,
          proximity: "ip",
          fuzzyMatch: true,
          mtsid: MAPTILER_SESSION_ID,
        });
        const data = response.data as GeocodingResponse;
        const features = (data.features ?? []).filter((feature) => {
          return Boolean(
            getFeatureLabel(feature) && getFeatureCoordinates(feature)
          );
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        featuresRef.current = features;
        setOptions(
          features.map((feature) => {
            const label = getFeatureLabel(feature);
            return {
              title: label,
              value: label,
            };
          })
        );
      } catch (error) {
        if (!isCancel(error)) {
          console.error("Error fetching geocoding suggestions:", error);
          toast.error(t("map.geocodingError"), {
            toasterId: "alert",
            id: "geocoding-error",
          });
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [focusFeature, language, t]
  );

  React.useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      abortRequest(requestControllerRef.current);
    };
  }, []);

  const styles = React.useMemo(() => {
    return {
      button: {
        minWidth: 32,
        width: 32,
        height: 32,
        p: 0,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        color: "text.secondary",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
        "&&:hover": {
          outline: "none",
          borderColor: "primary.main",
          color: "primary.main",
          bgcolor: "action.hover",
          boxShadow: "0 3px 8px rgba(15, 23, 42, 0.14)",
          transform: "translateY(-1px)",
        },
      },
      popper: {
        width: {
          xs: 280,
          sm: 320,
          md: 360,
        },
        maxWidth: "calc(100vw - 32px)",
        p: 1,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      },
      input: {
        "& .MuiInputBase-root": {
          minHeight: 32,
          px: 1,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.default",
          transition:
            "background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
          "&:hover": {
            borderColor: "text.secondary",
          },
          "&.Mui-focused": {
            borderColor: "primary.main",
            boxShadow: "0 0 0 3px rgba(0, 101, 255, 0.14)",
          },
        },
        "& .MuiInput-underline:before, & .MuiInput-underline:after": {
          display: "none",
        },
        "& label": {
          left: 8,
        },
        "& label.Mui-focused": {
          color: "primary.main",
        },
      },
    };
  }, []);

  return (
    <PopperButton
      title={t("map.searchLocation")}
      aria-label={t("map.searchLocation")}
      icon={<SearchRounded />}
      placement="bottom"
      closeOnClickAway={true}
      sx={styles.button}
    >
      <Paper elevation={4} sx={styles.popper}>
        <FreeSoloInput
          label={t("map.searchLocation")}
          value={value}
          options={options}
          loading={loading}
          loadingText={t("map.searching")}
          noOptionsText={
            getMapTilerApiKey()
              ? t("map.noGeocodingResults")
              : t("map.geocodingKeyRequired")
          }
          filterOptions={(availableOptions) => {
            return availableOptions;
          }}
          sx={styles.input}
          onChange={handleSearch}
          delay={250}
          delaySelect={0}
        />
      </Paper>
    </PopperButton>
  );
});
