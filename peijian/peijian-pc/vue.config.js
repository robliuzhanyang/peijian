/**
 * Vue CLI 配置（PC 端）
 * - publicPath: './' 构建产物使用相对路径，便于任意静态目录部署
 * - productionSourceMap: false 生产构建不生成 sourcemap，减小体积
 * - lintOnSave: false 保存时不触发 ESLint 拦截（原型项目）
 * - devServer.port: 默认 8002，可用环境变量 DEV_PORT 覆盖（避免与同机其他项目端口冲突）
 */
module.exports = {
  publicPath: './',
  outputDir: 'dist',
  productionSourceMap: false,
  lintOnSave: false,
  devServer: {
    port: process.env.DEV_PORT ? Number(process.env.DEV_PORT) : 8002,
    host: '0.0.0.0',
  },
}
