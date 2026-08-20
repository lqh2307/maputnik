import { AutocompleteProps } from "@mui/material";

/** Defines free solo input option. */
export type FreeSoloInputOption = {
  /** Human-readable title. */
  title?: string;
  /** Current input value. */
  value?: string;
};

/** Defines free solo input prop. */
export type FreeSoloInputProp = Omit<
  AutocompleteProps<FreeSoloInputOption, false, false, true>,
  "onChange" | "renderInput" | "value"
> & {
  /** Human-readable title. */
  title?: string;
  /** Icon rendered with the component. */
  icon?: React.ReactNode;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];
  /** Human-readable name. */
  name?: string;
  /** Text label displayed to the user. */
  label?: string;
  /** Whether shrink. */
  shrink?: boolean;
  /** Variant or category. */
  type?: React.InputHTMLAttributes<unknown>["type"];
  /** Configuration for min. */
  min?: number;
  /** Configuration for max. */
  max?: number;
  /** Configuration for step. */
  step?: number;

  /** Current input value. */
  value?: unknown;

  /** Options available for selection. */
  options: FreeSoloInputOption[];
  /** Delay in milliseconds. */
  delay?: number;
  /** Configuration for delay select. */
  delaySelect?: number;
  /** Event callback for change. */
  onChange?: (value: string, bySelect: boolean) => void;
};
