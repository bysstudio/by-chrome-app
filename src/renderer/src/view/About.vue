<template>
  <el-scrollbar :height="tableHeight">
    <div>
      <h1>软件使用免责声明</h1>
      <section>
        <h3>1. 软件性质</h3>
        <p>
          本软件免费使用，不提供浏览器内核，用户使用时需要自行安装Chrome浏览器。</p>
        <p>
          本软件按"现状"提供，开发者/提供者不对其适用性、可靠性、准确性、完整性及稳定性作任何明示或暗示的保证。用户需自行承担使用本软件可能产生的全部风险及后果。</p>
      </section>

      <section>
        <h3>2. 责任限制</h3>
        <p>
          无论因何种原因（包括但不限于软件缺陷、操作失误、网络问题、第三方服务中断等），开发者/提供者均不对因使用或无法使用本软件导致的直接、间接、偶然、特殊或惩罚性损害（如数据丢失、利润损失、业务中断等）承担任何责任。</p>
      </section>

      <section>
        <h3>3. 打赏作者</h3>
        <p>[Aptos] 0xf8fd1014ed9798cae7b5621e4d76ace58de3199fe47ccc11d749bef2411a83b5</p>
        <p>[Ethereum] 0x9de3cae5047bcd624fe545161ef7022de868b768</p>
        <p>[Solana] 6fxBpA6Y8JgaGeJLPAZ4CwqoRwLbHFqr4qtDwRHLRawa</p>
      </section>


    </div>
  </el-scrollbar>
</template>
<script setup>
//自动适配高度代码
import { onMounted, onUnmounted,ref } from "vue";

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
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
  color: #333;
}

.financial-warning {
  background: #fff0f0;
  border: 2px solid #ff4444;
  padding: 20px;
  margin: 25px 0;
  border-radius: 8px;
}

.financial-warning h3 {
  color: #cc0000;
  font-size: 1.5em;
}

h1 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5em;
}

h3 {
  color: #34495e;
  margin-top: 1.5em;
}

p {
  text-indent: 2em;
  margin: 0.8em 0;
}

.notice {
  background-color: #f8f9fa;
  border-left: 4px solid #3498db;
  padding: 1em;
  margin: 1.5em 0;
}

ul {
  padding-left: 40px;
}
</style>
