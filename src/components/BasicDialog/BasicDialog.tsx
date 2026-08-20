import { BasicDialogProp } from "./Types";
import React from "react";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Dialog,
  Box,
} from "@mui/material";

/** Renders the BasicDialog component. */
export const BasicDialog = React.memo(
  ({
    dialogTitle,
    dialogContent,
    dialogAction,
    onClose,
    backdropClickClose,
    escapeKeyDownClose,
    ...props
  }: BasicDialogProp): React.JSX.Element => {
    const styles = React.useMemo(() => {
      return {
        titleBox: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        },
      };
    }, []);

    const handleClose = React.useCallback(
      (_: object, reason: "backdropClick" | "escapeKeyDown") => {
        if (
          (reason === "backdropClick" && !backdropClickClose) ||
          (reason === "escapeKeyDown" && !escapeKeyDownClose)
        ) {
          return;
        }

        onClose?.();
      },
      [backdropClickClose, escapeKeyDownClose, onClose]
    );

    return (
      <Dialog maxWidth={"xs"} fullWidth={true} onClose={handleClose} {...props}>
        {dialogTitle && (
          <DialogTitle>
            <Box sx={styles.titleBox}>{dialogTitle}</Box>
          </DialogTitle>
        )}

        <Divider />

        {dialogContent && <DialogContent>{dialogContent}</DialogContent>}

        <Divider />

        {dialogAction && <DialogActions>{dialogAction}</DialogActions>}
      </Dialog>
    );
  }
);
