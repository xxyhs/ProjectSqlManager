import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './styles/main.css'
import App from './App.vue'
import copy from './directives/copy'
import i18n from './i18n'
import i18nOptions from './i18n-options.js'
import ClickOutside from 'element-plus/es/directives/click-outside/index'

import hljs from 'highlight.js'
import sql from 'highlight.js/lib/languages/sql'
import 'highlight.js/styles/github-dark-dimmed.css'
import hljsVuePlugin from "highlightjs-vue-plugin"
hljs.registerLanguage('sql', sql)

const app = createApp(App)

app.use(i18n, i18nOptions)
app.use(createPinia())
app.directive('copy', copy)
app.directive('click-outside', ClickOutside)
app.use(hljsVuePlugin)
app.mount('#app')
