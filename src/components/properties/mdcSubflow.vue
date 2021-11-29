<template>
  <div class="subflow">
    <div class="wrap-select">
      <div class="dialog-select" @click="openDialog">
        <div class="list">
          <el-tag class="current" v-for="(item, index) in current" :key="index" closable size="mini" type="info" @close="handleClose(index)">
            {{item.name}}
          </el-tag>
        </div>
        <div class="select-btn-group">
          <i v-if="current && current.length==0" class="el-icon-arrow-down"></i>
          <i v-else class="el-icon-circle-close" @click.stop="clearCurrent"></i>
        </div>
      </div>
      <div class="edit" @click="showMapping=true">
        <i class="el-icon-edit" v-if="current && current.length > 0"></i>
      </div>
    </div>
    <el-dialog
      v-if="dialogVisible"
      title="选择子流程"
      :visible.sync="dialogVisible"
      width="900px">
      <div>
        <div class="public-searchForm">
          <el-form inline :model="searchForm">
            <el-form-item label="模板名称">
              <el-input v-model="searchForm.templateName" clearable placeholder="请输入模板名称"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="default" @click="reset">重置</el-button>
              <el-button type="primary" @click="query">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="public-table">
          <el-table :data="tableData" border height="300">
            <el-table-column label="" width="55">
              <template slot-scope="scope">
                <el-radio v-model="radio" :label="scope.row.processKey">{{ '' }}</el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="templateCode" label="流程编码" />
            <el-table-column prop="formTypeText" label="模板对象" />
            <el-table-column prop="templateName" label="模板名称" />
            <el-table-column prop="statusText" label="状态" />
          </el-table>
        </div>
        <div class="public-pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.pageNum"
            :page-sizes="page.sizeArray"
            :page-size="page.pageSize"
            :total="page.total"
            :layout="page.layout"
          >
          </el-pagination>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="selectHandle">确 定</el-button>
      </span>
    </el-dialog>
    <flowMaping :subProcessKey="value" :nodeData="nodeData" @closeFlowMapping="showMapping=false" v-if="showMapping" />
  </div>
</template>

<script>
import service from "@/common/service";
import flowMaping from "../mdc/flowMaping";
export default {
  props: ['value', 'nodeData'],
  components: { flowMaping },
  data() {
    return {
      dialogVisible: false,
      showMapping: false,
      current: [],
      radio: '',
      realSearchOption: {},
      page: {
        pageNum: 1,
        pageSize: 10,
        sizeArray: [5, 10, 20, 50, 100],
        total: 0,
        layout: 'sizes, total, jumper, prev, pager, next'
      },
      searchForm: {
        name: ''
      },
      tableData: [],
      // 表单对象
      formTypeOption: [{
        value: 'store',
        label: '店铺档案'
      }, {
        value: 'goods',
        label: '物料档案'
      }, {
        value: 'customer',
        label: '客户档案'
      }, {
        value: 'supplier',
        label: '供应商档案'
      }, {
        value: 'bom',
        label: 'BOM档案'
      }, {
        value: 'process_route',
        label: '工艺路线档案'
      }, {
        value: 'work_center',
        label: '工作中心档案'
      }],
      // 状态
      statusOption: [{
        value: 0,
        label: '已禁用'
      }, {
        value: 1,
        label: '已启用'
      }],
    }
  },
  watch: {
    'value': {
      immediate: true,
      handler() {
        if (this.value && this.value.length > 0) {
          service.querymodelbykey(this.value).then(({ data }) => {
            this.current = [
              {
                key: this.value,
                name: data.name
              }
            ]
          })
        } else {
          this.current = []
        }
      }
    }
  },
  created() {
    this.query()
  },
  methods: {
    // 获取表单对象
    getFormTypeText(formType) {
      let text = formType;
      this.formTypeOption.forEach(item => {
        if (item.value === formType) {
          text = item.label
        }
      });
      return text;
    },
    // 获取状态文案
    getStatusText(status) {
      let text = status;
      this.statusOption.forEach(item => {
        if (item.value === status) {
          text = item.label
        }
      });
      return text;
    },
    // 回调
    calbackData(value) {
      if (!value || value.length === 0) {
        this.$set(this.nodeData.workflow, 'subFieldMaping', '');
      }
      this.$emit('input', value)
      this.$emit('change', value)
    },
    // 单个删除
    handleClose(index) {
      this.current.splice(index, 1);
      this.calbackData(this.current.map(item => item.key));
    },
    // 清空
    clearCurrent() {
      this.current = [];
      this.calbackData([]);
    },
    // 打开弹窗
    openDialog() {
      this.dialogVisible = true
      this.radio = ''
    },
    // 确认事件
    selectHandle() {
      if (!this.radio) {
        return this.$message.error('请选择')
      }
      this.current = this.tableData.filter(item => item.key === this.radio)
      this.calbackData(this.radio)
      this.dialogVisible = false;
      this.showMapping = true;
    },
    // 重置
    reset() {
      this.searchForm.templateName = ''
      this.searchForm.createBy = ''
      this.query()
    },
    // 查询按钮事件
    query() {
      this.realSearchOption = {
        pageNum: 1,
        pageSize: this.page.pageSize,
        templateName: this.searchForm.templateName
      }
      this.getList()
    },
    // 获取列表数据
    getList() {
      service.getMdcFlowTemplateList(this.realSearchOption).then(({ data }) => {
        this.tableData = data.list ? data.list.map(item => {
          return {
            ...item,
            formTypeText: this.getFormTypeText(item.formType),
            statusText: this.getStatusText(item.status)
          }
        }) : []
        this.page.pageNum = data.pageNum
        this.page.pageSize = data.pageSize
        this.page.total = data.total
      })
    },
    // 切换分页事件
    handleSizeChange(pageSize) {
      this.realSearchOption.pageSize = pageSize
      this.getList()
    },
    // 切换当前页事件
    handleCurrentChange(pageNum) {
      this.realSearchOption.pageNum = pageNum
      this.getList()
    },
  }
}
</script>

<style lang="scss" scoped>
.dialog-select {
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  min-height: 28px;
  width: 193px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  .list {
    box-sizing: border-box;
  }
  .current {
    margin: 2px 0 2px 6px;
  }
  .select-btn-group {
    width: 34px;
    flex-shrink: 0;
    text-align: center;
    color: #C0C4CC;
    i {
      line-height: 28px;
    }
  }
}
.wrap-select {
  display: flex;
  .edit {
    margin-left: 10px;
    color: #00aa91;
    cursor: pointer;
  }
}
</style>
