import { app } from "electron";
import { join } from "path";
import { WindowDB } from "./WindowDB";
import { existsSync, mkdirSync } from "fs";

import knex from "knex";
import logger from "../../logger/logger";


function getDbPath() {
  let dbPath;
  try {
    dbPath = join(app.getPath("userData"), "by.sqlite");
  } catch {
    // 默认的开发数据库位置，或其他你选择的位置
    dbPath = join(__dirname, "by.sqlite");
  }
  logger.info("数据库保存位置", dbPath);
  return dbPath;
}

const dbDao = knex({
  client: "sqlite3", // or 'better-sqlite3'
  connection: {
    filename: getDbPath(),
  },
  debug: false, // 关键配置
  useNullAsDefault: true
});

class ByDB {
  constructor() {
    this.windb = new WindowDB();
  }

  // 初始化数据库表
  async initDatabase() {
    const userDataPath = app.getPath("userData");
    // 确保目录存在
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true });
    } else {
      logger.info(`软件目录=${userDataPath},数据库位置=${getDbPath()}`);
    }

    try {
      await this.createWindowTable();
      await this.createProxyTable();
      await this.createTagTable();
      await this.createTagBinWinTable();
      await this.createGroupTable();
      await this.createConfigTable();
      //重置Win状态
      await this.windb.resetStatus();
      logger.info("初始化数据库成功");
    } catch (error) {
      logger.error("初始化数据库失败:", error);
    }
  }

  // 创建 window 表
  async createWindowTable() {
    const exists = await dbDao.schema.hasTable("window");
    if (!exists) {
      await dbDao.schema.createTable("window", (table) => {
        table.increments("id").primary();  //ID
        table.integer("groupId"); //分组ID
        table.integer("proxyId"); //代理ID
        table.string("name").notNullable(); //自定义名称
        table.string("profile").notNullable(); //随机生成环境名称/也是缓存文件夹名称
        table.integer("status").defaultTo(0); //状态 0未运行 -1打开异常  1打开成功
        table.string("dir");  //缓存文件路径
        table.text("fingerprint");  //指纹信息
        table.text("cookie");  //缓存
        table.string("remark");  //备注
        table.timestamp("createdAt").defaultTo(dbDao.raw("(strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))"));  //创建时间
        table.timestamp("updatedAt");  //更新时间
        table.timestamp("openedAt");  //打开时间
        table.timestamp("closedAt");  //关闭时间
      });
      logger.info("Window table created successfully");
    } else {
      logger.info("Window表初始化成功");
    }
  }

  // 创建 proxy 表
  async createProxyTable() {
    const exists = await dbDao.schema.hasTable("proxy");
    if (!exists) {
      await dbDao.schema.createTable("proxy", (table) => {
        table.increments("id").primary();  //ID
        table.string("type").notNullable();  //类型 SOCKS5 HTTP  HTTPS
        table.string("ip").notNullable();  //ip
        table.integer("port").notNullable();  //端口号
        table.string("account");  //账号
        table.string("password");  //密码
        table.string("proxy").notNullable();  //原始数据 SOCKS5
        table.string("timezone");  //时区
        table.string("countryCode");  //IP归属国家编号
        table.string("country");  //IP归属国家名称 US
        table.string("countryCN");  //归属国家中文名称
        table.string("location");  //具体位置
        table.string("latitude");  //纬度（WGS84 坐标系）
        table.string("longitude");  //经度（WGS84 坐标系）
        table.string("language");  //IP归属国家的语言，zh-CN  en-US
        table.string("gateway");  //检测IP方式
        table.integer("checkStatus").defaultTo(0);  //检测代理状态 -1不可用  0未检测 1可用  100检测中
        table.text("checkData");  //检测结果
        table.string("remark");  //备注
        table.timestamp("createdAt").defaultTo(dbDao.raw("(strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))"));  //创建时间
        table.timestamp("updatedAt");  //更新时间
      });
      logger.info("Proxy table created successfully");
    } else {
      logger.info("Proxy表初始化成功");
    }
  }


// 创建 tag 表
  async createTagTable() {
    const exists = await dbDao.schema.hasTable("tag");
    if (!exists) {
      await dbDao.schema.createTable("tag", (table) => {
        table.increments("id").primary();
        table.string("name");
        table.string("color");
      });
      logger.info("Tag table created successfully");
    } else {
      logger.info("Tag表初始化成功");
    }
  }

// 创建 tag 与win 绑定关系
  async createTagBinWinTable() {
    const exists = await dbDao.schema.hasTable("tagbing");
    if (!exists) {
      await dbDao.schema.createTable("tagbing", (table) => {
        table.integer("wid");
        table.integer("tid");
      });
      logger.info("TagBing table created successfully");
    } else {
      logger.info("TagBing表初始化成功");
    }
  }

// 创建 group 表
  async createGroupTable() {
    const exists = await dbDao.schema.hasTable("group");
    if (!exists) {
      await dbDao.schema.createTable("group", (table) => {
        table.increments("id").primary();
        table.string("name");
        table.string("color");
      });
      logger.info("Group table created successfully");
    } else {
      logger.info("Group表初始化成功");
    }
  }

  async createConfigTable() {
    const exists = await dbDao.schema.hasTable("config");
    if (!exists) {
      await dbDao.schema.createTable("config", (table) => {
        table.increments("id").primary();
        table.string("cachePath");
        table.string("chromePath");
      });
      logger.info("Config table created successfully");
    } else {
      logger.info("Config表初始化成功");
    }
  }

}

export { dbDao, ByDB };



