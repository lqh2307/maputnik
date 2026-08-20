import { TooltipButton } from "../TooltipButton";
import { LoadingImage } from "../LoadingImage";
import { GridItemProp } from "./Types";
import React from "react";

/** Renders the GridItem component. */
export const GridItem = React.memo(
  ({
    title,
    titlePlacement,
    value,
    icon,
    imageSrc,
    imageAlt,
    delay = 200,
    onClick,
    sx = {},
  }: GridItemProp): React.JSX.Element => {
    const styles = React.useMemo(() => {
      return {
        button: {
          width: "100%",
          height: "100%",
          ...sx,
        },
      };
    }, [sx]);

    const itemIcon = React.useMemo(() => {
      if (icon) {
        return icon;
      }

      if (!imageSrc) {
        return <></>;
      }

      return <LoadingImage src={imageSrc} alt={imageAlt} />;
    }, [icon, imageSrc, imageAlt]);

    return (
      <TooltipButton
        title={title}
        titlePlacement={titlePlacement}
        value={value}
        delay={delay}
        icon={itemIcon}
        onClick={onClick}
        sx={styles.button}
      />
    );
  }
);
