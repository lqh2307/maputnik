import {
  CodeRounded,
  SettingsRounded,
  StorageRounded,
} from "@mui/icons-material";
import { Stack } from "@mui/material";
import { TooltipButton } from "../../components/TooltipButton";
import { useDialogStore } from "../../stores";
import { TopBarToolsProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders navigation and modal tool launchers: JSON editor, Sources, and Style settings. */
export const TopBarTools = React.memo(
  ({ compact = false }: TopBarToolsProp): React.JSX.Element | null => {
    const { t } = useTranslation();

    const codeEditorOpen = useDialogStore((state) => {
      return state.code;
    });

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const handler = React.useMemo(() => {
      return {
        toggleJson: (): void => {
          updateDialog({
            code: !codeEditorOpen,
          });
        },
        sources: (): void => {
          updateDialog({
            sources: true,
          });
        },
        settings: (): void => {
          updateDialog({
            settings: true,
          });
        },
      };
    }, [codeEditorOpen, updateDialog]);

    const styles = React.useMemo(() => {
      return {
        button: {
          border: 0,
          color: "text.secondary",
          bgcolor: "transparent",
          boxShadow: "none",
          "&&:hover": {
            outline: "none",
            color: "primary.main",
            bgcolor: "action.hover",
            boxShadow: "none",
            transform: "none",
          },
        },
      };
    }, []);

    if (compact) {
      return null;
    }

    return (
      <Stack direction="row" spacing={0.25}>
        <TooltipButton
          title="JSON"
          variant={"text"}
          icon={<CodeRounded />}
          aria-label="JSON"
          fullWidth={false}
          onClick={handler.toggleJson}
          sx={styles.button}
        />

        <TooltipButton
          title={t("actions.sources")}
          variant={"text"}
          icon={<StorageRounded />}
          aria-label={t("actions.sources")}
          fullWidth={false}
          onClick={handler.sources}
          sx={styles.button}
        />

        <TooltipButton
          title={t("actions.style")}
          variant={"text"}
          icon={<SettingsRounded />}
          aria-label={t("actions.style")}
          fullWidth={false}
          onClick={handler.settings}
          sx={styles.button}
        />
      </Stack>
    );
  }
);
