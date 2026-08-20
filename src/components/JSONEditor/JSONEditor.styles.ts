import { isArray, JSONValue } from "../../utils/Object";
import { WHITE_COLOR } from "../../configs";
import { getJSONValueColor } from "./Utils";
import { max } from "../../utils/Number";

export const DEFAULT_SOURCE_PANE_WIDTH_PX = 360;
export const MIN_SOURCE_PANE_WIDTH_PX = 200;
export const MIN_TREE_PANE_WIDTH_PX = 200;
export const SPLITTER_WIDTH_PX = 8;

const MONOSPACE_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const NODE_INDENT_REM = 1.125;

const sharedEditorInput = {
  "& .MuiInputBase-root": {
    fontFamily: MONOSPACE_FONT,
    fontSize: "0.8125rem",
  },
  "& .MuiInputBase-input": {
    px: 0.5,
    py: 0.25,
  },
  "& fieldset": {
    borderColor: "transparent",
  },
  "&:hover fieldset": {
    borderColor: "#cbd5e1 !important",
  },
};

const sharedNodeActionButton = {
  width: 22,
  height: 22,
  minWidth: 22,
  p: 0,
  border: 0,
  bgcolor: WHITE_COLOR,
  color: "#475569",
  borderRadius: 0.75,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  "&:hover": {
    bgcolor: "#f1f5f9",
    color: "#0f172a",
  },
};

type JSONTreeRowStyleOptions = {
  canExpand: boolean;
  name?: string;
  pathDepth: number;
  value: JSONValue;
};

export const createJSONTreeRowStyles = ({
  canExpand,
  name,
  pathDepth,
  value,
}: JSONTreeRowStyleOptions) => {
  return {
    row: {
      display: "grid",
      gridTemplateColumns: canExpand
        ? "1.25rem minmax(0, 1fr) auto"
        : "minmax(0, 1fr) auto",
      alignItems: "center",
      gap: 0.5,
      minHeight: "1.875rem",
      pl: `${pathDepth * NODE_INDENT_REM + (canExpand ? 0.375 : 1.625)}rem`,
      pr: 0.75,
      fontFamily: MONOSPACE_FONT,
      fontSize: "0.8125rem",
      borderRadius: 1,
      border: "1px solid transparent",
      transition: "background-color 100ms ease, border-color 100ms ease",
      "&:hover": {
        bgcolor: "#f0f7ff",
        borderColor: "#bae0ff",
      },
      "&:hover .json-node-actions, &:focus-within .json-node-actions": {
        opacity: 1,
      },
      "@media (hover: none)": {
        "& .json-node-actions": {
          opacity: 1,
        },
      },
    },
    caretButton: {
      width: 20,
      height: 20,
      minWidth: 20,
      color: "#64748b",
      border: 0,
      bgcolor: "transparent",
      p: 0,
      "&:hover": {
        color: "#0f172a",
      },
    },
    content: {
      alignItems: "center",
      minWidth: 0,
    },
    nameInput: {
      ...sharedEditorInput,
      width: `${maxNameLength(name) + 2}ch`,
      maxWidth: "18rem",
      "& .MuiInputBase-input": {
        color: "#0969da",
        fontWeight: 600,
        px: 0.5,
        py: 0.25,
      },
    },
    separator: {
      color: "#8c959f",
      fontFamily: "inherit",
    },
    containerToken: {
      color: isArray(value) ? "#0550ae" : "#6639ba",
      fontFamily: "inherit",
      fontWeight: 700,
    },
    containerLabel: {
      color: "#64748b",
      fontFamily: "inherit",
      fontSize: "0.75rem",
    },
    valueInput: {
      ...sharedEditorInput,
      flex: 1,
      minWidth: "6rem",
      "& .MuiInputBase-input": {
        color: getJSONValueColor(value),
        px: 0.5,
        py: 0.25,
      },
    },
    actions: {
      width: "auto",
      flexShrink: 0,
      gap: 0.25,
      justifyContent: "flex-end",
      opacity: 0,
      transition: "opacity 100ms ease",
    },
    actionButton: sharedNodeActionButton,
    deleteButton: sharedNodeActionButton,
    actionIcon: {
      fontSize: "0.875rem",
    },
    editBox: {
      pl: `${(pathDepth + 1) * NODE_INDENT_REM + 0.5}rem`,
      pr: 1,
      py: 0.75,
      bgcolor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: 1,
      my: 0.5,
      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    },
    editInput: {
      maxHeight: "none",
      "& textarea": {
        fontFamily: MONOSPACE_FONT,
        fontSize: "0.75rem",
        lineHeight: 1.45,
      },
    },
    editActions: {
      justifyContent: "flex-end",
      mt: 0.75,
      gap: 0.5,
    },
    children: {
      overflow: "visible",
    },
    textButton: {
      textTransform: "none",
      fontSize: "0.75rem",
      fontWeight: 600,
    },
    emptyValue: {
      ml: `${(pathDepth + 2) * NODE_INDENT_REM}rem`,
      py: 0.375,
      color: "#94a3b8",
      fontFamily: MONOSPACE_FONT,
      fontSize: "0.75rem",
      fontStyle: "italic",
    },
  };
};

