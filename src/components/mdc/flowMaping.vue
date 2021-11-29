<template>
  <div>
    <el-dialog
      title="流程字段对应关系"
      :visible.sync="dialogVisible"
      :before-close="close"
      custom-class="design-dialog"
      width="900px">
      <el-table :data="tableData" border height="300" size='mini'>
        <el-table-column
          type="index"
          width="50">
        </el-table-column>
        <el-table-column label="子流程字段">
          <template slot-scope="scope">
            <el-select filterable clearable v-model="scope.row.key" @change="keyChange(scope.row)" style="width:100%">
              <el-option
                v-for="(item, index) in keyList"
                :label="item.fieldName+'（'+item.fieldRemark+'）'"
                :value="item.fieldName"
                :key="index"
                :disabled="isDisabled(item.fieldName)"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="转换" align="center" width="220">
          <template>
            <span class="el-icon-right"></span>
          </template>
        </el-table-column>
        <el-table-column label="主流程字段">
          <template slot-scope="scope">
            <el-select filterable clearable v-model="scope.row.value" style="width:100%">
              <el-option
                v-for="(item, index) in valueList"
                :label="item.fieldName+'（'+item.fieldRemark+'）'"
                :value="item.fieldName"
                :key="index"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template slot="header">
            <el-button size="medium" type="text" icon="el-icon-circle-plus-outline" @click="addRow('last')"></el-button>
          </template>
          <template slot-scope="scope">
            <el-button size="medium" type="text" style="color: red;" icon="el-icon-remove-outline" @click="delRow(scope.row)"></el-button>
            <el-button size="medium" type="text" icon="el-icon-circle-plus-outline" @click="addRow(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancle">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import service from "@/common/service";
import { getUrlParams } from "@/utils/tools"; 
export default {
  props: {
    subProcessKey: {
      default: '',
      require: false
    },
    nodeData: {
      default: function() {
        return {}
      },
      require: false
    }
  },
  data() {
    return {
      dialogVisible: true,
      tableData: [],
      keyList: [],
      valueList: []
    }
  },
  created() {
    let arr = [];
    let jsonData = {};
    if (this.nodeData.workflow.subFieldMaping) {
      jsonData = JSON.parse(this.nodeData.workflow.subFieldMaping);
      for (let i in jsonData) {
        arr.push({key: i, value: jsonData[i]})
      }
    }
    this.tableData = arr;
    this.getTemplateDetails(this.subProcessKey).then(res => {
      const { data } = res
      this.getFieldList(data.formType, data.processKey, data.taskDetail.filter(item => item.taskType === 'START').map(item => item.taskKey).join(',')).then(res => {
        if (res.data && res.data.length > 0) {
          this.keyList = res.data
        } else {
          this.$message.error('请先配置好子流程字段设置')
        }
      })
    })
    this.getTemplateDetails(getUrlParams().modelKey).then(res => {
      const { data } = res
      this.getFieldList(data.formType, data.processKey, data.taskDetail.filter(item => item.taskType === 'START').map(item => item.taskKey).join(',')).then(res => {
        if (res.data && res.data.length > 0) {
          this.valueList = res.data
        } else {
          this.$message.error('请先配置好主流程字段设置')
        }
      })
    })
  },
  methods: {
    getTemplateDetails(processKey) {
      return service.getTemplateByProcessKey({processKey})
    },
    getFieldList(formType, processKey, taskKey) {
      return service.getSubFieldMapping({formType, processKey, taskKey})
    },
    delRow(row) {
      this.tableData.splice(this.tableData.indexOf(row), 1)
    },
    addRow(row) {
      if (row === 'last') {
        this.tableData.push({key: '', value: ''})
      } else {
        this.tableData.splice(this.tableData.indexOf(row) + 1, 0, {key: '', value: ''})
      }
    },
    keyChange(row) {
      const arr = this.valueList.filter(item => item.fieldName === row.key)
      if (arr.length === 1) {
        row.value = row.key
      }
    },
    isDisabled(fieldName) {
      return this.tableData.map(item => item.key).includes(fieldName)
    },
    cancle() {
      this.close();
    },
    ok() {
      let data = {};
      this.tableData.filter(item => !!item.key && !!item.value).forEach(item => {
        data[item.key] = item.value;
      });
      this.$set(this.nodeData.workflow, 'subFieldMaping', JSON.stringify(data));
      this.close();
    },
    close() {
      this.dialogVisible = false;
      this.$emit('closeFlowMapping')
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .design-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 10px 20px;
}
</style>
