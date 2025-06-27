import axios from "axios";
import { ElMessage } from "element-plus";
// 动态判断环境
const isdev = process.env.NODE_ENV === "development";
let baseURL = "/api"; // 默认开发环境

//生产环境，动态获取端口号
if (!isdev) {
  // 等待端口设置（最多等待5秒）
  const waitForPort = async () => {
    return new Promise((resolve) => {
      const checkPort = () => {
        if (window.httpPort) {
          resolve(`http://localhost:${window.httpPort}`);
        } else {
          setTimeout(checkPort, 100);
        }
      };
      setTimeout(() => resolve("http://localhost:3000"), 5000); // 超时回退
      checkPort();
    });
  };
  baseURL = await waitForPort();
}
const service = axios.create({
  baseURL: baseURL,
  timeout: 120000,
  withCredentials: true // Electron 需要携带凭证
});

// 优化后的请求拦截器
service.interceptors.request.use(config => {
  // 修复 GET 参数处理逻辑
  if (config.method === "get" && config.params) {
    const params = tansParams(config.params);
    config.url += `?${params}`;
    config.params = undefined;
  }
  return config;
}, error => {
  console.error("Request Error:", error);
  return Promise.reject(error);
});

// 增强响应拦截器（添加 Electron 错误识别）
service.interceptors.response.use(
  response => {
    const { data } = response;
    if (data?.code !== 200) {
      ElMessage.error(data.msg || "业务逻辑错误");
      return Promise.reject(data);
    }
    return data;
  },
  error => {
    let message = error.message;
    if (isdev) {
      // Electron 特有错误处理
      if (error.code === "ECONNREFUSED") {
        message = "后端服务未启动";
      } else if (error.code === "ENETUNREACH") {
        message = "网络连接不可用";
      }
    }

    ElMessage({
      message: message || "未知错误",
      type: "error",
      duration: 5000
    });

    // 记录完整错误日志
    console.error("Response Error:", {
      config: error.config,
      response: error.response,
      stack: error.stack
    });

    return Promise.reject(error);
  }
);

function tansParams(params) {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && typeof (value) !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== "undefined") {
            let params = propName + "[" + key + "]";
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
}


export default service;
