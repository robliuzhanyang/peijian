/**
 * 运行时配置（H5）
 *
 * 该文件随 dist 一起发布，部署后可直接修改，无需重新构建。
 * 留空时使用构建环境变量（.env.sit / .env.production）中的值。
 *
 * env:        当前环境标识，如 sit / production；用于日志与排查
 * apiBaseUrl: 接口根路径，如 https://sit-api.example.com/api/h5
 * dataMode:   mock | api；正式/测试环境应保持 api
 */
window.__XJ_CONFIG__ = {
  env: "",
  apiBaseUrl: "",
  dataMode: "",
};
