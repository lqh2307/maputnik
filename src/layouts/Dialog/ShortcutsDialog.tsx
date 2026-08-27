import {
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
import { TooltipButton } from "../../components/TooltipButton";
import { ShortcutsDialogProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the keyboard shortcut cheatsheet dialog. */
export const ShortcutsDialog = React.memo(
  ({ open = false }: ShortcutsDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const translateAction = React.useCallback(
      (section: string): string => {
        return ["copy", "paste", "close"].includes(section)
          ? t(`common.button.${section}`)
          : t(`topBar.actions.${section}`);
      },
      [t]
    );

    const translateDialog = React.useCallback(
      (section: string): string => {
        return t(`dialog.${section}`);
      },
      [t]
    );

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const shortcuts: [string, string][] = React.useMemo(() => {
      return [
        ["Ctrl/Cmd + Z", translateAction("undo")],
        ["Ctrl/Cmd + Shift + Z / Y", translateAction("redo")],
        ["Ctrl/Cmd + C", translateAction("copy")],
        ["Ctrl/Cmd + V", translateAction("paste")],
        ["Ctrl/Cmd + D", translateDialog("shortcutDuplicate")],
        ["Ctrl/Cmd + O", translateAction("open")],
        ["Ctrl/Cmd + S", translateAction("export")],
        ["Ctrl/Cmd + E", translateAction("editJson")],
        ["Delete", translateDialog("shortcutDelete")],
        ["I", translateDialog("shortcutInspect")],
        ["?", translateDialog("shortcutOpen")],
      ];
    }, [translateAction, translateDialog]);

    const close = React.useCallback((): void => {
      updateDialog({
        shortcuts: false,
      });
    }, []);

    return (
      <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
        <DialogTitle>{translateDialog("shortcutsTitle")}</DialogTitle>

        <DialogContent dividers>
          <List dense disablePadding>
            {shortcuts.map(([keys, action], index) => {
              return (
                <React.Fragment key={keys}>
                  {index > 0 && <Divider />}

                  <ListItem>
                    <ListItemText primary={action} />
                    <Chip label={keys} size={"small"} variant={"outlined"} />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </DialogContent>

        <DialogActions>
          <TooltipButton
            title={translateAction("close")}
            variant={"text"}
            onClick={close}
          >
            {translateAction("close")}
          </TooltipButton>
        </DialogActions>
      </Dialog>
    );
  }
);
