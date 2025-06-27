<template>

  <div class="fixed-header">
    <h3>系统设置</h3>
  </div>

  <div class="fixed-cont" :style="{ height: tableHeight + 'px' }">
    <el-row :gutter="20">
      <el-col :span="12">

        <el-row :gutter="10">
          <el-col :span="7"><h5>标签管理({{ tagDataList.length }})</h5></el-col>
          <el-col :span="17" align="right" style="padding-right: 25px">
            <p>
              <el-form v-model="tagForm" :inline="true">
                <el-form-item label="新增">
                  <el-input type="text" v-model="tagForm.name" placeholder="标签名称" style="width: 200px"></el-input>
                  <el-color-picker v-model="tagForm.color" style="margin-left: 10px;margin-right: 10px" />
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="保存"
                    placement="bottom-start"
                  >
                    <el-button type="primary" icon="UploadFilled" size="small" @click="saveTag" circle />
                  </el-tooltip>
                </el-form-item>

              </el-form>
            </p>
          </el-col>
        </el-row>


        <el-table :data="tagDataList"
                  style="width:100%"
                  size="small"
                  :height="200"
                  row-key="id"
        >
          <el-table-column fixed prop="id" label="ID" width="50" />
          <el-table-column prop="name" label="名称" min-width="150">
            <template #default="scope">
              <el-input v-model="scope.row.name"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="color" label="颜色">
            <template #default="scope">
              <el-color-picker v-model="scope.row.color" />
            </template>
          </el-table-column>
          <el-table-column fixed="right" align="center" label="操作" min-width="120">


            <template #default="scope">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="更新"
                placement="bottom-start"
              >
                <el-button type="primary" icon="UploadFilled" size="small" @click="updateTag(scope.row)" circle />
              </el-tooltip>
              <el-tooltip
                class="box-item"
                effect="dark"
                content="删除"
                placement="bottom"
              >
                <el-button type="danger" icon="Delete" size="small" @click="delTag(scope.row.id)" circle />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="12">

        <el-row :gutter="20">
          <el-col :span="7"><h5>分组管理({{ groupDataList.length }})</h5></el-col>
          <el-col :span="17" align="right" style="padding-right: 25px">
            <p>
              <el-form v-model="groupForm" :inline="true">
                <el-form-item label="新增">
                  <el-input type="text" v-model="groupForm.name" placeholder="分组名称" style="width: 200px"></el-input>
                  <el-color-picker v-model="groupForm.color" style="margin-left: 10px;margin-right: 10px" />
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="保存"
                    placement="bottom-start"
                  >
                    <el-button type="primary" icon="UploadFilled" size="small" @click="saveGroup" circle />
                  </el-tooltip>
                </el-form-item>
              </el-form>
            </p>
          </el-col>
        </el-row>


        <el-table :data="groupDataList"
                  style="width:100%"
                  size="small"
                  :height="200"
                  row-key="id"
        >
          <el-table-column fixed prop="id" label="ID" width="50" />
          <el-table-column prop="name" label="名称" min-width="150">
            <template #default="scope">
              <el-input v-model="scope.row.name"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="color" label="颜色">
            <template #default="scope">
              <el-color-picker v-model="scope.row.color" />
            </template>
          </el-table-column>
          <el-table-column fixed="right" align="center" label="操作" min-width="120">


            <template #default="scope">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="更新"
                placement="bottom-start"
              >
                <el-button type="primary" icon="UploadFilled" size="small" @click="updateGroup(scope.row)" circle />
              </el-tooltip>
              <el-tooltip
                class="box-item"
                effect="dark"
                content="删除"
                placement="bottom"
              >
                <el-button type="danger" icon="Delete" size="small" @click="delGroup(scope.row.id)" circle />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <H4>浏览器设置</H4>

    <div class="mt-4">
      <el-input
        v-model="configData.cachePath"
        disabled
        style="max-width: 90%"
        placeholder="未设置 路径不能中文"
      >
        <template #prepend><span style="width: 120px">缓存文件夹目录</span></template>
      </el-input>
      <el-button @click="openDirectory">选择目录</el-button>
    </div>
    <p></p>

    <div class="mt-4">
      <el-input
        v-model="configData.chromePath"
        disabled
        style="max-width: 90%"
        placeholder="未设置 路径不能中文"
      >
        <template #prepend><span style="width: 120px">Chrome.exe路径</span></template>
      </el-input>
      <el-button @click="openFile">选择路径</el-button>
    </div>
    <br />
    <el-text>ADS迁移教程:</el-text>
    <br />
    <el-text>1.手动创建目录D:/bycache/chrome_data，设置缓存路径为 D:/bycache</el-text>
    <br />
    <el-text>2.把ads的cache目录复制的chrome_data目录下</el-text>
    <br />
    <el-text>3.环境管理->目录导入 选择导入目录 D:/bycache/chrome_data</el-text>

  </div>


  <div class="fixed-footer">

  </div>


