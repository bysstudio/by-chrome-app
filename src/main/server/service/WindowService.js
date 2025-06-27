import { WindowDB } from "../db/WindowDB";
import { ConfigDB } from "../db/ConfigDB";
import { app } from "electron";
import WSService from "./WSService";
import fs from "fs";
import path from "path";
import { execSync, spawn } from "child_process";
import logger from "../../logger/logger";


import SocksServer from "./SocksServer";
import * as ProxyChain from "proxy-chain";
import { ProxyService } from "./ProxyService";
import { ProxyDB } from "../db/ProxyDB";

import puppeteer from "puppeteer";
import { EventType, uIOhook, UiohookKey } from "uiohook-napi";
import { Mutex } from "async-mutex";
import { dbDao } from "../db/DbDao";


let windowApi;
if (app.isPackaged) {

  windowApi = require("../../window-api/build/Release/window_api.node");
} else {
  // 开发环境路径（精确计算）
  const devPath = path.resolve(
    __dirname, // 当前文件所在目录：src/main/server/service/
    "../../", // 退到项目根目录
    "window-api/build/Release/window_api.node"
  );
  windowApi = require(devPath);
}
import { linuxToWindowsMap } from "../constants/index";
import generateFingerprint from "../utlis/getFingerprint";
import getPort, { portNumbers, clearLockedPorts } from "../utlis/getPort";

// Windows API 常量
const WM_LBUTTONDOWN = 513;
const WM_LBUTTONUP = 514;
const WM_RBUTTONDOWN = 516;
const WM_RBUTTONUP = 517;
const WM_KEYDOWN = 256;
const WM_KEYUP = 257;
const VK_CONTROL = 17;
const SW_RESTORE = 9;
const SM_CXFULLSCREEN = 16;
const SM_CYFULLSCREEN = 17;
const VK_UP = 38;
const VK_DOWN = 40;
const WM_CHAR = 258; // 用于字符输入
class WindowService {

  constructor() {
    this.windows = new Map();
    this.masterHwnd = null; //主句柄
    this.masterDipWindow = null; //DIP屏幕大小
    this.syncWindows = []; //从属
    this.isSyncing = false;
    this.lastMasterId = 0;
    this.lastMouseClick = { x: 0, y: 0 };
    this.lastChromePort = 9222;
    this.lastProxyPort = 30000;
    this.windowRects = new Map();


    this.winDB = new WindowDB(); //环境数据库
    this.configDB = new ConfigDB(); //配置数据库
    this.proxyDB = new ProxyDB(); //代理数据库

    this.proxyService = new ProxyService();
    //自定义窗口大小
    this.lastDiyWH = null;
    //锁
    this.mutex = new Mutex();

    // 开发环境: 返回项目根目录（如 src/）
    // 生产环境: 返回应用安装目录（如 /Applications/ 或 C:\Program Files\）
    this.appPath = app.getAppPath();
    //默认浏览器
    this.chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    this.HOST = "127.0.0.1";

    // 定义功能键列表（Linux 键码）
    this.linuxFunctionKeys = {
      14: UiohookKey.Backspace,
      28: UiohookKey.Enter,
      1: UiohookKey.Escape,    // Escape
      15: UiohookKey.Tab,      // Tab
      57: UiohookKey.Space,    // Space
      3657: UiohookKey.PageUp,  // Page Up
      3665: UiohookKey.PageDown,   // Page Down
      3663: UiohookKey.End,    // End
      3655: UiohookKey.Home,   // Home
      57419: UiohookKey.ArrowLeft,  // ArrowLeft
      57416: UiohookKey.ArrowUp,    // ArrowUp
      57421: UiohookKey.ArrowRight, // ArrowRight
      57424: UiohookKey.ArrowDown,  // ArrowDown
      3666: UiohookKey.Insert, // Insert
      3667: UiohookKey.Delete  // Delete
    };
    //组合键， 复制 /粘贴 全选
    this.combination = {
      30: UiohookKey.A,
      46: UiohookKey.C,
      47: UiohookKey.V,
      45: UiohookKey.X
    };

  }

