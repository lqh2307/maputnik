import { getJSONParseErrorMessage, valueLabel, toError } from "./Utils";
import { JSONEditorErrorContext, JSONEditorProps } from "./Types";
import { addTextPlainToClipboard } from "../../utils/Clipboard";
import { ImportFileButton } from "../ImportFileButton";
import { TooltipButton } from "../TooltipButton";
import { max, min } from "../../utils/Number";
import { TextInput } from "../TextInput";
import { StackBox } from "../StackBox";
import React from "react";
import {
  Typography,
  SxProps,
  Alert,
  Stack,
  Theme,
  Chip,
  Box,
} from "@mui/material";
import {
  DEFAULT_SOURCE_PANE_WIDTH_PX,
  MIN_SOURCE_PANE_WIDTH_PX,
  createJSONTreeRowStyles,
  createJSONEditorStyles,
  MIN_TREE_PANE_WIDTH_PX,
  SPLITTER_WIDTH_PX,
} from "./JSONEditor.styles";
import {
  getExpandedJSONPathKeys,
  normalizeJSONFileName,
  renameJSONKeyAtPath,
  getJSONValueAtPath,
  addJSONChildAtPath,
  deleteNestedValue,
  parseStringJSON,
  setNestedValue,
  getJSONPathKey,
  sortJSONKeys,
  deepClone,
  JSONValue,
  isRecord,
  JSONPath,
  isArray,
} from "../../utils/Object";
import {
  CheckCircleOutlined,
  KeyboardArrowRight,
  KeyboardArrowDown,
  FormatAlignLeft,
  ErrorOutlined,
  SortByAlpha,
  ContentCopy,
  AccountTree,
  RestartAlt,
  UploadFile,
  UnfoldLess,
  UnfoldMore,
  Compress,
  Download,
  Delete,
  Close,
  Code,
  Edit,
  Add,
} from "@mui/icons-material";

const SOURCE_SYNC_DELAY = 200;
const SOURCE_PARSE_DELAY = 200;

const INITIAL_JSON: JSONValue = {};

/** Defines jsontree row props. */
type JSONTreeRowProp = {
  /** Human-readable name. */
  name?: string;
  /** Current value. */
  value: JSONValue;
  /** Configuration for path. */
  path: JSONPath;
  /** Configuration for root path key. */
  rootPathKey: string;
  /** Whether expanded. */
  expanded: Record<string, boolean>;
  /** Event callback for toggle. */
  onToggle: (path: JSONPath) => void;
  /** Event callback for change. */
  onChange: (path: JSONPath, value: JSONValue) => void;
  /** Event callback for rename key. */
  onRenameKey: (
    parentPath: JSONPath,
    oldKey: string,
    newKey: string
  ) => boolean;
  /** Event callback for add child. */
  onAddChild: (path: JSONPath) => void;
  /** Event callback for delete. */
  onDelete: (path: JSONPath) => void;
  /** Event callback for invalid node JSON. */
  onError: (error: Error) => void;
};

