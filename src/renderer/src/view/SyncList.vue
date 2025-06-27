<template>

  <div class="fixed-header">
    <h3>窗口同步</h3>
  </div>

  <div class="fixed-cont" :style="{ height: tableHeight + 'px' }">
    <el-row :gutter="20">
      <el-col :span="16">


        <el-table :data="tableData"
                  style="width:100%"
                  v-loading="loading"
                  size="small"
                  row-key="id"
                  class="fixed-cont"
                  stripe
                  :height="tableHeight"
                  ref="multipleTableRef"
                  @selectionChange="handleSelectionChange"
        >
          <el-table-column type="selection" width="45" />
          <el-table-column prop="id" align="center" label="环境ID" min-width="80"
                           sortable>
            <template #default="scope">
              <el-tag type="primary" size="small">{{ scope.row.id }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" min-width="100" show-overflow-tooltip />
          <el-table-column prop="chromePort" label="端口号" min-width="80" />
          <el-table-column prop="hwnd" label="句柄" min-width="80" />
          <el-table-column prop="master" label="主控" min-width="80">
            <template #default="scope">
              <el-tag type="success" v-if="scope.row.master" size="small">是</el-tag>
              <el-tag type="info" v-else size="small">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" align="center" label="设置主控" min-width="120">
            <template #default="scope">
              <el-button :icon="Monitor" :disabled="syncStatus" :type="scope.row.id===lastMasetId?'success':''"
                         size="small" @click="onSetMater(scope.row.id)">主控
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="8">

        <el-card style="width: 98% ;" shadow="Hover">
          <template #header>
            <div class="card-header">
              <span>操作台</span>

            </div>
          </template>

          <p>
            <el-text type="info">窗口排列</el-text>
          </p>
          <el-button size="small" :icon="FullScreen" @click="onSortWin('all')" :disabled="tableData.length<2">一键排列
          </el-button>
          <el-button size="small" type="info" :icon="Check" @click="onSortWin('select')" :disabled="ids.length<2">排列已选
          </el-button>
          <el-button size="small" type="primary" :icon="Check" @click="diyWH=true" :disabled="ids.length<2">自定义大小
          </el-button>
          <p>
            <el-text type="info" size="small">窗口排列，按环境ID降序屏幕Z序排列</el-text>
          </p>
          <p>
            <el-text type="info">同步器</el-text>
          </p>
          <div v-if="!syncStatus">
            <el-button size="small" :icon="VideoPlay" :disabled="tableData.length<2" @click="startSync('all')">
              同步全部
            </el-button>
            <el-button size="small" type="info" :icon="Check" :disabled="ids.length<2" @click="startSync('select')">同步已选
            </el-button>
          </div>

          <el-button type="danger" size="small" v-else :icon="CircleCloseFilled" @click="stopSync">停止同步</el-button>
          <br />
          <el-text type="info" size="small">不选择主控，默认主控为环境ID最大值窗口</el-text>

          <el-text type="info" size="small">键盘事件，部分按键与小键盘输入不会同步</el-text>


          <template #footer>
            <span><el-text type="info" size="small">总窗口数量</el-text> <el-text
              tag="b">{{ tableData.length }}</el-text>
            </span><br />
            <span><el-text type="info" size="small">同步器与排列，窗口数量大于2个生效</el-text>
            </span>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="diyWH"
      width="500"
      title="自定义窗口大小"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            type="number"
            placeholder="宽度"
            v-model="whform.width"
            max="1920"
            min="300"
          >
            <template #prepend>宽度</template>
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-input
            type="number"
            placeholder="高度"
            max="1080"
            min="300"
            v-model="whform.height"
          >
            <template #prepend>高度</template>
          </el-input>
        </el-col>
      </el-row>


      <template #footer>
        <div class="dialog-footer">
          <el-button @click="diyWH = false">关闭</el-button>
          <el-button type="primary" @click="onSortWin('diy')">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>


  <div class="fixed-footer">
    <el-text size="small" type="info">已选 {{ ids.length }}</el-text>
  </div>


</template>
<script setup>
import { ref, onMounted, onUnmounted, reactive, toRefs ,onActivated,onDeactivated} from "vue";
import {
  sortWinApi, stopSyncApi,
  syncListApi, syncStatusApi, syncWinApi
} from "../utils/httpApi";
import { ElMessage, ElNotification } from "element-plus";
import {
  Check,
  CircleCloseFilled,
  FullScreen,
  Monitor,
  VideoPlay
} from "@element-plus/icons-vue";
import { useWebSocketStore } from "../store";

const wsStore = useWebSocketStore();

const lastMasetId = ref(0);

const loading = ref(true);
const multipleTableRef = ref();
const ids = ref([]);
const tableData = ref([]);
const syncStatus = ref(true);
const diyWH = ref(false);

const data = reactive({
  whform: {
    width: 516,
    height: 516
  }
});
const { whform } = toRefs(data);

const onSetMater = (id) => {
  if (id === lastMasetId.value) {
    lastMasetId.value = 0;
  } else {
    lastMasetId.value = id;
  }
};
const onSortWin = (type) => {
  let data = null;
  let screen = null;
  diyWH.value=false;
  if (type === "all") {
    if (tableData.value.length < 1) {
      ElMessage({
        showClose: true,
        message: "窗口数量小于2不支持排列",
        type: "error"
      });
      return;
    }
  } else {

    if (type === "diy") {
      if (whform.value.width < 516 || whform.value.height < 516) {
        ElMessage({
          showClose: true,
          message: "窗口最小宽高  516*516",
          type: "error"
        });
        return;
      }
      screen = whform.value;
    }
    data = ids.value;
  }
  sortWinApi({ ids: data, screen: screen }).then((res) => {
    ElMessage({
      showClose: true,
      message: "窗口已排列",
      type: "success"
    });
  });
};
const stopSync = () => {
  stopSyncApi().then(res => {
    tableData.value.forEach((row) => {
      row.master = false;
    });

    syncStatus.value = res.status;
    ElNotification({
      title: "提示",
      message: "同步器已停止",
      type: "error"
    });
  });
};


const startSync = (type) => {
  let data = null;
  if (type === "all") {
    if (tableData.value.length < 1) {
      ElMessage({
        showClose: true,
        message: "窗口数量小于2不支持同步",
        type: "error"
      });
      return;
    }
  } else {
    if (ids.value.length < 1) {
      ElMessage({
        showClose: true,
        message: "已选窗口数量小于2不支持同步",
        type: "error"
      });
      return;
    }
    data = ids.value;
  }

  let masterId = lastMasetId.value > 0 ? lastMasetId.value : null;

  syncWinApi({ masterId: masterId, ids: data }).then((res) => {
    ElNotification({
      title: "提示",
      message: "同步器已启动",
      type: "success"
    });
  });
};


// 多选框选中数据
function handleSelectionChange(selection) {
  console.log("多选框选中数据", selection.length);
  ids.value = selection.map(item => item.id);
}

const getData = () => {
  loading.value = true;
  syncListApi().then(res => {
    tableData.value = res.data;
    loading.value = false;
  });

  syncStatusApi().then(res => {
    syncStatus.value = res.status;
  });

};

//自动适配高度代码
const tableHeight = ref(400);
// 计算表格高度的函数
const calculateTableHeight = () => {
  const header = document.querySelector(".fixed-header");
  const footer = document.querySelector(".fixed-footer");
  const windowHeight = window.innerHeight;
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = footer ? footer.offsetHeight : 0;
  // 减去头部和底部高度，再减去内容区域的上下内边距
  tableHeight.value = windowHeight - headerHeight - footerHeight - 60;
};


// 定义WS事件类型与处理函数的映射
const eventHandlers = {

  windowOpenResult: (res) => {
    const index = tableData.value.findIndex((row) => row.id === res.id);
    //不存在才添加
    if (index === -1) {
      tableData.value.push(res);
    }
  },
  syncResult: (res) => {
    syncStatus.value = res.status;
    if (lastMasetId.value === 0) {
      lastMasetId.value = res.id;
    }
    if (res.id !== lastMasetId.value) {
      //取消之前的主控信息
      tableData.value.filter((row) => row.id === lastMasetId.value).forEach((row) => {
        row.master = false;
      });
    }

    lastMasetId.value = res.id;
    tableData.value.filter((row) => row.id === res.id).forEach((row) => {
      row.master = true;
    });

  }
};

onActivated(() => {
  // 组件被激活时执行
  getData();
})

onDeactivated(() => {
  // 组件被停用时执行
})

onMounted(() => {
  calculateTableHeight();
  Object.entries(eventHandlers).forEach(([eventType, handler]) => {
    wsStore.on(eventType, handler);
  });


  // 监听窗口大小改变事件
  window.addEventListener("resize", calculateTableHeight);
});

onUnmounted(() => {
  Object.entries(eventHandlers).forEach(([eventType, handler]) => {
    wsStore.off(eventType, handler);
  });
  // 移除窗口大小改变事件监听器，防止内存泄漏
  window.removeEventListener("resize", calculateTableHeight);
});

</script>
<style scoped>
.fixed-cont {
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #FFFFFF;
}
</style>
