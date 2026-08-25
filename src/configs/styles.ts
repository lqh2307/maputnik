import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

/** Reusable icon size small sx. */
export const ICON_SMALL: SxProps<Theme> = {
  fontSize: "small",
};

/** Reusable centered item icon container sx. */
export const ITEM_ICON: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Reusable 100% width and height container sx. */
export const FULL_SIZE: CSSProperties = {
  width: "100%",
  height: "100%",
};

/** Centered flex container sx. */
export const FLEX_CENTER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Flex row with vertically centered items sx. */
export const FLEX_ROW_CENTER: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
};

/** Flex column container sx. */
export const FLEX_COLUMN: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

/** Single line text overflow ellipsis sx. */
export const TEXT_ELLIPSIS: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** Monospace font styling for code/JSON textareas sx. */
export const CODE_TEXTAREA: SxProps<Theme> = {
  "& textarea": {
    fontFamily: "monospace",
    fontSize: 12,
  },
};

/** Small text button styling sx. */
export const TEXT_BUTTON: CSSProperties = {
  fontSize: "10px",
};

/** Small secondary dialog text styling. */
export const DIALOG_SUB_TEXT: SxProps<Theme> = {
  fontSize: "10px",
  color: "text.secondary",
};

/** Shared outlined icon-button styling used by the top toolbar and list actions. */
export const TOOLBAR_ICON_BUTTON_STYLE = {
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  bgcolor: "background.paper",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  "&&:hover": {
    outline: "none",
    borderColor: "primary.main",
    color: "primary.main",
    bgcolor: "action.hover",
    boxShadow: "0 3px 8px rgba(15, 23, 42, 0.14)",
    transform: "translateY(-1px)",
  },
  "&.Mui-disabled": {
    opacity: 1,
    borderColor: "divider",
    color: "text.disabled",
    bgcolor: "action.hover",
    boxShadow: "none",
  },
};

/** Dialog title styling sx. */
export const DIALOG_TITLE: SxProps<Theme> = {
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "error.main",
};

/** Dialog content scrolling container sx. */
export const DIALOG_CONTENT: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "100%",
  overflowY: "auto",
  maxHeight: "32rem",
};

/** Auto scrolling container sx. */
export const SCROLL_AUTO: CSSProperties = {
  overflow: "auto",
};
