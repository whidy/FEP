<template>
  <div class="page-layout">
    <aside>
      <Directory />
    </aside>
    <main>
      <template v-if="route.query.path">
        <router-view :key="route.query.path" />
      </template>
      <template v-else>
        <div style="padding: 24px">
          请选择左侧表单进行编辑或者点击目录操作按钮新增表单
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import Directory from '../components/directory.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style lang="scss" scoped>
.page-layout {
  height: calc(100vh - 60px);
  background-color: #fff;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;

  > aside {
    width: 240px;
    border-right: 1px solid #d9d9d9;
  }

  > main {
    width: calc(100% - 240px);
  }
}
</style>
