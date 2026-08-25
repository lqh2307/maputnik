import { useDialogStore, useGlobalStore } from "../../stores";
import { ToolbarAction } from "./ToolbarAction";
import { useTranslation } from "react-i18next";
import { ButtonGroup } from "@mui/material";
import React from "react";
import {
  FileDownloadRounded,
  FileOpenRounded,
  AddRounded,
} from "@mui/icons-material";

/** Renders file and IO actions: New style, Open style, and Export style. */
export const TopBarIO = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const newStyle = useGlobalStore((state) => {
    return state.newStyle;
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
  }, []);

  return (
    <ButtonGroup size={"small"} variant={"text"}>
      <ToolbarAction
        title={translate("new")}
        icon={<AddRounded />}
        onClick={handler.newStyle}
      />

      <ToolbarAction
        title={translate("open")}
        icon={<FileOpenRounded />}
        onClick={handler.open}
      />

      <ToolbarAction
        title={translate("export")}
        icon={<FileDownloadRounded />}
        onClick={handler.export}
      />
    </ButtonGroup>
  );
});
