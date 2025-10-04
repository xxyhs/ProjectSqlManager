import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import request from '@/utils/request'
export const useSqlsStore = defineStore('Sqls', () => {

  const rootDir = ref('')
  const sqls = reactive([])

  async function getRootDir () {
    const resp = await request.get('/path/setting')
    rootDir.value = resp.dir
    await ListSqls()
  }

  async function setRootDir(path) {
    await request.put('/path/setting', {
      dir: path
    })
    rootDir.value = path
    await ListSqls()
  }

  async function ListSqls () {
    const resp = await request.get('/sql/list')
    sqls.splice(0)
    sqls.push(...resp)
  }

  async function UpdateSql (sqlInfo) {
    await request.put('/sql/update', sqlInfo)
    await ListSqls()
  }

  async function AddSql (sqlInfo) {
    await request.post('/sql/create', sqlInfo)
    await ListSqls()
  }

  async function DeleteSql (sqlCode) {
    await request.delete('/sql/delete', { code: sqlCode })
    await ListSqls()
  }

  return { rootDir, sqls, getRootDir, setRootDir, UpdateSql, ListSqls, AddSql, DeleteSql }
})
