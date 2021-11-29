<template>
  <div class="toolbar-layout flex-row">
    <!-- mdc只要保存并发布 -->
    <el-tooltip v-if="params.readonly!='readonly'&&params.sourceCode!='mdc'" effect="dark" content="保存" placement="top">
      <span class="tool-item el-icon-collection" @click="save(1)"></span>
    </el-tooltip>
    <el-tooltip v-if="params.readonly!='readonly'" effect="dark" content="保存并发布" placement="top">
      <span class="tool-item el-icon-suitcase-1" @click="save(2)"></span>
    </el-tooltip>
    <el-tooltip effect="dark" content="放大" placement="top">
      <span class="tool-item el-icon-zoom-in" @click="scale(1)"></span>
    </el-tooltip>
    <el-tooltip effect="dark" content="还原" placement="top">
      <span class="tool-item el-icon-refresh-left" @click="scale(3)"></span>
    </el-tooltip>
    <el-tooltip effect="dark" content="缩小" placement="top">
      <span class="tool-item el-icon-zoom-out" @click="scale(2)"></span>
    </el-tooltip>
    <el-tooltip effect="dark" content="导出XML" placement="top">
      <span class="tool-item el-icon-download" @click="downloadXml"></span>
    </el-tooltip>
    <el-tooltip effect="dark" content="保存为svg图片" placement="top">
      <span class="tool-item el-icon-picture" @click="saveAsImg('svg')"></span>
    </el-tooltip>
    <el-tooltip effect="dark" content="保存为png图片" placement="top">
      <span class="tool-item el-icon-picture-outline" @click="saveAsImg('png')"></span>
    </el-tooltip>

    <span class="tool-item text-item" @click="openMonaco('xml')">XML</span>
    <span class="tool-item text-item" @click="openMonaco('json')">元数据</span>
    <monaco :visible.sync="showMonaco" :type="codeType" size="100%"></monaco>
    <saveimg></saveimg>
  </div>
</template>