const maxNameLength = (name?: string): number => {
  return max(String(name ?? "").length, 4);
};

type JSONEditorStyleOptions = {
  copySucceeded?: boolean;
  embedded: boolean;
  compact: boolean;
  hasHeader: boolean;
  sourceCollapsed: boolean;
  treeCollapsed: boolean;
  isResizing: boolean;
  sourcePaneWidthPx: number;
};

export const createJSONEditorStyles = ({
  copySucceeded,
  embedded,
  compact,
  hasHeader,
  sourceCollapsed,
  treeCollapsed,
  isResizing,
  sourcePaneWidthPx,
}: JSONEditorStyleOptions) => {
  const bothCollapsed = sourceCollapsed && treeCollapsed;

  return {
    root: {
      width: embedded ? "100%" : "100vw",
      height: bothCollapsed ? "auto" : embedded ? "100%" : "100vh",
      minHeight: bothCollapsed
        ? compact
          ? 30
          : 38
        : compact
          ? 120
          : embedded
            ? 160
            : 0,
      position: embedded ? ("relative" as const) : ("static" as const),
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
      bgcolor: embedded ? "#0f172a" : "#f8fafc",
      color: "text.primary",
      borderRadius: embedded ? 1 : 0,
      border: embedded ? "1px solid" : 0,
      borderColor: "divider",
    },
    header: {
      display: hasHeader ? "flex" : "none",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1,
      px: compact ? 0.75 : embedded ? 1.25 : 2,
      py: compact ? 0.375 : 0.5,
      minHeight: compact ? 30 : 38,
      position: "relative" as const,
      zIndex: 1,
      borderBottom: bothCollapsed ? 0 : "1px solid",
      borderColor: "divider",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
      boxShadow: embedded ? "none" : "0 1px 4px rgba(15, 23, 42, 0.04)",
      flexWrap: "nowrap" as const,
    },
    headerLeft: {
      alignItems: "center",
      gap: compact ? 0.5 : 0.75,
      flexWrap: "nowrap" as const,
      minWidth: 0,
      overflow: "hidden",
    },
    titleText: {
      fontWeight: 700,
      fontSize: compact ? "0.8125rem" : "0.9375rem",
      letterSpacing: 0,
      whiteSpace: "nowrap" as const,
    },
    validityChip: {
      height: compact ? 20 : 22,
      fontWeight: 700,
      fontSize: compact ? "0.625rem" : "0.6875rem",
      borderRadius: 0.75,
      "& .MuiChip-icon": {
        fontSize: compact ? "0.75rem" : "0.875rem",
      },
    },
    sourceMeta: {
      color: "text.secondary",
      fontFamily: MONOSPACE_FONT,
      fontSize: compact ? "0.625rem" : "0.6875rem",
      whiteSpace: "nowrap" as const,
    },
    copyStatus: {
      color: copySucceeded ? "#16a34a" : "#dc2626",
      fontSize: compact ? "0.625rem" : "0.6875rem",
      fontWeight: 700,
      whiteSpace: "nowrap" as const,
    },
    headerActions: {
      justifyContent: "flex-end",
      alignItems: "center",
      flexWrap: "nowrap" as const,
      gap: 0.5,
      width: "auto",
      flexShrink: 0,
    },
    content: {
      flex: bothCollapsed ? "none" : 1,
      minHeight: 0,
      minWidth: 0,
      height: bothCollapsed ? 0 : "100%",
      display: bothCollapsed ? "none" : "flex",
      flexDirection: (treeCollapsed || sourceCollapsed ? "column" : "row") as
        "column" | "row",
      overflow: "hidden",
      ...(embedded &&
        !treeCollapsed &&
        !sourceCollapsed && {
          flexDirection: "column" as const,
        }),
    },
    sourcePane: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      height: "100%",
      width: treeCollapsed || embedded ? "100%" : `${sourcePaneWidthPx}px`,
      display: sourceCollapsed ? "none" : ("flex" as const),
      flexDirection: "column" as const,
      bgcolor: "#0f172a",
      overflow: "hidden",
      p: 0,
    },
    splitter: {
      position: "relative" as const,
      minHeight: 0,
      width: `${SPLITTER_WIDTH_PX}px`,
      flexShrink: 0,
      cursor: "col-resize",
      bgcolor: isResizing ? "#bfdbfe" : "#e2e8f0",
      transition: "background-color 100ms ease",
      display: embedded || treeCollapsed || sourceCollapsed ? "none" : "block",
      "&:hover": {
        bgcolor: "#93c5fd",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "50%",
        width: 2,
        transform: "translateX(-50%)",
        bgcolor: isResizing ? "#2563eb" : "#94a3b8",
        borderRadius: 1,
      },
    },
    paneTitle: {
      fontWeight: 700,
      fontSize: compact ? "0.6875rem" : "0.75rem",
      letterSpacing: "0.5px",
      textTransform: "uppercase" as const,
      color: compact ? "#94a3b8" : "text.secondary",
    },
    paneHeader: {
      alignItems: "center",
      justifyContent: "space-between",
      px: compact ? 0.75 : 1.25,
      py: 0.25,
      minHeight: compact ? 26 : 30,
      bgcolor: "#1e293b",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    },
    paneActions: {
      flexWrap: "nowrap" as const,
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 0.25,
      color: "#cbd5e1",
    },
    paneActionButton: {
      minWidth: compact ? 22 : 26,
      width: compact ? 22 : 26,
      height: compact ? 22 : 26,
      p: 0,
      border: "none",
      color: "inherit",
      borderRadius: 0.75,
    },
    error: {
      alignItems: "center",
      py: 0.25,
      px: 0.75,
      border: "1px solid #fecaca",
      borderRadius: 0,
      "& .MuiAlert-message": {
        py: 0.25,
        fontFamily: MONOSPACE_FONT,
        fontSize: "0.75rem",
        overflowWrap: "anywhere",
      },
    },
    sourceInputWrap: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
      "& > .MuiStack-root": {
        flex: 1,
        minHeight: 0,
        height: "100%",
        width: "100%",
        alignItems: "stretch",
      },
      "& .MuiTextField-root": {
        flex: 1,
        height: "100%",
        minHeight: 0,
        maxHeight: "none !important",
        width: "100%",
      },
    },
    sourceInput: {
      flex: 1,
      height: "100%",
      minHeight: 0,
      maxHeight: "none !important",
      width: "100%",
      overflow: "hidden",
      "& .MuiInputBase-root": {
        flex: 1,
        height: "100% !important",
        minHeight: "0 !important",
        maxHeight: "none !important",
        alignItems: "stretch",
        bgcolor: "#0f172a",
        color: "#e2e8f0",
        borderRadius: 0,
        p: 0,
      },
      "& fieldset": {
        border: "none !important",
      },
      "& textarea:not([aria-hidden='true'])": {
        height: "100% !important",
        minHeight: "100% !important",
        width: "100% !important",
        overflowX: "auto !important",
        overflowY: "scroll !important",
        resize: "none",
        boxSizing: "border-box",
        scrollbarGutter: "stable",
        fontFamily: MONOSPACE_FONT,
        fontSize: compact ? "0.75rem" : "0.8125rem",
        lineHeight: 1.5,
        color: "#e2e8f0",
        caretColor: "#38bdf8",
        tabSize: 2,
        p: compact ? "0.375rem 0.5rem" : "0.625rem 0.75rem",
      },
    },
    treePane: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      overflow: "hidden",
      bgcolor: WHITE_COLOR,
      borderLeft: embedded || sourceCollapsed ? 0 : "1px solid",
      borderTop: embedded && !sourceCollapsed ? "1px solid" : 0,
      borderColor: "divider",
      display: treeCollapsed ? "none" : ("flex" as const),
      flexDirection: "column" as const,
    },
    headerButton: {
      minHeight: compact ? 24 : 30,
      height: compact ? 24 : 30,
      px: compact ? 0.75 : 1.25,
      fontSize: compact ? "0.6875rem" : "0.75rem",
      gap: 0.375,
      textTransform: "none" as const,
      whiteSpace: "nowrap" as const,
      borderRadius: 1,
      fontWeight: 600,
    },
    treeHeader: {
      alignItems: "center",
      justifyContent: "space-between",
      px: compact ? 0.75 : 1.25,
      py: 0.25,
      borderBottom: "1px solid",
      borderColor: "divider",
      bgcolor: "#f8fafc",
      minHeight: compact ? 26 : 30,
    },
    treeScroll: {
      overflow: "auto",
      minHeight: 0,
      flex: 1,
      p: compact ? 0.5 : 0.75,
      scrollbarGutter: "stable",
      scrollbarColor: "#cbd5e1 transparent",
    },
  };
};
