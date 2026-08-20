import { Box, Stack, TextField, Tooltip } from "@mui/material";
import { limitValue, parseNumber } from "../../utils/Number";
import { useDebounce } from "../../hooks";
import { NumberInputProp } from "./Types";
import React from "react";

/** Renders the NumberInput component. */
export const NumberInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    min = 0,
    max = 65536,
    step = 1,
    shrink = true,
    delay = 200,
    value,
    defaultValue = "0",
    onChange,
    slotProps = {},
    sx = {},
    ...props
  }: NumberInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<string>(
      String(parseNumber(value ?? defaultValue))
    );

    React.useEffect(() => {
      setLocalValue(String(parseNumber(value ?? defaultValue)));
    }, [value, defaultValue]);

    const debouncedEmit = useDebounce(onChange, delay);

    const textFieldSx = React.useMemo(() => {
      return {
        "& input": {
          fontSize: 12,
        },
        ...sx,
      };
    }, [sx]);

    const stackSx = React.useMemo(() => {
      return {
        flexDirection: "row",
        gap: icon ? "1rem" : undefined,
        alignItems: "center",
        width: "100%",
        display: display,
      };
    }, [display, icon]);

    const textFieldSlotProps = React.useMemo(() => {
      const { inputLabel = {}, htmlInput: htmlInputProps = {} } = slotProps;

      return {
        ...slotProps,
        inputLabel: {
          ...inputLabel,
          shrink: shrink,
        },
        htmlInput: {
          ...htmlInputProps,
          min: min,
          max: max,
          step: step,
        },
      };
    }, [shrink, min, max, step, slotProps]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const newVal: string = String(e.target.value);
        const numericValue: number = parseNumber(newVal);

        if (numericValue === undefined) {
          setLocalValue(newVal);

          return;
        }

        const nextValue: number = limitValue(numericValue, min, max);

        setLocalValue(String(nextValue));

        if (delay > 0) {
          debouncedEmit(nextValue);
        } else {
          onChange?.(nextValue);
        }
      },
      [delay, debouncedEmit, onChange, defaultValue, min, max]
    );

    return (
      <Stack sx={stackSx}>
        {icon && (
          <Tooltip title={title}>
            <Box>{icon}</Box>
          </Tooltip>
        )}

        <TextField
          variant={"standard"}
          size={"small"}
          fullWidth={true}
          type={"number"}
          {...props}
          sx={textFieldSx}
          onChange={handleChange}
          value={localValue}
          slotProps={textFieldSlotProps}
        />
      </Stack>
    );
  }
);
