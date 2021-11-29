<template>
  <g
    v-if="node"
    class="node-container"
    :class="{ selected: node.selected }"
    :transform="'translate(' + node.x + ',' + node.y + ')'"
    draggable
    @mousedown="nodemousedown($event, node)"
  >
    <rect
      class="node"
      :class="{ selected: node.selected }"
      :width="node.w"
      :height="node.h"
      :rx="node.icon == 'task1' ? 6 : 0"
      :ry="node.icon == 'task1' ? 6 : 0"
      :style="getStyle(node)"
      v-if="node.compType !== 'gateway'"
      @mouseup="endLinkedNode('top', node)"
      @dblclick="showEditor"
      @contextmenu.stop="showMenu"
    >
    </rect>
    <polygon
      v-if="node.compType === 'gateway'"
      points="0 32,32 0,64 32, 32 64 "
      :style="getStyle(node)"
      :class="{ selected: node.selected }"
    ></polygon>
    <image
      @contextmenu.stop="showMenu"
      x="15"
      y="14"
      @mouseup="endLinkedNode('top', node)"
      v-if="node.compType === 'gateway'"
      :width="34"
      :height="34"
      :xlink:href="icon.gateway2"
    ></image>
    <image
      x="0"
      y="0"
      v-if="node.w == 32"
      :width="node.w"
      :height="node.h"
      :xlink:href="icon[node.icon]"
      @mouseup="endLinkedNode('top', node)"
      @contextmenu.stop="showMenu"
    ></image>
    <mytext
      v-if="node.compType === 'task'"
      :x="6"
      :y="8"
      :w="node.w - 12"
      :h="node.h - 12"
      :desc="node.label"
    ></mytext>

    <mytext
      v-if="taskAssignee"
      :x="0"
      :y="node.h"
      :w="node.w"
      verticalAlign="top"
      textAlign="center"
      :desc="taskAssignee"
    ></mytext>

    <g v-if="!readonly">
      <circle class="dot" :cx="node.w / 2" cy="0" r="2" />
      <circle class="dot" :cx="node.w" :cy="node.h / 2" r="2" />
      <circle class="dot" :cx="node.w / 2" :cy="node.h" r="2" />
      <circle class="dot" cx="0" :cy="node.h / 2" r="2" />
      <circle
        class="dot-area"
        :cx="node.w / 2"
        cy="0"
        r="6"
        fill="transparent"
        @mousedown="startLinkNode($event, 'top')"
        @mouseup="endLinkedNode('top', node)"
      />

      <circle
        class="dot-area"
        :cx="node.w"
        :cy="node.h / 2"
        r="6"
        fill="transparent"
        @mousedown="startLinkNode($event, 'right')"
        @mouseup="endLinkedNode('right', node)"
      />
      <circle
        class="dot-area"
        :cx="node.w / 2"
        :cy="node.h"
        r="6"
        fill="transparent"
        @mousedown="startLinkNode($event, 'bottom')"
        @mouseup="endLinkedNode('bottom', node)"
      />
      <circle
        class="dot-area"
        cx="0"
        :cy="node.h / 2"
        r="6"
        fill="transparent"
        @mousedown="startLinkNode($event, 'left')"
        @mouseup="endLinkedNode('left', node)"
      />
    </g>
  </g>
</template>

