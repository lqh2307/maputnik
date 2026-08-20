import { TextFieldProps } from "@mui/material";

/** Defines numbers input prop. */
export type NumbersInputProp = Omit<TextFieldProps, "onChange"> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Whether shrink. */
  shrink?: boolean;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for change. */
  onChange?: (values: number[]) => void;
};
