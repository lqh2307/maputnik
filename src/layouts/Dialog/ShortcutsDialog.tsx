import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useDialogStore } from "../../stores";
import { ShortcutsDialogProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the keyboard shortcut cheatsheet dialog. */
export const ShortcutsDialog = React.memo(
  ({ open = false }: ShortcutsDialogProp): React.JSX.Element => {
    const { t } = useTranslation("editor");

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const shortcuts: [string, string][] = React.useMemo(() => {
      return [
        ["Ctrl/Cmd + Z", t("actions.undo")],
        ["Ctrl/Cmd + Shift + Z / Y", t("actions.redo")],
        ["Ctrl/Cmd + C", t("actions.copyLayer")],
        ["Ctrl/Cmd + V", t("actions.pasteLayer")],
        ["Ctrl/Cmd + D", t("dialog.shortcutDuplicate")],
        ["Ctrl/Cmd + O", t("actions.open")],
        ["Ctrl/Cmd + S", t("actions.export")],
        ["Ctrl/Cmd + E", t("actions.editJson")],
        ["Delete", t("dialog.shortcutDelete")],
        ["I", t("dialog.shortcutInspect")],
        ["?", t("dialog.shortcutOpen")],
      ];
    }, [t]);

    const close = React.useCallback((): void => {
      updateDialog({
        shortcuts: false,
      });
    }, [updateDialog]);

    return (
      <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
        <DialogTitle>{t("dialog.shortcutsTitle")}</DialogTitle>

        <DialogContent dividers>
          <List dense disablePadding>
            {shortcuts.map(([keys, action], index) => {
              return (
                <React.Fragment key={keys}>
                  {index > 0 && <Divider />}

                  <ListItem>
                    <ListItemText primary={action} />
                    <Chip label={keys} size="small" variant="outlined" />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </DialogContent>

        <DialogActions>
          <Button onClick={close}>{t("actions.close")}</Button>
        </DialogActions>
      </Dialog>
    );
  }
);
