<template>
  <designer-vue />
  <div class="designer-action">
    <el-button type="primary" @click="saveForm">
      保存
    </el-button>
  </div>
</template>

<script setup>
const saveForm = () => {
  window.postMessage({ type: 'save-form' })
}
</script>

<style lang="scss" scoped>
:deep() {
  .dn-main-panel-container {
    height: calc(100vh - 124px);
    position: static;
    overflow: hidden;

    .dn-main-panel-header {
      display: none;
    }
  }
}

.designer-action {
  height: 63px;
  padding: 0 16px 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid #d9d9d9;
}
</style>
