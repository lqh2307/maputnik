import { Box, IconButton, Stack, Typography } from "@mui/material";
import { XMLEditorProps, XMLTreeNode } from "./Types";
import { SnackbarAlert } from "../SnackbarAlert";
import { TooltipButton } from "../TooltipButton";
import { max, min } from "../../utils/Number";
import { WHITE_COLOR } from "../../configs";
import { TextInput } from "../TextInput";
import React from "react";
import {
  createElementNode,
  countXMLNodes,
  parseXMLTree,
  addAttribute,
  serializeXML,
  addChildNode,
  replaceNode,
  deleteNode,
  updateNode,
} from "./Utils";
import {
  KeyboardArrowRight,
  KeyboardArrowDown,
  TextFields,
  Delete,
  Code,
  Edit,
  Add,
} from "@mui/icons-material";

const SOURCE_SYNC_DELAY: number = 120;
const DEFAULT_SOURCE_PANE_WIDTH_PX = 420;
const MIN_SOURCE_PANE_WIDTH_PX = 320;
const MIN_TREE_PANE_WIDTH_PX = 360;
const SPLITTER_WIDTH_PX = 10;

const INITIAL_XML: string = `<?xml version="1.0" encoding="UTF-8"?>
<report id="demo" status="draft">
  <title>XML Editor</title>
  <author name="Codex">React tree demo</author>
  <sections>
    <section order="1">
      <heading>Overview</heading>
      <content>Edit elements, attributes, and text nodes.</content>
    </section>
  </sections>
</report>`;

const editorInputSx = {
  "& .MuiInputBase-root": {
    fontFamily: "Consolas, monospace",
    fontSize: 13,
  },
  "& .MuiInputBase-input": {
    px: 0.5,
    py: 0.25,
  },
  "& fieldset": {
    borderColor: "transparent",
  },
  "&:hover fieldset": {
    borderColor: "#c8d0d8 !important",
  },
};

/** Defines xmltree row props. */
type XMLTreeRowProp = {
  /** Configuration for node. */
  node: XMLTreeNode;
  /** Configuration for level. */
  level: number;
  /** Identifier of the associated root. */
  rootId: string;
  /** Configuration for last updated. */
  lastUpdated: number;
  /** Whether expanded. */
  expanded: Record<string, boolean>;
  /** Event callback for toggle. */
  onToggle: (nodeId: string) => void;
  /** Event callback for change. */
  onChange: (nodeId: string, patch: XMLTreeNode) => void;
  /** Event callback for replace. */
  onReplace: (nodeId: string, nextNode: XMLTreeNode) => void;
  /** Event callback for add child. */
  onAddChild: (nodeId: string, child: XMLTreeNode) => void;
  /** Event callback for delete. */
  onDelete: (nodeId: string) => void;
  /** Event callback for invalid node XML. */
  onError: (error: Error) => void;
};

