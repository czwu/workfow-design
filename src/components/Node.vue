<template>
  <div class="node"  @mousedown="add($event, nodeItem)" @mouseup="clearNode($event, nodeItem)">
    <img draggable="false" :src="icon[nodeItem.icon]" />
    <div class="text">{{ nodeItem.label }}</div>
  </div>
</template>

<script>
import { icon } from "./icon/index.js";
import eventBus, { EVENTS } from "@/common/eventBus";
export default {
  name: "Node",
  props: ["nodeItem"],
  data() {
    return {
      icon,
    };
  },
  methods: {
    /**
     * 左区节点鼠标按下事件
     * @argument {DragEvent} event - 鼠标事件
     * @argument {NodeItem} item - 节点数据
     */
    add(event, item) {
      eventBus.$emit(EVENTS.GRAPH_LEFT_NODE_MOUSEDOWN, item);
    },

    /**
     * 左区节点鼠标松开事件
     * @argument {DragEvent} event - 鼠标事件
     */
    clearNode(event, item) {
      eventBus.$emit(EVENTS.GRAPH_LEFT_NODE_MOUSEUP, item);
    },
  },
};
</script>

<style lang="scss" scoped>
.node {
  cursor: grab;
  display: flex;
  flex-flow: column;
  user-select: none;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  img {
    width: 22px;
    height: 22px;
    cursor: move;
    border: 1px dashed #fff;
    &:hover {
      border: 1px dashed #666;
    }
  }
  .text {
    font-size: 12px;
    line-height: 24px;
    color: #4a4a4a;
  }
}
</style>
