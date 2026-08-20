import { loadImageSrc } from "../../utils/Image";
import { LoadingImageProp } from "./Types";
import React from "react";
import {
  CircularProgress,
  Typography,
  SxProps,
  Theme,
  Box,
} from "@mui/material";

/** Renders the LoadingImage component. */
export const LoadingImage = React.memo(
  ({
    display = "flex",
    fallbackSrc = "./assets/images/placeholder.png",
    src,
    alt,
    loading,
    loadingOnLoad,
    imageFit = "contain",
    progress,
    onLoad,
    onError,
    sx = {},
    ...prop
  }: LoadingImageProp): React.JSX.Element => {
    const [image, setImage] = React.useState<string>(undefined);
    const [imageLoading, setImageLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
      let mounted = true;

      if (src) {
        if (loadingOnLoad) {
          setImageLoading(true);
        }

        if (src instanceof Blob) {
          loadImageSrc(src)
            .then((img) => {
              if (!mounted) {
                return;
              }

              setImage(img.src ?? fallbackSrc);
            })
            .catch(() => {
              if (!mounted) {
                return;
              }

              setImage(fallbackSrc);
            });

          return () => {
            mounted = false;
          };
        } else {
          setImage(src);
        }
      } else {
        setImage(fallbackSrc);
      }

      return () => {
        mounted = false;
      };
    }, [src, fallbackSrc, loadingOnLoad]);

    const onErrorHandler = React.useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>): void => {
        setImageLoading(false);

        setImage(fallbackSrc);

        onError?.(e);
      },
      [onError, fallbackSrc, image]
    );

    const onLoadHandler = React.useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>): void => {
        setImageLoading(false);

        if (image === fallbackSrc) {
          return;
        }

        onLoad?.(e);
      },
      [onLoad, fallbackSrc, image]
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
    }, [imageLoading]);

    const imageSx = React.useMemo(() => {
      return {
        width: "100%",
        height: "100%",
        objectFit: imageFit,
        visibility: imageLoading ? "hidden" : "visible",
      };
    }, [imageFit, imageLoading]);

    const boxFullSx = React.useMemo(() => {
      return {
        position: "relative",
        display: display,
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
          component={"img"}
          src={image}
          alt={alt}
          sx={imageSx}
          onError={onErrorHandler}
          onLoad={onLoadHandler}
        />

        {(loading || imageLoading) && (
          <Box sx={styles.loadingContainer}>
            <Box sx={styles.progressWrapper}>
              <CircularProgress
                color={"inherit"}
                variant={progress ? "determinate" : "indeterminate"}
                value={progress}
              />

              {progress && (
                <Box sx={styles.progressText}>
                  <Typography variant={"caption"} component={"div"}>
                    {`${progress}%`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);
