import { WebSocketServer } from 'ws';

class WSService {
  constructor() {
    this.wss = null;
    this.clients = new Set(); // 存储所有连接的客户端
  }

  // 启动 WebSocket 服务
  start(port = 3001) {
    if (this.wss) return; // 避免重复启动

    this.wss = new WebSocketServer({ port });

    this.wss.on('listening', () => {
      console.log(`初始化WS服务器   ws://localhost:${port}`);
    });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
      });
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server error:', error);
    });
  }

  // 广播消息给所有客户端
  broadcast(message) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    this.clients.forEach(client => {
      if (client.readyState === 1) { // 1 表示 OPEN 状态
        client.send(message);
      }
    });
  }

  // 关闭 WebSocket 服务
  stop() {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      this.clients.clear();
    }
  }
}

// 导出单例实例
export default new WSService();
