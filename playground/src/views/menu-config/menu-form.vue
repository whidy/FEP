<template>
  <el-form
    ref="menuRef"
    :label-position="'right'"
    label-width="68px"
    :model="menuForm"
    :rules="formRules"
    style="width: 856px"
    class="menu_form">
    <el-form-item :label="topLevel?'系统名称':'菜单名称'" prop="menu_name">
      <el-input
        v-model.trim="menuForm.menu_name"
        show-word-limit
        maxlength="8"
        :placeholder="topLevel?'请输入系统名称':'请输入菜单名称'" />
    </el-form-item>
    <el-form-item v-if="!topLevel" label="类型" prop="menu_type">
      <el-radio-group v-model="menuForm.menu_type" :disabled="radioDisabled">
        <el-radio :label="0">目录</el-radio>
        <el-radio :label="1">菜单</el-radio>
        <!-- <el-radio :label="2">子页面</el-radio> -->
      </el-radio-group>
    </el-form-item>
    <!-- <el-form-item label="分组" prop="dict_group_id" v-if="!topLevel">
        <el-select v-model="menuForm.dict_group_id" :disabled="groupFlag" placeholder="请选择分组">
          <el-option v-for="item in groupList" :key="item.dict_id" :label="item.dict_name" :value="item.dict_id" />
        </el-select>
      </el-form-item> -->
    <el-form-item label="跳转方式" prop="new_window">
      <el-radio-group v-model="menuForm.new_window">
        <el-radio :label="0">当前窗口</el-radio>
        <el-radio :label="1">新窗口</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="menuForm.remark"
        show-word-limit
        maxlength="8"
        placeholder="请输入备注" />
    </el-form-item>
    <!-- <el-form-item label="系统类型" prop="system_type" v-if="topLevel">
        <el-select v-model="menuForm.system_type" placeholder="请选择系统类型">
          <el-option v-for="item in systemGroupList" :key="item.dict_id" :label="item.dict_name" :value="item.dict_id" />
        </el-select>
      </el-form-item> -->
    <el-form-item v-if="!topLevel" label="是否启用" prop="state">
      <el-switch
        v-model="menuForm.state"
        class="bg-switch-ele"
        :active-value="1"
        :inactive-value="0"
        inline-prompt
        active-text="是"
        inactive-text="否"
        :disabled="disabledSwitch" />
    </el-form-item>
    <el-form-item label="菜单路径" :prop="topLevel ? '' : 'menu_url'">
      <el-input
        v-model="menuForm.menu_url"
        show-word-limit
        maxlength="200"
        placeholder="请输入菜单路径" />
    </el-form-item>
    <el-form-item v-if="!topLevel" label="菜单图标" prop="menu_logo">
      <div class="iconBox" :style="iconFlag ? { 'border-color': '#2b4695' } : {}" @click="openIconbox">
        <div>
          <span>
            <bg-icon class="bgIcon" style="margin-right: 8px" :icon="'#' + menuForm.menu_logo" />
            <span>{{ menuForm.menu_logo.replace("bg-ic-", "") }}</span>
          </span>
        </div>
        <div>
          <bg-icon
            v-if="menuForm.menu_logo != ''"
            class="bgIcon clearIcon"
            icon="#bg-ic-circle-close"
            @click.stop="clearIcon" />
          <bg-icon class="bgIcon" :icon="iconFlag ? '#bg-ic-caret-top' : '#bg-ic-caret-bottom'" />
        </div>
      </div>
      <div v-show="iconFlag" class="icon_box">
        <div class="input_box">
          <el-input
            v-model="icon_search"
            placeholder="请输入内容"
            :prefix-icon="Search"
            @input="searchIcon" />
        </div>
        <div class="icon_content bg-scroll">
          <div
            v-for="(e, i) in showIconArr"
            :key="i + 100"
            class="icon_item"
            @click="changeIcon(e)">
            <span :title="e.name">
              <bg-icon class="selectBgIcon" :icon="'#' + e.icon" />
              {{ e.name }}
            </span>
          </div>
        </div>
      </div>
    </el-form-item>
    <!-- <el-form-item label="资源路径" v-if="menuForm.menu_type != 0">
        <el-input v-model="menuForm.source" show-word-limit maxlength="200" placeholder="请输入资源路径" />
      </el-form-item> -->
  </el-form>
