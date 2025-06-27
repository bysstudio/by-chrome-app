<template>

  <div class="fixed-header">


    <el-row :gutter="20">
      <el-col :span="14"><h3>环境管理</h3></el-col>
      <el-col :span="10">
        <p style="float:right;">
          <el-button type="warning" icon="Download" @click="opLocalDig">目录导入
          </el-button>
          <el-button type="primary" icon="Plus" @click="onUpdateWin('new',0)">新建环境
          </el-button>
          <el-button type="danger" icon="Crop" @click="batchCreate">批量创建
          </el-button>
        </p>

      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-form :model="queryParams" :inline="true" ref="queryRef">
          <el-form-item>
            <el-space wrap>
              <el-select
                v-model="queryParams.column"
                placeholder="条件"

                style="width: 100px"
                @change="onQuery1"
                clearable
              >
                <el-option
                  v-for="item in selectParam.column"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                :disabled="queryParams.column===null||queryParams.column===''"
                v-model="queryParams.op"
                placeholder="操作"
                @change="onQuery2"

                style="width: 100px"
                clearable
              >
                <el-option
                  v-for="item in selectParam.opArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>

              <el-input v-if="selectParam.isInput" v-model="queryParams.val" style="width: 100px" placeholder="为空"
                        clearable
                        :disabled="queryParams.op===null||queryParams.op===''" />
              <el-select
                v-else
                :disabled="queryParams.op===null||queryParams.op===''"
                v-model="queryParams.val"
                placeholder="请选择"

                style="width: 100px"
                clearable
              >
                <el-option
                  v-for="item in selectParam.valArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div v-if="item.color" class="flex items-center">
                    <el-tag :color="item.color" style="margin-right: 8px" size="small" />
                    <span :style="{ color: item.color }">{{ item.label }}</span>
                  </div>
                  <span v-else>{{ item.label }}</span>
                </el-option>
              </el-select>
              <el-button type="primary" icon="Search" @click="handleQuery" :disabled="!queryParams.op||checkedOpen">
                搜索
              </el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>

            </el-space>
          </el-form-item>

        </el-form>
      </el-col>
      <el-col :span="8">
        <div style="float:right;">
          <el-space>
            <el-checkbox label="已打开" v-model="checkedOpen" @change="getOpenList" />
            <el-button type="success" icon="SuccessFilled" @click="batchOpenWin" round>打开</el-button>
            <el-button type="danger" icon="CircleCloseFilled" @click="batchCloseWin" round>关闭</el-button>
            <el-dropdown>
              <el-button icon="MoreFilled" circle />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="getOpenList">刷新页面</el-dropdown-item>
                  <el-dropdown-item @click="onOpenBindProxy">代理配置</el-dropdown-item>
                  <el-dropdown-item @click="onBatchTagBtn">批量标签</el-dropdown-item>
                  <el-dropdown-item @click="onBatchRemark">批量备注</el-dropdown-item>
                  <el-dropdown-item @click="batchDelWin">批量删除</el-dropdown-item>
                  <el-dropdown-item @click="onBatchClearProxy('select')">批绑代理</el-dropdown-item>
                  <el-dropdown-item @click="onBatchClearProxy('all')">全解代理</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>

        </div>
      </el-col>
    </el-row>
  </div>


  <el-table :data="tableData"
            style="width:100%"
            v-loading="loading"
            size="small"
            row-key="id"
            :height="tableHeight"
            class="fixed-cont"
            @selectionChange="handleSelectionChange"
            :default-sort="defaultSort"
            @sort-change="handleSortChange" stripe>
    <el-table-column type="selection" width="45" />
    <el-table-column fixed prop="id" align="left" label="ID/环境" min-width="90"
                     sortable="custom">
      <template #default="scope">
        <el-tag type="primary" size="small">{{ scope.row.id }}</el-tag>
        <br>
        <el-text type="info" size="small">{{ scope.row.profile }}</el-text>
      </template>
    </el-table-column>
    <el-table-column prop="id" align="left" label="名称/分组" min-width="90">
      <template #default="scope">
        <el-text size="small">{{ scope.row.name }}</el-text>
        <br>
        <el-space>
          <ColorTag
            v-if="scope.row.groupName"
            :color="scope.row.groupColor"
            round
            size="small"
            type="light"
          >{{ scope.row.groupName }}
          </ColorTag>
          <el-icon :size="10" @click="onEditGroupBtn(scope.row)">
            <Edit />
          </el-icon>
        </el-space>

      </template>
    </el-table-column>

    <el-table-column prop="proxyId" label="代理信息" min-width="130"
                     sortable="custom">
      <template #default="scope">
        {{ scope.row.ip }}<br />
        <el-space wrap>
          {{ scope.row.countryCN }}
          <template v-if="scope.row.checkStatus">

            <el-icon color="#E6A23C" class="is-loading" v-if="scope.row.checkStatus===100">
              <Loading />
            </el-icon>
            <el-tag v-else :type="scope.row.checkStatus===0?
          'info':scope.row.checkStatus===1?'success':'danger'" size="small" effect="plain" round>
              {{ scope.row.checkStatus === 0 ?
              "未检测" : scope.row.checkStatus === 1 ? "可用" : "不可用" }}
            </el-tag>
          </template>
          <el-icon :size="10" @click="onEditProxyBtn(scope.row)">
            <Edit />
          </el-icon>
        </el-space>
      </template>
    </el-table-column>
    <el-table-column prop="tags" label="标签" min-width="180" show-overflow-tooltip>
      <template #default="scope">
        <el-space wrap>
          <ColorTag v-for="item in scope.row.tags"
                    :key="item.id"
                    :color="item.color"
                    round
                    size="small"
                    type="light"
          >{{ item.name }}
          </ColorTag>
          <el-icon :size="10" @click="onEditTagBtn(scope.row)">
            <Edit />
          </el-icon>
          <!--          <el-button size="small" :icon="Edit" @click="onEditTagBtn(scope.row)" circle />-->
        </el-space>
      </template>
    </el-table-column>
    <el-table-column prop="remark" label="备注" min-width="150">
      <template #default="scope">
        <el-space>
          <el-text size="small" line-clamp="2">{{ scope.row.remark }}</el-text>
          <el-icon :size="10" @click="onEditRemarkBtn(scope.row)">
            <Edit />
          </el-icon>
        </el-space>
      </template>

    </el-table-column>
    <el-table-column prop="openedAt" label="最后打开" min-width="120" sortable="custom" />
    <el-table-column prop="closedAt" label="最后关闭" min-width="120" sortable="custom" />

    <el-table-column prop="createdAt" label="创建/更新时间" min-width="150">
      <template #default="scope">
        {{ scope.row.createdAt }} <br />
        {{ scope.row.updatedAt }}
      </template>
    </el-table-column>

    <el-table-column fixed="right" align="center" label="操作" min-width="150">
      <template #default="scope">
        <el-space>
          <el-button type="primary" v-if="scope.row.status===0" @click="openWin([scope.row.id])">打开</el-button>
          <el-button type="warning" v-else-if="scope.row.status===-1" @click="resetWin(scope.row)">异常</el-button>
          <el-button type="danger" v-else-if="scope.row.status===1" @click="closeWin([scope.row.id])">关闭</el-button>
          <el-button type="success" v-else-if="scope.row.status===100" loading>打开中</el-button>
          <el-button type="info" v-else @click="resetWin(scope.row)">未知</el-button>

          <el-dropdown>
            <el-button :icon="Menu" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="Edit" @click="onUpdateWin('edit',scope.row.id)"
                                  :disabled="scope.row.status!==0">修改信息
                </el-dropdown-item>
                <el-dropdown-item :icon="Link" :disabled="scope.row.checkStatus===null||scope.row.proxyId===null"
                                  @click="onCheckProxy(scope.row)">检测代理
                </el-dropdown-item>
                <el-dropdown-item :icon="Delete" @click="onDelWin([scope.row.id])">删除环境</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-space>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog v-model="dialogEditTag" :title="formTag.title" width="300px" draggable>
    <el-space direction="vertical" alignment="stretch" style="width: 98%">
      <el-select :multiple="!formTag.batch" v-model="formTag.tids" placeholder="选择标签" :clearable="formTag.batch">
        <el-option
          v-for="item in formTag.data"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>


      <el-space v-if="formTag.batch">
        标签操作
        <el-radio-group v-model="formTag.op" style="width: 90%">
          <el-radio-button label="追加" value="append" />
          <el-radio-button label="删除" value="delete" />
        </el-radio-group>
      </el-space>
      <el-space v-else>
        <el-input type="text" placeholder="创建新标签" v-model="formTag.addName" />
        <el-color-picker v-model="formTag.color" />
        <el-button type="success" @click="onAddTag">创建</el-button>
      </el-space>
    </el-space>


    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="onSaveWinTag">保存</el-button>
        <el-button type="info" @click="dialogEditTag=false">取消</el-button>
      </div>
    </template>
  </el-dialog>


  <el-dialog v-model="dialogEditProxy" :title="formProxy.title" width="360px" draggable>


    <el-select v-model="formProxy.proxyId" placeholder="选择代理" clearable>

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
        v-for="item in formProxy.data"
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

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="onSaveProxy">保存</el-button>
        <el-button type="info" @click="dialogEditProxy=false">取消</el-button>
      </div>
    </template>
  </el-dialog>


  <el-dialog v-model="dialogEditGroup" :title="formGroup.title" width="300px" draggable>
    <el-space direction="vertical" alignment="stretch">
      <el-select v-model="formGroup.groupId" placeholder="选择分组" clearable>
        <el-option
          v-for="item in formGroup.data"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-space>
        <el-input type="text" placeholder="创建分组" v-model="formGroup.addName" />
        <el-color-picker v-model="formGroup.color" />
        <el-button type="danger" @click="onAddGroup">创建</el-button>
      </el-space>
    </el-space>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="onSaveWinGroup">
          保存
        </el-button>
        <el-button type="info" @click="dialogEditGroup=false">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="dialogEditRemark" :title="formRemark.title" width="300px" draggable>
    <el-input type="textarea"
              show-word-limit
              maxlength="120"
              rows="5"
              v-model="formRemark.remark"
              clearable></el-input>

    <div v-if="formRemark.batch"><p></p>
      <el-space> 备注操作
        <el-radio-group v-model="formRemark.op" style="width: 90%">
          <el-radio-button label="追加" value="append" />
          <el-radio-button label="覆盖" value="update" />
        </el-radio-group>
      </el-space>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="onSaveWinRemark">保存</el-button>
        <el-button type="info" @click="dialogEditRemark=false">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="autoProxy.open" title="自动配置环境代理" width="220px" draggable>
    <el-space direction="vertical" alignment="center">
      <el-text type="info">设置每个代理绑定环境的数量</el-text>
      <el-input-number v-model="autoProxy.num" :min="1" :max="20" />
      <el-text type="danger" size="small">一个代理绑定 {{ autoProxy.num }} 环境</el-text>
    </el-space>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="saveAutoProxy">保存</el-button>
        <el-button type="info" @click="autoProxy.open=false">取消</el-button>
      </div>
    </template>
  </el-dialog>


  <el-dialog
    v-model="localInPut"
    title="从目录导入 请选择ADS目录位置"
  >
    <el-row :gutter="20">
      <el-col :span="18">
        <el-input
          v-model="adsPath"
          disabled
          placeholder="未设置 路径不能中文"
        >
          <template #prepend><span style="width: 100px">选择ADS目录</span></template>
        </el-input>
      </el-col>
      <el-col :span="6">
        <el-button @click="openDirectory">选择目录</el-button>
      </el-col>
    </el-row>
    <br />
    <el-text size="small" type="info">迁移教程:</el-text>
    <br />
    <el-text size="small" type="info">1.手动创建缓存目录D:/bycache/chrome_data，在设置中缓存路径为D:/bycache</el-text>
    <br />
    <el-text size="small" type="info">2.把ads的cache目录复制的chrome_data目录下</el-text>
    <br />
    <el-text size="small" type="info">3.选择导入目录D:/bycache/chrome_data</el-text>
    <br />
    <el-text size="small" type="danger">提交后为异步导入，请等待10秒后刷新</el-text>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="localInPut = false">关闭</el-button>
        <el-button type="primary" :disabled="adsPath.length===0" @click="adsInPut">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>


  <div class="fixed-footer">
    <el-text size="small" type="info">已选 {{ ids.length }}</el-text>
    <el-pagination
      style="float:right;"
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      size="small"
      layout="total,sizes, prev, pager, next"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>


