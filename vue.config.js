const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./", // 打包后的位置(如果不设置这个，放到服务器根目录下会报错)🐱
})
