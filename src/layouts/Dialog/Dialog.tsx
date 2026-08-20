import { ShortcutsDialog } from "./ShortcutsDialog";
import { SettingsDialog } from "./SettingsDialog";
import { SourcesDialog } from "./SourcesDialog";
import { ExportDialog } from "./ExportDialog";
import { useDialogStore } from "../../stores";
import { OpenDialog } from "./OpenDialog";
import React from "react";

/** Renders every editor dialog controlled by GlobalStore. */
export const Dialog = React.memo((): React.JSX.Element => {
  const open = useDialogStore((state) => {
    return state.open;
  });
  const exportOpen = useDialogStore((state) => {
    return state.export;
  });
  const sourcesOpen = useDialogStore((state) => {
    return state.sources;
  });
  const settingsOpen = useDialogStore((state) => {
    return state.settings;
  });
  const shortcutsOpen = useDialogStore((state) => {
    return state.shortcuts;
  });

  return (
    <>
      <OpenDialog open={open} />

      <ExportDialog open={exportOpen} />

      <SourcesDialog open={sourcesOpen} />

      <SettingsDialog open={settingsOpen} />

      <ShortcutsDialog open={shortcutsOpen} />
    </>
  );
});
