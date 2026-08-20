import { TooltipButton } from "../../components/TooltipButton";
import { ToolbarActionProp } from "./Types";
import React from "react";

/** Renders an icon button with a tooltip and interactive hover effects inside the editor top bar. */
export const ToolbarAction = React.memo(
  ({
    title,
    icon,
    onClick,
    disabled = false,
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
          border: "none",
          color: "inherit",
        },
      };
    }, []);

    return (
      <TooltipButton
        title={title}
        icon={icon}
        onClick={handler.click}
        disabled={disabled}
        color={color}
        sx={styles.button}
      />
    );
  }
);
