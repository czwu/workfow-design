<template>
  <g v-if="node">
    <rect
      :x="node.x"
      :y="node.y"
      :width="node.w"
      :height="node.h"
      class="virtual-rect"
    ></rect>
  </g>
</template>

<script>
export default {
  props: ['node'],
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.virtual-rect {
  fill: #D9F3EF;
  stroke: #00AA91;
  stroke-width: 1;
  stroke-dasharray: 2;
  shape-rendering: crispEdges;
  border-radius: 4px;
}
</style>
