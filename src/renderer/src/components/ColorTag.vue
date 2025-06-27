<template>
  <el-tag
    :type="type"
    :size="size"
    :round="round"
    :style="tagStyle"
  >
    <slot></slot>
  </el-tag>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'CustomTag',
  props: {
    // 自定义颜色值，支持 hex、rgb、rgba 等格式
    color: {
      type: String,
      required: true,
    },
    // 主题类型：dark、light、plain
    type: {
      type: String,
      default: 'dark',
      validator: (value) => ['dark', 'light', 'plain'].includes(value),
    },
    // 大小：large、default、small
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value),
    },
    // 是否圆角
    round: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const tagStyle = computed(() => {
      const styles = {};

      let cc= props.color;
      if (!props.color) {
        cc='#909399'
      }

      // 根据主题设置样式
      switch (props.type) {
        case 'dark':
          styles.backgroundColor = cc;
          styles.color = '#FFFFFF';
          styles.border = 'none';
          break;
        case 'light':
          // 半透明背景色 (透明度 0.2)
          const rgba = hexToRgba(cc, 0.2);
          styles.backgroundColor = rgba;
          styles.color = cc;
          styles.border = 'none';
          break;
        case 'plain':
          styles.backgroundColor = 'transparent';
          styles.color = cc;
          styles.border = `1px solid ${cc}`;
          break;
      }

      return styles;
    });

    // 辅助函数：将 hex 颜色转换为 rgba
    const hexToRgba = (hex, alpha) => {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return {
      tagStyle,
    };
  },
});
</script>

<style scoped>
/* 确保继承 Element Plus 的基本样式 */
.el-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.3s;
}

/* 避免冲突，确保自定义样式生效 */
:deep(.el-tag) {
  box-sizing: border-box;
}
</style>
