import { TextFieldProps } from "@mui/material";

/** Defines color input prop. */
export type ColorInputProp = Omit<TextFieldProps, "onChange"> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Whether disable underline. */
  disableUnderline?: boolean;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for change. */
  onChange?: (value: string) => void;
};
