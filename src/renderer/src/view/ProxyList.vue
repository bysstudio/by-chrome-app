<template>

  <div class="fixed-header">

    <el-row :gutter="20">
      <el-col :span="14"><h3>代理管理</h3></el-col>
      <el-col :span="10">
        <p style="float:right;">

        </p>

      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-form :model="queryParams" :inline="true">
          <el-form-item>
            <el-space wrap>
              <el-input v-model="queryParams.id" placeholder="代理ID" style="width: 80px" clearable />
              <el-input v-model="queryParams.ip" placeholder="IP" style="width: 100px" clearable />
              <el-select
                v-model="queryParams.checkStatus"
                placeholder="状态"

                style="width: 80px"
                clearable
              >
                <el-option
                  v-for="item in statusList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>

            </el-space>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="8">
        <div style="float:right;">
          <el-button type="primary" icon="Link" @click="batchTestProxy" round>检测代理</el-button>
          <el-button type="success"  icon="Plus" @click="router.push('/newproxy')" round>新建代理
          </el-button>
          <el-dropdown style="padding-left: 10px">
            <el-button icon="MoreFilled" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="resetQuery">刷新页面</el-dropdown-item>
                <el-dropdown-item @click="batchDel">批量删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-col>
    </el-row>


  </div>


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
            :default-sort="defaultSort"
            @sort-change="handleSortChange">
    <el-table-column type="selection" width="45" />
    <el-table-column fixed prop="id" align="center" label="ID" width="80"
                     sortable="custom">

      <template #default="scope">
        <el-tag type="info" size="small">{{ scope.row.id }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="ip" label="代理信息" min-width="200"
                     sortable="custom">
      <template #default="scope">
        <el-text size="small"> {{ scope.row.type }}://{{ scope.row.ip }}:{{ scope.row.port }}</el-text>

      </template>
    </el-table-column>
    <el-table-column prop="wids" align="center" label="关联环境数" min-width="80">
      <template #default="scope">
        {{ scope.row.wids ? scope.row.wids.length : 0 }}
      </template>
    </el-table-column>

    <el-table-column prop="countryCN" label="归属地" min-width="120" show-overflow-tooltip>
      <template #default="scope">
        {{ scope.row.countryCN }}
        {{ scope.row.location }}

      </template>
    </el-table-column>

    <el-table-column prop="checkData" label="状态" min-width="220">
      <template #default="scope">
        <el-progress
          :percentage="100"
          status="warning"
          :indeterminate="true"
          :duration="8"
          v-if="scope.row.checkStatus===100"
        />
        <template v-else-if="scope.row.checkStatus===0">
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


    <el-table-column prop="wids" align="center" label="关联环境" min-width="150" show-overflow-tooltip>
      <template #default="scope">
        {{ scope.row.wids ? scope.row.wids.join(',') : '' }}
      </template>
    </el-table-column>
    <el-table-column prop="account" label="账号/密码" width="120">
      <template #default="scope">
        {{ scope.row.account }}
        {{ scope.row.password }}
      </template>
    </el-table-column>

    <el-table-column prop="createdAt" label="创建/更新时间" min-width="180">
      <template #default="scope">
        {{ scope.row.createdAt }} <br />
        {{ scope.row.updatedAt }}
      </template>
    </el-table-column>

    <el-table-column fixed="right" align="center" label="操作" min-width="120">
      <template #default="scope">
        <el-tooltip
          class="box-item"
          effect="dark"
          content="检测代理"
          placement="bottom-start"
        >
          <el-button type="primary" @click="onOneCheck(scope.row)" icon="Link" size="small"
                     :disabled="scope.row.checkStatus===100" circle />
        </el-tooltip>
        <el-tooltip
          class="box-item"
          effect="dark"

          content="编辑代理"
          placement="bottom-start"
        >
          <el-button type="info" icon="Edit" size="small" @click="onEditProxy(scope.row)" circle />
        </el-tooltip>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="删除代理"
          placement="bottom"
        >
          <el-button type="danger" icon="Delete" size="small"
                     :disabled="scope.row.wids.length>0"
                     @click="onDel(scope.row)"
                     circle />
        </el-tooltip>


      </template>
    </el-table-column>
  </el-table>

  <div class="fixed-footer">
    <el-text size="small" type="info">已选 {{ids.length}}</el-text>
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
import { reactive, toRefs, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { batchDelProxyApi, batchTestProxyApi, getProxyListApi, testProxyByIdApi } from '../utils/httpApi'
import { CircleCloseFilled, Odometer, SuccessFilled } from '@element-plus/icons-vue'
import { useWebSocketStore } from '../store'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const total = ref(0)
const tableData = ref([])
const loading = ref(true)
const ids = ref([])
const multipleTableRef = ref()

const wsStore = useWebSocketStore()

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ip: null,
    op: '=',
    checkStatus: null,
    orderBy: 'id',
    desc: 'desc'
  },

  statusList: [
    {
      label: '未检测',
      value: 0
    },
    {
      label: '可用',
      value: 1
    },
    {
      label: '不可用',
      value: -1
    },
    {
      label: '检测中',
      value: 100
    }

  ],


  rules: {}
})
const { queryParams, statusList } = toRefs(data)


const onOneCheck = async (item) => {

  if (item.checkStatus === 100) {
    return
  }
  testProxyByIdApi({ id: item.id }).then(res => {
    item.checkStatus = 100
  }).catch(err => {
    item.checkStatus = -1
  })

}

