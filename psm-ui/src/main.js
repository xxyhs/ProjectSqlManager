import { createApp } from 'vue'
import { createPinia } from 'pinia'
// import 'element-plus/theme-chalk/src/index.scss'
import './styles/main.css'
import App from './App.vue'
import copy from './directives/copy'
import ClickOutside from 'element-plus/es/directives/click-outside/index'
// import router from './router'
import hljs from 'highlight.js'
import sql from 'highlight.js/lib/languages/sql'
import 'highlight.js/styles/github-dark-dimmed.css'
import hljsVuePlugin from "highlightjs-vue-plugin"
hljs.registerLanguage('sql', sql)

const app = createApp(App)

app.use(createPinia())
app.directive('copy', copy)
app.directive('click-outside', ClickOutside)
app.use(hljsVuePlugin)
app.mount('#app')
