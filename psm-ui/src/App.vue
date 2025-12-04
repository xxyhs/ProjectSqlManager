<script setup>
import { onBeforeMount, ref, watch, defineComponent, reactive } from 'vue';
import _ from 'lodash'
import { useSqlsStore } from '@/stores/sqls'
import { ElConfigProvider } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import Item from './views/Item.vue';
import Detail from './views/Detail.vue';
import request from './utils/request';
import LanguageSwitch from './views/LanguageSwitch.vue';
defineComponent({
  components: {
    ElConfigProvider,
  }, setup () {
    return {
      zIndex: 2000
    }
  }
})
const sqlStore = useSqlsStore()
const isEditing = ref(false)
const rootDirInputValue = ref('')
const loading = ref(false)
const keywordSerachValue = ref('')
const filteredList = reactive([])
const expandedCode = ref('')
const editing = ref(false)
const currentItem = ref({
  code: '',
  name: '',
  description: '',
  sqlContent: ''
})

watch(() => sqlStore.rootDir, (newVal) => {
  rootDirInputValue.value = newVal
}, { immediate: false })

watch(sqlStore.sqls, () => {
  doFilter()
}, { immediate: false })
 
onBeforeMount(async () => {
  loading.value = true
  await sqlStore.getRootDir()
  filteredList.splice(0)
  filteredList.push(...sqlStore.sqls)
  loading.value = false
})

async function setRootDir () {
  await sqlStore.setRootDir(rootDirInputValue.value)
  isEditing.value = false
}

function toggleHandler (code) {
  if (code === expandedCode.value) {
    expandedCode.value = ''
  } else {
    expandedCode.value = code
  }
}

function cancelEdit () {
  isEditing.value = false
  rootDirInputValue.value = sqlStore.rootDir.value
}

function startEdit (item) {
  editing.value = true
  currentItem.value = item
}

const doFilter = _.debounce(() => {
  loading.value = true
  filteredList.splice(0)
  filteredList.push(...sqlStore.sqls.filter(t => ~t.code.toLocaleLowerCase().indexOf((keywordSerachValue.value || '').toLocaleLowerCase()) 
    || ~t.name.toLocaleLowerCase().indexOf((keywordSerachValue.value || '').toLocaleLowerCase())
    || ~t.md5.toLocaleLowerCase().indexOf((keywordSerachValue.value || '').toLocaleLowerCase())))
  loading.value = false
}, 100, {
  leading: true,
  trailing: true
})

function startDelete(item) {
  ElMessageBox.confirm('该操作无法撤回！', '确认删除').then(async () => {
    loading.value = true
    try {
      await sqlStore.DeleteSql(item.code)
    }
    finally{
      loading.value = false
    }
  })
}

function loadDir (node, resolve) {
  if (node.level === 0) {
    request.get('/dir/list').then(res => {
      resolve(res.map(t => ({
        value: t.fullPath,
        label: t.name,
        children: t.hasChildren ? [] : undefined,
        isLeaf: !t.hasChildren
      })))
    })
  } else {
    request.get('/dir/list', { dir: node.data.value}).then(res => {
      resolve(res.map(t => ({
        value: t.fullPath,
        label: t.name,
        children: t.hasChildren ? [] : undefined,
        isLeaf: !t.hasChildren
      })))
    })
  }
}

const props = {
  children: 'children',
  label: 'label',
  value: 'value',
  isLeaf: 'isLeaf'
}

</script>

<template>
  <el-config-provider>
    <div class="main" v-loading="loading">
      <div class="navigator">
        <div class="logo">
          Project SQL Manager
        </div>
        <div class="search">
          <el-input :prefix-icon="Search" type="text" v-model="keywordSerachValue" :placeholder="$t('searchInputPlaceHolder')" @change="doFilter" size="large"></el-input>
        </div>
        <div v-if="isEditing" class="dir">
          <el-tree-select
            v-model="rootDirInputValue"
            :check-strictly="true"
            lazy
            :load="loadDir"
            :props="props"
            style="width: 240px"
          />
          <!-- <el-input type="text" v-model="rootDirInputValue" size="mini" /> -->
          <el-button size="small" type="text" @click="setRootDir">确定</el-button>
          <el-button size="small" type="text" @click="cancelEdit">取消</el-button>
        </div>
        <div v-else class="dir">
          <span>{{$t('currentPath')}}:{{ sqlStore.rootDir }}</span>
          <!-- <el-button size="small" type="text"  @click="isEditing = true">{{ $t('modify') }}</el-button> -->
          <language-switch />
        </div>
      </div>
      <div class="content">
        <el-button
          class="add-btn"
          type="primary"
          :icon="Plus"
          circle
          @click="startEdit({
            code: '',
            name: '',
            description: '',
            sqlContent: ''
          })"
        />
        <template v-if="filteredList && filteredList.length">
           <item v-for="item in filteredList" 
            :key="item.code" :sql-item="item" 
            :expanded-code="expandedCode"
            @delete="startDelete"
            @edit="startEdit"
            @toggle="toggleHandler">
          </item>
        </template>
        <div v-else class="no-data">
          {{ $t('noData') }}
        </div>
      </div>
    </div>
    <detail :show="editing" :sql-item="currentItem" @close="editing = false"/>
  </el-config-provider>
</template>

