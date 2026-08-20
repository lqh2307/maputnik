import { DialogProps } from "@mui/material";

/** Defines basic dialog prop. */
export type BasicDialogProp = Omit<DialogProps, "onClose"> & {
  /** Configuration for dialog title. */
  dialogTitle?: React.ReactNode;
  /** Configuration for dialog content. */
  dialogContent?: React.ReactNode;
  /** Configuration for dialog action. */
  dialogAction?: React.ReactNode;
  /** Whether backdrop click close. */
  backdropClickClose?: boolean;
  /** Whether escape key down close. */
  escapeKeyDownClose?: boolean;
  /** Event callback for close. */
  onClose?: () => void;
};
