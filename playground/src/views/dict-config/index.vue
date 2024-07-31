<template>
  <div class="page_container">
    <div class="flex_row">
      <div class="flex_left">
        <div class="tree_content">
          <div class="search">
            <el-input
              v-model.trim="search"
              placeholder="请输入文件名"
              :prefix-icon="Search" />
          </div>
          <div class="file-list-wrapper">
            <div v-if="fileList.length === 0">暂无数据</div>
            <div v-else>
              <ul class="file-list">
                <li
                  v-for="item in fileList"
                  :key="item.path"
                  class="file-item"
                  :class="{ actived: currentFile === item }"
                  @click="handleTableDataChange(item)">
                  {{ item.fileName }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="flex_right">
        <div class="main_container">
          <div class="base-info bg-scroll">
            <dict-form
              ref="dictFormRef"
              :file="currentFile"
              @update-filelist="fetchFileList" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createForm } from '@formily/core'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import dictForm from './dict-form.vue'
import { v4 as uuidv4 } from 'uuid'

const router = useRouter()
const route = useRoute()
const currentFile = ref('')
const fileList = ref([])
const dictFormRef = ref(null)
const fetchFileList = () => {
  axios
    .get('/api/listObjects', {
      params: {
        name: 'bgyx',
        path: `${localStorage.getItem('base')}/data/dict/`,
      },
    })
    .then((res) => {
      if (res.data.code == 200) {
        fileList.value = res.data.data.map((item) => {
          item.fileName = item.name.replace(
            `${localStorage.getItem('base')}/data/dict/`,
            ''
          )
          return item
        })
      } else {
        ElMessage.error(res.data.data)
      }
    })
}

const handleTableDataChange = (file) => {
  currentFile.value = file
}

onBeforeMount(() => {
  // 获取文件列表
  fetchFileList()
})
</script>

<style scoped>
.page_container {
  width: 100%;
  padding: 20px 24px 0 24px;
  /* min-height: 100%; */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}
.flex_row {
  display: flex;
  height: 100%;
  overflow: hidden;
}
.flex_left {
  background-color: #fff;
  width: 320px;
  box-shadow: 0px 1px 4px 0px rgba(0, 7, 101, 0.15);
  border-radius: 6px;
  margin-right: 10px;
  overflow: hidden;
}
.flex_right {
  background-color: #fff;
  flex: 1;
  box-shadow: 0px 1px 4px 0px rgba(0, 7, 101, 0.15);
  border-radius: 6px;
  overflow: hidden;
}

.search {
  padding: 16px 16px 10px;
}

.file-tree :deep() .el-tree-node__content {
  position: relative;
}
</style>

<style lang="scss" scoped>
.main_container {
  .base-info {
    height: calc(100% - 68px);
    padding: 20px;
  }
  .base-btn {
    height: 68px;
    border-top: 1px solid #e6e9ef;
    text-align: right;
    padding: 16px;
    .el-button {
      width: 92px;
    }
  }
}
.file-list-wrapper {
  padding: 16px 16px 10px;
  .file-item {
    padding: 0 8px ;
    line-height: 36px;
    cursor: pointer;
  }
  .actived {
    background-color: #e6e9ef;
  }
}
</style>
