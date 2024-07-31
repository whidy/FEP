<template>
  <div class="page_container">
    <div class="flex_row">
      <div class="flex_left">
        <div class="tree_content">
          <div class="search">
            <el-input
              v-model.trim="search"
              placeholder="请输入内容"
              :prefix-icon="Search" />
          </div>
          <div class="tree">
            <el-tree
              ref="menuTree"
              class="file-tree"
              :data="data"
              :props="defaultProps"
              :default-expand-all="true"
              :highlight-current="true"
              node-key="menu_id"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              @node-click="handleNodeClick">
              <template #default="{ node, data }">
                <div class="custom-tree-node" pointer-events="none">
                  <span class="label-text text_clip" :title="data.menu_name">{{
                    data.menu_name
                  }}</span>
                </div>
                <span
                  class="tree-action-box"
                  :class="{ position_sticky: isSticky(data.name) }"
                  @click.stop="showAction($event, data, node)">
                  <bg-icon class="tree-more" icon="#bg-ic-s-more" />
                </span>
              </template>
            </el-tree>
            <Teleport to="body">
              <div
                v-show="actionFlag"
                ref="treeAction"
                class="tree-action"
                :style="{ top: acTop, left: acLeft, bottom: acBottom }">
                <div
                  v-show="state.actionData && state.actionData.level !== 1"
                  class="action"
                  @click="
                    fileAction(1, state.actionData, state.actionParentData)
                  ">
                  新增本级
                </div>
                <div
                  class="action"
                  @click="
                    fileAction(2, state.actionData, state.actionParentData)
                  ">
                  新增下级
                </div>
                <div
                  v-show="state.actionData && state.actionData.level !== 1"
                  class="action"
                  @click="
                    fileAction(3, state.actionData, state.actionParentData)
                  ">
                  删除
                </div>
                <!-- <div
                  class="action"
                  :class="{ disable: moveIndex == 0 }"
                  @click="fileAction(4, selectData, selectParentData, moveIndex == 0)">
                  上移
                </div>
                <div
                  class="action"
                  :class="{
                    disable: !selectParentData
                      ? moveIndex == data.length - 1
                      : moveIndex == selectParentData.Child.length - 1,
                  }"
                  @click="
                    fileAction(
                      5,
                      selectData,
                      selectParentData,
                      !selectParentData ? moveIndex == data.length - 1 : moveIndex == selectParentData.Child.length - 1
                    )
                  ">
                  下移
                </div> -->
              </div>
            </Teleport>
          </div>
        </div>
      </div>
      <div class="flex_right">
        <div class="main_container">
          <div class="base-info bg-scroll">
            <menuForm ref="menuFormRef" :data="menuFormData" />
          </div>
          <div class="base-btn">
            <el-button type="primary" @click="saveMenu(menuFormRef, addType)">
              保存
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 删除弹窗 -->
    <el-dialog
      v-model="delDialog"
      class="dialog_box"
      title="提示"
      width="400px">
      <div>确定要删除此菜单吗？</div>
      <template #footer>
        <div class="apaas_button">
          <el-button type="default" @click="delDialog = false">取 消</el-button>
          <el-button type="primary" @click="deleteData">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
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
import menuForm from './menu-form.vue'
import { v4 as uuidv4 } from 'uuid'
const router = useRouter()
const route = useRoute()

const menuTree = ref(null) // 树形
const treeAction = ref(null) // 树形操作弹出框
const menuFormRef = ref(null) // 右侧表单
const acTop = ref('')
const acLeft = ref('')
const acBottom = ref('')
const actionFlag = ref(false) // 弹出框状态标识

const state = reactive({
  data: [], // 树形数据
  dataObj: {}, //树形数据对象
  search: '', // 树形搜索
  actionData: null, // 当前操作的节点
  actionParentData: null, // 当前操作的节点的父节点
  selectData: null, // 当前选中的节点
  selectParentData: null, // 当前选中节点的父节点
  treeAction,
  menuTree,
  bottomGap: 30, //弹窗吸底高度
  defaultProps: {
    children: 'Child',
    label: 'menu_name',
  }, // 树形配置
  actionDataIndex: 0, // 当前选中节点在本级的位置，用来判断是否可以上下移动
  menuFormData: null, // 菜单数据
  addType: 1, // 1-新增本级 2-新增下级
  newMenuId: '', // 新增菜单时用来指定menu_id，达到选中效果
  timer: null, // 定时器
  delDialog: false,
})

