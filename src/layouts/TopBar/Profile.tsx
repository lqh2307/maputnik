import { AccountCircleRounded } from "@mui/icons-material";
import { useDialogStore } from "../../stores";
import { useTranslation } from "react-i18next";
import { ToolbarAction } from "./ToolbarAction";
import React from "react";

/** Opens the profile dialog from the top bar. */
export const TopBarProfile = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();
  const profile = useDialogStore((state) => {
    return state.profile;
  });
  const updateDialog = useDialogStore((state) => {
    return state.updateDialog;
  });

  const open = React.useCallback((): void => {
    updateDialog({
      profile: true,
    });
  }, []);

  return (
    <ToolbarAction
      title={t("topBar.profile.title")}
      icon={<AccountCircleRounded />}
      active={Boolean(profile)}
      onClick={open}
    />
  );
});
