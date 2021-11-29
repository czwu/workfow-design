<template>
  <div class="desinger flex-col flex-grow">
    <section class="flex-row page-header no-select" v-if="!readonly">
      <div class="i-tabs flex-row">
        <div
          class="tab-item"
          v-for="tab in tabs"
          :key="tab.id"
          :class="{ active: tab.active }"
          @click="tabClick(tab)"
        >
          {{ tab.label }}
        </div>
      </div>
      <div class="flex-grow"></div>
      <div class="custom-btns flex-row" v-show="!showMonaco">
        <div class="scale-btns">
          <i class="el-icon-remove" @click="scale(2)"></i>
          <span class="scale-value"> {{ scaleValue }}% </span>
          <i class="el-icon-circle-plus" @click="scale(1)"></i>
        </div>
        <el-button
          size="mini"
          icon="el-icon-refresh-left"
          class="reset-btn fix-btn"
          @click="scale(3)"
          >还原</el-button
        >
      </div>
      <div class="flex-grow"></div>
      <div class="dropdown-menu" v-show="!showMonaco">
        <el-dropdown @command="saveAsImg" trigger="click" size="medium">
          <span class="el-dropdown-link">
            保存为图片<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="svg">保存为 SVG</el-dropdown-item>
            <el-dropdown-item command="png">保存为 PNG</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="custom-btns flex-row" v-show="!showMonaco">
        <!-- <el-button type="primary" size="mini" @click="save(1)">保存</el-button> -->
        <el-button type="primary" size="mini" @click="save(2)"
          >保存并发布</el-button
        >
      </div>
    </section>
    <monaco v-show="showMonaco" :type="codeType" v-if="!readonly"></monaco>
    <section v-show="!showMonaco" class="flex-row flex-grow">
      <div class="comps-panel" v-if="!readonly">
        <div class="flex-col flex-grow">
          <node
            v-for="(item, index) in comps"
            class="node-item"
            :node-item="item"
            :key="index"
          >
          </node>
        </div>
      </div>
      <div class="graph-panel flex-col flex-grow">
        <!-- <toolbar></toolbar> -->
        <graph
          :readonly="readonly"
          @selectNode="selectNodeHandler"
          ref="graph"
        ></graph>
      </div>
      <div class="props-panel flex-col" v-if="!readonly">
        <property-panel></property-panel>
      </div>
    </section>
    <saveimg style="visibility: hidden"></saveimg>
  </div>
</template>

