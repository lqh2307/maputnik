import { Box, Chip, Stack, Typography } from "@mui/material";
import { validateStyleDocument } from "../Utils";
import { useGlobalStore } from "../../stores";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the editor status bar showing the style name and validation status. */
export const BottomBar = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const style = useGlobalStore((state) => {
    return state.style;
  });

  const issues = React.useMemo(() => {
    return validateStyleDocument(style);
  }, [style]);

  const styleName = style.name?.trim();
  const displayStyleName =
    !styleName || styleName === "Untitled style"
      ? t("common.app.untitled")
      : styleName;

  const styles = React.useMemo(() => {
    return {
      root: {
        width: "100%",
        height: 28,
        minWidth: 0,
        px: 1.5,
        bgcolor: "background.paper",
        color: "text.secondary",
        boxShadow: "0 -2px 8px rgba(15, 23, 42, 0.04)",
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        overflow: "hidden",
      },
      content: {
        width: "100%",
        alignItems: "center",
      },
      issueChip: {
        height: 20,
      },
      spacer: {
        flex: 1,
      },
    };
  }, []);

  return (
    <Box component="footer" sx={styles.root}>
      <Stack direction="row" spacing={1.5} sx={styles.content}>
        <Typography variant={"caption"}>{displayStyleName}</Typography>

        <Chip
          size={"small"}
          color={issues.length ? "warning" : "success"}
          variant={"outlined"}
          label={
            issues.length
              ? t("bottomBar.status.invalid")
              : t("bottomBar.status.valid")
          }
          sx={styles.issueChip}
        />

        <Box sx={styles.spacer} />
      </Stack>
    </Box>
  );
});
