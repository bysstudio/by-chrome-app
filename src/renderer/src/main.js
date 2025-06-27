import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./ruoter";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "./assets/base.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { useWebSocketStore } from "./store";


const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(ElementPlus).use(router);
const pinia = createPinia();
app.use(pinia);
// 初始化 WebSocket 连接
// 全局方法挂载
app.mount("#app");

const wsStore = useWebSocketStore();
// 监听主进程发送的端口
window.electronAPI.onSetPort((portData) => {
  window.httpPort = portData.http;
  const wsurl=`http://localhost:${portData.ws}`
  wsStore.connect(wsurl);
  console.log("监听主进程发送的端口", JSON.stringify(portData));
});

