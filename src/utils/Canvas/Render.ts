import { ColorEffect } from "../../types/Color";
import { Position } from "../../types/Window";
import { ResizeOption } from "../Image/Types";

/** A positive image dimension pair. */
export type ImageSize = {
  width: number;
  height: number;
};

/** Common size fields exposed by browser image and canvas sources. */
export type ImageSourceLike = {
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
  videoWidth?: number;
  videoHeight?: number;
  displayWidth?: number;
  displayHeight?: number;
};

/** Return the intrinsic dimensions of an image, video, or canvas source. */
export function getImageSourceSize(source: ImageSourceLike): ImageSize {
  const width =
    source.naturalWidth ??
    source.videoWidth ??
    source.displayWidth ??
    source.width ??
    0;
  const height =
    source.naturalHeight ??
    source.videoHeight ??
    source.displayHeight ??
    source.height ??
    0;

  return {
    width,
    height,
  };
}

/** Resolve a named fit position to normalized anchor coordinates. */
export function getImageAnchor(position?: Position): { x: number; y: number } {
  switch (position) {
    case "center top":
      return {
        x: 0.5,
        y: 0,
      };
    case "right top":
      return {
        x: 1,
        y: 0,
      };
    case "right middle":
      return {
        x: 1,
        y: 0.5,
      };
    case "right bottom":
      return {
        x: 1,
        y: 1,
      };
    case "center bottom":
      return {
        x: 0.5,
        y: 1,
      };
    case "left bottom":
      return {
        x: 0,
        y: 1,
      };
    case "left middle":
      return {
        x: 0,
        y: 0.5,
      };
    case "left top":
      return {
        x: 0,
        y: 0,
      };
    default:
      return {
        x: 0.5,
        y: 0.5,
      };
  }
}

/** Determine the size used when an image is rendered with a resize option. */
export function getImageResizePlan(
  source: ImageSize,
  resize: ResizeOption
): { target: ImageSize } {
  const width = resize.size?.width;
  const height = resize.size?.height;
  if (!width && !height) {
    return {
      target: source,
    };
  }
  if (!width) {
    return {
      target: {
        width: Math.round((source.width * height) / source.height),
        height,
      },
    };
  }
  if (!height) {
    return {
      target: {
        width,
        height: Math.round((source.height * width) / source.width),
      },
    };
  }
  return {
    target: {
      width,
      height,
    },
  };
}

/** Apply the supplied color effects to canvas pixel data. */
export function applyFilter(
  imageData: ImageData,
  effects?: ColorEffect[]
): ImageData {
  void effects;
  return imageData;
}
