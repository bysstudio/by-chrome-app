import { SocksProxyAgent } from 'socks-proxy-agent'

import { EventEmitter } from 'events'

import http from 'http'

import url from 'url'

import { SocksClient } from 'socks'
import logger from '../../logger/logger'


class HttpProxy extends EventEmitter {
  constructor(options) {
    super();
    this.opt = {
      listenHost: 'localhost',
      listenPort: 12333,
      socksHost: 'localhost',
      socksPort: 1080,
      ...options,
    };
    this.proxy = {
      ipaddress: this.opt.socksHost,
      port: this.opt.socksPort,
      type: 5,
      userId: this.opt.socksUsername || '',
      password: this.opt.socksPassword || '',
    };
  }

  _request(proxy, uReq, uRes) {
    const u = url.parse(uReq.url);
    const socksAgent = new SocksProxyAgent(
      `socks://${proxy.userId}:${proxy.password}@${proxy.ipaddress}:${proxy.port}`
    );

    const options = {
      hostname: u.hostname,
      port: u.port || 80,
      path: u.path,
      method: uReq.method || 'get',
      headers: uReq.headers,
      agent: socksAgent,
    };
    const pReq = http.request(options);
    pReq
      .on('response', (pRes) => {
        pRes.pipe(uRes);
        uRes.writeHead(pRes.statusCode, pRes.headers);
        this.emit('request:success');
      })
      .on('error', (e) => {
        uRes.writeHead(500);
        uRes.end('Connection error\n');
        this.emit('request:error', e);
      });
    uReq.pipe(pReq);
  }

  _connect(proxy, uReq, uSocket, uHead) {
    const u = url.parse(`http://${uReq.url}`);
    const options = {
      proxy,
      destination: { host: u.hostname, port: u.port ? +u.port : 80 },
      command: 'connect',
    };
    SocksClient.createConnection(options, (error, pSocket) => {
      if (error) {
        uSocket.write(`HTTP/${uReq.httpVersion} 500 Connection error\r\n\r\n`);
        this.emit('connect:error', error);
        return;
      }
      pSocket.socket.pipe(uSocket);
      uSocket.pipe(pSocket.socket);
      //回调事件主题
      pSocket.socket.on('error', (err) => {
        this.emit('connect:error', err);
      });
      uSocket.on('error', (err) => {
        //回调事件主题
        this.emit('connect:error', err);
      });
      pSocket.socket.write(uHead);
      uSocket.write(`HTTP/${uReq.httpVersion} 200 Connection established\r\n\r\n`);
      this.emit('connect:success');
      pSocket.socket.resume();
    })
  }

  start() {
    const server = http.createServer();
    server.on('connect', (...args) => this._connect(this.proxy, ...args));
    server.on('request', (...args) => this._request(this.proxy, ...args));
    return server.listen(this.opt.listenPort, this.opt.listenHost);
  }
}

function SocksServer(opt) {
  logger.info(
    `Socks server listen on ${opt.listenHost}:${opt.listenPort}, and forward traffic to ${opt.socksHost}:${opt.socksPort}`
  );
  const proxy = new HttpProxy(opt);
  return proxy.start();
}

export default  SocksServer;
