import {
  CheckCircleOutlineRounded,
  ErrorOutlineRounded,
} from "@mui/icons-material";
import { Box, Chip } from "@mui/material";
import { JSONEditor } from "../../components/JSONEditor";
import { JSONValue } from "../../utils/Object";
import { useDialogStore, useGlobalStore } from "../../stores";
import { validateStyleDocument } from "../Utils";
import { StyleSpecification } from "maplibre-gl";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the embedded style JSON editor layout component. */
export const CodeEditor = React.memo((): React.JSX.Element => {
  const { t } = useTranslation("editor");

  const style = useGlobalStore((state) => {
    return state.style;
  });

  const replaceStyle = useGlobalStore((state) => {
    return state.replaceStyle;
  });

  const updateDialog = useDialogStore((state) => {
    return state.updateDialog;
  });

  const issues = React.useMemo(() => {
    return validateStyleDocument(style);
  }, [style]);

  const handler = React.useMemo(() => {
    return {
      close: (): void => {
        updateDialog({
          code: false,
        });
      },
      change: (value: JSONValue): void => {
        if (
          typeof value !== "object" ||
          value === null ||
          Array.isArray(value) ||
          value.version !== 8 ||
          !Array.isArray(value.layers) ||
          !value.sources
        ) {
          return;
        }
        replaceStyle(value as StyleSpecification);
      },
    };
  }, [replaceStyle, updateDialog]);

  const styles = React.useMemo(() => {
    return {
      root: {
        width: "48%",
        minWidth: 420,
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
        overflow: "hidden",
      },
    };
  }, []);

  return (
    <Box component="section" sx={styles.root}>
      <JSONEditor
        embedded
        title={t("code.title")}
        value={style as unknown as JSONValue}
        onClose={handler.close}
        headerExtra={
          <Chip
            size={"small"}
            variant="outlined"
            color={issues.length ? "warning" : "success"}
            icon={
              issues.length ? (
                <ErrorOutlineRounded />
              ) : (
                <CheckCircleOutlineRounded />
              )
            }
            label={
              issues.length
                ? t("status.issues", {
                    count: issues.length,
                  })
                : t("status.valid")
            }
          />
        }
        onChange={handler.change}
      />
    </Box>
  );
});
