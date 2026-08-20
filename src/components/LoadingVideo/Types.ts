import { BoxProps } from "@mui/material";

/** Defines loading video prop. */
export type LoadingVideoProp = Omit<BoxProps, "onLoad" | "onError"> & {
  /** Configuration for fallback src. */
  fallbackSrc?: string;
  /** Source URL or data URL. */
  src?: string | Blob;
  /** Configuration for alt. */
  alt?: string;
  /** Configuration for display. */
  display?: React.CSSProperties["display"];

  /** Event callback for load. */
  onLoad?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  /** Event callback for error. */
  onError?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;

  /** Whether loading on load. */
  loadingOnLoad?: boolean;
  /** Whether content is loading. */
  loading?: boolean;
  /** Configuration for progress. */
  progress?: number;
};
