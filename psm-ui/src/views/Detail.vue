<script setup>
import { defineProps, defineEmits, onMounted, onBeforeUnmount, ref, watch, reactive, getCurrentInstance } from 'vue'
import loader from "@monaco-editor/loader";
import { useSqlsStore } from '@/stores/sqls';
import { format } from "sql-formatter";

const instance = getCurrentInstance();
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
  try {
    await checkModel()
  } catch(err) {
    loading.value = false
    const i18next = instance.appContext.config.globalProperties.$i18next
    ElMessage.error(i18next.t(err.message))
    return
  }
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
  monaco.languages.registerDocumentFormattingEditProvider("sql", {
    provideDocumentFormattingEdits (model) {
      const formatted = format(model.getValue(), {
        language: 'mysql',
        keywordCase: 'upper',
        indent: '  '
      })
      return [
        {
          range: model.getFullModelRange(),
          text: formatted
        }
      ]
    }
  })
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: context.sqlContent,
    language: "sql",
    theme: "vs-dark",
    automaticLayout: true
  })
  editorInstance.addAction({
    id: "sql-format",
    label: 'SQL Format',
    keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
    run: (ed) => ed.getAction("editor.action.formatDocument").run(),
  })
})

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
  }
})

function checkModel () {
  return new Promise((resolve, reject) => {
    if (!context.code) {
      reject(new Error('codeEmptyError'))
    }
    if (!editorInstance.getValue()) {
      reject(new Error('contentEmptyError'))
    }
    resolve(true)
  })
}

</script>
<template>
  <div class="edit-form" :class="{ show: props.show }">
    <div class="modal" v-click-outside="close" v-loading="false">
      <div class="title">
        {{ props.sqlItem.code ? `${$t('editSql')}:${props.sqlItem.code}` : $t('addSql') }}
      </div>
      <div class="field">
        <label>{{ $t('code') }}</label>
        <div>
          <el-input type="text" v-model="context.code" :placeholder="$t('codePlaceholder')" @input="sqlCodeFilter" @blur="sqlCodeFilterAfterBlur"></el-input>
        </div>
      </div>
      <div class="field">
        <label>{{ $t('name') }}</label>
        <div>
          <el-input type="text" v-model="context.name" :placeholder="$t('namePlaceholder')"></el-input>
        </div>
      </div>
      <div class="field">
        <label>{{ $t('description') }}</label>
        <div>
          <el-input type="textarea" v-model="context.description" :placeholder="$t('descriptionPlaceholder')" :rows="3" autoresize="none"></el-input>
        </div>
      </div>
      <div class="field editor">
        <label>{{ $t('sqlContent') }}</label>
        <div ref="editorContainer" class="editor-container"></div>
      </div>
      <div class="field actions">
        <el-button type="primary" @click="doSubmit">{{ $t('confirm') }}</el-button>
        <el-button @click="close">{{ $t('cancel') }}</el-button>
      </div>
    </div>
  </div>
</template>