</template>
<script setup>
import { reactive, toRefs, ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  addGroupApi,
  addTagApi, adsInputApi,
  autoBingProxyApi, batchClearProxyApi,
  batchCloseWinApi, batchCreateWinApi,
  batchDelWinApi,
  batchOpenWinApi,
  batchOpRemarkApi,
  batchOpTagApi,
  bingTagApi,
  getGroupListApi,
  getProxyListApi,
  getTagListApi,
  getWindowListApi,
  openWinListApi,
  resetWinApi,
  testProxyByIdApi, updateConfigApi,
  updateWindowApi
} from "../utils/httpApi";
import { Edit, Operation, Link, Menu, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { h } from "vue";
import { useWebSocketStore } from "../store";

const router = useRouter();
const localInPut = ref(false);
const adsPath = ref("");
const total = ref(0);
const tableData = ref([]);
const loading = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const checkedOpen = ref(false);

const dialogEditTag = ref(false);
const dialogEditProxy = ref(false);

const dialogEditGroup = ref(false);

const dialogEditRemark = ref(false);

const wsStore = useWebSocketStore();


const data = reactive({
  form: {},
  autoProxy: {
    open: false,
    num: 1
  },
  formTag: {
    batch: false, //批量操作
    op: "append", //批量操作
    title: "",
    id: null,
    color: "#d583f1",
    tids: [],
    addName: "",
    data: []
  },

  formProxy: {
    title: "",
    id: null,
    proxyId: null,
    data: []
  },
  formGroup: {
    title: "",
    id: null,
    groupId: null,
    color: "#c1e4ff",
    addName: "",
    data: []
  },
  formRemark: {
    batch: false,  //批量操作
    title: "",
    id: null,
    op: "append",
    remark: null
  },

  queryParams: {
    pageNum: 1,
    pageSize: 10,
    column: "",
    op: "",
    val: "",
    orderBy: "id",
    desc: "desc"
  },


  selectParam: {
    opArr: [], //
    valArr: [],
    isInput: false,
    column: [
      {
        label: "ID",
        value: "id"
      },
      {
        label: "环境",
        value: "profile"
      },
      {
        label: "名称",
        value: "name"
      },
      {
        label: "标签",
        value: "tagId"
      },
      {
        label: "备注",
        value: "remark"
      },
      {
        label: "状态",
        value: "status"
      },
      {
        label: "分组",
        value: "groupId"
      },
      {
        label: "代理ID",
        value: "proxyId"
      }
    ],
    eq: [
      {
        label: "等于",
        value: "="
      },
      {
        label: "不等于",
        value: "!="
      }
    ],
    like: [
      {
        label: "包含",
        value: "="
      },
      {
        label: "不包含",
        value: "!="
      }
    ],
    status: [
      {
        label: "已打开",
        value: "1"
      },
      {
        label: "未打开",
        value: "0"
      }, {
        label: "异常",
        value: "-1"
      }
    ]
  }
  ,
  rules: {}
});
const { queryParams, selectParam, formTag, formProxy, formGroup, formRemark, autoProxy } = toRefs(data);

const onQuery1 = () => {
  if (queryParams.value.column && queryParams.value.column !== "") {
    selectParam.value.isInput = true;
    selectParam.value.opArr = selectParam.value.eq;

    queryParams.value.val="";
    //选择操作
    if (queryParams.value.column === "status" ||
      queryParams.value.column === "tagId" ||
      queryParams.value.column === "groupId") {
      selectParam.value.isInput = false;

      if (queryParams.value.column === "status") {
        selectParam.value.valArr = selectParam.value.status;
      } else if (queryParams.value.column === "tagId") {
        getTagListApi().then(res => {
          let data = [];
          for (const datum of res.data) {
            data.push({ label: datum.name, value: datum.id, color: datum.color });
          }
          selectParam.value.valArr = data;
        });
      } else if (queryParams.value.column === "groupId") {
        getGroupListApi().then(res => {
          let data = [];

          for (const datum of res.data) {
            data.push({ label: datum.name, value: datum.id });
          }
          selectParam.value.valArr = data;
        });
      }
    } else if (queryParams.value.column === "id" ||
      queryParams.value.column === "proxyId") {

    } else {
      selectParam.value.opArr = selectParam.value.like;
    }
    //默认操作
    queryParams.value.op=selectParam.value.opArr[0].value;
  } else {
    queryParams.value.column = "";
    queryParams.value.op = "";
    selectParam.value.opArr = [];
  }
};

const onQuery2 = () => {
  if (!queryParams.value.op || queryParams.value.op === "") {
    queryParams.value.op = "";
    queryParams.value.val = "";
    selectParam.value.valArr = [];
  }
};


const onAddTag = () => {
  if (formTag.value.addName && formTag.value.addName !== "") {
    addTagApi({ name: formTag.value.addName, color: formTag.value.color }).then(res => {
      formTag.value.tids.push(res.data.id);
      formTag.value.data.push(res.data);
      formTag.value.addName = "";
      formTag.value.color = "#d583f1";
    });
  } else {
    ElMessage({
      showClose: true,
      message: "新建标签名不能为空",
      type: "warning"
    });
  }
};
const onAddGroup = () => {
  if (formGroup.value.addName && formGroup.value.addName !== "") {
    addGroupApi({ name: formGroup.value.addName, color: formGroup.value.color }).then(res => {
      formGroup.value.data.push(res.data);
      formGroup.value.addName = "";
      formGroup.value.color = "#cfd2ff";
      formGroup.value.groupId = res.data.id;
    });
  } else {
    ElMessage({
      showClose: true,
      message: "新建分组不能为空",
      type: "warning"
    });
  }
};

const onSaveWinTag = () => {
  if (formTag.value.batch) {
    if (formTag.value.tids) {
      batchOpTagApi({ op: formTag.value.op, ids: ids.value, tid: formTag.value.tids }).then(res => {
        dialogEditTag.value = false;
        formTag.value.batch = false;
        if (!checkedOpen.value) {
          getTableData(queryParams.value);
        } else {
          getOpenList();
        }

      }).catch(err => {
        ElMessage({
          showClose: true,
          message: err.message,
          type: "error"
        });
      });


    } else {
      ElMessage({
        showClose: true,
        message: "最少选择一项",
        type: "warning"
      });
    }
  } else {
    if (formTag.value.id && formTag.value.tids) {
      bingTagApi({ id: formTag.value.id, data: formTag.value.tids }).then(res => {
        if (!checkedOpen.value) {
          getTableData(queryParams.value);
        } else {
          getOpenList();
        }
        dialogEditTag.value = false;
      });
    }
  }


};

const onSaveWinGroup = () => {
  if (formGroup.value.id) {
    updateWindowApi({
      id: formGroup.value.id,
      data: { groupId: formGroup.value.groupId ? formGroup.value.groupId : null }
    }).then(res => {
      if (!checkedOpen.value) {
        getTableData(queryParams.value);
      } else {
        getOpenList();
      }
      dialogEditGroup.value = false;
    });
  } else {
    ElMessage({
      showClose: true,
      message: "不能为空",
      type: "warning"
    });
  }
};

const onSaveWinRemark = () => {
//批量操作
  if (formRemark.value.batch) {
    if (formRemark.value.op === "append" && (formRemark.value.remark.length < 1)) {
      ElMessage({
        showClose: true,
        message: "追加输入不能为空",
        type: "warning"
      });
      return;
    }
    batchOpRemarkApi({ op: formRemark.value.op, remark: formRemark.value.remark, ids: ids.value }).then(res => {
      dialogEditRemark.value = false;
      if (!checkedOpen.value) {
        getTableData(queryParams.value);
      } else {
        getOpenList();
      }
    });

  } else {
    if (formRemark.value.id) {
      updateWindowApi({
        id: formRemark.value.id,
        data: { remark: formRemark.value.remark }
      }).then(res => {
        console.log("AAAAAA", checkedOpen.value);
        if (!checkedOpen.value) {
          console.log("getTableData");
          getTableData(queryParams.value);
        } else {
          console.log("getOpenList");
          getOpenList();
        }
        dialogEditRemark.value = false;
      });
    }
  }
};

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

const onSaveProxy = () => {
  if (formProxy.value.id) {
    const pid = formProxy.value.proxyId ? formProxy.value.proxyId : null;

    updateWindowApi({
      id: formProxy.value.id,
      data: { proxyId: pid }
    }).then(res => {
      if (!checkedOpen.value) {
        getTableData(queryParams.value);
      } else {
        getOpenList();
      }
      dialogEditProxy.value = false;
    });
  } else {
    ElMessage({
      showClose: true,
      message: "代理选项不能为空",
      type: "warning"
    });
  }
};

const onEditProxyBtn = (row) => {
  getProxyListApi().then(res => {
    formProxy.value.title = `编辑环境ID ${row.id} 代理`;
    formProxy.value.id = row.id;
    formProxy.value.proxyId = row.proxyId;
    res.data.sort((a, b) => a.wids.length - b.wids.length);
    formProxy.value.data = res.data;
    dialogEditProxy.value = true;
  }).catch(err => {
    ElMessage({
      showClose: true,
      message: "获取代理数据失败" + err.message,
      type: "error"
    });
  });
};

const onEditTagBtn = (row) => {
  getTagListApi().then(res => {
    formTag.value.batch = false;
    formTag.value.op = "append";
    formTag.value.title = `编辑环境ID ${row.id} 标签`;
    formTag.value.id = row.id;
    formTag.value.tids = [];
    if (row.tags && row.tags.length > 0) {
      formTag.value.tids = row.tags.map(item => item.id);
    }
    formTag.value.data = res.data;
    dialogEditTag.value = true;
  }).catch(err => {
    ElMessage({
      showClose: true,
      message: "获取标签数据失败" + err.message,
      type: "error"
    });
  });
};
const onBatchTagBtn = () => {
  if (ids.value.length < 1) {
    ElMessage({
      showClose: true,
      message: "批量编辑标签，需要勾选环境ID",
      type: "error"
    });
    return;
  }

  getTagListApi().then(res => {
    formTag.value.title = `批量操作添加/删除标签`;
    formTag.value.batch = true;
    formTag.value.tids = null;
    formTag.value.op = "append";
    formTag.value.data = res.data;
    dialogEditTag.value = true;
  }).catch(err => {
    ElMessage({
      showClose: true,
      message: "获取标签数据失败" + err.message,
      type: "error"
    });
  });
};


const onEditGroupBtn = (row) => {
  getGroupListApi().then(res => {
    formGroup.value.title = `编辑环境ID ${row.id} 分组`;
    formGroup.value.id = row.id;
    formGroup.value.groupId=null;
    if(row.groupId!==null&&row.groupId!==undefined){
      formGroup.value.groupId = Number(row.groupId);
    }
    formGroup.value.data = res.data;
    dialogEditGroup.value = true;
  }).catch(err => {
    ElMessage({
      showClose: true,
      message: "获取分组数据失败" + err.message,
      type: "error"
    });
  });
};


const onEditRemarkBtn = (row) => {
  formRemark.value.title = `编辑环境ID ${row.id} 备注`;
  formRemark.value.id = row.id;
  formRemark.value.batch = false;
  formRemark.value.remark = row.remark;
  dialogEditRemark.value = true;
};


const onBatchRemark = () => {
  if (ids.value.length < 1) {
    ElMessage({
      showClose: true,
      message: "批量编辑备注，需要勾选环境ID",
      type: "error"
    });
  } else {
    formRemark.value.title = `批量操作备注`;
    formRemark.value.remark = "";
    formRemark.value.op = "append";
    formRemark.value.batch = true;
    dialogEditRemark.value = true;
  }
};


const onOpenBindProxy = () => {
  if (tableData.value.length < 1) {
    return;
  }
  autoProxy.value.num = 1;
  autoProxy.value.open = true;
};

const saveAutoProxy = () => {
  autoBingProxyApi({ num: autoProxy.value.num }).then(res => {
    ElMessage({
      showClose: true,
      message: "自动配置代理成功",
      type: "success"
    });
    autoProxy.value.open = false;
    if (checkedOpen.value) {
      getTableData(queryParams.value);
    } else {
      getOpenList();
    }
  });
};

const onBatchClearProxy = (type) => {
  let title = "解绑IP代理";
  let desc = "一键解绑全部环境的IP代理信息";
  let data = null;
  if (type === "select") {
    if (ids.value.length < 1) {
      ElMessage({
        showClose: true,
        message: "批量解绑IP代理，需要勾选环境ID",
        type: "error"
      });
      return;
    }
    data = ids.value;
    desc = `解绑已选环境ID的IP代理信息 ids=${data}`;
  }

  ElMessageBox.confirm(
    desc,
    title,
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    batchClearProxyApi({ data: data }).then(res => {
      ElMessage({
        type: "success",
        message: "解除绑定代理信息成功"
      });
      getTableData(queryParams.value);
    });
  }).catch(() => {
    ElMessage({
      type: "info",
      message: "取消操作"
    });
  });

};

