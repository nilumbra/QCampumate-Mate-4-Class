const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

function configFunc(env, argv) {
  const isDevMode = env.NODE_END === 'development'
  const config = {
    devtool: isDevMode ? 'eval-source-map' : false,
    context: path.resolve(__dirname, './src'),
    entry: {
      options: './options/index.js',
      popup: './popup/index.js',
      background: './background/index.js',
      contentScripts: './contentScripts/index.js'
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      publicPath: './',
      filename: '[name].js'
    },
    module: {
      rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/ // All .js files except these specified ones will be transpiled by babel
      },
        // {
        //   test: /\.sass$$/,
        //   use: [
        //     // Creates `style` nodes from JS strings
        //     // 'vue-style-loader',
        //     'css-loader',
        //     'sass-loader']
        // },
        // {
        //   test: /\.css$/,
        //   use: ['vue-style-loader', 'css-loader']
        // }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new CopyWebpackPlugin({
        patterns: [
          // { from: 'assets', to: 'assets' },
          { from: 'manifest.json', to: 'manifest.json' }
        ]
      }),
      new HtmlWebpackPlugin({
        title: 'Popup',
        template: './index.html',
        filename: 'popup.html',
      })
    ]
  }


  return config

}

module.exports = configFunc;