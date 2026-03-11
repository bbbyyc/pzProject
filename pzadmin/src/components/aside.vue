<template>
      <el-menu
        :collapse="isCollapse"
        style="width: 230px;"
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        :default-active="MenuStore.menuActive"
        text-color="#fff"
        @open="handleOpen"
        @close="handleClose"
      >
      <p class="logo-lg">DIDI问诊</p>
       <TreeMenu :menuData="menuData" :index="1"></TreeMenu>
      </el-menu>
</template>

<script lang="ts" setup>
import TreeMenu from './treeMenu.vue'
import {useRouter} from 'vue-router'
import { storeToRefs } from 'pinia' 
import { useMenuStore } from '../store/menu'


const MenuStore = useMenuStore()

// const isCollapse = ref(true)
const { isCollapse,routerList } = storeToRefs(MenuStore)
const router=useRouter()
console.log('router',router);

// const menuData=reactive(router.options.routes[0]?.children||[])
const menuData=routerList.value
console.log(routerList);

console.log('menuData from store:', menuData)
const handleOpen = () => {}
const handleClose = () => {}
</script>


<style>
.logo-lg{
  font-size: 20px;
  text-align: center;
  height: 50px;
  line-height: 50px;
  color: #fff;
}
</style>