import { Autocomplete, Box, Stack, TextField, Tooltip } from "@mui/material";
import { FreeSoloInputOption, FreeSoloInputProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";

/** Renders the FreeSoloInput component. */
export const FreeSoloInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    options,
    type,
    label,
    name,
    min,
    max,
    step,
    shrink = true,
    onChange,
    delay = 200,
    delaySelect = 200,
    value,
    defaultValue = "",
    sx = {},
    ...props
  }: FreeSoloInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<string>(
      String(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(String(value ?? defaultValue));
    }, [value, defaultValue]);

    const debouncedEmit = React.useMemo(() => {
      return {
        input: (value: string) => {
          onChange?.(value, false);
        },
        select: (value: string) => {
          onChange?.(value, true);
        },
      };
    }, [onChange]);

    const debouncedEmitInput = useDebounce(debouncedEmit.input, delay);

    const debouncedEmitSelect = useDebounce(debouncedEmit.select, delaySelect);

    const handler = React.useMemo(() => {
      return {
        optionLabel: (opt: FreeSoloInputOption | string): string => {
          return typeof opt === "string" ? opt : (opt.title ?? "");
        },
        optionEqual: (
          opt: FreeSoloInputOption | string,
          val: FreeSoloInputOption | string
        ): boolean => {
          return (
            (typeof opt === "string" ? opt : (opt.value ?? defaultValue)) ===
            val
          );
        },
      };
    }, [defaultValue]);

    const handleSelect = React.useCallback(
      (_: React.SyntheticEvent, option: FreeSoloInputOption | string): void => {
        const newVal: string = (
          typeof option === "string"
            ? String(option ?? defaultValue)
            : String(option?.value ?? defaultValue)
        ).trim();

        setLocalValue(newVal);

        if (delaySelect > 0) {
          debouncedEmitSelect(newVal);
        } else {
          onChange?.(newVal, true);
        }
      },
      [delaySelect, debouncedEmitSelect, onChange, defaultValue]
    );

    const handleInput = React.useCallback(
      (_: React.SyntheticEvent, value: string): void => {
        const newVal: string = String(value ?? defaultValue).trim();

        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmitInput(newVal);
        } else {
          onChange?.(newVal, false);
        }
      },
      [delay, debouncedEmitInput, onChange, defaultValue]
    );

    const stackSx = React.useMemo(() => {
      return {
        flexDirection: "row",
        gap: icon ? "1rem" : undefined,
        alignItems: "center",
        width: "100%",
        display,
      };
    }, [display, icon]);

    const textFieldSx = React.useMemo(() => {
      return {
        "& input": {
          fontSize: 12,
        },
        ...sx,
      };
    }, [sx]);

    return (
      <Stack sx={stackSx}>
        {icon && (
          <Tooltip title={title}>
            <Box>{icon}</Box>
          </Tooltip>
        )}

        <Autocomplete
          size={"small"}
          fullWidth={true}
          disableClearable={true}
          freeSolo={true}
          options={options}
          getOptionLabel={handler.optionLabel}
          isOptionEqualToValue={handler.optionEqual}
          {...props}
          onChange={handleSelect}
          onInputChange={handleInput}
          value={localValue}
          renderInput={(params) => {
            return (
              <TextField
                variant={"standard"}
                size={"small"}
                type={type}
                name={name}
                sx={textFieldSx}
                label={label}
                {...params}
                slotProps={{
                  ...(params.slotProps ?? {}),
                  inputLabel: {
                    ...(params.slotProps?.inputLabel ?? {}),
                    shrink,
                  },
                  htmlInput: {
                    ...(params.slotProps?.htmlInput ?? {}),
                    min,
                    max,
                    step,
                  },
                }}
              />
            );
          }}
        />
      </Stack>
    );
  }
);
