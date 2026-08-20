import { AppTheme } from "../../components/AppTheme";
import { CodeEditor } from "../CodeEditor";
import { BottomBar } from "../BottomBar";
import { RightBar } from "../RightBar";
import { LeftBar } from "../LeftBar";
import { Canvas } from "../Canvas";
import { Box } from "@mui/material";
import { Dialog } from "../Dialog";
import { TopBar } from "../TopBar";
import React from "react";
import {
  useMapModeStore,
  useDialogStore,
  useGlobalStore,
  useThemeStore,
} from "../../stores";

/** Renders the complete Maputnik editing workspace layout. */
export const Editor = React.memo((): React.JSX.Element => {
  const themeMode = useThemeStore((state) => {
    return state.themeMode;
  });

  const code = useDialogStore((state) => {
    return state.code;
  });

  const handler = React.useMemo(() => {
    return {
      keyDown: (event: KeyboardEvent): void => {
        const state = useGlobalStore.getState();
        const mapModeState = useMapModeStore.getState();
        const dialogState = useDialogStore.getState();
        const modifier = event.ctrlKey || event.metaKey;
        const target = event.target as HTMLElement;
        const isEditing =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        const key = event.key.toLowerCase();
        const dialogOpen = Object.values(dialogState).some((value) => {
          return value === true;
        });
        const workspaceActive = !dialogOpen;

        if (!isEditing && modifier && key === "z") {
          event.preventDefault();
          event.shiftKey ? state.redo() : state.undo();
        } else if (!isEditing && modifier && key === "y") {
          event.preventDefault();
          state.redo();
        } else if (modifier && key === "o") {
          event.preventDefault();
          dialogState.updateDialog({
            open: true,
          });
        } else if (modifier && key === "s") {
          event.preventDefault();
          dialogState.updateDialog({
            export: true,
          });
        } else if (modifier && key === "e") {
          event.preventDefault();
          dialogState.updateDialog({
            code: !dialogState.code,
          });
        } else if (
          workspaceActive &&
          !isEditing &&
          modifier &&
          key === "c" &&
          state.selectedLayerId
        ) {
          event.preventDefault();
          state.copyLayer(state.selectedLayerId);
        } else if (workspaceActive && !isEditing && modifier && key === "v") {
          event.preventDefault();
          state.pasteLayer();
        } else if (
          workspaceActive &&
          !isEditing &&
          modifier &&
          key === "d" &&
          state.selectedLayerId
        ) {
          event.preventDefault();
          state.duplicateLayer(state.selectedLayerId);
        } else if (event.key === "Escape" && dialogState.code === true) {
          dialogState.updateDialog({
            code: false,
          });
        } else if (
          workspaceActive &&
          !isEditing &&
          event.key === "Delete" &&
          state.selectedLayerId
        ) {
          state.deleteLayer(state.selectedLayerId);
        } else if (workspaceActive && !isEditing && key === "i") {
          mapModeState.setMapMode(
            mapModeState.mapMode === "inspect" ? "map" : "inspect"
          );
        } else if (!isEditing && event.key === "?") {
          dialogState.updateDialog({
            shortcuts: true,
          });
        }
      },
    };
  }, []);

  const styles = React.useMemo(() => {
    return {
      root: {
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "52px minmax(0, 1fr) 28px",
      },
      main: {
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
      },
      canvas: {
        minWidth: 0,
        height: "100%",
        flex: 1,
        position: "relative",
      },
    };
  }, []);

  React.useEffect(() => {
    window.addEventListener("keydown", handler.keyDown);

    return () => {
      return window.removeEventListener("keydown", handler.keyDown);
    };
  }, [handler.keyDown]);

  return (
    <AppTheme theme={themeMode}>
      <Box sx={styles.root}>
        <TopBar />

        <Box component="main" sx={styles.main}>
          {code ? <CodeEditor /> : <LeftBar />}

          <Box sx={styles.canvas}>
            <Canvas />
          </Box>

          {!code && <RightBar />}
        </Box>

        <BottomBar />

        <Dialog />
      </Box>
    </AppTheme>
  );
});
