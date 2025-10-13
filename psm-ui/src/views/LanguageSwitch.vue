<script setup>
import i18nOptions from '@/i18n-options'
import { onMounted, onUnmounted, ref, getCurrentInstance } from 'vue'
const languages = ref([])
const lngList = ref(new Map())
const currentLanguage = ref('en')
const lngPopover = ref(null)
const instance = getCurrentInstance();
onMounted(() => {
  languages.value = Object.keys(i18nOptions.resources)
  lngList.value = new Map(Object.keys(i18nOptions.resources).map(t => [t, i18nOptions.resources[t].nativeName]))
  currentLanguage.value = instance.appContext.config.globalProperties.$i18next.resolvedLanguage
  instance.appContext.config.globalProperties.$i18next.on('languageChanged', languageChangeHandler)
})

onUnmounted(() => {
  instance.appContext.config.globalProperties.$i18next.off('languageChanged', languageChangeHandler)
})

function languageChangeHandler (lng) {
  currentLanguage.value = lng
}

function changeLanguage (lng) {
  instance.appContext.config.globalProperties.$i18next.changeLanguage(lng)
  lngPopover.value.hide()
}

</script>
<template>
  <el-popover ref="lngPopover" v-if="languages && languages.length" popper-class="lng-switch" :width="100" trigger="click">
    <template #default>
      <div v-for="lng in languages" :key="lng" @click="changeLanguage(lng)" class="opt-item">{{ lngList.get(lng) }}</div>
    </template>
    <template #reference>
      <span class="lng-switch-btn" @click="showPop">
        <el-icon>
          <svg viewBox="0 0 22 22" width="1.2em" height="1.2em"><path fill="currentColor" d="m18.5 10l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16.5 10h2zM10 2v2h6v2h-1.968a18.222 18.222 0 0 1-3.62 6.301a14.864 14.864 0 0 0 2.336 1.707l-.751 1.878A17.015 17.015 0 0 1 9 13.725a16.676 16.676 0 0 1-6.201 3.548l-.536-1.929a14.7 14.7 0 0 0 5.327-3.042A18.078 18.078 0 0 1 4.767 8h2.24A16.032 16.032 0 0 0 9 10.877a16.165 16.165 0 0 0 2.91-4.876L2 6V4h6V2h2zm7.5 10.885L16.253 16h2.492L17.5 12.885z"></path></svg>
        </el-icon>
        {{ lngList.get(currentLanguage)  }}
      </span>
    </template>
  </el-popover>
</template>
