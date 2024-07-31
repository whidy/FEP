<template>
  <div :class="route.path.indexOf('/preview') > -1 ? 'no-header' : ''">
    <el-container>
      <el-header>
        <div class="header">
          <div class="h-left">
            <el-menu
              :default-active="activeIndex"
              class="el-menu-demo"
              mode="horizontal"
              @select="handleSelect">
              <el-menu-item index="1">表单设计</el-menu-item>
              <el-menu-item index="2">菜单配置</el-menu-item>
              <el-menu-item index="3">字典配置</el-menu-item>
            </el-menu>
          </div>
          <div class="h-right">
            <el-button
              type="primary"
              @click="handleImportDialog">导入</el-button>
            <el-button type="primary" @click="preview">预览</el-button>
          </div>
        </div>
      </el-header>
      <div class="main-container">
        <!-- <f-icon name="i-ep-user" size="large" color="blue" />
        <f-icon name="i-bg-ic-arrow-down" size="large" color="blue" />
        <f-icon name="i-bg-ic-close" size="24" color="red" />
        <f-icon name="i-ep-edit-pen" size="small" />
        <f-icon name="i-bg-ic-close" size="2em" /> -->
        <router-view :key="route.fullPath" />
      </div>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import 'element-plus/dist/index.css'
import FIcon from './FormIcon/f-icon.vue'

const router = useRouter()
const route = useRoute()
const activeIndex = computed(() => {
  switch (route.matched[0]?.path) {
    case '/form':
      return '1'
    case '/menu-config':
      return '2'
    case '/dict-config':
      return '3'
    default:
      return '-1'
  }
})
const handleSelect = (index) => {
  switch (index) {
    case '1':
      router.push({
        path: '/form',
        query: {
          base: route.query.base,
        },
      })
      break
    case '2':
      router.push({
        path: '/menu-config',
        query: {
          base: route.query.base,
        },
      })
      break
    case '3':
      router.push({
        path: '/dict-config',
        query: {
          base: route.query.base,
        },
      })
      break
    default:
      router.push({
        path: '/form',
        query: {
          base: route.query.base,
        },
      })
  }
}

const handleImportDialog = () => {
  console.log('导入')
}

const preview = () => {
  window.open(`${location.origin}/#/preview?base=${route.query.base}`)
}
</script>

<style lang="scss">
.no-header {
  .main-container {
    height: 100vh !important;
  }
  .el-header {
    display: none;
  }
  .page_container {
    padding: 0 !important;
  }
  .flex_left {
    width: 220px !important;
    margin-right: 0 !important;
    border-right: 1px solid var(--el-menu-border-color);
  }
  .flex_left,
  .flex_right {
    border-radius: 0 !important;
    box-shadow: none !important;
  }
}
.el-header {
  height: 61px !important;
  padding: 0 !important;
  border-bottom: 1px solid var(--el-menu-border-color);
}
.main-container {
  height: calc(100vh - 61px);
}
.header {
  padding: 0 24px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  .el-menu--horizontal.el-menu {
    border-bottom: 0;
  }
  .h-left {
    width: 70%;
  }
  .h-right {
    width: 30%;
    text-align: right;
  }
}
</style>
