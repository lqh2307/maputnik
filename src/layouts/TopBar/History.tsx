import {
  ContentCopyRounded,
  ContentPasteRounded,
  RedoRounded,
  UndoRounded,
} from "@mui/icons-material";
import { useGlobalStore } from "../../stores";
import { ToolbarAction } from "./ToolbarAction";
import { ButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders history actions (Undo, Redo) and layer clipboard actions (Copy, Paste). */
export const TopBarHistory = React.memo((): React.JSX.Element => {
  const { t } = useTranslation("editor");

  const selectedLayerId = useGlobalStore((state) => {
    return state.selectedLayerId;
  });

  const canPaste = useGlobalStore((state) => {
    return !!state.layerClipboard;
  });

  const canUndo = useGlobalStore((state) => {
    return state.history.past.length > 0;
  });

  const canRedo = useGlobalStore((state) => {
    return state.history.future.length > 0;
  });

  const undo = useGlobalStore((state) => {
    return state.undo;
  });

  const redo = useGlobalStore((state) => {
    return state.redo;
  });

  const copyLayer = useGlobalStore((state) => {
    return state.copyLayer;
  });

  const pasteLayer = useGlobalStore((state) => {
    return state.pasteLayer;
  });

  const handler = React.useMemo(() => {
    return {
      undo: (): void => {
        undo();
      },
      redo: (): void => {
        redo();
      },
      copy: (): void => {
        if (selectedLayerId) {
          copyLayer(selectedLayerId);
        }
      },
      paste: (): void => {
        pasteLayer();
      },
    };
  }, [copyLayer, pasteLayer, redo, selectedLayerId, undo]);

  return (
    <ButtonGroup size={"small"} variant="text" color="inherit">
      <ToolbarAction
        title={t("actions.undo")}
        icon={<UndoRounded />}
        onClick={handler.undo}
        disabled={!canUndo}
      />

      <ToolbarAction
        title={t("actions.redo")}
        icon={<RedoRounded />}
        onClick={handler.redo}
        disabled={!canRedo}
      />

      <ToolbarAction
        title={t("actions.copyLayer")}
        icon={<ContentCopyRounded />}
        onClick={handler.copy}
        disabled={!selectedLayerId}
      />

      <ToolbarAction
        title={t("actions.pasteLayer")}
        icon={<ContentPasteRounded />}
        onClick={handler.paste}
        disabled={!canPaste}
      />
    </ButtonGroup>
  );
});
