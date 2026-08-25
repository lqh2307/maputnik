import { DIALOG_SUB_TEXT, DIALOG_TITLE, TEXT_BUTTON } from "../../configs";
import { TooltipButton } from "../../components/TooltipButton";
import { NewAccordion } from "../../components/NewAccordion";
import { BasicDialog } from "../../components/BasicDialog";
import { CloseTwoTone } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useDialogStore } from "../../stores";
import { Typography } from "@mui/material";
import { AboutDialogProp } from "./Types";
import React from "react";

/** Renders the AboutDialog component. */
export const AboutDialog = React.memo(
  ({ open }: AboutDialogProp): React.JSX.Element => {
    // Multi language
    const { t } = useTranslation();

    const translate = React.useCallback(
      (section: string, field?: string): string => {
        return t(
          field
            ? `dialog.about.children.${section}.children.${field}.title`
            : `dialog.about.children.${section}.title`
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
            about: undefined,
          });
        },
      };
    }, []);

    const dialogTitle: React.JSX.Element =
      React.useMemo((): React.JSX.Element => {
        return (
          <>
            <Typography sx={DIALOG_TITLE}>{t("dialog.about.title")}</Typography>

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
            {/* Introdution */}
            <NewAccordion
              defaultExpanded={true}
              title={translate("introdution")}
            >
              <Typography sx={TEXT_BUTTON}>
                {t("common.aboutIntroduction")}
              </Typography>
            </NewAccordion>

            {/* Version */}
            <NewAccordion title={translate("version")}>
              <Typography sx={TEXT_BUTTON}>
                {t("common.aboutVersion")}
              </Typography>
            </NewAccordion>

            {/* Feature */}
            <NewAccordion title={translate("feature")}>
              <Typography sx={TEXT_BUTTON}>
                {translate("feature", "object")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "object.children.basic")}: ${t("common.aboutFeatureObjectBasic")}`}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "object.children.text")}: ${t("common.aboutFeatureObjectText")}`}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "object.children.image")}: ${t("common.aboutFeatureObjectImage")}`}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "object.children.icon")}: ${t("common.aboutFeatureObjectIcon")}`}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "object.children.video")}: ${t("common.aboutFeatureObjectVideo")}`}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "object.children.freeDrawing")}: ${t("common.aboutFeatureObjectFreeDrawing")}`}
              </Typography>

              <Typography sx={TEXT_BUTTON}>
                {translate("feature", "manipulation")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "manipulation.children.add")}: ${t("common.aboutFeatureManipulationAdd")}`}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "manipulation.children.edit")}: ${t("common.aboutFeatureManipulationEdit")}`}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("feature", "manipulation.children.group")}: ${t("common.aboutFeatureManipulationGroup")}`}
              </Typography>

              <Typography sx={TEXT_BUTTON}>
                {translate("feature", "template")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {t("common.aboutFeatureTemplate")}
              </Typography>

              <Typography sx={TEXT_BUTTON}>
                {translate("feature", "io")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {t("common.aboutFeatureIO")}
              </Typography>

              <Typography sx={TEXT_BUTTON}>
                {translate("feature", "shotcut")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {t("common.aboutFeatureShortcut")}
              </Typography>

              <Typography sx={TEXT_BUTTON}>
                {translate("feature", "history")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {t("common.aboutFeatureHistory")}
              </Typography>

              <Typography sx={TEXT_BUTTON}>
                {translate("feature", "other")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {t("common.aboutFeatureOther")}
              </Typography>
            </NewAccordion>

            {/* Coming Soon Feature */}
            <NewAccordion title={translate("comingSoonFeature")}>
              <Typography sx={TEXT_BUTTON}>
                {translate("comingSoonFeature", "improve")}
              </Typography>

              <Typography sx={DIALOG_SUB_TEXT}>
                {`${translate("comingSoonFeature", "improve")}: ${t("common.aboutComingSoonImprove")}`}
              </Typography>
            </NewAccordion>

            {/* License */}
            <NewAccordion title={translate("license")}>
              <Typography sx={TEXT_BUTTON}>
                {t("common.aboutLicense")}
              </Typography>
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
