<template>
  <div class="graph-container flex-col flex-grow">
    <div class="svg-box flex-grow" @mouseup="createNode">
      <div :style="styleWrap">
        <div :style="styleSvg">
          <svg
            :width="width"
            :height="height"
            class="zone"
            xmlns="http://www.w3.org/2000/svg"
            @mousedown="svgMousedown($event)"
            @mousemove="svgMousemove($event)"
            @mouseup="svgMouseUp"
            @contextmenu="showContextMenu"
            :transform="matrix"
          >
            <definiens />

            <g class="graph">
              <path
                v-show="isLinking"
                class="link dragline"
                :d="lineDragData"
                marker-end="url(#mark-arrow)"
              ></path>

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
                  :key="index"
                  :node="node"
                  :dotLink="dotLink"
                  :progress="progress"
                  @startLinkNode="startLinkNode"
                  @endLinkedNode="endLinkedNode"
                  :readonly="readonly"
                ></item>
              </g>

              <graticule
                v-if="!readonly"
                :node="graticuleNode"
                :metadata="metadata"
              ></graticule>

              <virtualnode
                v-if="!readonly"
                :node="virtualNodeData"
              ></virtualnode>

              <boxesselected
                v-if="!readonly"
                :boxesSelectedInfo="boxesSelectedInfo"
              ></boxesselected>
            </g>
          </svg>
        </div>
        <div
          class="editing-parent"
          :style="editorStyle"
          v-if="showEditor"
          :class="editorLine ? 'line' : ''"
        >
          <div
            class="editing-content"
            id="inputEditor"
            contenteditable="true"
            @input="editorInput($event)"
            @keydown="editorKeydown($event)"
          ></div>
        </div>
        <div class="context-menu" v-show="showMenu" :style="menuStyle">
          <div class="menu-item copy" @click="menuClick('copy')">复制</div>
          <div class="menu-item remove" @click="menuClick('remove')">删除</div>
          <div class="menu-item back" @click="menuClick('back')">撤销</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import definiens from "./definiens.vue";
import myline from "./line.vue";
import item from "./item.vue";
import virtualnode from "./virtualNode.vue";
import graticule from "./graticule.vue";
import { uuid, uuid2 } from "../utils/tools.js";
import align from "../utils/align";
import { edgeData } from "../utils/path.js";
import { icon } from "./icon/index.js";
import eventBus, { EVENTS } from "../common/eventBus";
import metadata from "@/common/metadata";
import boxesselected from "./boxesSelected.vue";