<script>
import mytext from "./svgtext.vue";
import { icon } from "./icon/index.js";
import eventBus, { EVENTS } from "../common/eventBus";
import { getUrlParams } from "@/utils/tools";
export default {
  components: { mytext },
  props: ["node", "dotLink", "readonly"],
  data() {
    return {
      icon,
      isCanceledWorkflow: false,
      isFinishTask: false,
      isWaitTask: false,
      taskAssignee: "",
      params: {},
    };
  },
  computed: {
    topPolygonPoints() {
      if (this.node) {
        return `0,0 ${this.node.w},0 ${this.node.w / 2},${this.node.h / 2}`;
      } else {
        return "";
      }
    },
    rightPolygonPoints() {
      if (this.node) {
        return `${this.node.w},0 ${this.node.w},${this.node.h} ${
          this.node.w / 2
        },${this.node.h / 2}`;
      } else {
        return "";
      }
    },
    bottomPolygonPoints() {
      if (this.node) {
        return `${this.node.w},${this.node.h} 0,${this.node.h} ${
          this.node.w / 2
        },${this.node.h / 2}`;
      } else {
        return "";
      }
    },
    leftPolygonPoints() {
      if (this.node) {
        return `0,0 0,${this.node.h} ${this.node.w / 2},${this.node.h / 2}`;
      } else {
        return "";
      }
    },
    wrapDotPoints() {
      if (this.node) {
        return `-30,-30 ${this.node.w + 30},-30 ${this.node.w + 30},${
          this.node.h + 30
        } -30,${this.node.h + 30}`;
      } else {
        return "";
      }
    },
  },
  created() {
    this.params = getUrlParams();
    if (this.params.mode === "preview" && this.params.status === "delete") {
      this.isCanceledWorkflow = true;
    }
  },
  methods: {
    /**
     * 画布中间操作区节点鼠标按下事件
     * @argument {NodeClass} node - 节点
     */
    nodemousedown($event, node) {
      if (this.readonly) {
        return;
      }
      eventBus.$emit(EVENTS.GRAPH_NODE_MOUSEDOWN, node);
    },

    /**
     * 开始连接节点
     * @description 连线起始函数
     * @argument {string} position - 连线起点位置
     */
    startLinkNode($event, position) {
      this.$emit("startLinkNode", position);
    },

    /**
     * 节点完成连接
     * @description 连线终止函数
     * @argument {string} position - 连线终点位置
     * @argument {NodeClass} node - 终止节点
     */
    endLinkedNode(position, node) {
      // 因为 连接点为水平方向与纵向时目前为直线，先写死完成节点，后期优化
      if (
        (this.dotLink === "top" || this.dotLink === "bottom") &&
        (position === "left" || position === "right")
      ) {
        position = this.dotLink === "top" ? "bottom" : "top";
      } else if (
        (this.dotLink === "left" || this.dotLink === "right") &&
        (position === "top" || position === "bottom")
      ) {
        position = this.dotLink === "left" ? "right" : "left";
      }

      this.$emit("endLinkedNode", position, node);
    },
    getStyle(node) {
      let style = { "stroke-width": 1 };
      if (node.compType == "task" || node.compType == "gateway") {
        style.stroke = node.selected ? "#00AA91" : "#999999";
        style.fill = node.selected ? "#F2FBF9" : "white";
      }
      return style;
    },
    getGatewayPoint(node) {
      const leftNodeX = Math.floor(node.y + node.h / 2);
      const leftNodeY = Math.floor(node.y + node.h / 2);
      const topNodeX = Math.floor(node.x + node.w / 2);
      return `${node.x} ${leftNodeY}, ${topNodeX} ${node.y}, ${
        node.x + node.w
      } ${leftNodeY}, ${topNodeX} ${node.y + node.h}`;
    },
    showMenu() {
      self.event.returnValue = false;
      eventBus.$emit(EVENTS.SHOW_MENU, this.node);
    },
    showEditor() {
      eventBus.$emit(EVENTS.SHOW_EDITOR, this.node);
    },
  },
};
</script>

<style lang="scss" scoped>
g.node-container {
  user-select: none;
  cursor: move;
  .node {
    fill: transparent;
    stroke-width: 1px;
    stroke: transparent;
    cursor: drop;
    transition: all 0.2s ease-in-out;
    // stroke-dasharray: 2;
    // shape-rendering: crispEdges;
  }
  &:hover {
    .dot {
      opacity: 1;
    }
  }
  &.selected {
    .dot {
      stroke: #00aa91 !important;
      stroke-width: 1;
      opacity: 1;
    }
  }
  &.readonly {
    cursor: no-drop;
    .node {
      stroke: transparent;
    }
  }
  &.disabled {
    cursor: no-drop;
    opacity: 0.5;
    .node {
      stroke: transparent;
    }
  }

  .dot {
    stroke: #979797;
    stroke-width: 1;
    fill: white;
    opacity: 0;
  }
  .dot-area {
    &:hover {
      stroke: #00aa91 !important;
      stroke-width: 1;
      opacity: 1;
      fill: white;
      cursor: crosshair !important;
    }
  }
  .triangle {
    fill: transparent;
  }
}
</style>
