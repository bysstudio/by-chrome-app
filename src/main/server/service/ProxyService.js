import axios from "axios";

import { HttpsProxyAgent } from "https-proxy-agent";

import { SocksProxyAgent } from "socks-proxy-agent";

import geoip from "geoip-lite";

import { countryToLangMap, PIN_URL } from '../constants/index'


import { ProxyDB } from "../db/ProxyDB";
import WSService from "./WSService";
import { dbDao } from '../db/DbDao'
import logger from "../../logger/logger";


/**
 代理功能相关的服务类
 代理状态检查
 代理转发
 */
export class ProxyService {

  constructor() {
    this.proxydb = new ProxyDB();

  }

  /**
   * 批量测试
   * @param ids
   * @returns {Promise<void>}
   */
  async testBatchProxy(ids) {
    if (ids && ids.length > 0) {
      const arr = await this.proxydb.getBatchByIds(JSON.parse(ids));
      for (const item of arr) {
        await this.testProxy(item, true);
      }
    }
  }

  /**
   * 单个测试
   * @param proxy  代理信息
   * @param toinfo true获取ip详细信息
   * @returns {Promise<{pings: *[], ipInfo: {}}>}
   */
  async testProxy(proxy, toinfo = false) {
    let agent = undefined;
    let requestProxy = undefined;
    let result = { ipInfo: {}, pings: [], checkStatus: 0, updatedAt: 0 };

    const type = proxy.type.toLowerCase();
    if (type === "socks5") {
      const agentInfo = this.getAgent(proxy);
      agent = agentInfo.agent;
    } else {
      requestProxy = this.getRequestProxy(proxy);
    }

    let ipMsg;
    if (toinfo) {
      //在线获取IP信息
      ipMsg = await this.getIpInfo(proxy.ip);
      result.ipInfo = ipMsg;
    } else {
      //本地获取IP信息
      ipMsg = await this.getGeoipIpInfo(proxy.ip);
      result.ipInfo = ipMsg;
    }
    let count = 0;
    for (const pin of PIN_URL) {
      const startTime = Date.now();
      try {
        const response = await axios.get(pin.url, {
          proxy: type !== "socks5" ? requestProxy : undefined,
          timeout: 5000,
          httpAgent: agent,
          httpsAgent: agent
        });

        const endTime = Date.now();
        const elapsedTime = endTime - startTime; // Calculate the time taken for the request
        if (response.status === 200) {
          count = count + 1;
          result.pings.push({
            name: pin.n,
            status: "connected",
            elapsedTime: elapsedTime
          });
        } else {
          result.pings.push({
            name: pin.n,
            status: "failed",
            reason: `Status code: ${response.status}`,
            elapsedTime: elapsedTime
          });
        }
      } catch (e) {
        logger.error(`代理IP网络检测 ip:${proxy.ip}, ping:${pin.n} 失败`, e.message);
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        result.pings.push({
          name: pin.n,
          status: "failed",
          reason: `${e.message}`,
          elapsedTime: elapsedTime
        });
      }
    }

    // //模拟数据
    // let count = -1;
    // result.pings = [
    //   {
    //     name: "谷歌",
    //     status: "failed",
    //     reason: "timeout of 5000ms exceeded",
    //     elapsedTime: 7524
    //   },
    //   {
    //     name: "推特",
    //     status: "failed",
    //     reason: "connect ETIMEDOUT 38.153.152.244:9594",
    //     elapsedTime: 21038
    //   },
    //   {
    //     name: "DC",
    //     status: "failed",
    //     reason: "timeout of 5000ms exceeded",
    //     elapsedTime: 7104
    //   },
    //   {
    //     name: "电报",
    //     status: "failed",
    //     reason: "connect ETIMEDOUT 38.153.152.244:9594",
    //     elapsedTime: 21034
    //   }
    // ];
    //
    // await new Promise(resolve => setTimeout(resolve, 5000));
    //模拟数据结束


    let checkStatus = count > 0 ? 1 : -1;
    result.checkStatus = checkStatus;
    //若有ID，则更新
    if (proxy.id) {
      let data;
      if (toinfo) {
        data = {
          ...ipMsg,
          checkStatus: checkStatus,
          checkData: JSON.stringify(result.pings),
          updatedAt: dbDao.raw("strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')")
        };
      } else {
        data = {
          checkStatus: checkStatus,
          checkData: JSON.stringify(result.pings),
          updatedAt: dbDao.raw("strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')")
        };
      }

      await this.proxydb.update(proxy.id, data);

      WSService.broadcast({
        type: "proxyPingResult", data: {
          id: proxy.id,
          checkStatus: checkStatus,
          checkData: result.pings,
          ...ipMsg
        }
      });
    }
    return result;
  }


