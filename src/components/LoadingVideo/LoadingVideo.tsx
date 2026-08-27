import { loadVideoSrc, revokeMediaObjectURL } from "../../utils/Image";
import { LoadingVideoProp } from "./Types";
import React from "react";
import {
  CircularProgress,
  Typography,
  SxProps,
  Theme,
  Box,
} from "@mui/material";

/** Renders the LoadingVideo component. */
export const LoadingVideo = React.memo(
  ({
    display = "flex",
    fallbackSrc = "./assets/images/placeholder.png",
    src,
    loading,
    loadingOnLoad,
    progress,
    onLoad,
    onError,
    sx = {},
    ...prop
  }: LoadingVideoProp): React.JSX.Element => {
    const [video, setVideo] = React.useState<string>(undefined);
    const [videoLoading, setVideoLoading] = React.useState<boolean>(false);
    const loadedVideoRef = React.useRef<HTMLVideoElement>(undefined);

    React.useEffect(() => {
      let mounted = true;

      if (src) {
        if (loadingOnLoad) {
          setVideoLoading(true);
        }

        if (src instanceof Blob) {
          loadVideoSrc(src, "objectURL")
            .then((img) => {
              if (!mounted) {
                revokeMediaObjectURL(img);

                return;
              }

              loadedVideoRef.current = img;

              setVideo(img.src ?? fallbackSrc);
            })
            .catch(() => {
              if (!mounted) {
                return;
              }

              setVideo(fallbackSrc);
            });

          return () => {
            mounted = false;

            revokeMediaObjectURL(loadedVideoRef.current);

            loadedVideoRef.current = undefined;
          };
        } else {
          setVideo(src);
        }
      } else {
        setVideo(fallbackSrc);
      }

      return () => {
        mounted = false;

        revokeMediaObjectURL(loadedVideoRef.current);

        loadedVideoRef.current = undefined;
      };
    }, [src, fallbackSrc, loadingOnLoad]);

    const handleLoadStart = React.useCallback(() => {
      if (loadingOnLoad) {
        setVideoLoading(true);
      }
    }, [loadingOnLoad]);

    const handleLoadedData = React.useCallback(
      (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setVideoLoading(false);

        if (video === fallbackSrc) {
          return;
        }

        onLoad?.(e);
      },
      [onLoad, video, fallbackSrc]
    );

    const handleCanPlay = React.useCallback(() => {
      setVideoLoading(false);
    }, []);

    const handleWaiting = React.useCallback(() => {
      setVideoLoading(true);
    }, []);

    const handleError = React.useCallback(
      (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setVideoLoading(false);

        revokeMediaObjectURL(loadedVideoRef.current);

        loadedVideoRef.current = undefined;

        setVideo(fallbackSrc);

        onError?.(e);
      },
      [onError, fallbackSrc]
    );

    const styles = React.useMemo(() => {
      return {
        loadingContainer: {
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        progressWrapper: {
          position: "relative",
          display: "inline-flex",
        },
        progressText: {
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      };
    }, []);

    const videoSx = React.useMemo(() => {
      return {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        visibility: videoLoading ? "hidden" : "visible",
      };
    }, [videoLoading]);

    const boxFullSx = React.useMemo(() => {
      return {
        position: "relative",
        display,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        backgroundColor: "background.paper",
        ...sx,
      } as SxProps<Theme>;
    }, [sx, display]);

    return (
      <Box sx={boxFullSx} {...prop}>
        <Box
          component={"video"}
          src={video}
          sx={videoSx}
          controls={true}
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onError={handleError}
        />

        {(loading || videoLoading) && (
          <Box sx={styles.loadingContainer}>
            <Box sx={styles.progressWrapper}>
              <CircularProgress
                color={"inherit"}
                variant={progress ? "determinate" : "indeterminate"}
                value={progress}
              />

              {!!progress && (
                <Box sx={styles.progressText}>
                  <Typography variant={"caption"}>{`${progress}%`}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);
