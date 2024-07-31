<template>
  <div class="page_container">
    <div class="flex_row">
      <div class="flex_left">
        <div class="tree_content">
          <div class="tree">
            <el-tree
              ref="menuTree"
              class="file-tree"
              :data="data"
              :props="defaultProps"
              :default-expand-all="true"
              :highlight-current="true"
              node-key="menu_id"
              :expand-on-click-node="false"
              @node-click="handleNodeClick">
              <template #default="{ node, data }">
                <div class="custom-tree-node" pointer-events="none">
                  <span class="label-text text_clip" :title="data.menu_name">{{
                    data.menu_name
                  }}</span>
                </div>
              </template>
            </el-tree>
          </div>
        </div>
      </div>
      <div class="flex_right">
        <div class="main_container">
          <previewer />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  reactive,
  toRefs,
  ref,
  nextTick,
  computed,
  onBeforeMount,
  onBeforeUnmount,
  watch,
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import previewer from '../components/previewer.vue'

const router = useRouter()
const route = useRoute()

const menuTree = ref(null)
const menuFormRef = ref(null)

const state = reactive({
  data: [],
  menuTree,
  defaultProps: {
    children: 'Child',
    label: 'menu_name',
  },
  pageSchema: {
    form: {
      labelCol: 6,
      wrapperCol: 12,
    },
    schema: {
      type: 'object',
      properties: {
        ota6m8d5wpx: {
          type: 'string',
          title: 'Input',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-validator': [],
          'x-decorator-props': {
            'data-designer-node-id': 'ota6m8d5wpx',
          },
          'x-designable-id': 'ota6m8d5wpx',
          'x-index': 0,
        },
      },
      'x-designable-id': '0f2ac2cxvh5',
    },
  },
})

const getMenuTree = (type, id) => {
  axios
    .get(`https://cache.wodcloud.com/bgyx/${route.query.base}/data/menu.json`)
    .then((res) => {
      if (res.status == 200) {
        state.data = res.data || []
      } else {
        ElMessage.error(res.data.data)
      }
    })
}

const handleNodeClick = (data) => {
  const { base } = route.query
  const path = data.menu_url
  router.push(`/preview?base=${base}&path=${path}`)
}

onBeforeMount(() => {
  getMenuTree()
})

const { data, defaultProps, pageSchema } = toRefs(state)
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

.tree_content {
  overflow: hidden;
  height: calc(100% - 4px);
  position: relative;
}
.search {
  padding: 16px 16px 10px;
}
.tree {
  overflow: auto;
  height: calc(100% - 65px);
}
.tree :deep().el-tree-node > .el-tree-node__content {
  /* padding: 0 16px!important; */
}
.tree :deep() .el-tree-node > .el-tree-node__children {
  overflow: unset;
  /* padding-left: 16px; */
}
.file-tree :deep() .el-tree-node__content {
  position: relative;
}
.tree-action-box {
  display: none;
  position: absolute;
  right: 0px;
  top: 0px;
  background-color: #f2f3f7;
  width: 44px;
  text-align: center;
  height: 36px;
  line-height: 36px;
}
.position_sticky {
  position: sticky;
  position: -webkit-sticky;
}

.tree .el-tree-node__content:hover .tree-action-box {
  display: inline-block;
}
.tree .el-tree {
  position: static !important;
}
.tree .el-tree :deep().el-tree-node__content {
  height: 36px !important;
}
.tree .el-tree :deep().el-tree-node__content:hover {
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 83%,
    rgba(0, 0, 0, 0.05) 86%
  );
}
.tree-more {
  font-size: 12px;
  color: #3759be;
}
.tree-action {
  width: 144px;
  background-color: #ffffff;
  box-shadow: 0px 1px 4px 0px rgba(0, 7, 101, 0.15);
  padding: 4px 0;
  border-radius: 4px;
  position: fixed;
  z-index: 9;
}
.tree-action .action {
  width: 100%;
  height: 34px;
  line-height: 34px;
  padding-left: 16px;
  font-size: 14px;
  color: #202531;
  cursor: pointer;
}
.tree-action .action:hover {
  background-color: #f2f3f7;
  color: #3759be;
}

.tree-action .disable {
  cursor: not-allowed;
  color: #616f94;
}
.tree-action .disable:hover {
  background-color: #fff;
  color: #616f94;
}
.main_container {
  height: 100%;
}
</style>

<style lang="scss" scoped>
.main_container {
  .base-info {
    height: calc(100% - 68px);
    padding: 40px 0 0 40px;
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
</style>
../components/previewer
