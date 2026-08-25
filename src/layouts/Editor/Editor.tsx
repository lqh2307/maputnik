import { AppTheme } from "../../components/AppTheme";
import { TooltipButton } from "../../components/TooltipButton";
import { CodeEditor } from "../CodeEditor";
import { BottomBar } from "../BottomBar";
import { RightBar } from "../RightBar";
import { LeftBar } from "../LeftBar";
import { Canvas } from "../Canvas";
import { Box } from "@mui/material";
import { Dialog } from "../Dialog";
import { useElementResize } from "../../hooks";
import { DEFAULT_VIEWPORT_HEIGHT, DEFAULT_VIEWPORT_WIDTH } from "../../configs";
import { WindowSide } from "../../types/Common";
import { max, min } from "../../utils/Number";
import { useTranslation } from "react-i18next";
import { FaChevronUp } from "react-icons/fa";
import { TopBar } from "../TopBar";
import React from "react";
import {
  useMapModeStore,
  useDialogStore,
  useGlobalStore,
  useThemeStore,
} from "../../stores";

type EditorBarSizes = Record<WindowSide, number>;
type EditorBarConfig = {
  horizontal: boolean;
  pointerDirection: 1 | -1;
  oppositeSide: WindowSide;
  canvasSize: number;
  keyDirections: Partial<Record<string, 1 | -1>>;
};

const CANVAS_WIDTH: number = 300;
const CANVAS_HEIGHT: number = 200;
const RESIZE_HANDLE_SIZE: number = 8;
const RESIZE_KEY_STEP: number = 16;

const EDITOR_BAR_SIZE_PROPERTY: Record<WindowSide, string> = {
  top: "--editor-top-bar-size",
  right: "--editor-right-bar-size",
  bottom: "--editor-bottom-bar-size",
  left: "--editor-left-bar-size",
};

const DEFAULT_SIZES: EditorBarSizes = {
  top: 50,
  right: 320,
  bottom: 28,
  left: 260,
};

const MIN_SIZES: EditorBarSizes = {
  top: 50,
  right: 320,
  bottom: 28,
  left: 260,
};

const EDITOR_BAR_CONFIG: Record<WindowSide, EditorBarConfig> = {
  top: {
    horizontal: false,
    pointerDirection: 1,
    oppositeSide: "bottom",
    canvasSize: CANVAS_HEIGHT,
    keyDirections: {
      ArrowUp: -1,
      ArrowDown: 1,
    },
  },
  right: {
    horizontal: true,
    pointerDirection: -1,
    oppositeSide: "left",
    canvasSize: CANVAS_WIDTH,
    keyDirections: {
      ArrowLeft: 1,
      ArrowRight: -1,
    },
  },
  bottom: {
    horizontal: false,
    pointerDirection: -1,
    oppositeSide: "top",
    canvasSize: CANVAS_HEIGHT,
    keyDirections: {
      ArrowUp: 1,
      ArrowDown: -1,
    },
  },
  left: {
    horizontal: true,
    pointerDirection: 1,
    oppositeSide: "right",
    canvasSize: CANVAS_WIDTH,
    keyDirections: {
      ArrowLeft: -1,
      ArrowRight: 1,
    },
  },
};

const EDITOR_BAR_SIDES: WindowSide[] = ["top", "right", "bottom", "left"];

