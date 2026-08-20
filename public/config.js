window.IMAGE_PROCESS_URL = "https://release.c4i.vn/tiles4";
window.IMAGE_STORAGE_URL = "https://release.c4i.vn/c4i-storage";

window.MAP_DATAS = {
  dem: {
    name: "DEM",
    url: `${window.IMAGE_PROCESS_URL}/datas/dem-25k.json`,
  },
  contour: {
    name: "Contour",
    url: `${window.IMAGE_PROCESS_URL}/datas/contour_line.json`,
  },
  elevation_point: {
    name: "Elevation Point",
    url: `${window.IMAGE_PROCESS_URL}/datas/elevation_point-50k.json`,
  },
};

window.MAPUTNIK_CONFIG = {
  ...window.MAPUTNIK_CONFIG,
  tokens: {
    openmaptiles: "get_your_own_OpIi9ZULNHzrESv6T2vL",
    thunderforest: "b71f7f0ba4064f5eb9e903859a9cf5c6",
    locationiq: "pk.put_your_api_key_here7bb23dffeb4",
    ...(window.MAPUTNIK_CONFIG && window.MAPUTNIK_CONFIG.tokens),
  },
};
