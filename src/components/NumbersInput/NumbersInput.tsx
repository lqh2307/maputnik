import { Box, Stack, TextField, Tooltip } from "@mui/material";
import { parseNumber, parseNumberList } from "../../utils/Number";
import { NumbersInputProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";

const formatNumbersDisplay = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        return String(parseNumber(item));
      })
      .join(", ");
  }

  return String(value ?? "");
};

/** Renders the NumbersInput component. */
export const NumbersInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    shrink = true,
    delay = 200,
    value,
    defaultValue = "",
    onChange,
    slotProps = {},
    sx = {},
    ...props
  }: NumbersInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<string>(
      formatNumbersDisplay(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(formatNumbersDisplay(value ?? defaultValue));
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
        display,
      };
    }, [display, icon]);

    const textFieldSlotProps = React.useMemo(() => {
      const { inputLabel = {} } = slotProps;

      return {
        ...slotProps,
        inputLabel: {
          ...inputLabel,
          shrink,
        },
      };
    }, [shrink, slotProps]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const newVal: string = String(e.target.value ?? defaultValue);
        const numbers: number[] = parseNumberList(newVal);

        setLocalValue(newVal);

        if (numbers === undefined) {
          return;
        }

        if (delay > 0) {
          debouncedEmit(numbers);
        } else {
          onChange?.(numbers);
        }
      },
      [delay, debouncedEmit, onChange, defaultValue]
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
          type={"text"}
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
