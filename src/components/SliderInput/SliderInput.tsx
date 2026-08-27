import { Box, Slider, Stack, Tooltip } from "@mui/material";
import { limitValue } from "../../utils/Number";
import { useDebounce } from "../../hooks";
import { SliderInputProp } from "./Types";
import React from "react";

/** Renders the SliderInput component. */
export const SliderInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    min = 0,
    max = 65536,
    step = 1,
    onChange,
    delay = 200,
    value,
    defaultValue = 0,
    sx = {},
    ...props
  }: SliderInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<number>(
      Number(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(Number(value ?? defaultValue));
    }, [value, defaultValue]);

    const debouncedEmit = useDebounce(onChange, delay);

    const handleChange = React.useCallback(
      (_: Event, value: number): void => {
        const newVal: number = limitValue(
          Number(value ?? defaultValue),
          min,
          max
        );

        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmit(newVal);
        } else {
          onChange?.(newVal);
        }
      },
      [delay, debouncedEmit, onChange, defaultValue, min, max]
    );

    const stackSx = React.useMemo(() => {
      return {
        display,
        flexDirection: "row",
        gap: icon ? "1rem" : undefined,
        alignItems: "center",
        width: "100%",
      };
    }, [display, icon]);

    const sliderSx = React.useMemo(() => {
      return {
        "& .MuiSlider-markLabel": {
          fontSize: 10,
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

        <Slider
          size={"small"}
          valueLabelDisplay={"auto"}
          min={min}
          max={max}
          step={step}
          {...props}
          sx={sliderSx}
          onChange={handleChange}
          value={localValue}
        />
      </Stack>
    );
  }
);
