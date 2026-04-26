// 引入defineStore用于创建store
import { defineStore } from 'pinia'

export interface MenuMeta {
  path: string
  id?: string
  name?: string
  icon?: string
  describe?: string
}

export interface MenuItem {
  path?: string
  icon?: string
  name?: string
  children?: MenuItem[]
  meta?: MenuMeta
  component?: any
}

export interface MenuTabItem {
  path: string
  name?: string
  icon?: string
}

interface MenuState {
  isCollapse: boolean
  selectMenu: MenuTabItem[]
  routerList: MenuItem[]
  menuActive: string
}

export const useMenuStore = defineStore<'aside', MenuState, {}, {
  collapseMenu(): void
  addMenu(payload: MenuTabItem): void
  closeMenu(payload: MenuTabItem): void
  dynamicMenu(payload: unknown): void
  updateMenuActive(payload: string): void
}>('aside', {
  // 状态
  state: (): MenuState => ({
    isCollapse: false,
    selectMenu: [],
    routerList: [],
    menuActive: ''
  }),

  // 动作
  actions: {
    collapseMenu() {
      this.isCollapse = !this.isCollapse
      console.log('Pinia 状态:', this.isCollapse);
    },
    addMenu(payload: MenuTabItem) {
      if (!payload || !payload.path) {
        return
      }
      if (this.selectMenu.findIndex(item => item.path === payload.path) === -1) {
        this.selectMenu.push(payload)
        console.log('开始放数据了');
      }
    },
    closeMenu(payload: MenuTabItem) {
      if (!payload || !payload.path) {
        return
      }
      const delectIndex = this.selectMenu.findIndex(val => payload.path === val.path)
      if (delectIndex !== -1) {
        this.selectMenu.splice(delectIndex, 1)
      }
    },
    dynamicMenu(payload: unknown) {
      console.log('dynamicMenu接受的原始数据', payload);
      const menuList: MenuItem[] = Array.isArray(payload)
        ? payload
        : (payload && (payload as any).routerList ? (payload as any).routerList : [])
      const modules = import.meta.glob('../views/**/**/*.vue')
      console.log(modules);

      function routerSet(router: MenuItem[]) {
        router.forEach(route => {
          if (!route.children || route.children.length === 0) {
            if (route.meta?.path) {
              const url = `../views${route.meta.path}/index.vue`
              route.component = modules[url]
            }
          } else {
            routerSet(route.children)
          }
        })
      }

      routerSet(menuList)
      console.log('dynamicMenu', menuList);
      this.routerList = menuList
      console.log('pinia文件的routerList', this.routerList);
    },
    updateMenuActive(payload: string) {
      this.menuActive = payload
    }
  },

  // 计算
  getters: {},
  // 开启持久化，只持久化必要字段，避免序列化组件函数失败
  persist: {
    key: 'pz_v3pz',
    paths: ['selectMenu', 'menuActive']
  } as any
})