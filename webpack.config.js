const path = require('path');

module.exports = {
  entry: path.resolve('./components/app.tsx'),
  mode: 'development',
  output: { path: __dirname, filename: 'bundle.js' },
  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
  },
  module: {
    rules: [
      {
        loaders: ['babel-loader', 'ts-loader'],
        test: /\.tsx?$/,
        exclude: /node_modules/,
      },
    ],
  },
};
