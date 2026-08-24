import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { SourceSpecification } from "maplibre-gl";
import { SOURCE_TYPES } from "../Constants";
import { useGlobalStore } from "../../stores";
import { createUniqueId } from "../Utils";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { TooltipButton } from "../../components/TooltipButton";
import { CODE_TEXTAREA } from "../../configs/styles";
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

    const [source, setSource] = React.useState<SourceSpecification>(
      draft?.source ??
        ({
          type: "vector",
          url: "",
        } as SourceSpecification)
    );

    const [json, setJson] = React.useState(JSON.stringify(source, null, 2));
    const [error, setError] = React.useState<string>();

    const updateType = React.useCallback((type: string): void => {
      let next: SourceSpecification;
      if (type === "geojson") {
        next = {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        };
      } else if (type === "image") {
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
      } else if (type === "video") {
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
          type,
        } as SourceSpecification;
      }
      setSource(next);
      setJson(JSON.stringify(next, null, 2));
    }, []);

    const save = React.useCallback((): void => {
      try {
        const parsed = JSON.parse(json) as SourceSpecification;
        if (!id.trim()) {
          throw new Error(t("dialog.sourceIdRequired"));
        }
        if (id !== draft?.id && sources[id]) {
          throw new Error(t("dialog.sourceExists"));
        }
        upsertSource(id.trim(), parsed, draft?.previousId);
        onClose();
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : t("dialog.invalidSource")
        );
      }
    }, [
      draft?.id,
      draft?.previousId,
      id,
      json,
      onClose,
      sources,
      t,
      upsertSource,
    ]);

    const handler = React.useMemo(() => {
      return {
        idChange: (value: string): void => {
          setId(value);
        },
        jsonChange: (value: string): void => {
          setJson(value);
        },
      };
    }, []);

    const styles = React.useMemo(() => {
      return {
        content: {
          pt: 1,
        },
        textarea: {
          ...CODE_TEXTAREA,
        },
      };
    }, []);

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
              value={source.type}
              options={SOURCE_TYPES.map((type) => {
                return {
                  title: type,
                  value: type,
                };
              })}
              onChange={updateType}
            />

            <TextInput
              value={json}
              onChange={handler.jsonChange}
              multiline
              minRows={12}
              fullWidth
              sx={styles.textarea}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <TooltipButton
            title={t("actions.cancel")}
            variant={"text"}
            onClick={onClose}
          >
            {t("actions.cancel")}
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
