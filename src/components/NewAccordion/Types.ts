import React from "react";
import {
  AccordionDetailsProps,
  AccordionSummaryProps,
  AccordionProps,
  SxProps,
  Theme,
} from "@mui/material";

/** Defines new accordion prop. */
export type NewAccordionProp = Omit<AccordionProps, "children"> & {
  /** Human-readable title. */
  title?: React.ReactNode;
  /** Content rendered inside the component. */
  children?: React.ReactNode;

  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Configuration for expand icon. */
  expandIcon?: React.ReactNode;
  /** Configuration for summary. */
  summary?: React.ReactNode;
  /** Action rendered at the end of the default summary. */
  summaryAction?: React.ReactNode;

  /** Configuration for title sx. */
  titleSx?: SxProps<Theme>;
  /** Configuration for summary props. */
  summaryProps?: Omit<AccordionSummaryProps, "children" | "expandIcon">;
  /** Configuration for details props. */
  detailsProps?: AccordionDetailsProps;
};
