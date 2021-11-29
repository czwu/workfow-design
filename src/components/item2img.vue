<template>
  <g
    v-if="node"
    class="node-container"
    :class="{ selected: node.selected }"
    :transform="'translate(' + node.x + ',' + node.y + ')'"
  >
    <rect
      class="node"
      :class="{ selected: node.selected }"
      :width="node.w"
      :height="node.h"
      style="fill: transparent"
      :rx="node.icon == 'task1' ? 6 : 0"
      :ry="node.icon == 'task1' ? 6 : 0"
      :style="getStyle(node)"
      v-if="node.compType !== 'gateway'"
    >
    </rect>
    <polygon
      v-if="node.compType === 'gateway'"
      points="0 32,32 0,64 32, 32 64 "
      :style="getStyle(node)"
      :class="{ selected: node.selected }"
    ></polygon>
    <image
      x="15"
      y="14"
      v-if="node.compType === 'gateway'"
      :width="34"
      :height="34"
      :href="icon.gateway2"
    ></image>
    <image
      x="0"
      y="0"
      v-if="node.w == 32"
      :width="node.w"
      :height="node.h"
      :href="icon[node.icon]"
    ></image>
    <mytext
      v-if="node.compType === 'task'"
      :x="6"
      :y="8"
      :w="node.w - 12"
      :h="node.h - 12"
      :desc="node.label"
    ></mytext>
  </g>
</template>

<script>
import mytext from "./svgtext.vue";
import { icon } from "./icon/index.js";
export default {
  components: { mytext },
  props: ["node"],
  data() {
    return {
      icon,
    };
  },

  created() {},
  methods: {
    getStyle(node) {
      let style = { "stroke-width": 1 };
      if (node.compType == "task" || node.compType == "gateway") {
        style.stroke = node.selected ? "#00AA91" : "#999999";
        style.fill = node.selected ? "#F2FBF9" : "white";
      }
      return style;
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
