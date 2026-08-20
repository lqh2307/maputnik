import { TextFieldProps } from "@mui/material";

/** Defines text input prop. */
export type TextInputProp = Omit<TextFieldProps, "onChange"> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Configuration for min length. */
  minLength?: number;
  /** Configuration for max length. */
  maxLength?: number;

  /** Whether shrink. */
  shrink?: boolean;

  /** Delay in milliseconds. */
  delay?: number;
  /** Event callback for change. */
  onChange?: (value: string) => void;
};