const XMLTreeRow = React.memo(
  ({
    node,
    level,
    rootId,
    lastUpdated,
    expanded,
    onToggle,
    onChange,
    onReplace,
    onAddChild,
    onDelete,
    onError,
  }: XMLTreeRowProp): React.JSX.Element => {
    const isElement = node.type === "element";
    const isExpanded = expanded[node.id] ?? true;
    const canExpand = isElement && node.childrens.length > 0;
    const [editingXML, setEditingXML] = React.useState<boolean>(false);
    const [editValue, setEditValue] = React.useState<string>("");
    const [editError, setEditError] = React.useState<string>();

    const styles = React.useMemo(() => {
      return {
        row: {
          display: "grid",
          gridTemplateColumns: "22px minmax(0, 1fr) auto",
          alignItems: "center",
          gap: 0.5,
          minHeight: 30,
          pl: `${level * 18 + 8}px`,
          pr: 0.75,
          fontFamily: "Consolas, monospace",
          fontSize: 13,
          borderRadius: 0.75,
          "&:hover": {
            background: "#f4f7fb",
          },
          "&:hover .xml-node-actions": {
            opacity: 1,
          },
          "&:focus-within .xml-node-actions": {
            opacity: 1,
          },
        },
        caretButton: {
          width: 22,
          height: 22,
          color: canExpand ? "#5a6572" : "transparent",
        },
        content: {
          alignItems: "center",
          minWidth: 0,
        },
        tagToken: {
          color: "#8a3ffc",
          fontFamily: "inherit",
        },
        tagInput: {
          ...editorInputSx,
          width: `${max(node.name.length, 4) + 2}ch`,
        },
        nodeCount: {
          color: "#8b949e",
          fontFamily: "inherit",
        },
        textName: {
          color: node.type === "text" ? "#0969da" : "#8250df",
          fontFamily: "inherit",
          flexShrink: 0,
        },
        valueInput: {
          ...editorInputSx,
          flex: 1,
          minWidth: 120,
        },
        actions: {
          width: "auto",
          justifyContent: "flex-end",
          opacity: 0,
          transition: "opacity 120ms ease",
        },
        actionIcon: {
          fontSize: 16,
        },
        iconButton: {
          width: 28,
          minWidth: 28,
          height: 28,
          p: 0.5,
          borderColor: "transparent",
          "&:hover": {
            borderColor: "#c8d0d8",
          },
        },
        editBox: {
          pl: `${(level + 1) * 18 + 8}px`,
          pr: 1,
          py: 1,
          background: "#f6f8fa",
          border: "1px solid #d8dee4",
          borderRadius: 1,
          my: 0.5,
        },
        editInput: {
          maxHeight: "none",
          "& textarea": {
            fontFamily: "Consolas, monospace",
            fontSize: 12,
            lineHeight: 1.45,
          },
        },
        editActions: {
          justifyContent: "flex-end",
          mt: 1,
        },
        textButton: {
          minWidth: 64,
          textTransform: "none",
        },
        attributes: {
          py: 0.25,
        },
        attributeRow: {
          display: "grid",
          gridTemplateColumns: "22px auto 12px minmax(0, 1fr) auto",
          alignItems: "center",
          gap: 0.5,
          minHeight: 30,
          pl: `${(level + 1) * 18 + 8}px`,
          pr: 0.75,
          fontFamily: "Consolas, monospace",
          fontSize: 13,
          borderRadius: 0.75,
          "&:hover": {
            background: "#f4f7fb",
          },
          "&:hover .xml-attribute-actions": {
            opacity: 1,
          },
          "&:focus-within .xml-attribute-actions": {
            opacity: 1,
          },
        },
        attributeNameInput: (attributeName: string) => {
          return {
            ...editorInputSx,
            width: `${max(attributeName.length + 1, 5) + 2}ch`,
            "& .MuiInputBase-input": {
              color: "#116329",
              px: 0.5,
              py: 0.25,
            },
          };
        },
        attributeSeparator: {
          color: "#8b949e",
          fontFamily: "inherit",
        },
        attributeValueInput: {
          ...editorInputSx,
          minWidth: 80,
        },
        attributeDeleteButton: {
          opacity: 0,
          transition: "opacity 120ms ease",
        },
        attributeDelete: {
          width: 28,
          minWidth: 28,
          height: 28,
          p: 0.5,
          borderColor: "transparent",
          opacity: 0,
          transition: "opacity 120ms ease",
          "&:hover": {
            borderColor: "#c8d0d8",
          },
        },
      };
    }, [canExpand, level, node.name, node.type]);

    const handleToggle = React.useCallback(() => {
      onToggle(node.id);
    }, [node.id, onToggle]);

    const handleNameChange = React.useCallback(
      (value: string) => {
        onChange(node.id, {
          name: value,
        });
      },
      [node.id, onChange]
    );

    const handleValueChange = React.useCallback(
      (value: string) => {
        onChange(node.id, {
          value,
        });
      },
      [node.id, onChange]
    );

    const handleAddElement = React.useCallback(() => {
      onAddChild(node.id, createElementNode({}));
    }, [node.id, onAddChild]);

    const handleAddText = React.useCallback(() => {
      onAddChild(
        node.id,
        createElementNode({
          name: "#text",
          type: "text",
          value: "text",
        })
      );
    }, [node.id, onAddChild]);

    const handleAddAttribute = React.useCallback(() => {
      onChange(node.id, addAttribute(node));
    }, [node, onChange]);

    const handleOpenEditXML = React.useCallback(() => {
      try {
        setEditValue(serializeXML(node));
        setEditError(undefined);
        setEditingXML(true);
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }, [node, onError]);

    const handleCloseEditXML = React.useCallback(() => {
      setEditingXML(false);
      setEditError(undefined);
    }, []);

    const handleEditValueChange = React.useCallback((value: string) => {
      setEditValue(value);
      setEditError(undefined);
    }, []);

    const handleSaveEditXML = React.useCallback(() => {
      const parsed = parseXMLTree(editValue);

      if (parsed.error || !parsed.result) {
        const error = parsed.error ?? new Error("XML is invalid.");

        setEditError(error.message);
        onError(error);

        return;
      }

      onReplace(node.id, parsed.result);
      setEditingXML(false);
      setEditError(undefined);
    }, [editValue, node.id, onError, onReplace]);

    const handleDelete = React.useCallback(() => {
      onDelete(node.id);
    }, [node.id, onDelete]);

    const handleEditKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          handleCloseEditXML();
        } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          handleSaveEditXML();
        }
      },
      [handleCloseEditXML, handleSaveEditXML]
    );

    const attributeHandlers = React.useMemo(() => {
      return {
        changeDisplayName: (attributeId: string) => {
          return (value: string): void => {
            onChange(node.id, {
              attributes: node.attributes.map((attribute) => {
                return attribute.id === attributeId
                  ? {
                      ...attribute,
                      name: value.replace(/^@/, ""),
                    }
                  : attribute;
              }),
            });
          };
        },
        changeValue: (attributeId: string) => {
          return (value: string): void => {
            onChange(node.id, {
              attributes: node.attributes.map((attribute) => {
                return attribute.id === attributeId
                  ? {
                      ...attribute,
                      value,
                    }
                  : attribute;
              }),
            });
          };
        },
        delete: (attributeId: string) => {
          return (): void => {
            onChange(node.id, {
              attributes: node.attributes.filter((attribute) => {
                return attribute.id !== attributeId;
              }),
            });
          };
        },
      };
    }, [node.id, node.attributes, onChange]);

    return (
      <Box>
        <Box sx={styles.row}>
          <IconButton
            size={"small"}
            disabled={!canExpand}
            onClick={handleToggle}
            sx={styles.caretButton}
          >
            {isExpanded ? (
              <KeyboardArrowDown fontSize="small" />
            ) : (
              <KeyboardArrowRight fontSize="small" />
            )}
          </IconButton>

          <Stack direction={"row"} spacing={0.5} sx={styles.content}>
            {isElement ? (
              <>
                <Typography sx={styles.tagToken}>{"<"}</Typography>

                <TextInput
                  size={"small"}
                  value={node.name}
                  onChange={handleNameChange}
                  sx={styles.tagInput}
                />

                <Typography sx={styles.tagToken}>
                  {node.childrens.length ? ">" : "/>"}
                </Typography>

                {node.childrens.length > 0 && (
                  <Typography sx={styles.nodeCount}>
                    {`${node.childrens.length} item${
                      node.childrens.length > 1 ? "s" : ""
                    }`}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography sx={styles.textName}>{node.name}:</Typography>

                <TextInput
                  size={"small"}
                  value={node.value}
                  onChange={handleValueChange}
                  multiline={node.value.length > 72}
                  sx={styles.valueInput}
                />
              </>
            )}
          </Stack>

          <Stack
            className="xml-node-actions"
            direction={"row"}
            spacing={0.25}
            sx={styles.actions}
          >
            {isElement && (
              <>
                <TooltipButton
                  title="Sua"
                  icon={<Edit sx={styles.actionIcon} />}
                  onClick={handleOpenEditXML}
                  sx={styles.iconButton}
                />

                <TooltipButton
                  title="Them attribute"
                  icon={<Code sx={styles.actionIcon} />}
                  onClick={handleAddAttribute}
                  sx={styles.iconButton}
                />

                <TooltipButton
                  title="Add child element"
                  icon={<Add sx={styles.actionIcon} />}
                  onClick={handleAddElement}
                  sx={styles.iconButton}
                />

                <TooltipButton
                  title="Add text node"
                  icon={<TextFields sx={styles.actionIcon} />}
                  onClick={handleAddText}
                  sx={styles.iconButton}
                />
              </>
            )}

            <TooltipButton
              title="Xoa node"
              icon={<Delete sx={styles.actionIcon} />}
              disabled={node.id === rootId}
              color="error"
              onClick={handleDelete}
              sx={styles.iconButton}
            />
          </Stack>
        </Box>

        {isElement && editingXML && (
          <Box sx={styles.editBox}>
            <TextInput
              value={editValue}
              onChange={handleEditValueChange}
              onKeyDown={handleEditKeyDown}
              minRows={min(max(node.childrens.length + 2, 4), 12)}
              autoFocus
              error={!!editError}
              helperText={editError}
              sx={styles.editInput}
            />

            <Stack direction={"row"} spacing={1} sx={styles.editActions}>
              <TooltipButton
                size={"small"}
                variant={"outlined"}
                onClick={handleCloseEditXML}
                sx={styles.textButton}
              >
                Cancel
              </TooltipButton>

              <TooltipButton
                size={"small"}
                variant="contained"
                onClick={handleSaveEditXML}
                sx={styles.textButton}
              >
                Save
              </TooltipButton>
            </Stack>
          </Box>
        )}

        {isElement && node.attributes.length > 0 && (
          <Stack spacing={0.25} sx={styles.attributes}>
            {node.attributes.map((attribute) => {
              return (
                <Box key={attribute.id} sx={styles.attributeRow}>
                  <Box />

                  <TextInput
                    size={"small"}
                    value={`@${attribute.name}`}
                    onChange={attributeHandlers.changeDisplayName(attribute.id)}
                    sx={styles.attributeNameInput(attribute.name)}
                  />

                  <Typography sx={styles.attributeSeparator}>:</Typography>

                  <TextInput
                    size={"small"}
                    value={attribute.value}
                    onChange={attributeHandlers.changeValue(attribute.id)}
                    sx={styles.attributeValueInput}
                  />

                  <TooltipButton
                    title="Xoa attribute"
                    icon={<Delete sx={styles.actionIcon} />}
                    className="xml-attribute-actions"
                    size={"small"}
                    color="error"
                    onClick={attributeHandlers.delete(attribute.id)}
                    sx={styles.attributeDelete}
                  />
                </Box>
              );
            })}
          </Stack>
        )}

        {isElement &&
          isExpanded &&
          node.childrens.map((childNode) => {
            return (
              <XMLTreeRow
                key={childNode.id}
                node={childNode}
                level={level + 1}
                rootId={rootId}
                lastUpdated={lastUpdated}
                expanded={expanded}
                onToggle={onToggle}
                onChange={onChange}
                onReplace={onReplace}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onError={onError}
              />
            );
          })}
      </Box>
    );
  }
);

