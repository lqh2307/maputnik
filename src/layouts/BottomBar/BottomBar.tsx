import { Box, Chip, Stack, Typography } from "@mui/material";
import { validateStyleDocument } from "../Utils";
import { useGlobalStore } from "../../stores";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the editor status bar showing layer count, source count, clipboard state, and coordinates. */
export const BottomBar = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const style = useGlobalStore((state) => {
    return state.style;
  });

  const view = useGlobalStore((state) => {
    return state.viewState;
  });

  const clipboardLayerId = useGlobalStore((state) => {
    return state.layerClipboard?.id;
  });

  const issues = React.useMemo(() => {
    return validateStyleDocument(style);
  }, [style]);

  const styles = React.useMemo(() => {
    return {
      root: {
        height: 28,
        px: 1.5,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.secondary",
        boxShadow: "0 -2px 8px rgba(15, 23, 42, 0.04)",
        display: "flex",
        alignItems: "center",
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
        <Typography variant={"caption"}>
          {t("status.layers", {
            count: style.layers.length,
          })}
        </Typography>

        <Typography variant={"caption"}>
          {t("status.sources", {
            count: Object.keys(style.sources).length,
          })}
        </Typography>

        {clipboardLayerId && (
          <Typography variant={"caption"} color={"text.secondary"}>
            {t("status.clipboard", {
              id: clipboardLayerId,
            })}
          </Typography>
        )}

        <Chip
          size={"small"}
          color={issues.length ? "warning" : "success"}
          variant={"outlined"}
          label={
            issues.length
              ? t("status.issues", {
                  count: issues.length,
                })
              : t("status.valid")
          }
          sx={styles.issueChip}
        />

        <Box sx={styles.spacer} />

        <Typography variant={"caption"} color={"text.secondary"}>
          {view.latitude.toFixed(5)}, {view.longitude.toFixed(5)} · z
          {view.zoom.toFixed(2)}
        </Typography>
      </Stack>
    </Box>
  );
});
