import { Box, Stack, TextField, Tooltip } from "@mui/material";
import { BLACK_COLOR } from "../../configs";
import { useDebounce } from "../../hooks";
import { ColorInputProp } from "./Types";
import React from "react";

/** Renders the ColorInput component. */
export const ColorInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    onChange,
    delay = 200,
    value,
    defaultValue = BLACK_COLOR,
    slotProps = {},
    disableUnderline = true,
    sx = {},
    ...props
  }: ColorInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<string>(
      String(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(String(value ?? defaultValue));
    }, [value, defaultValue]);

    const debouncedEmit = useDebounce(onChange, delay);

    const textFieldSx = React.useMemo(() => {
      return {
        "& input": {
          fontSize: 12,
          cursor: "pointer",
        },
        ...sx,
      };
    }, [sx]);

    const textFieldSlotProps = React.useMemo(() => {
      const { input: inputSlotProps = {} } = slotProps ?? {};

      return {
        ...slotProps,
        input: {
          ...inputSlotProps,
          disableUnderline,
        },
      };
    }, [slotProps, disableUnderline]);

    const stackSx = React.useMemo(() => {
      return {
        flexDirection: "row",
        gap: icon ? "1rem" : undefined,
        alignItems: "center",
        width: "100%",
        display,
      };
    }, [display, icon]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newVal: string = String(e.target.value ?? defaultValue).trim();

        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmit(newVal);
        } else {
          onChange?.(newVal);
        }
      },
      [delay, debouncedEmit, onChange, defaultValue]
    );

    return (
      <Stack sx={stackSx}>
        {icon && <Tooltip title={title}>{<Box>{icon}</Box>}</Tooltip>}

        <TextField
          variant={"standard"}
          size={"small"}
          fullWidth={true}
          type={"color"}
          {...props}
          onChange={handleChange}
          value={localValue}
          sx={textFieldSx}
          slotProps={textFieldSlotProps}
        />
      </Stack>
    );
  }
);