</template>

  <script setup>
  import { Search } from '@element-plus/icons-vue'
  import { reactive, ref, onMounted, toRefs } from 'vue'
  import axios from 'axios'
  import { ElMessage } from 'element-plus'
  import allIconArr from './bg_icon.js'

  const menuRef = ref(null)
  const props = defineProps({
    data: {
      type: Object,
      default: null,
    },
  })
  const state = reactive({
    menuRef,
    menuForm: {
      menu_name: '',
      menu_type: 0,
      dict_group_id: '',
      state: 1,
      menu_url: '',
      menu_logo: '',
      source: '',
      system_type: '',
      new_window: 0,
      remark: '',
    },
    formRules: {
      menu_name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
      menu_type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
      dict_group_id: [{ required: true, message: '请选择菜单分组', trigger: 'change' }],
      system_type: [{ required: true, message: '请选择系统类型', trigger: 'change' }],
      menu_url: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
      new_window: [{ required: true, message: '请选择跳转方式', trigger: 'change' }],
    },
    groupList: [], // 菜单分组
    systemGroupList: [], // 系统类型--顶级菜单使用
    iconFlag: false, // 图标盒子
    icon_search: '', // 图标筛选
    iconArr: [], // 所有的图标
    showIconArr: [], // 展示的图标
    timer: null,
    radioDisabled: false,
    topLevel: false,
    typeDisFlag: null,
    groupFlag: true,
    disabledSwitch: false, // 内置菜单built_in为1-不可禁用 0或不存在-可禁用
  })

  const getGroupList = () => {
    axios
      .get('/apaas/system/v5/menu/group/dict')
      .then((res) => {
        if (res.data.code == 200) {
          state.groupList = res.data.data || []
        } else {
          ElMessage.error(res.data.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  } // 获取分组数据

  const getSystemGroup = () => {
    axios
      .get('/apaas/system/v5/menu/system/dict')
      .then((res) => {
        if (res.data.code == 200) {
          state.systemGroupList = res.data.data || []
        } else {
          ElMessage.error(res.data.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  } // 获取系统类型数据
  const openIconbox = () => {
    state.iconFlag = !state.iconFlag
    state.icon_search = ''
    searchIcon()
  } // 打开/关闭图标盒子
  const searchIcon = () => {
    if (state.timer) {
      clearTimeout(state.timer)
    }
    state.timer = setTimeout(() => {
      const iconList = []
      if (state.icon_search == '') {
        state.showIconArr = state.iconArr
      } else {
        state.iconArr.map((e) => {
          if (e.name.indexOf(state.icon_search) !== -1) {
            iconList.push(e)
          }
        })
        state.showIconArr = iconList
      }
    }, 500)
  } // 图标筛选

  const setForm = (data) => {
    if (data.level && data.level == 1) {
      state.topLevel = true
    } else {
      state.topLevel = false
      if (data.level == 2) {
        state.groupFlag = false
      } else {
        state.groupFlag = true
      }
    }
    state.typeDisFlag = data.p_menu_type
    if (data.id) {
      // 编辑状态
      state.radioDisabled = true
    } else {
      state.radioDisabled = false
    }
    state.disabledSwitch = data.built_in && data.built_in == 1 ? true : false
    state.menuForm = Object.assign(state.menuForm, data)
  } // 表单赋值

  const clearIcon = () => {
    state.menuForm.menu_logo = ''
  } // 清除选中的图标

  const changeIcon = (e) => {
    state.menuForm.menu_logo = e.icon
    state.iconFlag = false
    state.icon_search = ''
    searchIcon()
  } // 选中图标
  onMounted(() => {
    // 处理图标数据
    allIconArr.forEach((e) => {
      state.iconArr.push({
        icon: e,
        name: e.replace('bg-ic-', ''),
      })
    })
    state.showIconArr = state.iconArr
    // getGroupList();
    // getSystemGroup();
  })
  const {
    menuForm,
    formRules,
    groupList,
    iconFlag,
    showIconArr,
    icon_search,
    radioDisabled,
    topLevel,
    typeDisFlag,
    groupFlag,
    systemGroupList,
    disabledSwitch,
  } = toRefs(state)

  defineExpose({ setForm, menuForm, menuRef })
  </script>

  <style lang="scss" scoped>
  .menu_form {
    .el-form-item {
      margin-bottom: 24px;
      :deep().el-form-item__label {
        padding: 0;
        margin-right: 8px;
      }
      .el-form-item__content {
        .el-input,
        .el-select {
          width: 100%;
        }
        .bg-switch-ele {
          width: 52px;
          height: 24px;
          :deep().el-switch__core {
            width: 100%;
            height: 24px;
            .el-switch__inner,
            .el-switch__action {
              top: 3px;
            }
          }
        }
        .iconBox {
          width: 100%;
          display: flex;
          padding: 0 12px;
          height: 36px;
          line-height: 36px;
          justify-content: space-between;
          border: 1px solid #dadee7;
          border-radius: 4px;
          cursor: pointer;
          .bgIcon {
            color: #202531;
            width: 8px;
            margin-top: 11px;
          }
          .clearIcon {
            margin-right: 8px;
            width: 14px;
            display: none;
          }
          &:hover,
          &:focus,
          &:active {
            border-color: #2b4695;
            .clearIcon {
              display: inline-block;
            }
          }
          &:hover {
            border-color: #a9b1c7;
          }
        }
        .icon_box {
          width: 100%;
          height: 236px;
          box-shadow: 0px 4px 12px 0px rgba(18, 30, 63, 0.1);
          border-radius: 4px;
          border: solid 1px #e6e9ef;
          margin-top: 10px;
          padding: 12px 0px 12px 8px;
          .input_box {
            margin-right: 8px;
          }
          .icon_content {
            width: 100%;
            height: 168px;
            display: flex;
            flex-wrap: wrap;
            margin-top: 8px;
            align-content: flex-start;
            .icon_item {
              display: inline-block;
              border: 1px solid #dadee7;
              border-radius: 3px;
              width: 182px;
              height: 36px;
              margin: 0 8px 8px 0;
              color: #202531;
              padding: 0 16px;
              line-height: 36px;
              cursor: pointer;
              &:hover,
              &:active {
                background-color: #eaedf5;
                border-color: #95a3ca;
              }
              &:nth-child(4n) {
                margin-right: 0;
              }
              .selectBgIcon {
                width: 14px;
                margin-right: 10px;
              }
              span {
                display: inline-block;
                width: 100%;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
              }
            }
          }
        }
      }
    }
  }
  </style>
