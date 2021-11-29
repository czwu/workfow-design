<template>
  <div>
    <div class="dialog-selectuser" @click="openDialog">
      <div class="user-list">
        <el-tag class="user" v-for="(item, index) in currentUsers" :key="index" closable size="mini"
          type="info" @close="handleClose(index)">
          {{item.userName}}
        </el-tag>
      </div>
      <div class="select-btn-group">
        <i v-if="currentUsers && currentUsers.length==0" class="el-icon-arrow-down"></i>
        <i v-else class="el-icon-circle-close" @click.stop="clearCurrentUsers"></i>
      </div>
    </div>
    <el-dialog
      v-if="dialogVisible"
      title="搜索用户"
      :visible.sync="dialogVisible"
      width="900px">
      <div>
        <div>
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="姓名">
              <el-input clearable v-model="searchForm.userName" placeholder="请输入姓名"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input clearable v-model="searchForm.mobile" placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="query">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div>
          <el-table
            ref="multipleTable"
            height="300"
            :data="tableData"
            @selection-change="handleSelectionChange">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              prop="userName"
              label="姓名"
              width="200">
            </el-table-column>
            <el-table-column
              prop="mobile"
              label="手机号"
              width="200">
            </el-table-column>
            <el-table-column
              prop="account"
              label="用户账号">
            </el-table-column>
          </el-table>
        </div>
        <div>
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="page.pageNum" :page-sizes="page.sizeArray" :page-size="page.pageSize" :total="page.total" :layout="page.layout">
          </el-pagination>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="selectUsers">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import service from "@/common/service";
export default {
  props: ['value'],
  data() {
    return {
      currentUsers: [],
      dialogVisible: false,
      page: {
        pageNum: 1,
        pageSize: 10,
        sizeArray: [5, 10, 20, 50, 100],
        total: 0,
        layout: 'sizes, total, jumper, prev, pager, next'
      },
      tableData: [],
      multipleSelection: [],
      searchForm: {
        userName: '',
        mobile: ''
      },
      realSearchOption: {}
    }
  },
  watch: {
    'value': {
      immediate: true,
      handler() {
        if (this.value && this.value.length > 0) {
          const list = this.value.map(item => {
            return {
              account: item
            }
          })
          service.batchUsers(list).then(res => {
            this.currentUsers = res.data
          })
        } else {
          this.currentUsers = []
        }
      }
    }
  },
  created() {
    this.query()
  },
  methods: {
    // 回调
    calbackData(value) {
      this.$emit('change', value)
    },
    // 删除用户
    handleClose(index) {
      this.currentUsers.splice(index, 1);
      this.calbackData(this.currentUsers.map(item => item.account));
    },
    // 清空用户
    clearCurrentUsers() {
      this.currentUsers = [];
      this.calbackData([]);
    },
    // 打开弹窗
    openDialog() {
      this.dialogVisible = true;
    },
    getList() {
      service.queryUsers(this.realSearchOption).then(({ data }) => {
        this.tableData = data.list;
        this.page.pageNum = data.pageNum;
        this.page.pageSize = data.pageSize;
        this.page.total = data.total;
      });
    },
    query() {
      this.realSearchOption = {
        queryPage: '1',
        status: '6',
        pageNum: 1,
        pageSize: this.page.pageSize,
        userName: this.searchForm.userName,
        mobile: this.searchForm.mobile
      }
      this.getList()
    },
    handleSizeChange(pageSize) {
      this.realSearchOption.pageSize = pageSize
      this.getList()
    },
    handleCurrentChange(pageNum) {
      this.realSearchOption.pageNum = pageNum
      this.getList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    selectUsers() {
      if (this.multipleSelection.length === 0) {
        return this.$message.error('尚未选择用户')
      }
      const currentAccounts = this.value && this.value.length > 0 ? [...this.value] : []
      const addUser = this.multipleSelection.map(item => item.account)
      this.calbackData([...new Set([...currentAccounts, ...addUser])])
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-selectuser {
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  min-height: 28px;
  width: 193px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  .user-list {
    box-sizing: border-box;
  }
  .user {
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
</style>