const JSONTreeRowInner = ({
  name,
  value,
  path,
  rootPathKey,
  expanded,
  onToggle,
  onChange,
  onRenameKey,
  onAddChild,
  onDelete,
  onError,
}: JSONTreeRowProp): React.JSX.Element => {
  const currentPathKey = getJSONPathKey(path);
  const isExpanded = expanded[currentPathKey] ?? path.length === 0;
  const canExpand = isArray(value) || isRecord(value);
  const isRoot = currentPathKey === rootPathKey;
  const [editingJSON, setEditingJSON] = React.useState<boolean>(false);
  const [editValue, setEditValue] = React.useState<string>("");
  const [editError, setEditError] = React.useState<string>();
  const [nameInputVersion, setNameInputVersion] = React.useState<number>(0);
  const childEntries = React.useMemo(() => {
    if (!canExpand || !isExpanded) {
      return [];
    }

    return isArray(value)
      ? value.map((item, index) => {
          return {
            key: index,
            name: String(index),
            value: item,
          };
        })
      : Object.entries(value).map(([key, item]) => {
          return {
            key,
            name: key,
            value: item,
          };
        });
  }, [canExpand, isExpanded, value]);

  const styles = React.useMemo(() => {
    return createJSONTreeRowStyles({
      canExpand,
      name,
      pathDepth: path.length,
      value,
    });
  }, [canExpand, name, path.length, value]);

  const handleToggle = React.useCallback(() => {
    onToggle(path);
  }, [path, onToggle]);

  const handleAddChild = React.useCallback(() => {
    onAddChild(path);
  }, [path, onAddChild]);

  const handleDelete = React.useCallback(() => {
    onDelete(path);
  }, [path, onDelete]);

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      onChange(path, parseStringJSON(nextValue, nextValue).result);
    },
    [path, onChange]
  );

  const handleNameChange = React.useCallback(
    (nextName: string) => {
      const parentPath = path.slice(0, -1);

      if (
        typeof name === "string" &&
        !onRenameKey(parentPath, name, nextName)
      ) {
        setNameInputVersion((currentVersion) => {
          return currentVersion + 1;
        });
      }
    },
    [name, path, onRenameKey]
  );

  const handleOpenEditJSON = React.useCallback(() => {
    setEditValue(JSON.stringify(value, null, 2));
    setEditError(undefined);
    setEditingJSON(true);
  }, [value]);

  const handleEditValueChange = React.useCallback((nextValue: string) => {
    setEditValue(nextValue);
    setEditError(undefined);
  }, []);

  const handleSaveEditJSON = React.useCallback(() => {
    const parsed = parseStringJSON(editValue);

    if (parsed.error) {
      setEditError(getJSONParseErrorMessage(parsed.error, editValue));
      onError(parsed.error);

      return;
    }

    onChange(path, parsed.result);
    setEditingJSON(false);
    setEditError(undefined);
  }, [editValue, path, onChange, onError]);

  const handleCloseEditJSON = React.useCallback(() => {
    setEditingJSON(false);
    setEditError(undefined);
  }, []);

  const handleEditKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseEditJSON();
      } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleSaveEditJSON();
      }
    },
    [handleCloseEditJSON, handleSaveEditJSON]
  );

  return (
    <Box>
      <Box sx={styles.row}>
        {canExpand && (
          <TooltipButton
            title={isExpanded ? "Collapse" : "Expand"}
            onClick={handleToggle}
            icon={
              isExpanded ? (
                <KeyboardArrowDown fontSize="small" />
              ) : (
                <KeyboardArrowRight fontSize="small" />
              )
            }
            sx={styles.caretButton}
          />
        )}

        <StackBox sx={styles.content}>
          {name !== undefined && (
            <>
              <TextInput
                key={`${name}-${nameInputVersion}`}
                size={"small"}
                variant={"outlined"}
                multiline={false}
                value={name}
                disabled={typeof path[path.length - 1] === "number"}
                onChange={handleNameChange}
                sx={styles.nameInput}
              />

              <Typography sx={styles.separator}>:</Typography>
            </>
          )}

          {canExpand ? (
            <>
              <Typography sx={styles.containerToken}>
                {isArray(value) ? "[" : "{"}
              </Typography>

              <Typography sx={styles.containerLabel}>
                {valueLabel(value)}
              </Typography>

              <Typography sx={styles.containerToken}>
                {isArray(value) ? "]" : "}"}
              </Typography>
            </>
          ) : (
            <TextInput
              size={"small"}
              variant={"outlined"}
              multiline={false}
              value={value === null ? "null" : JSON.stringify(value)}
              delay={120}
              onChange={handleValueChange}
              sx={styles.valueInput}
            />
          )}
        </StackBox>

        <StackBox className="json-node-actions" sx={styles.actions}>
          <TooltipButton
            title="Edit JSON value"
            onClick={handleOpenEditJSON}
            icon={<Edit sx={styles.actionIcon} />}
            sx={styles.actionButton}
          />

          {canExpand && (
            <TooltipButton
              title={isArray(value) ? "Add array item" : "Add object property"}
              onClick={handleAddChild}
              icon={
                isArray(value) ? (
                  <Add sx={styles.actionIcon} />
                ) : (
                  <Code sx={styles.actionIcon} />
                )
              }
              sx={styles.actionButton}
            />
          )}

          <TooltipButton
            title="Delete node"
            disabled={isRoot}
            color="error"
            onClick={handleDelete}
            icon={<Delete sx={styles.actionIcon} />}
            sx={styles.deleteButton}
          />
        </StackBox>
      </Box>

      {editingJSON && (
        <Box sx={styles.editBox}>
          <TextInput
            variant={"outlined"}
            value={editValue}
            onChange={handleEditValueChange}
            minRows={min(max(editValue.split("\n").length, 4), 12)}
            autoFocus
            error={!!editError}
            helperText={editError}
            onKeyDown={handleEditKeyDown}
            sx={styles.editInput}
          />

          <StackBox sx={styles.editActions}>
            <TooltipButton
              title="Cancel (Esc)"
              size={"small"}
              variant={"outlined"}
              onClick={handleCloseEditJSON}
              sx={styles.textButton}
            >
              Cancel
            </TooltipButton>

            <TooltipButton
              title="Save (Ctrl/⌘+Enter)"
              size={"small"}
              variant="contained"
              onClick={handleSaveEditJSON}
              sx={styles.textButton}
            >
              Save
            </TooltipButton>
          </StackBox>
        </Box>
      )}

      {canExpand && isExpanded && (
        <Box sx={styles.children}>
          {childEntries.length === 0 && (
            <Typography sx={styles.emptyValue}>Empty container</Typography>
          )}

          {childEntries.map((entry) => {
            return (
              <JSONTreeRow
                key={`${currentPathKey}-${entry.key}`}
                name={entry.name}
                value={entry.value}
                path={[...path, entry.key]}
                rootPathKey={rootPathKey}
                expanded={expanded}
                onToggle={onToggle}
                onChange={onChange}
                onRenameKey={onRenameKey}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onError={onError}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

const areJSONTreeRowPropsEqual = (
  previous: JSONTreeRowProp,
  next: JSONTreeRowProp
): boolean => {
  return (
    previous.name === next.name &&
    previous.value === next.value &&
    previous.rootPathKey === next.rootPathKey &&
    previous.expanded === next.expanded &&
    previous.onToggle === next.onToggle &&
    previous.onChange === next.onChange &&
    previous.onRenameKey === next.onRenameKey &&
    previous.onAddChild === next.onAddChild &&
    previous.onDelete === next.onDelete &&
    previous.onError === next.onError &&
    getJSONPathKey(previous.path) === getJSONPathKey(next.path)
  );
};

const JSONTreeRow = React.memo(JSONTreeRowInner, areJSONTreeRowPropsEqual);

/** Renders the JSONEditor component. */
export const JSONEditor = React.memo(
  ({
    value = INITIAL_JSON,
    onChange,
    onError,
    onImport,
    onDownload,
    onCopy,
    onClose,
    title,
    headerExtra,
    embedded = false,
    defaultSourceCollapsed = false,
    defaultTreeCollapsed = false,
    compact = false,
    hideHeader = false,
    hideStatus = false,
    sx,
  }: JSONEditorProps): React.JSX.Element => {
    const [sourceValue, setSourceValue] = React.useState<string>(
      JSON.stringify(value, null, 2)
    );
    const rootRef = React.useRef<JSONValue>(deepClone(value));
    const initialValueRef = React.useRef<JSONValue>(deepClone(value));
    const [lastUpdated, setLastUpdated] = React.useState<number>(0);
    const [parseError, setParseError] = React.useState<string>();
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const [sourcePaneWidthPx, setSourcePaneWidthPx] = React.useState<number>(
      DEFAULT_SOURCE_PANE_WIDTH_PX
    );
    const [isResizing, setIsResizing] = React.useState<boolean>(false);
    const [sourceCollapsed, setSourceCollapsed] = React.useState<boolean>(
      defaultSourceCollapsed
    );
    const [treeCollapsed, setTreeCollapsed] =
      React.useState<boolean>(defaultTreeCollapsed);
    const contentRef = React.useRef<HTMLDivElement>(undefined);
    const editorRootRef = React.useRef<HTMLDivElement>(undefined);
    const resizeCleanupRef = React.useRef<() => void>(undefined);
    const skipSourceSyncRef = React.useRef<boolean>(false);
    const isSourceEditingRef = React.useRef<boolean>(false);
    const [copySucceeded, setCopySucceeded] = React.useState<boolean>();
    const root = rootRef.current;

    const serializedValue = React.useMemo(() => {
      return JSON.stringify(value);
    }, [value]);
    const sourceLineCount = React.useMemo(() => {
      return sourceValue.split("\n").length;
    }, [sourceValue]);

    const emitError = React.useCallback(
      (error: Error, context: JSONEditorErrorContext): void => {
        onError?.(error, context);
      },
      [onError]
    );

    const reportParseError = React.useCallback(
      (error: Error, context: JSONEditorErrorContext, source: string): void => {
        setParseError(getJSONParseErrorMessage(error, source));
        emitError(error, context);
      },
      [emitError]
    );

    const handleNodeError = React.useCallback(
      (error: Error): void => {
        emitError(error, "node");
      },
      [emitError]
    );

    const commitRoot = React.useCallback(
      (nextRoot: JSONValue): void => {
        rootRef.current = nextRoot;
        setLastUpdated((currentLastUpdated) => {
          return currentLastUpdated + 1;
        });
        onChange?.(deepClone(nextRoot));
      },
      [onChange]
    );

    const touchRoot = React.useCallback((): void => {
      setLastUpdated((currentLastUpdated) => {
        return currentLastUpdated + 1;
      });
      onChange?.(deepClone(rootRef.current));
    }, [onChange]);

    React.useEffect(() => {
      if (JSON.stringify(rootRef.current) === serializedValue) {
        return;
      }

      const nextRoot = deepClone(value);
      rootRef.current = nextRoot;
      isSourceEditingRef.current = false;
      skipSourceSyncRef.current = true;
      setSourceValue(JSON.stringify(nextRoot, null, 2));
      setParseError(undefined);
      setExpanded({});
      setLastUpdated((currentLastUpdated) => {
        return currentLastUpdated + 1;
      });
    }, [serializedValue, value]);

    const clampSourcePaneWidthPx = React.useCallback(
      (nextWidth: number): number => {
        const contentWidth = contentRef.current?.clientWidth ?? 0;
        const maxWidth = max(
          MIN_SOURCE_PANE_WIDTH_PX,
          contentWidth > 0
            ? contentWidth - MIN_TREE_PANE_WIDTH_PX - SPLITTER_WIDTH_PX
            : DEFAULT_SOURCE_PANE_WIDTH_PX
        );

        return min(max(nextWidth, MIN_SOURCE_PANE_WIDTH_PX), maxWidth);
      },
      []
    );

    React.useEffect(() => {
      if (skipSourceSyncRef.current) {
        skipSourceSyncRef.current = false;

        return;
      }

      const timeoutId = setTimeout(() => {
        const nextSourceValue = JSON.stringify(rootRef.current, null, 2);

        setSourceValue((currentSourceValue) => {
          return currentSourceValue === nextSourceValue
            ? currentSourceValue
            : nextSourceValue;
        });
      }, SOURCE_SYNC_DELAY);

      return () => {
        clearTimeout(timeoutId);
      };
    }, [lastUpdated]);

    React.useEffect(() => {
      if (!isSourceEditingRef.current) {
        return;
      }

      const timeoutId = setTimeout(() => {
        const parsed = parseStringJSON(sourceValue);

        if (parsed.error) {
          reportParseError(parsed.error, "source", sourceValue);

          return;
        }

        setParseError(undefined);
        skipSourceSyncRef.current = true;
        isSourceEditingRef.current = false;
        commitRoot(parsed.result);
        setExpanded({});
      }, SOURCE_PARSE_DELAY);

      return () => {
        clearTimeout(timeoutId);
      };
    }, [commitRoot, reportParseError, sourceValue]);

    const handleSourceChange = React.useCallback((nextSourceValue: string) => {
      isSourceEditingRef.current = true;
      setSourceValue(nextSourceValue);
    }, []);

    const applySourceValue = React.useCallback(
      (
        nextSourceValue: string,
        errorContext: JSONEditorErrorContext = "source"
      ): boolean => {
        const parsed = parseStringJSON(nextSourceValue);

        setSourceValue(nextSourceValue);

        if (parsed.error) {
          isSourceEditingRef.current = false;
          reportParseError(parsed.error, errorContext, nextSourceValue);

          return false;
        }

        isSourceEditingRef.current = false;
        skipSourceSyncRef.current = true;
        setParseError(undefined);
        commitRoot(parsed.result);
        setExpanded({});

        return true;
      },
      [commitRoot, reportParseError]
    );

    const handleResizeStart = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        resizeCleanupRef.current?.();
        setIsResizing(true);

        const startX = event.clientX;
        const startWidth = sourcePaneWidthPx;

        const handlePointerMove = (moveEvent: PointerEvent): void => {
          setSourcePaneWidthPx(
            clampSourcePaneWidthPx(startWidth + moveEvent.clientX - startX)
          );
        };

        const handlePointerUp = (): void => {
          resizeCleanupRef.current?.();
        };

        resizeCleanupRef.current = (): void => {
          setIsResizing(false);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
          removeEventListener("pointermove", handlePointerMove);
          removeEventListener("pointerup", handlePointerUp);
          resizeCleanupRef.current = undefined;
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        addEventListener("pointermove", handlePointerMove);
        addEventListener("pointerup", handlePointerUp, {
          once: true,
        });
      },
      [clampSourcePaneWidthPx, sourcePaneWidthPx]
    );

    React.useEffect(() => {
      return () => {
        resizeCleanupRef.current?.();
      };
    }, []);

    const handleImportFile = React.useCallback(
      async (file: File) => {
        try {
          const nextSourceValue = await file.text();
          const imported = applySourceValue(nextSourceValue, "import");

          if (imported) {
            onImport?.(deepClone(rootRef.current), file);
          }
        } catch (error) {
          emitError(toError(error), "import");
        }
      },
      [applySourceValue, emitError, onImport]
    );

    const handleDownload = React.useCallback(() => {
      const promptedFileName = prompt("Save JSON as", "data.json");

      if (promptedFileName === null) {
        return;
      }

      try {
        const fileName = normalizeJSONFileName(promptedFileName);
        const blob = new Blob([JSON.stringify(rootRef.current, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(url);
        onDownload?.(deepClone(rootRef.current), fileName);
      } catch (error) {
        emitError(toError(error), "download");
      }
    }, [emitError, onDownload]);

    const handleNodeChange = React.useCallback(
      (path: JSONPath, value: JSONValue) => {
        rootRef.current = setNestedValue(rootRef.current, path, value);
        touchRoot();
        setParseError(undefined);
      },
      [touchRoot]
    );

    const handleRenameKey = React.useCallback(
      (parentPath: JSONPath, oldKey: string, newKey: string): boolean => {
        const normalizedKey = newKey.trim();
        const parent = getJSONValueAtPath(rootRef.current, parentPath);

        if (
          !normalizedKey ||
          normalizedKey === oldKey ||
          !isRecord(parent) ||
          Object.prototype.hasOwnProperty.call(parent, normalizedKey)
        ) {
          return newKey === oldKey;
        }

        rootRef.current = renameJSONKeyAtPath(
          rootRef.current,
          parentPath,
          oldKey,
          newKey
        );
        touchRoot();
        setParseError(undefined);

        return true;
      },
      [touchRoot]
    );

    const handleAddChild = React.useCallback(
      (path: JSONPath) => {
        rootRef.current = addJSONChildAtPath(rootRef.current, path);
        touchRoot();
        setExpanded((currentExpanded) => {
          return {
            ...currentExpanded,
            [getJSONPathKey(path)]: true,
          };
        });
        setParseError(undefined);
      },
      [touchRoot]
    );

    const handleDelete = React.useCallback(
      (path: JSONPath) => {
        rootRef.current = deleteNestedValue(rootRef.current, path);
        touchRoot();
        setParseError(undefined);
      },
      [touchRoot]
    );

    const handleToggle = React.useCallback((path: JSONPath) => {
      const key = getJSONPathKey(path);

      setExpanded((currentExpanded) => {
        return {
          ...currentExpanded,
          [key]: !(currentExpanded[key] ?? path.length === 0),
        };
      });
    }, []);

    const handleReset = React.useCallback(() => {
      const resetValue = deepClone(initialValueRef.current);
      isSourceEditingRef.current = false;
      skipSourceSyncRef.current = true;
      commitRoot(resetValue);
      setSourceValue(JSON.stringify(resetValue, null, 2));
      setParseError(undefined);
      setExpanded({});
      onChange?.(deepClone(resetValue));
    }, [commitRoot, onChange]);

    const handleFormat = React.useCallback(() => {
      const parsed = parseStringJSON(sourceValue);

      if (parsed.error) {
        reportParseError(parsed.error, "format", sourceValue);

        return;
      }

      applySourceValue(JSON.stringify(parsed.result, null, 2));
    }, [applySourceValue, reportParseError, sourceValue]);

    const handleMinify = React.useCallback(() => {
      const parsed = parseStringJSON(sourceValue);

      if (parsed.error) {
        reportParseError(parsed.error, "minify", sourceValue);

        return;
      }

      applySourceValue(JSON.stringify(parsed.result));
    }, [applySourceValue, reportParseError, sourceValue]);

    const handleSortKeys = React.useCallback(() => {
      const parsed = parseStringJSON(sourceValue);

      if (parsed.error) {
        reportParseError(parsed.error, "sort", sourceValue);

        return;
      }

      applySourceValue(JSON.stringify(sortJSONKeys(parsed.result), null, 2));
    }, [applySourceValue, reportParseError, sourceValue]);

    const handleCopy = React.useCallback(async () => {
      const succeeded = await addTextPlainToClipboard(sourceValue);

      setCopySucceeded(succeeded);
      onCopy?.(succeeded, sourceValue);

      if (!succeeded) {
        emitError(new Error("Unable to copy JSON to the clipboard."), "copy");
      }
    }, [emitError, onCopy, sourceValue]);

    React.useEffect(() => {
      if (copySucceeded === undefined) {
        return;
      }

      const timeoutId = setTimeout(() => {
        setCopySucceeded(undefined);
      }, 1800);

      return () => {
        return clearTimeout(timeoutId);
      };
    }, [copySucceeded]);

    const handleExpandAll = React.useCallback(() => {
      setExpanded(getExpandedJSONPathKeys(rootRef.current));
    }, []);

    const handleCollapseAll = React.useCallback(() => {
      setExpanded({
        [getJSONPathKey([])]: false,
      });
    }, []);

    const handleToggleSource = React.useCallback(() => {
      setSourceCollapsed((current) => {
        return !current;
      });
    }, []);

    const handleToggleTree = React.useCallback(() => {
      setTreeCollapsed((current) => {
        return !current;
      });
    }, []);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (
          !editorRootRef.current?.contains(event.target as Node) ||
          !(event.ctrlKey || event.metaKey) ||
          !event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const shortcutHandlers: Record<string, () => void> = {
          f: handleFormat,
          m: handleMinify,
          s: handleSortKeys,
          c: () => {
            handleCopy();
          },
        };
        const shortcutHandler = shortcutHandlers[event.key.toLowerCase()];

        if (shortcutHandler) {
          event.preventDefault();
          shortcutHandler();
        }
      };

      addEventListener("keydown", handleKeyDown);

      return () => {
        return removeEventListener("keydown", handleKeyDown);
      };
    }, [handleCopy, handleFormat, handleMinify, handleSortKeys]);

    const handleSplitterKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        const direction = event.key === "ArrowLeft" ? -1 : 1;

        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
          return;
        }

        event.preventDefault();
        setSourcePaneWidthPx((currentWidth) => {
          return clampSourcePaneWidthPx(currentWidth + direction * 24);
        });
      },
      [clampSourcePaneWidthPx]
    );

    const showFullToolbar = !embedded && !compact;
    const hasHeader = !hideHeader;

    const styles = React.useMemo(() => {
      return createJSONEditorStyles({
        copySucceeded,
        embedded,
        compact,
        hasHeader,
        sourceCollapsed,
        treeCollapsed,
        isResizing,
        sourcePaneWidthPx,
      });
    }, [
      compact,
      copySucceeded,
      embedded,
      hasHeader,
      isResizing,
      sourceCollapsed,
      sourcePaneWidthPx,
      treeCollapsed,
    ]);

    const rootSx = React.useMemo<SxProps<Theme>>(() => {
      return [styles.root, ...(Array.isArray(sx) ? sx : [sx])];
    }, [styles.root, sx]);

    return (
      <Box ref={editorRootRef} sx={rootSx}>
        {hasHeader && (
          <Stack direction="row" sx={styles.header}>
            <Stack direction="row" sx={styles.headerLeft}>
              {title && <Typography sx={styles.titleText}>{title}</Typography>}

              {!hideStatus && (
                <>
                  <Chip
                    size={"small"}
                    color={parseError ? "error" : "success"}
                    variant={"outlined"}
                    icon={
                      parseError ? (
                        <ErrorOutlined fontSize="small" />
                      ) : (
                        <CheckCircleOutlined fontSize="small" />
                      )
                    }
                    label={parseError ? "Invalid JSON" : "Valid JSON"}
                    sx={styles.validityChip}
                  />

                  <Typography sx={styles.sourceMeta}>
                    {sourceLineCount} {sourceLineCount === 1 ? "line" : "lines"}
                    {` · ${sourceValue.length.toLocaleString()} chars`}
                  </Typography>

                  {copySucceeded !== undefined && (
                    <Typography aria-live="polite" sx={styles.copyStatus}>
                      {copySucceeded ? "Copied to clipboard" : "Copy failed"}
                    </Typography>
                  )}
                </>
              )}
            </Stack>

            <StackBox sx={styles.headerActions}>
              {headerExtra}

              <TooltipButton
                title={sourceCollapsed ? "Show source" : "Hide source"}
                onClick={handleToggleSource}
                color={!sourceCollapsed ? "primary" : "inherit"}
                icon={<Code fontSize="small" />}
                sx={styles.headerButton}
              >
                Source
              </TooltipButton>

              <TooltipButton
                title={treeCollapsed ? "Show tree" : "Hide tree"}
                onClick={handleToggleTree}
                color={!treeCollapsed ? "primary" : "inherit"}
                icon={<AccountTree fontSize="small" />}
                sx={styles.headerButton}
              >
                Tree
              </TooltipButton>

              {showFullToolbar && (
                <ImportFileButton
                  title={"Import"}
                  acceptMimeType={".json,application/json"}
                  onFileLoaded={handleImportFile}
                  startIcon={<UploadFile fontSize="small" />}
                  sx={styles.headerButton}
                >
                  Import
                </ImportFileButton>
              )}

              {showFullToolbar && (
                <TooltipButton
                  title={"Download"}
                  onClick={handleDownload}
                  startIcon={<Download fontSize="small" />}
                  sx={styles.headerButton}
                >
                  Download
                </TooltipButton>
              )}

              {showFullToolbar && (
                <TooltipButton
                  title={"Reset"}
                  color={"error"}
                  onClick={handleReset}
                  startIcon={<RestartAlt fontSize="small" />}
                  sx={styles.headerButton}
                >
                  Reset
                </TooltipButton>
              )}

              {onClose && (
                <TooltipButton
                  title="Close"
                  onClick={onClose}
                  icon={<Close fontSize="small" />}
                  sx={styles.paneActionButton}
                />
              )}
            </StackBox>
          </Stack>
        )}

        <Box ref={contentRef} sx={styles.content}>
          <Stack sx={styles.sourcePane}>
            <Stack direction="row" sx={styles.paneHeader}>
              <Typography sx={styles.paneTitle}>Source</Typography>

              <Stack direction="row" sx={styles.paneActions}>
                <TooltipButton
                  title="Format JSON (Ctrl/⌘+Shift+F)"
                  onClick={handleFormat}
                  icon={<FormatAlignLeft fontSize="small" />}
                  sx={styles.paneActionButton}
                />

                <TooltipButton
                  title="Minify JSON (Ctrl/⌘+Shift+M)"
                  onClick={handleMinify}
                  icon={<Compress fontSize="small" />}
                  sx={styles.paneActionButton}
                />

                <TooltipButton
                  title="Sort object keys (Ctrl/⌘+Shift+S)"
                  onClick={handleSortKeys}
                  icon={<SortByAlpha fontSize="small" />}
                  sx={styles.paneActionButton}
                />

                <TooltipButton
                  title="Copy source (Ctrl/⌘+Shift+C)"
                  onClick={handleCopy}
                  icon={<ContentCopy fontSize="small" />}
                  sx={styles.paneActionButton}
                />
              </Stack>
            </Stack>

            {parseError && (
              <Alert severity={"error"} sx={styles.error}>
                {parseError}
              </Alert>
            )}

            <Box sx={styles.sourceInputWrap}>
              <TextInput
                variant={"outlined"}
                value={sourceValue}
                onChange={handleSourceChange}
                maxLength={Number.MAX_SAFE_INTEGER}
                multiline={true}
                slotProps={{
                  htmlInput: {
                    "aria-label": "JSON source",
                    "aria-invalid": !!parseError,
                    style: {
                      height: "100%",
                      minHeight: "100%",
                      width: "100%",
                      overflowY: "scroll",
                      resize: "none",
                    },
                  },
                }}
                sx={styles.sourceInput}
              />
            </Box>
          </Stack>

          {!treeCollapsed && !sourceCollapsed && (
            <Box
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize source and tree panels"
              aria-valuenow={sourcePaneWidthPx}
              aria-valuemin={MIN_SOURCE_PANE_WIDTH_PX}
              tabIndex={0}
              onPointerDown={handleResizeStart}
              onKeyDown={handleSplitterKeyDown}
              sx={styles.splitter}
            />
          )}

          {!treeCollapsed && (
            <Stack sx={styles.treePane}>
              <Stack direction="row" sx={styles.treeHeader}>
                <Typography sx={styles.paneTitle}>Tree</Typography>

                <Stack direction="row" sx={styles.paneActions}>
                  <TooltipButton
                    title="Expand all"
                    onClick={handleExpandAll}
                    icon={<UnfoldMore fontSize="small" />}
                    sx={styles.paneActionButton}
                  />

                  <TooltipButton
                    title="Collapse all"
                    onClick={handleCollapseAll}
                    icon={<UnfoldLess fontSize="small" />}
                    sx={styles.paneActionButton}
                  />
                </Stack>
              </Stack>

              <Box sx={styles.treeScroll}>
                <JSONTreeRow
                  value={root}
                  path={[]}
                  rootPathKey={getJSONPathKey([])}
                  expanded={expanded}
                  onToggle={handleToggle}
                  onChange={handleNodeChange}
                  onRenameKey={handleRenameKey}
                  onAddChild={handleAddChild}
                  onDelete={handleDelete}
                  onError={handleNodeError}
                />
              </Box>
            </Stack>
          )}
        </Box>
      </Box>
    );
  }
);