/** Renders the XMLEditor component. */
export const XMLEditor = React.memo(
  ({
    value = INITIAL_XML,
    onChange,
    onError,
    onNew,
    title = "XML Editor",
    headerExtra,
    embedded = false,
  }: XMLEditorProps): React.JSX.Element => {
    const initialParsed = React.useMemo(() => {
      return parseXMLTree(value);
    }, []);
    const initialRoot = React.useMemo(() => {
      return (
        initialParsed.result ??
        createElementNode({
          name: "root",
        })
      );
    }, []);
    const [sourceValue, setSourceValue] = React.useState(value);
    const rootRef = React.useRef<XMLTreeNode>(initialRoot);
    const lastEmittedValueRef = React.useRef<string>(value);
    const [lastUpdated, setLastUpdated] = React.useState<number>(0);
    const [parseError, setParseError] = React.useState<string>(
      initialParsed.error?.message
    );
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const [sourcePaneWidthPx, setSourcePaneWidthPx] = React.useState(
      DEFAULT_SOURCE_PANE_WIDTH_PX
    );
    const [isResizing, setIsResizing] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(undefined);
    const resizeCleanupRef = React.useRef<() => void>(undefined);
    const skipSourceSyncRef = React.useRef<boolean>(false);
    const root = rootRef.current;

    const commitRoot = React.useCallback(
      (nextRoot: XMLTreeNode, nextSource?: string): void => {
        const emittedSource = nextSource ?? serializeXML(nextRoot);

        rootRef.current = nextRoot;
        lastEmittedValueRef.current = emittedSource;
        setLastUpdated((currentLastUpdated) => {
          return currentLastUpdated + 1;
        });
        onChange?.(emittedSource);
      },
      [onChange]
    );

    const touchRoot = React.useCallback((): void => {
      try {
        const nextSource = serializeXML(rootRef.current);

        lastEmittedValueRef.current = nextSource;
        setLastUpdated((currentLastUpdated) => {
          return currentLastUpdated + 1;
        });
        setParseError(undefined);
        onChange?.(nextSource);
      } catch (error) {
        onError?.(
          error instanceof Error ? error : new Error(String(error)),
          "node"
        );
      }
    }, [onChange, onError]);

    React.useEffect(() => {
      if (initialParsed.error) {
        onError?.(initialParsed.error, "source");
      }
    }, [onError]);

    React.useEffect(() => {
      if (value === lastEmittedValueRef.current) {
        return;
      }

      const parsed = parseXMLTree(value);

      if (parsed.error || !parsed.result) {
        onError?.(parsed.error ?? new Error("XML is invalid."), "source");
        return;
      }

      rootRef.current = parsed.result;
      lastEmittedValueRef.current = value;
      skipSourceSyncRef.current = true;
      setSourceValue(value);
      setParseError(undefined);
      setExpanded({});
      setLastUpdated((currentLastUpdated) => {
        return currentLastUpdated + 1;
      });
    }, [onError, value]);

    React.useEffect(() => {
      if (skipSourceSyncRef.current) {
        skipSourceSyncRef.current = false;

        return;
      }

      const timeoutId = setTimeout(() => {
        const nextSourceValue = serializeXML(rootRef.current);

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

    const handleResizeStart = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>): void => {
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

    const handleSplitterKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
          return;
        }

        event.preventDefault();
        const direction = event.key === "ArrowLeft" ? -1 : 1;

        setSourcePaneWidthPx((currentWidth) => {
          return clampSourcePaneWidthPx(currentWidth + direction * 24);
        });
      },
      [clampSourcePaneWidthPx]
    );

    React.useEffect(() => {
      return () => {
        resizeCleanupRef.current?.();
      };
    }, []);

    const handleSourceChange = React.useCallback(
      (nextValue: string) => {
        const parsed = parseXMLTree(nextValue);

        setSourceValue(nextValue);

        if (parsed.error || !parsed.result) {
          const error = parsed.error ?? new Error("XML is invalid.");

          setParseError(error.message);
          onError?.(error, "source");

          return;
        }

        setParseError(undefined);
        skipSourceSyncRef.current = true;
        commitRoot(parsed.result, nextValue);
        setExpanded({});
      },
      [commitRoot, onError]
    );

    const handleNodeChange = React.useCallback(
      (nodeId: string, patch: XMLTreeNode) => {
        if (updateNode(rootRef.current, nodeId, patch)) {
          touchRoot();
        }
      },
      [touchRoot]
    );

    const handleNodeReplace = React.useCallback(
      (nodeId: string, nextNode: XMLTreeNode) => {
        if (replaceNode(rootRef.current, nodeId, nextNode)) {
          touchRoot();
        }
      },
      [touchRoot]
    );

    const handleAddChild = React.useCallback(
      (nodeId: string, child: XMLTreeNode) => {
        if (!addChildNode(rootRef.current, nodeId, child)) {
          return;
        }

        touchRoot();
        setExpanded((currentExpanded) => {
          return {
            ...currentExpanded,
            [nodeId]: true,
          };
        });
      },
      [touchRoot]
    );

    const handleDelete = React.useCallback(
      (nodeId: string) => {
        if (
          rootRef.current.id !== nodeId &&
          deleteNode(rootRef.current, nodeId)
        ) {
          touchRoot();
        }
      },
      [touchRoot]
    );

    const handleToggle = React.useCallback((nodeId: string) => {
      setExpanded((currentExpanded) => {
        return {
          ...currentExpanded,
          [nodeId]: !(currentExpanded[nodeId] ?? true),
        };
      });
    }, []);

    const handleCreateEmpty = React.useCallback(() => {
      const nextRoot = createElementNode({
        name: "root",
      });
      const nextValue = serializeXML(nextRoot);

      skipSourceSyncRef.current = true;
      commitRoot(nextRoot, nextValue);
      setSourceValue(nextValue);
      setParseError(undefined);
      setExpanded({});
      onNew?.(nextValue);
    }, [commitRoot, onNew]);

    const handleNodeError = React.useCallback(
      (error: Error): void => {
        onError?.(error, "node");
      },
      [onError]
    );

    const nodeCount = React.useMemo(() => {
      return countXMLNodes(root);
    }, [lastUpdated]);

    const styles = React.useMemo(() => {
      return {
        root: {
          width: embedded ? "100%" : "100vw",
          height: embedded ? "100%" : "100vh",
          display: "grid",
          gridTemplateRows: "minmax(48px, auto) 1fr",
          overflow: "hidden",
          background: WHITE_COLOR,
          color: "#24292f",
        },
        header: {
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          borderBottom: "1px solid #d8dee4",
          background: "#f6f8fa",
          gap: 1,
          flexWrap: "wrap",
        },
        titleText: {
          fontWeight: 700,
          fontSize: 15,
        },
        headerIconButton: {
          width: 28,
          minWidth: 28,
          height: 28,
          p: 0.5,
          borderColor: "transparent",
          "&:hover": {
            borderColor: "#c8d0d8",
          },
        },
        content: {
          display: "grid",
          gridTemplateColumns: `${sourcePaneWidthPx}px ${SPLITTER_WIDTH_PX}px minmax(${MIN_TREE_PANE_WIDTH_PX}px, 1fr)`,
          minHeight: 0,
          minWidth: 0,
          "@media (max-width: 47.5rem)": {
            gridTemplateColumns: "1fr",
            gridTemplateRows: "minmax(17rem, 48%) 1fr",
          },
        },
        sourcePane: {
          minHeight: 0,
          background: "#f6f8fa",
          p: 1,
        },
        sourceInputContainer: {
          flex: 1,
          minHeight: 0,
          display: "flex",
        },
        splitter: {
          position: "relative",
          minHeight: 0,
          cursor: "col-resize",
          background: isResizing ? "#cfe3ff" : "#e1e8f1",
          transition: "background 120ms ease",
          "&:hover, &:focus-visible": {
            background: "#dbeafe",
            outline: "none",
          },
          "&::before": {
            content: '\"\"',
            position: "absolute",
            insetBlock: 0,
            left: "50%",
            width: "0.125rem",
            transform: "translateX(-50%)",
            background: isResizing ? "#0b66c3" : "#b8c5d5",
          },
          "@media (max-width: 47.5rem)": {
            display: "none",
          },
        },
        paneTitle: {
          fontWeight: 700,
          fontSize: 13,
        },
        error: {
          alignItems: "center",
        },
        sourceInput: {
          flex: 1,
          height: "100%",
          maxHeight: "none",
          minHeight: 0,
          "& .MuiInputBase-root": {
            height: "100%",
            alignItems: "flex-start",
          },
          "& textarea": {
            height: "100% !important",
            overflow: "auto !important",
            fontFamily: "Consolas, monospace",
            fontSize: 12,
            lineHeight: 1.45,
          },
        },
        treePane: {
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          background: WHITE_COLOR,
        },
        treeHeader: {
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          borderBottom: "1px solid #d8dee4",
        },
        treeMeta: {
          fontSize: 12,
          color: "#57606a",
        },
        treeScroll: {
          overflow: "auto",
          minHeight: 0,
          p: 1,
        },
      };
    }, [embedded, isResizing, sourcePaneWidthPx]);

    return (
      <Box sx={styles.root}>
        <Stack direction={"row"} sx={styles.header}>
          <Typography sx={styles.titleText}>{title}</Typography>

          <Stack direction={"row"} spacing={1}>
            {headerExtra}

            <TooltipButton
              title="New"
              icon={<Add fontSize="small" />}
              onClick={handleCreateEmpty}
              sx={styles.headerIconButton}
            />
          </Stack>
        </Stack>

        <Box ref={contentRef} sx={styles.content}>
          <Stack spacing={1} sx={styles.sourcePane}>
            <Typography sx={styles.paneTitle}>Source XML</Typography>

            <SnackbarAlert
              open={!!parseError}
              severity="error"
              message={parseError}
              sx={styles.error}
            />

            <Box sx={styles.sourceInputContainer}>
              <TextInput
                value={sourceValue}
                onChange={handleSourceChange}
                sx={styles.sourceInput}
              />
            </Box>
          </Stack>

          <Box
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize XML source and tree panels"
            aria-valuenow={sourcePaneWidthPx}
            aria-valuemin={MIN_SOURCE_PANE_WIDTH_PX}
            tabIndex={0}
            onPointerDown={handleResizeStart}
            onKeyDown={handleSplitterKeyDown}
            sx={styles.splitter}
          />

          <Stack sx={styles.treePane}>
            <Stack direction={"row"} sx={styles.treeHeader}>
              <Typography sx={styles.paneTitle}>Tree</Typography>

              <Typography sx={styles.treeMeta}>
                {`${root?.name} · ${nodeCount.toLocaleString()} nodes`}
              </Typography>
            </Stack>

            <Box sx={styles.treeScroll}>
              {root && (
                <XMLTreeRow
                  node={root}
                  level={0}
                  rootId={root.id}
                  lastUpdated={lastUpdated}
                  expanded={expanded}
                  onToggle={handleToggle}
                  onChange={handleNodeChange}
                  onReplace={handleNodeReplace}
                  onAddChild={handleAddChild}
                  onDelete={handleDelete}
                  onError={handleNodeError}
                />
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }
);
