<template>
  <div class="graph-container flex-col flex-grow">
    <div class="svg-box flex-grow">
      <div>
        <div>
          <svg
            :width="width"
            :height="height"
            class="zone"
            xmlns="http://www.w3.org/2000/svg"
          >
            <definiens />
            <g class="graph">
              <g class="edges-list" @click.stop>
                <myline
                  v-for="edge in metadata.edges"
                  :key="edge.id"
                  :edge="edge"
                  :nodes="metadata.nodes"
                  :progress="progress"
                  :readonly="readonly"
                ></myline>
              </g>
              <g class="nodes-list">
                <item
                  v-for="(node, index) in metadata.nodes"
                   v-if="node.compType !== 'task'"
                  :key="index"
                  :node="node"
                  :progress="progress"
                  :readonly="true"
                ></item>
              </g>
            </g>
            <foreignObject width="100%" height="100%">
              <body xmlns="http://www.w3.org/1999/xhtml">
                <template v-for="(node, index) in metadata.nodes">
                  <view-node
                    v-if="node.compType === 'task'"
                    :key="index"
                    :node="node"
                    :progress="progress"
                  ></view-node>
                </template>
              </body>
            </foreignObject>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import definiens from "@/components/definiens.vue";
import myline from "@/components/line.vue";
import item from "@/components/item.vue";
import { icon } from "@/components/icon/index.js";
import ViewNode from "./ViewNode.vue";
import metadata from "@/common/metadata";

export default {
  name: "graph",
  props: ["readonly", "progress"],
  components: {
    ViewNode,
    definiens,
    myline,
    item,
  },
  data() {
    return {
      // 是否正在拖曳整个框选
      isDragBox: false,
      // 框选
      boxesSelectedInfo: null,
      // 使用快捷键移动计时器
      keyMoveTimer: null,
      // 当前操作的对象，用于显示对准线
      graticuleNode: null,
      // 当前鼠标事件
      mouse: null,
      // 当前要复制的节点
      copyNodes: [],
      // 缩放相关
      size: 1,
      width: 5000,
      height: 2000,
      matrixArray: [1, 0, 0, 1, 0, 0],
      // 图标
      icon,
      // 当前选中的节点间连线的id
      selectedLine: "",
      // 是否正在调整连线轨迹 连线段的id
      isDragLine: "",
      isLinking: false,
      isDragNode: false,
      tempNode: null,
      virtualNodeData: null,
      metadata: metadata.getData(),
      lineDragData: "",
      mousedownNode: null,
      dotLink: "",
      createNodeLock: false,
      dragStart: null,
      showEditor: false,
      editorStyle: {},
    };
  },
  created() {},

  watch: {
    size() {
      const scaleX = 1 * this.size;
      const scaleY = 1 * this.size;
      const translateX = (this.width * (this.size - 1)) / 2;
      const translateY = (this.height * (this.size - 1)) / 2;
      this.matrixArray = [scaleX, 0, 0, scaleY, translateX, translateY];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.graph-container {
  flex: 1;
  box-sizing: border-box;
  background: #fff;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  .svg-box {
    background: #fff;
    transition: background 0.2s ease-in-out;
  }
  svg.zone {
    background-color: #f6f6f6 !important;
    background: -webkit-linear-gradient(top, transparent 9px, #d9d9d9 10px),
      -webkit-linear-gradient(left, transparent 9px, #d9d9d9 10px),
      linear-gradient(360deg, rgb(0 0 0 / 5%) 3%, rgba(0, 0, 0, 0) 3%);
    background-size: 10px 10px;
    .graph {
      path.link {
        fill: none;
        stroke: #000;
        stroke-width: 2px;
        stroke-linejoin: round;
      }
      path.dragline {
        stroke: #888;
        stroke-dasharray: 8px;
      }
    }
  }
}
</style>
