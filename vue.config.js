const path = require('path')
module.exports = {
  publicPath : './',
  devServer: {
    disableHostCheck: true,
    overlay: false,
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://admin-dev.winnermedical.com', // 正式环境
        changeOrigin: true
      }
    }
  },
  lintOnSave: false,
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'source-map'
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    // 清除已有的所有 loader。
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    svgRule.uses.clear()
    // 添加要替换的 loader
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 10240 }));
  }
}
