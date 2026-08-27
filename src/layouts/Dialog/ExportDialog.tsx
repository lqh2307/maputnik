import { ContentCopyRounded, DownloadRounded } from "@mui/icons-material";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useDialogStore, useGlobalStore } from "../../stores";
import { downloadStyle, validateStyleDocument } from "../Utils";
import { TextInput } from "../../components/TextInput";
import { TooltipButton } from "../../components/TooltipButton";
import { CODE_TEXTAREA } from "../../configs/styles";
import { ExportDialogProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

const EMPTY_STYLE = {
  version: 8,
  sources: {},
  layers: [],
} as import("maplibre-gl").StyleSpecification;

/** Renders style validation and formatted JSON export dialog. */
export const ExportDialog = React.memo(
  ({ open = false }: ExportDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const style =
      useGlobalStore((state) => {
        return open ? state.style : undefined;
      }) ?? EMPTY_STYLE;

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const markSaved = useGlobalStore((state) => {
      return state.markSaved;
    });

    const [copied, setCopied] = React.useState(false);

    const issues = React.useMemo(() => {
      return validateStyleDocument(style);
    }, [style]);

    const copy = React.useCallback(async (): Promise<void> => {
      await navigator.clipboard.writeText(JSON.stringify(style, null, 2));
      setCopied(true);
    }, [style]);

    const close = React.useCallback((): void => {
      updateDialog({
        export: false,
      });
    }, []);

    const download = React.useCallback(async (): Promise<void> => {
      await downloadStyle(style);
      markSaved();
    }, [style]);

    const styles = React.useMemo(() => {
      return {
        warning: {
          mb: 2,
        },
        textarea: {
          ...CODE_TEXTAREA,
        },
      };
    }, []);

    return (
      <Dialog open={open} onClose={close} fullWidth maxWidth="md">
        <DialogTitle>{t("dialog.exportTitle")}</DialogTitle>

        <DialogContent>
          {issues.length > 0 && (
            <Alert severity={"warning"} sx={styles.warning}>
              {t("dialog.exportWarning", {
                count: issues.length,
              })}
            </Alert>
          )}

          <TextInput
            value={JSON.stringify(style, null, 2)}
            multiline
            minRows={18}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            sx={styles.textarea}
          />
        </DialogContent>

        <DialogActions>
          <TooltipButton
            title={
              copied ? t("topBar.actions.copied") : t("common.button.copy")
            }
            variant={"text"}
            startIcon={<ContentCopyRounded />}
            onClick={copy}
          >
            {copied ? t("topBar.actions.copied") : t("common.button.copy")}
          </TooltipButton>

          <TooltipButton
            title={t("topBar.actions.download")}
            variant={"contained"}
            startIcon={<DownloadRounded />}
            onClick={download}
          >
            {t("topBar.actions.download")}
          </TooltipButton>

          <TooltipButton
            title={t("common.button.close")}
            variant={"text"}
            onClick={close}
          >
            {t("common.button.close")}
          </TooltipButton>
        </DialogActions>
      </Dialog>
    );
  }
);
