import { Typography, Tooltip, Button, Popper, Box } from "@mui/material";
import { useDebounce, useEventListener } from "../../hooks";
import { INTERACTIVE_HOVER_STYLE } from "../../configs";
import { PopperButtonProp } from "./Types";
import React from "react";

/** Renders the PopperButton component. */
export const PopperButton = React.memo(
  ({
    display = "flex",
    title,
    icon,
    initOpen,
    placement = "bottom-start",
    delay = 200,
    children,
    titlePlacement = "bottom",
    defaultValue = "",
    onClick,
    loading,
    progress,
    sx = {},
    closeOnClickAway,
    closeOnClickInside,
    draggable,
    background,
    outline,
    ...props
  }: PopperButtonProp): React.JSX.Element => {
    const buttonRef = React.useRef<HTMLButtonElement>(undefined);
    const popperRef = React.useRef<HTMLDivElement>(undefined);
    const [anchorEl, setAnchorEl] =
      React.useState<HTMLButtonElement>(undefined);

    // Initialize anchorEl after mount if initOpen is true
    React.useEffect(() => {
      if (initOpen) {
        setAnchorEl(buttonRef.current);
      }
    }, []);

    const debouncedEmit = useDebounce(onClick, delay);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        const target: EventTarget & HTMLButtonElement = e.currentTarget;
        const value: string = String(target.value ?? defaultValue);

        setAnchorEl((prev) => {
          return prev ? undefined : target;
        });

        if (delay > 0) {
          debouncedEmit(value);
        } else {
          onClick?.(value);
        }
      },
      [delay, debouncedEmit, onClick, defaultValue]
    );

    const isClickInsidePopper = React.useCallback(
      (event: MouseEvent): boolean => {
        // Check if click is inside popper content
        if (popperRef.current?.contains(event.target as HTMLElement)) {
          return true;
        }

        // Check if click is inside any MUI Popper/Menu dropdown (SelectInput, etc.)
        const clickedElement = document.elementsFromPoint(
          event.clientX,
          event.clientY
        );

        for (const element of clickedElement) {
          // Check for MUI Menu/Popper dropdowns
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

    const handleClose = React.useCallback(
      (event?: MouseEvent): void => {
        if (!closeOnClickAway) {
          return;
        }

        // If event is provided, check if click is inside popper or any MUI dropdowns
        if (
          event &&
          (buttonRef.current?.contains(event.target as HTMLElement) ||
            isClickInsidePopper(event))
        ) {
          return;
        }

        setAnchorEl(undefined);
      },
      [closeOnClickAway]
    );

    useEventListener(
      anchorEl && closeOnClickAway ? window : undefined,
      "mousedown",
      handleClose
    );

    const handleCloseInside = React.useCallback((): void => {
      if (closeOnClickInside) {
        setAnchorEl(undefined);
      }
    }, [closeOnClickInside]);

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
                className={"cannot-draggable"}
                ref={buttonRef}
                fullWidth={true}
                variant={"outlined"}
                type={"button"}
                size={"small"}
                onClick={handleClick}
                draggable={draggable}
                loading={loading}
                loadingIndicator={loadingIndicator}
                sx={buttonSx}
                {...props}
              >
                {icon}
              </Button>
            </Box>
          </Tooltip>

          <Popper
            open={!!anchorEl}
            anchorEl={anchorEl}
            placement={placement}
            keepMounted={true}
            sx={styles.popper}
          >
            <Box ref={popperRef} onClick={handleCloseInside}>
              {children}
            </Box>
          </Popper>
        </>
      )
    );
  }
);
