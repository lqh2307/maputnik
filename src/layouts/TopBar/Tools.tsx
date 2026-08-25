import { TooltipButton } from "../../components/TooltipButton";
import { useTranslation } from "react-i18next";
import { useDialogStore } from "../../stores";
import { TopBarToolsProp } from "./Types";
import { Stack } from "@mui/material";
import React from "react";
import {
  SettingsRounded,
  StorageRounded,
  CodeRounded,
} from "@mui/icons-material";

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

    const translate = React.useCallback(
      (section: string): string => {
        return t(`topBar.actions.${section}`);
      },
      [t]
    );

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
    }, [codeEditorOpen]);

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
          title={translate("editJson")}
          variant={"text"}
          icon={<CodeRounded />}
          fullWidth={false}
          onClick={handler.toggleJson}
          sx={styles.button}
        />

        <TooltipButton
          title={translate("sources")}
          variant={"text"}
          icon={<StorageRounded />}
          fullWidth={false}
          onClick={handler.sources}
          sx={styles.button}
        />

        <TooltipButton
          title={translate("settings")}
          variant={"text"}
          icon={<SettingsRounded />}
          fullWidth={false}
          onClick={handler.settings}
          sx={styles.button}
        />
      </Stack>
    );
  }
);
