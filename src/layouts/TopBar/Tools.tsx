import {
  CodeRounded,
  SettingsRounded,
  StorageRounded,
} from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { useDialogStore } from "../../stores";
import { TopBarToolsProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders navigation and modal tool launchers: JSON editor, Sources, and Style settings. */
export const TopBarTools = React.memo(
  ({ compact = false }: TopBarToolsProp): React.JSX.Element | null => {
    const { t } = useTranslation("editor");

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

    if (compact) {
      return null;
    }

    return (
      <Stack direction="row" spacing={0.25}>
        <Button
          size={"small"}
          color="inherit"
          startIcon={<CodeRounded />}
          onClick={handler.toggleJson}
        >
          JSON
        </Button>

        <Button
          size={"small"}
          color="inherit"
          startIcon={<StorageRounded />}
          onClick={handler.sources}
        >
          {t("actions.sources")}
        </Button>

        <Button
          size={"small"}
          color="inherit"
          startIcon={<SettingsRounded />}
          onClick={handler.settings}
        >
          {t("actions.style")}
        </Button>
      </Stack>
    );
  }
);
