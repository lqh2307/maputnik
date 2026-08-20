import { Typography, Tooltip, Button, Popper, Box } from "@mui/material";
import { useDebounce, useEventListener } from "../../hooks";
import { INTERACTIVE_HOVER_STYLE } from "../../configs";
import { ToggleButtonProp } from "./Types";
import React from "react";

const ToggleButtonInner = React.forwardRef<HTMLButtonElement, ToggleButtonProp>(
  (
    {
      display = "flex",
      title,
      icon,
      onClick,
      delay = 200,
      loading,
      progress,
      titlePlacement = "bottom",
      defaultValue = "",
      defaultChecked = false,
      checked,
      contextMenuPlacement = "top-start",
      contextMenuCloseOnClickAway,
      contextMenuCloseOnClickInside,
      contextMenu,
      children,
      draggable,
      background,
      outline,
      sx = {},
      ...props
    }: ToggleButtonProp,
    ref
  ): React.JSX.Element => {
    const popperRef = React.useRef<HTMLDivElement>(undefined);
    const [anchorEl, setAnchorEl] =
      React.useState<HTMLButtonElement>(undefined);

    const [localChecked, setLocalChecked] = React.useState<boolean>(
      checked ?? defaultChecked
    );

    React.useEffect(() => {
      setLocalChecked(checked ?? defaultChecked);
    }, [checked, defaultChecked]);

    const debouncedEmit = useDebounce(onClick, delay);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        const newVal: string = String(e.currentTarget.value ?? defaultValue);
        const newChecked: boolean = !localChecked;

        setLocalChecked(newChecked);

        if (delay > 0) {
          debouncedEmit(newVal, newChecked);
        } else {
          onClick?.(newVal, newChecked);
        }
      },
      [delay, debouncedEmit, onClick, defaultValue, localChecked]
    );

    const handleOpenContextMenu = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (contextMenu) {
          setAnchorEl((prev) => {
            return prev ? undefined : e.currentTarget;
          });
        }
      },
      [contextMenu]
    );

    const isClickInsideContextMenu = React.useCallback(
      (event: MouseEvent): boolean => {
        if (popperRef.current?.contains(event.target as HTMLElement)) {
          return true;
        }

        const clickedElement = document.elementsFromPoint(
          event.clientX,
          event.clientY
        );

        for (const element of clickedElement) {
          if (
            element.classList.contains("MuiPopover-root") ||
            element.classList.contains("MuiPopper-root") ||
            element.classList.contains("MuiMenu-paper") ||
            element.classList.contains("MuiList-root")
          ) {
            return true;
          }
        }

        return false;
      },
      []
    );

    const handleCloseContextMenu = React.useCallback(
      (event?: MouseEvent): void => {
        if (!contextMenuCloseOnClickAway) {
          return;
        }

        // If event is provided, check if click is inside context menu or any MUI dropdowns
        if (
          event &&
          (anchorEl?.contains(event.target as HTMLElement) ||
            isClickInsideContextMenu(event))
        ) {
          return;
        }

        setAnchorEl(undefined);
      },
      [anchorEl, contextMenuCloseOnClickAway]
    );

    useEventListener(
      anchorEl && contextMenuCloseOnClickAway ? window : undefined,
      "mousedown",
      handleCloseContextMenu
    );

    const handleCloseContextMenuInside = React.useCallback((): void => {
      if (contextMenuCloseOnClickInside) {
        setAnchorEl(undefined);
      }
    }, [contextMenuCloseOnClickInside]);

    const buttonSx = React.useMemo(() => {
      return {
        display: "flex",
        minWidth: 0,
        alignItems: "center",
        justifyContent: "center",
        ...INTERACTIVE_HOVER_STYLE,
        cursor: draggable ? "grab" : undefined,
        background: background,
        outline: outline,
        ...sx,
      };
    }, [sx, draggable, background, outline]);

    const styles = React.useMemo(() => {
      return {
        popper: {
          zIndex: 1500,
        },
      };
    }, []);

    const loadingIndicator = React.useMemo((): React.JSX.Element => {
      if (loading && progress) {
        return (
          <Typography variant={"caption"} component={"span"}>
            {`${Math.round(progress)}%`}
          </Typography>
        );
      }
    }, [loading, progress]);

    return (
      display !== "none" && (
        <>
          <Tooltip title={title} placement={titlePlacement}>
            <Box>
              <Button
                ref={ref}
                className={"cannot-draggable"}
                fullWidth={true}
                variant={localChecked ? "contained" : "outlined"}
                type={"button"}
                size={"small"}
                onClick={handleClick}
                onContextMenu={handleOpenContextMenu}
                draggable={draggable}
                loading={loading}
                loadingIndicator={loadingIndicator}
                value={props.value ?? defaultValue}
                aria-pressed={localChecked}
                {...props}
                sx={buttonSx}
              >
                {icon ?? children}
              </Button>
            </Box>
          </Tooltip>

          {contextMenu && (
            <Popper
              open={!!anchorEl}
              anchorEl={anchorEl}
              placement={contextMenuPlacement}
              keepMounted={true}
              sx={styles.popper}
            >
              <Box ref={popperRef} onClick={handleCloseContextMenuInside}>
                {contextMenu}
              </Box>
            </Popper>
          )}
        </>
      )
    );
  }
);

/** Renders the ToggleButton component. */
export const ToggleButton = React.memo(ToggleButtonInner);
