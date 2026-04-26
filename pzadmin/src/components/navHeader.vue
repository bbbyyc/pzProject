<template>
   <div class="header-container">
      <div class="header-left flex-box">
        <el-icon class="icon" size="20" @click="MenuStore.collapseMenu"><Fold /></el-icon>
        <ul class="flex-box">
          <!-- :class="{selected:route.path===item.path}" :当判断结果为true时，selected 类名就会被添加到这个元素上；反之则移除。 -->
          <li v-for="(item,index) in selectMenuList"
            :key="item.path || index"
            :class="{selected:route.path===item.path}"
            class="tab flex-box">
              <el-icon size="12"><component :is="item.icon"></component></el-icon>
              <router-link class="text flex-box" :to="{path:item.path}">{{ item.name }}</router-link>
              <el-icon size="12" class="close" @click="closeTab(item,index)"><Close /></el-icon>
          </li>
        </ul>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleClick">
          <div class="el-dropdown-link flex-box">
            <el-avatar
              :src="userInfo.avatar"
            />
            <p class="user-name">{{ userInfo.name }}</p>
          </div>
          <template #dropdown>
              <el-dropdown-item command="cancel">退出登录</el-dropdown-item>
          </template>
        </el-dropdown>
      </div>
  </div>
</template>

<script setup lang="ts" name="navHeader">
import { computed } from 'vue'
import {useRoute,useRouter} from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../store/menu'

const MenuStore = useMenuStore()
const { selectMenu } = storeToRefs(MenuStore)
const selectMenuList = computed(() => selectMenu.value.filter(item => item && item.path))

//  拿到当前的路由对象
const route=useRoute()
const router=useRouter()
console.log('当前的路由对象',route);

const localUserInfo = localStorage.getItem('pz_userInfo')
const userInfo = localUserInfo
  ? JSON.parse(localUserInfo)
  : { name: '管理员', avatar: '' }

// 执行点击关闭
function closeTab(item:any,index:number){
  MenuStore.closeMenu(item)

  // 获取删除后的selectMenu
  /* const newSelectMenu = MenuStore.selectMenu
  const newLength = newSelectMenu.length */
  // 如果删除的是非当前页tag
  if (!item || !item.path || route.path !== item.path) {
    return
  }
  if (index === MenuStore.selectMenu.length) {
    if (MenuStore.selectMenu.length === 0) {
      router.push('/')
    } else {
      const nextItem = MenuStore.selectMenu[index - 1]
      if (nextItem && nextItem.path) {
        router.push({ path: nextItem.path })
      }
    }
  } else {
      const nextItem = MenuStore.selectMenu[index]
      if (nextItem && nextItem.path) {
        router.push({ path: nextItem.path })
      }
  }
}

// 点击头像下拉框实现登出功能
const handleClick=(command:string)=>{
  if(command==='cancel'){
    localStorage.removeItem('pz_token')
    localStorage.removeItem('pz_userInfo')
    localStorage.removeItem('pz_v3pz')
    window.location.href=window.location.origin
    // return '/login'
  }
}

</script>

<style scoped lang="less">
  .flex-box{
    display: flex;
    align-items: center;
  }
  .header-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding-right: 25px;
    background-color: #fff;
    .header-left{
      height: 100%;
      .icon{
        width: 45px;
        height: 100%;
      }
      .icon:hover{
        background-color: #f5f5f5;
        cursor: pointer;
      }
      .tab{
        padding: 0 10px;
        height: 100%;
        
        .text{
          margin: 0 5px;
          height: 100%;
        }
        .close{
          visibility: hidden;
        }
      }
      ul{
        height: 100%;
      }
      .tab:hover{
        background-color: #f5f5f5;
        .close{
          visibility: inherit;
          cursor: pointer;
          color: #000;
        }
      }
      .selected{
        a{
          color: #409eff;
        }
        color: #409eff;
        background-color: #f5f5f5;
      }
    }
    .header-right{
      .user-name{
        margin-left: 10px;
      }
    }
    a{
      height: 100%;
      color: #333;
      font-size: 15px;
    }

  }
</style>