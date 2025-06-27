import { dbDao } from "./DbDao";
import { randomUniqueProfileId } from "../utlis/random";
import logger from "../../logger/logger";
import generateFingerprint from "../utlis/getFingerprint";
import { readdir } from "fs/promises";
import path from "path";
import { statSync } from "fs";

export class WindowDB {

  constructor() {
    this.dbFields = [
      "id",
      "name",
      "groupId",
      "proxyId",
      "profile",
      "status",
      "dir",
      "fingerprint",
      "cookie",
      "remark",
      "createdAt",
      "updatedAt",
      "openedAt",
      "closedAt"
    ];

  }

  async resetStatus() {
    await dbDao("window").update("status", 0);
  }

  async resetWinStatus(id) {
    await dbDao("window").where("id", id).update({
      status: 0,
      updatedAt: dbDao.raw("strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')")
    });
  }


//查询
  async all(query = {}, params = {}) {
    try {
      // 设置默认参数
      const {
        op = "=",
        orderBy = "id",
        desc = "desc",
        pageNum = 1,
        pageSize = 10
      } = params;

      const con1 = op;
      const con2 = op === "!=" ? "not like" : "like";

      // 初始化查询构建器
      let eq = dbDao("window")
        .leftJoin("group", "window.groupId", "=", "group.id")
        .leftJoin("proxy", "window.proxyId", "=", "proxy.id");

      // 动态选择字段
      const windowFields = [
        "window.id",
        "window.name",
        "window.groupId",
        "window.proxyId",
        "window.profile",
        "window.status",
        "window.dir",
        "window.fingerprint",
        "window.cookie",
        "window.remark",
        "window.createdAt",
        "window.updatedAt",
        "window.openedAt",
        "window.closedAt"
      ];
      const groupFields = [
        "group.name as groupName",
        "group.color as groupColor"
      ];
      const proxyFields = [
        "proxy.ip",
        "proxy.type",
        "proxy.port",
        "proxy.account",
        "proxy.password",
        "proxy.countryCN",
        "proxy.countryCode",
        "proxy.checkStatus"
      ];
      eq = eq.select([...windowFields, ...groupFields, ...proxyFields]);

      // 排序
      if (orderBy && orderBy !== "") {
        eq = eq.orderBy(`window.${orderBy}`, desc);
      }

      // 分页
      const offset = (Math.max(pageNum, 1) - 1) * Math.max(pageSize, 1);
      if (pageNum > 0 && pageSize > 0) {
        if (offset > 0) {
          eq = eq.offset(offset).limit(Math.max(pageSize, 1));
        } else {
          eq = eq.limit(Math.max(pageSize, 1));
        }

      }

      // 构建查询条件
      if (Object.keys(query).length > 0) {
        //标签查询
        if (query.tagId && query.tagId !== "") {
          const ids = await dbDao("tagbing")
            .select("wid")
            .where("tid", query.tagId)
            .pluck("wid");
          eq = con1 === "=" ? eq.whereIn("window.id", ids) : eq.whereNotIn("window.id", ids);
        } else {
          Object.entries(query).forEach(([key, value]) => {
            const field = `window.${key}`;
            if (key !== "column") {
              if (value && value !== "") {
                if (key === "name" || key === "remark" || key === "profile") {
                  eq = eq.where(field, con2, `%${value}%`);
                } else {
                  eq = eq.where(field, con1, value);
                }
              } else {
                if (con1 === "=") {
                  eq = eq.whereNull(field);
                } else {
                  eq = eq.whereNotNull(field);
                }
              }
            }
          });
        }
      }


      // 聚合 tags，过滤 null 值，把关联的tags也获取
      eq = eq
        .leftJoin("tagbing", "window.id", "=", "tagbing.wid")
        .leftJoin("tag", "tagbing.tid", "=", "tag.id")
        .select(
          dbDao.raw(`
          json_group_array(
            CASE
              WHEN tag.id IS NOT NULL AND tag.name IS NOT NULL
              THEN json_object('id', tag.id, 'name', tag.name,'color',tag.color)
              ELSE NULL
            END
          ) as tags
        `)
        )
        .groupBy("window.id"); // 仅按 window.id 分组

      // 执行查询并调试
      const windows = await eq;
      //  console.log('执行查询并调试 Raw Windows:', windows) // 调试：打印原始结果

      // 安全解析 tags 字段
      const result = windows.map((window) => {
        let tags = [];
        try {
          if (window.tags && window.tags !== "[null]") {
            const parsedTags = JSON.parse(window.tags || "[]"); // 默认空数组
            tags = Array.isArray(parsedTags) ? parsedTags.filter((tag) => tag && tag.id !== null && tag.name !== null) : [];
          }
        } catch (e) {
          console.warn("Failed to parse tags for window id:", window.id, e);
        }
        return {
          ...window,
          tags
        };
      });

      return result.length > 0 ? result : [];
    } catch (error) {
      logger.error(`all查询环境失败 ${error.message}`);
      return [];
    }
  }


