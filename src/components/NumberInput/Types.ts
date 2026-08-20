import { TextFieldProps } from "@mui/material";

/** Defines number input prop. */
export type NumberInputProp = Omit<TextFieldProps, "onChange"> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Configuration for min. */
  min?: number;
  /** Configuration for max. */
  max?: number;
  /** Configuration for step. */
  step?: number;

  /** Whether shrink. */
  shrink?: boolean;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for change. */
  onChange?: (value: number) => void;
};
