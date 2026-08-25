import { ShortcutsDialog } from "./ShortcutsDialog";
import { SettingsDialog } from "./SettingsDialog";
import { SourcesDialog } from "./SourcesDialog";
import { ExportDialog } from "./ExportDialog";
import { GeneralSetttingDialog } from "./GeneralSetttingDialog";
import { AboutDialog } from "./AboutDialog";
import { GuideDialog } from "./GuideDialog";
import { ProfileDialog } from "./ProfileDialog";
import { useDialogStore } from "../../stores";
import { OpenDialog } from "./OpenDialog";
import React from "react";

/** Renders every editor dialog controlled by GlobalStore. */
export const Dialog = React.memo((): React.JSX.Element => {
  const aboutOpen = useDialogStore((state) => {
    return state.about;
  });
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
  const generalSettingOpen = useDialogStore((state) => {
    return state.generalSetting;
  });
  const guideOpen = useDialogStore((state) => {
    return state.guide;
  });
  const profileOpen = useDialogStore((state) => {
    return state.profile;
  });
  const shortcutsOpen = useDialogStore((state) => {
    return state.shortcuts;
  });

  return (
    <>
      <AboutDialog open={aboutOpen} />

      <GuideDialog open={guideOpen} />

      <GeneralSetttingDialog open={generalSettingOpen} />

      <ProfileDialog open={profileOpen} />

      <OpenDialog open={open} />

      <ExportDialog open={exportOpen} />

      <SourcesDialog open={sourcesOpen} />

      <SettingsDialog open={settingsOpen} />

      <ShortcutsDialog open={shortcutsOpen} />
    </>
  );
});
