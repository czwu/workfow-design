<template>
  <el-dialog
    title="正在保存图片。。。"
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    width="50%">
    <div class="wrap-img">
      <svg
        ref="saveImgSvg"
        :width="width"
        :height="height"
        xmlns="http://www.w3.org/2000/svg"
        :style="{'background': '#fff'}"
      >
        <defs>
          <marker
            id="mark-arrow"
            viewBox="0 0 11 11"
            refX="8"
            refY="6"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <path d="M1,2 L8,6 L1,10 Z" />
          </marker>
        </defs>
        <g>
          <path
            v-for="(edge, index) in metadata.edges"
            :key="index"
            :d="edge.d"
            marker-end="url(#mark-arrow)"
            style="fill: none; stroke: #000; stroke-width: 1px; stroke-linejoin: round; shape-rendering: crispEdges;"
          ></path>
        </g>
        <g class="nodes-list">
          <item
            v-for="(node, index) in metadata.nodes"
            :key="index"
            :node="node"
            :readonly="readonly"
          ></item>
          
        </g>
      </svg>
    </div>
  </el-dialog>
  
</template>

<script>
import mytext from '@/components/svgtext.vue'
import { icon } from "@/components/icon/index.js"
import metadata from "@/common/metadata"
import eventBus, {EVENTS} from "../common/eventBus"
import { saveAs } from 'file-saver'
import item from "./item2img.vue";
export default {
  components: {item  },
  data() {
    return {
      dialogVisible: false,
      icon,
      width: 5000,
      height: 5000,
      metadata: {}
    }
  },
  created() {
    const that = this
    eventBus.$on(EVENTS.TO_EXPORT_SVG, (type) => {
      this.handleSvg()
      this.dialogVisible = true
      setTimeout(() => {
        let fileName = metadata.getRootWorkflow().id + '.svg';
        let header = `<?xml version="1.0" encoding="utf-8"?>
        <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`
        let content = this.$refs['saveImgSvg'].outerHTML;
        var file = new File([header + content], fileName, { type: "image/svg+xml;charset=utf-8" });
        // 转svg图片
        if (type === 'svg') {
          saveAs(file)
          that.dialogVisible = false
        } else if (type === 'png') {
          // 转png
          var reader = new FileReader();
          reader.onload = function(e) {
            var image = new Image();
            image.src = reader.result; //base64数据 
            image.onload = function(){
              var canvas = document.createElement("canvas")
              canvas.width = image.width
              canvas.height = image.height
              canvas.getContext("2d").drawImage(image, 0, 0)
              canvas.toBlob(function(blob) {
                saveAs(blob, metadata.getRootWorkflow().id + ".png", 1)
                that.dialogVisible = false
              })
            }
          }
          reader.readAsDataURL(file)
        } else {
          that.dialogVisible = false
        }
      }, 200)
    })
  },
  methods: {
    // 画布大小优化
    handleSvg() {
      const metadataTemp = JSON.parse(JSON.stringify(metadata.getData()))
      let pointArray = []
      metadataTemp.nodes.forEach(node => {
        pointArray = pointArray.concat([
          [node.x, node.y],
          [Math.floor(node.x + node.w), node.y],
          [Math.floor(node.x + node.w), Math.floor(node.y + node.h)],
          [node.x, Math.floor(node.y + node.h)]
        ])
      })
      metadataTemp.edges.filter(edge => edge.selected).forEach(edge => {
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
      const moveX = 0 - start.x + 20
      const moveY = 0 - start.y + 20
      this.width = end.x - start.x + 20 + 20
      this.height = end.y - start.y + 20 + 20
      metadataTemp.nodes.forEach(item => {
        item.x += moveX
        item.linkNode.top.x += moveX
        item.linkNode.right.x += moveX
        item.linkNode.bottom.x += moveX
        item.linkNode.left.x += moveX
        item.y += moveY
        item.linkNode.top.y += moveY
        item.linkNode.right.y += moveY
        item.linkNode.bottom.y += moveY
        item.linkNode.left.y += moveY
      })
      metadataTemp.edges.forEach(edge => {
        pointArray = edge.d.split(' ').filter(item => item.includes(',')).map(item => item.split(',')).map(item => [Math.floor(Number(item[0])), Math.floor(Number(item[1]))])
        pointArray = pointArray.map(item => {
          return [(item[0] + moveX), (item[1] + moveY)]
        })
        edge.d = 'M ' + pointArray.slice().map(item => `L ${item.join(',')}`).join(' ').substring(2)
      })
      this.metadata = metadataTemp
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap-img {
  height: 50vh;
  overflow: scroll;
}
</style>
