import {
  AddCircleOutlineRounded,
  CloudDownloadRounded,
  FileOpenRounded,
  LinkRounded,
  StorageRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tabs,
  Typography,
} from "@mui/material";
import { StyleSpecification } from "maplibre-gl";
import { DEFAULT_STYLE } from "../Constants";
import { useDialogStore, useGlobalStore } from "../../stores";
import {
  resolveStyleResourceUrls,
  cloneStyle,
  replacePresetUrlAccessToken,
  replaceStyleAccessTokens,
} from "../Utils";
import { TextInput } from "../../components/TextInput";
import { ImportFileButton } from "../../components/ImportFileButton";
import { TooltipButton } from "../../components/TooltipButton";
import { TooltipTab } from "../../components/TooltipTab";
import publicStyleData from "../../configs/styles.json";
import { useTranslation } from "react-i18next";
import { OpenDialogProp, PublicStyle } from "./Types";
import React from "react";

const publicStyles: PublicStyle[] = publicStyleData as PublicStyle[];

/** Renders the local and public style picker dialog. */
export const OpenDialog = React.memo(
  ({ open = false }: OpenDialogProp): React.JSX.Element => {
    const { t } = useTranslation();

    const updateDialog = useDialogStore((state) => {
      return state.updateDialog;
    });

    const loadStyle = useGlobalStore((state) => {
      return state.loadStyle;
    });

    const [tab, setTab] = React.useState("file");
    const [url, setUrl] = React.useState("");
    const [error, setError] = React.useState<string>();
    const [loading, setLoading] = React.useState(false);
    const [activePreset, setActivePreset] = React.useState<string>();

    const acceptStyle = React.useCallback(
      (value: unknown): void => {
        const style = value as StyleSpecification;
        if (
          !style ||
          style.version !== 8 ||
          !Array.isArray(style.layers) ||
          !style.sources
        ) {
          throw new Error(t("dialog.invalidStyle"));
        }
        loadStyle(replaceStyleAccessTokens(style));
        updateDialog({
          open: false,
        });
      },
      [loadStyle, t, updateDialog]
    );

    const readFile = React.useCallback(
      async (file?: File): Promise<void> => {
        if (!file) {
          return;
        }
        try {
          acceptStyle(JSON.parse(await file.text()));
          setError(undefined);
        } catch (reason) {
          setError(
            reason instanceof Error ? reason.message : t("dialog.openError")
          );
        }
      },
      [acceptStyle, t]
    );

    const loadUrl = React.useCallback(
      async (styleUrl: string, presetId?: string): Promise<void> => {
        try {
          setLoading(true);
          setActivePreset(presetId);
          setError(undefined);
          const resolvedStyleUrl = replacePresetUrlAccessToken(styleUrl);
          const response = await fetch(resolvedStyleUrl, {
            mode: "cors",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
          }
          const style = resolveStyleResourceUrls(
            await response.json(),
            resolvedStyleUrl
          );
          acceptStyle(style);
        } catch (reason) {
          setError(
            reason instanceof Error ? reason.message : t("dialog.loadError")
          );
        } finally {
          setLoading(false);
          setActivePreset(undefined);
        }
      },
      [acceptStyle, t]
    );

    const close = React.useCallback((): void => {
      updateDialog({
        open: false,
      });
    }, [updateDialog]);

    const handler = React.useMemo(() => {
      return {
        tabChange: (_: React.SyntheticEvent, value: string): void => {
          setTab(value);
        },
        fileChange: (file: File): void => {
          void readFile(file);
        },
        urlChange: (value: string): void => {
          setUrl(value);
        },
        loadUrlClick: (): void => {
          void loadUrl(url);
        },
        starterClick: (): void => {
          acceptStyle(cloneStyle(DEFAULT_STYLE));
        },
        presetClick: (preset: PublicStyle) => {
          return (): void => {
            void loadUrl(preset.url, preset.id);
          };
        },
      };
    }, [acceptStyle, loadUrl, readFile, url]);

    const styles = React.useMemo(() => {
      return {
        tabs: {
          mb: 2,
        },
        error: {
          mb: 2,
        },
        choose: {
          py: 4,
        },
        grid: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: 1.5,
          maxHeight: "62vh",
          overflow: "auto",
          p: 0.25,
        },
        cardAction: {
          height: "100%",
        },
        preview: {
          height: 116,
          display: "grid",
          placeItems: "center",
          bgcolor: "action.hover",
          backgroundImage:
            "linear-gradient(135deg, rgba(23,105,170,.18), rgba(23,105,170,.04))",
        },
        starterIcon: {
          fontSize: 42,
        },
        cardContent: {
          py: 1.25,
        },
        row: {
          alignItems: "center",
        },
        grow: {
          flex: 1,
          minWidth: 0,
        },
        presetAction: {
          height: "100%",
          position: "relative",
        },
        thumbnail: {
          width: "100%",
          height: 116,
          display: "block",
          objectFit: "cover",
          bgcolor: "action.hover",
        },
        presetTitle: {
          flex: 1,
        },
      };
    }, []);

    return (
      <Dialog open={open} onClose={close} fullWidth maxWidth="lg">
        <DialogTitle>{t("dialog.openTitle")}</DialogTitle>

        <DialogContent>
          <Tabs value={tab} onChange={handler.tabChange} sx={styles.tabs}>
            <TooltipTab
              title={t("dialog.localFile")}
              value="file"
              label={t("dialog.localFile")}
            />
            <TooltipTab
              title={t("dialog.url")}
              value="url"
              label={t("dialog.url")}
            />
            <TooltipTab
              title={t("dialog.styles", {
                count: publicStyles.length + 1,
              })}
              value="styles"
              label={t("dialog.styles", {
                count: publicStyles.length + 1,
              })}
            />
          </Tabs>

          {error && (
            <Alert severity={"error"} sx={styles.error}>
              {error}
            </Alert>
          )}

          {tab === "file" && (
            <ImportFileButton
              title={t("dialog.chooseFile")}
              icon={<FileOpenRounded />}
              fullWidth
              sx={styles.choose}
              acceptMimeType="application/json,.json"
              onFileLoaded={handler.fileChange}
            >
              {t("dialog.chooseFile")}
            </ImportFileButton>
          )}

          {tab === "url" && (
            <Stack direction="row" spacing={1}>
              <TextInput
                value={url}
                onChange={handler.urlChange}
                label={t("dialog.styleUrl")}
                fullWidth
                multiline={false}
                size={"small"}
              />
              <TooltipButton
                title={t("actions.load")}
                variant={"contained"}
                startIcon={<LinkRounded />}
                onClick={handler.loadUrlClick}
                disabled={!url || loading}
              >
                {t("actions.load")}
              </TooltipButton>
            </Stack>
          )}

          {tab === "styles" && (
            <Box sx={styles.grid}>
              <Card variant={"outlined"}>
                <CardActionArea
                  onClick={handler.starterClick}
                  sx={styles.cardAction}
                >
                  <Box sx={styles.preview}>
                    <StorageRounded sx={styles.starterIcon} />
                  </Box>
                  <CardContent sx={styles.cardContent}>
                    <Stack direction="row" spacing={1} sx={styles.row}>
                      <Box sx={styles.grow}>
                        <Typography variant={"subtitle2"} noWrap>
                          {t("dialog.starter")}
                        </Typography>
                        <Typography
                          variant={"caption"}
                          color={"text.secondary"}
                        >
                          {t("dialog.localStarter")}
                        </Typography>
                      </Box>
                      <AddCircleOutlineRounded />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>

              {publicStyles.map((preset) => {
                return (
                  <Card key={preset.id} variant={"outlined"}>
                    <CardActionArea
                      disabled={loading}
                      onClick={handler.presetClick(preset)}
                      sx={styles.presetAction}
                    >
                      <Box
                        component="img"
                        src={preset.thumbnail}
                        alt=""
                        loading="lazy"
                        sx={styles.thumbnail}
                      />
                      <CardContent sx={styles.cardContent}>
                        <Stack direction="row" spacing={1} sx={styles.row}>
                          <Typography
                            variant={"subtitle2"}
                            noWrap
                            sx={styles.presetTitle}
                          >
                            {preset.title}
                          </Typography>
                          {activePreset === preset.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <CloudDownloadRounded fontSize={"small"} />
                          )}
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <TooltipButton
            title={t("actions.close")}
            variant={"text"}
            onClick={close}
          >
            {t("actions.close")}
          </TooltipButton>
        </DialogActions>
      </Dialog>
    );
  }
);
