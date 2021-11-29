<template>
  <g v-if="lineList.length > 0">
    <line v-for="(item, index) in lineList" :key="index" :x1="item.x1" :y1="item.y1" :x2="item.x2" :y2="item.y2" style="stroke:#66b1ff;stroke-width:1;shape-rendering:crispEdges;"></line>
  </g>
</template>

<script>
export default {
  props: ['node', 'metadata'],
  computed: {
    lineList() {
      const lineList = []
      if (this.node && this.metadata && this.metadata.nodes && this.metadata.nodes.length > 0) {
        const nodePointList = this.pointList(this.node)
        let pointArray = []
        this.metadata.nodes.forEach(item => {
          if (this.node !== item) {
            pointArray.push(...this.pointList(item))
          }
        })
        nodePointList.forEach(item => {
          pointArray.forEach(point => {
            if ((item[0] === point[0] && item[1] !== point[1]) || (item[1] === point[1] && item[0] !== point[0])) {
              lineList.push({ x1: item[0], y1: item[1], x2: point[0], y2: point[1]})
            }
          })
        })
      }
      return lineList
    }
  },
  methods: {
    pointList(node) {
      if (node.isBoxes) {
        return [
          [node.start.x, node.start.y],
          [node.end.x, node.start.y],
          [node.end.x, node.end.y],
          [node.start.x, node.end.y]
        ]
      }
      return [
        [node.linkNode.top.x, node.linkNode.top.y],
        [node.linkNode.right.x, node.linkNode.right.y],
        [node.linkNode.bottom.x, node.linkNode.bottom.y],
        [node.linkNode.left.x, node.linkNode.left.y],
        [node.linkNode.top.x, node.linkNode.right.y]
      ]
    }
  }
}
</script>
