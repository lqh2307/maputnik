import {
  AddRounded,
  FileDownloadRounded,
  FileOpenRounded,
} from "@mui/icons-material";
import { useDialogStore, useGlobalStore } from "../../stores";
import { ToolbarAction } from "./ToolbarAction";
import { ButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders file and IO actions: New style, Open style, and Export style. */
export const TopBarIO = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const newStyle = useGlobalStore((state) => {
    return state.newStyle;
  });

  const updateDialog = useDialogStore((state) => {
    return state.updateDialog;
  });

  const handler = React.useMemo(() => {
    return {
      newStyle: (): void => {
        newStyle();
      },
      open: (): void => {
        updateDialog({
          open: true,
        });
      },
      export: (): void => {
        updateDialog({
          export: true,
        });
      },
    };
  }, [newStyle, updateDialog]);

  return (
    <ButtonGroup size={"small"} variant={"text"}>
      <ToolbarAction
        title={t("actions.new")}
        icon={<AddRounded />}
        onClick={handler.newStyle}
      />

      <ToolbarAction
        title={t("actions.open")}
        icon={<FileOpenRounded />}
        onClick={handler.open}
      />

      <ToolbarAction
        title={t("actions.export")}
        icon={<FileDownloadRounded />}
        onClick={handler.export}
      />
    </ButtonGroup>
  );
});
