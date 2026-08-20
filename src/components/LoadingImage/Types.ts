import { BoxProps } from "@mui/material";

/** Defines loading image prop. */
export type LoadingImageProp = BoxProps & {
  /** Configuration for fallback src. */
  fallbackSrc?: string;
  /** Source URL or data URL. */
  src?: string | Blob;
  /** Configuration for alt. */
  alt?: string;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Configuration for image fit. */
  imageFit?: string;

  /** Whether loading on load. */
  loadingOnLoad?: boolean;
  /** Whether content is loading. */
  loading?: boolean;
  /** Configuration for progress. */
  progress?: number;
};
