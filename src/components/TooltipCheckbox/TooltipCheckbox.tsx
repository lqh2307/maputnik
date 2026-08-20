import { Stack, Tooltip, Checkbox, Box } from "@mui/material";
import { INTERACTIVE_HOVER_STYLE } from "../../configs";
import { TooltipCheckboxProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";

/** Renders the TooltipCheckbox component. */
export const TooltipCheckbox = React.memo(
  ({
    display = "flex",
    title,
    label,
    onChange,
    delay = 200,
    checked,
    value,
    defaultChecked = false,
    defaultValue = "",
    sx = {},
    ...props
  }: TooltipCheckboxProp): React.JSX.Element => {
    const [localChecked, setLocalChecked] = React.useState<boolean>(
      checked ?? defaultChecked
    );
    const [localValue, setLocalValue] = React.useState<string>(
      String(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalChecked(checked ?? defaultChecked);
    }, [checked, defaultChecked]);

    React.useEffect(() => {
      setLocalValue(String(value ?? defaultValue));
    }, [value, defaultValue]);

    const debouncedEmit = useDebounce(onChange, delay);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
        const newChe: boolean = checked ?? defaultChecked;
        const newVal: string = String(e.target.value ?? defaultValue);

        setLocalChecked(newChe);
        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmit(newChe, newVal);
        } else {
          onChange?.(newChe, newVal);
        }
      },
      [delay, debouncedEmit, onChange, defaultChecked, defaultValue]
    );

    const stackSx = React.useMemo(() => {
      return {
        flexDirection: "row",
        gap: "0.5rem",
        alignItems: "center",
        width: "100%",
        display: display,
      };
    }, [display]);

    const switchSx = React.useMemo(() => {
      return {
        minWidth: 0,
        minHeight: 0,
        ...INTERACTIVE_HOVER_STYLE,
        ...sx,
      };
    }, [sx]);

    return (
      <Stack sx={stackSx}>
        <Tooltip title={title}>
          <Box>
            <Checkbox
              size={"small"}
              sx={switchSx}
              {...props}
              onChange={handleChange}
              checked={localChecked}
              value={localValue}
            />
          </Box>
        </Tooltip>

        {label && <Box>{label}</Box>}
      </Stack>
    );
  }
);