export default {
  name: "graph",
  props: ["readonly", "progress"],
  components: {
    definiens,
    myline,
    item,
    virtualnode,
    graticule,
    boxesselected,
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
      height: 5000,
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
      editorNode: null, //当前显示编辑器的节点
      editorLine: null, //当前显示编辑器的连接线
      showMenu: false,
      menuStyle: {},
      showMenuNode: null,
    };
  },
  created() {
    //全局监听事件
    // 节点间连线选中事件
    eventBus.$on(EVENTS.GRAPH_LINE_SELECT, (edge) => {
      if (
        edge.selected &&
        this.boxesSelectedInfo &&
        this.boxesSelectedInfo.start &&
        this.boxesSelectedInfo.end
      ) {
        this.isDragBox = true;
      } else {
        this.boxesSelectedInfo = null;
        this.unSelectedAll();
        edge.selected = true;
      }
      this.selectedLine = edge;
    });
    // 显示右键菜单
    eventBus.$on(EVENTS.SHOW_MENU, (node) => {
      this.showMenu = true;
      this.menuStyle = {
        left: node.x + node.w - 10 + "px",
        top: node.y + node.h - 10 + "px",
      };
      this.showMenuNode = node;
    });
    // 节点间连线轨迹鼠标按下事件
    eventBus.$on(EVENTS.GRAPH_LINE_MOUSEDOWN, (dragLineId) => {
      this.isDragLine = dragLineId;
    });
    // 左区节点鼠标按下事件
    eventBus.$on(EVENTS.GRAPH_LEFT_NODE_MOUSEDOWN, (node) => {
      this.tempNode = node;
    });
    // 左区节点鼠标松开事件
    eventBus.$on(EVENTS.GRAPH_LEFT_NODE_MOUSEUP, (node) => {
      this.showMenu = false;
      this.tempNode = null;
    });
    // 画布中间操作区节点鼠标按下事件
    eventBus.$on(EVENTS.GRAPH_NODE_MOUSEDOWN, (node) => {
      this.nodemousedown(node);
    });
    // 缩放事件
    eventBus.$on(EVENTS.GRAPH_SCALE, (size) => {
      this.size = size;
    });
    // 删除事件
    eventBus.$on(EVENTS.HOTKEY_DEL, () => {
      this.handleDelete();
    });
    // 快捷键复制
    eventBus.$on(EVENTS.HOTKEY_CTRLC, () => {
      this.handleCopy();
    });
    // 快捷键粘贴
    eventBus.$on(EVENTS.HOTKEY_CTRLV, () => {
      this.handlePaste();
    });
    // 快捷键往下
    eventBus.$on(EVENTS.HOTKEY_UP, (e) => {
      this.handleKeyMove(e);
    });
    // 快捷键往下
    eventBus.$on(EVENTS.HOTKEY_DOWN, (e) => {
      this.handleKeyMove(e);
    });
    // 快捷键往左
    eventBus.$on(EVENTS.HOTKEY_LEFT, (e) => {
      this.handleKeyMove(e);
    });
    // 快捷键王右
    eventBus.$on(EVENTS.HOTKEY_RIGHT, (e) => {
      this.handleKeyMove(e);
    });
    // 快捷键撤销
    eventBus.$on(EVENTS.HOTKEY_CTRLZ, (e) => {
      this.boxesSelectedInfo = null;
    });
    //显示编辑器
    eventBus.$on(EVENTS.SHOW_EDITOR, (node) => {
      if (node.compType === "sequenceFlow") {
        this.editorLine = node;
        this.showEditor = true;
        const arr = node.d.split(" ");
        const [x1, y1] = arr[3].split(",");
        const [x2, y2] = arr[5].split(",");
        let x = x1 * 1 + (x2 * 1 - x1 * 1) / 2 - 70;
        let y = y1 * 1 + (y2 * 1 - y1 * 1) / 2 - 20;
        this.editorStyle = {
          top: y + "px",
          left: x + "px",
        };
        this.editorNode = null;
      } else {
        this.editorLine = null;
        this.editorStyle = {
          top: node.y + 2 + "px",
          left: node.x + 2 + "px",
        };
        this.showEditor = true;
        this.editorNode = node;
      }
      this.$nextTick(() => {
        const div = document.querySelector("#inputEditor");
        div.innerText = node.label || "";
        if (getSelection) {
          let range = getSelection(); // 创建range
          range.selectAllChildren(div); // range 选择obj下所有子内容
          range.collapseToEnd(); // 光标移至最后
        }
        div.focus();
      });
    });
    this.$nexts;
  },
  computed: {
    styleWrap() {
      if (this.size && this.size < 1) {
        return `width: ${this.width * this.size}px; height: ${
          this.height * this.size
        }px; overflow: hidden;`;
      } else {
        return "";
      }
    },
    styleSvg() {
      if (this.size && this.size < 1) {
        return `width: ${this.width}px; height: ${this.height}px;`;
      } else {
        return "";
      }
    },
    matrix() {
      return `matrix(${this.matrixArray[0]},${this.matrixArray[1]},${this.matrixArray[2]},${this.matrixArray[3]},${this.matrixArray[4]},${this.matrixArray[5]})`;
    },
  },
  watch: {
    size() {
      const scaleX = 1 * this.size;
      const scaleY = 1 * this.size;
      const translateX = (this.width * (this.size - 1)) / 2;
      const translateY = (this.height * (this.size - 1)) / 2;
      this.matrixArray = [scaleX, 0, 0, scaleY, translateX, translateY];
    },
  },
  methods: {
    // 快捷键移动
    handleKeyMove(e) {
      if (this.readonly) {
        return;
      }
      if (
        this.boxesSelectedInfo &&
        this.boxesSelectedInfo.start &&
        this.boxesSelectedInfo.end
      ) {
        if (e.code === "ArrowUp" && this.boxesSelectedInfo.start.y >= 1) {
          this.boxesSelectedInfo.start.y -= 1;
          this.boxesSelectedInfo.end.y -= 1;
        } else if (
          e.code === "ArrowDown" &&
          this.boxesSelectedInfo.end.y + 1 <= this.height
        ) {
          this.boxesSelectedInfo.start.y += 1;
          this.boxesSelectedInfo.end.y += 1;
        } else if (
          e.code === "ArrowLeft" &&
          this.boxesSelectedInfo.start.x >= 1
        ) {
          this.boxesSelectedInfo.start.x -= 1;
          this.boxesSelectedInfo.end.x -= 1;
        } else if (
          e.code === "ArrowRight" &&
          this.boxesSelectedInfo.end.x + 1 < this.width
        ) {
          this.boxesSelectedInfo.start.x += 1;
          this.boxesSelectedInfo.end.x += 1;
        } else {
          return;
        }
        this.graticuleNode = {
          isBoxes: true,
          start: {
            x: this.boxesSelectedInfo.start.x,
            y: this.boxesSelectedInfo.start.y,
          },
          end: {
            x: this.boxesSelectedInfo.end.x,
            y: this.boxesSelectedInfo.end.y,
          },
        };
      }
      const nodes = this.metadata.nodes.filter((item) => item.selected);
      const moveNodes = [];
      nodes.forEach((item) => {
        if (e.code === "ArrowUp" && item.y >= 1) {
          item.y -= 1;
          item.linkNode.top.y -= 1;
          item.linkNode.right.y -= 1;
          item.linkNode.bottom.y -= 1;
          item.linkNode.left.y -= 1;
          moveNodes.push(item.id);
        } else if (
          e.code === "ArrowDown" &&
          item.linkNode.bottom.y + 1 <= this.height
        ) {
          item.y += 1;
          item.linkNode.top.y += 1;
          item.linkNode.right.y += 1;
          item.linkNode.bottom.y += 1;
          item.linkNode.left.y += 1;
          moveNodes.push(item.id);
        } else if (e.code === "ArrowLeft" && item.x >= 1) {
          item.x -= 1;
          item.linkNode.top.x -= 1;
          item.linkNode.right.x -= 1;
          item.linkNode.bottom.x -= 1;
          item.linkNode.left.x -= 1;
          moveNodes.push(item.id);
        } else if (
          e.code === "ArrowRight" &&
          item.linkNode.right.x + 1 <= this.width
        ) {
          item.x += 1;
          item.linkNode.top.x += 1;
          item.linkNode.right.x += 1;
          item.linkNode.bottom.x += 1;
          item.linkNode.left.x += 1;
          moveNodes.push(item.id);
        }
      });
      let pointArray = [];
      this.metadata.edges.forEach((edge) => {
        if (
          edge.selected &&
          moveNodes.includes(edge.source) &&
          moveNodes.includes(edge.target)
        ) {
          pointArray = edge.d
            .split(" ")
            .filter((item) => item.includes(","))
            .map((item) => item.split(","))
            .map((item) => [
              Math.floor(Number(item[0])),
              Math.floor(Number(item[1])),
            ]);
          pointArray = pointArray.map((item) => {
            if (e.code === "ArrowUp") {
              return [item[0], item[1] - 1];
            } else if (e.code === "ArrowDown") {
              return [item[0], item[1] + 1];
            } else if (e.code === "ArrowLeft") {
              return [item[0] - 1, item[1]];
            } else if (e.code === "ArrowRight") {
              return [item[0] + 1, item[1]];
            }
          });
          edge.d =
            "M " +
            pointArray
              .slice()
              .map((item) => `L ${item.join(",")}`)
              .join(" ")
              .substring(2);
        } else if (
          moveNodes.some((id) => edge.source === id || edge.target === id)
        ) {
          edge.d = edgeData(edge, this.metadata.nodes);
        }
      });
      if (nodes.length === 1) {
        this.graticuleNode = nodes[0];
      }
      clearTimeout(this.keyMoveTimer);
      this.keyMoveTimer = setTimeout(() => {
        this.notifyDataUpdate();
        this.graticuleNode = null;
      }, 1500);
    },
    // 快捷键复制，目前只支持单节点复制
    handleCopy() {
      if (this.readonly) {
        return;
      }
      const nodes = this.metadata.nodes.filter((item) => item.selected);
      if (nodes.length === 1) {
        this.copyNodes = nodes;
      } else {
        this.copyNodes = [];
      }
    },
    // 快捷键粘贴
    handlePaste() {
      if (this.readonly) {
        return;
      }
      if (this.copyNodes && this.copyNodes.length > 0) {
        this.copyNodes.forEach((copynode) => {
          const jsonStr = JSON.stringify(copynode);
          const jsonObj = JSON.parse(jsonStr);
          const { label, icon, w, h } = jsonObj;
          const { offsetX: midX, offsetY: midY } = this.mouse;
          const leftTopX = midX - w / 2;
          const leftTopY = midY - h / 2;
          const compType = jsonObj.compType;
          const id = `${compType}_${uuid2()}`;
          const node = {
            id,
            label,
            compType,
            icon,
            x: Math.floor(leftTopX),
            y: Math.floor(leftTopY),
            w: Math.floor(w),
            h: Math.floor(h),
            readonly: jsonObj.readonly,
            disabled: jsonObj.disabled,
            selected: false,
            linkNode: {
              top: {
                x: Math.floor(midX),
                y: Math.floor(leftTopY),
              },
              bottom: {
                x: Math.floor(midX),
                y: Math.floor(midY + h / 2),
              },
              left: {
                x: Math.floor(leftTopX),
                y: Math.floor(midY),
              },
              right: {
                x: Math.floor(midX + w / 2),
                y: Math.floor(midY),
              },
            },
            workflow: jsonObj.workflow,
          };
          this.metadata.nodes.push(node);
        });
        this.notifyDataUpdate();
      }
    },
    // 删除
    handleDelete() {
      if (this.readonly) {
        return;
      }
      const lines = this.metadata.edges.filter((item) => item.selected);
      const nodes = this.metadata.nodes.filter((item) => item.selected);
      nodes.forEach((item) => {
        this.metadata.edges.forEach((edge) => {
          if (
            (edge.source === item.id || edge.target === item.id) &&
            lines.indexOf(edge) === -1
          ) {
            lines.push(edge);
          }
        });
        this.metadata.nodes.splice(this.metadata.nodes.indexOf(item), 1);
      });
      lines.forEach((item) => {
        this.metadata.edges.splice(this.metadata.edges.indexOf(item), 1);
      });
      if (lines.length > 0 || nodes.length > 0) {
        this.notifyDataUpdate();
      }
      this.boxesSelectedInfo = null;
    },

    /**
     * 增加节点
     * @description 向SVG画布中新增节点
     * @argument {DragEvent} event - mouse event
     */
    createNode(event) {
      this.showMenu = false;
      if (this.readonly) {
        return;
      }
      if (!this.createNodeLock) {
        this.createNodeLock = true;
        if (this.tempNode) {
          const jsonStr = JSON.stringify(this.tempNode);
          const jsonObj = JSON.parse(jsonStr);
          const { label, icon, w, h } = jsonObj;
          this.createNodeLock = false;
          const { offsetX: midX, offsetY: midY } = event;
          const leftTopX = midX - w / 2;
          const leftTopY = midY - h / 2;
          const compType = jsonObj.type;
          const id = `${compType}_${uuid2()}`;
          const node = {
            id,
            label,
            compType,
            icon,
            x: Math.floor(leftTopX),
            y: Math.floor(leftTopY),
            w: Math.floor(w),
            h: Math.floor(h),
            selected: false,
            linkNode: {
              top: {
                x: Math.floor(midX),
                y: Math.floor(leftTopY),
              },
              bottom: {
                x: Math.floor(midX),
                y: Math.floor(midY + h / 2),
              },
              left: {
                x: Math.floor(leftTopX),
                y: Math.floor(midY),
              },
              right: {
                x: Math.floor(midX + w / 2),
                y: Math.floor(midY),
              },
            },
            workflow: jsonObj.workflow ? jsonObj.workflow : {},
          };
          this.metadata.nodes.push(node);
          this.notifyDataUpdate();
          this.boxesSelectedInfo = null;
        } else {
          this.createNodeLock = false;
        }
      } else {
        // 若存在异步增加节点需求可在此使用提示
        // handling blocked asynchronous requests here
        alert("生成节点中..(please wait or ignore this...)");
      }
      this.tempNode = null;
      this.virtualNodeData = null;
    },

    /**
     * 画布已存在路径检测
     * @argument {number} source - 源节点ID
     * @argument {number} target - 目标节点ID
     * @return {number}
     */
    edgeExist(source, target) {
      const edgeIsExist = this.metadata.edges.findIndex(
        (i) => source === i.source && target === i.target
      );
      return edgeIsExist;
    },

    /**
     * 开始连接节点
     * @description 连线起始函数
     * @argument {string} position - 连线起点位置
     */
    startLinkNode(position) {
      if (this.readonly) {
        return;
      }
      this.isLinking = true;
      this.dotLink = position;
      this.boxesSelectedInfo = null;
      this.unSelectedAll();
    },

    /**
     * 节点完成连接
     * @description 连线终止函数
     * @argument {string} position - 连线终点位置
     * @argument {NodeClass} node - 终止节点
     */
    endLinkedNode(position, node) {
      if (this.readonly) {
        return;
      }
      if (this.mousedownNode !== null && this.mousedownNode !== node) {
        const source = this.mousedownNode.id;
        const target = node.id;
        let edgeIsExist = -1;
        if (this.metadata.edges.length > 0) {
          // 相同两个节点之间最大连接路径为1
          edgeIsExist = this.edgeExist(source, target);
        }
        if (edgeIsExist === -1) {
          const dotLink = this.dotLink;
          const edge = {
            compType: "sequenceFlow",
            id: "sequenceFlow_" + uuid2(),
            label: "",
            source,
            target,
            selected: false,
            dotLink,
            dotEndLink: position,
            d: "",
            workflow: {
              hasCondition: false,
              condition: "",
            },
          };
          edge.d = edgeData(edge, this.metadata.nodes);
          this.metadata.edges.push(edge);
          this.notifyDataUpdate();
        }
      }
    },

    // 处理框选
    svgMousedown(e) {
      this.closeEditor();
      if (this.readonly) {
        return;
      }
      if (
        !this.selectedLine &&
        !this.isLinking &&
        !this.isDragNode &&
        !this.isDragBox
      ) {
        this.boxesSelectedInfo = {
          start: {
            x: e.offsetX,
            y: e.offsetY,
          },
          end: null,
          box: null,
          status: 1, // 1表示框选中， 2表示框选完成
        };
      }
      this.dragStart = {
        x: e.pageX,
        y: e.pageY,
      };
    },

    /**
     * 全局SVG鼠标事件监听
     * @description 核心方法 - 处理连线轨迹 - 更新节点拖拽变化值
     * @argument {MouseEvent} event - mouse event
     */
    svgMousemove(event) {
      if (this.readonly) {
        return;
      }
      // 缓存当前鼠标
      this.mouse = event;

      const node = this.mousedownNode;
      const { pageX, pageY } = event;

      if (this.isDragLine) {
        // 处理节点间连线轨迹拖曳
        eventBus.$emit(EVENTS.GRAPH_LINE_MOUSEMOVE, event, this.isDragLine);
      } else if (this.isLinking && node !== null) {
        // 正在对节点进行连线
        this.lineDragData = this.caclPathDragData(node, event);
      } else if (this.isDragNode && node !== null) {
        // 正在拖曳节点
        if (this.virtualNodeData === null) {
          this.virtualNodeData = JSON.parse(JSON.stringify(node));
        }

        // 确定虚拟节点位置并处理节点过界
        this.virtualNodeData.x = Math.max(
          Math.floor(node.x + (pageX - this.dragStart.x) / this.size),
          0
        );
        this.virtualNodeData.x =
          this.virtualNodeData.x + this.virtualNodeData.w > this.width
            ? Math.floor(this.width - this.virtualNodeData.w)
            : this.virtualNodeData.x;
        this.virtualNodeData.y = Math.max(
          Math.floor(node.y + (pageY - this.dragStart.y) / this.size),
          0
        );
        this.virtualNodeData.y =
          this.virtualNodeData.y + this.virtualNodeData.h > this.height
            ? Math.floor(this.height - this.virtualNodeData.h)
            : this.virtualNodeData.y;

        const midX = this.virtualNodeData.x + this.virtualNodeData.w / 2;
        const midY = this.virtualNodeData.y + this.virtualNodeData.h / 2;
        this.virtualNodeData.linkNode = {
          top: {
            x: Math.floor(midX),
            y: Math.floor(this.virtualNodeData.y),
          },
          bottom: {
            x: Math.floor(midX),
            y: Math.floor(this.virtualNodeData.y + this.virtualNodeData.h),
          },
          left: {
            x: Math.floor(this.virtualNodeData.x),
            y: Math.floor(midY),
          },
          right: {
            x: Math.floor(this.virtualNodeData.x + this.virtualNodeData.w),
            y: Math.floor(midY),
          },
        };
        this.graticuleNode = this.virtualNodeData;
      } else if (this.tempNode) {
        // 新增节点的虚拟节点

        // 确定新增节点位置并处理节点过界
        let tempNodeX = Math.max(
          Math.floor(event.offsetX - this.tempNode.w / 2),
          0
        );
        tempNodeX =
          tempNodeX + this.tempNode.w > this.width
            ? Math.floor(this.width - this.tempNode.w)
            : tempNodeX;
        let tempNodeY = Math.max(
          Math.floor(event.offsetY - this.tempNode.h / 2),
          0
        );
        tempNodeY =
          tempNodeY + this.tempNode.h > this.height
            ? Math.floor(this.height - this.tempNode.h)
            : tempNodeY;
        this.virtualNodeData = {
          ...this.tempNode,
          x: tempNodeX,
          y: tempNodeY,
          linkNode: {
            top: {
              x: Math.floor(tempNodeX + this.tempNode.w / 2),
              y: tempNodeY,
            },
            bottom: {
              x: Math.floor(tempNodeX + this.tempNode.w / 2),
              y: Math.floor(tempNodeY + this.tempNode.h),
            },
            left: {
              x: tempNodeX,
              y: Math.floor(tempNodeY + this.tempNode.h / 2),
            },
            right: {
              x: Math.floor(tempNodeX + this.tempNode.w),
              y: Math.floor(tempNodeY + this.tempNode.h / 2),
            },
          },
        };
        this.graticuleNode = this.virtualNodeData;
      } else if (this.isDragBox) {
        // 正在拖曳整个框选

        let dragBoxX = (pageX - this.dragStart.x) / this.size;
        let dragBoxY = (pageY - this.dragStart.y) / this.size;
        console.log(dragBoxX);
        if (Math.abs(dragBoxX) > 0 || Math.abs(dragBoxY) > 0) {
          // 确定框选节点位置并处理节点过界
          const oldStartX = this.boxesSelectedInfo.start.x;
          this.boxesSelectedInfo.start.x = Math.max(
            Math.floor(this.boxesSelectedInfo.box.x + dragBoxX),
            0
          );
          this.boxesSelectedInfo.start.x =
            this.boxesSelectedInfo.start.x + this.boxesSelectedInfo.box.w >
            this.width
              ? Math.floor(this.width - this.boxesSelectedInfo.box.w)
              : this.boxesSelectedInfo.start.x;
          dragBoxX = this.boxesSelectedInfo.start.x - oldStartX;

          const oldStartY = this.boxesSelectedInfo.start.y;
          this.boxesSelectedInfo.start.y = Math.max(
            Math.floor(this.boxesSelectedInfo.box.y + dragBoxY),
            0
          );
          this.boxesSelectedInfo.start.y =
            this.boxesSelectedInfo.start.y + this.boxesSelectedInfo.box.h >
            this.height
              ? Math.floor(this.height - this.boxesSelectedInfo.box.h)
              : this.boxesSelectedInfo.start.y;
          dragBoxY = this.boxesSelectedInfo.start.y - oldStartY;

          this.boxesSelectedInfo.end.x =
            this.boxesSelectedInfo.start.x + this.boxesSelectedInfo.box.w;
          this.boxesSelectedInfo.end.y =
            this.boxesSelectedInfo.start.y + this.boxesSelectedInfo.box.h;

          const nodes = this.metadata.nodes.filter((node) => node.selected);
          nodes.forEach((node) => {
            node.x = Math.floor(node.x + dragBoxX);
            node.y = Math.floor(node.y + dragBoxY);
            node.linkNode = {
              top: {
                x: Math.floor(node.x + node.w / 2),
                y: Math.floor(node.y),
              },
              bottom: {
                x: Math.floor(node.x + node.w / 2),
                y: Math.floor(node.y + node.h),
              },
              left: {
                x: Math.floor(node.x),
                y: Math.floor(node.y + node.h / 2),
              },
              right: {
                x: Math.floor(node.x + node.w),
                y: Math.floor(node.y + node.h / 2),
              },
            };
          });

          let pointArray = [];
          this.metadata.edges.forEach((edge) => {
            if (edge.selected) {
              pointArray = edge.d
                .split(" ")
                .filter((item) => item.includes(","))
                .map((item) => item.split(","))
                .map((item) => [
                  Math.floor(Number(item[0])),
                  Math.floor(Number(item[1])),
                ]);
              pointArray = pointArray.map((item) => {
                return [
                  Math.floor(item[0] + dragBoxX),
                  Math.floor(item[1] + dragBoxY),
                ];
              });
              edge.d =
                "M " +
                pointArray
                  .slice()
                  .map((item) => `L ${item.join(",")}`)
                  .join(" ")
                  .substring(2);
            } else if (
              nodes.some(
                (node) => edge.source === node.id || edge.target === node.id
              )
            ) {
              edge.d = edgeData(edge, this.metadata.nodes);
            }
          });

          this.graticuleNode = {
            isBoxes: true,
            start: {
              x: this.boxesSelectedInfo.start.x,
              y: this.boxesSelectedInfo.start.y,
            },
            end: {
              x: this.boxesSelectedInfo.end.x,
              y: this.boxesSelectedInfo.end.y,
            },
          };
        }
      } else if (
        this.boxesSelectedInfo &&
        this.boxesSelectedInfo.status === 1
      ) {
        // 正在框选
        this.boxesSelectedInfo.end = {
          x: event.offsetX,
          y: event.offsetY,
        };
      }
    },

    /**
     * 动态计算路径拖拽数据
     * @argument {NodeClass} mousedownNode - 当前 mousedown 状态节点
     * @argument {MouseEvent} event - mouse event
     * @return {string} path attr 'd' value
     */
    caclPathDragData(mousedownNode, event) {
      const { offsetX: endX, offsetY: endY } = event;
      const { linkNode } = mousedownNode;
      const dotLink = this.dotLink;
      const startX = linkNode[dotLink].x;
      const startY = linkNode[dotLink].y;
      return `M ${startX},${startY} L ${endX},${endY}`;
    },

    /**
     * 全局SVG鼠标事件处理
     */
    svgMouseUp(event) {
      if (this.readonly) {
        return;
      }
      if (this.selectedLine) {
        if (this.isDragLine) {
          // 完成节点间连条轨迹的拖曳
          eventBus.$emit(EVENTS.GRAPH_LINE_MOUSEUP, event, this.isDragLine);
          this.isDragLine = "";
          this.notifyDataUpdate();
        }
        this.clickNode(this.selectedLine);
        this.selectedLine = "";
        this.isDragBox = false;
      } else if (this.isDragNode) {
        // 完成节点拖曳
        this.isDragNode = false;
        if (
          this.mousedownNode &&
          this.virtualNodeData &&
          (this.mousedownNode.x !== this.virtualNodeData.x ||
            this.mousedownNode.y !== this.virtualNodeData.y)
        ) {
          this.mousedownNode.x = Math.floor(this.virtualNodeData.x);
          this.mousedownNode.y = Math.floor(this.virtualNodeData.y);
          this.mousedownNode.linkNode = this.virtualNodeData.linkNode;
          this.metadata.edges.forEach((item) => {
            if (
              item.source === this.mousedownNode.id ||
              item.target === this.mousedownNode.id
            ) {
              item.d = edgeData(item, this.metadata.nodes);
            }
          });
          this.notifyDataUpdate();
        }
      } else if (this.isLinking) {
        // 取消正在连线标示
        this.isLinking = false;
      } else if (this.isDragBox) {
        // 完成整个框选拖曳
        this.isDragBox = false;
        this.boxesSelectedInfo.box.x = this.boxesSelectedInfo.start.x;
        this.boxesSelectedInfo.box.y = this.boxesSelectedInfo.start.y;
        this.boxesSelectedInfo.box.xw = this.boxesSelectedInfo.end.x;
        this.boxesSelectedInfo.box.yh = this.boxesSelectedInfo.end.y;
        this.notifyDataUpdate();
      } else if (this.boxesSelectedInfo) {
        // 框选
        this.unSelectedAll();
        this.clickNode(null);
        eventBus.$emit(EVENTS.GRAPH_BOXESSELECTED, this.metadata);
      } else {
        // 点击画布
        this.unSelectedAll();
        this.clickNode(null);
      }
      this.mousedownNode = null;
      this.lineDragData = "";
      this.dotLink = "";
      // 释放准线
      this.graticuleNode = null;
    },

    /**
     * 画布中间操作区节点鼠标按下事件
     * @argument {NodeClass} node - 节点
     */
    nodemousedown(node) {
      if (this.readonly) {
        return;
      }
      if (
        node.selected &&
        this.boxesSelectedInfo &&
        this.boxesSelectedInfo.start &&
        this.boxesSelectedInfo.end
      ) {
        this.isDragBox = true;
      } else {
        this.boxesSelectedInfo = null;
        this.unSelectedAll();
        this.mousedownNode = node;
        this.clickNode(node);
        if (this.isLinking) {
          this.isDragNode = false;
        } else {
          node.selected = true;
          this.isDragNode = true;
        }
      }
    },

    clickNode(node) {
      if (this.readonly) {
        return;
      }
      this.$emit("selectNode", node);
    },

    /**
     * 解除节点选中状态
     */
    unSelectedNodes() {
      this.metadata.nodes.forEach((node) => {
        node.selected = false;
        return node;
      });
    },

    /**
     * 解除节点连线选中状态
     */
    unSelectedEdges() {
      this.metadata.edges.forEach((edge) => {
        edge.selected = false;
        return edge;
      });
    },

    /**
     * 解除全部选中
     */
    unSelectedAll() {
      this.selectedLine = "";
      this.unSelectedNodes();
      this.unSelectedEdges();
    },
    // 通知数据更新
    notifyDataUpdate() {
      eventBus.$emit(EVENTS.METADATA_NODE_UPDATED);
      console.log("数据更新了");
    },

    editorInput(e) {
      let div = document.querySelector("#inputEditor");
      if (e.inputType === "insertFromPaste") {
        div.innerText = div.innerText.substr(0, 40);
      }
    },
    editorKeydown(e) {
      let div = document.querySelector("#inputEditor");
      if (div.innerText.length > 40 && e.keyCode !== 8) e.preventDefault();
    },
    closeEditor() {
      if (this.showEditor) {
        const text = document.querySelector("#inputEditor").innerText || "";
        if (this.editorNode) {
          this.editorNode.label = text;
        } else if (this.editorLine) {
          this.editorLine.label = text;
        }
        this.showEditor = false;
      }
    },
    showContextMenu() {
      self.event.returnValue = false;
    },
    menuClick(type) {
      if (type === "remove") {
        this.handleDelete();
      } else if (type === "copy") {
        this.handleCopy();
        this.handlePaste();
      } else if (type === "back") {
        eventBus.$emit(EVENTS.HOTKEY_CTRLZ);
      }
    },
  },
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
  .context-menu {
    position: absolute;
    left: 200px;
    top: 200px;
    background: #fff;
    font-size: 12px;
    color: #333;
    width: 88px;
    line-height: 32px;
    padding: 5px 0;
    box-shadow: 2px 2px 12px 0px rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    .menu-item {
      padding: 0 0 0 30px;
      cursor: pointer;
      &.back {
        background: url("./icon/back.png") no-repeat;
        background-size: 16px 16px;
        background-position: 8px center;
      }
      &.remove {
        background: url("./icon/remove.png") no-repeat;
        background-size: 16px 16px;
        background-position: 8px center;
      }
      &.copy {
        background: url("./icon/copy.png") no-repeat;
        background-size: 16px 16px;
        background-position: 8px center;
      }
      &:hover {
        color: #5b60f1;
      }
    }
  }
}
</style>
