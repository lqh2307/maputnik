const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      const oneOfRule = webpackConfig.module.rules.find((rule) => Array.isArray(rule.oneOf));
      const babelRule = oneOfRule?.oneOf.find((rule) => rule.loader?.includes("babel-loader"));
      if (babelRule) {
        const babelIncludes = Array.isArray(babelRule.include)
          ? babelRule.include
          : babelRule.include
            ? [babelRule.include]
            : [];
        babelRule.include = [
          ...babelIncludes,
          path.resolve(__dirname, "node_modules/@maplibre/maplibre-gl-inspect/lib"),
        ];
      }

      return webpackConfig;
    },
  },
};
