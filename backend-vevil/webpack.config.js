const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      plugins: [
        ...(options.resolve.plugins || []),
        // Le decimos explícitamente al plugin que use el tsconfig.json de este proyecto.
        // Esto elimina cualquier ambigüedad y es la solución más robusta.
        new TsconfigPathsPlugin({ configFile: './tsconfig.json' })
      ],
    },
  };
};