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
  const { t } = useTranslation();

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

  const translate = React.useCallback(
    (section: string): string => {
      return ["copy", "paste"].includes(section)
        ? t(`common.button.${section}`)
        : t(`topBar.actions.${section}`);
    },
    [t]
  );

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
  }, [selectedLayerId]);

  return (
    <ButtonGroup size={"small"} variant={"text"}>
      <ToolbarAction
        title={translate("undo")}
        icon={<UndoRounded />}
        onClick={handler.undo}
        disabled={!canUndo}
      />

      <ToolbarAction
        title={translate("redo")}
        icon={<RedoRounded />}
        onClick={handler.redo}
        disabled={!canRedo}
      />

      <ToolbarAction
        title={translate("copy")}
        icon={<ContentCopyRounded />}
        onClick={handler.copy}
        disabled={!selectedLayerId}
      />

      <ToolbarAction
        title={translate("paste")}
        icon={<ContentPasteRounded />}
        onClick={handler.paste}
        disabled={!canPaste}
      />
    </ButtonGroup>
  );
});
