import request from "./request";


/**
 * 测试代理
 * @type {function(*): Promise<axios.AxiosResponse<any>>}
 */
export const testProxyApi = async (data) => {
  return request({
    url: "/proxy/testProxy",
    method: "post",
    data: data
  });
};


export const testProxyByIdApi = async (id) => {
  return request({
    url: "/proxy/testProxyById",
    method: "get",
    params: id
  });
};

export const batchTestProxyApi = async (ids) => {
  return request({
    url: "/proxy/batchTestProxy",
    method: "get",
    params: ids
  });
};
//导入代理
export const importProxyApi = async (data) => {
  return request({
    url: "/proxy/import",
    method: "post",
    data: data
  });
};

export const getProxyListApi = async (data) => {
  return request({
    url: "/proxy/list",
    method: "get",
    params: data
  });
};
export const getConfigApi = async () => {
  return request({
    url: "/config/info",
    method: "get"
  });
};
export const updateConfigApi = async (data) => {
  return request({
    url: "/config/update",
    method: "post",
    data: data
  });
};
export const getTagListApi = async () => {
  return request({
    url: "/tag/list",
    method: "get"
  });
};

export const getGroupListApi = async () => {
  return request({
    url: "/group/list",
    method: "get"
  });
};

export const getWindowListApi = async (data) => {
  return request({
    url: "/window/list",
    method: "get",
    params: data
  });
};

export const addTagApi = async (data) => {
  return request({
    url: "/tag/create",
    method: "post",
    data: data
  });
};

export const updateTagApi = async (data) => {
  return request({
    url: "/tag/update",
    method: "put",
    data: data
  });
};


export const updateGroupApi = async (data) => {
  return request({
    url: "/group/update",
    method: "put",
    data: data
  });
};

export const addGroupApi = async (data) => {
  return request({
    url: "/group/create",
    method: "post",
    data: data
  });
};
export const delGroupApi = async (id) => {
  return request({
    url: "/group/delete",
    method: "delete",
    data: id
  });
};
export const delTagApi = async (id) => {
  return request({
    url: "/tag/delete",
    method: "delete",
    data: id
  });
};


export const bingTagApi = async (data) => {
  return request({
    url: "/window/bingTag",
    method: "put",
    data: data
  });
};


export const updateWindowApi = async (data) => {
  return request({
    url: "/window/update",
    method: "put",
    data: data
  });
};
export const getProxyInfoApi = async (id) => {
  return request({
    url: "/proxy/info",
    method: "get",
    params: id
  });
};


export const getWindowInfoApi = async (id) => {
  return request({
    url: "/window/info",
    method: "get",
    params: id
  });
};

export const adsInputApi = async (data) => {
  return request({
    url: "/window/adsinput",
    method: "post",
    data: data
  });
};


export const saveWindowApi = async (data) => {
  return request({
    url: "/window/create",
    method: "post",
    data: data
  });
};

export const updateProxyApi = async (data) => {
  return request({
    url: "/proxy/update",
    method: "put",
    data: data
  });
};
export const batchDelWinApi = async (ids) => {
  return request({
    url: "/window/delete",
    method: "delete",
    data: ids
  });
};

export const batchCreateWinApi = async (data) => {
  return request({
    url: "/window/batchCreate",
    method: "post",
    data: data
  });
};


export const batchDelProxyApi = async (ids) => {
  return request({
    url: "/proxy/delete",
    method: "delete",
    data: ids
  });
};

export const batchOpenWinApi = async (ids) => {
  return request({
    url: "/window/open",
    method: "post",
    data: ids
  });
};

export const batchCloseWinApi = async (ids) => {
  return request({
    url: "/window/close",
    method: "post",
    data: ids
  });
};


export const sortWinApi = async (ids) => {
  return request({
    url: "/window/sortWin",
    method: "post",
    data: ids
  });
};

export const resetWinApi = async (data) => {
  return request({
    url: "/window/sortWin",
    method: "get",
    params: data
  });
};


export const syncWinApi = async (ids) => {
  return request({
    url: "/window/syncWin",
    method: "post",
    data: ids
  });
};


export const syncStatusApi = async () => {
  return request({
    url: "/window/syncStatus",
    method: "get"
  });
};

export const openWinListApi = async () => {
  return request({
    url: "/window/openList",
    method: "get"
  });
};
export const syncListApi = async () => {
  return request({
    url: "/window/syncList",
    method: "get"
  });
};

export const stopSyncApi = async () => {
  return request({
    url: "/window/stopSync",
    method: "get"
  });
};

export const batchOpTagApi = async (data) => {
  return request({
    url: "/window/batchOpTag",
    method: "post",
    data: data
  });
};

export const batchOpRemarkApi = async (data) => {
  return request({
    url: "/window/batchOpRemark",
    method: "post",
    data: data
  });
};


export const autoBingProxyApi = async (num) => {
  return request({
    url: "/window/autoBingProxy",
    method: "get",
    params: num
  });
};

export const batchClearProxyApi = async (data) => {
  return request({
    url: "/window/batchClearProxy",
    method: "put",
    data: data
  });
};
export const fingerprintApi = async () => {
  return request({
    url: "/window/fingerprint",
    method: "get"
  });
};
export const generateProfileApi = async () => {
  return request({
    url: "/window/generateProfile",
    method: "get"
  });
};











