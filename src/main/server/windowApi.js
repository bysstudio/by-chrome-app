//express服务器
import express from "express";

import { parseQuery, resFail, resOk } from "./utlis/resutil";


import { WindowDB } from "./db/WindowDB";
import WindowService from "./service/WindowService";
import generateFingerprint from "./utlis/getFingerprint";
import { readdir } from "fs/promises";
import { statSync } from "fs";

import path from "path";


const router = express.Router();

const db = new WindowDB();

/**
 * 查询列表 支持分页与筛选操作
 */
router.get("/list", async (req, res) => {
  const data = parseQuery(req.query);
  try {
    const windowData = await db.all(data.query, data.params);
    let total = await db.getTotal(data.query, data.params);
    res.send(resOk({ data: windowData, total: total }));
  } catch (err) {
    res.send(resFail(err.message));
  }
});
/**
 * 根据ID获取环境信息
 */
router.get("/info", async (req, res) => {
  const { id } = req.query;
  if (id) {
    try {
      const windowData = await db.getById(id);
      res.send(resOk({ data: windowData }));
    } catch (error) {
      res.send(resFail(error.message));
    } finally {

    }
  } else {
    res.send(resFail("环境ID不能为空"));
  }
});

/**
 * 目录导入
 */
router.post("/adsinput", async (req, res) => {
  if (!req.body) {
    res.send(resFail("请求Body不能为空"));
    return;
  }
  const { dirPath } = req.body;
  if (dirPath) {
    await db.adsInput(dirPath);
    res.send(resOk({ data: "" }));
  } else {
    res.send(resFail("路径PATH不能为空"));
  }
});

/**
 * 创建环境
 */
router.post("/create", async (req, res) => {
  if (!req.body) {
    res.send(resFail("请求Body不能为空"));
    return;
  }
  try {
    const data = await db.create(req.body);
    res.send(resOk({ data: data, msg: "创建环境成功" }));
  } catch (err) {
    res.send(resFail(err.message));
  }
});


/**
 * 批量创建环境
 */
router.post("/batchCreate", async (req, res) => {
  if (!req.body) {
    res.send(resFail("请求Body不能为空"));
    return;
  }
  let num = req.body.num;
  if (!num || num < 1) {
    res.send(resFail("环境数量不能小于1"));
    return;
  }
  await db.batchCreate(num);
  res.send(resOk({ data: "", msg: "批量创建环境成功" }));
});

/**
 * 生成指纹信息
 */
router.get("/fingerprint", async (req, res) => {
  res.send(resOk({ data: generateFingerprint("", ""), msg: "操作成功" }));
});

/**
 *生成唯一ID
 */
router.get("/generateProfile", async (req, res) => {
  const profile = await db.generateProfile();
  res.send(resOk({ data: profile, msg: "操作成功" }));
});

/**
 * 批量删除环境
 */
router.delete("/delete", async (req, res) => {
  const { ids } = req.body;
  if (ids) {
    try {
      await db.batchRemove(JSON.parse(ids));
      res.send(resOk({ msg: `删除环境ID${ids}成功` }));
    } catch (error) {
      res.send(resFail(error.message));
    }
  } else {
    res.send(resFail("环境ID不能为空"));
  }
});


/**
 * 更新环境数据
 */
router.put("/update", async (req, res) => {
  const { id, data } = req.body;
  if (!id || !data) {
    res.send(resFail("更新数据不能为空"));
    return;
  }
  try {
    await db.update(id, data);
    res.send(resOk({ msg: `修改环境ID${id}数据成功` }));
  } catch (err) {
    res.send(resFail(err.message));
  }
});

/**
 * 绑定tags
 */
router.put("/bingTag", async (req, res) => {
  const { id, data } = req.body;
  if (!id || !data) {
    res.send(resFail("更新数据不能为空"));
    return;
  }
  try {
    await db.bingTag(id, data);
    res.send(resOk({}));
  } catch (err) {
    res.send(resFail(err.message));
  }
});

/**
 * 自动绑定代理
 */
router.get("/autoBingProxy", async (req, res) => {
  const { num } = req.query;
  if (!num || num < 1) {
    res.send(resFail("绑定数量不能为空"));
  }
  console.log("提交的表单", num);
  try {
    await db.batchBingProxy(Number(num));
    res.send(resOk({ data: null }));
  } catch (error) {
    console.error(error);
    res.send(resFail(error.message));
  }
});

/**
 * 批量解绑代理
 */
router.put("/batchClearProxy", async (req, res) => {
  const { data } = req.body;
  try {
    await db.batchClearProxy(data);
    res.send(resOk({}));
  } catch (err) {
    res.send(resFail(err.message));
  }
});
/**
 * 批量操作标签
 */
router.post("/batchOpTag", async (req, res) => {
  const data = req.body;
  if (!data) {
    res.send(resFail("数据不能为空"));
  }
  try {
    await db.batchOpTag(data);
    res.send(resOk({ data: null }));
  } catch (error) {
    res.send(resFail(error.message));
  }
});
/**
 * 批量操作备注
 */
router.post("/batchOpRemark", async (req, res) => {
  const data = req.body;
  if (!data) {
    res.send(resFail("数据不能为空"));
  }
  try {
    await db.batchOpRemark(data);
    res.send(resOk({ data: null }));
  } catch (error) {
    res.send(resFail(error.message));
  }
});


//下面为操作打开环境相关的接口

/**
 * 获取已打开的环境列表
 */
router.get("/openList", async (req, res) => {
  try {
    const data = await db.getOpenedWindows();
    res.send(resOk({ data: data, total: data.length }));
  } catch (error) {
    res.send(resFail(error.message));
  }
});

/**
 * 打开环境
 */
router.post("/open", async (req, res) => {
  const { ids } = req.body;
  if (ids) {
    //后台运行
    WindowService.batchOpen(ids);
    res.send(resOk({ data: null }));

  } else {
    res.send(resFail("打开的环境ID不能为空"));
  }
});
/**
 * 关闭环境
 */
router.post("/close", async (req, res) => {
  const { ids } = req.body;
  WindowService.batchClose(ids);
  res.send(resOk({ data: null }));
});

/**
 * 重置环境
 */
router.get("/resetWin", async (req, res) => {
  const { id } = req.query;
  if (id) {
    await db.resetWinStatus(id);
  }
  res.send(resOk({ data: null }));
});

/**
 * 排序窗口
 */
router.post("/sortWin", async (req, res) => {
  const { ids, screen } = req.body;
  //后台运行
  WindowService.sortWindow(ids, screen);
  //ChromeSync.run(3)
  res.send(resOk({ data: null }));


});

/**
 * 同步器 开始同步
 */
router.post("/syncWin", async (req, res) => {
  const data = req.body;
  //后台运行
  WindowService.startWinSync(data);
  res.send(resOk({ data: null }));
});

/**
 * 停止同步
 */
router.get("/stopSync", async (req, res) => {
  //后台运行
  const status = WindowService.stopWinSync();
  res.send(resOk({ data: status }));
});

/**
 * 获取同步状态
 */
router.get("/syncStatus", async (req, res) => {
  const status = await WindowService.getSyncStatus();
  res.send(resOk({ data: status }));
});

/**
 * 获取同步的窗口列表
 */
router.get("/syncList", async (req, res) => {
  const list = await WindowService.getOpenList();
  res.send(resOk({ data: list }));
});


export default router;
