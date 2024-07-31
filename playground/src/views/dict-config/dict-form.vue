<template>
  <el-form :model="form" label-width="80px">
    <el-form-item label="文件名" required>
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="文件路径">
      {{ props.file.name }}
    </el-form-item>
    <el-form-item label="内容编辑">
      <el-table
        :data="form.tableData"
        style="width: 100%"
        row-key="id"
        default-expand-all>
        <el-table-column prop="label" label="Label" class-name="table-label">
          <template #default="scope">
            <el-input v-model="scope.row.label" />
          </template>
        </el-table-column>
        <el-table-column prop="value" label="Value">
          <template #default="scope">
            <el-input
              v-if="scope.row.type !== 'boolean'"
              v-model="scope.row.value"
              @change="() => handleValueChange(scope.row, scope.$index)" />
            <el-select
              v-else-if="scope.row.type === 'boolean'"
              v-model="scope.row.value">
              <el-option label="true" :value="true" />
              <el-option label="false" :value="false" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="Type">
          <template #default="scope">
            <el-select
              v-model="scope.row.type"
              @change="() => handleTypeChange(scope.row, scope.$index)">
              <el-option label="String" value="string" />
              <el-option label="Number" value="number" />
              <el-option label="Boolean" value="boolean" />
              <el-option label="Children" value="children" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="disabled" label="Disabled">
          <template #default="scope">
            <el-select v-model="scope.row.disabled">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="table-operation" width="140">
          <template #default="scope">
            <el-button
              type="text"
              @click="handleRemoveRow(scope.$index)">删除</el-button>
            <el-button
              v-if="scope.row.children"
              type="text"
              @click="
                handleAddRow(scope.row, scope.$index, !!scope.row.children)
              ">添加子级</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="handleAddRow(newRow(), form.tableData.length, false)">
        新增行</el-button>
      <el-button type="primary" @click="saveForm">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
const props = defineProps({
  file: {
    type: Object,
    default: () => {},
  },
})

const emit = defineEmits(['update-filelist'])

const form = reactive({
  name: '',
  tableData: [],
})

const newRow = () => ({
  id: uuidv4(),
  label: '',
  value: '',
  type: 'string',
  disabled: 'false',
  level: 0,
})

function handleValueChange(row) {
  // 当用户修改值时调用，确保值与类型匹配
  if (row.type === 'number') {
    if (Number(row.value)) {
      row.value = Number(row.value)
    } else {
      row.type = 'string'
    }
  }
}

function handleTypeChange(row, index) {
  // 当用户改变类型时调用，确保值与新类型匹配
  if (row.type === 'number' && !isNaN(row.value)) {
    row.value = Number(row.value)
  } else if (row.type === 'string') {
    row.value = String(row.value)
  } else if (row.type === 'boolean') {
    row.value = true
  } else if (row.type === 'children') {
    handleAddRow(row, index, true)
  }
  // 根据需要添加其他类型的处理逻辑
}

function handleAddRow(row, index, isChild = false) {
  let _newRow
  // if (!row) {
  //   _newRow = newRow();
  //   form.tableData.splice(index + 1, 0, _newRow);
  //   return;
  // }
  const level = isChild ? row.level + 1 : row.level
  _newRow = newRow()
  _newRow.level = level
  if (isChild) {
    // row.value = "";
    // _newRow.hasChildren = true;
    if (row.children) {
      row.children.push(_newRow)
    } else {
      row.children = [_newRow]
    }
  } else {
    form.tableData.splice(index + 1, 0, _newRow)
  }
}

function handleRemoveRow(index) {
  if (form.tableData.length === 1) {
    return
  }
  form.tableData.splice(index, 1)
}

const validateTableData = (rows) => {
  for (const row of rows) {
    // 检查label和value是否为空
    if (!row.label || !row.value) {
      ElMessage.error('Label或Value不能为空')
      return false // 停止检查并返回错误
    }
    // 如果该行有children，则递归验证
    if (row.children && row.children.length > 0) {
      const isValid = validateTableData(row.children)
      if (!isValid) return false // 如果发现错误，则停止检查
    }
  }
  return true // 所有行及其子项都通过验证
}

const saveForm = () => {
  if (!form.name.trim()) {
    alert('文件名不能为空')
    return
  }
  if (!validateTableData(form.tableData)) {
    alert('数据有误，检查后重试')
    return
  }
  console.log('保存的数据', JSON.stringify(form.tableData))
  axios
    .post('/api/putObject', {
      bucket: 'bgyx',
      fileName: `${localStorage.getItem('base')}/data/dict/${form.name}.json`,
      content: JSON.stringify(form),
    })
    .then((res) => {
      if (res.data.code == 200) {
        ElMessage.success('保存成功')
        emit('update-filelist')
      } else {
        ElMessage.error(res.data.data)
      }
    })
}

const fetchFileData = () => {
  axios
    .get(`https://cache.wodcloud.com/bgyx/${props.file.name}`)
    .then(({ data }) => {
      form.tableData = data.tableData
      form.name = props.file.fileName.replace('.json', '')
    })
}

watch(
  () => props.file.name,
  () => {
    if (props.file.name) {
      fetchFileData()
    }
  }
)

onMounted(() => {
  form.tableData.push(newRow())
  console.log(props.file.name)
  if (props.file.name) {
    fetchFileData()
  }
})
</script>

<style lang="scss">
.table-label {
  width: 100%;
  .cell {
    display: flex;
    width: 100%;
    align-items: center;
  }
}
.table-operation {
  .el-button {
    padding: 0 4px !important;
  }
}
</style>
