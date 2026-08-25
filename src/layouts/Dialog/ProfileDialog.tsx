import { TooltipButton } from "../../components/TooltipButton";
import { BasicDialog } from "../../components/BasicDialog";
import { DIALOG_CONTENT, DIALOG_TITLE, TEXT_BUTTON } from "../../configs";
import { CloseTwoTone } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDialogStore } from "../../stores";
import { ProfileDialogProp } from "./Types";
import React from "react";

/** Shows profile information available to the editor. */
export const ProfileDialog = React.memo(
  ({ open }: ProfileDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const close = React.useCallback((): void => {
      updateDialog({
        profile: undefined,
      });
    }, []);

    const dialogTitle = React.useMemo(() => {
      return (
        <>
          <Typography sx={DIALOG_TITLE}>{t("dialog.profile.title")}</Typography>

          <TooltipButton
            title={t("common.button.close")}
            onClick={close}
            icon={<CloseTwoTone fontSize={"small"} />}
            color={"error"}
          />
        </>
      );
    }, [t]);

    const dialogContent = React.useMemo(() => {
      return (
        <Box sx={DIALOG_CONTENT}>
          <Typography sx={TEXT_BUTTON}>
            {t("dialog.profile.message")}
          </Typography>
        </Box>
      );
    }, [t]);

    const dialogAction = React.useMemo(() => {
      return (
        <TooltipButton onClick={close} title={t("common.button.close")}>
          <Typography sx={TEXT_BUTTON}>{t("common.button.close")}</Typography>
        </TooltipButton>
      );
    }, [t]);

    return (
      <BasicDialog
        open={open}
        onClose={close}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        dialogAction={dialogAction}
      />
    );
  }
);
