import { CoordinateInputMode, CoordinateInputProp } from "./Types";
import { SwapHorizTwoTone } from "@mui/icons-material";
import { DMSH } from "../../types/Common";
import { useDebounce } from "../../hooks";
import React from "react";
import {
  convertDEGToDMSH,
  convertDMSHToDEG,
  parseNumber,
} from "../../utils/Number";
import {
  TextField,
  Tooltip,
  SxProps,
  Button,
  Stack,
  Theme,
  Box,
} from "@mui/material";

/** Renders the CoordinateInput component. */
export const CoordinateInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    disabled,
    isLat,
    isGeographic = true,
    shrink = true,
    layout = "row",
    showModeToggle = true,
    initMode = "decimal",
    onModeChange,
    wrapperSx = {},
    toggleSx = {},
    xLabel = "X",
    yLabel = "Y",
    decimalLabel = isGeographic ? "Deg (°)" : isLat ? yLabel : xLabel,
    degreeLabel = isGeographic ? "Deg (°)" : isLat ? yLabel : xLabel,
    minuteLabel = "Min (')",
    secondLabel = 'Sec (")',
    decimalStep = 1,
    minuteStep = 1,
    secondStep = 1,
    value,
    defaultValue = 0,
    delay = 200,
    onChange,
    slotProps = {},
    sx = {},
    ...props
  }: CoordinateInputProp): React.JSX.Element => {
    const [mode, setMode] = React.useState<CoordinateInputMode>(initMode);
    const [dec, setDec] = React.useState<number>(
      parseNumber(value ?? defaultValue)
    );
    const [dms, setDms] = React.useState<DMSH>(
      convertDEGToDMSH(parseNumber(value ?? defaultValue))
    );
    const [localValues, setLocalValues] = React.useState(() => {
      const initialDms: DMSH = convertDEGToDMSH(
        parseNumber(value ?? defaultValue)
      );

      return {
        decimal: String(parseNumber(value ?? defaultValue)),
        degree: String(initialDms.degree),
        minute: String(initialDms.minute),
        second: String(initialDms.second),
      };
    });

    React.useEffect(() => {
      const newVal: number = parseNumber(value ?? defaultValue);
      if (newVal === undefined) {
        return;
      }

      setDec(newVal);

      if (isGeographic) {
        const newDms: DMSH = convertDEGToDMSH(newVal);

        setDms(newDms);
        setLocalValues({
          decimal: String(parseNumber(newVal)),
          degree: String(newDms.degree),
          minute: String(newDms.minute),
          second: String(newDms.second),
        });
      } else {
        setLocalValues((previous) => {
          return {
            ...previous,
            decimal: String(parseNumber(newVal)),
          };
        });
      }
    }, [value, defaultValue, isGeographic]);

    React.useEffect(() => {
      if (!isGeographic) {
        setMode("decimal");

        return;
      }

      if (mode === "decimal") {
        const newDms: DMSH = convertDEGToDMSH(dec);

        setDms(newDms);
        setLocalValues((previous) => {
          return {
            ...previous,
            degree: String(newDms.degree),
            minute: String(newDms.minute),
            second: String(newDms.second),
          };
        });
      } else {
        const newDec: number = convertDMSHToDEG(dms);

        setDec(newDec);
        setLocalValues((previous) => {
          return {
            ...previous,
            decimal: String(parseNumber(newDec)),
          };
        });
      }
    }, [mode, isGeographic]);

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

    const handleDecimalChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const nextInput: string = e.target.value;
        const newVal: number = parseNumber(nextInput);

        setLocalValues((previous) => {
          return {
            ...previous,
            decimal: nextInput,
          };
        });

        if (newVal === undefined) {
          return;
        }

        setDec(newVal);

        if (isGeographic) {
          const newDms: DMSH = convertDEGToDMSH(newVal);

          setDms(newDms);
          setLocalValues((previous) => {
            return {
              ...previous,
              degree: String(newDms.degree),
              minute: String(newDms.minute),
              second: String(newDms.second),
              decimal: nextInput,
            };
          });
        }
        emitValue(newVal);
      },
      [defaultValue, emitValue, isGeographic]
    );

    const handleDmsChange = React.useCallback(
      (key: "degree" | "minute" | "second") => {
        return (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ): void => {
          const nextInput: string = e.target.value;
          const parsedValue: number = parseNumber(nextInput);

          setLocalValues((previous) => {
            return {
              ...previous,
              [key]: nextInput,
            };
          });

          if (parsedValue === undefined) {
            return;
          }

          const newDms: DMSH = {
            ...dms,
            [key]: parsedValue,
          };
          const newVal: number = convertDMSHToDEG(newDms);

          setDms(newDms);
          setDec(newVal);
          setLocalValues((previous) => {
            return {
              ...previous,
              decimal: String(parseNumber(newVal)),
            };
          });
          emitValue(newVal);
        };
      },
      [defaultValue, dms, emitValue]
    );

    const handleDecimalBlur = React.useCallback((): void => {
      if (!isGeographic) {
        setLocalValues((previous) => {
          return {
            ...previous,
            decimal: String(parseNumber(dec)),
          };
        });
        emitValue(dec);

        return;
      }

      const fixed: DMSH = convertDEGToDMSH(dec);
      const normalized: number = convertDMSHToDEG(fixed);

      setDec(normalized);
      setDms(fixed);
      setLocalValues({
        decimal: String(parseNumber(normalized)),
        degree: String(fixed.degree),
        minute: String(fixed.minute),
        second: String(fixed.second),
      });
      emitValue(normalized);
    }, [dec, emitValue, isGeographic]);

    const handleDmsBlur = React.useCallback((): void => {
      const normalized: number = convertDMSHToDEG(dms);
      const fixed: DMSH = convertDEGToDMSH(normalized);

      setDec(normalized);
      setDms(fixed);
      setLocalValues({
        decimal: String(parseNumber(normalized)),
        degree: String(fixed.degree),
        minute: String(fixed.minute),
        second: String(fixed.second),
      });
      emitValue(normalized);
    }, [dms, emitValue]);

    const toggleMode = React.useCallback((): void => {
      setMode((prev) => {
        const next: CoordinateInputMode =
          prev === "decimal" ? "dms" : "decimal";

        onModeChange?.(next);

        return next;
      });
    }, [onModeChange]);

    const createSlotProps = React.useCallback(
      (htmlInput?: Record<string, unknown>) => {
        const {
          input = {},
          inputLabel = {},
          htmlInput: htmlInputProps = {},
        } = slotProps;

        return {
          ...slotProps,
          input: {
            ...input,
            disableUnderline: true,
          },
          inputLabel: {
            ...inputLabel,
            shrink,
          },
          htmlInput: {
            ...htmlInputProps,
            ...(htmlInput ?? {}),
          },
        };
      },
      [slotProps, shrink]
    );

    const isDec: boolean = mode === "decimal";
    const isHorizontalLayout: boolean = layout === "row";
    const defaultCoordinateLabel: string = isGeographic
      ? isLat
        ? "Lat (°)"
        : "Lng (°)"
      : isLat
        ? yLabel
        : xLabel;

    const decimalInputProps = React.useMemo(() => {
      return isGeographic
        ? {
            min: isLat ? -90 : -180,
            max: isLat ? 90 : 180,
            step: decimalStep,
          }
        : {
            step: decimalStep,
          };
    }, [isGeographic, isLat, decimalStep]);

    const textInputSx = React.useMemo(() => {
      return {
        "& .MuiInputBase-input": {
          fontSize: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
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
    }, [wrapperSx, display, isHorizontalLayout, disabled]);

    const styles = React.useMemo(() => {
      return {
        iconBox: {
          display: "flex",
          alignItems: "center",
          "& svg": {
            fontSize: 14,
          },
        },
        dmsStack: {
          display: "flex",
          flexDirection: "row",
          gap: "0.25rem",
          alignItems: "center",
          width: "100%",
        },
      };
    }, []);

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
              <Box sx={styles.iconBox}>{icon}</Box>
            </Tooltip>
          </Stack>
        )}

        {!isGeographic || isDec ? (
          <TextField
            variant={"standard"}
            size={"small"}
            fullWidth={true}
            type={"number"}
            {...props}
            onChange={handleDecimalChange}
            onBlur={handleDecimalBlur}
            disabled={disabled}
            value={localValues.decimal}
            label={decimalLabel ?? defaultCoordinateLabel}
            sx={textInputSx}
            slotProps={createSlotProps(decimalInputProps)}
          />
        ) : (
          <Stack sx={styles.dmsStack}>
            <TextField
              variant={"standard"}
              fullWidth={true}
              size={"small"}
              type={"number"}
              {...props}
              onChange={handleDmsChange("degree")}
              onBlur={handleDmsBlur}
              disabled={disabled}
              value={localValues.degree}
              label={degreeLabel ?? defaultCoordinateLabel}
              sx={textInputSx}
              slotProps={createSlotProps({
                min: isLat ? -90 : -180,
                max: isLat ? 90 : 180,
                step: decimalStep,
              })}
            />

            <TextField
              variant={"standard"}
              fullWidth={true}
              size={"small"}
              type={"number"}
              {...props}
              onChange={handleDmsChange("minute")}
              onBlur={handleDmsBlur}
              disabled={disabled}
              value={localValues.minute}
              label={minuteLabel}
              sx={textInputSx}
              slotProps={createSlotProps({
                min: 0,
                max: 60,
                step: minuteStep,
              })}
            />

            <TextField
              variant={"standard"}
              fullWidth={true}
              size={"small"}
              type={"number"}
              onChange={handleDmsChange("second")}
              onBlur={handleDmsBlur}
              {...props}
              disabled={disabled}
              value={localValues.second}
              label={secondLabel}
              sx={textInputSx}
              slotProps={createSlotProps({
                min: 0,
                max: 60,
                step: secondStep,
              })}
            />
          </Stack>
        )}

        {showModeToggle && isGeographic && (
          <Tooltip title={isDec ? "DMS" : "Decimal"}>
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
