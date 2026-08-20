import { SxProps, Theme } from "@mui/material";
import { JSONValue } from "../../utils/Object";
import React from "react";

export type JSONEditorErrorContext =
  | "source"
  | "node"
  | "import"
  | "download"
  | "format"
  | "minify"
  | "sort"
  | "copy";

export type JSONEditorProps = {
  /** Controlled JSON value. */
  value?: JSONValue;
  /** Called whenever the JSON value changes. */
  onChange?: (value: JSONValue) => void;
  /** Called when parsing, importing, or copying fails. */
  onError?: (error: Error, context: JSONEditorErrorContext) => void;
  /** Called after a JSON file is imported successfully. */
  onImport?: (value: JSONValue, file: File) => void;
  /** Called after a JSON download is started. */
  onDownload?: (value: JSONValue, fileName: string) => void;
  /** Called after a clipboard write attempt. */
  onCopy?: (succeeded: boolean, source: string) => void;
  /** Called when the close button is pressed. */
  onClose?: () => void;
  /** Header title. */
  title?: string;
  /** Additional content rendered before the header actions. */
  headerExtra?: React.ReactNode;
  /** Fills the parent instead of the viewport when true. */
  embedded?: boolean;
  /** Opens the JSON editor with the source pane collapsed by default. */
  defaultSourceCollapsed?: boolean;
  /** Opens the JSON editor with the tree pane collapsed by default. */
  defaultTreeCollapsed?: boolean;
  /** Compact view optimized for small inputs, inspector fields, and inline editors. */
  compact?: boolean;
  /** Whether to force hide the top header bar. */
  hideHeader?: boolean;
  /** Whether to hide the bottom status bar. */
  hideStatus?: boolean;
  /** Custom MUI sx styling overrides. */
  sx?: SxProps<Theme>;
};
