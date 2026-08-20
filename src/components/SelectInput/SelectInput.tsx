import { SelectInputProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";
import {
  TextField,
  MenuItem,
  SxProps,
  Tooltip,
  Stack,
  Theme,
  Box,
} from "@mui/material";

/** Renders the SelectInput component. */
export const SelectInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    options,
    shrink = true,
    onChange,
    onOpen,
    onScroll,
    delay = 200,
    value,
    defaultValue = "",
    slotProps = {},
    sx = {},
    maxSelectHeight = 200,
    ...props
  }: SelectInputProp): React.JSX.Element => {
    const selectSlotProps: any = slotProps.select ?? {};
    const menuProps: any = selectSlotProps.MenuProps ?? {};

    const mergedMenuProps = React.useMemo(() => {
      return {
        ...menuProps,
        slotProps: {
          ...(menuProps.slotProps ?? {}),
          root: {
            ...(menuProps.slotProps?.root ?? {}),
            sx: {
              zIndex: 1500,
              ...(menuProps.slotProps?.root?.sx ?? {}),
            },
          },
          paper: {
            onScroll: onScroll,
            ...(menuProps.slotProps?.paper ?? {}),
            sx: {
              zIndex: 1550,
              maxHeight: maxSelectHeight,
              ...(menuProps.slotProps?.paper?.sx ?? {}),
            },
          },
        },
      };
    }, [menuProps, onScroll, maxSelectHeight]);

    const styles = React.useMemo(() => {
      return {
        menuItem: (itemSx: SxProps<Theme> = {}): SxProps<Theme> => {
          return {
            fontSize: 12,
            ...itemSx,
          };
        },
      };
    }, []);

    const menuItems: React.JSX.Element[] = React.useMemo(() => {
      return (options ?? []).map((item) => {
        return (
          <MenuItem
            disableRipple={true}
            disableTouchRipple={true}
            key={item.value}
            value={item.value}
            {...(item.menuItemProp ?? {})}
            sx={styles.menuItem(item.menuItemProp?.sx)}
          >
            {item.title}
          </MenuItem>
        );
      });
    }, [options]);

    const [localValue, setLocalValue] = React.useState<string>(
      String(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(String(value ?? defaultValue));
    }, [value, defaultValue]);

    const debouncedEmit = useDebounce(onChange, delay);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newVal: string = String(e.target.value ?? defaultValue);

        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmit(newVal);
        } else {
          onChange?.(newVal);
        }
      },
      [delay, debouncedEmit, onChange, defaultValue]
    );

    const stackSx = React.useMemo(() => {
      return {
        display: display,
        flexDirection: "row",
        gap: icon ? "1rem" : undefined,
        alignItems: "center",
        width: "100%",
      };
    }, [display, icon]);

    const textFieldSx = React.useMemo(() => {
      return {
        "& .MuiSelect-select": {
          fontSize: 12,
        },
        ...sx,
      } as SxProps<Theme>;
    }, [sx]);

    const textFieldSlotProps = React.useMemo(() => {
      const { inputLabel = {}, select: selectSlotProps = {} } = slotProps;

      return {
        ...slotProps,
        inputLabel: {
          ...inputLabel,
          shrink: shrink,
        },
        select: {
          ...selectSlotProps,
          onOpen: onOpen,
          MenuProps: mergedMenuProps,
        },
      };
    }, [shrink, slotProps, onOpen, mergedMenuProps]);

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
          select={true}
          fullWidth={true}
          {...props}
          sx={textFieldSx}
          slotProps={textFieldSlotProps}
          onChange={handleChange}
          value={options?.length ? localValue : ""}
        >
          {menuItems}
        </TextField>
      </Stack>
    );
  }
);
