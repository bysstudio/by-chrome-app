import { dbDao } from "./DbDao";
import logger from "../../logger/logger";

export class ProxyDB {
  constructor() {
    this.dbFields = [
      "id",
      "type",
      "ip",
      "port",
      "account",
      "password",
      "proxy",
      "timezone",
      "countryCode",
      "country",
      "countryCN",
      "location",
      "latitude",
      "longitude",
      "language",
      "gateway",
      "checkStatus",
      "checkData",
      "remark",
      "createdAt",
      "updatedAt"
    ];
  }

  //查询
  async all(query, params) {
    try {
      // 初始化查询构建器，选择要查询的表
      let eq = dbDao("proxy");
      if (Object.keys(params).length > 0) {
        if (params.orderBy && params.orderBy !== "") {
          if (params.desc && params.desc !== "") {
            eq = eq.orderBy(`proxy.${params.orderBy}`, params.desc.toLowerCase());
          } else {
            eq = eq.orderBy(`proxy.${params.orderBy}`, "desc");
          }
        } else {
          eq = eq.orderBy("proxy.id", "desc");
        }

        if (params.pageNum && params.pageNum > 1) {
          eq = eq.offset((params.pageNum - 1) * params.pageSize);
        }
        if (params.pageSize && params.pageSize > 0) {
          eq = eq.limit(params.pageSize);
        } else {
          eq = eq.limit(10);
        }

      }
      if (Object.keys(query).length > 0) {
        for (const [key, value] of Object.entries(query)) {
          //排除空值
          if (value && value !== "") {
            eq = eq.where(`proxy.${key}`, value);
          }
        }
      }
      eq = eq.leftJoin("window", "window.proxyId", "=", "proxy.id");
      const result = await eq.select("proxy.*")
        .select(dbDao.raw("json_group_array(window.id) as wid"))
        .groupBy("proxy.id", "proxy.ip");
      // 解析 wids 为数组
      return result.map(row => ({
        ...row,
        wids: row.wid && row.wid !== "[null]" ? JSON.parse(row.wid) : []
      }));
    } catch (error) {
      logger.error(`查询失败 ${error.message}`);
      throw new Error(error.message);
    }

  };

  async getTotal(query) {
    let eq = dbDao("proxy");
    if (Object.keys(query).length > 0) {
      for (const [key, value] of Object.entries(query)) {
        //排除空值
        if (value && value !== "") {
          eq = eq.where(key, value);
        } else {
          eq = eq.whereNull(key);
        }
      }
    }
    const result = await eq.count("id as count").first();
    return result.count;
  }


  async getById(id) {
    const result = await dbDao("proxy")
      .where("proxy.id", id)
      .leftJoin("window", "window.proxyId", "=", "proxy.id")
      .select("proxy.*")
      .select(dbDao.raw("json_group_array(window.id) as wid"))
      .groupBy("proxy.id", "proxy.ip").first();

    return {
      ...result,
      wids: result.wid && result.wid !== "[null]" ? JSON.parse(result.wid) : []
    };
  }


  async getBaseById(id) {
    return dbDao("proxy")
      .where("id", id)
      .select(
        "id",
        "type",
        "ip",
        "port",
        "account",
        "password",
        "timezone",
        "country",
        "countryCN",
        "language",
        "latitude",
        "longitude",
        "remark"
      ).first();
  }


  async getBatchByIds(ids) {
    return dbDao("proxy")
      .whereIn("id", ids)
      .select("*");
  }


  async create(proxyData) {
    try {
      //遍历表单对象，删除不在数据库的属性
      const cleanData = Object.keys(proxyData)
        .filter(key => this.dbFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = proxyData[key];
          return obj;
        }, {});


      const [id] = await dbDao("proxy").insert(cleanData);
      return { id, ...cleanData };
    } catch (error) {
      logger.error(`创建代理失败 ${error.message}`);
      throw new Error(error.message);
    }

  };

  async importProxies(proxies) {
    if (proxies === null || proxies === undefined || proxies.length === 0) {
      return Promise.reject("代理批量导入失败");
    }
    try {
      return await dbDao("proxy").insert(proxies);
    } catch (error) {
      logger.error(`importProxies ${error.message}`);
      throw new Error(error.message);
    }

  };


  async update(id, updatedData) {
    try {
      //遍历表单对象，删除不在数据库的属性
      const cleanData = Object.keys(updatedData)
        .filter(key => this.dbFields.includes(key))
        .reduce((obj, key) => {
          if (key !== "id") { //忽略ID
            obj[key] = updatedData[key];
          }
          return obj;
        }, {});


      // delete cleanData.id
      await dbDao("proxy")
        .where({ id })
        .update({ ...cleanData, updatedAt: dbDao.raw("strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')") });
      return true;
    } catch (error) {
      throw new Error("更新代理失败" + error.message);
    }
  };

  async remove(id) {
    const one = await dbDao("window")
      .select("id,proxyId")
      .where("proxyId", id).first();
    if (one) { // 或者返回相关信息
      throw new Error("代理在使用中，无法删除" + one.id);
    }
    try {
      await dbDao("proxy").delete().where({ id });
      return true;
    } catch (error) {
      logger.error(`删除代理失败 ${error.message}`);
      throw new Error(error.message);
    }
  };

  async deleteAll() {
    // 首先，检查这些 IDs 是否被 window 表所引用
    const referencedIds = await dbDao("window")
      .select("proxyId")
      .where("proxyId", ">", 0)
      .then(rows => rows.map(row => row.proxyId));

    // 如果有被引用的 ID，可以选择抛出错误或者返回相关信息
    if (referencedIds.length > 0) {
      // 或者返回相关信息
      throw new Error("deleteAll 代理在使用中，无法删除" + referencedIds);
    } else {
      try {
        await dbDao("proxy").delete();
        return true;
      } catch (error) {
        logger.error(`删除代理失败 ${error.message}`);
        throw new Error(error.message);
      }
    }
  };

  async batchRemove(ids) {

    // 首先，检查这些 IDs 是否被 window 表所引用
    const referencedIds = await dbDao("window")
      .select("proxyId")
      .whereIn("proxyId", ids)
      .then(rows => rows.map(row => row.proxyId));

    // 如果有被引用的 ID，可以选择抛出错误或者返回相关信息
    if (referencedIds.length > 0) {
      throw new Error("代理在使用中，无法删除" + referencedIds);
      // 或者返回相关信息
    } else {
      try {
        await dbDao("proxy").delete().whereIn("id", ids);
        return true;
      } catch (error) {
        logger.error(`batchRemove： ${error.message}`);
        throw new Error(error.message);
      }
    }

  };
}




