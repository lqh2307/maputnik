import { TuneRounded } from "@mui/icons-material";
import { useDialogStore } from "../../stores";
import { useTranslation } from "react-i18next";
import { ToolbarAction } from "./ToolbarAction";
import React from "react";

/** Opens the application-wide settings dialog from the top bar. */
export const TopBarGeneralSetting = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();
  const generalSetting = useDialogStore((state) => {
    return state.generalSetting;
  });
  const updateDialog = useDialogStore((state) => {
    return state.updateDialog;
  });

  const open = React.useCallback((): void => {
    updateDialog({
      generalSetting: true,
    });
  }, []);

  return (
    <ToolbarAction
      title={t("topBar.actions.generalSettings")}
      icon={<TuneRounded />}
      active={Boolean(generalSetting)}
      onClick={open}
    />
  );
});
