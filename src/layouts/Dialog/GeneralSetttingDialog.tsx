import { SelectInput, SelectInputOption } from "../../components/SelectInput";
import { TooltipButton } from "../../components/TooltipButton";
import { BasicDialog } from "../../components/BasicDialog";
import { ThemeMode } from "../../components/AppTheme";
import { GeneralSetttingDialogProp } from "./Types";
import translation from "../../locales/english/translation.json";
import { DIALOG_CONTENT, DIALOG_TITLE, TEXT_BUTTON } from "../../configs";
import { useDialogStore, useLanguageStore, useThemeStore } from "../../stores";
import { CloseTwoTone } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { Language } from "../../types/Language";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders application-wide preferences that are independent of the active style. */
export const GeneralSetttingDialog = React.memo(
  ({ open }: GeneralSetttingDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const language = useLanguageStore((state) => {
      return state.language;
    });
    const setLanguage = useLanguageStore((state) => {
      return state.setLanguage;
    });
    const themeMode = useThemeStore((state) => {
      return state.themeMode;
    });
    const setTheme = useThemeStore((state) => {
      return state.setTheme;
    });
    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const options = React.useMemo(() => {
      const themeOptions: SelectInputOption[] = Object.keys(
        translation.common.themeMode
      ).map((value) => {
        return {
          value,
          title: t(`common.themeMode.${value}`),
        };
      });
      const languageOptions: SelectInputOption[] = Object.keys(
        translation.common.language
      ).map((value) => {
        return {
          value,
          title: t(`common.language.${value}`),
        };
      });

      return {
        theme: themeOptions,
        language: languageOptions,
      };
    }, [t]);

    const handler = React.useMemo(() => {
      return {
        changeTheme: (value: string): void => {
          setTheme(value as ThemeMode);
        },
        changeLanguage: (value: string): void => {
          setLanguage(value as Language);
        },
        close: (): void => {
          updateDialog({
            generalSetting: undefined,
          });
        },
      };
    }, []);

    const dialogTitle = React.useMemo(() => {
      return (
        <>
          <Typography sx={DIALOG_TITLE}>
            {t("dialog.generalSetting.title")}
          </Typography>

          <TooltipButton
            title={t("common.button.close")}
            onClick={handler.close}
            icon={<CloseTwoTone fontSize={"small"} />}
            color={"error"}
          />
        </>
      );
    }, [t]);

    const dialogContent = React.useMemo(() => {
      return (
        <Stack sx={DIALOG_CONTENT}>
          <SelectInput
            title={t("dialog.generalSetting.children.theme.title")}
            label={t("dialog.generalSetting.children.theme.title")}
            value={themeMode}
            options={options.theme}
            onChange={handler.changeTheme}
          />

          <SelectInput
            title={t("dialog.generalSetting.children.language.title")}
            label={t("dialog.generalSetting.children.language.title")}
            value={language}
            options={options.language}
            onChange={handler.changeLanguage}
          />
        </Stack>
      );
    }, [language, options, t, themeMode]);

    const dialogAction = React.useMemo(() => {
      return (
        <TooltipButton onClick={handler.close} title={t("common.button.close")}>
          <Typography sx={TEXT_BUTTON}>{t("common.button.close")}</Typography>
        </TooltipButton>
      );
    }, [t]);

    return (
      <BasicDialog
        open={open}
        onClose={handler.close}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        dialogAction={dialogAction}
      />
    );
  }
);
