import { CloseRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { closeWindow } from "../../utils/Window";
import { ToolbarAction } from "./ToolbarAction";
import React from "react";

/** Closes the editor window or returns to the previous page when possible. */
export const TopBarClose = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const close = React.useCallback((): void => {
    closeWindow();
  }, []);

  return (
    <ToolbarAction
      title={t("common.button.close")}
      icon={<CloseRounded />}
      color="error"
      onClick={close}
    />
  );
});
