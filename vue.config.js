// const { defineConfig } = require('@vue/cli-service')
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://bi.testworks.dev',
        changeOrigin: true,
        secure: false
      }
    }
  }
}