import { scaleToZoom, zoomToScale } from "../../utils/Spatial";
import { parseNumber } from "../../utils/Number";
import { ScaleInputMode, ScaleInputProp } from "./Types";
import { SwapHorizTwoTone } from "@mui/icons-material";
import { useDebounce } from "../../hooks";
import React from "react";
import {
  InputAdornment,
  TextField,
  SxProps,
  Tooltip,
  Button,
  Stack,
  Theme,
  Box,
} from "@mui/material";

/**
 * Renders a map-scale input that can switch between `1:x` and zoom entry.
 * The emitted value is always the scale denominator.
 */
export const ScaleInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    disabled,
    shrink = true,
    layout = "row",
    showModeToggle = true,
    initMode = "scale",
    onModeChange,
    wrapperSx = {},
    toggleSx = {},
    value,
    defaultValue = 250000,
    scaleLabel = "Scale (1:X)",
    zoomLabel = "Zoom",
    minScale = 1,
    maxScale = 500000000,
    minZoom = 0,
    maxZoom = 25,
    scaleStep = 1,
    zoomStep = 0.1,
    tileSize,
    ppi,
    delay = 200,
    onChange,
    slotProps = {},
    sx = {},
    ...props
  }: ScaleInputProp): React.JSX.Element => {
    const [mode, setMode] = React.useState<ScaleInputMode>(initMode);
    const [scale, setScale] = React.useState<number>(
      parseNumber(value ?? defaultValue)
    );
    const [zoom, setZoom] = React.useState<number>(
      scaleToZoom({
        scale: parseNumber(value ?? defaultValue),
        tileSize,
        ppi,
      })
    );
    const [localScale, setLocalScale] = React.useState<string>(
      String(parseNumber(value ?? defaultValue))
    );
    const [localZoom, setLocalZoom] = React.useState<string>(
      String(
        scaleToZoom({
          scale: parseNumber(value ?? defaultValue),
          tileSize,
          ppi,
        })
      )
    );

    React.useEffect(() => {
      const nextScale: number = parseNumber(value ?? defaultValue);
      if (nextScale === undefined) {
        return;
      }

      const nextZoom: number = scaleToZoom({
        scale: nextScale,
        tileSize,
        ppi,
      });

      setScale(nextScale);
      setZoom(nextZoom);
      setLocalScale(String(parseNumber(nextScale)));
      setLocalZoom(String(parseNumber(nextZoom)));
    }, [value, defaultValue, ppi, tileSize]);

    React.useEffect(() => {
      if (mode === "scale") {
        const nextZoom: number = scaleToZoom({
          scale,
          tileSize,
          ppi,
        });

        setZoom(nextZoom);
        setLocalZoom(String(parseNumber(nextZoom)));
      } else {
        const nextScale: number = zoomToScale({
          zoom,
          tileSize,
          ppi,
        });

        setScale(nextScale);
        setLocalScale(String(parseNumber(nextScale)));
      }
    }, [mode]);

    const debouncedEmit = useDebounce(onChange, delay);

    const emitValue = React.useCallback(
      (nextValue: number): void => {
        if (delay > 0) {
          debouncedEmit(nextValue);
        } else {
          onChange?.(nextValue);
        }
      },
      [delay, debouncedEmit, onChange]
    );

    const changeHandler = React.useMemo(() => {
      return {
        scale: (
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ): void => {
          const nextInput: string = event.target.value;
          const nextScale: number = parseNumber(nextInput);

          setLocalScale(nextInput);

          if (nextScale === undefined) {
            return;
          }

          const nextZoom: number = scaleToZoom({
            scale: nextScale,
            tileSize,
            ppi,
          });

          setScale(nextScale);
          setZoom(nextZoom);
          setLocalZoom(String(parseNumber(nextZoom)));
          emitValue(nextScale);
        },
        zoom: (
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ): void => {
          const nextInput: string = event.target.value;
          const nextZoom: number = parseNumber(nextInput);

          setLocalZoom(nextInput);

          if (nextZoom === undefined) {
            return;
          }

          const nextScale: number = zoomToScale({
            zoom: nextZoom,
            tileSize,
            ppi,
          });

          setScale(nextScale);
          setZoom(nextZoom);
          setLocalScale(String(parseNumber(nextScale)));
          emitValue(nextScale);
        },
      };
    }, [emitValue, ppi, tileSize]);

    const handleScaleBlur = React.useCallback((): void => {
      const nextZoom: number = scaleToZoom({
        scale,
        tileSize,
        ppi,
      });

      setZoom(nextZoom);
      setLocalScale(String(parseNumber(scale)));
      setLocalZoom(String(parseNumber(nextZoom)));
      emitValue(scale);
    }, [emitValue, ppi, scale, tileSize]);

    const handleZoomBlur = React.useCallback((): void => {
      const nextScale: number = zoomToScale({
        zoom,
        tileSize,
        ppi,
      });

      setScale(nextScale);
      setLocalScale(String(parseNumber(nextScale)));
      setLocalZoom(String(parseNumber(zoom)));
      emitValue(nextScale);
    }, [emitValue, ppi, tileSize, zoom]);

    const toggleMode = React.useCallback((): void => {
      setMode((previous) => {
        const next: ScaleInputMode = previous === "scale" ? "zoom" : "scale";

        onModeChange?.(next);

        return next;
      });
    }, [onModeChange]);

    const createSlotProps = React.useCallback(
      (
        htmlInput: Record<string, unknown>,
        showScalePrefix: boolean = false
      ) => {
        const {
          input = {},
          inputLabel = {},
          htmlInput: htmlInputProps = {},
        } = slotProps;
        const inputProps: Record<string, unknown> = input as Record<
          string,
          unknown
        >;

        return {
          ...slotProps,
          input: {
            ...inputProps,
            disableUnderline: true,
            startAdornment:
              (inputProps.startAdornment as React.ReactNode) ??
              (showScalePrefix ? (
                <InputAdornment position={"start"}>1 :</InputAdornment>
              ) : undefined),
          },
          inputLabel: {
            ...inputLabel,
            shrink,
          },
          htmlInput: {
            ...htmlInputProps,
            ...htmlInput,
          },
        };
      },
      [shrink, slotProps]
    );

    const isScale: boolean = mode === "scale";
    const isHorizontalLayout: boolean = layout === "row";
    const textInputSx = React.useMemo(() => {
      return {
        "& .MuiInputBase-input": {
          fontSize: 12,
        },
        ...sx,
      };
    }, [sx]);
    const stackSx = React.useMemo(() => {
      return {
        display,
        flexDirection: isHorizontalLayout ? "row" : "column",
        gap: "0.5rem",
        alignItems: isHorizontalLayout ? "center" : "stretch",
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        "&&:hover": {
          borderColor: "text.primary",
          pointerEvents: disabled ? "none" : undefined,
        },
        borderRadius: "6px",
        padding: "0.375rem",
        ...wrapperSx,
      } as SxProps<Theme>;
    }, [disabled, display, isHorizontalLayout, wrapperSx]);
    const boxSx = React.useMemo(() => {
      return {
        stack: {
          width: isHorizontalLayout ? "auto" : "100%",
          display: "flex",
          alignItems: "center",
        },
        box: {
          width: isHorizontalLayout ? "auto" : "100%",
          height: "100%",
        },
        icon: {
          display: "flex",
          alignItems: "center",
        },
      };
    }, [isHorizontalLayout]);
    const toggleButtonSx = React.useMemo(() => {
      return {
        display: "flex",
        minWidth: isHorizontalLayout ? 24 : 0,
        width: isHorizontalLayout ? 24 : undefined,
        height: isHorizontalLayout ? 24 : undefined,
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "dashed",
        ...toggleSx,
      };
    }, [isHorizontalLayout, toggleSx]);

    return (
      <Stack sx={stackSx}>
        {icon && (
          <Stack direction={"row"} spacing={0.5} sx={boxSx.stack}>
            <Tooltip title={title}>
              <Box sx={boxSx.icon}>{icon}</Box>
            </Tooltip>
          </Stack>
        )}

        {isScale ? (
          <TextField
            variant={"standard"}
            size={"small"}
            fullWidth={true}
            type={"number"}
            {...props}
            disabled={disabled}
            label={scaleLabel}
            value={localScale}
            onChange={changeHandler.scale}
            onBlur={handleScaleBlur}
            sx={textInputSx}
            slotProps={createSlotProps(
              {
                min: minScale,
                max: maxScale,
                step: scaleStep,
              },
              true
            )}
          />
        ) : (
          <TextField
            variant={"standard"}
            size={"small"}
            fullWidth={true}
            type={"number"}
            {...props}
            disabled={disabled}
            label={zoomLabel}
            value={localZoom}
            onChange={changeHandler.zoom}
            onBlur={handleZoomBlur}
            sx={textInputSx}
            slotProps={createSlotProps({
              min: minZoom,
              max: maxZoom,
              step: zoomStep,
            })}
          />
        )}

        {showModeToggle && (
          <Tooltip title={isScale ? "Zoom" : "Scale (1:X)"}>
            <Box sx={boxSx.box}>
              <Button
                disabled={disabled}
                fullWidth={!isHorizontalLayout}
                variant={"outlined"}
                type={"button"}
                size={"small"}
                onClick={toggleMode}
                sx={toggleButtonSx}
              >
                <SwapHorizTwoTone fontSize={"inherit"} />
              </Button>
            </Box>
          </Tooltip>
        )}
      </Stack>
    );
  }
);
