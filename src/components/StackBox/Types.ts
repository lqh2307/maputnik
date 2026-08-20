import { StackProps } from "@mui/material";
import React from "react";

/** Defines stack box prop. */
export type StackBoxProp = StackProps & {
  /** Configuration for display. */
  display?: React.CSSProperties["display"];
};
