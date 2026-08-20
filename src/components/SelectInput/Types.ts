import { MenuItemProps, TextFieldProps } from "@mui/material";
import React from "react";

/** Defines select input option. */
export type SelectInputOption = {
  /** Human-readable title. */
  title?: string;
  /** Current input value. */
  value?: string;

  /** Configuration for menu item prop. */
  menuItemProp?: MenuItemProps;
};

/** Defines select input prop. */
export type SelectInputProp = Omit<TextFieldProps, "onChange"> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Whether shrink. */
  shrink?: boolean;
  /** Options available for selection. */
  options?: SelectInputOption[];

  /** Delay in milliseconds. */
  delay?: number;

  /** max select height in pixels. */
  maxSelectHeight?: number;

  /** Event callback for scroll. */
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  /** Event callback for change. */
  onChange?: (value: string) => void;
  /** Event callback for open. */
  onOpen?: (e: React.SyntheticEvent<HTMLDivElement>) => void;
};
