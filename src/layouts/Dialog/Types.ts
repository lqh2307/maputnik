import { SourceSpecification } from "maplibre-gl";

/** Defines one style preset exposed in the open-style dialog. */
export type PublicStyle = {
  /** Unique identifier for the public style preset. */
  id: string;
  /** Human-readable title of the style preset. */
  title: string;
  /** Remote URL where the style JSON document is hosted. */
  url: string;
  /** Preview thumbnail image URL. */
  thumbnail: string;
};

/** Defines an editable MapLibre source and its previous identifier. */
export type SourceDraft = {
  /** Previous identifier if this source was renamed during editing. */
  previousId?: string;
  /** Current source identifier. */
  id: string;
  /** MapLibre source configuration specification. */
  source: SourceSpecification;
};

/** Defines SourceEditor component props. */
export type SourceEditorProp = {
  /** Whether the component is open. */
  open?: boolean;
  /** Initial source draft being created or edited. */
  draft?: SourceDraft;
  /** Callback fired when editing is cancelled or completed. */
  onClose: () => void;
};

/** Defines generic dialog visibility props. */
export type EditorDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines OpenDialog component props. */
export type OpenDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines ExportDialog component props. */
export type ExportDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines SettingsDialog component props. */
export type SettingsDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines ShortcutsDialog component props. */
export type ShortcutsDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines SourcesDialog component props. */
export type SourcesDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines GeneralSetttingDialog component props. */
export type GeneralSetttingDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines AboutDialog component props. */
export type AboutDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines GuideDialog component props. */
export type GuideDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};

/** Defines ProfileDialog component props. */
export type ProfileDialogProp = {
  /** Whether the dialog is open. */
  open?: boolean;
};