const defaultSort = ref({ prop: "id", order: "" });

/** 排序触发事件 */
function handleSortChange(column, prop, order) {
  if (checkedOpen.value) {
    return;
  }
  if (column.order == null) {
    queryParams.value.orderBy = "id";
    queryParams.value.desc = "desc";
  } else {

    queryParams.value.orderBy = column.prop;
    if (column.order === "descending") {
      queryParams.value.desc = "desc";
    } else {
      queryParams.value.desc = "asc";
    }
  }
  getTableData(queryParams.value);
}

function getTableData(query) {
  let data = { ...query };
  if (data.column !== "" && data.op !== "") {
    data[data.column] = data.val;
  }
  delete data.val;
  delete data.column;
  getWindowListApi(data).then(res => {
    loading.value = false;
    tableData.value = res.data;
    total.value = res.total;
  });
}

// 多选框选中数据
function handleSelectionChange(selection) {
  console.log("多选框选中数据", selection.length);
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

function batchCloseWin() {
  if (ids.value.length < 1) {
    ElMessage({
      showClose: true,
      message: "批量关闭，需要勾选环境ID",
      type: "error"
    });
    return;
  }
  closeWin(ids.value);
}

function resetWin(row) {
  resetWinApi({ id: row.id }).then(res => {
    row.status = 0;
  });
}

function closeWin(ids) {
  batchCloseWinApi({ ids: ids }).then(res => {
  });
}

function batchOpenWin() {
  if (ids.value.length < 1) {
    ElMessage({
      showClose: true,
      message: "批量打开，需要勾选环境ID",
      type: "error"
    });
    return;
  }
  openWin(ids.value);
}


function getOpenList() {
  if (checkedOpen.value) {
    openWinListApi().then(res => {
      tableData.value = res.data;
      total.value = res.total;
    });
  } else {
    getTableData(queryParams.value);
  }

}

function openWin(ids) {

  const result = tableData.value.filter(row =>
    ids.includes(row.id) && (row.status === 0)
  );
  if (result.length === 0) {
    return;
  }

  let data = [];
  result.forEach((row) => {
    data.push(row.id);
    row.status = 100;
  });
  batchOpenWinApi({ ids: data }).then(res => {

  });

}


function batchDelWin() {
  if (ids.value.length < 1) {
    ElMessage({
      showClose: true,
      message: "批量删除，需要勾选环境ID",
      type: "error"
    });
    return;
  }
  onDelWin(ids.value);

}

const onUpdateWin = (type, id) => {
  router.push({
    path: "/editWin",
    query: { type: type, id: id, total: total.value }
  });
};

const opLocalDig = () => {
  adsPath.value = "";
  localInPut.value = true;
};

const openDirectory = async () => {
  //'openFile', 'openDirectory', 'multiSelections'
  const path = await window.electronAPI.invoke("common-choose-path", "openDirectory");
  if (path) {
    adsPath.value = path;
  } else {
    ElMessage({
      showClose: true,
      message: `取消选择目录`,
      type: "error"
    });

  }
};

const adsInPut = () => {
  if (adsPath.value.length < 1) {
    ElMessage({
      type: "info",
      message: "选择目录不能为空"
    });
    return;
  }
  console.log("选择的目录", adsPath.value);
  localInPut.value = false;
  adsInputApi({ dirPath: adsPath.value }).then(res => {
    console.log(res.data);
  });


};

const batchCreate = () => {
  ElMessageBox.prompt("请输入创建环境数量", "批量创建环境", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputType: "number",
    inputValue: 1,
    inputPattern: /^[1-9]\d*$/,
    inputErrorMessage: "必须整数并且大于0"
  }).then(({ value }) => {
    batchCreateWinApi({ num: Number(value) }).then(res => {
      resetQuery();
      ElMessage({
        type: "success",
        message: "批量创建环境成功"
      });
    });
  }).catch(() => {
    ElMessage({
      type: "info",
      message: "取消创建"
    });
  });
};

