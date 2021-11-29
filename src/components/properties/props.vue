<template>
  <div class="props-editor">
    <el-form size="small" label-width="60px" label-position="left">
      <div class="split-title">基本信息</div>
      <!-- 流程属性配置 -->
      <div class="padding" v-if="!value.compType">
        <el-form-item label="ID">
          <el-input v-model="value.id" disabled class="dis-input"></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="value.name"></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="value.author"></el-input>
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="value.version"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            type="textarea"
            rows="3"
            placeholder="请输入"
            :show-word-limit="true"
            maxlength="200"
            v-model="value.description"
          ></el-input>
        </el-form-item>
      </div>
      <div v-else>
        <!-- 其他组件属性 -->
        <div class="padding">
          <el-form-item label="ID">
            <el-input v-model="value.id" disabled class="dis-input"></el-input>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="value.label"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              type="textarea"
              rows="3"
              placeholder="请输入"
              :show-word-limit="true"
              maxlength="200"
              v-model="value.workflow.description"
            ></el-input>
          </el-form-item>
        </div>
        <div
          class="split-title flex-row"
          v-if="
            value.compType !== 'startEvent' && value.compType !== 'endEvent'
          "
        >
          <span>相关配置</span>
          <span class="flex-grow"></span>
          <span v-if="value.compType === 'gateway'">
            <span class="switch-label">并行</span>
            <el-switch v-model="value.workflow.isParallel"></el-switch>
          </span>
          <span v-if="value.compType === 'sequenceFlow'">
            <span class="switch-label">条件</span>
            <el-switch v-model="value.workflow.hasCondition"></el-switch>
          </span>
        </div>
        <div class="padding" v-if="value.workflow && value.workflow.hasCondition">
          <el-form-item label="条件表达式" label-width="90px">
            <el-input v-model="value.workflow.condition"></el-input>
          </el-form-item>
          <el-form-item label="条件描述" label-width="90px">
            <el-input v-model="value.workflow.conditionLabel"></el-input>
          </el-form-item>
        </div>
        <div v-if="value.compType == 'task'">
          <el-row :gutter="50" class="padding">
            <el-col :span="12">
              <el-form-item label="不可取回" label-width="70px" size="mini">
                <el-switch v-model="value.workflow.unRevoke"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="可作废" label-width="70px" size="mini">
                <el-switch v-model="value.workflow.canInvalid"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="可催办" label-width="70px" size="mini">
                <el-switch v-model="value.workflow.canPushes"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="可委托" label-width="70px" size="mini">
                <el-switch v-model="value.workflow.canDelegate"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮件通知" label-width="70px" size="mini">
                <el-switch v-model="value.workflow.canEmail"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="短信通知" label-width="70px" size="mini">
                <el-switch v-model="value.workflow.canMessage"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="padding" v-if="value.workflow.showSubflow">
            <el-form-item label="子流程" label-width="70px" size="mini">
              <el-select
                v-model="value.workflow.subProcess"
                filterable
                clearable
                @visible-change="subProcessVisible"
                placeholder="请输入流程名称搜索"
                popper-class="myoptions flow"
                ref="processSel"
                @change="subflowChange"
              >
                <el-option
                  v-for="item in subProcessList"
                  :key="item.key"
                  :label="item.name"
                  :value="item.key"
                >
                  <span class="option-label">{{ item.name }}</span>
                  <span class="option-remark">{{ item.updatedBy }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label=""
              label-width="70px"
              v-if="isMdc && value.workflow.subProcess"
            >
              <el-button size="mini" @click="showMapping = true"
                >设置子流程参数</el-button
              >
            </el-form-item>
          </div>
          <div v-if="value.workflow.showApproval && value.workflow.approval">
            <div class="split-title">处理人配置</div>
            <div class="padding" style="padding-bottom: 20px">
              <el-radio
                v-model="value.workflow.approval[0].type"
                label="user"
                @change="changeApproval"
                >用户</el-radio
              >
              <span style="display: inline-block; width: 30px"></span>
              <el-radio
                v-model="value.workflow.approval[0].type"
                label="group"
                @change="changeApproval"
                >用户组</el-radio
              >
            </div>
            <div class="padding">
              <el-form-item
                label="用户"
                label-width="70px"
                v-if="value.workflow.approval[0].type === 'user'"
              >
                <el-select
                  v-model="value.workflow.approval[0].value"
                  multiple
                  filterable
                  popper-class="myoptions"
                >
                  <el-option
                    v-for="item in users"
                    :key="item.account"
                    :label="item.userName"
                    :value="item.account"
                  >
                    <span class="option-label">{{ item.userName }}</span>
                    <span class="option-remark">{{ item.mobile }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="用户组"
                label-width="70px"
                v-if="value.workflow.approval[0].type === 'group'"
              >
                <el-select
                  v-model="value.workflow.approval[0].value"
                  filterable
                  multiple
                  placeholder="请选择"
                  size="mini"
                >
                  <el-option
                    v-for="item in groups"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="比例配置" label-width="70px" v-if="value.workflow.approval[0].type === 'group'">
                <el-row :gutter="0">
                  <el-col :span="13">
                    <el-slider
                      v-model="value.workflow.approval[0].rate"
                      class="rate-slider"
                      style="width: 90%"
                    >
                    </el-slider>
                  </el-col>
                  <el-col :span="11" style="text-align: right">
                    <el-input
                      size="mini"
                      v-model.number="value.workflow.approval[0].rate"
                      style="width: 52px"
                    ></el-input>
                    <span style="color: #666; padding-left: 6px"> %</span>
                  </el-col>
                </el-row>
              </el-form-item>
            </div>
          </div>
          <div class="split-title">参数</div>
          <div class="params">
            <div
              class="param-item flex-row"
              v-for="(param, index) in value.workflow.params"
              :key="index"
            >
              <el-input
                v-model="param.field"
                placeholder="请输入参数名"
              ></el-input>
              <span style="width: 10px"></span>
              <el-input
                v-model="param.value"
                placeholder="请输入参数值"
              ></el-input>
              <div
                class="close-btn"
                @click="value.workflow.params.splice(index, 1)"
              >
                <i class="el-icon-remove-outline" />
              </div>
            </div>
          </div>
          <div class="add-btn" @click="addParam">
            <i class="el-icon-plus"></i> 添加参数
          </div>
        </div>
      </div>
    </el-form>
    <flowMaping
      :subProcessKey="value.workflow.subProcess"
      :nodeData="value"
      @closeFlowMapping="showMapping = false"
      v-if="showMapping"
    />
  </div>
</template>
<script>
import service from "../../common/service";
import flowMaping from "../mdc/flowMaping";
import { getUrlParams } from "../../utils/tools";
export default {
  name: "props",
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      loading: false,
      groups: [],
      users: [],
      subProcessList: [],
      isMdc: getUrlParams("sourceCode") === "mdc",
      showMapping: false,
    };
  },
  components: { flowMaping },
  watch: {
    value(data) {
      this.initApproval(data);
    },
  },
  created() {
    this.loadUserGroups();
    this.loadUsers();
  },
  methods: {
    initApproval(data) {
      if (data.compType === "task" && data.icon === "task") {
        if (!data.workflow.approval) {
          this.$set(this.value.workflow, "approval", [
            {
              type: "user",
              value: [],
              rate: 100,
            },
          ]);
        }
      }
    },
    loadUserGroups() {
      if (!this.groups.length) {
        service.queryUserGroups().then(({ data }) => {
          this.groups = data.list.map((d) => {
            return { value: d.userGroupCode, label: d.userGroupName };
          });
        });
      }
    },
    loadUsers() {
      if (!this.users.length) {
        service
          .queryUsers({
            pageNum: 1,
            pageSize: 1000,
            queryPage: "1",
            status: "6",
          })
          .then(({ data }) => {
            this.users = data.list;
          });
      }
    },
    loadSubProcess(text = "") {
      if (!this.isMdc) {
        service
          .getFlowTemplateList({
            pageNum: 1,
            pageSize: 300,
            name: text,
          })
          .then(({ data }) => {
            this.subProcessList = data.list || [];
          });
      } else {
        service
          .getMdcFlowTemplateList({
            pageNum: 1,
            pageSize: 200,
            templateName: text,
          })
          .then(({ data }) => {
            this.subProcessList = data.list.map((item) => {
              return {
                key: item.processKey,
                name: item.templateName,
                updatedBy: item.updatedBy,
              };
            });
          });
      }
    },
    subProcessVisible(bool) {
      if (bool && !this.subProcessList.length) {
        this.loadSubProcess();
      }
    },
    addParam() {
      if (!this.value.workflow.params) {
        this.$set(this.value.workflow, "params", []);
      }
      this.value.workflow.params.push({
        field: "",
        value: "",
      });
    },
    changeApproval() {
      this.$set(this.value.workflow.approval[0], "value", []);
    },
    subflowChange(val) {
      if (this.isMdc) {
        this.$set(this.value.workflow, "subFieldMaping", "");
        if (val) {
          this.showMapping = true;
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.split-title {
  line-height: 46px;
  border-top: 1px solid #f0f0f0;
  padding: 0 10px;
  font-size: 14px;
  font-weight: bold;
  color: #666;
}
.padding {
  padding: 0 10px;
}
.switch-label {
  font-size: 14px;
  color: #666;
  margin-right: 10px;
  font-weight: normal;
}
.el-form-item--small.el-form-item {
  margin-bottom: 13px !important;
}
.add-btn {
  margin: 0 10px 20px 10px;
  height: 24px;
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  line-height: 24px;
  text-align: center;
  font-size: 12px;
  color: #666;
  &:hover {
    color: #00aa91;
    border: 1px dashed #00aa91;
  }
}
.params {
  padding: 0 10px;
  .param-item {
    margin-bottom: 10px;
  }
  .close-btn {
    padding-left: 10px;
    line-height: 28px;
    cursor: pointer;
    i {
      color: red;
    }
  }
}
.option-label {
  font-size: 12px;
  color: #666;
  font-weight: normal;
  float: left;
}
.option-remark {
  font-size: 12px;
  color: #999;
  float: right;
  margin-right: 5px;
  font-weight: normal;
}
</style>
<style lang="scss">
.dis-input input {
  color: #666 !important;
}
.props-editor {
  .el-form-item.el-form-item--mini {
    margin-bottom: 10px;
  }
  .el-switch {
    zoom: 0.8;
    width: 36px;
  }
  .el-form-item__label {
    color: #666666 !important;
  }
  .rate-slider {
    .el-slider__runway {
      height: 4px;
      .el-slider__bar {
        height: 4px;
      }
    }
    .el-slider__button {
      width: 12px !important;
      height: 12px !important;
    }
  }
}
.myoptions {
  width: 220px;
  &.flow {
    width: 250px;
  }
  .el-scrollbar {
    padding: 10px 0;
  }
  .el-select-dropdown__item {
    &::after {
      right: 5px !important;
    }
    &.selected {
      background: #e7f9f5 !important ;
    }
  }
}
</style>