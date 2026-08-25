import {
  ContentCopyRounded,
  DeleteOutlineRounded,
  DragIndicatorRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { TooltipButton } from "../../components/TooltipButton";
import { TextInput } from "../../components/TextInput";
import { LayerTypeIcon } from "./LayerTypeIcon";
import { useGlobalStore } from "../../stores";
import { LayerRowProp } from "./Types";
import { useTranslation } from "react-i18next";
import React from "react";

/** Renders one selectable and draggable style layer. */
export const LayerRow = React.memo(
  ({ layer, dragState, setDragState }: LayerRowProp): React.JSX.Element => {
    const { t } = useTranslation();

    const translate = React.useCallback(
      (section: string): string => {
        return t(`topBar.actions.${section}`);
      },
      [t]
    );

    const selected = useGlobalStore((state) => {
      return state.selectedLayerId === layer.id;
    });

    const selectLayer = useGlobalStore((state) => {
      return state.selectLayer;
    });

    const isLayerIdAvailable = useGlobalStore((state) => {
      return state.isLayerIdAvailable;
    });

    const updateLayer = useGlobalStore((state) => {
      return state.updateLayer;
    });

    const deleteLayer = useGlobalStore((state) => {
      return state.deleteLayer;
    });

    const copyLayer = useGlobalStore((state) => {
      return state.copyLayer;
    });

    const clipboardLayerId = useGlobalStore((state) => {
      return state.layerClipboard?.id;
    });

    const toggleVisibility = useGlobalStore((state) => {
      return state.toggleLayerVisibility;
    });

    const moveLayer = useGlobalStore((state) => {
      return state.moveLayer;
    });

    const [editing, setEditing] = React.useState(false);
    const [name, setName] = React.useState(layer.id);

    const hidden = layer.layout?.visibility === "none";
    const isDragging = dragState.activeId === layer.id;
    const isDragOver =
      !!dragState.activeId &&
      dragState.activeId !== layer.id &&
      dragState.overId === layer.id;

    React.useEffect(() => {
      setName(layer.id);
    }, [layer.id]);

    const saveName = React.useCallback(() => {
      const nextName = name.trim();
      if (nextName && isLayerIdAvailable(nextName, layer.id)) {
        updateLayer(layer.id, {
          id: nextName,
        });
      } else {
        setName(layer.id);
      }
      setEditing(false);
    }, [layer.id, name]);

    const styles = React.useMemo(() => {
      return {
        row: {
          minHeight: 38,
          position: "relative",
          px: 0.5,
          display: "flex",
          alignItems: "center",
          borderRadius: 1,
          cursor: isDragging ? "grabbing" : "pointer",
          opacity: isDragging ? 0.38 : 1,
          transform: isDragging ? "scale(0.985)" : "translateX(0)",
          boxShadow: isDragOver ? 2 : 0,
          transition:
            "opacity 140ms ease, transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease",
          color: hidden ? "text.disabled" : "text.primary",
          bgcolor: selected ? "action.selected" : "transparent",
          border: 1,
          borderColor: selected ? "primary.main" : "transparent",
          "&:hover": {
            bgcolor: selected ? "action.selected" : "action.hover",
            transform: isDragging ? "scale(0.985)" : "translateX(2px)",
            boxShadow: isDragging ? 0 : 1,
          },
          "&:hover .MuiStack-root": {
            opacity: 1,
          },
          ...(isDragOver && {
            "&::before": {
              content: '""',
              position: "absolute",
              zIndex: 2,
              left: 4,
              right: 4,
              height: 3,
              borderRadius: 4,
              bgcolor: "primary.main",
              boxShadow: (theme: {
                palette: {
                  background: {
                    paper: string;
                  };
                };
              }) => {
                return `0 0 0 2px ${theme.palette.background.paper}`;
              },
              ...(dragState.edge === "top"
                ? {
                    top: -3,
                  }
                : {
                    bottom: -3,
                  }),
            },
          }),
        },
        dragIcon: {
          fontSize: 16,
          color: isDragging ? "primary.main" : "text.disabled",
          cursor: isDragging ? "grabbing" : "grab",
          transition: "color 120ms ease, transform 120ms ease",
          transform: isDragging ? "scale(1.2)" : "scale(1)",
        },
        layerIcon: {
          mx: 0.75,
          fontSize: 17,
          color: "primary.main",
        },
        editor: {
          flex: 1,
        },
        name: {
          minWidth: 0,
          flex: 1,
        },
        title: {
          fontSize: 12.5,
          fontWeight: selected ? 600 : 400,
        },
        source: {
          display: "block",
          fontSize: 10,
        },
        actions: {
          opacity: selected ? 1 : 0,
          transition: "opacity 120ms",
        },
        actionBtn: {
          minWidth: 26,
          width: 26,
          height: 26,
          p: 0,
          border: "none",
        },
        actionIcon: {
          fontSize: 16,
        },
        copyIcon: {
          fontSize: 15,
        },
      };
    }, [dragState.edge, hidden, isDragging, isDragOver, selected]);

    const handler = React.useMemo(() => {
      return {
        dragStart: (event: React.DragEvent<HTMLDivElement>): void => {
          event.dataTransfer.setData("text/layer-id", layer.id);
          event.dataTransfer.effectAllowed = "move";
          setDragState({
            activeId: layer.id,
          });
        },
        dragOver: (event: React.DragEvent<HTMLDivElement>): void => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const bounds = event.currentTarget.getBoundingClientRect();
          const edge =
            event.clientY < bounds.top + bounds.height / 2 ? "top" : "bottom";
          if (dragState.overId !== layer.id || dragState.edge !== edge) {
            setDragState((current) => {
              return {
                activeId:
                  current.activeId ??
                  event.dataTransfer.getData("text/layer-id") ??
                  undefined,
                overId: layer.id,
                edge,
              };
            });
          }
        },
        dragLeave: (event: React.DragEvent<HTMLDivElement>): void => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragState((current) => {
              return {
                activeId: current.activeId,
              };
            });
          }
        },
        drop: (event: React.DragEvent<HTMLDivElement>): void => {
          event.preventDefault();
          const activeId = event.dataTransfer.getData("text/layer-id");
          if (activeId) {
            moveLayer(
              activeId,
              layer.id,
              dragState.edge === "top" ? "after" : "before"
            );
          }
          setDragState({});
        },
        dragEnd: (): void => {
          setDragState({});
        },
        select: (): void => {
          selectLayer(layer.id);
        },
        nameChange: (value: string): void => {
          setName(value);
        },
        nameKeyDown: (event: React.KeyboardEvent<HTMLInputElement>): void => {
          if (event.key === "Enter") {
            saveName();
          }
          if (event.key === "Escape") {
            setName(layer.id);
            setEditing(false);
          }
        },
        stop: (event: React.MouseEvent): void => {
          event.stopPropagation();
        },
        edit: (): void => {
          setEditing(true);
        },
        visibility: (
          _val: string,
          event: React.MouseEvent<HTMLButtonElement>
        ): void => {
          event.stopPropagation();
          toggleVisibility(layer.id);
        },
        copy: (
          _val: string,
          event: React.MouseEvent<HTMLButtonElement>
        ): void => {
          event.stopPropagation();
          copyLayer(layer.id);
        },
        remove: (
          _val: string,
          event: React.MouseEvent<HTMLButtonElement>
        ): void => {
          event.stopPropagation();
          deleteLayer(layer.id);
        },
      };
    }, [dragState.edge, dragState.overId, layer.id, saveName, setDragState]);

    return (
      <Box
        draggable={!editing}
        data-layer-id={layer.id}
        onDragStart={handler.dragStart}
        onDragOver={handler.dragOver}
        onDragLeave={handler.dragLeave}
        onDrop={handler.drop}
        onDragEnd={handler.dragEnd}
        onClick={handler.select}
        sx={styles.row}
      >
        <DragIndicatorRounded sx={styles.dragIcon} />

        <LayerTypeIcon type={layer.type} sx={styles.layerIcon} />

        {editing ? (
          <TextInput
            autoFocus
            size={"small"}
            value={name}
            onChange={handler.nameChange}
            onBlur={saveName}
            onKeyDown={handler.nameKeyDown}
            onClick={handler.stop}
            sx={styles.editor}
          />
        ) : (
          <Box onDoubleClick={handler.edit} sx={styles.name}>
            <Typography variant={"body2"} noWrap sx={styles.title}>
              {layer.id}
            </Typography>

            {"source-layer" in layer && layer["source-layer"] && (
              <Typography
                variant={"caption"}
                color={"text.secondary"}
                noWrap
                sx={styles.source}
              >
                {layer["source-layer"]}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={0.25} sx={styles.actions}>
          <TooltipButton
            title={translate(hidden ? "show" : "hide")}
            icon={
              hidden ? (
                <VisibilityOffRounded sx={styles.actionIcon} />
              ) : (
                <VisibilityRounded sx={styles.actionIcon} />
              )
            }
            onClick={handler.visibility}
            sx={styles.actionBtn}
          />

          <TooltipButton
            title={translate("copy")}
            color={clipboardLayerId === layer.id ? "primary" : "inherit"}
            icon={<ContentCopyRounded sx={styles.copyIcon} />}
            onClick={handler.copy}
            sx={styles.actionBtn}
          />

          <TooltipButton
            title={translate("delete")}
            color={"error"}
            icon={<DeleteOutlineRounded sx={styles.actionIcon} />}
            onClick={handler.remove}
            sx={styles.actionBtn}
          />
        </Stack>
      </Box>
    );
  }
);
