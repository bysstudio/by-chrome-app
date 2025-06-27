// stores/websocket.js
import { defineStore } from "pinia";
import { ref, reactive } from 'vue';

export const useWebSocketStore = defineStore("websocket", () => {
  const socket = ref(null);
  const isConnected = ref(false);
  const messageQueue = reactive([]);
  const callbacks = reactive({});

  // 初始化 WebSocket 连接
  const connect = (url) => {

    if (socket.value) return;
    socket.value = new WebSocket(url);
    socket.value.onopen = () => {
      isConnected.value = true;
      console.log("WebSocket 连接成功", url);
    };

    socket.value.onmessage = (event) => {
      const res = parseMessage(event.data);
      messageQueue.push(res);

      if (res.type && callbacks[res.type]) {
        callbacks[res.type].forEach(cb => cb(res.data));
      }
    };

    socket.value.onerror = (error) => {
      console.error("WebSocket error:", error);
      reconnect(url);
    };

    socket.value.onclose = () => {
      isConnected.value = false;
      socket.value = null;
    };
  };

  // 解析消息
  const parseMessage = (rawData) => {
    try {
      return JSON.parse(rawData);
    } catch {
      return rawData;
    }
  };

  // 重连逻辑
  const reconnect = (url, retries = 3, delay = 3000) => {
    if (retries <= 0) return;

    setTimeout(() => {
      console.log(`尝试重连，剩余次数: ${retries}`);
      connect(url);
      retries--;
    }, delay);
  };

  // 注册消息回调
  const on = (eventType, callback) => {
    if (!callbacks[eventType]) {
      callbacks[eventType] = [];
    }
    callbacks[eventType].push(callback);
  };

  // 注销回调
  const off = (eventType, callback) => {
    const index = callbacks[eventType]?.indexOf(callback);
    if (index !== undefined && index !== -1) {
      callbacks[eventType].splice(index, 1);
    }
  };
  // 发送消息
  const send = (message) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      const data = typeof message === "string" ? message : JSON.stringify(message);
      socket.value.send(data);
    } else {
      console.error("WebSocket 未连接");
    }
  };

  return {
    connect,
    socket,
    isConnected,
    messageQueue,
    send,
    on,
    off
  };
});
