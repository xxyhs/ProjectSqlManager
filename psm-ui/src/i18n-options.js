import transZhCN from '@/locales/zh-CN/translation.json'
import transEn from '@/locales/en/translation.json'

export default {
  debug: import.meta.env.DEV,
  fallbackLng: 'en',
  resources: {
    en: {
      nativeName: 'English',
      translation: transEn
    },
    zhCN: {
      nativeName: '简体中文',
      translation: transZhCN
    }
  }
}
