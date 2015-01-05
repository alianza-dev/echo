module.exports = {
  entry: './src/echo.js',
  output: {
    filename: 'dist/echo.js',
    library: 'Echo',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: '6to5-loader'}
    ]
  }
};