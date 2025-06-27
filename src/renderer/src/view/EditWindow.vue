<template>

  <div class="fixed-header">
    <el-row :gutter="20">
      <el-col :span="14"><h3>{{ title }}</h3></el-col>
      <el-col :span="10">
        <p style="float:right;">
          <el-button type="primary" size="default" icon="RefreshRight" @click="refreshF" round>重新生成指纹
          </el-button>
        </p>
      </el-col>
    </el-row>


  </div>

  <div class="fixed-cont">
    <el-scrollbar :height="tableHeight">
      <!-- 页面表单 -->
      <el-form :model="form" label-width="auto" style="padding: 10px">
        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item label="编号">
              <el-input v-model="form.id" placeholder="自动生成" disabled />
            </el-form-item>
            <el-form-item label="环境">
              <el-input v-model="form.profile" placeholder="自动生成" disabled />
            </el-form-item>
            <el-form-item label="名称">
              <el-input v-model="form.name" placeholder="自定义名称" />
            </el-form-item>

            <el-form-item label="分组">
              <el-select v-model="form.groupId" style="width: 100%" placeholder="选择分组" clearable>
                <el-option
                  v-for="item in groupDataList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="标签">
              <el-select multiple v-model="form.tids" placeholder="选择标签">
                <el-option
                  v-for="item in tagDataList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="代理">
              <el-select v-model="form.proxyId" placeholder="选择代理" clearable>
                <template #label="{ label, value,len }">
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-tag type="info" size="small">编号 {{ value }}</el-tag>
                    </el-col>
                    <el-col :span="12">主机 {{ labelIndex(label, 0) }}</el-col>
                    <el-col :span="6">关联 {{ labelIndex(label, 1) }}</el-col>
                  </el-row>
                </template>
                <template #header>
                  <el-row :gutter="20">
                    <el-col :span="6">代理编号</el-col>
                    <el-col :span="12">主机地址</el-col>
                    <el-col :span="6">关联环境数</el-col>
                  </el-row>
                </template>
                <el-option
                  v-for="item in proxyDataList"
                  :key="item.id"
                  :label="proxyLabel(item)"
                  :value="item.id"

                >
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-tag type="info" size="small">{{ item.id }}</el-tag>
                    </el-col>
                    <el-col :span="12">{{ item.ip }}</el-col>
                    <el-col :span="6">{{ item.wids.length }}</el-col>
                  </el-row>
                </el-option>
              </el-select>


            </el-form-item>
            <el-form-item label="缓存路径">
              <el-input v-model="form.dir" placeholder="自动生成" disabled />
            </el-form-item>
            <!--            <el-form-item label="cookie">-->
            <!--              <el-input v-model="form.cookie" rows="4" type="textarea" />-->
            <!--            </el-form-item>-->
            <el-form-item label="备注">
              <el-input v-model="form.remark" rows="4" type="textarea" />
            </el-form-item>
          </el-col>
          <el-col :span="10" style="background-color:#F2F6FC; border-radius: 12px;">
            <div class="list-row">
              <div class="label">浏览器：</div>
              <div class="value">{{ form.fingerprint.browserBrand }}/{{ form.fingerprint.chromeVersion }}</div>
            </div>
            <div class="list-row">
              <div class="label">操作系统：</div>
              <div class="value">{{ form.fingerprint.os }} {{ form.fingerprint.osVersion }}</div>
            </div>
            <div class="list-row">
              <div class="label">userAgent：</div>
              <div class="value">{{ form.fingerprint.userAgent }}</div>
            </div>
            <div class="list-row">
              <div class="label">CPU/内存：</div>
              <div class="value">{{ form.fingerprint.cpuCore }} 核 / {{ form.fingerprint.memory }} GB</div>
            </div>
            <div class="list-row">
              <div class="label">显卡信息：</div>
              <div class="value">{{ form.fingerprint.gpuVendor }} / {{ form.fingerprint.gpuRenderer }}
                ({{ form.fingerprint.gpuArch }})
              </div>
            </div>
            <div class="list-row">
              <div class="label">屏幕信息：</div>
              <div class="value" v-if="form.fingerprint.screen">
                {{ form.fingerprint.screen.width }} * {{ form.fingerprint.screen.height }}
              </div>
            </div>
            <div class="list-row">
              <div class="label">webGL：</div>
              <div class="value">{{ form.fingerprint.webGLReport }}
              </div>
            </div>
            <div class="list-row">
              <div class="label">语言：</div>
              <div class="value">基于IP自动匹配</div>
            </div>
            <div class="list-row">
              <div class="label">时区：</div>
              <div class="value">基于IP自动匹配</div>
            </div>
            <div class="list-row">
              <div class="label">地理位置：</div>
              <div class="value">基于IP自动匹配</div>
            </div>
          </el-col>
        </el-row>
      </el-form>


    </el-scrollbar>
  </div>
  <!-- 自定义弹窗（可选） -->
  <el-dialog v-model="showConfirmDialog" title="提示">
    <span>当前数据未保存，确定离开吗？</span>
    <template #footer>
      <el-button @click="cancelNavigation">取消</el-button>
      <el-button type="primary" @click="confirmNavigation">确定离开</el-button>
    </template>
  </el-dialog>


  <div class="fixed-footer">
    <el-button type="primary" @click="saveData">保存</el-button>
    <el-button type="info" @click="onBack">取消</el-button>
  </div>


</template>
<script setup>
import { reactive, watch, ref, onMounted, onUnmounted, toRefs, computed } from "vue";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import {
  fingerprintApi, generateProfileApi,
  getGroupListApi,
  getProxyListApi,
  getTagListApi,
  getWindowInfoApi, saveWindowApi,
  updateWindowApi
} from "../utils/httpApi";
import { ElMessage } from "element-plus";