const parseStatus = (json) => {
  try {
    // 1. 处理 null/undefined
    if (json == null) return []

    // 2. 如果是数组，直接返回
    if (Array.isArray(json)) return json

    // 3. 如果是对象，包裹成数组
    if (typeof json === 'object') return [json]

    // 4. 如果是字符串，尝试解析为 JSON
    if (typeof json === 'string') {
      const parsed = JSON.parse(json)
      // 解析后如果是数组或对象，统一转换为数组
      return Array.isArray(parsed) ? parsed : [parsed]
    }

    // 5. 其他类型（如数字、布尔值）包裹成数组
    return [json]
  } catch (e) {
    // JSON 解析失败时返回空数组，避免 v-for 报错
    return []
  }
}

const onEditProxy = (row) => {

  console.log('我要打开页面')
  router.push({
    path: '/editProxy',
    query: {
      id: row.id
    }
  })
}

const batchTestProxy = () => {
  if (ids.value.length > 0) {
    //过滤掉在检测中的
    const result = tableData.value.filter(row =>
      ids.value.includes(row.id) && row.checkStatus !== 100
    )
    let idsFilter = []
    result.forEach((row) => {
      idsFilter.push(row.id)
    })
    if (idsFilter.length > 0) {
      batchTestProxyApi({ ids: JSON.stringify(idsFilter) }).then(res => {
        result.forEach((row) => {
          row.checkStatus = 100
        })
      })
    }
    //清除多选
    multipleTableRef.value.clearSelection()
  } else {
    ElMessage({
      showClose: true,
      message: '批量检测代理，需要勾选环境ID',
      type: 'error'
    })
  }
}


const onDel = (row) => {
  if (row.wids.length > 0) {
    ElMessage({
      showClose: true,
      message: `有关联环境，不能删除 ${row.wids}`,
      type: 'error'
    })
  } else {

    ElMessageBox.confirm(
      `是否删除代理 ${row.id}`,
      '删除确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      batchDelProxyApi({ ids: JSON.stringify([row.id]) }).then(res => {
        getTableData()
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
      })
    })


  }

}

const batchDel = () => {
  if (ids.value.length > 0) {
    //过滤在引用的
    const result = tableData.value.filter(row =>
      ids.value.includes(row.id) && row.wids.length === 0
    )
    let idsFilter = []
    result.forEach((row) => {
      idsFilter.push(row.id)
    })
    if (idsFilter.length > 0) {

      ElMessageBox.confirm(
        `是否删除代理 ${idsFilter}`,
        '删除确认',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {

        batchDelProxyApi({ ids: JSON.stringify(idsFilter) }).then(res => {
          getTableData()
          ElMessage({
            type: 'success',
            message: '批量删除代理成功'
          })
        })

      })


    }
    //清除多选
    multipleTableRef.value.clearSelection()
  } else {
    ElMessage({
      showClose: true,
      message: '批量删除代理，需要勾选环境ID',
      type: 'error'
    })
  }
}


const defaultSort = ref({ prop: 'id', order: '' })

/** 排序触发事件 */
function handleSortChange(column, prop, order) {
  console.log('排序触发事件', column.prop, column.order)
  if (column.order == null) {
    queryParams.value.orderBy = 'id'
    queryParams.value.desc = 'desc'
  } else {

    queryParams.value.orderBy = column.prop
    if (column.order === 'descending') {
      queryParams.value.desc = 'desc'
    } else {
      queryParams.value.desc = 'asc'
    }
  }
  getTableData()
}


function getTableData() {
  getProxyListApi(queryParams.value).then(res => {
    loading.value = false
    tableData.value = res.data
    total.value = res.total
  })
}

// 多选框选中数据
function handleSelectionChange(selection) {
  console.log('多选框选中数据', selection.length)
  ids.value = selection.map(item => item.id)
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getTableData()
}

/** 重置按钮操作 */
function resetQuery() {

  queryParams.value.id = null
  queryParams.value.ip = null
  queryParams.value.checkStatus = null
  console.log('重置按钮操作')
  handleQuery()
}

getTableData()
//分页
const handleSizeChange = (val) => {
  //改变查询数量
  queryParams.value.pageSize = val
  queryParams.value.pageNum = 1
  getTableData()
}
const handleCurrentChange = (val) => {
  getTableData()
}


//自动适配高度代码
const tableHeight = ref(400)
// 计算表格高度的函数
const calculateTableHeight = () => {
  const header = document.querySelector('.fixed-header')
  const footer = document.querySelector('.fixed-footer')
  const windowHeight = window.innerHeight
  const headerHeight = header ? header.offsetHeight : 0
  const footerHeight = footer ? footer.offsetHeight : 0
  // 减去头部和底部高度，再减去内容区域的上下内边距
  tableHeight.value = windowHeight - headerHeight - footerHeight - 20
}


// 定义WS事件类型与处理函数的映射
const eventHandlers = {

  proxyPingResult: (res) => {
    console.log('获取到PingResult数据:', res)
    const index = tableData.value.findIndex(row => row.id === res.id)
    console.log('监听ws回调 index', index)
    if (index !== -1) {
      const data = tableData.value[index]
      tableData.value[index] = { ...data, ...res }
    }
  }
}

onMounted(() => {
  calculateTableHeight()
  // 监听窗口大小改变事件
  window.addEventListener('resize', calculateTableHeight)

  Object.entries(eventHandlers).forEach(([eventType, handler]) => {
    wsStore.on(eventType, handler)
  })

})

onUnmounted(() => {
  // 移除窗口大小改变事件监听器，防止内存泄漏
  window.removeEventListener('resize', calculateTableHeight)
  Object.entries(eventHandlers).forEach(([eventType, handler]) => {
    wsStore.off(eventType, handler)
  })
})

</script>
<style scoped>

</style>
