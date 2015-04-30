module.exports = {
  entry: './src/echo.js',
  output: {
    filename: 'dist/echo.js',
    library: 'Echo',
    libraryTarget: 'umd'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel'}
    ]
  }
};
