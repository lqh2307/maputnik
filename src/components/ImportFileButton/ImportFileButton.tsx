import { Typography, Tooltip, Button, Box } from "@mui/material";
import { INTERACTIVE_HOVER_STYLE } from "../../configs";
import { ImportFileButtonProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";

/** Renders the ImportFileButton component. */
export const ImportFileButton = React.memo(
  ({
    display = "flex",
    title,
    icon,
    delay = 200,
    defaultValue = "",
    onClick,
    onFileLoaded,
    acceptMimeType,
    loading,
    progress,
    titlePlacement = "bottom",
    children,
    draggable,
    sx = {},
    ...props
  }: ImportFileButtonProp): React.JSX.Element => {
    const fileInputRef = React.useRef<HTMLInputElement>(undefined);

    const debouncedEmitClick = useDebounce(onClick, delay);

    const handleButtonClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        const newVal: string = String(e.currentTarget.value ?? defaultValue);

        if (delay > 0) {
          debouncedEmitClick(newVal);
        } else {
          onClick?.(newVal);
        }

        fileInputRef.current?.click();
      },
      [debouncedEmitClick, delay, onClick, defaultValue]
    );

    const handleFileLoaded = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) {
          return;
        }

        onFileLoaded?.(file);
      },
      [onFileLoaded]
    );

    const buttonSx = React.useMemo(() => {
      return {
        display: "flex",
        minWidth: 0,
        alignItems: "center",
        justifyContent: "center",
        ...INTERACTIVE_HOVER_STYLE,
        cursor: draggable ? "grab" : undefined,
        ...sx,
      };
    }, [sx, draggable]);

    const styles = React.useMemo(() => {
      return {
        input: {
          display: "none",
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
                fullWidth={true}
                variant={"outlined"}
                size={"small"}
                type={"button"}
                onClick={handleButtonClick}
                draggable={draggable}
                loading={loading}
                loadingIndicator={loadingIndicator}
                sx={buttonSx}
                {...props}
              >
                {icon ?? children}
              </Button>
            </Box>
          </Tooltip>

          <input
            type={"file"}
            accept={acceptMimeType}
            style={styles.input}
            ref={fileInputRef}
            onChange={handleFileLoaded}
          />
        </>
      )
    );
  }
);
