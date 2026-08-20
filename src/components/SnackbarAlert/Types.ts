import { AlertProps } from "@mui/material";

/** Defines snackbar alert prop. */
export type SnackbarAlertProp = Omit<AlertProps, "onClose"> & {
  /** Whether the component is open. */
  open?: boolean;
  /** Configuration for auto hide duration. */
  autoHideDuration?: number;
  /** Configuration for message. */
  message?: string;
};