const moveIndex = computed({
  get: () => {
    let index = 0
    if (state.selectData) {
      findIndex(state.selectData.menu_id, state.data)
      index = state.actionDataIndex
    }

    return index
  },
}) // 计算上下移动

watch(
  () => state.search,
  (n, o) => {
    if (state.timer) {
      clearTimeout(state.timer)
    }
    state.timer = setTimeout(() => {
      state.menuTree.filter(n)
    }, 500)
  }
) // 树形搜索值

const getMenuTree = (type, id) => {
  axios
    .get(`https://cache.wodcloud.com/bgyx/${route.query.base}/data/menu.json`)
    .then((res) => {
      if (res.status == 200) {
        state.data = res.data || []
        if (state.data.length == 0) {
          state.data.push({
            menu_name: '新菜单', // 菜单名称
            menu_id: uuidv4(), // 菜单id，用于新增后选中
            menu_type: !parent ? 0 : parent.menu_type == 0 ? 0 : 1, // 新增本级的类型
            dict_group_id: '', // 父级的分组 有则继承，无则自选
            state: 1, // 启用状态
            menu_url: '', // 路径
            menu_logo: '', // 图标
            source: '',
            level: 1, // 当前的level
            p_menu_type: 0, // 父级的类型，用于判断菜单下不能建目录
            system_type: '', // 系统类型
            new_window: 0,
            remark: '',
          })
        }
        nextTick().then(() => {
          if (type) {
            if (type == 1) {
              // 删除数据后默认选中父节点或第一个节点
              state.menuTree &&
                state.menuTree.setCurrentKey(state.selectParentData.menu_id)
              handleNodeClick(state.selectParentData)
              nextTick().then(() => {
                setScroll()
              })
            } else {
              state.menuTree &&
                state.menuTree.setCurrentKey(state.data[0].menu_id)
              handleNodeClick(state.data[0])
            }
          } else {
            // 上下移，初始化时默认选中节点 新增选中新增的节点
            if (id) {
              findData(state.data, id)
            }
            if (state.selectData) {
              state.menuTree &&
                state.menuTree.setCurrentKey(state.selectData.menu_id)
              handleNodeClick(state.selectData)
              nextTick().then(() => {
                setScroll()
              })
            } else {
              state.menuTree &&
                state.menuTree.setCurrentKey(state.data[0].menu_id)
              handleNodeClick(state.data[0])
            }
          }
        })
      } else {
        ElMessage.error(res.data.data)
      }
    })
} // 获取菜单树
const setScroll = () => {
  setTimeout(() => {
    const nodeOffsetTop = document.querySelector(
      '.file-tree .is-current'
    ).offsetTop
    const treeScroll = document.querySelector('.tree')
    const parentHeight = treeScroll.clientHeight

    if (nodeOffsetTop > parentHeight) {
      treeScroll.scrollTop = nodeOffsetTop - parentHeight / 2
    }
  }, 300)
}
const findData = (arr, id) => {
  arr.forEach((e) => {
    if (e.menu_id == id) {
      state.selectData = e
    } else {
      if (e.Child && e.Child.length > 0) {
        findData(e.Child, id)
      }
    }
  })
} // 处理数据 用于新增菜单后选中新增的菜单

const findIndex = (code, arr) => {
  arr.forEach((e, i) => {
    if (e.menu_id == code) {
      state.actionDataIndex = i
    } else {
      if (e.Child && e.Child.length > 0) {
        findIndex(code, e.Child)
      }
    }
  })
} // 处理数据 用于判断能否上下移

const isSticky = (data) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = '14px MicrosoftYaHei'
  const { width } = context.measureText(data)
  return width > 255 ? true : false
}

const showAction = (e, data, node) => {
  acTop.value = ''
  acLeft.value = ''
  acBottom.value = ''
  const rect = e.target.getBoundingClientRect() //获取点击的dom的位置
  const allHeight = document.body.scrollHeight

  actionFlag.value = true
  state.actionData = data
  if (node.parent.data.Child) {
    state.actionParentData = node.parent.data
  } else {
    //没有children则是最上层元素
    state.actionParentData = null
  }
  nextTick().then(() => {
    setTimeout(() => {
      let height = window.getComputedStyle(state.treeAction).height
      height = parseInt(height)
      //判断弹窗位置是否超过屏幕，超过则吸底展示
      if (height + rect.y - 17 > allHeight - state.bottomGap) {
        acBottom.value = state.bottomGap + 'px'
        acLeft.value = rect.x + 35 + 'px'
      } else {
        acTop.value = rect.y - 17 + 'px'
        acLeft.value = rect.x + 35 + 'px'
      }
    })
  })
} // 树形操作框

