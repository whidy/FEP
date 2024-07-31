<template>
  <div class="directory-container">
    <bg-tree :data="treeData" :props="{ label: 'name', children: 'children', value: 'path' }">
      <template #label="{ data, level }">
        <div class="custom-tree-node" :class="{ 'is-active': data.path === $route.query.path }">
          <a @click="handleNodeClick(data)">{{ data.name.replace(".json", "") }}</a>
          <a @click.stop="showOperations(data)">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </a>
          <ul v-if="curOperationNode === data.path" class="operation-list" @click.stop>
            <template v-if="data.isFolder">
              <li>
                <el-button text @click="addFolder(data.path); clearCurOperationNode();">新增目录</el-button>
              </li>
              <li>
                <el-button
                  text
                  :disabled="level === 1"
                  @click="deleteFolder(data.path); clearCurOperationNode();">删除目录</el-button>
              </li>
              <li>
                <el-button text @click="addForm(data.path); clearCurOperationNode();">新增表单</el-button>
              </li>
            </template>
            <template v-else>
              <li>
                <el-button text @click="editorm(data.path); clearCurOperationNode();">修改名称</el-button>
              </li>
              <li>
                <el-button text @click="deleteForm(data.path); clearCurOperationNode();">删除表单</el-button>
              </li>
            </template>
          </ul>
        </div>
      </template>
    </bg-tree>
  </div>

  <el-dialog v-model="visible" :title="visibleTitle" width="600px">
    <template #default>
      <el-form v-if="visibleType.startsWith('add-') || visibleType.startsWith('edit-')" ref="formRef" :mode="formData">
        <el-form-item :label="visibleType.startsWith('edit-') ? `新名称` : `名称`" prop="name">
          <el-input v-model="formData.name" placeholder="请输入" style="width:100%" />
        </el-form-item>
      </el-form>
      <p v-else-if="visibleType === 'delete-folder'" class="warn-text">删除文件夹将会删除文件夹下所有层级表单，确认继续此操作？</p>
      <p v-else-if="visibleType === 'delete-form'" class="warn-text">表单删除后不可恢复，确认继续此操作？</p>
    </template>
    <template #footer>
      <el-button type="default" @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="visibleLoading" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import BgTree from './bg-tree'
import axios from 'axios'
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const treeData = ref([])

const curOperationNode = ref('')

const getAllJsonFiles = (data) => {
  const result = []
  const filterData = (items, parent) => {
    items.forEach(item => {
      if (item.isFolder || (!item.isFolder && item.path.endsWith('.json'))) {
        const newItem = { ...item }

        delete newItem.children

        if (item.children?.length) {
          newItem.children = []

          filterData(item.children, newItem.children)
        }

        parent.push(newItem)
      }
    })
  }

  filterData(data, result)

  // console.log(result);

  return result
}
const getTreeData = () => {
  let path = 'formilyJson'
  if(route.query.base){
    path = route.query.base+'/page'
  }
  axios.get(`/api/list/tree?name=bgyx&path=${path}`).then(({ data }) => {
    if (data.code === 200) {
      treeData.value = getAllJsonFiles(data.data)
    }
  })
}

const handleNodeClick = ({ isFolder, path }) => {
  if (isFolder) {

    router.push('/form')
  } else {
    router.push(`/form/edit?path=${path}`)
  }
}

const showOperations = ({ path }) => {
  curOperationNode.value = path
}

const clearCurOperationNode = () => {
  curOperationNode.value = ''
}

const visible = ref(false)
const visibleType = ref('')
const visibleTitle = ref('')
const visibleLoading = ref(false)
const formRef = ref(null)
const formData = ref({
  name: '',
  path: ''
})

const addRequest = (path, name, callback) => {
  const fileName = `${path}/${name}.json`

  axios.post('/api/putObject', {
    bucket: 'bgyx',
    fileName: fileName,
    content: '{}'
  }).then(({ data }) => {
    if (data.code === 200) {
      ElMessage.success('新增成功')

      getTreeData()

      typeof callback === 'function' && callback()

      router.push(`/form/edit?path=${fileName}`)
    } else {
      ElMessage.error('新增失败')
    }
    visibleLoading.value = false
  })
}
const deleteRequest = (path, isFolder, callback) => {
  axios.delete('/api/removeFiles', {
    data: {
      bucket: 'bgyx',
      path,
      isFolder
    }
  }).then(({ data }) => {
    if (data.code === 200) {
      ElMessage.success('删除成功')

      getTreeData()

      typeof callback === 'function' && callback()

      if (path === route.query.path) {
        router.push('/form')
      }
    } else {
      ElMessage.error('新增失败')
    }
    visibleLoading.value = false
  })
}

