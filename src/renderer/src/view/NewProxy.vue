<template>

  <div class="fixed-header">
    <h3>新建代理</h3>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="box-p">
          <el-text size="small">
            <span>说明</span><br />
            <span style="color: red"> 1. 仅支持 HTTP 和 SOCKS5 代理类型。</span><br />
            <span style="color: red"> 2. 若没有前缀带代理类型，请设置导入代理类型；若前缀带代理类型，会自动识别。</span><br />
            <span> 3. 每行输入一个代理,主机只支持 IPv4 地址。</span><br />
            <span style="color: black;font-size: large"> 输入格式（仅限 IPv4,IP与端口号为必填）<br />  [代理类型]://[IP]:[端口号]:[账号]:[密码]{备注}</span><br />
            <span> 192.168.0.1:8000:proxy_username:proxy_password{remark}</span><br />
            <span> http://192.168.0.1:8000:proxy_username:proxy_password{remark}</span><br />
            <span> socks5://192.168.0.1:8000:proxy_username:proxy_password{remark}</span><br />
          </el-text>
        </div>
      </el-col>
      <el-col :span="12">
        <el-input :autosize="{ minRows: 12, maxRows: 13 }" v-model="inputText" type="textarea" size="small"
                  class="box-p"
                  placeholder="请根据左侧格式输入，每行等于一个代理"
        />
      </el-col>
    </el-row>

    <div class="mb-4" style="padding:10px 0 10px 0; text-align: center">
      <div class="mb-4" style="float: left;">
        <el-radio-group v-model="typeRadio">
          <el-radio-button label="SOCKS5类型" value="SOCKS5" />
          <el-radio-button label="HTTP类型" value="HTTP" />
        </el-radio-group>
      </div>

      <div class="mb-4" style="float: right;">
        <el-text size="large" style="margin-right: 10px">总数量 {{ tableData.length }}</el-text>
        <el-button type="success" @click="onParseBtn" :icon="HelpFilled">解析导入</el-button>
        <el-button type="info" @click="onClearBtn" :icon="MagicStick">清空重置</el-button>

        <el-button type="primary" v-if="!checkALload" @click="onCheckAllBtn(1)" :icon="Odometer">检测全部
        </el-button>
        <el-button type="danger" v-else @click="onCheckAllBtn(2)" loading>停止检测</el-button>
      </div>
    </div>




  </div>


  <el-table :data="tableData"
            style="width:100%"
            size="small"
            :height="tableHeight"
            stripe
            class="fixed-cont"
  >
    <el-table-column prop="type" label="类型" min-width="70" />
    <el-table-column prop="ip" label="主机" min-width="120" />
    <el-table-column prop="port" label="端口" min-width="60" />
    <el-table-column prop="account" label="用户名" min-width="100" />
    <el-table-column prop="password" label="密码" min-width="100" />
    <el-table-column prop="remark" label="备注" min-width="120" />
    <el-table-column prop="checkData" label="状态" min-width="230">
      <template #default="scope">
        <el-progress
          :percentage="100"
          status="warning"
          :indeterminate="true"
          :duration="8"
          v-if="scope.row.checkLoad"
        />
        <template v-else-if="scope.row.checkData===null&&!scope.row.checkLoad">
          <el-space wrap>
            <el-icon color="#409efc" class="no-inherit">
              <Odometer />
            </el-icon>
            <el-text size="small">未检测</el-text>
          </el-space>
        </template>

        <!-- 使用 template 包裹 v-for，避免直接循环组件根元素 -->
        <template v-else v-for="(item, index) in parseStatus(scope.row.checkData)" :key="index">
          <el-text size="small">
            <el-icon :color="item.status === 'connected' ? '#67C23A' : '#F56C6C'">
              <SuccessFilled v-if="item.status === 'connected'" />
              <CircleCloseFilled v-else />
            </el-icon>
            <el-text style="margin-left: 5px; margin-right: 10px" size="small">
              {{ item.name }}
            </el-text>
          </el-text>
        </template>
      </template>
    </el-table-column>
    <el-table-column prop="ipInfo" label="IP地区" width="200">
      <template #default="scope">
        <template v-if="scope.row.ipInfo">
          <el-text size="small" v-model="scope.row.ipInfo.countryCN"></el-text>
          /
          <el-text size="small" v-model="scope.row.ipInfo.location"></el-text>
        </template>

      </template>
    </el-table-column>
    <el-table-column fixed="right" align="center" label="操作" min-width="50">
      <template #default="scope">
        <el-tooltip
          class="box-item"
          effect="dark"
          content="检测代理"
          placement="bottom-start"
        >
          <el-button type="warning" icon="Link" size="small" @click="onOneCheck(scope.row)"
                     :disabled="scope.row.checkLoad" circle />
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>

  <div class="fixed-footer">
    <el-button type="primary" @click="saveData" :disabled="saveStatus">保存</el-button>
    <el-button type="info" @click="router.back()">取消</el-button>
  </div>