  async getById(id) {

    try {
      // 验证 id
      if (!id) {
        return null;
      }

      // 初始化查询构建器
      let eq = dbDao("window")
        .where("window.id", id)
        .leftJoin("group", "window.groupId", "=", "group.id")
        .leftJoin("proxy", "window.proxyId", "=", "proxy.id");

      // 动态选择字段
      const windowFields = ["window.*"];
      const groupFields = [
        "group.name as groupName",
        "group.color as groupColor"
      ];
      const proxyFields = [
        "proxy.ip",
        "proxy.type",
        "proxy.port",
        "proxy.account",
        "proxy.password",
        "proxy.country",
        "proxy.countryCode",
        "proxy.countryCN",
        "proxy.checkStatus"
      ];
      eq = eq.select([...windowFields, ...groupFields, ...proxyFields]);

      // 聚合 tags
      eq = eq
        .leftJoin("tagbing", "window.id", "=", "tagbing.wid")
        .leftJoin("tag", "tagbing.tid", "=", "tag.id")
        .select(
          dbDao.raw(`
          json_group_array(
            CASE
              WHEN tag.id IS NOT NULL AND tag.name IS NOT NULL
              THEN json_object('id', tag.id, 'name', tag.name,'color',tag.color)
              ELSE NULL
            END
          ) as tags
        `)
        )
        .groupBy("window.id"); // 按 window.id 分组


      const data = await eq.first();
      if (!data) {
        return null;
      }
      // 安全解析 tags 字段
      let tags = [];
      try {
        if (data.tags && data.tags !== "[null]") {
          const parsedTags = JSON.parse(data.tags || "[]"); // 默认空数组
          tags = Array.isArray(parsedTags) ? parsedTags.filter((tag) => tag && tag.id !== null && tag.name !== null) : [];
        }
      } catch (e) {
        console.warn("Failed to parse tags for window id:", id, e);
      }

      return {
        ...data,
        tags
      };
    } catch (error) {
      console.log("err===", error);
      // logger.error(`查询环境失败 ${error.message}`);
      return null; // 异常时返回 null
    }

  };

  async getTotal(query = {}, params = {}) {
    try {
      // 设置默认参数
      const {
        op = "="
      } = params;
      const con1 = op;
      const con2 = op === "!=" ? "not like" : "like";
      // 初始化查询构建器
      let eq = dbDao("window");
      // 构建查询条件
      if (Object.keys(query).length > 0) {
        if (query.tagId && query.tagId !== "") {
          const ids = await dbDao("tagbing")
            .select("wid")
            .where("tid", query.tagId)
            .pluck("wid");
          eq = con1 === "=" ? eq.whereIn("id", ids)
            : eq.whereNotIn("id", ids);
        } else {
          Object.entries(query).forEach(([key, value]) => {
            const field = key;
            if (field !== "column") {
              if (value && value !== "") {
                if (field === "name" || field === "remark") {
                  eq = eq.where(field, con2, `%${value}%`);
                } else {
                  eq = eq.where(field, con1, value);
                }
              } else {
                if (con1 === "=") {
                  eq = eq.whereNull(field);
                } else {
                  eq = eq.whereNotNull(field);
                }
              }
            }

          });
        }
      }
      const result = await eq.count("id as count").first();
      return result.count;
    } catch (error) {
      return 0;
    }


  }

  /**
   * 获取已打开的环境
   */
  async getOpenedWindows() {
    return this.all({ status: 1 }, { op: "=" });
  };