<script>
import { comps } from "../common/config";
import service from "../common/service";
import metadata from "../common/metadata";
import { compile } from "../plugin/xml";
import { parser } from "../plugin/xml";
import { message } from "../utils/message";
import align from "../utils/align";
import eventBus, { EVENTS } from "../common/eventBus";
import Node from "../components/Node";
import monaco from "../components/monaco";
import PropertyPanel from "../components/properties/PropertyPanel";
import Graph from "../components/Graph";
import saveimg from "@/components/saveImg.vue";
import { getUrlParams } from "../utils/tools";
import { edgeData } from "../utils/path.js";
export default {
  name: "Designer",
  components: { Node, PropertyPanel, Graph, monaco, saveimg },
  props: ["params"],
  data() {
    return {
      comps,
      readonly: false,
      size: 1,
      tabs: [
        { id: "design", label: "流程设计", active: true },
        { id: "xml", label: "查看XML", active: false },
        { id: "json", label: "查看元数据", active: false },
      ],
      showMonaco: false,
      codeType: "",
    };
  },
  created() {
    this.readonly = getUrlParams("readonly");
    let modelId = this.params.modelId;
    let modelKey = this.params.modelKey;
    if (modelId) {
      service.queryById(modelId).then(({ data }) => {
        parser.xml2Meta(data.xml);
        metadata.getData().modelId = modelId;
        this.defaultNodeSelected();
      });
    } else if (modelKey) {
      service.querymodelbykey(modelKey).then(({ data }) => {
        parser.xml2Meta(data.xml);
        metadata.getData().modelId = data.modelId;
        this.upgradeUI();
        this.defaultNodeSelected();
      });
    }
  },
  computed: {
    scaleValue() {
      return parseInt(this.size * 100);
    },
  },
  methods: {
    upgradeUI() {
      let nodes = metadata.getData().nodes;
      if (nodes.some((node) => node.h === 70)) {
        this.$confirm(
          "该流程存在旧版本的UI数据,是否将节点数据升级为新版本样式",
          "样式升级",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          nodes.forEach((node) => {
            if (node.compType === "task") {
              node.w = 120;
              node.h = 64;
            } else if (node.compType === "gateway") {
              node.w = 64;
              node.h = 64;
            }
            align.updateLinkeNode(node);
          });

          metadata.getData().edges.forEach((item) => {
            item.d = edgeData(item, metadata.getData().nodes);
          });
        });
      }
    },
    tabClick(tab) {
      this.tabs.forEach((item) => {
        item.active = tab === item;
        if (item.active) {
          if (item.id != "design") {
            this.codeType = item.id;
            this.showMonaco = true;
          } else {
            this.codeType = "";
            this.showMonaco = false;
          }
        }
      });
    },
    selectNodeHandler(node) {
      eventBus.$emit(EVENTS.NODE_SELECTED, node);
    },
    saveAsImg(type) {
      eventBus.$emit(EVENTS.TO_EXPORT_SVG, type);
    },

    // type 1保存2保存并发布
    async save(type, action) {
      let data = metadata.getData();
      this.params = getUrlParams();
      if (!this.checkWorkflow(data)) {
        this.handleDataTransmissionOut({
          sourceCode: this.params.sourceCode,
          action: "saveFalse",
        });
        return false;
      }
      // 保存
      const option = {
        modelId: data.modelId,
        id: data.workflow.id,
        name: data.workflow.name,
        sourceCode: this.params.sourceCode,
        xml: compile.compile(),
      };
      const res = await service.save(option);
      if (type === 1) {
        message.success("保存成功");
      } else if (type === 2) {
        // 发布
        const res2 = await service.deploy(res.data.modelId, data.workflow.name);
        message.success("保存并发布成功");
        if (this.params.sourceCode === "mdc" && this.params.templateId) {
          const res3 = await service.mdcTemplateUpdate(this.params.templateId);
        }
        if (action === "closeIframe") {
          this.handleDataTransmissionOut({
            sourceCode: this.params.sourceCode,
            action: "closeIframe",
            id: data.workflow.id,
            modelId: data.modelId,
            name: data.workflow.name,
          });
        } else {
          this.handleDataTransmissionOut({
            sourceCode: this.params.sourceCode,
            action: "saveOk",
            id: data.workflow.id,
            modelId: data.modelId,
            name: data.workflow.name,
          });
        }
      }
      if (!data.modelId) {
        if (this.params.sourceCode === "mdc" && this.params.templateId) {
          location.href =
            "index.html?modelId=" +
            res.data.modelId +
            "&sourceCode=" +
            this.params.sourceCode +
            "&templateId=" +
            this.params.templateId;
        } else {
          location.href =
            "index.html?modelId=" +
            res.data.modelId +
            "&sourceCode=" +
            this.params.sourceCode;
        }
      }
    },
    defaultNodeSelected() {
      const taskKey = this.params.taskKey;
      const currentNode = metadata
        .getData()
        .nodes.filter((node) => node.id === taskKey);
      if (currentNode.length === 1) {
        setTimeout(() => {
          currentNode[0].selected = true;
          this.selectNodeHandler(currentNode[0]);
        }, 100);
      }
    },
    onMouseUp(e) {
      this.$refs.graph.svgMouseUp(e);
    },
    scale(type) {
      if (type === 1) {
        if (this.size < 3) {
          this.size = +(this.size + 0.1).toFixed(1);
          eventBus.$emit(EVENTS.GRAPH_SCALE, this.size);
        }
      } else if (type === 2) {
        if (this.size > 0.1) {
          this.size = +(this.size - 0.1).toFixed(1);
          eventBus.$emit(EVENTS.GRAPH_SCALE, this.size);
        }
      } else if (type === 3) {
        this.size = 1;
        eventBus.$emit(EVENTS.GRAPH_SCALE, this.size);
      }
    },
    checkWorkflow(data) {
      let flag = true;
      if (!data.workflow.name) {
        flag = false;
        message.error("请输入配置信息里的流程名称！");
      } else if (!this.checkStartNode(data)) {
        flag = false;
      } else if (!this.checkEndNode(data)) {
        flag = false;
      } else if (!this.checkTaskNodeApproval(data)) {
        flag = false;
      } else if (!this.checkNodeLine(data)) {
        flag = false;
      }
      return flag;
    },
    // 工作流与具体业务交流（传入）
    handleDataTransmission(data) {
      try {
        const dataJson = JSON.parse(data);
        if (dataJson && dataJson.sourceCode === "mdc") {
          if (dataJson.action === "save") {
            this.save(2, "closeIframe");
          }
        }
      } catch (error) {}
    },
    // 工作流与具体业务交流（传出）
    handleDataTransmissionOut(data) {
      window.top.postMessage(JSON.stringify(data), "*");
    },
    // 判断是否任务节点是否有处理人
    checkTaskNodeApproval(data) {
      let flag = true;
      data.nodes.some((node) => {
        if (
          node.compType === "task" &&
          !node.workflow.isStartTask &&
          (!node.workflow.approval ||
            node.workflow.approval.length === 0 ||
            node.workflow.approval.every(
              (item) => !item.value || item.value.length === 0
            ))
        ) {
          flag = false;
          message.error(`“${node.label}”：请为该节点配置处理人`);
          return true;
        } else {
          return false;
        }
      });
      return flag;
    },
    // 判断是否有且只有一个开始节点
    checkStartNode(data) {
      let flag = true;
      const array = data.nodes.filter((node) => node.compType === "startEvent");
      if (array.length !== 1) {
        flag = false;
        message.error(`流程必需有且只有一个开始节点`);
      }
      return flag;
    },
    // 判断是否有且只有一个结束结点
    checkEndNode(data) {
      let flag = true;
      const array = data.nodes.filter((node) => node.compType === "endEvent");
      if (array.length !== 1) {
        flag = false;
        message.error(`流程必需有且只有一个结束节点`);
      }
      return flag;
    },
    // 判断节点线条
    checkNodeLine(data) {
      let flag = true;
      data.nodes.some((node) => {
        const outLines = data.edges.filter((edge) => edge.source === node.id);
        const inLines = data.edges.filter((edge) => edge.target === node.id);
        if (node.compType === "startEvent") {
          if (outLines.length === 0) {
            message.error(`开始节点没有连线到下一节点`);
            flag = false;
            return true;
          } else {
            return false;
          }
        } else if (node.compType === "endEvent") {
          if (inLines.length === 0) {
            message.error(`没有连线进入到结束节点`);
            flag = false;
            return true;
          } else {
            return false;
          }
        } else {
          if (outLines.length > 0 && inLines.length > 0) {
            return false;
          } else {
            message.error(`“${node.label}”：节点要有入线和出线`);
            flag = false;
            return true;
          }
        }
      });
      return flag;
    },
  },
};
</script>
<style lang="scss" scoped>
.page-header {
  height: 50px;
  padding: 0 20px;
  border-bottom: 1px solid #f0f0f0;
  .tab-item {
    line-height: 20px;
    font-size: 14px;
    color: #bfbfbf;
    padding: 14px 0 16px;
    margin-right: 32px;
    cursor: pointer;
    font-weight: bold;
    &.active {
      color: #666;
      font-size: 15px;
    }
  }
  .custom-btns {
    padding: 11px 0;
    i::before {
      color: #666;
      cursor: pointer;
      border: 1px dashed transparent;
    }
    i:hover::before {
      border: 1px dashed #666;
    }
    .scale-btns {
      border: 1px solid #dcdfe6;
      border-radius: 3px;
      height: 28px;
      line-height: 28px;
      box-sizing: border-box;
      padding: 0 10px;
      margin-right: 15px;
      .scale-value {
        font-size: 14px;
        color: #333;
        padding: 0 5px;
      }
    }
    .reset-btn {
      height: 28px;
      padding: 7px !important;
    }
  }
}
.header-title {
  font-size: 16px;
  color: #666;
  font-weight: bold;
}
.dropdown-menu {
  cursor: pointer;
  border: 1px solid #dcdfe6;
  height: 28px;
  margin: 11px;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 0 10px;
  .el-dropdown-link {
    font-size: 12px;
  }
}

.comps-panel {
  border-right: 1px solid #eee;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 68px;
  height: 100%;
  text-align: center;
  .node-item {
    height: 70px;
    margin-top: 20px;
    box-sizing: border-box;
  }
}
.props-panel {
  flex-shrink: 0;
}
</style>