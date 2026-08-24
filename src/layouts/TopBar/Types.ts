import React from "react";

/** Defines toolbar action button props. */
export type ToolbarActionProp = {
  /** Tooltip and aria label for the action button. */
  title: string;
  /** Icon element rendered inside the button. */
  icon: React.ReactNode;
  /** Click event handler. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Whether the action button is disabled. */
  disabled?: boolean;
  /** Whether the action button represents an active toggle state. */
  active?: boolean;
  /** Button color scheme. */
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
};

/** Defines TopBar subcomponent props. */
export type TopBarToolsProp = {
  /** Whether the editor is in compact view mode. */
  compact?: boolean;
};

/** Defines TopBar actions subcomponent props. */
export type TopBarActionProp = {
  /** Whether the editor is in compact view mode. */
  compact?: boolean;
};
