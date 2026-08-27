import { Box, Stack, SxProps, TextField, Theme, Tooltip } from "@mui/material";
import { useDebounce } from "../../hooks";
import { TextInputProp } from "./Types";
import React from "react";

/** Renders the TextInput component. */
export const TextInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    minLength = 0,
    maxLength = 65536,
    shrink = true,
    delay = 200,
    multiline = true,
    value,
    defaultValue = "",
    onChange,
    onKeyDown,
    slotProps = {},
    sx = {},
    ...props
  }: TextInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<string>(
      String(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(String(value ?? defaultValue));
    }, [value, defaultValue]);

    const debouncedEmit = useDebounce(onChange, delay);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
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

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (multiline && e.key === "Enter" && e.shiftKey) {
          // Let the underlying textarea insert a line break without triggering
          // a commit handler attached by the consumer.
          e.stopPropagation();

          return;
        }

        onKeyDown?.(e);
      },
      [multiline, onKeyDown]
    );

    const textInputStyle = React.useMemo(() => {
      return {
        maxHeight: "100px",
        overflowX: "hidden",
        overflowY: "auto",
        "& .MuiInputBase-input": {
          fontSize: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        },
        ...sx,
      } as SxProps<Theme>;
    }, [sx]);

    const stackSx = React.useMemo(() => {
      return {
        display,
        flexDirection: "row",
        gap: icon ? "1rem" : undefined,
        alignItems: "center",
        width: "100%",
      };
    }, [display, icon]);

    const textFieldSlotProps = React.useMemo(() => {
      const { inputLabel = {}, htmlInput: htmlInputProps = {} } = slotProps;

      return {
        ...slotProps,
        inputLabel: {
          ...inputLabel,
          shrink,
        },
        htmlInput: {
          ...htmlInputProps,
          minLength,
          maxLength,
        },
      };
    }, [shrink, minLength, maxLength, slotProps]);

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
          multiline={multiline}
          spellCheck={false}
          {...props}
          sx={textInputStyle}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={localValue}
          slotProps={textFieldSlotProps}
        />
      </Stack>
    );
  }
);