function onDelWin(ids) {
  const result = tableData.value.filter(row =>
    ids.includes(row.id) && (row.status === 1 || row.status === 100)
  );
  if (result.length > 0) {
    ElMessage({
      type: "error",
      message: `请停止环境后再进行删除操作`
    });
    return;
  }


  const msg = `环境id为[${ids}]`;
  const msg1 = h("p", null, [
    h("p", { style: "color:#000000;font-weight: bold;" }, msg),
    h("p", null, "删除环境不会删除缓存文件夹，需要手动到系统中删除"),
    h("span", null, "请输入 "),
    h("span", { style: "color: red; font-weight: bold;" }, "确认删除"),
    h("span", null, "  进行验证")
  ]);

  ElMessageBox.prompt(msg1, "删除环境提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /^确认删除$/,
    inputErrorMessage: "验证错误"
  }).then(() => {
    batchDelWinApi({ ids: JSON.stringify(ids) }).then(res => {
      resetQuery();
      ElMessage({
        type: "success",
        message: "删除环境成功"
      });
    });
  }).catch(() => {
    ElMessage({
      type: "info",
      message: "取消删除"
    });
  });
}


/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getTableData(queryParams.value);
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value.column = "";
  queryParams.value.op = "";
  queryParams.value.val = "";
  console.log("重置按钮操作");
  handleQuery();
}

