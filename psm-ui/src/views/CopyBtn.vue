<script setup>
import { DocumentCopy } from '@element-plus/icons-vue'
const props = defineProps({
  content: {
    type: String,
    default () {
      return ''
    }
  }
})

</script>
<template>
  <span v-copy="props.content" style="cursor: pointer;">
    <slot>
      <el-icon><DocumentCopy /></el-icon>
    </slot>
  </span>
</template>