</template>
<script setup>
import { reactive, computed, ref, onMounted, onUnmounted } from "vue";
import { importProxyApi, testProxyApi } from "../utils/httpApi";
import { ElMessage, ElNotification } from "element-plus";
import { useRouter } from "vue-router";
import {
  Check,
  CircleCloseFilled,
  Close,
  CloseBold,
  Edit, HelpFilled, MagicStick,
  Odometer,
  Select,
  SuccessFilled
} from "@element-plus/icons-vue";
import async from "async";

const router = useRouter();

const tableData = ref([]);
const typeRadio = ref("SOCKS5");

const inputText = ref("");
const saveStatus = ref(true);
const checkALload = ref(false);


const onClearBtn = () => {
  tableData.value = [];
  inputText.value = "";
  saveStatus.value = true;
};

//全部检测
const onCheckAllBtn = async (status) => {
  if (status === 2) {

    for (const item of tableData.value) {
      if (item.getIng) {
        continue;
      }
      item.checkLoad = false;
    }
    checkALload.value = false;
    return;
  } else {
    if (tableData.value && tableData.value.length > 0) {
      checkALload.value = true;
      ElMessage({
        type: "info",
        showClose: true,
        message: "批量检测代理网络开始",
        center: true
      });
      for (const item of tableData.value) {
        if (item.getIng) {
          continue;
        }
        item.checkLoad = true;
      }


      for (const item of tableData.value) {
        if (item.getIng) {
          continue;
        }
        let data = item;
        delete data.id;
        delete data.checkData;
        delete data.proxy;
        item.getIng = true;
        try {
          const res = await testProxyApi(data);
          item.checkData = res.data.pings;
          item.ipInfo = res.data.ipInfo;
          if (!checkALload.value) {
            return;
          }
        } catch (err) {
          checkALload.value = false;
        } finally {
          item.getIng = false;
          item.checkLoad = false;
        }


      }

      checkALload.value = false;

    } else {
      ElMessage({
        type: "error",
        showClose: true,
        message: "代理不能为空",
        center: true
      });
    }
  }
};

//单个检测
const onOneCheck = async (item) => {
  if (checkALload.value) {
    return;
  }
  if (item.getIng) {
    return;
  }
  let data = item;
  delete data.id;
  delete data.checkData;
  delete data.proxy;
  item.getIng = true;
  item.checkLoad = true;
  try {
    const res = await testProxyApi(data);
    item.checkData = res.data.pings;
    item.ipInfo = res.data.ipInfo;
  } finally {
    item.getIng = false;
    item.checkLoad = false;
  }
};

const saveData = async () => {
  if (tableData.value.length === 0) {
    return;
  }

  let data = tableData.value;
  for (const item of data) {
    delete item.id;
    delete item.checkData;
    delete item.checkLoad;
    delete item.getIng;
    delete item.ipInfo;

  }
  saveStatus.value = true;
  importProxyApi(data).then(
    () => {
      ElNotification({
        title: "Success",
        message: "保存成功",
        type: "success"
      });

      router.push("/proxy");
    }
  ).catch(err => {
    saveStatus.value = false;
    ElNotification({
      title: "Error",
      message: `保存数据失败 ${err.message}`,
      type: "error"
    });
  });

};

