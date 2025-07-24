import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { initCache } from './utils/cache'

// 初始化缓存
initCache()

createApp(App).mount('#app')