  /**
   * 获取Ip信息
   * @param ip
   * @returns {Promise<void>}
   */

  async getIpInfo(ip) {

    if (ip) {
      try {
        // 调用 ip-api.com，指定返回经纬度字段
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,countryCode,country,regionName,city,timezone,lat,lon`);
        const data = response.data;
        // 检查查询是否成功
        if (data.status !== "success") {
          throw new Error(data.message || "ip-api.com 查询失败");
        }
        const lang = this.getLanguage(data.countryCode); //语言
        // 整合结果（包含经纬度）
        return {
          ip: ip,
          gateway: "ip-api.com",
          countryCode: data.countryCode,
          country: data.country,
          location: `${data.country}, ${data.regionName}, ${data.city}`,
          timezone: data.timezone,
          latitude: data.lat,  // 纬度（WGS84 坐标系）
          longitude: data.lon,  // 经度（WGS84 坐标系）
          countryCN: lang.name,
          language: lang.code
        };
      } catch (error) {
        try {
          logger.error(`使用ip-api查询异常  error: ${error.message}`);
          //ipapi.co（免费）
          const response = await axios.get(`https://ipapi.co/${ip}/json/`);
          const data = response.data;
          if (data && data.timezone) {
            const lang = this.getLanguage(data.country); //语言
            return {
              ip: ip,
              gateway: "ipapi.co",
              countryCode: data.country,
              country: data.country_name,
              location: `${data.country_name}, ${data.region}, ${data.city}`,
              timezone: data.timezone,
              latitude: data.latitude,  // 纬度（WGS84 坐标系）
              longitude: data.longitude,  // 经度（WGS84 坐标系）
              countryCN: lang.name,
              language: lang.code
            };
          }
        } catch (e) {
          logger.error(`使用ipapi.co查询异常  error: ${error.message}`);
          return await this.getGeoipIpInfo(ip);
        }
      }
    }
    return null;
  }


  async getGeoipIpInfo(ip) {
    //再失败则使用本地
    const data = geoip.lookup(ip);
    const lang = this.getLanguage(data.country); //语言
    return {
      ip: ip,
      gateway: "geoip",
      countryCode: data.country,
      country: data.country,
      location: `${data.country}, ${data.region}, ${data.city}`,
      timezone: data.timezone,
      latitude: data.ll[0],  // 纬度（WGS84 坐标系）
      longitude: data.ll[1],  // 经度（WGS84 坐标系）
      countryCN: lang.name,
      language: lang.code
    };
  }

  getLanguage(country) {
    if (country) {
      const data = countryToLangMap[country.toUpperCase()];
      if (data) {
        return data;
      } else {
        logger.error(`getLanguage获取undefined : ${country}`);
      }
    }
    return { code: "en-US", name: "美国" };
  }

  getRequestProxy(proxy) {
    if (!proxy) return;
    return {
      protocol: proxy.type,
      host: proxy.ip,
      port: proxy.port,
      auth: proxy.account ? {
        username: proxy.account,
        password: proxy.password
      } : undefined
    };
  };


//获取代理的请求头
  getAgent(proxy) {
    let agent;
    let agentField = "httpsAgent";
    if (proxy) {
      switch (proxy.type.toLowerCase()) {
        case "socks5":
          agent = new SocksProxyAgent(
            proxy.account ? `socks://${proxy.account}:${proxy.password}@${proxy.ip}:${proxy.port}` : `socks://${proxy.ip}:${proxy.port}`
          );
          agentField = "httpsAgent";
          break;
        case "http":
          agent = new HttpsProxyAgent(
            proxy.account ? `http://${proxy.account}:${proxy.password}@${proxy.ip}:${proxy.port}` : `http://${proxy.ip}:${proxy.port}`
          );
          agentField = "httpAgent";
          break;
        case "https":
          agent = new HttpsProxyAgent(
            proxy.account ? `http://${proxy.account}:${proxy.password}@${proxy.ip}:${proxy.port}` : `http://${proxy.ip}:${proxy.port}`
          );
          agentField = "httpsAgent";
          break;

        default:
          break;
      }
    }
    return {
      agent,
      agentField
    };
  }
}

