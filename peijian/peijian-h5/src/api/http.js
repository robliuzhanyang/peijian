/**
 * Axios 实例（H5）
 *
 * 统一处理：
 *   - baseURL：由 src/config/env.js 解析（构建环境变量 / public/config.js 运行时覆盖）
 *   - 鉴权：自动携带 Authorization: Bearer <token>
 *   - 响应：兼容 { code, message, data } 包裹结构与直接返回数据的接口
 *   - 401：清除 token 并跳转登录页
 *
 * 页面/领域层只依赖各 api 模块，不直接使用本实例。
 */
import axios from "axios";
import { API_BASE_URL, getToken, clearToken } from "@/config/env";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// 请求拦截：附加 token（登录接口本身没有 token 时不加）
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = "Bearer " + token;
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截：解包 data，统一错误提示；401 回到登录页
http.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && body.code !== undefined) {
      // 约定 0/200 为成功，其余抛错交给页面 setNotice
      if (body.code === 0 || body.code === 200) return body.data;
      return Promise.reject(new Error(body.message || "请求失败"));
    }
    return body;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken();
      if (!location.hash.startsWith("#/login")) {
        location.hash = "#/login";
      }
    }
    const message =
      (error.response &&
        error.response.data &&
        (error.response.data.message || error.response.data.msg)) ||
      error.message ||
      "网络异常，请稍后重试";
    return Promise.reject(new Error(message));
  },
);

export default http;
