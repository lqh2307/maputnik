import { CodeRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { SourceSpecification } from "maplibre-gl";
import { SOURCE_TYPES } from "../Constants";
import { useGlobalStore } from "../../stores";
import {
  createUniqueId,
  getSourcePropertySpecs,
  normalizeStyleSourceType,
} from "../Utils";
import { SelectInput } from "../../components/SelectInput";
import { JSONEditor } from "../../components/JSONEditor";
import { TextInput } from "../../components/TextInput";
import { TooltipButton } from "../../components/TooltipButton";
import { JSONValue } from "../../utils/Object";
import { SpecObjectEditor } from "../RightBar/SpecObjectEditor";
import { SourceEditorProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders the create or edit source dialog. */
export const SourceEditor = React.memo(
  ({ open = false, draft, onClose }: SourceEditorProp): React.JSX.Element => {
    const { t } = useTranslation();

    const sources = useGlobalStore((state) => {
      return state.style.sources;
    });

    const upsertSource = useGlobalStore((state) => {
      return state.upsertSource;
    });

    const [id, setId] = React.useState(
      draft?.id ?? createUniqueId("source", Object.keys(sources))
    );

    const [source, setSource] = React.useState<SourceSpecification>(() => {
      const initial =
        draft?.source ??
        ({
          type: "vector",
          url: "",
        } as SourceSpecification);
      const type = normalizeStyleSourceType(String(initial.type));

      return type === initial.type
        ? initial
        : ({
            ...initial,
            type,
          } as SourceSpecification);
    });

    const [error, setError] = React.useState<string>();
    const [advanced, setAdvanced] = React.useState(false);

    const updateType = React.useCallback((type: string): void => {
      const canonicalType = normalizeStyleSourceType(type);
      let next: SourceSpecification;
      if (canonicalType === "geojson") {
        next = {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        };
      } else if (canonicalType === "image") {
        next = {
          type: "image",
          url: "",
          coordinates: [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
          ],
        };
      } else if (canonicalType === "video") {
        next = {
          type: "video",
          urls: [],
          coordinates: [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
          ],
        };
      } else {
        next = {
          type: canonicalType,
        } as SourceSpecification;
      }
      setSource(next);
      setError(undefined);
    }, []);

    const updateProperty = React.useCallback(
      (name: string, value: unknown): void => {
        setSource((current) => {
          const next = {
            ...(current as Record<string, unknown>),
          };

          if (value === undefined) {
            delete next[name];
          } else {
            next[name] = value;
          }

          return next as SourceSpecification;
        });
      },
      []
    );

    const save = React.useCallback((): void => {
      try {
        const sourceId = id.trim();
        if (!sourceId) {
          throw new Error(t("dialog.sourceIdRequired"));
        }
        if (sourceId !== draft?.id && sources[sourceId]) {
          throw new Error(t("dialog.sourceExists"));
        }
        if (!source.type) {
          throw new Error(t("dialog.invalidSource"));
        }
        upsertSource(
          sourceId,
          {
            ...source,
            type: normalizeStyleSourceType(
              String(source.type)
            ) as SourceSpecification["type"],
          } as SourceSpecification,
          draft?.previousId
        );
        onClose();
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : t("dialog.invalidSource")
        );
      }
    }, [draft?.id, draft?.previousId, id, onClose, source, sources, t]);

    const handler = React.useMemo(() => {
      return {
        idChange: (value: string): void => {
          setId(value);
        },
        advancedToggle: (): void => {
          setAdvanced((value) => {
            return !value;
          });
        },
        jsonChange: (value: JSONValue): void => {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            const next = {
              ...(value as Record<string, JSONValue>),
            };
            if (typeof next.type !== "string") {
              next.type = source.type;
            }
            setSource(next as SourceSpecification);
          }
        },
      };
    }, [source.type]);

    const styles = React.useMemo(() => {
      return {
        content: {
          pt: 1,
        },
        editor: {
          height: 360,
          minHeight: 300,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
        },
      };
    }, []);

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          {draft ? t("dialog.sourceEdit") : t("dialog.sourceAdd")}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={styles.content}>
            {error && <Alert severity={"error"}>{error}</Alert>}

            <TextInput
              label={t("dialog.sourceId")}
              value={id}
              onChange={handler.idChange}
              multiline={false}
              size={"small"}
              fullWidth
            />

            <SelectInput
              label={t("dialog.sourceType")}
              value={normalizeStyleSourceType(String(source.type))}
              options={SOURCE_TYPES.map((type) => {
                return {
                  title: t(`common.sourceType.${type}`),
                  value: type,
                };
              })}
              onChange={updateType}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <TooltipButton
                title={t("dialog.advanced")}
                icon={<CodeRounded fontSize={"small"} />}
                color={advanced ? "primary" : "inherit"}
                fullWidth={false}
                onClick={handler.advancedToggle}
              />
            </Box>

            {advanced ? (
              <Box sx={styles.editor}>
                <JSONEditor
                  embedded
                  compact
                  value={source as unknown as JSONValue}
                  onChange={handler.jsonChange}
                />
              </Box>
            ) : (
              <SpecObjectEditor
                value={source as Record<string, unknown>}
                specs={getSourcePropertySpecs(
                  normalizeStyleSourceType(String(source.type))
                )}
                exclude={["type"]}
                onChange={updateProperty}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <TooltipButton
            title={t("topBar.actions.cancel")}
            variant={"text"}
            onClick={onClose}
          >
            {t("topBar.actions.cancel")}
          </TooltipButton>

          <TooltipButton
            title={t("dialog.saveSource")}
            variant={"contained"}
            onClick={save}
          >
            {t("dialog.saveSource")}
          </TooltipButton>
        </DialogActions>
      </Dialog>
    );
  }
);