/** Renders the complete Maputnik editing workspace layout. */
export const Editor = React.memo((): React.JSX.Element => {
  const themeMode = useThemeStore((state) => {
    return state.themeMode;
  });

  const code = useDialogStore((state) => {
    return state.code;
  });

  const { t } = useTranslation();

  const [barSizes, setBarSizes] = React.useState<EditorBarSizes>(() => {
    return {
      ...DEFAULT_SIZES,
    };
  });
  const expandedBarSizesRef = React.useRef<EditorBarSizes>({
    ...DEFAULT_SIZES,
  });
  const barSizesRef = React.useRef<EditorBarSizes>(barSizes);
  const editorRef = React.useRef<HTMLDivElement>(undefined);
  const resizeCleanupRef = React.useRef<() => void>(undefined);

  barSizesRef.current = barSizes;

  const topBarHeight = barSizes.top;
  const rightBarWidth = barSizes.right;
  const bottomBarHeight = barSizes.bottom;
  const leftBarWidth = barSizes.left;

  const resizeHandler = React.useMemo(() => {
    return {
      getMaxBarSize: (side: WindowSide, sizes: EditorBarSizes): number => {
        const { horizontal, oppositeSide, canvasSize } =
          EDITOR_BAR_CONFIG[side];
        const editorSize: number = horizontal
          ? editorRef.current?.clientWidth || DEFAULT_VIEWPORT_WIDTH
          : editorRef.current?.clientHeight || DEFAULT_VIEWPORT_HEIGHT;

        return max(0, editorSize - sizes[oppositeSide] - canvasSize);
      },
      resizeBar: (
        side: WindowSide,
        nextSize: number,
        allowCollapse = false
      ): void => {
        setBarSizes((currentSizes) => {
          const minSize = MIN_SIZES[side];
          const maxSize = max(
            minSize,
            resizeHandler.getMaxBarSize(side, currentSizes)
          );
          const size =
            allowCollapse && nextSize <= 0
              ? 0
              : min(max(nextSize, minSize), maxSize);

          if (size > 0) {
            expandedBarSizesRef.current[side] = size;
          }

          if (size === currentSizes[side]) {
            return currentSizes;
          }

          return {
            ...currentSizes,
            [side]: size,
          };
        });
      },
      resizeEditor: (entry?: ResizeObserverEntry): void => {
        const width: number =
          entry?.contentRect.width || DEFAULT_VIEWPORT_WIDTH;
        const height: number =
          entry?.contentRect.height || DEFAULT_VIEWPORT_HEIGHT;

        setBarSizes((sizes) => {
          const availableWidth = max(0, width - CANVAS_WIDTH);
          const availableHeight = max(0, height - CANVAS_HEIGHT);
          const right = min(sizes.right, availableWidth);
          const left = min(sizes.left, availableWidth - right);
          const bottom = min(sizes.bottom, availableHeight);
          const top = min(sizes.top, availableHeight - bottom);

          if (
            top === sizes.top &&
            right === sizes.right &&
            bottom === sizes.bottom &&
            left === sizes.left
          ) {
            return sizes;
          }

          return {
            top,
            right,
            bottom,
            left,
          };
        });
      },
    };
  }, []);

  const barHandler = React.useMemo(() => {
    return {
      collapse: (side: WindowSide): (() => void) => {
        return () => {
          const currentSize: number = barSizesRef.current[side];

          resizeHandler.resizeBar(
            side,
            currentSize ? 0 : expandedBarSizesRef.current[side],
            Boolean(currentSize)
          );
        };
      },
      createResizeStart: (
        side: WindowSide
      ): ((event: React.PointerEvent<HTMLDivElement>) => void) => {
        return (event) => {
          event.preventDefault();
          resizeCleanupRef.current?.();

          const resizeHandle: HTMLDivElement = event.currentTarget;
          resizeHandle.dataset.resizing = "true";

          const startSize: number = barSizesRef.current[side];
          const {
            horizontal,
            pointerDirection,
            oppositeSide,
            canvasSize,
          }: EditorBarConfig = EDITOR_BAR_CONFIG[side];
          const editorSize: number = horizontal
            ? editorRef.current?.clientWidth || DEFAULT_VIEWPORT_WIDTH
            : editorRef.current?.clientHeight || DEFAULT_VIEWPORT_HEIGHT;
          const minSize: number = MIN_SIZES[side];
          const maxSize: number = max(
            minSize,
            editorSize - barSizesRef.current[oppositeSide] - canvasSize
          );
          const startPointer: number = horizontal
            ? event.clientX
            : event.clientY;
          let pendingPointer: number = startPointer;
          let appliedSize: number = startSize;
          let animationFrameId: number;

          const flushResize = (): void => {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = undefined;

            const pendingSize: number = min(
              max(
                startSize + (pendingPointer - startPointer) * pointerDirection,
                minSize
              ),
              maxSize
            );

            if (pendingSize === appliedSize) {
              return;
            }

            appliedSize = pendingSize;
            const delta: number = pendingSize - startSize;
            const transform: string = horizontal
              ? `translateX(${side === "left" ? delta : -delta}px)`
              : `translateY(${side === "top" ? delta : -delta}px)`;

            // Keep the map container stable while dragging. MapLibre performs
            // an expensive WebGL resize whenever its container changes size.
            resizeHandle.style.transform = transform;
          };

          const handlePointerMove = (moveEvent: PointerEvent): void => {
            pendingPointer = horizontal ? moveEvent.clientX : moveEvent.clientY;

            if (animationFrameId === undefined) {
              animationFrameId = requestAnimationFrame(flushResize);
            }
          };

          const handlePointerUp = (): void => {
            flushResize();
            resizeHandler.resizeBar(side, appliedSize);
            resizeCleanupRef.current?.();
          };

          resizeCleanupRef.current = (): void => {
            cancelAnimationFrame(animationFrameId);
            resizeHandle.removeAttribute("data-resizing");
            resizeHandle.style.transform = "";
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            removeEventListener("pointermove", handlePointerMove);
            removeEventListener("pointerup", handlePointerUp);
            removeEventListener("pointercancel", handlePointerUp);
            resizeCleanupRef.current = undefined;
          };

          document.body.style.cursor = horizontal ? "col-resize" : "row-resize";
          document.body.style.userSelect = "none";
          addEventListener("pointermove", handlePointerMove);
          addEventListener("pointerup", handlePointerUp, {
            once: true,
          });
          addEventListener("pointercancel", handlePointerUp, {
            once: true,
          });
        };
      },
      createResizeKeyDown: (
        side: WindowSide
      ): ((event: React.KeyboardEvent<HTMLDivElement>) => void) => {
        return (event) => {
          const direction = EDITOR_BAR_CONFIG[side].keyDirections[event.key];

          if (!direction) {
            return;
          }

          event.preventDefault();
          resizeHandler.resizeBar(
            side,
            barSizesRef.current[side] + direction * RESIZE_KEY_STEP
          );
        };
      },
    };
  }, [resizeHandler]);

  const toggleHandlers = React.useMemo(() => {
    return {
      top: barHandler.collapse("top"),
      right: barHandler.collapse("right"),
      bottom: barHandler.collapse("bottom"),
      left: barHandler.collapse("left"),
    };
  }, [barHandler]);

  const resizeHandleHandlers = React.useMemo(() => {
    return {
      top: {
        pointerDown: barHandler.createResizeStart("top"),
        keyDown: barHandler.createResizeKeyDown("top"),
      },
      right: {
        pointerDown: barHandler.createResizeStart("right"),
        keyDown: barHandler.createResizeKeyDown("right"),
      },
      bottom: {
        pointerDown: barHandler.createResizeStart("bottom"),
        keyDown: barHandler.createResizeKeyDown("bottom"),
      },
      left: {
        pointerDown: barHandler.createResizeStart("left"),
        keyDown: barHandler.createResizeKeyDown("left"),
      },
    };
  }, [barHandler]);

  useElementResize(editorRef, resizeHandler.resizeEditor);

  React.useEffect(() => {
    return () => {
      resizeCleanupRef.current?.();
    };
  }, []);

  const handler = React.useMemo(() => {
    return {
      keyDown: (event: KeyboardEvent): void => {
        const state = useGlobalStore.getState();
        const mapModeState = useMapModeStore.getState();
        const dialogState = useDialogStore.getState();
        const modifier = event.ctrlKey || event.metaKey;
        const target = event.target as HTMLElement;
        const isEditing =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        const key = event.key.toLowerCase();
        const dialogOpen = Object.values(dialogState).some((value) => {
          return value === true;
        });
        const workspaceActive = !dialogOpen;

        if (!isEditing && modifier && key === "z") {
          event.preventDefault();
          event.shiftKey ? state.redo() : state.undo();
        } else if (!isEditing && modifier && key === "y") {
          event.preventDefault();
          state.redo();
        } else if (modifier && key === "o") {
          event.preventDefault();
          dialogState.updateDialog({
            open: true,
          });
        } else if (modifier && key === "s") {
          event.preventDefault();
          dialogState.updateDialog({
            export: true,
          });
        } else if (modifier && key === "e") {
          event.preventDefault();
          dialogState.updateDialog({
            code: !dialogState.code,
          });
        } else if (
          workspaceActive &&
          !isEditing &&
          modifier &&
          key === "c" &&
          state.selectedLayerId
        ) {
          event.preventDefault();
          state.copyLayer(state.selectedLayerId);
        } else if (workspaceActive && !isEditing && modifier && key === "v") {
          event.preventDefault();
          state.pasteLayer();
        } else if (
          workspaceActive &&
          !isEditing &&
          modifier &&
          key === "d" &&
          state.selectedLayerId
        ) {
          event.preventDefault();
          state.duplicateLayer(state.selectedLayerId);
        } else if (event.key === "Escape" && dialogState.code === true) {
          dialogState.updateDialog({
            code: false,
          });
        } else if (
          workspaceActive &&
          !isEditing &&
          event.key === "Delete" &&
          state.selectedLayerId
        ) {
          state.deleteLayer(state.selectedLayerId);
        } else if (workspaceActive && !isEditing && key === "i") {
          mapModeState.setMapMode(
            mapModeState.mapMode === "inspect" ? "map" : "inspect"
          );
        }
      },
    };
  }, []);

  const styles = React.useMemo(() => {
    return {
      wrapEditor: {
        [EDITOR_BAR_SIZE_PROPERTY.top]: `${topBarHeight}px`,
        [EDITOR_BAR_SIZE_PROPERTY.right]: `${rightBarWidth}px`,
        [EDITOR_BAR_SIZE_PROPERTY.bottom]: `${bottomBarHeight}px`,
        [EDITOR_BAR_SIZE_PROPERTY.left]: `${leftBarWidth}px`,
        display: "grid",
        position: "relative",
        padding: 0,
        margin: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        gridTemplateRows: `var(${EDITOR_BAR_SIZE_PROPERTY.top}) minmax(${CANVAS_HEIGHT}px, 1fr) var(${EDITOR_BAR_SIZE_PROPERTY.bottom})`,
        gridTemplateColumns: `var(${EDITOR_BAR_SIZE_PROPERTY.left}) minmax(${CANVAS_WIDTH}px, 1fr) var(${EDITOR_BAR_SIZE_PROPERTY.right})`,
        gridTemplateAreas: `
          "top top top"
          "left canvas right"
          "left bottom right"
        `,
      },
      wrapCanvas: {
        gridArea: "canvas",
        position: "relative",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      },
      wrapTopBar: {
        gridArea: "top",
        minWidth: 0,
        overflowX: "auto",
        overflowY: "hidden",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        borderBottom: 1,
        borderColor: "divider",
        display: topBarHeight ? "flex" : "none",
      },
      wrapBottomBar: {
        gridArea: "bottom",
        minWidth: 0,
        overflowX: "auto",
        overflowY: "hidden",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        borderTop: 1,
        borderColor: "divider",
        display: bottomBarHeight ? "flex" : "none",
      },
      wrapLeftBar: {
        gridArea: "left",
        minWidth: 0,
        overflowX: "hidden",
        overflowY: "auto",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        borderRight: 1,
        borderColor: "divider",
        display: leftBarWidth ? "flex" : "none",
      },
      wrapRightBar: {
        gridArea: "right",
        minWidth: 0,
        overflowX: "hidden",
        overflowY: "auto",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        borderLeft: 1,
        borderColor: "divider",
        display: rightBarWidth ? "flex" : "none",
      },
      topResizeHandle: {
        zIndex: 2,
        position: "absolute",
        top: `calc(var(${EDITOR_BAR_SIZE_PROPERTY.top}) - ${RESIZE_HANDLE_SIZE / 2}px)`,
        left: 0,
        right: 0,
        height: RESIZE_HANDLE_SIZE,
        cursor: "row-resize",
        display: topBarHeight ? "block" : "none",
        touchAction: "none",
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 2,
          transform: "translateY(-50%)",
          backgroundColor: "divider",
        },
        '&:hover::after, &[data-resizing="true"]::after': {
          backgroundColor: "primary.main",
        },
      },
      bottomResizeHandle: {
        zIndex: 2,
        position: "absolute",
        bottom: `calc(var(${EDITOR_BAR_SIZE_PROPERTY.bottom}) - ${RESIZE_HANDLE_SIZE / 2}px)`,
        left: `var(${EDITOR_BAR_SIZE_PROPERTY.left})`,
        right: `var(${EDITOR_BAR_SIZE_PROPERTY.right})`,
        height: RESIZE_HANDLE_SIZE,
        cursor: "row-resize",
        display: bottomBarHeight ? "block" : "none",
        touchAction: "none",
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 2,
          transform: "translateY(-50%)",
          backgroundColor: "divider",
        },
        '&:hover::after, &[data-resizing="true"]::after': {
          backgroundColor: "primary.main",
        },
      },
      leftResizeHandle: {
        zIndex: 2,
        position: "absolute",
        top: `var(${EDITOR_BAR_SIZE_PROPERTY.top})`,
        bottom: 0,
        left: `calc(var(${EDITOR_BAR_SIZE_PROPERTY.left}) - ${RESIZE_HANDLE_SIZE / 2}px)`,
        width: RESIZE_HANDLE_SIZE,
        cursor: "col-resize",
        display: leftBarWidth ? "block" : "none",
        touchAction: "none",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 2,
          transform: "translateX(-50%)",
          backgroundColor: "divider",
        },
        '&:hover::after, &[data-resizing="true"]::after': {
          backgroundColor: "primary.main",
        },
      },
      rightResizeHandle: {
        zIndex: 2,
        position: "absolute",
        top: `var(${EDITOR_BAR_SIZE_PROPERTY.top})`,
        right: `calc(var(${EDITOR_BAR_SIZE_PROPERTY.right}) - ${RESIZE_HANDLE_SIZE / 2}px)`,
        bottom: 0,
        width: RESIZE_HANDLE_SIZE,
        cursor: "col-resize",
        display: rightBarWidth ? "block" : "none",
        touchAction: "none",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 2,
          transform: "translateX(-50%)",
          backgroundColor: "divider",
        },
        '&:hover::after, &[data-resizing="true"]::after': {
          backgroundColor: "primary.main",
        },
      },
      topBarToggleButton: {
        zIndex: 3,
        position: "absolute",
        top: topBarHeight
          ? `max(4px, calc(var(${EDITOR_BAR_SIZE_PROPERTY.top}) - 9px))`
          : 4,
        right: 4,
        display: "flex",
      },
      topBarToggleIcon: {
        rotate: topBarHeight ? "0deg" : "180deg",
        fontSize: "10px",
      },
      bottomBarToggleButton: {
        zIndex: 3,
        position: "absolute",
        bottom: bottomBarHeight
          ? `max(4px, calc(var(${EDITOR_BAR_SIZE_PROPERTY.bottom}) - 9px))`
          : 4,
        left: `calc(var(${EDITOR_BAR_SIZE_PROPERTY.left}) + 8px)`,
        display: "flex",
      },
      bottomBarToggleIcon: {
        rotate: bottomBarHeight ? "180deg" : "0deg",
        fontSize: "10px",
      },
      leftBarToggleButton: {
        zIndex: 3,
        position: "absolute",
        top: `calc(var(${EDITOR_BAR_SIZE_PROPERTY.top}) + 8px)`,
        left: leftBarWidth
          ? `max(4px, calc(var(${EDITOR_BAR_SIZE_PROPERTY.left}) - 15px))`
          : 4,
        display: "flex",
      },
      leftBarToggleIcon: {
        rotate: leftBarWidth ? "-90deg" : "90deg",
        fontSize: "10px",
      },
      rightBarToggleButton: {
        zIndex: 3,
        position: "absolute",
        bottom: `calc(var(${EDITOR_BAR_SIZE_PROPERTY.bottom}) + 8px)`,
        right: rightBarWidth
          ? `max(4px, calc(var(${EDITOR_BAR_SIZE_PROPERTY.right}) - 15px))`
          : 4,
        display: "flex",
      },
      rightBarToggleIcon: {
        rotate: rightBarWidth ? "90deg" : "-90deg",
        fontSize: "10px",
      },
    };
  }, [bottomBarHeight, leftBarWidth, rightBarWidth, topBarHeight]);

  React.useEffect(() => {
    window.addEventListener("keydown", handler.keyDown);

    return () => {
      return window.removeEventListener("keydown", handler.keyDown);
    };
  }, [handler.keyDown]);

  return (
    <AppTheme theme={themeMode}>
      <Box ref={editorRef} sx={styles.wrapEditor}>
        <Box sx={styles.wrapCanvas}>
          <Canvas />
        </Box>

        <Box sx={styles.wrapTopBar}>
          <TopBar />
        </Box>

        <Box sx={styles.topBarToggleButton}>
          <TooltipButton
            title={t(
              topBarHeight ? "topBar.actions.hide" : "topBar.actions.show"
            )}
            onClick={toggleHandlers.top}
            icon={<FaChevronUp style={styles.topBarToggleIcon} />}
          />
        </Box>

        <Box sx={styles.wrapBottomBar}>
          <BottomBar />
        </Box>

        <Box sx={styles.bottomBarToggleButton}>
          <TooltipButton
            title={t(
              bottomBarHeight ? "topBar.actions.hide" : "topBar.actions.show"
            )}
            onClick={toggleHandlers.bottom}
            icon={<FaChevronUp style={styles.bottomBarToggleIcon} />}
          />
        </Box>

        <Box sx={styles.wrapLeftBar}>{code ? <CodeEditor /> : <LeftBar />}</Box>

        <Box sx={styles.leftBarToggleButton}>
          <TooltipButton
            title={t(
              leftBarWidth ? "topBar.actions.hide" : "topBar.actions.show"
            )}
            onClick={toggleHandlers.left}
            icon={<FaChevronUp style={styles.leftBarToggleIcon} />}
          />
        </Box>

        <Box sx={styles.wrapRightBar}>{!code && <RightBar />}</Box>

        {EDITOR_BAR_SIDES.map((side: WindowSide) => {
          const handlers = resizeHandleHandlers[side];

          return (
            <Box
              key={side}
              role="separator"
              tabIndex={0}
              aria-orientation={
                EDITOR_BAR_CONFIG[side].horizontal ? "vertical" : "horizontal"
              }
              onPointerDown={handlers.pointerDown}
              onKeyDown={handlers.keyDown}
              sx={styles[`${side}ResizeHandle`]}
            />
          );
        })}

        <Box sx={styles.rightBarToggleButton}>
          <TooltipButton
            title={t(
              rightBarWidth ? "topBar.actions.hide" : "topBar.actions.show"
            )}
            onClick={toggleHandlers.right}
            icon={<FaChevronUp style={styles.rightBarToggleIcon} />}
          />
        </Box>

        <Dialog />
      </Box>
    </AppTheme>
  );
});
