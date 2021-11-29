<template>
  <div class="view-node" :style="styleObj" :class="cssName">
    <div class="status">
      {{ status }}
    </div>
    <div class="title flex-row">
      <el-tooltip
        class="item"
        effect="dark"
        :content="node.label"
        placement="top"
        v-if="node.label.length > 8"
      >
        <span class="label"> {{ node.label }}</span>
      </el-tooltip>
      <span class="label" v-else> {{ node.label }}</span>
      <span class="subflow" v-if="node.workflow.subProcess" @click="showSubFlow"></span>
    </div>
    <div class="content">
      <div class="handler-title">处理人</div>
      <div class="handler flex-row">
        <div class="handler-item flex-row" v-if="handler.length === 1">
          <img :src="picPath" alt="" width="14px" height="14px" />
          <span class="flex-grow"> {{ handler[0] }}</span>
          <span class="handler-status"> {{ statusText }} </span>
        </div>
        <span class="no-handler" v-if="!handler.length"> 待定 </span>
      </div>
    </div>
  </div>
</template>

<script>
import { icon } from "@/components/icon/index.js";
import eventBus, { EVENTS } from "../../common/eventBus";
export default {
  name: "ViewNode",
  components: {},
  props: ["progress", "node"],
  data() {
    return {
      styleObj: {
        left: this.node.x + "px",
        top: this.node.y + "px",
      },
      cssName: "",
      status: "",
      iconPath: "",
      handler: [],
      icon: icon,
      picPath: icon.pic,
    };
  },
  created() {

    if (this.progress.finishTasks.includes(this.node.id)) {
      this.cssName = "done";
      this.status = "已处理";
      this.statusText = "已处理";
    } else if (this.progress.waitTasks.includes(this.node.id)) {
      this.cssName = "doing";
      this.status = "处理中";
      this.statusText = "待处理";
    } else {
      this.status = "待处理";
      this.cssName = "undo";
      this.statusText = "待处理";
    }
    const handlerMap = JSON.parse(this.progress.taskAssigneeMap);
    const str = handlerMap[this.node.id];
    if (str) {
      this.handler = str.split(",");
    } else {
      this.handler = [];
    }
  },
  computed: {},
  methods: {
    showSubFlow(){
      eventBus.$emit(EVENTS.SHOW_SUBFLOW)
    }
  },
};
</script>

<style lang="scss" scoped>
.view-node {
  position: absolute;
  width: 120px;
  height: 64px;
  z-index: 100;
  border-radius: 2px;
  .status {
    position: absolute;
    top: -20px;
    left: 0px;
    padding-left: 15px;
    font-size: 10px;
    zoom: 0.9;
  }
  .title {
    line-height: 25px;
    font-size: 12px;
    padding-left: 5px;
    .label {
      display: inline-block;
      width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .subflow {
      display: inline-block;
      width: 18px;
      background: url("../../components/icon/subflow.png") no-repeat;
      background-position: center center;
      background-size: 15px 15px;
      cursor: pointer;
      &:hover {
        background: url("../../components/icon/subflow-hover.png") no-repeat;
        background-position: center center;
        background-size: 14px 14px;
      }
    }
  }
  &.undo {
    color: #999999;
    background: linear-gradient(180deg, #f9f8f8 0%, #eaeaea 100%);
    border: 1px solid #d9d9d9;
    .title {
      border-bottom: 1px solid #d9d9d9;
    }
    .status {
      background: url("../../components/icon/status_undo.png") no-repeat;
      background-position: 2px center;
      background-size: 12px 12px;
    }
  }
  &.done {
    color: #00aa91;
    background: linear-gradient(180deg, #f1fffd 0%, #d9f3ef 100%);
    border: 1px solid #b2e5de;
    .title {
      border-bottom: 1px solid #b2e5de;
    }
    .status {
      background: url("../../components/icon/status_done.png") no-repeat;
      background-position: 2px center;
      background-size: 12px 12px;
    }
    .handler-status {
      zoom: 0.8 !important;
      background: #b2e5de;
      font-size: 11px;
      padding: 1px 5px !important;
      text-align: center;
      border-radius: 9px;
      color: #00aa91;
    }
  }
  &.doing {
    color: #0071ff;
    background: linear-gradient(180deg, #e7f2ff 0%, #b3d5ff 100%);
    border: 1px solid #65a9fe;
    .title {
      border-bottom: 1px solid #65a9fe;
    }
    .status {
      background: url("../../components/icon/status_pending.png") no-repeat;
      background-position: 2px center;
      background-size: 12px 12px;
    }
  }
  &.jump {
    background: linear-gradient(180deg, #fff5f5 0%, #ffd5d5 100%);
    border: 1px solid #ff9f9f;
    .status {
      background: url("../../components/icon/status_jump.png") no-repeat;
      background-position: 2px center;
      background-size: 12px 12px;
    }
  }
  .handler-title {
    font-size: 10px;
    padding: 5px 6px;
    zoom: 0.8;
  }
  .handler {
    height: 16px;
  }
  .handler-item {
    padding: 0 5px;
    width: 100%;
    font-size: 10px;
    span {
      padding-left: 5px;
      zoom: 0.9;
    }
  }
  .no-handler {
    font-size: 11px;
    color: #999;
    min-width: 32px;
    zoom: 0.8;
    padding: 0 5px;
    margin-left: 5px;
    background: #e3e3e3;
    text-align: center;
    border-radius: 9px;
  }
  .handler-status {
    zoom: 0.8 !important;
    background: #e3e3e3;
    font-size: 11px;
    padding: 1px 5px !important;
    text-align: center;
    border-radius: 9px;
    color: #999;
  }
}
</style>
