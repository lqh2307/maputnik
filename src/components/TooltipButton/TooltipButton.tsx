import { Typography, Tooltip, Button, Popper, Box } from "@mui/material";
import { useDebounce, useEventListener } from "../../hooks";
import { INTERACTIVE_HOVER_STYLE } from "../../configs";
import { TooltipButtonProp } from "./Types";
import React from "react";

const TooltipButtonInner = React.forwardRef<
  HTMLButtonElement,
  TooltipButtonProp
>(
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
      contextMenuPlacement = "top-start",
      contextMenuCloseOnClickAway,
      contextMenuCloseOnClickInside,
      onContextMenu,
      contextMenu,
      children,
      draggable,
      background,
      outline,
      sx = {},
      ...props
    }: TooltipButtonProp,
    ref
  ): React.JSX.Element => {
    const popperRef = React.useRef<HTMLDivElement>(undefined);
    const [anchorEl, setAnchorEl] =
      React.useState<HTMLButtonElement>(undefined);

    const debouncedEmit = useDebounce(onClick, delay);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        const newVal: string = String(e.currentTarget.value ?? defaultValue);

        if (delay > 0) {
          debouncedEmit(newVal, e);
        } else {
          onClick?.(newVal, e);
        }
      },
      [delay, debouncedEmit, onClick, defaultValue]
    );

    const handleOpenContextMenu = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (contextMenu) {
          onContextMenu?.(e);

          setAnchorEl((prev) => {
            return prev ? undefined : e.currentTarget;
          });
        }
      },
      [contextMenu, onContextMenu]
    );

    const isClickInsideContextMenu = React.useCallback(
      (event: MouseEvent): boolean => {
        // Check if click is inside context menu content
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

    const documentTarget =
      anchorEl && contextMenuCloseOnClickAway ? window : undefined;

    useEventListener(documentTarget, "mousedown", handleCloseContextMenu);

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
                variant={"outlined"}
                type={"button"}
                size={"small"}
                onClick={handleClick}
                onContextMenu={handleOpenContextMenu}
                draggable={draggable}
                loading={loading}
                loadingIndicator={loadingIndicator}
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

/** Renders the TooltipButton component. */
export const TooltipButton = React.memo(TooltipButtonInner);
