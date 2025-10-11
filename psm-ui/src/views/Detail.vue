<script setup>
import { defineProps, defineEmits, onMounted, onBeforeUnmount, ref, watch, reactive } from 'vue'
import loader from "@monaco-editor/loader";
import { useSqlsStore } from '@/stores/sqls';

const loading = ref(false)
const sqlStore = useSqlsStore()
const props = defineProps({
  sqlItem: {
    type: Object,
    default () {
      return {
        code: '',
        name: '',
        description: '',
        sqlContent: ''
      }
    }
  },
  show: {
    type: Boolean,
    default () {
      false
    }
  }
})

const emit = defineEmits(['close', 'show'])

const context = reactive({
  code: props.sqlItem.code,
  name: props.sqlItem.name,
  description: props.sqlItem.description
})

const editorContainer = ref(null);
let editorInstance;

watch(() => props.sqlItem, () => {
  context.code = props.sqlItem.code;
  context.name = props.sqlItem.name;
  context.description = props.sqlItem.description;
  if (editorInstance) {
    editorInstance.setValue(props.sqlItem.sqlContent);
  }
})

async function doSubmit () {
  loading.value = true
  if (props.sqlItem.code) {
    await sqlStore.UpdateSql({
      code: props.sqlItem.code,
      newCode: context.code !== props.sqlItem.code ? context.code : undefined,
      description: context.description,
      name: context.name,
      sqlContent: editorInstance.getValue()
    })
  } else {
    await sqlStore.AddSql({
      code: context.code,
      name: context.name,
      description: context.description,
      sqlContent: editorInstance.getValue()
    })
  } 
  loading.value = false
  emit('close', true)
}

async function close () {
  emit('close', false)
}

function sqlCodeFilter () {
  // 去除非数字字母下划线 和 连续点 头部的点
  context.code = (context.code || '').replace(/[^\w\.]/g, '').replace(/\.+/g, '.').replace(/^\.+/, '')
}

function sqlCodeFilterAfterBlur () {
  context.code = (context.code || '').replace(/[^\w\.]/g, '').replace(/\.+/g, '.').replace(/^\.+|\.$/g, '')
}

onMounted(async () => {
  const monaco = await loader.init();
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: context.sqlContent,
    language: "sql",
    theme: "vs-dark",
    automaticLayout: true
  })
})

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
  }
})

</script>
<template>
  <div class="edit-form" :class="{ show: props.show }">
    <div class="modal" v-click-outside="close" v-loading="false">
      <div class="title">
        {{ props.sqlItem.code ? `编辑${props.sqlItem.code}` : '新增SQL' }}
      </div>
      <div class="field">
        <label>编号</label>
        <div>
          <el-input type="text" v-model="context.code" placeholder="请输入SQL编号" @input="sqlCodeFilter" @blur="sqlCodeFilterAfterBlur"></el-input>
        </div>
      </div>
      <div class="field">
        <label>名称</label>
        <div>
          <el-input type="text" v-model="context.name" placeholder="请输入SQL名称"></el-input>
        </div>
      </div>
      <div class="field">
        <label>描述</label>
        <div>
          <el-input type="textarea" v-model="context.description" :rows="3" autoresize="none"></el-input>
        </div>
      </div>
      <div class="field editor">
        <label>内容</label>
        <div ref="editorContainer" class="editor-container"></div>
      </div>
      <div class="field actions">
        <el-button type="primary" @click="doSubmit">确定</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </div>
  </div>
</template>
