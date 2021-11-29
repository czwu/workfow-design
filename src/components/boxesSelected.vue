<template>
  <g v-if="boxesSelectedInfo && boxesSelectedInfo.start && boxesSelectedInfo.end">
    <polygon
      :points="points"
      :style="style"
    ></polygon>
  </g>
</template>

<script>
import eventBus, {EVENTS} from "../common/eventBus";
export default {
  props: ['boxesSelectedInfo'],
  computed: {
    points() {
      let points = ''
      if (this.boxesSelectedInfo && this.boxesSelectedInfo.start && this.boxesSelectedInfo.end) {
        points = `${this.boxesSelectedInfo.start.x},${this.boxesSelectedInfo.start.y} ${this.boxesSelectedInfo.end.x},${this.boxesSelectedInfo.start.y} ${this.boxesSelectedInfo.end.x},${this.boxesSelectedInfo.end.y} ${this.boxesSelectedInfo.start.x},${this.boxesSelectedInfo.end.y} `
      }
      return points
    },
    style() {
      let style = ''
      if (this.boxesSelectedInfo) {
        if (this.boxesSelectedInfo.status === 1) {
          style = `stroke:#66b1ff;stroke-width:1;shape-rendering:crispEdges;fill:rgba(64,158,255,0.3)`
        } else if (this.boxesSelectedInfo.status === 2) {
          style = `stroke:#66b1ff;stroke-width:1;shape-rendering:crispEdges;fill:none;stroke-dasharray:2;`
        }
      }
      return style
    }
  },
  created() {
    // 全局监听事件
    // 框选完成事件
    eventBus.$on(EVENTS.GRAPH_BOXESSELECTED, (metadata) => {
      this.handleBoxes(metadata)
    })
  },
  methods: {
    // 处理框选选中的节点和线
    handleBoxes(metadata) {
      if (this.boxesSelectedInfo) {
        this.boxesSelectedInfo.status = 2
      }
      if (this.boxesSelectedInfo.start && this.boxesSelectedInfo.end) {
        const box = { ...this.calculateBox() }
        let pointArray = []
        metadata.nodes.forEach(node => {
          pointArray = [
            [node.x, node.y],
            [Math.floor(node.x + node.w), node.y],
            [Math.floor(node.x + node.w), Math.floor(node.y + node.h)],
            [node.x, Math.floor(node.y + node.h)]
          ]
          if (pointArray.every(item => item[0] > box.x && item[0] < box.xw && item[1] > box.y && item[1] < box.yh)) {
            node.selected = true
          }
        })
        const selectedNodes = metadata.nodes.filter(node => node.selected)
        metadata.edges.forEach(edge => {
          pointArray = edge.d.split(' ').filter(item => item.includes(',')).map(item => item.split(',')).map(item => [Math.floor(Number(item[0])), Math.floor(Number(item[1]))])
          if (pointArray.every(item => item[0] > box.x && item[0] < box.xw && item[1] > box.y && item[1] < box.yh)) {
            if (selectedNodes.length > 0) {
              if (selectedNodes.filter(node => node.id === edge.source).length > 0 && selectedNodes.filter(node => node.id === edge.target).length > 0) {
                edge.selected = true
              }
            } else {
              edge.selected = true
            }
          }
        })
        if (selectedNodes.length > 1) {
          pointArray = []
          selectedNodes.forEach(node => {
            pointArray = pointArray.concat([
              [node.x, node.y],
              [Math.floor(node.x + node.w), node.y],
              [Math.floor(node.x + node.w), Math.floor(node.y + node.h)],
              [node.x, Math.floor(node.y + node.h)]
            ])
          })
          metadata.edges.filter(edge => edge.selected).forEach(edge => {
            pointArray = pointArray.concat(edge.d.split(' ').filter(item => item.includes(',')).map(item => item.split(',')).map(item => [Math.floor(Number(item[0])), Math.floor(Number(item[1]))]))
          })
          const start = { x: Infinity, y: Infinity }
          const end = { x: -Infinity, y: -Infinity }
          pointArray.forEach(item => {
            if (item[0] < start.x) {
              start.x = item[0]
            }
            if (item[1] < start.y) {
              start.y = item[1]
            }
            if (item[0] > end.x) {
              end.x = item[0]
            }
            if (item[1] > end.y) {
              end.y = item[1]
            }
          })
          this.boxesSelectedInfo.start.x = start.x
          this.boxesSelectedInfo.start.y = start.y
          this.boxesSelectedInfo.end.x = end.x
          this.boxesSelectedInfo.end.y = end.y
          this.calculateBox()
        } else {
          this.boxesSelectedInfo.end = null
        }
      }
    },
    // 计算盒子
    calculateBox() {
      const box = {
        x: null,
        y: null,
        w: Math.floor(Math.abs(this.boxesSelectedInfo.end.x - this.boxesSelectedInfo.start.x)),
        h: Math.floor(Math.abs(this.boxesSelectedInfo.end.y - this.boxesSelectedInfo.start.y)),
        xw: null,
        yh: null
      }
      if (this.boxesSelectedInfo.start.x < this.boxesSelectedInfo.end.x && this.boxesSelectedInfo.start.y < this.boxesSelectedInfo.end.y) {
        box.x = this.boxesSelectedInfo.start.x
        box.y = this.boxesSelectedInfo.start.y
      } else if (this.boxesSelectedInfo.start.x < this.boxesSelectedInfo.end.x && this.boxesSelectedInfo.start.y > this.boxesSelectedInfo.end.y) {
        box.x = this.boxesSelectedInfo.start.x
        box.y = this.boxesSelectedInfo.end.y
      } else if (this.boxesSelectedInfo.start.x > this.boxesSelectedInfo.end.x && this.boxesSelectedInfo.start.y > this.boxesSelectedInfo.end.y) {
        box.x = this.boxesSelectedInfo.end.x
        box.y = this.boxesSelectedInfo.end.y
      } else if (this.boxesSelectedInfo.start.x > this.boxesSelectedInfo.end.x && this.boxesSelectedInfo.start.y < this.boxesSelectedInfo.end.y) {
        box.x = this.boxesSelectedInfo.end.x
        box.y = this.boxesSelectedInfo.start.y
      }
      box.xw = box.x + box.w
      box.yh = box.y + box.h
      this.boxesSelectedInfo.box = { ...box }
      return box
    }
  }
}
</script>