//改变每页查看数量
const handleSizeChange = (val) => {
  if (checkedOpen.value) {
    return;
  }
  queryParams.value.pageSize = val;
  queryParams.value.pageNum = 1;
  getTableData(queryParams.value);
};
//分页
const handleCurrentChange = (val) => {
  if (checkedOpen.value) {
    return;
  }
  getTableData(queryParams.value);
};
const onCheckProxy = (row) => {

  if (row.checkStatus === 100) {
    return;
  }

  testProxyByIdApi({ id: row.proxyId }).then(res => {
    //筛选使用了同样的代理
    for (let i = 0; i < tableData.value.length; i++) {
      const d = tableData.value[i];
      if (d.proxyId && d.proxyId === row.proxyId) {
        d.checkStatus = 100;
      }
    }
  }).catch(err => {
    row.checkStatus = -1;
  });

};
// 定义WS事件类型与处理函数的映射
const eventHandlers = {

  proxyPingResult: (res) => {
    //筛选同样的代理
    const backId = res.id;
    delete res.id;
    for (let i = 0; i < tableData.value.length; i++) {
      const d = tableData.value[i];
      if (d.proxyId && d.proxyId === backId) {
        tableData.value[i] = { ...d, ...res };
      }
    }
  },
  windowOpenResult: (res) => {

    if (res.code === 200) {
      console.log("监听WS回调", res);
      const index = tableData.value.findIndex((row) => row.id === res.id);
      if (index !== -1) {
        tableData.value[index].status = res.status;
      }
    } else {
      ElNotification({
        title: "打开环境失败",
        message: res.msg,
        type: "error"
      });
    }

  },
  windowCloseResult: (res) => {
    console.log("windowCloseResult", res);
    if (res.code === 200) {
      const index = tableData.value.findIndex((row) => row.id === res.id);
      if (index !== -1) {
        tableData.value[index].status = res.status;
      }
    } else {
      ElNotification({
        title: "关闭环境失败",
        message: res.msg,
        type: "error"
      });
    }
  }
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
  tableHeight.value = windowHeight - headerHeight - footerHeight - 20;
};


onMounted(() => {
  calculateTableHeight();
  // 监听窗口大小改变事件
  window.addEventListener("resize", calculateTableHeight);
  Object.entries(eventHandlers).forEach(([eventType, handler]) => {
    wsStore.on(eventType, handler);
  });
  getTableData(queryParams.value);
});

onUnmounted(() => {
  // 移除窗口大小改变事件监听器，防止内存泄漏
  window.removeEventListener("resize", calculateTableHeight);
  Object.entries(eventHandlers).forEach(([eventType, handler]) => {
    wsStore.off(eventType, handler);
  });
});

</script>
<style scoped>

</style>
