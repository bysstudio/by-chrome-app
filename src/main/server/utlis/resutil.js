/**
 * 响应成功
 * @param data
 * @param msg
 * @returns {{msg: string, code: number, data}}
 */
export const resOk = ({ data = null, total = 0, msg = "操作成功" }) => {
  return {
    data: data,
    total: total,
    code: 200,
    msg: msg
  };
};
/**
 * 响应失败
 * @param msg
 * @returns {{msg: string, code: number}}
 */
export const resFail = (msg = "操作失败") => {
  return {
    code: 401,
    msg: msg
  };

};
/**
 * 提取查询条件与分页排序操作
 * @param query
 * @returns {{query: null, params: null}|{query: {}, params: {}}}
 */
export const parseQuery = (query) => {
  if (query) {
    const data = {};
    const p = {};
    for (const [key, value] of Object.entries(query)) {
      //排除空值
      if (value && value !== "") {
        //排除关键字
        if (key === "pageNum" || key === "pageSize" || key === "orderBy" || key === "desc" || key === "op") {
          p[key] = value;
        } else {
          data[key] = value;
        }
      } else if (key === "proxyId" || key === "remark" || key === "name") { //放行字段 可以查空的字段
        data[key] = "";
      }
    }
    return { query: data, params: p };
  } else {
    return { query: null, params: null };
  }

};