  /**
   * 批量操作绑定或者删除tag
   * @param data
   * @returns {Promise<void>}
   */
  async batchOpTag(data) {
    if (data.ids.length === 0) {
      return;
    }
    if (data.op === "append") {
      //1.查找已存在的
      const existIds = await dbDao("tagbing")
        .select("wid")
        .whereIn("wid", data.ids)
        .where("tid", data.tid)
        .pluck("wid");  //pluck转换为数组

      // 2. 过滤出需要插入的数据（不存在的数据）
      const dataToInsert = data.ids.filter(item =>
        !existIds.includes(item)
      );

      if (dataToInsert.length > 0) {
        let saveData = [];
        try {
          dataToInsert.forEach(id => {
            saveData.push({ wid: id, tid: data.tid });
          });
          await dbDao("tagbing").insert(saveData);
        } catch (error) {
          logger.error(`批量追加标签失败 ${error.message}`);
          throw new Error("批量追加标签失败" + error.message);
        }
      }

    } else if (data.op === "delete") {
      try {
        await dbDao("tagbing").delete()
          .whereIn("wid", data.ids)
          .where("tid", data.tid);
      } catch (error) {
        logger.error(`批量删除标签失败 ${error.message}`);
        throw new Error("批量删除标签失败" + error.message);
      }
    }
  }


  async batchOpRemark(data) {
    if (data.ids.length === 0) {
      return;
    }
    if (data.op === "append") {
      if (!data.remark || data.remark.length === 0) {
        throw new Error("批量追加备注不能为空");
      }
      try {
        await dbDao("window")
          .update({
            remark: dbDao.raw("COALESCE(remark, \"\") || ?", [data.remark])
          })
          .whereIn("id", data.ids);
      } catch (error) {
        logger.error(`批量追加备注失败 ${error.message}`);
        throw new Error("批量追加备注失败" + error.message);
      }


    } else if (data.op === "update") {
      try {
        await dbDao("window")
          .update({
            remark: data.remark
          })
          .whereIn("id", data.ids);
      } catch (error) {
        logger.error(`批量覆盖备注失败 ${error.message}`);
        throw new Error("批量覆盖备注失败" + error.message);
      }

    }
  }

  async batchClearProxy(ids) {
    //清除全部
    if (ids == null || ids.length === 0) {
      await dbDao("window").update({
        proxyId: null,
        updatedAt: dbDao.raw("strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')")
      });
    } else {
      //已选清除
      await dbDao("window").update({
        proxyId: null,
        updatedAt: dbDao.raw("strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')")
      }).whereIn("id", ids);
    }
  }

  /**
   * 自动绑定代理
   * @param num
   * @returns {Promise<void>}
   */
  async batchBingProxy(num) {
    if (num < 1) {
      return;
    }
    const total = await dbDao("proxy").count("id as count").first();
    if (total.count < 1) {
      return;
    }
    //查询未绑定代理的窗口
    const winList = await dbDao("window").select("id").whereNull("proxyId").pluck("id");
    if (winList.length === 0) {
      return;
    }

    if (num === 1) { //一个IP绑定一个环境
      const useProxy = await dbDao("proxy")
        .select("proxy.id")
        .leftJoin("window", "proxy.id", "window.proxyId")
        .whereNull("window.proxyId").pluck("proxy.id");
      if (useProxy.length > 0) {
        const minNum = Math.min(useProxy.length, winList.length);
        for (let i = 0; i < minNum; i++) {
          await dbDao("window").update({ proxyId: useProxy[i] }).where("id", winList[i]);
        }
      } else {
        throw new Error("无可用的代理/代理已经全部绑定环境");
      }

    } else { //一个IP绑定多个环境
      //在Knex.js + SQLite3 中，若需要同时返回 A表记录的 id 和对应的 B 表引用次数（包括次数 <num 的记录）
      const result = await dbDao("proxy")
        .select([
          "proxy.id",
          dbDao.raw("COUNT(window.proxyId) AS count")
        ])
        .leftJoin("window", "proxy.id", "window.proxyId")
        .groupBy("proxy.id")
        .having("count", "<", num);
      if (result.length > 0) {
        for (const p of result) {
          if (winList.length === 0) {
            return;
          }
          while (winList.length > 0) {
            //逐个读取并删除数组的 最后一个元素（后进先出，逆序处理），直到数组为空。
            const item = winList.pop();
            await dbDao("window").update({ proxyId: p.id }).where("id", item);
            p.count = p.count + 1;
            if (p.count >= num) {
              //大于绑定次数
              break;
            }
          }
        }
      } else {
        throw new Error("无可用的代理/代理已经全部绑定环境");
      }

    }
  }


  async bingTag(wid, tids) {
    //先删除之前的绑定
    await dbDao("tagbing").delete().where("wid", wid);

    if (tids && tids.length > 0) {
      const data = [];
      tids.forEach(id => {
        data.push({ wid: wid, tid: id });
      });
      await dbDao("tagbing").insert(data);
    }

  };

  async getCount() {
    const result = await dbDao("window").count("id as count").first();
    return result.count + 1;
  }

