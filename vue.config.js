const pkg = require('./package.json')

module.exports = {
  assetsDir: 'static',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': 'api'
        }
      },
      '/root': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        pathRewrite: {
          '^/root': ''
        }
      }
    }
  }
}