<script>
import eventBus, { EVENTS } from "../common/eventBus";
import metadata from "../common/metadata";
import service from "../common/service";
import { compile } from "../plugin/xml";
import { message } from "../utils/message";
import monaco from "./monaco";
import saveimg from "@/components/saveImg.vue";
import { getUrlParams } from "@/utils/tools";
// import { toolbar } from "../common/config";
export default {
  name: "Toolbar",
  data() {
    return {
      activeTab: "design",
      showMonaco: false,
      codeType: "xml",
      size: 1,
      params: {}
    };
  },
  mounted() {
    this.params = getUrlParams();
    const that = this
    this.$nextTick(() => {
      window.addEventListener('message', function (e) {
        that.handleDataTransmission(e.data)
      }, false)
    })
  },
  components: { monaco, saveimg },
  methods: {
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
    downloadXml() {
      eventBus.$emit(EVENTS.TO_EXPORT_XML);
    },
    openMonaco(type) {
      this.codeType = type;
      this.showMonaco = true;
    },
    saveAsImg(type) {
      eventBus.$emit(EVENTS.TO_EXPORT_SVG, type);
    },
    // type 1保存2保存并发布
    async save(type, action) {
      let data = metadata.getData();
      this.params = getUrlParams();
      if (!this.checkWorkflow(data)) {
        this.handleDataTransmissionOut({sourceCode: this.params.sourceCode, action: 'saveFalse'});
        return false;
      }
      // 保存
      const option = {
        modelId: data.modelId,
        id: data.workflow.id,
        name: data.workflow.name,
        sourceCode: this.params.sourceCode,
        xml: compile.compile(),
      }
      const res = await service.save(option)
      if (type === 1) {
        message.success("保存成功");
      } else if (type === 2) {
        // 发布
        const res2 = await service.deploy(res.data.modelId, data.workflow.name)
        message.success("保存并发布成功");
        if (this.params.sourceCode === 'mdc' && this.params.templateId) {
          const res3 = await service.mdcTemplateUpdate(this.params.templateId)
        }
        if (action === 'closeIframe') {
          this.handleDataTransmissionOut({sourceCode: this.params.sourceCode, action: 'closeIframe', id: data.workflow.id, modelId: data.modelId, name: data.workflow.name});
        } else {
          this.handleDataTransmissionOut({sourceCode: this.params.sourceCode, action: 'saveOk', id: data.workflow.id, modelId: data.modelId, name: data.workflow.name});
        }
      }
      if (!data.modelId) {
        if (this.params.sourceCode === 'mdc' && this.params.templateId) {
          location.href = "index.html?modelId=" + res.data.modelId + "&sourceCode=" + this.params.sourceCode + '&templateId=' + this.params.templateId;
        } else {
          location.href = "index.html?modelId=" + res.data.modelId + "&sourceCode=" + this.params.sourceCode;
        }
      }
    },
    // 工作流与具体业务交流（传入）
    handleDataTransmission(data) {
      try {
        const dataJson = JSON.parse(data)
        if (dataJson && dataJson.sourceCode === 'mdc') {
          if (dataJson.action === 'save') {
            this.save(2, 'closeIframe')
          }
        }
      } catch (error) {
      }
    },
    // 工作流与具体业务交流（传出）
    handleDataTransmissionOut(data) {
      window.top.postMessage(JSON.stringify(data), '*');
    },
    // 判断流程是否符合标准
    checkWorkflow(data) {
      let flag = true;
      if (!data.workflow.name) {
        flag = false;
        message.error('请输入配置信息里的流程名称！')
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
    // 判断是否任务节点是否有处理人
    checkTaskNodeApproval(data) {
      let flag = true;
      data.nodes.some((node) => {
        if (node.compType === 'task' && !node.workflow.isStartTask && (!node.workflow.approval || node.workflow.approval.length === 0 || node.workflow.approval.every(item => !item.value || item.value.length === 0))) {
          flag = false
          message.error(`“${node.label}”：请为该节点配置处理人` )
          return true
        } else {
          return false
        }
      })
      return flag
    },
    // 判断是否有且只有一个开始节点
    checkStartNode(data) {
      let flag = true;
      const array = data.nodes.filter(node => node.compType === 'startEvent')
      if (array.length !== 1) {
        flag = false
        message.error(`流程必需有且只有一个开始节点` )
      }
      return flag;
    },
    // 判断是否有且只有一个结束结点
    checkEndNode(data) {
      let flag = true;
      const array = data.nodes.filter(node => node.compType === 'endEvent')
      if (array.length !== 1) {
        flag = false
        message.error(`流程必需有且只有一个结束节点` )
      }
      return flag;
    },
    // 判断节点线条
    checkNodeLine(data) {
      let flag = true;
      data.nodes.some((node) => {
        const outLines = data.edges.filter(edge => edge.source === node.id)
        const inLines = data.edges.filter(edge => edge.target === node.id)
        if (node.compType === 'startEvent') {
          if (outLines.length === 0) {
            message.error(`开始节点没有连线到下一节点` )
            flag = false
            return true
          } else {
            return false
          }
        } else if (node.compType === 'endEvent') {
          if (inLines.length === 0) {
            message.error(`没有连线进入到结束节点` )
            flag = false
            return true
          } else {
            return false
          }
        } else {
          if (outLines.length > 0 && inLines.length > 0) {
            return false
          } else {
            message.error(`“${node.label}”：节点要有入线和出线` )
            flag = false
            return true
          }
        }
      })
      return flag
    }
  },
};
</script>
<style lang="scss" scoped>
.tool-item {
  padding: 10px;
  margin: 3px 0 3px 5px;
  cursor: pointer;
  background: aliceblue;
  &.text-item {
    font-size: 12px;
  }
}
</style>