  /**
   *批量打开
   * @param ids
   * @returns {Promise<void>}
   */
  async batchOpen(ids) {
    //根据ID降序启动
    ids.sort((a, b) => b - a);
    for (const id of ids) {
      await this._openWindow(id);
      //等待等待，让子弹飞一会
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  /**
   * 批量关闭
   * @param ids
   * @returns {Promise<void>}
   */
  async batchClose(ids) {
    if (this.windows.size === 0) {
      return;
    }
    const release = await this.mutex.acquire();
    try {
      if (ids) {
        for (const id of ids) {
          const item = this.windows.get(id);
          if (item) {
            try {
              const browserURL = `http://${this.HOST}:${item.chromePort}`;
              logger.info(`批量关闭--浏览器 环境信息:${item}  URL:${browserURL}`);
              const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
              await browser?.close();
            } catch (error) {
              logger.error(`批量关闭---浏览器异常 ${error.message}`);
            }
            //进行强制能出
            try {
              process.kill(item.pid);
            } catch (e) {
              logger.error(`进程 ${item.pid} 已退出`);
            }

            //窗口同步中
            if (this.isSyncing) {
              if (item.isMaster) { //关闭的是主控
                await this._stopSync(); //停止同步
              } else {
                //删除从属窗口
                this.syncWindows = this.syncWindows.filter(hwnd => hwnd !== item.hwnd);
              }
            }
            this.windows.delete(id);
            //等待等待，让子弹飞一会
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        if (this.windows.size === 0) {
          this.windows.clear();
          await this._stopSync();
          clearLockedPorts();
        }
      } else {
        logger.info(`关闭全部环境`);
        await this.closeAll();
      }
    } catch (err) {
      logger.error(`关闭窗口异常, ${err.message}`);
    } finally {
      release();
    }
  }

  /**
   * 窗口排列
   * @param ids
   * @param screen
   * @returns {Promise<void>}
   */
  async sortWindow(ids = null, screen = null) {
    if (this.windows.size < 1) {
      return;
    }

    let winHwnds = [];
    //指定窗口排列
    if (ids) {
      ids.sort((a, b) => b - a);
      for (const id of ids) {
        const item = this.windows.get(id);
        if (item)
          winHwnds.push(item.hwnd);
      }
    } else {
      //全部窗口排列
      const keys = Array.from(this.windows.keys());
      // 步骤 2: 对键进行降序排序（假设键为数字）
      keys.sort((a, b) => b - a);
      keys.forEach(key => {
        winHwnds.push(this.windows.get(key).hwnd);
      });
    }
    //进行窗口排列
    await this._autoArrangeWindows(winHwnds, screen);
  }

  /**
   *启动同步器
   * @param data
   * @returns {Promise<void>}
   */
  async startWinSync(data) {
    if (this.windows.size < 1 || this.isSyncing) {
      return;
    }
    let masterHwnd = null;
    let salveHwnds = [];
    //设置主控
    if (data && data.masterId) {
      const master = this.windows.get(data.masterId);
      if (master) {
        masterHwnd = master.hwnd;
        this.lastMasterId = master.id;
      }
    }
    if (data && data.ids) {
      //指定的从属
      data.ids.sort((a, b) => b - a);
      for (const id of data.ids) {
        const item = this.windows.get(id);
        if (item) {
          //找不到主控，那就使用第一个为主
          if (!masterHwnd) {
            masterHwnd = item.hwnd;
            this.lastMasterId = id;
          }
          salveHwnds.push(item.hwnd);
        }
      }
    } else {
      // 步骤 1: 提取键并转为数组
      const keys = Array.from(this.windows.keys());
      // 步骤 2: 对键进行降序排序（假设键为数字）
      keys.sort((a, b) => b - a);
      for (const id of keys) {
        const item = this.windows.get(id);
        if (!masterHwnd) {
          masterHwnd = item.hwnd;
          this.lastMasterId = id;
        }
        salveHwnds.push(item.hwnd);
      }
    }

    logger.info(`进行同步的窗口, ${salveHwnds}, 主控, ${masterHwnd}`);
    if (salveHwnds.length < 1) {
      return;
    }


    //进行窗口排列
    await this._autoArrangeWindows(salveHwnds, this.lastDiyWH);
    //等待等待
    new Promise(resolve => setTimeout(resolve, 3000));
    //发送同步信息
    WSService.broadcast({
      type: "syncResult", data: {
        id: this.lastMasterId,
        status: true
      }
    });
    await this._startSync(masterHwnd, salveHwnds);
  }

  /**
   * 停止同步器
   * @returns {Promise<boolean>}
   */
  async stopWinSync() {
    await this._stopSync();
    return this.isSyncing;
  }

  /**
   * 获取同步器状态
   * @returns {boolean}
   */
  getSyncStatus() {
    return this.isSyncing;
  }

  /**
   * 获取已打开的实例
   * @returns {Promise<*[]>}
   */
  async getOpenList() {
    if (this.windows.size > 0) {

      let data = [];
      // 步骤 1: 提取键并转为数组
      const keys = Array.from(this.windows.keys());

      // 步骤 2: 对键进行降序排序（假设键为数字）
      keys.sort((a, b) => b - a);
      for (const id of keys) {
        const item = this.windows.get(id);
        data.push({
          id: id,
          hwnd: item.hwnd,
          name: item.name,
          chromePort: item.chromePort,
          master: id === this.lastMasterId
        });
      }
      return data;
    } else {
      return [];
    }
  }


  /**
   * 全部关闭
   * @returns {Promise<void>}
   */
  async closeAll() {
    try {
      for (const [, data] of this.windows) {
        try {
          const browserURL = `http://${this.HOST}:${data.chromePort}`;
          logger.info(`全部关闭--浏览器 ${browserURL}`);
          const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
          await browser?.close();
        } catch (error) {
          logger.error(`全部关闭---浏览器异常 ${error.message}`);
        }
        //进行强制退出
        try {
          process.kill(data.pid);
        } catch (e) {
          logger.error(`进程 ${data.pid} 已退出 e:${e.message}`);
        }
      }
      this.windows.clear();
      this.lastMasterId = 0;
      await this._stopSync();
      clearLockedPorts();
    } catch (err) {

    }

  }

  /**
   * 打开窗口，启动前校验
   * @param id
   * @returns {Promise<null>}
   * @private
   */
  async _openWindow(id) {
    const release = await this.mutex.acquire();
    //存在就不能启动
    if (this.windows.get(id)) {
      return null;
    }
    try {
      const winData = await this.winDB.getById(id);
      if (!winData) {
        //判断环境
        WSService.broadcast({
          type: "windowOpenResult", data: {
            id: id,
            code: 400,
            status: 0,
            msg: "环境ID不存在"
          }
        });
        return null;
      }
      const config = await this.configDB.getConfig();
      //缓存基础路径
      const cachePathDir = config.cachePath ? config.cachePath : this.appPath;
      if (!fs.existsSync(cachePathDir)) {
        fs.mkdirSync(cachePathDir, { recursive: true, mode: 0o755 });
      }

      //缓存路径
      let profileDir;
      if (!winData.dir || winData.dir === "") {
        profileDir = path.join(cachePathDir, "chrome_data", winData.profile);
      } else {
        profileDir = winData.dir;
      }
      //判断缓存路径是否存在
      if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true, mode: 0o755 });
        await this.winDB.update(id, { dir: profileDir });
      }


      // 确保目录有正确的权限
      const isMac = process.platform === "darwin";
      if (isMac) {
        try {
          execSync(`chmod -R 755 "${cachePathDir}"`);
        } catch (error) {
          logger.error(`Failed to set permissions: ${error}`);
          return null;
        }
      }

      const chromeEXE = config.chromePath ? config.chromePath : this.chromePath;
      //判断浏览器是否存在
      if (!fs.existsSync(chromeEXE)) {
        WSService.broadcast({
          type: "windowOpenResult", data: {
            id: id,
            code: 400,
            status: 0,
            msg: "chrome浏览器不存在"
          }
        });
        logger.error("chrome浏览器不存在");
        return null;
      }
      //保存状态为启动中
      await this.winDB.update(id, { status: 100 });

      //进行启动
      await this._startChrome(winData, chromeEXE, profileDir);
    } catch (err) {
      logger.error(`打开窗口失败, ${err.message}`);
      //保存状态失败
      await this.winDB.update(id, { status: -1 });
      WSService.broadcast({
        type: "windowOpenResult", data: {
          id: id,
          code: 400,
          status: -1,
          msg: `启动失败 err: ${err.message}`
        }
      });
    } finally {
      release();
    }

  }

  /**
   * 启动chrome
   * @param winData
   * @param chromeEXE
   * @param profileDir
   * @returns {Promise<void>}
   * @private
   */
  async _startChrome(winData, chromeEXE, profileDir) {

    const chromePort = await this.getAvailablePort();
    let wid = winData.id;
    let finalProxy;
    let proxyServer;
    let ipInfo;
    //判断是否绑定代理
    if (winData.proxyId && winData.ip) {
      //获取IP信息
      ipInfo = await this.proxyService.getIpInfo(winData.ip);

      if (ipInfo) {
        //后台更新代理信息
        await this.proxyDB.update(winData.proxyId, ipInfo);
      }
      try {
        //启动代理服务
        if (winData.type.toLowerCase() === "socks5") {
          const proxyInstance = await this.createSocksProxy(winData);
          finalProxy = proxyInstance.proxyUrl;
          proxyServer = proxyInstance.proxyServer;
        } else if (winData.type.toLowerCase() === "http") {
          const proxyInstance = await this.createHttpProxy(winData);
          finalProxy = proxyInstance.proxyUrl;
          proxyServer = proxyInstance.proxyServer;
        }
      } catch (error) {
        logger.error(`打开浏览器配置代理失败  ${error.message}`);
      }

    }

    logger.info(`打开环境的信息 ${winData}`);
    /**
     * --fingerprint	指定指纹种子(seed)，启用后大部分指纹功能生效	32位整数
     * --fingerprint-platform	指定操作系统类型	windows, linux, macos
     * --fingerprint-platform-version	指定操作系统版本	不填时使用默认版本
     * --fingerprint-brand	指定 User-Agent 和 User-Agent Data 中的浏览器品牌	Chrome, Edge, Opera, Vivaldi (默认Chrome)
     * --fingerprint-brand-version	指定品牌的版本号	不填时使用默认版本
     * --fingerprint-hardware-concurrency	指定 CPU 核心数	整数值（不提供时由指纹种子随机生成）
     * --disable-non-proxied-udp	指定 WebRTC 策略，默认是禁用非代理 UDP 连接	建议保持默认设置
     * --lang	设置浏览器的语言	语言代码（如 zh-CN）
     * --accept-lang	设置浏览器接受的语言	语言代码（如 zh-CN,en-US）
     * --timezone	设置时区	时区（如Asia/Shanghai, UTC）
     * --proxy-server	设置代理	http, socks代理(不支持密码验证)
     */

    let fingerprint = JSON.parse(winData.fingerprint);

    if (!fingerprint || !fingerprint.screen) {
      fingerprint = generateFingerprint("window", "");
      await this.winDB.update(wid, { fingerprint: fingerprint });
    }

    // `--user-data-dir=${profileDir}`,
    const launchParamter = [
      `--remote-debugging-port=${chromePort}`, //端口号
      `--user-data-dir=${profileDir}`, //缓存文件
      "--no-default-browser-check", //禁用默认浏览器
      "--no-first-run",  //不是首次运行
      "--restore-last-session", //恢复上次关闭页面
      `--fingerprint=${winData.id}`,
      `--fingerprint-hardware-concurrency=${fingerprint.cpuCore}`,
      `--fingerprint-platform=${fingerprint.os}`,
      `--fingerprint-brand-version=${fingerprint.chromeVersion}`,
      `--fingerprint-brand=${fingerprint.browserBrand}`
    ];


    if (finalProxy) {
      launchParamter.push(`--proxy-server=${finalProxy}`);
      launchParamter.push(`--lang=${ipInfo.language}`);
      launchParamter.push(`--accept-lang=${ipInfo.language}`);
      launchParamter.push(`--timezone=${ipInfo.timezone}`);
    }

    logger.info(`chrome启动参数：${launchParamter}`);

    let chromeInstance;
    try {
      chromeInstance = spawn(chromeEXE, launchParamter);// 让 Chrome 在独立进程中运行
    } catch (error) {
      logger.error("定位无法启动日志");
      logger.error(`spawn 启动Chrome实例失败 ${error.message}`);
    }
    if (!chromeInstance) {
      WSService.broadcast({
        type: "windowOpenResult", data: {
          id: wid,
          code: 400,
          status: -1,
          msg: `启动Chrome实例失败`
        }
      });
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
    const pid = chromeInstance.pid;
    let hwnd = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      hwnd = await this._getWindowHandleFromPid(pid);
      if (hwnd) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    logger.info(`打印启动窗口信息  id:${winData.id},hwnd: ${hwnd} pid: ${pid} chromePort:${chromePort} `);
    if (hwnd) {
      //保存启动列表
      const launchChromeInstanc = {
        id: wid,
        hwnd: hwnd,
        pid: pid,
        name: winData.name,
        chromePort: chromePort,
        master: false
      };

      //缓存到本地
      this.windows.set(wid, launchChromeInstanc);

      //保存状态为成功
      await this.winDB.update(wid,
        { status: 1, openedAt: dbDao.raw("(strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))") });

      //再推送
      WSService.broadcast({
        type: "windowOpenResult", data: {
          id: wid,
          hwnd: hwnd,
          pid: pid,
          name: winData.name,
          chromePort: chromePort,
          code: 200,
          status: 1,
          master: false
        }
      });

      chromeInstance.on("close", async (code) => {
        logger.info(`监听到 Chrome 进程已退出，代码: ${code}`);
        if (proxyServer) {
          if (winData.type.toLowerCase() === "socks5") {
            proxyServer.close(() => {
              logger.info("关闭 Socks代理服务");
            });
          } else if (winData.type.toLowerCase() === "http") {
            proxyServer.close(true, () => {
              logger.info("关闭 http代理服务");
            });
          }
        }
        WSService.broadcast({
          type: "windowCloseResult", data: {
            id: wid,
            code: 200,
            status: 0
          }
        });
        //保存状态关闭
        await this.winDB.update(wid, {
          status: 0,
          closedAt: dbDao.raw("(strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))")
        });


      });
    } else {
      WSService.broadcast({
        type: "windowOpenResult", data: {
          id: wid,
          code: 400,
          status: -1,
          msg: `启动失败获取窗口句柄失败`
        }
      });
      try {
        //启动获取失败
        execSync(`taskkill /PID ${chromeInstance.pid} /F`);
      } catch (err) {
        logger.error(`启动获取失败 强杀进程 出错, ${err.message}`);
      }
    }
  }


  /**
   * 获取主窗口的句柄，只针对Chrome有效
   * @param pid
   * @returns {Promise<*|null>}
   * @private
   */
  async _getWindowHandleFromPid(pid) {
    const win = windowApi.enumMainWindows(pid);
    if (win != null) {
      return win.hwnd;
    }
    return null;
  }

  /**
   * 获取句柄尺寸大小
   * @param hwnd
   * @returns {*|null}
   * @private
   */
  _getWindowRect(hwnd) {
    try {
      return windowApi.getWindowRect(hwnd);
    } catch (err) {
      logger.error(`Failed to get window rect for hwnd ${hwnd}`);
      return null;
    }
  }

  /**
   * 窗口排列
   * @param windowHandles
   * @param screen 自定义窗口大小
   * @returns {Promise<void>}
   * @private
   */
  async _autoArrangeWindows(windowHandles, screen = null) {
    const workArea = this._getWorkArea();

    const screenWidth = workArea.width;
    const screenHeight = workArea.height + 20;
    const count = windowHandles.length;
    let cols = Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);
    let width = Math.floor(screenWidth / cols);
    let height = Math.floor(screenHeight / rows);
    //自定义窗口大小
    if (screen != null && screen !== "") {
      this.lastDiyWH = screen;

      width = Math.max(516, screen.width);
      height = Math.max(516, screen.height);
      cols = Math.floor(screenWidth / width);
      rows = Math.floor(workArea.height / height);
    } else {
      this.lastDiyWH = null;
    }

    logger.info(`屏幕信息=${JSON.stringify(workArea)} rows=${rows} cols=${cols} width=${width} height=${height}`);
    for (const [i, hwnd] of windowHandles.entries()) {
      if (!hwnd) continue;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = workArea.left + col * width;
      const y = workArea.top + row * height;
      windowApi.showWindow(hwnd, SW_RESTORE);
      windowApi.moveWindow(hwnd, x, y, width, height, true);
      const rect = this._getWindowRect(hwnd);

      logger.info(`窗口信息 hwnd=${hwnd},rect=${JSON.stringify(rect)}`);
      if (rect) {
        this.windowRects.set(hwnd, {
          x: rect.left,
          y: rect.top,
          width: rect.right - rect.left,
          height: rect.bottom - rect.top,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom
        });
      } else {
        logger.error(`获取本地窗口信息失败 ${hwnd}`);
        this.windowRects.set(hwnd, {
          x: x,
          y: y,
          width: width,
          height: height,
          left: x,
          top: y,
          right: x + width,
          bottom: y + height
        });
      }
    }
  }

  /**
   * 获取屏幕可用分辨率
   * @returns {{top: number, left: number, width: *, height: *}}
   * @private
   */
  _getWorkArea() {
    //SM_CXFULLSCREEN
    const width = windowApi.getSystemMetrics(SM_CXFULLSCREEN);
    const height = windowApi.getSystemMetrics(SM_CYFULLSCREEN);
    return { width, height, left: 0, top: 0 };
  }

  /**
   * 停止同步
   * @returns {Promise<void>}
   * @private
   */
  async _stopSync() {
    if (!this.isSyncing) return;
    try {
      this.isSyncing = false;
      uIOhook.stop();
      this.syncWindows = [];
      this.windowRects.clear();
      this.masterHwnd = null;
      logger.info("Synchronization stopped 成功");
    } catch (error) {
      logger.error(`停止同步器失败, ${error.message}`);
    }

  }

  /**
   * 开始同步
   * @param masterHwnd
   * @param syncHwnds
   * @returns {Promise<void>}
   * @private
   */
  async _startSync(masterHwnd, syncHwnds) {
    if (this.isSyncing) return;
    this.masterHwnd = masterHwnd;

    // await this.autoArrangeWindows([masterHwnd, ...syncHwnds])

    const dipScale = 1;
    // const masterDpi = windowApi.getWindowDpi(masterHwnd) || 96 // 默认标准 DPI
    // const dipScale = masterDpi / 96.0

    const m = this.windowRects.get(masterHwnd);
    this.masterDipWindow = {
      left: Math.floor(m.left * dipScale),
      top: Math.floor(m.top * dipScale),
      right: Math.floor(m.right * dipScale),
      bottom: Math.floor(m.bottom * dipScale)
    };

    this.syncWindows = syncHwnds.filter(hwnd => hwnd !== masterHwnd && hwnd !== null);
    this.isSyncing = true;
    logger.info(`Starting sync: Master HWND: ${this.masterHwnd}, Sync HWNDs: ${this.syncWindows}`);
    this._startEventListeners();
  }

  /**
   * 监听系统键盘与鼠标事件
   * @private
   */
  _startEventListeners() {
    uIOhook.on("input", (event) => {
      if (event.type === EventType.EVENT_MOUSE_WHEEL || event.type === EventType.EVENT_MOUSE_CLICKED) {
        this._handleMouseEvent(event);
      } else if (event.type === EventType.EVENT_KEY_PRESSED || event.type === EventType.EVENT_KEY_RELEASED) { //键盘按下事件
        this._handleKeyBoardEvent(event);
      }
    });
    uIOhook.start();
    logger.info("uIOhook event listeners started");
  }

  /**
   * 构建win 16进制参数
   * @param low
   * @param high
   * @returns {number}
   * @private
   */
  _makeLong(low, high) {
    low = low & 0xFFFF;
    high = high & 0xFFFF;
    return low | (high << 16);
  }

  /**
   * 鼠标事件回调
   * @param event
   * @returns {Promise<void>}
   * @private
   */
  async _handleMouseEvent(event) {
    if (!this.isSyncing) return;

    const x = event.x;
    const y = event.y;

    // 在DIP计算过的主控主窗口界面内
    if (!this.masterDipWindow || (
      x < this.masterDipWindow.left ||
      x > this.masterDipWindow.right ||
      y < this.masterDipWindow.top ||
      y > this.masterDipWindow.bottom)) {
      return;
    }


    // const masterDpi = windowApi.getWindowDpi(this.masterHwnd) || 96 // 默认标准 DPI
    // const dipScale = masterDpi / 96.0
    const dipScale = 1;
    let currentInfo = windowApi.getForegroundInfo();
    if (currentInfo.hwnd !== this.masterHwnd && currentInfo.parentHwnd !== this.masterHwnd) {
      return;
    }

    const isMaster = currentInfo.hwnd === this.masterHwnd;
    //触发控件与主窗口计算 定位相对位置
    const masterPos = this.windowRects.get(this.masterHwnd);
    //更新DIP缩放值
    // if (Math.floor(masterPos.bottom * dipScale) !== this.masterDipWindow.bottom) {
    //   this.masterDipWindow = {
    //     left: Math.floor(masterPos.left * dipScale),
    //     top: Math.floor(masterPos.top * dipScale),
    //     right: Math.floor(masterPos.right * dipScale),
    //     bottom: Math.floor(masterPos.bottom * dipScale)
    //   }
    // }


    //DIP计算方式
    let relX = (x - currentInfo.left * dipScale) / (currentInfo.right * dipScale - currentInfo.left * dipScale);
    let relY = (y - currentInfo.top * dipScale) / (currentInfo.bottom * dipScale - currentInfo.top * dipScale);


    let posX = currentInfo.left - masterPos.left;
    let posY = currentInfo.top - masterPos.top;


    for (const hwnd of this.syncWindows) {
      let lparam;
      let targetHwnd;
      if (isMaster) {//是主句柄窗口
        const salvePos = this.windowRects.get(hwnd);
        // 映射到从属窗口的客户区坐标（基于标准 DPI）
        const clientX = Math.floor((salvePos.right - salvePos.left) * relX);
        const clientY = Math.floor((salvePos.bottom - salvePos.top) * relY);
        lparam = this._makeLong(clientX, clientY);
        targetHwnd = hwnd;
      } else {//子窗口句柄
        const targetResult = windowApi.findTargetWindow(hwnd, posX, posY, dipScale);
        if (!targetResult) continue;
        // 映射到从属窗口的客户区坐标（基于标准 DPI）
        const clientX = Math.floor((targetResult.right - targetResult.left) * relX);
        const clientY = Math.floor((targetResult.bottom - targetResult.top) * relY);
        lparam = this._makeLong(clientX, clientY);
        targetHwnd = targetResult.hwnd;

      }

      // 确保从属窗口为前台窗口（包括弹窗）
      switch (event.type) {
        case EventType.EVENT_MOUSE_CLICKED:
          if (event.button === 1) {
            this.lastMouseClick = { x: x, y: y };
            windowApi.postMessage(targetHwnd, WM_LBUTTONDOWN, 1, lparam);
            windowApi.postMessage(targetHwnd, WM_LBUTTONUP, 0, lparam);
          } else if (event.button === 2) {
            windowApi.postMessage(targetHwnd, WM_RBUTTONDOWN, 2, lparam);
            windowApi.postMessage(targetHwnd, WM_RBUTTONUP, 0, lparam);
          }
          break;
        case EventType.EVENT_MOUSE_WHEEL:
          if (event.ctrlKey) {
            if (event.rotation > 0) {
              windowApi.postMessage(targetHwnd, WM_KEYDOWN, VK_CONTROL, 0);
              windowApi.postMessage(targetHwnd, WM_KEYDOWN, 0xBD, 0);
              windowApi.postMessage(targetHwnd, WM_KEYUP, 0xBD, 0);
              windowApi.postMessage(targetHwnd, WM_KEYUP, VK_CONTROL, 0);
            } else {
              windowApi.postMessage(targetHwnd, WM_KEYDOWN, VK_CONTROL, 0);
              windowApi.postMessage(targetHwnd, WM_KEYDOWN, 0xBB, 0);
              windowApi.postMessage(targetHwnd, WM_KEYUP, 0xBB, 0);
              windowApi.postMessage(targetHwnd, WM_KEYUP, VK_CONTROL, 0);
            }
          } else {
            const vkCode = event.rotation > 0 ? VK_DOWN : VK_UP;
            const repeatCount = Math.min(event.amount, 6);
            for (let i = 0; i < repeatCount; i++) {
              windowApi.postMessage(targetHwnd, WM_KEYDOWN, vkCode, 0);
              windowApi.postMessage(targetHwnd, WM_KEYUP, vkCode, 0);
            }
          }
          break;
      }

    }
  }

  /**
   * 键盘事件回调
   * @param event
   * @returns {Promise<void>}
   * @private
   */
  async _handleKeyBoardEvent(event) {
    if (!this.isSyncing) return;

    const winCode = this._convertLinuxToWindowsKeycode(event.keycode);
    if (!winCode) {
      return;
    }
    // 在DIP计算过的主控主窗口界面内
    if (
      this.lastMouseClick.x < this.masterDipWindow.left ||
      this.lastMouseClick.x > this.masterDipWindow.right ||
      this.lastMouseClick.y < this.masterDipWindow.top ||
      this.lastMouseClick.y > this.masterDipWindow.bottom) {
      return;
    }

    const currentInfo = windowApi.getForegroundInfo();

    if (currentInfo.hwnd !== this.masterHwnd && currentInfo.parentHwnd !== this.masterHwnd) {
      return;
    }

    const isMaster = currentInfo.hwnd === this.masterHwnd;

    //触发控件与主窗口计算 定位相对位置
    const masterPos = this.windowRects.get(this.masterHwnd);
    let posX = currentInfo.left - masterPos.left;
    let posY = currentInfo.top - masterPos.top;

    // const masterDpi = windowApi.getWindowDpi(this.masterHwnd) || 96 // 默认标准 DPI
    // const dipScale = masterDpi / 96.0

    const dipScale = 1;
    //功能键/快捷键
    const isFastKey = this.linuxFunctionKeys[event.keycode];

    let charCode = -1;
    if (!isFastKey) { //不是功能键/快捷键
      let finalChar = this._getCharFromKeycode(winCode, event.shiftKey);
      if (finalChar) {
        // 验证字符是否为有效 Unicode（0-65535）
        charCode = finalChar.charCodeAt(0);
      }

    }


    for (const hwnd of this.syncWindows) {
      let targetHwnd;
      if (isMaster) {//是主句柄窗口
        targetHwnd = hwnd;
      } else {//子窗口句柄
        const targetResult = windowApi.findTargetWindow(hwnd, posX, posY, dipScale);
        if (!targetResult) continue;
        targetHwnd = targetResult.hwnd;
      }

      //处理 Ctrl 组合键
      if (event.ctrlKey) {
        // 发送 Ctrl 按下
        windowApi.postKeyMessage(targetHwnd, WM_KEYDOWN, VK_CONTROL, 0, event.shiftKey);
        if (event.type === EventType.EVENT_KEY_PRESSED) {
          if (this.combination[event.keycode]) {
            //处理常用组合键
            windowApi.postKeyMessage(targetHwnd, WM_KEYDOWN, winCode, 0, event.shiftKey);
            windowApi.postKeyMessage(targetHwnd, WM_KEYUP, winCode, 0, event.shiftKey);
          }
        }
        windowApi.postKeyMessage(targetHwnd, WM_KEYUP, VK_CONTROL, 0, event.shiftKey);
        continue;
      }

      //处理普通按键
      if (isFastKey) {
        windowApi.postKeyMessage(targetHwnd, WM_KEYDOWN, winCode, 0, event.shiftKey);
        // 发送按键消息
        if (event.type === EventType.EVENT_KEY_PRESSED) {
          windowApi.postKeyMessage(targetHwnd, WM_CHAR, winCode, 0, event.shiftKey);
        }
        // else if (event.type === EventType.EVENT_KEY_RELEASED) {
        //   windowApi.postKeyMessage(targetHwnd, WM_KEYUP, winCode, 0, event.shiftKey);
        // }
      } else { // 处理普通字符（数字、字母、符号等）
        if (event.type === EventType.EVENT_KEY_PRESSED) {
          if (charCode >= 0 && charCode <= 0xFFFF) {


            windowApi.postKeyMessage(targetHwnd, WM_CHAR, charCode, 0, event.shiftKey);
          }
        }
      }


    }
  }


  /**
   * 辅助方法：从 Linux 键码转换为 Windows 虚拟键码
   * @param linuxKeycode
   * @returns {*|null}
   * @private
   */
  _convertLinuxToWindowsKeycode(linuxKeycode) {
    return linuxToWindowsMap[linuxKeycode] || null; // 返回 null 表示未映射的键
  }


  /**
   * 辅助方法：从 Windows 虚拟键码和 shift 状态获取字符
   * @param winVkCode
   * @param isShift
   * @returns {*|null|string}
   * @private
   */
  _getCharFromKeycode(winVkCode, isShift) {
    // 数字键
    if (winVkCode >= 0x30 && winVkCode <= 0x39) { // 0-9
      const baseChars = "0123456789";
      const shiftChars = ")!@#$%^&*(";
      return isShift ? shiftChars[winVkCode - 0x30] : baseChars[winVkCode - 0x30];
    }
    // 字母键
    else if (winVkCode >= 0x41 && winVkCode <= 0x5A) { // A-Z
      const char = String.fromCharCode(winVkCode);
      return isShift ? char : char.toLowerCase();
    }
    // 符号键（如 ;, =, ,, -, .）
    else if (winVkCode >= 0xBA && winVkCode <= 0xC0) { // OEM 符号键
      const baseChars = ";=,-./`";
      const shiftChars = ":+<>_?~";
      return isShift ? shiftChars[winVkCode - 0xBA] : baseChars[winVkCode - 0xBA];
    }
    // 符号键（如 [, ], ', \）
    else if (winVkCode >= 0xDB && winVkCode <= 0xDE) { // OEM 符号键
      const baseChars = "[\\],`";
      const shiftChars = "{|}\"~";
      return isShift ? shiftChars[winVkCode - 0xDB] : baseChars[winVkCode - 0xDB];
    }
    return null; // 未识别的键返回 null
  }

  /**
   * 创建HTTP代理
   * @param winData
   * @returns {Promise<{proxyServer: Server, proxyUrl: string}>}
   */
  async createHttpProxy(winData) {
    const listenPort = await getPort({ port: portNumbers(this.lastProxyPort, 40000) });
    const oldProxyUrl = `http://${winData.account}:${winData.password}@${winData.ip}:${winData.port}`;
    const newProxyUrl = await ProxyChain.anonymizeProxy({
      url: oldProxyUrl,
      port: listenPort
    });

    const proxyServer = new ProxyChain.Server({
      port: listenPort
    });
    // 监听错误事件
    proxyServer.on("error", (error) => {
      logger.error(`代理服务器启动失败  e: ${error.message}`);
    });


    this.lastProxyPort = listenPort + 1;

    return {
      proxyServer,
      proxyUrl: newProxyUrl
    };
  }

  /**
   * 创建Socks代理
   * @param winData
   * @returns {Promise<{proxyServer, proxyUrl: string}>}
   */
  async createSocksProxy(winData) {
    // const listenPort = await getPort({ port: getPort.makeRange(30000, 40000) });
    const listenPort = await getPort({ port: portNumbers(this.lastProxyPort, 40000) });
    const listenHost = this.HOST;
    const proxyServer = SocksServer({
      listenHost: listenHost,
      listenPort: listenPort,
      socksHost: winData.ip,
      socksPort: +winData.port,
      socksUsername: winData.account,
      socksPassword: winData.password
    });

    //监听回调
    proxyServer.on("connect:error", err => {
      logger.error(`Socks连接出错  e: ${err.message}`);
    });

    this.lastProxyPort = listenPort + 1;

    return {
      proxyServer,
      proxyUrl: `http://${listenHost}:${listenPort}`
    };

  }


  /**
   * 获取可用端口号
   * @returns {Promise<number>}
   */
  async getAvailablePort() {
    for (let attempts = 0; attempts < 10; attempts++) {
      try {
        const p = await getPort({ port: portNumbers(this.lastChromePort, 20000) }); // 成功绑定后返回
        this.lastChromePort = p + 1;
        return p;
      } catch (error) {
        logger.error(`端口已占用:${error.message}`);
      }
    }
    logger.error(`使用本地端口`);
    this.lastChromePort = this.lastChromePort + 1;
    return this.lastChromePort;
  };

}

// 导出单例实例
export default new WindowService();