const handleNodeClick = (data) => {
  if (state.selectData && state.selectData.menu_id == data.menu_id) {
    return
  }
  state.selectData = data
  menuFormRef.value.setForm(state.selectData)
  closeAction()
  if (menuFormRef.value) {
    nextTick().then(() => {
      menuFormRef.value.menuRef.validate((valid) => {
        if (!valid) {
          menuFormRef.value.menuRef.clearValidate()
        }
      })
    })
  } // 清除表单验证
} // 菜单树节点点击

const filterNode = (val, data) => {
  if (!val) {
    return true
  }
  return data.menu_name.includes(val)
} // 树形筛选

const fileAction = (val, data, parent, disabled = false) => {
  if (val == 1) {
    // 新增本级菜单
    state.addType = 1
    const newChild = {
      menu_name: '新菜单', // 菜单名称
      menu_id: uuidv4(), // 菜单id，用于新增后选中
      menu_type: !parent ? 0 : parent.menu_type == 0 ? 0 : 1, // 新增本级的类型
      dict_group_id: parent ? parent.dict_group_id : '', // 父级的分组 有则继承，无则自选
      state: 1, // 启用状态
      menu_url: '', // 路径
      menu_logo: '', // 图标
      source: '',
      level: data.level, // 当前的level
      p_menu_type: parent ? parent.menu_type : 0, // 父级的类型，用于判断菜单下不能建目录
      system_type: '', // 系统类型
      new_window: 0,
      remark: '',
    }
    state.menuTree.insertAfter(
      newChild,
      parent
        ? parent.Child[parent.Child.length - 1]
        : state.data[state.data.length - 1]
    )
    state.menuTree && state.menuTree.setCurrentKey(newChild.menu_id)
    handleNodeClick(newChild)
  } else if (val == 2) {
    // 新增下级菜单
    if (disabled) {
      return
    }
    state.addType = 2
    const newChild = {
      menu_name: '新菜单',
      menu_id: uuidv4(),
      menu_type: data.menu_type == 0 ? 0 : 1,
      dict_group_id: data.dict_group_id,
      state: 1,
      menu_url: '',
      menu_logo: '',
      source: '',
      p_menu_type: data.menu_type,
      level: data.level + 1,
      system_type: '', // 系统类型
      new_window: 0,
      remark: '',
    }
    state.menuTree.append(newChild, data)
    state.menuTree && state.menuTree.setCurrentKey(newChild.menu_id)
    handleNodeClick(newChild)
    state.selectParentData = data
  } else if (val == 3) {
    // 删除菜单
    if (data.id) {
      if (data.state == 1) {
        ElMessage.error('删除内容中有启用状态的数据，不可删除！')
        return
      }
      state.delDialog = true
    } else {
      state.delDialog = true
    }
  } else if (val == 4) {
    // 菜单上移
    if (disabled) {
      return
    }
    let nextObj = null
    if (parent) {
      parent.Child.forEach((e, i) => {
        if (data.id == e.id) {
          nextObj = parent.Child[i - 1]
        }
      })
    } else {
      state.data.forEach((e, i) => {
        if (data.id == e.id) {
          nextObj = state.data[i - 1]
        }
      })
    }
    changeSort(data, nextObj)
  } else {
    // 菜单下移
    if (disabled) {
      return
    }
    let nextObj = null
    if (parent) {
      parent.Child.forEach((e, i) => {
        if (data.id == e.id) {
          nextObj = parent.Child[i + 1]
        }
      })
    } else {
      state.data.forEach((e, i) => {
        if (data.id == e.id) {
          nextObj = state.data[i + 1]
        }
      })
    }
    changeSort(data, nextObj)
  }
  if (menuFormRef.value) {
    nextTick().then(() => {
      menuFormRef.value.menuRef.validate((valid) => {
        if (!valid) {
          menuFormRef.value.menuRef.clearValidate()
        }
      })
    })
  } // 清除表单验证
} // 各种操作按钮

const deleteData = () => {
  const data = deleteTreeData(state.data, state.actionData.menu_id)
  axios
    .post('/api/putObject', {
      bucket: 'bgyx',
      fileName: `${localStorage.getItem('base')}/data/menu.json`,
      content: JSON.stringify(data),
    })
    .then((res) => {
      if (res.data.code == 200) {
        ElMessage.success('删除成功')
        state.selectData = null
        const type = state.selectParentData ? 1 : 2 // 1--有父级  2--无父级
        getMenuTree(type)
        state.delDialog = false
      } else {
        ElMessage.error(res.data.data)
      }
    })
}