const addFolder = (path) => {
  visibleType.value = 'add-folder'
  visibleTitle.value = '新增目录'
  formData.value = {
    name: '',
    path
  }
  visible.value = true
} // 新增目录
const deleteFolder = (path) => {
  visibleType.value = 'delete-folder'
  visibleTitle.value = '提示'
  formData.value = {
    name: '',
    path
  }
  visible.value = true
} // 删除目录
const addForm = (path) => {
  visibleType.value = 'add-form'
  visibleTitle.value = '新增表单'
  formData.value = {
    name: '',
    path
  }
  visible.value = true
} // 新增表单
const editorm = (path) => {
  visibleType.value = 'edit-form'
  visibleTitle.value = '修改表单名称'
  formData.value = {
    name: '',
    path
  }
  visible.value = true
} // 修改名称
const deleteForm = (path) => {
  visibleType.value = 'delete-form'
  visibleTitle.value = '提示'
  formData.value = {
    name: '',
    path
  }
  visible.value = true
} // 删除表单

const confirm = () => {
  if (visibleType.value.startsWith('add-') && !formData.value.name) {
    ElMessage.error('请输入名称！')
    return
  }

  const { path, name } = formData.value
  visibleLoading.value = true

  if (visibleType.value === 'add-folder') {
    addRequest(`${path}/${name}`, '默认表单', () => { visible.value = false })
  } else if (visibleType.value === 'delete-folder') {
    deleteRequest(`${path}`, true, () => { visible.value = false })
  } else if (visibleType.value === 'add-form') {
    addRequest(`${path}`, `${name}`, () => { visible.value = false })
  } else if (visibleType.value === 'edit-form') {
    axios.get(`https://cache.wodcloud.com/bgyx/${path}`).then(({ data }) => {
      const pathArr = path.split('/')
      const fileName = [...pathArr.slice(0, pathArr.length - 1), `${name}.json`].join('/')
      const content = JSON.stringify(data)

      axios.post('/api/putObject', {
        bucket: 'bgyx',
        fileName,
        content
      }).then(({ data }) => {
        if (data.code === 200) {
          axios.delete('/api/removeFiles', {
            data: {
              bucket: 'bgyx',
              path,
              isFolder: false
            }
          }).then(({ data }) => {
            if (data.code === 200) {
              getTreeData()

              router.push(`/form/edit?path=${fileName}`)
            } else {
              ElMessage.error('操作失败')
            }

            visibleLoading.value = false
            visible.value = false
          })
        } else {
          ElMessage.error('操作失败')
        }

        visibleLoading.value = false
      })
    })
  } else if (visibleType.value === 'delete-form') {
    deleteRequest(`${path}`, false, () => { visible.value = false })
  } else {
    visibleLoading.value = false
  }
}

const listenMsg = ({ data }) => {
  if (data.type === 'saved-form') {
    axios.post('/api/putObject', {
      bucket: 'bgyx',
      fileName: route.query.path,
      content: data.data
    }).then(({ data }) => {
      if (data.code === 200) {
        ElMessage.success('保存成功')
      } else {
        ElMessage.error('保存失败')
      }
    })
  }
}

onBeforeMount(() => {
  getTreeData()

  window.addEventListener('click', clearCurOperationNode)
  window.addEventListener('message', listenMsg)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', clearCurOperationNode)
  window.removeEventListener('message', listenMsg)
})
</script>

<style lang="scss" scoped>
.directory-container {
  height: 100%;
  padding: 16px 16px 160px;
  box-sizing: border-box;
  overflow: hidden auto;

  .el-tree {
    height: 100%;
  }
}

:deep() {
  .el-tree-node__content {
    height: unset;
  }
}

.custom-tree-node {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: default;
  position: relative;
  line-height: 36px;

  >a {
    color: #333;
    cursor: pointer;

    &:nth-child(1) {
      display: block;
      width: 100%;
      padding-right: 32px;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;
    }

    &:nth-child(2) {
      position: absolute;
      top: 0;
      right: 0;
    }

  }

  >.operation-list {
    list-style: none;
    padding: 4px 0;
    border-radius: 4px;
    background-color: #fff;
    position: absolute;
    top: 32px;
    right: 0;
    z-index: 999;
    border: 1px solid #d9d9d9;
  }

  &.is-active,
  &:hover {
    >a:nth-child(1) {
      color: #1890ff;
    }
  }
}

.warn-text {
  font-size: 16px;
  text-align: center;
}
</style>
