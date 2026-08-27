module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      // workerpool exposes one browser bundle but keeps a guarded
      // worker_threads require for its Node.js path. Prevent webpack from
      // trying to include that Node-only module in the browser build.
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        child_process: false,
        os: false,
        worker_threads: false,
      };

      return webpackConfig;
    },
  },
};
