import { DIALOG_SUB_TEXT, DIALOG_TITLE, TEXT_BUTTON } from "../../configs";
import translation from "../../locales/english/translation.json";
import { TooltipButton } from "../../components/TooltipButton";
import { NewAccordion } from "../../components/NewAccordion";
import { BasicDialog } from "../../components/BasicDialog";
import { CloseTwoTone } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useDialogStore } from "../../stores";
import { Typography } from "@mui/material";
import { GuideDialogProp } from "./Types";
import React from "react";

/** Renders the GuideDialog component. */
export const GuideDialog = React.memo(
  ({ open }: GuideDialogProp): React.JSX.Element => {
    // Multi language
    const { t } = useTranslation();

    const translate = React.useCallback(
      (section: string, field?: string): string => {
        return t(
          field
            ? `dialog.guide.children.${section}.children.${field}.title`
            : `dialog.guide.children.${section}.title`
        );
      },
      [t]
    );

    // Dialog selector
    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const handler = React.useMemo(() => {
      return {
        close: (): void => {
          // Close dialog
          updateDialog({
            guide: undefined,
          });
        },
      };
    }, []);

    const dialogTitle: React.JSX.Element =
      React.useMemo((): React.JSX.Element => {
        return (
          <>
            <Typography sx={DIALOG_TITLE}>{t("dialog.guide.title")}</Typography>

            <TooltipButton
              title={t("common.button.close")}
              onClick={handler.close}
              icon={<CloseTwoTone fontSize={"small"} />}
              color={"error"}
            />
          </>
        );
      }, [t]);

    const dialogContent: React.JSX.Element =
      React.useMemo((): React.JSX.Element => {
        return (
          <>
            {/* Manipulation */}
            <NewAccordion title={translate("manipulation")}>
              <Typography sx={TEXT_BUTTON}>
                {translate("manipulation", "add")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {t("common.guideManipulationAdd")}
              </Typography>

              <Typography sx={TEXT_BUTTON}>
                {translate("manipulation", "edit")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {t("common.guideManipulationEdit")}
              </Typography>

              <Typography sx={TEXT_BUTTON}>
                {translate("manipulation", "group")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {t("common.guideManipulationGroup")}
              </Typography>
            </NewAccordion>

            {/* Save */}
            <NewAccordion title={translate("save")}>
              <Typography sx={TEXT_BUTTON}>{t("common.guideSave")}</Typography>
            </NewAccordion>

            {/* Template */}
            <NewAccordion title={translate("template")}>
              <Typography sx={TEXT_BUTTON}>
                {t("common.guideTemplate")}
              </Typography>
            </NewAccordion>

            {/* Shotcut */}
            <NewAccordion title={translate("shotcut")}>
              <Typography sx={TEXT_BUTTON}>
                {translate("shotcut", "general")}
              </Typography>

              {translation.common.guideShortcutGeneral.map((_, idx) => {
                return (
                  <Typography key={idx} sx={DIALOG_SUB_TEXT}>
                    {t(`common.guideShortcutGeneral.${idx}`)}
                  </Typography>
                );
              })}

              <Typography sx={TEXT_BUTTON}>
                {translate("shotcut", "history")}
              </Typography>

              {translation.common.guideShortcutHistory.map((_, idx) => {
                return (
                  <Typography key={idx} sx={DIALOG_SUB_TEXT}>
                    {t(`common.guideShortcutHistory.${idx}`)}
                  </Typography>
                );
              })}

              <Typography sx={TEXT_BUTTON}>
                {translate("shotcut", "text")}
              </Typography>

              {translation.common.guideShortcutText.map((_, idx) => {
                return (
                  <Typography key={idx} sx={DIALOG_SUB_TEXT}>
                    {t(`common.guideShortcutText.${idx}`)}
                  </Typography>
                );
              })}
            </NewAccordion>
          </>
        );
      }, [t]);

    const dialogAction: React.JSX.Element =
      React.useMemo((): React.JSX.Element => {
        return (
          <TooltipButton
            onClick={handler.close}
            title={t("common.button.close")}
          >
            <Typography sx={TEXT_BUTTON}>{t("common.button.close")}</Typography>
          </TooltipButton>
        );
      }, [t]);

    return (
      <BasicDialog
        maxWidth={"sm"}
        open={open}
        onClose={handler.close}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        dialogAction={dialogAction}
      />
    );
  }
);