  /**
   * 批量创建
   * @param num
   * @returns {Promise<void>}
   */
  async batchCreate(num) {
    const result = await dbDao("window").count("id as count").first();
    let P = result.count + 1;
    for (let i = 0; i < num; i++) {
      let data = {
        name: `P-${P + i}`, //环境名称
        status: 0, //环境状态
        fingerprint: JSON.stringify(generateFingerprint("window", "")),
        profile: randomUniqueProfileId()
      };
      // 确保 profile_id 是唯一的
      while (await dbDao("window").where({ profile: data.profile }).first()) {
        data.profile = randomUniqueProfileId();
      }
      await dbDao("window").insert(data);
    }
  }

  async adsInput(dirPath) {
    let count = await this.getCount();
    const items = await readdir(dirPath);
    let num = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log("adsInput--item name", item);
      const fullPath = path.join(dirPath, item);
      if (statSync(fullPath).isDirectory()) {//判断是否为目录
        //不存在才插入
        if (!await dbDao("window").where({ profile: item }).first()) {
          let data = {
            name: `ads-${count + num}`, //环境名称
            status: 0, //环境状态
            fingerprint: JSON.stringify(generateFingerprint("window", "")),
            profile: item,
            dir: fullPath
          };
          num = num + 1;
          await dbDao("window").insert(data);
        }
      }
    }
  }

  async create(windowData) {
    try {
      //遍历表单对象，删除不在数据库的属性
      let cleanData = Object.keys(windowData)
        .filter(key => this.dbFields.includes(key))
        .reduce((obj, key) => {
          if (key === "status") {
            obj[key] = 0;
          } else {
            obj[key] = windowData[key];
          }
          return obj;
        }, {});


      // 确保 profile是唯一的
      if (!cleanData.profile) {
        cleanData.profile = randomUniqueProfileId();
        // 确保 profile_id 是唯一的
        while (await dbDao("window").where({ profile: cleanData.profile }).first()) {
          cleanData.profile = randomUniqueProfileId();
        }
      }
      let tidArr = null;
      if (windowData.tids && windowData.tids.length > 0) {
        tidArr = windowData.tids;
      }

      cleanData = { ...cleanData, fingerprint: JSON.stringify(cleanData.fingerprint) };
      const [id] = await dbDao("window").insert(cleanData);
      if (tidArr) {
        const data = [];
        tidArr.forEach(t => {
          data.push({ wid: id, tid: t });
        });
        await dbDao("tagbing").insert(data);
      }
      return { id, ...windowData };
    } catch (error) {
      logger.error(`创建环境失败 ${error.message}`);
      throw new Error(error.message);
    }

  };


  async update(id, updatedData) {
    try {

      //遍历表单对象，删除不在数据库的属性
      let cleanData = Object.keys(updatedData)
        .filter(key => this.dbFields.includes(key))
        .reduce((obj, key) => {
          if (key !== "id") { //忽略ID
            obj[key] = updatedData[key];
          }
          return obj;
        }, {});

      //更新
      if (updatedData.tids) {
        await this.bingTag(id, updatedData.tids);
      }
      cleanData = { ...cleanData, fingerprint: JSON.stringify(cleanData.fingerprint) };
      await dbDao("window")
        .where({ id })
        .update({ ...cleanData, updatedAt: dbDao.raw("strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')") });
      return true;
    } catch (error) {
      logger.error(`更新环境失败 ${error.message}`);
      throw new Error("更新环境失败" + error.message);
    }
  };


  async remove(id) {
    try {
      await dbDao("window").delete().where({ id });
      //删除标签绑定
      await dbDao("tagbing").delete().where("wid", id);

      return true;
    } catch (error) {
      logger.error(`删除环境失败 ${error.message}`);
      throw new Error("删除环境失败" + error.message);
    }
  };

  async deleteAll() {
    try {
      await dbDao("window").delete();
      await dbDao("tagbing").delete();
      return true;
    } catch (error) {
      logger.error(`删除环境失败 ${error.message}`);
      throw new Error("删除环境失败" + error.message);
    }

  };

  async generateProfile() {
    let profile = randomUniqueProfileId();
    // 确保 profile_id 是唯一的
    while (await dbDao("window").where({ profile: profile }).first()) {
      profile = randomUniqueProfileId();
    }
    return profile;
  }

  async batchRemove(ids) {
    try {
      await dbDao("window").delete().whereIn("id", ids);
      await dbDao("tagbing").delete().whereIn("wid", ids);
      return true;
    } catch (error) {
      logger.error(`删除环境失败 ${error.message}`);
      throw new Error("删除环境失败" + error.message);
    }
  };

}



