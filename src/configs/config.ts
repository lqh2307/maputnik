/** Configuration constant for image process url. */
export const IMAGE_PROCESS_URL: string =
  (window as any).IMAGE_PROCESS_URL || "http://localhost:8080";
/** Configuration constant for image storage url. */
export const IMAGE_STORAGE_URL: string =
  (window as any).IMAGE_STORAGE_URL || "http://localhost:8001";
/** Configuration constant for collab konva ws. */
export const COLLAB_KONVA_WS: string =
  (window as any).COLLAB_KONVA_WS || "ws://localhost:8386";

/** Default spatial reference used by stage content. */
export const DEFAULT_SRID: string = "EPSG:4326";

/** Configuration constant for render image timeout. */
export const RENDER_IMAGE_TIMEOUT: number =
  (window as any).RENDER_IMAGE_TIMEOUT || 5000;

export const MAP_DATAS = (window as any).MAP_DATAS || {
  dem: {
    name: "DEM",
    url: `${IMAGE_PROCESS_URL}/datas/dem-25k.json`,
  },
  contour: {
    name: "Contour",
    url: `${IMAGE_PROCESS_URL}/datas/contour_line.json`,
  },
  elevation_point: {
    name: "Elevation Point",
    url: `${IMAGE_PROCESS_URL}/datas/elevation_point-50k.json`,
  },
};

export const MAP_STYLES = (window as any).MAP_STYLES || [
  {
    id: "demotiles",
    name: "Demotiles",
    url: "https://demotiles.maplibre.org/style.json",
  },
];

// export const MAP_STYLE_DEFAULT: string =
//   (window as any).MAP_STYLE_DEFAULT ||
//   "https://release.c4i.vn/tiles4/styles/basic/style.json";
/** Configuration constant for map style default. */
export const MAP_STYLE_DEFAULT: string = MAP_STYLES[0].url;
