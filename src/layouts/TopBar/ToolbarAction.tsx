import { TooltipButton } from "../../components/TooltipButton";
import { TOOLBAR_ICON_BUTTON_STYLE } from "../../configs";
import { ToolbarActionProp } from "./Types";
import React from "react";

/** Renders an icon button with a tooltip and interactive hover effects inside the editor top bar. */
export const ToolbarAction = React.memo(
  ({
    title,
    icon,
    onClick,
    disabled = false,
    active = false,
    color = "inherit",
  }: ToolbarActionProp): React.JSX.Element => {
    const handler = React.useMemo(() => {
      return {
        click: (
          _value: string,
          event: React.MouseEvent<HTMLButtonElement>
        ): void => {
          onClick(event);
        },
      };
    }, [onClick]);

    const styles = React.useMemo(() => {
      return {
        button: {
          minWidth: 32,
          width: 32,
          height: 32,
          p: 0,
          ...TOOLBAR_ICON_BUTTON_STYLE,
          border: 1,
          borderColor: active ? "primary.main" : "divider",
          borderRadius: 1,
          color: active ? "primary.main" : "text.secondary",
          bgcolor: active ? "action.selected" : "background.paper",
          "&&:hover": {
            outline: "none",
            borderColor: "primary.main",
            color: "primary.main",
            bgcolor: active ? "action.selected" : "action.hover",
            boxShadow: "0 3px 8px rgba(15, 23, 42, 0.14)",
            transform: "translateY(-1px)",
          },
        },
      };
    }, [active]);

    return (
      <TooltipButton
        title={title}
        icon={icon}
        onClick={handler.click}
        disabled={disabled}
        color={color}
        fullWidth={false}
        aria-pressed={active}
        sx={styles.button}
      />
    );
  }
);