const parseStatus = (json) => {
  try {
    // 1. 处理 null/undefined
    if (json == null) return [];

    // 2. 如果是数组，直接返回
    if (Array.isArray(json)) return json;

    // 3. 如果是对象，包裹成数组
    if (typeof json === "object") return [json];

    // 4. 如果是字符串，尝试解析为 JSON
    if (typeof json === "string") {
      const parsed = JSON.parse(json);
      // 解析后如果是数组或对象，统一转换为数组
      return Array.isArray(parsed) ? parsed : [parsed];
    }

    // 5. 其他类型（如数字、布尔值）包裹成数组
    return [json];
  } catch (e) {
    // JSON 解析失败时返回空数组，避免 v-for 报错
    return [];
  }
};


const onParseBtn = () => {
  if (inputText.value.length === 0) {
    ElMessage({
      type: "error",
      showClose: true,
      message: "输入不能为空",
      center: true
    });
  } else {
    const proxies = inputText.value.split("\n");
    tableData.value = proxies.filter(f => f.trim()).map((proxy, index) => parseProxy(proxy, index));
    saveStatus.value = false;
  }
};

const parseProxy = (proxy, index) => {
  let type = typeRadio.value; // 默认类型
  let ip = "",
    port = 0,
    account = "",
    password = "",
    remark = "";
  const proxyLower = proxy.toLowerCase();

  if (proxyLower.startsWith("socks5://")) {
    type = "SOCKS5";
    proxy = proxy.substring(9);
  } else if (proxyLower.startsWith("http://")) {
    type = "HTTP";
    proxy = proxy.substring(7);
  }

  // 如果存在，提取备注
  const remarkIndex = proxy.indexOf("{");
  if (remarkIndex !== -1) {
    remark = proxy.substring(remarkIndex + 1, proxy.length - 1);
    proxy = proxy.substring(0, remarkIndex).trim();
  }

  // 调整正则表达式以使用户名和密码可选
  const proxyRegex = /^([a-zA-Z0-9.-]+):(\d{1,5})(?::([a-zA-Z0-9._-]*):([a-zA-Z0-9._-]*))?$/;

  if (!proxyRegex.test(proxy)) {
    throw new Error("无效的代理格式");
  }

  const parts = proxy.match(proxyRegex);

  ip = parts?.[1] || "";
  port = Number(parts?.[2] || "");

  if (parts?.[3] && parts[4]) {
    account = parts[3];
    password = parts[4];
  }

  return {
    id: index,
    type: type,
    ip: ip,
    port: port,
    account: account,
    password: password,
    remark: remark,
    proxy: proxyLower,
    ipInfo: {},
    checkLoad: false,
    getIng: false,
    checkData: null
  };
};


//自动适配高度代码
const tableHeight = ref(100);
// 计算表格高度的函数
const calculateTableHeight = () => {
  const header = document.querySelector(".fixed-header");
  const footer = document.querySelector(".fixed-footer");
  const windowHeight = window.innerHeight;
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = footer ? footer.offsetHeight : 0;
  // 减去头部和底部高度，再减去内容区域的上下内边距
  tableHeight.value = windowHeight - headerHeight - footerHeight - 20;
};
onMounted(() => {
  calculateTableHeight();
  // 监听窗口大小改变事件
  window.addEventListener("resize", calculateTableHeight);
});

onUnmounted(() => {
  // 移除窗口大小改变事件监听器，防止内存泄漏
  window.removeEventListener("resize", calculateTableHeight);
});

</script>
<style scoped>
.fixed-header {
  padding: 10px;
  height: 350px;
}


.box-p {
  width: 98%;
  height: 220px;
  padding: 10px;
  background-color: #FFFFFF;
  border-radius: 10px;
}


.fixed-footer {
  padding: 10px;
  height: 30px;
  bottom: 0;
  right: 0;
}
</style>
