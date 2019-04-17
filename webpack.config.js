const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

module.exports = {
  mode: 'production',
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
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html'
    })
  ]
};