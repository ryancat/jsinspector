var ExtractTextPlugin = require("extract-text-webpack-plugin");

// var extractSass = ;

module.exports = {
  entry: {
    'jsinspector': __dirname + '/src/index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              sourceMap: true,
              presets: ['@babel/preset-env']
            }
          }
        ]
      }, {
        test: /\.scss$/,
        // Pass the sass -> css loader result into
        // ExtractTextPlugin to generate css file
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true
              }
            }, {
              loader: 'sass-loader',
              options: {
                includePaths: [__dirname + '/src/'],
                sourceMap: true
              }
            }
          ],
          // use style-loader in development
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      // filename: "[name].[contenthash].css",
      // disable: process.env.NODE_ENV !== "production"
      filename: "[name].css"
    })
  ]
};