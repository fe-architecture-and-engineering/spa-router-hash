const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts'
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js'
  },
  target: 'web',
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: ['awesome-typescript-loader']
    }]
  },
  resolve: {
    extensions: [".ts",".js"],
    plugins: [
      new TsConfigPathsPlugin({
        configFileName: path.resolve(__dirname, './tsconfig.json')
      })
    ]
  },
  devtool: '#source-map',
  devServer: {
    hot: true,
    port: 9996,
    host: '0.0.0.0',
    inline: true,
    clientLogLevel: 'error'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};