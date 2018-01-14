module.exports = {
  entry: {
    'jsinspector': 'src/index.js'
  },
  output: {
    path: __dirname + 'dist',
    filename: '[name].js'
  }
}