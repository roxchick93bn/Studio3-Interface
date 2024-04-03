const CracoAlias = require('craco-alias');
const webpack = require('webpack');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.',
        tsConfigPath: './tsconfig.extend.json',
      },
    },
  ],
  style: {
    sass: {
      loaderOptions: {
        additionalData: `
          @import "src/assets/styles/global.scss";
        `,
      },
    },
  },
  typescript: {
    enableTypeChecking: true,
  },
  webpack: {
    alias: {},
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
    configure: {
      resolve: {
        fallback: Object.assign({}, {
          "assert": require.resolve("assert"),
          "crypto": require.resolve("crypto-browserify"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "os": require.resolve("os-browserify"),
          "path": require.resolve("path-browserify"),
          'process/browser': require.resolve('process/browser'),
          "stream": require.resolve("stream-browserify"),
          "url": require.resolve("url"),
          "zlib": require.resolve("browserify-zlib")
        })
      },
      ignoreWarnings: [
        // Ignore warnings raised by source-map-loader.
        // some third party packages may ship miss-configured sourcemaps, that interrupts the build
        // See: https://github.com/facebook/create-react-app/discussions/11278#discussioncomment-1780169
        /**
         *
         * @param {import('webpack').WebpackError} warning
         * @returns {boolean}
         */
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ],

      /* Any webpack configuration options: https://webpack.js.org/configuration */
    },
    // configure: (webpackConfig, { env, paths }) => {
    //   return webpackConfig;
    // },
  },
  module: {
    rules: [
      {
        test: /node_modules[\\\/]https-proxy-agent[\\\/]/,
        use: 'null-loader',
      }
    ]
  }
};
