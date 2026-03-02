import { createRouter, createWebHistory} from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'; 
// 导入你的页面组件（示例）
import login from '../views/login/index.vue';
import Layout from '../views/Main.vue';

// 定义路由规则的类型
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Layout
  },
  {
    path: '/login',
    component: login 
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;