const router = useRouter();
const route = useRoute();
console.log("Query参数:", route.query.id, route.query.type);
const title = ref(route.query.type === "new" ? "新建环境" : "编辑环境");

// 未保存状态标记
const hasUnsavedChanges = ref(false);

// 自定义弹窗控制
const showConfirmDialog = ref(false);
let resolveNavigation = null; // 用于控制导航的 Promise resolve

// 保存数据逻辑
const saveData = async () => {
  if (route.query.type === "new") {
    saveWindowApi(form.value).then(res => {
      ElMessage({
        showClose: true,
        message: "创建环境成功",
        type: "success"
      });
    }).catch(err => {
      console.log("创建环境失败", err.message);
      ElMessage({
        showClose: true,
        message: "创建环境失败" + err.message,
        type: "error"
      });
    }).finally(() => {
        onBack();
      }
    );
  } else {
    updateWindowApi({ id: form.value.id, data: form.value }).then(res => {
      ElMessage({
        showClose: true,
        message: "修改环境成功",
        type: "success"
      });
    }).catch(err => {
      ElMessage({
        showClose: true,
        message: "修改环境失败" + err.message,
        type: "error"
      });
    }).finally(() => {
        onBack();
      }
    );
  }

};

const tagDataList = ref([]);
const groupDataList = ref([]);
const proxyDataList = ref([]);

// 表单数据
const data = reactive({
  form: {
    id: null,  //ID
    groupId: null,  //分组名称
    proxyId: null, //代理ID
    name: `P-${Number(route.query.total) + 1}`, //自定义名称
    tids: [],
    profile: null, //随机生成环境名称/也是缓存文件夹名称
    status: 0, //状态 0未运行 -1打开异常  1打开成功
    dir: null, //缓存文件路径
    fingerprint: {}, //指纹信息
    cookie: null, //缓存
    remark: null  //备注
  }
});
const { form } = toRefs(data);

//字符转换数字
const labelIndex = (str, index) => {
  if (str !== null && str !== "" && /\//.test(str)) {
    return str.split("/")[index];
  }
  return "";
};

const proxyLabel = (data) => {
  if (data) {
    return data.ip + "/" + data.wids.length;
  }
  return "";
};

// 监听表单修改
watch(form, () => {
  hasUnsavedChanges.value = true;
}, { deep: true });

const refreshF = () => {
  if (route.query.type === "edit") {
    generateProfileApi().then(res => {
      form.value.profile = res.data;
    });
  }

  fingerprintApi().then(res => {
    form.value.fingerprint = res.data;
  });
};

const onBack = () => {
  hasUnsavedChanges.value = false;
  router.back();
};
// --------------------------------------------------
// 路由守卫逻辑
// --------------------------------------------------
onBeforeRouteLeave(async (to, from, next) => {
  if (!hasUnsavedChanges.value) {
    next(); // 无修改直接放行
    return;
  }

  try {
    // 方案1：使用 Element Plus 的确认框
    const confirm = await ElMessageBox.confirm(
      "当前数据未保存，确定离开吗？",
      "提示",
      {
        confirmButtonText: "确定离开",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    if (confirm) {
      next(); // 用户确认离开
    } else {
      next(false); // 取消导航
    }
  } catch (error) {
    next(false); // 用户取消操作
  }
});

// 自定义弹窗确认回调
const confirmNavigation = () => {
  showConfirmDialog.value = false;
  hasUnsavedChanges.value = false;
  if (resolveNavigation) resolveNavigation(true);
};

// 自定义弹窗取消回调
const cancelNavigation = () => {
  showConfirmDialog.value = false;
  if (resolveNavigation) resolveNavigation(false);
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
  tableHeight.value = windowHeight - headerHeight - footerHeight - 45;
};

onMounted(() => {
  calculateTableHeight();
  //获取代理数据
  getProxyListApi().then(res => {
    res.data.sort((a, b) => a.wids.length - b.wids.length);
    proxyDataList.value = res.data;
  });

  //获取标签数据
  getTagListApi().then(res => {
    tagDataList.value = res.data;
  });

  //获取分组数据
  getGroupListApi().then(res => {
    groupDataList.value = res.data;
  });

  if (route.query.type === "edit") {
    //编辑
    getWindowInfoApi({ id: route.query.id }).then(res => {
      if (res.data.tags && res.data.tags.length > 0) {
        const tids = res.data.tags.map(item => item.id);
        delete res.data.tags;
        form.value = { ...res.data, tids: tids };
      } else {
        form.value = res.data;
        form.value.tids = [];
        delete form.value.tags;
      }
      if (form.value.groupId !== null && form.value.groupId !== undefined) {
        form.value.groupId = Number(form.value.groupId);
      }
      if (res.data.fingerprint.length > 0) {
        form.value.fingerprint = JSON.parse(res.data.fingerprint);
      }
    });
  } else {
    fingerprintApi().then(res => {
      form.value.fingerprint = res.data;
    });
  }

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
  padding: 10px 20px 10px 0;
  border-radius: 10px;

}

.fixed-cont {
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #FFFFFF;
}


.fixed-footer {
  padding: 10px 20px 10px 0;
  height: 30px;
  bottom: 0;
  right: 0;
}


.list-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.list-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #333; /* 黑色文字 */
  flex-basis: 40%;
}

.value {
  font-size: 14px;
  color: #000000; /* 深灰色文字 */
  flex-basis: 60%;

}
</style>
