import { PopperButton } from "../../components/PopperButton";
import { TooltipButton } from "../../components/TooltipButton";
import { TOOLBAR_ICON_BUTTON_STYLE } from "../../configs";
import { useDialogStore } from "../../stores";
import { useTranslation } from "react-i18next";
import {
  HelpOutlineRounded,
  InfoOutlined,
  MenuBookRounded,
} from "@mui/icons-material";
import { Paper, Stack, Typography } from "@mui/material";
import React from "react";

/** Provides access to the user guide and application information. */
export const TopBarHelp = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();
  const updateDialog = useDialogStore((state) => {
    return state.updateDialog;
  });

  const handler = React.useMemo(() => {
    return {
      guide: (): void => {
        updateDialog({
          guide: true,
        });
      },
      about: (): void => {
        updateDialog({
          about: true,
        });
      },
    };
  }, []);

  const menuItemSx = React.useMemo(() => {
    return {
      justifyContent: "flex-start",
      gap: 1,
      px: 1,
      whiteSpace: "nowrap",
      ...TOOLBAR_ICON_BUTTON_STYLE,
      border: 0,
      boxShadow: "none",
      "&&:hover": {
        outline: "none",
        border: 0,
        color: "primary.main",
        bgcolor: "action.hover",
        boxShadow: "none",
        transform: "none",
      },
    };
  }, []);

  return (
    <PopperButton
      title={t("topBar.help.title")}
      icon={<HelpOutlineRounded />}
      closeOnClickAway={true}
      closeOnClickInside={true}
      sx={{
        minWidth: 32,
        width: 32,
        height: 32,
        p: 0,
        ...TOOLBAR_ICON_BUTTON_STYLE,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 0.5,
          minWidth: 150,
        }}
      >
        <Stack spacing={0.5}>
          <TooltipButton
            title={t("topBar.help.children.guide.title")}
            icon={
              <>
                <MenuBookRounded fontSize={"small"} />
                <Typography variant="caption">
                  {t("topBar.help.children.guide.title")}
                </Typography>
              </>
            }
            onClick={handler.guide}
            sx={menuItemSx}
          />

          <TooltipButton
            title={t("topBar.help.children.about.title")}
            icon={
              <>
                <InfoOutlined fontSize={"small"} />
                <Typography variant="caption">
                  {t("topBar.help.children.about.title")}
                </Typography>
              </>
            }
            onClick={handler.about}
            sx={menuItemSx}
          />
        </Stack>
      </Paper>
    </PopperButton>
  );
});
