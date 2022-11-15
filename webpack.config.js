const path = require('path');

module.exports = {
  context: __dirname + '/',
  entry: './index.js',
  mode: 'development',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: [ 'pino-pretty' ],
  resolve: {
    alias: {
      '@': __dirname
    },
    extensions: [ '.js' ],
    modules: [ 'node_modules' ]
  },
  resolveLoader: {
    modules: [ 'node_modules' ]
  },
  module: {
    // rules: [
    //   {
    //     test: /\.(js)$/,
    //     exclude: /node_modules/,
    //     use: {
    //       loader: "babel-loader"
    //     }
    //   }
    // ]
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  stats: {
    colors: true,
    warnings: false
  }
};