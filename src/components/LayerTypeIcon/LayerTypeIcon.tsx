import { LayerTypeIconProp } from "./Types";
import React from "react";
import {
  CropSquareRounded,
  LandscapeRounded,
  ShowChartRounded,
  WallpaperRounded,
  ViewInArRounded,
  BlurOnRounded,
  CircleRounded,
  LayersRounded,
  GrainRounded,
  ImageRounded,
  PlaceRounded,
} from "@mui/icons-material";

/** Renders the icon associated with a MapLibre layer type. */
export const LayerTypeIcon = React.memo(
  ({ type, ...props }: LayerTypeIconProp): React.JSX.Element => {
    switch (type) {
      case "background": {
        return <WallpaperRounded {...props} />;
      }
      case "fill": {
        return <CropSquareRounded {...props} />;
      }
      case "line": {
        return <ShowChartRounded {...props} />;
      }
      case "symbol": {
        return <PlaceRounded {...props} />;
      }
      case "circle": {
        return <CircleRounded {...props} />;
      }
      case "heatmap": {
        return <BlurOnRounded {...props} />;
      }
      case "fill-extrusion": {
        return <ViewInArRounded {...props} />;
      }
      case "raster": {
        return <ImageRounded {...props} />;
      }
      case "hillshade": {
        return <LandscapeRounded {...props} />;
      }
      case "color-relief": {
        return <GrainRounded {...props} />;
      }
      default: {
        return <LayersRounded {...props} />;
      }
    }
  }
);