</template>
<script setup>
import { ref, onMounted, onUnmounted, reactive, toRefs } from "vue";
import { useRouter } from "vue-router";
import {
  addGroupApi,
  addTagApi, delGroupApi,
  delTagApi,
  getGroupListApi, getConfigApi,
  getTagListApi,
  updateGroupApi,
  updateTagApi, updateConfigApi
} from "../utils/httpApi";
import { ElMessage } from "element-plus";


const router = useRouter();
// 表单数据
const data = reactive({
  tagForm: {
    name: "",
    color: "#cfd2ff"
  },
  groupForm: {
    name: "",
    color: "#d583f1"
  },
  configData: {
    id: null,
    cachePath: "",
    chromePath: ""
  }
});


const { tagForm, groupForm, configData } = toRefs(data);

const tagDataList = ref([]);
const groupDataList = ref([]);


const getData = () => {
  //获取标签数据
  getTagListApi().then(res => {
    tagDataList.value = res.data;
  });
  //获取分组数据
  getGroupListApi().then(res => {
    groupDataList.value = res.data;
  });
  getConfigApi().then(res => {
    if (res.data) {
      configData.value = res.data;
    }

  });
};
const saveTag = () => {
  if (tagForm.value.name) {
    addTagApi(tagForm.value).then(res => {

      tagDataList.value.push(res.data);
      ElMessage({
        showClose: true,
        message: `新增标签 ${tagForm.value.name} 成功`,
        type: "success"
      });
      tagForm.value.name = "";
    });
  } else {
    ElMessage({
      showClose: true,
      message: `新增标签名称不能为空`,
      type: "error"
    });
  }

};
const saveGroup = () => {
  if (groupForm.value.name) {
    addGroupApi(groupForm.value).then(res => {

      groupDataList.value.push(res.data);
      ElMessage({
        showClose: true,
        message: `新增分组 ${groupForm.value.name} 成功`,
        type: "success"
      });
      groupForm.value.name = "";
    });
  } else {
    ElMessage({
      showClose: true,
      message: `新增分组名称不能为空`,
      type: "error"
    });
  }

};

const updateTag = (row) => {
  updateTagApi({ id: row.id, data: row }).then(res => {
    ElMessage({
      showClose: true,
      message: `更新标签${row.id}成功`,
      type: "success"
    });
  });
};

const updateGroup = (row) => {
  updateGroupApi({ id: row.id, data: row }).then(res => {
    ElMessage({
      showClose: true,
      message: `更新分组${row.id}成功`,
      type: "success"
    });
  });
};
const delTag = (id) => {
  delTagApi({ id }).then(res => {
    ElMessage({
      showClose: true,
      message: `删除标签 ${id}成功`,
      type: "success"
    });
    //获取标签数据
    getTagListApi().then(res => {
      tagDataList.value = res.data;
    });

  });
};
const delGroup = (id) => {
  delGroupApi({ id }).then(res => {

    ElMessage({
      showClose: true,
      message: `删除分组 ${id}成功`,
      type: "success"
    });

    //获取标签数据
    getGroupListApi().then(res => {
      groupDataList.value = res.data;
    });

  });
};

const openDirectory = async () => {
  //'openFile', 'openDirectory', 'multiSelections'
  const path = await window.electronAPI.invoke("common-choose-path", "openDirectory");
  if (path) {
    configData.value.cachePath = path;
    await updateConfigApi({ id: configData.value.id, data: { cachePath: path } });

  } else {
    ElMessage({
      showClose: true,
      message: `取消选择目录`,
      type: "error"
    });

  }
};
const openFile = async () => {
  //'openFile', 'openDirectory', 'multiSelections'
  const path = await window.electronAPI.invoke("common-choose-path", "openFile");
  let msg;
  if (path) {
    if (/.exe/.test(path)) {
      configData.value.chromePath = path;
      await updateConfigApi({ id: configData.value.id, data: { chromePath: path } });
      return;
    } else {
      msg = "不是exe文件";
    }
  } else {
    msg = "取消选择exe路径";
  }

  ElMessage({
    showClose: true,
    message: msg,
    type: "error"
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
  tableHeight.value = windowHeight - headerHeight - footerHeight - 45;
};
onMounted(() => {
  calculateTableHeight();
  getData();
  // 监听窗口大小改变事件
  window.addEventListener("resize", calculateTableHeight);
});

onUnmounted(() => {
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
