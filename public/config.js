// Runtime configuration. This file is loaded before the application bundle
// and can be replaced without rebuilding Maputnik.
window.MAPUTNIK_CONFIG = {
  ...window.MAPUTNIK_CONFIG,
  tokens: {
    openmaptiles: "get_your_own_OpIi9ZULNHzrESv6T2vL",
    thunderforest: "b71f7f0ba4064f5eb9e903859a9cf5c6",
    locationiq: "pk.put_your_api_key_here7bb23dffeb4",
    ...(window.MAPUTNIK_CONFIG && window.MAPUTNIK_CONFIG.tokens),
  },
};
