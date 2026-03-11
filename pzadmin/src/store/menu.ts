// 引入defineStore用于创建store
import { defineStore } from 'pinia'

// 定义菜单项的接口
interface MenuItem {
  path: string;
  icon: string;
  name: string;
  children?: MenuItem[]; // 补充子菜单类型
  meta?: { path: string }; // 补充meta类型
  component?: any;
}


// 定义并暴露一个store
export const useMenuStore = defineStore('aside', {
   // 状态
  state() {
    return {
      isCollapse: false,
      selectMenu: [] as MenuItem[],
      routerList:[] as MenuItem[],
      menuActive:''
    }
  },

  // 动作
  actions: {
    collapseMenu() {
      this.isCollapse = !this.isCollapse
      console.log('Pinia 状态:', this.isCollapse);
    },
    addMenu(payload:MenuItem){
      // 对数据去重
      if(this.selectMenu.findIndex(item=>item.path===payload.path)===-1){
        this.selectMenu.push(payload)
        console.log('开始放数据了');
      }
    },
    closeMenu(payload:MenuItem){
      // 找到点击数据的索引值 ，findIndex返回的是一个索引值
      const delectIndex=this.selectMenu.findIndex(val=>payload.path===val.path)
      // 根据索引删除数组指定元素
      this.selectMenu.splice(delectIndex,1)
    },
    dynamicMenu(payload){
      console.log('dynamicMenu接受的原始数据',payload);
      const modules = import.meta.glob('../views/**/**/*.vue')
      console.log(modules);

      // 定义递归函数
      function routerSet(router) {
       router.forEach(route => {
        // 判断有没有子菜单，没有的话就拼接路由数据
        if (!route.children) {
          // 拼接component路径
          const url=`../views${route.meta.path}/index.vue`
          // 动态加载组件
          route.component=modules[url] 
        } else {
          // 如果有子菜单，就进行递归
          routerSet(route.children)
        }
       });
      }
      // 调用该函数=>实现将接口menuPermissions中返回的数据中的component组件转化为../views${route.meta.path}/index.vue的形式
      routerSet(payload)
      // 拿到完整的路由数据：调用完成之后的payload数据
      console.log('dynamicMenu',payload);
      this.routerList=payload
      console.log('pinia文件的routerList',this.routerList);
    },
    updateMenuActive(payload){
      this.menuActive=payload
    }
  },
 
  // 计算
  getters: {},
  // 开启持久化（默认配置）
  persist: {
  key: 'pz_v3pz' 
}
})