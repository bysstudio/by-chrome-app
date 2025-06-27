import { app, shell, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, dialog } from "electron";
import path, { join } from "path";
import express from "express";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/logo.png?asset";
import { ByDB } from "./server/db/DbDao.js";
import windowRouter from "./server/windowApi";  //window窗口相关操作
import proxyRouter from "./server/proxyApi";  //代理相关操作
import peripheralRouter from "./server/peripheralApi";  //周边相关操作
import configRouter from "./server/configApi";  //配置相关操作
import tagRouter from "./server/tagApi";  //tag相关操作
import groupRouter from "./server/groupApi"; //分组相关操作
import cors from "cors";
import * as url from "node:url";
import logger from "./logger/logger";

import WSService from "./server/service/WSService";
import WindowService from "./server/service/WindowService";
import getPort from "./server/utlis/getPort";

const dao = new ByDB();
//初始化WEB服务器
const server = express();

server.use(cors({
  origin: "*", // 生产环境建议指定具体域名
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: "*",
  credentials: true
}));

// 解析 JSON 请求体
server.use(express.json());
// 挂载路由
server.use("/window", windowRouter);
server.use("/proxy", proxyRouter);
server.use("/peripheral", peripheralRouter);
server.use("/config", configRouter);
server.use("/tag", tagRouter);
server.use("/group", groupRouter);

//错误处理中间件
server.use((err, req, res, next) => {
  console.error("错误处理中间件",err)
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});


// 用异步函数包裹逻辑
async function getServerPort() {
  //动态
 // return is.dev ? 3000 : await getPort({ port: 3000 });
  return 3000
}

// 动态分配端口（开发环境固定3000，生产环境动态获取）
// 初始化后使用端口
let PORT;
getServerPort().then(port => {
  PORT = port;
  // 启动服务器并监听端口（根据需要更改端口号）
  server.listen(PORT, () => {
    logger.info(`Express服务器启动中 端口号 ${PORT}, http://localhost:${PORT}/`);
  });
});

// 获取WS的端口
async function getWsPort() {
 // return is.dev ? 3001 : await getPort({ port: 3001 });
  return 3001
}

// 初始化WS
let WSPORT;
getWsPort().then(port => {
  WSPORT = port;
  WSService.start(WSPORT);
});


let mainWindow;
let tray;
// 自定义变量来标记是否正在退出应用
let isQuitting = false;


// 监听未捕获异常
process.on("uncaughtException", (error) => {
  logger.error(`监听未捕获异常 ${error.message}`);
});

// 监听未处理的Promise拒绝
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`监听未处理的Promise拒绝 at ${promise} reason: ${reason}`);
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    title: "BY多窗口同步器",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      webSecurity: false, // 允许跨域
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      scrollbars: false, // 禁用滚动条
      nodeIntegration: false, // 必须关闭
      contextIsolation: true  // 必须开启
    }
  });


  const portData = {
    http: PORT,
    ws: WSPORT
  };

  // index.js 的 createWindow() 函数内
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("set-port", portData); // 发送端口
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    // mainWindow.loadFile(path.join(__dirname, '../renderer/view.html'))
    const startUrl = process.env.ELECTRON_START_URL || url.format({
      pathname: path.join(__dirname, "../renderer/index.html"),
      protocol: "file:",
      slashes: true
    });

    mainWindow.loadURL(startUrl);
  }
  if (process.platform !== "darwin") {
    //注册快捷键：Ctrl+Shift+D（Windows）或Command+Shift+D（Mac）
    globalShortcut.register("CommandOrControl+Shift+D", () => {
      mainWindow.webContents.openDevTools();
    });
  } else {
    globalShortcut.register("Ctrl+Shift+D", () => {
      mainWindow.webContents.openDevTools();
    });
  }

  // 监听窗口关闭事件
  mainWindow.on("close", (e) => {
    if (isQuitting) {
      tray.destroy();
      WindowService.closeAll();
      WSService.stop();
      mainWindow = null;
    } else {
      logger.info("监听窗口关闭事件");
      e.preventDefault();
      mainWindow.hide();
    }
  });


  const ALLOWED_EXTENSIONS = new Set([
    "exe", "dll", "png", "jpg",
    "doc", "pdf", "xlsx" // 白名单机制
  ]);

  //// 暴露文件夹选择对话框  type= 'openFile' | 'openDirectory'
  ipcMain.handle(
    "common-choose-path",
    //
    async (_, type = "openDirectory") => {

      // 参数安全验证
      if (!["openFile", "openDirectory", "multiSelections"].includes(type)) {
        throw new Error(`非法对话框类型: ${type}`);
      }
      // 关联到当前窗口
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];

      try {

        const result = await dialog.showOpenDialog(win, {
          properties: [type], // 动态类型注入
          title: type === "openDirectory" ? "选择文件夹" : "选择chrome.exe",
          buttonLabel: type === "openDirectory" ? "选择该文件夹" : "选择chrome.exe"
        });

        return result.canceled ? null :
          type === "multiSelections" ? result.filePaths : result.filePaths[0];
      } catch (err) {
        console.error("路径选择失败:", err);
        return null;
      }
    }
  );
}

function createTray() {

  // 确保图标文件存在，并且路径正确
  try {
    tray = new Tray(icon);
  } catch (error) {
    logger.error("加载托盘图标时出错:", error);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示窗口",
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: "退出",
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip("BY多窗口同步器");
  tray.setContextMenu(contextMenu);

  // 点击托盘图标显示窗口
  tray.on("click", () => {
    mainWindow.show();
  });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on("ping", () => logger.info("pong"));


  createWindow();
  createTray();
  dao.initDatabase();
  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
