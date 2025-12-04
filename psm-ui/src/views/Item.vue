<script setup>
import { defineProps, defineEmits } from 'vue'
import CopyBtn from './CopyBtn.vue'
import dayjs from 'dayjs'
import { Edit, ArrowDown, ArrowUp, Delete } from '@element-plus/icons-vue'
const emit = defineEmits(['toggle', 'edit'])
const props = defineProps({
  sqlItem: {
    type: Object,
    default () {
      return {
        fullPath: '',
        code: '',
        name: '',
        createTime: 0,
        lastModifyTime: 0,
        description: '',
        rawContent: '',
        sqlContent: ''
      }
    }
  },
  expandedCode: {
    type: String,
    default () {
      return ''
    }
  }
})

function dateTimeFormat (timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}
</script>
<template>
  <div class="sql-item-box">
    <div class="actions">
      <el-link class="toggle-btn" style="cursor: pointer;" @click="emit('toggle', props.sqlItem.code)">
        {{ props.expandedCode === props.sqlItem.code ? $t('collapse') : $t('expand') }}
        <el-icon>&nbsp;<ArrowUp v-if="props.expandedCode === props.sqlItem.code"/><ArrowDown v-else/></el-icon>
      </el-link>
      <el-link class="edit-btn" style="cursor: pointer;" @click="emit('edit', props.sqlItem)">
        {{$t('edit')}}&nbsp;<el-icon><Edit /></el-icon>
      </el-link>
      <el-link class="edit-btn" style="cursor: pointer;" @click="emit('delete', props.sqlItem)">
        {{$t('delete')}}&nbsp;<el-icon><Delete /></el-icon>
      </el-link>
    </div>
    <div class="title">
      <span class="code">{{ props.sqlItem.code }}</span>
    </div>
    <div class="desc">
      <span>{{ props.sqlItem.name }}</span>
      <span v-if="props.sqlItem.times > 1" class="repeated-count">
        +{{props.sqlItem.times - 1}}
        <span class="md5-span">{{ props.sqlItem.md5 }}&nbsp;<CopyBtn :content="props.sqlItem.md5" /></span>
      </span>
    </div>
    <div class="desc">
      <label>{{$t('description')}}：</label><span>{{ props.sqlItem.description || $t('noDesc') }}</span>
    </div>
    <div v-show="props.expandedCode === props.sqlItem.code" class="desc" style="display: flex; margin-bottom: 6px;">
      <div><label>{{$t('createTime')}}：</label><span>{{ dateTimeFormat(props.sqlItem.createTime) }}</span></div>
      <div style="margin-left: 22px"><label>{{$t('updateTime')}}：</label><span>{{ dateTimeFormat(props.sqlItem.lastModifyTime) }}</span></div>     
    </div>
    <div v-show="props.expandedCode === props.sqlItem.code" class="code-block">
      <div class="head">
        <div class="mac-rgblight">
          <div class="li" style="background:red"></div>
          <div class="li" style="background:green"></div>
          <div class="li" style="background:blue"></div>
        </div>
        <copy-btn v-copy="props.sqlItem.sqlContent" />
      </div>
      <highlightjs
        language="sql"
        :code="props.sqlItem.sqlContent"
      />
    </div>
  </div>
</template>