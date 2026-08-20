import { StackProps } from "@mui/material";
import React from "react";

/** Defines icon content prop. */
export type IconContentProp = StackProps & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];
};
