import { createApp } from 'vue'
import App from './App.vue'

import router from "./router";
import './style.css'

import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


// 全局注入一个组件：步骤1
import panelHead from './components/panelHead.vue';

/* 引入createPinia，用于创建pinia */
import { createPinia } from 'pinia'
// 引入解决pinia持久化的插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/* 创建pinia */
const pinia = createPinia()

// 注册持久化插件
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局注入一个组件：步骤2
app.component('panelHead', panelHead)


// 创建全局路由守卫

router.beforeEach((to) => {
  const token = localStorage.getItem('pz_token')
  if (!token && to.path !== '/login') {
    return '/login'
  } else if (token && to.path === '/login') {
    return '/'
  }
  return true
})

app.use(ElementPlus)

app.mount('#app')