const deleteTreeData = (arr, menu_id) => {
  arr.forEach((e, idx) => {
    if (e.menu_id == menu_id) {
      arr.splice(idx, 1)
    }
    if (e.Child && e.Child.length) {
      deleteTreeData(e.Child, menu_id)
    }
  })
  return arr
}

const changeSort = (data, nextObj) => {
  const params = [
    {
      id: data.id,
      sort: nextObj.sort,
    },
    {
      id: nextObj.id,
      sort: data.sort,
    },
  ]
  axios.put('/apaas/system/v5/menu/sort', params).then((res) => {
    if (res.data.code == 200) {
      ElMessage.success(res.data.msg)
      getMenuTree()
    } else {
      ElMessage.error(res.data.data)
    }
  })
} // 菜单上下移

const closeAction = () => {
  actionFlag.value = false
} // 点击其他地方，菜单操作框关闭

const saveMenu = (el, type) => {
  el.menuRef.validate((valid) => {
    if (valid) {
      const params = {
        menu_name: el.menuForm.menu_name,
        menu_type: el.menuForm.menu_type,
        dict_group_id: el.menuForm.dict_group_id,
        state: el.menuForm.state,
        menu_url: el.menuForm.menu_url,
        menu_logo: el.menuForm.menu_logo,
        source: el.menuForm.menu_type == 0 ? '' : el.menuForm.source,
        system_type: el.menuForm.system_type,
        new_window: el.menuForm.new_window,
        remark: el.menuForm.remark,
      }
      // if (state.selectData.id) {
      //   // 编辑
      //   axios.put(`/apaas/system/v5/menu/${state.selectData.id}`, params).then((res) => {
      //     if (res.data.code == 200) {
      //       ElMessage.success(res.data.msg);
      //       getMenuTree();
      //     } else {
      //       ElMessage.error(res.data.data);
      //     }
      //   });
      // } else {
      // 新增
      if (state.selectParentData) {
        if (
          state.selectParentData.menu_type == 1 &&
          el.menuForm.menu_type == 0
        ) {
          ElMessage.error('菜单之下不可以新增目录')
          return
        }
      }
      if (type == 1) {
        // 新增本级
        params.p_menu_id = state.selectParentData
          ? state.selectParentData.menu_id
          : ''
      } else {
        // 新增下级
        params.p_menu_id = state.selectParentData.menu_id
      }
      state.dataObj = {}
      getDataObj(state.data)
      state.dataObj[state.selectData.menu_id].menu_name = params.menu_name
      state.dataObj[state.selectData.menu_id].menu_type = params.menu_type
      state.dataObj[state.selectData.menu_id].dict_group_id =
        params.dict_group_id
      state.dataObj[state.selectData.menu_id].state = params.state
      state.dataObj[state.selectData.menu_id].menu_url = params.menu_url
      state.dataObj[state.selectData.menu_id].menu_logo = params.menu_logo
      state.dataObj[state.selectData.menu_id].source = params.source
      state.dataObj[state.selectData.menu_id].system_type = params.system_type
      state.dataObj[state.selectData.menu_id].new_window = params.new_window
      state.dataObj[state.selectData.menu_id].remark = params.remark

      axios
        .post('/api/putObject', {
          bucket: 'bgyx',
          fileName: `${localStorage.getItem('base')}/data/menu.json`,
          content: JSON.stringify(state.data),
        })
        .then((res) => {
          if (res.data.code == 200) {
            ElMessage.success('保存成功')
            state.selectData = null
            getMenuTree(null, res.data.data)
          } else {
            ElMessage.error(res.data.data)
          }
        })
      // }
    }
  })
} // 保存按钮，新增或编辑菜单

const getDataObj = (arr) => {
  arr.forEach((e) => {
    state.dataObj[e.menu_id] = e
    if (e.Child && e.Child.length) {
      getDataObj(e.Child)
    }
  })
}

onBeforeMount(() => {
  window.addEventListener('click', closeAction)
  window.addEventListener('scroll', closeAction, true)
  getMenuTree()
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeAction)
  window.removeEventListener('scroll', closeAction)
})

const {
  data,
  search,
  defaultProps,
  selectParentData,
  selectData,
  menuFormData,
  addType,
  delDialog,
} = toRefs(state)
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
