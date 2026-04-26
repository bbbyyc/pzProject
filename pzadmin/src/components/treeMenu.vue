<template>
   <!-- <el-sub-menu index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span>Navigator One</span>
          </template>
          <el-menu-item-group title="Group One">
            <el-menu-item index="1-1">item one</el-menu-item>
            <el-menu-item index="1-2">item two</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="Group Two">
            <el-menu-item index="1-3">item three</el-menu-item>
          </el-menu-item-group>
          <el-sub-menu index="1-4">
            <template #title>item four</template>
            <el-menu-item index="1-4-1">item one</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="2">
          <el-icon><icon-menu /></el-icon>
          <span>Navigator Two</span>
        </el-menu-item>
        <el-menu-item index="3" disabled>
          <el-icon><document /></el-icon>
          <span>Navigator Three</span>
        </el-menu-item>
        <el-menu-item index="4">
          <el-icon><setting /></el-icon>
          <span>Navigator Four</span>
        </el-menu-item> -->
        <template v-for="(item) in props.menuData">
           <el-menu-item
             v-if="!item.children || item.children.length === 0"
             @click="handleClick(item, `${props.index}-${item.meta?.id ?? item.path}`)"
             :index="`${props.index}-${item.meta?.id ?? item.path}`"
             :key="`${props.index}-${item.meta?.id ?? item.path}`">
            <el-icon size="20">
              <component :is="item.meta?.icon || item.icon"></component>
            </el-icon>
            <span>{{ item.meta?.name || item.name }}</span>
          </el-menu-item>
          <el-sub-menu v-else :index="`${props.index}-${item.meta?.id ?? item.path}`">
            <template #title>
              <el-icon size="20">
                <component :is="item.meta?.icon || item.icon"></component>
              </el-icon>
              <span>{{ item.meta?.name || item.name }}</span>
            </template>
            <TreeMenu :menuData="item.children" :index="`${props.index}-${item.meta?.id ?? item.path}`"></TreeMenu>
          </el-sub-menu>
        </template>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMenuStore, type MenuItem, type MenuTabItem } from '../store/menu'

interface TreeMenuProps {
  menuData: MenuItem[]
  index: string
}

const props = defineProps<TreeMenuProps>()

const router = useRouter()
const menuStore = useMenuStore()

const handleClick = (item: MenuItem, index: string) => {
  const path = item.meta?.path || item.path
  if (!path) {
    console.warn('无效菜单项，无法跳转', item)
    return
  }

  const tabItem: MenuTabItem = {
    path,
    name: item.meta?.name || item.name,
    icon: item.meta?.icon || item.icon
  }

  menuStore.addMenu(tabItem)
  router.push({ path })
  console.log('点击菜单列表时的item', item)
  menuStore.updateMenuActive(index)
}
</script>

<style>

</style>