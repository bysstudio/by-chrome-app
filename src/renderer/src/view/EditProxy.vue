<template>

  <div class="fixed-header">
    <h3>编辑代理信息</h3>
  </div>

  <div class="fixed-cont">
    <el-scrollbar :height="tableHeight">
      <!-- 页面表单 -->
      <el-form :model="form" label-width="auto">
        <el-form-item label="编号">
          <el-input v-model="form.id" disabled />
        </el-form-item>

        <el-space direction="horizontal" :size="30">
          <el-form-item label="类型">
            <el-radio-group v-model="form.type" style="width:200px;">
              <el-radio-button label="SOCKS5" value="SOCKS5" />
              <el-radio-button label="HTTP" value="HTTP" />
            </el-radio-group>
          </el-form-item>

          <el-form-item label="主机">
            <el-input type="text" v-model="form.ip" />
          </el-form-item>

          <el-form-item label="端口号">
            <el-input-number v-model="form.port" />
          </el-form-item>
        </el-space>

        <el-space direction="horizontal" :size="30">
          <el-form-item label="账号">
            <el-input type="text" style="width:200px;" v-model="form.account" />
          </el-form-item>

          <el-form-item label="密码">
            <el-input type="text" v-model="form.password" />
          </el-form-item>

        </el-space>
        <el-divider />

        <el-space direction="horizontal" :size="30">
          <el-form-item label="国家">
            <el-input type="text" style="width:200px;" v-model="form.countryCN" />
          </el-form-item>

          <el-form-item label="国家代码">
            <el-input type="text" v-model="form.country" />
          </el-form-item>


          <el-form-item label="时区">
            <el-input type="text" v-model="form.timezone" />
          </el-form-item>

        </el-space>

        <el-space direction="horizontal" :size="30">


          <el-form-item label="语言">
            <el-input type="text" style="width:200px;" v-model="form.language" />
          </el-form-item>

          <el-form-item label="纬度">
            <el-input type="number" v-model="form.latitude" />
          </el-form-item>

          <el-form-item label="经度">
            <el-input type="number" v-model="form.longitude" />
          </el-form-item>
        </el-space>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="form.remark" />
        </el-form-item>


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
import { reactive, watch, ref, onMounted, onUnmounted, toRefs } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { getProxyInfoApi, updateProxyApi } from '../utils/httpApi'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
console.log('Query参数:', route.query.id)

// 未保存状态标记
const hasUnsavedChanges = ref(false)

// 自定义弹窗控制
const showConfirmDialog = ref(false)
let resolveNavigation = null // 用于控制导航的 Promise resolve

// 保存数据逻辑
const saveData = async () => {
  updateProxyApi({ id: form.value.id, data: form.value }).then(res => {
    ElMessage({
      showClose: true,
      message: '保存代理成功',
      type: 'success'
    })
  }).catch(err => {
    ElMessage({
      showClose: true,
      message: '保存代理失败',
      type: 'error'
    })
  }).finally(() => {
      onBack()
    }
  )


}
// 表单数据
const data = reactive({
  form: {
    id: null, //ID
    type: null, //类型 SOCKS5 HTTP  HTTPS
    ip: null, //ip
    port: null,//端口号
    account: null, //账号
    password: null, //密码
    timezone: null, //时区
    country: null, //IP归属国家编号 US
    countryCN: null, //归属国家中文名称
    language: null, //zh-CN  en-US
    latitude: null, //纬度（WGS84 坐标系）
    longitude: null, //经度（WGS84 坐标系）
    remark: null  //备注
  }
})
const { form } = toRefs(data)
// 监听表单修改
watch(form, () => {
  hasUnsavedChanges.value = true
}, { deep: true })


const onBack = () => {
  hasUnsavedChanges.value = false
  router.back()
}
// --------------------------------------------------
// 路由守卫逻辑
// --------------------------------------------------
onBeforeRouteLeave(async (to, from, next) => {
  if (!hasUnsavedChanges.value) {
    next() // 无修改直接放行
    return
  }

  try {
    // 方案1：使用 Element Plus 的确认框
    const confirm = await ElMessageBox.confirm(
      '当前数据未保存，确定离开吗？',
      '提示',
      {
        confirmButtonText: '确定离开',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    if (confirm) {
      next() // 用户确认离开
    } else {
      next(false) // 取消导航
    }
  } catch (error) {
    next(false) // 用户取消操作
  }
})

// 自定义弹窗确认回调
const confirmNavigation = () => {
  showConfirmDialog.value = false
  hasUnsavedChanges.value = false
  if (resolveNavigation) resolveNavigation(true)
}

// 自定义弹窗取消回调
const cancelNavigation = () => {
  showConfirmDialog.value = false
  if (resolveNavigation) resolveNavigation(false)
}


//自动适配高度代码
const tableHeight = ref(100)
// 计算表格高度的函数
const calculateTableHeight = () => {
  const header = document.querySelector('.fixed-header')
  const footer = document.querySelector('.fixed-footer')
  const windowHeight = window.innerHeight
  const headerHeight = header ? header.offsetHeight : 0
  const footerHeight = footer ? footer.offsetHeight : 0
  // 减去头部和底部高度，再减去内容区域的上下内边距
  tableHeight.value = windowHeight - headerHeight - footerHeight - 40
}
onMounted(() => {
  calculateTableHeight()
  getProxyInfoApi({ id: route.query.id }).then(res => {
    form.value = res.data
  })

  // 监听窗口大小改变事件
  window.addEventListener('resize', calculateTableHeight)
})

onUnmounted(() => {
  // 移除窗口大小改变事件监听器，防止内存泄漏
  window.removeEventListener('resize', calculateTableHeight)
})

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
</style>
