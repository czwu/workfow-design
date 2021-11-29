<template>
  <g v-if="edge" @mousedown="selectLine($event, edge)" >
    <path
      :d="tempD"
      :marker-end="(isFinishSequence?'url(#mark-arrow-green)':'url(#mark-arrow)')"
      class="link"
      :stroke-dasharray="dash"
     
      :class="{'selected': edge.selected, 'isFinishSequence': isFinishSequence}"
    ></path>

    <path v-if="!readonly" :d="tempD"   class="link hide"   @dblclick="showEditor()" ></path>

    <g v-if="!readonly">
      <line
        v-for="(item, index) in lineList"
        v-show="index!=0&&index<lineList.length-1"
        :key="index"
         @dblclick="showEditor()"
        :x1="item.pointArray[0][0]"
        :y1="item.pointArray[0][1]"
        :x2="item.pointArray[1][0]"
        :y2="item.pointArray[1][1]"
        :class="{'horizontal-line': (item.pointArray[0][1]==item.pointArray[1][1]), 'vertical-line': (item.pointArray[0][0]==item.pointArray[1][0])}"
        class="link-drag-line"
        @mousedown="linemousedown($event, index)"
      />
    </g>

    <g v-if="textInfo">
      <mytext :showTextBg="true" :x="textInfo.x" :y="textInfo.y" :w='140' :desc="textInfo.desc"></mytext>
    </g>

  </g>
</template>

<script>
import mytext from './svgtext.vue'
import eventBus, {EVENTS} from "../common/eventBus";
import { uuid } from '@/utils/tools.js'
export default {
  props: ['edge', 'readonly', 'progress'],
  components: { mytext },
  data() {
    return {
      tempD: '',
      dragLineId: '',
      lineList: [],
      textInfo: null,
      isFinishSequence: false,
      dash:""
    }
  },
  watch: {
    'edge.d' () {
      this.getLineList()
    },
    'edge.label': {
      immediate: true,
      deep: true,
      handler() {
        this.getTextInfo()
      }
    }, 
    tempD: {
      immediate: true,
      deep: true,
      handler() {
        this.getTextInfo()
      }
    },
    progress: {
      immediate: true,
      handler() {
        if (this.progress && this.edge) {
          if (this.progress.finishSequences && this.edge.id && this.progress.finishSequences.includes(this.edge.id)) {
            this.isFinishSequence = true
          }else{
            this.dash = '2 2'
          }
        }
      }
    }
  },
  created() {
    // 操作事件监听
    // 节点间连线轨迹鼠标滑动事件
    eventBus.$on(EVENTS.GRAPH_LINE_MOUSEMOVE, (event, dragLineId) => {
      this.linemousemove(event, dragLineId)
    });
    // 节点间连线轨迹鼠标松开事件
    eventBus.$on(EVENTS.GRAPH_LINE_MOUSEUP, (event, dragLineId) => {
      this.linemouseup(event, dragLineId)
    });

    // 获取连接线段
    this.getLineList()
    this.getTextInfo()
  },
  methods: {
    // 线条文字
    getTextInfo() {
      let textInfo = {}
      if (this.edge && this.edge.label && this.lineList.length > 0) {
        let line = {}
        if (this.lineList.length === 1 || this.lineList.length === 2) {
          line = {
            x1: Number(this.lineList[0].pointArray[0][0]),
            y1: Number(this.lineList[0].pointArray[0][1]),
            x2: Number(this.lineList[0].pointArray[1][0]),
            y2: Number(this.lineList[0].pointArray[1][1])
          }
        } else {
          line = {
            x1: Number(this.lineList[1].pointArray[0][0]),
            y1: Number(this.lineList[1].pointArray[0][1]),
            x2: Number(this.lineList[1].pointArray[1][0]),
            y2: Number(this.lineList[1].pointArray[1][1])
          }
        }
        textInfo = {
          x: line.x1-70,
          y: line.y1,
          desc: this.edge.label || ''
        }
        if (line.x1 === line.x2 && line.y1 !== line.y2) {
          textInfo.y = textInfo.y + ((line.y2 - line.y1) / 2)
        } else if (line.x1 !== line.x2 && line.y1 === line.y2) {
          textInfo.x = textInfo.x + ((line.x2 - line.x1) / 2)
        }
        this.textInfo = textInfo
      } else {
        this.textInfo = null
      }
    },
    // 节点间连线轨迹鼠标按下事件
    linemousedown($event, index) {
      if (index !== 0 && index < this.lineList.length -1 ) {
        this.dragLineId = this.lineList[index].id
        eventBus.$emit(EVENTS.GRAPH_LINE_MOUSEDOWN, this.dragLineId)
      }
    },
    // 获取连接线段
    getLineList() {
      const lineList = []
      if (this.edge && this.edge.d) {
        this.tempD = this.edge.d
        const pointList = this.edge.d.split(' ').filter(item => item.includes(',')).map(item => item.split(','))
        pointList.forEach((item, index) => {
          if (index <= pointList.length - 2) {
            lineList.push({
              id: uuid(),
              pointArray: [item, pointList[index + 1]]
            })
          }
        })
      }
      this.lineList = lineList
    },
    // 节点间连线轨迹鼠标滑动事件
    linemousemove(event, dragLineId) {
      if (this.dragLineId !== '' && this.dragLineId === dragLineId) {
        let dragLineIndex = ''
        this.lineList.some((item, index) => {
          if (item.id === this.dragLineId) {
            dragLineIndex = index
            return true
          } else {
            return false
          }
        })
        if (dragLineIndex !== '') {
          const lineList = this.lineList.map(item => {
            return {
              id: item.id,
              pointArray: [[...item.pointArray[0]], [...item.pointArray[1]]]
            }
          })
          const perItem = lineList[dragLineIndex - 1]
          const item = lineList[dragLineIndex]
          const nextItem = lineList[dragLineIndex + 1]
          
          // horizontal-line 横线
          if (item.pointArray[0][1] === item.pointArray[1][1]) {
            lineList[dragLineIndex - 1].pointArray = [perItem.pointArray[0], [item.pointArray[0][0], event.offsetY]]
            lineList[dragLineIndex].pointArray = [[item.pointArray[0][0], event.offsetY], [item.pointArray[1][0], event.offsetY]]
            lineList[dragLineIndex + 1].pointArray = [[item.pointArray[1][0], event.offsetY], nextItem.pointArray[1]]
          // vertical-line 竖线
          } else if (item.pointArray[0][0] === item.pointArray[1][0]) {
            lineList[dragLineIndex - 1].pointArray = [perItem.pointArray[0], [event.offsetX, item.pointArray[0][1]]]
            lineList[dragLineIndex].pointArray = [[event.offsetX, item.pointArray[0][1]], [event.offsetX, item.pointArray[1][1]]]
            lineList[dragLineIndex + 1].pointArray = [[event.offsetX, item.pointArray[1][1]], nextItem.pointArray[1]]
          }
          const pointList = []
          lineList.forEach((item, index) => {
            if (index === 0) {
              pointList.push([...item.pointArray[0]])
            }
            pointList.push([...item.pointArray[1]])
          })
          this.lineList = lineList
          this.tempD = 'M ' + pointList.slice().map(item => `L ${item.join(',')}`).join(' ').substring(2)
        }
      }
    },
    // 节点间连线轨迹鼠标松开事件
    linemouseup(event, dragLineId) {
      if (this.dragLineId !== '' && this.dragLineId === dragLineId) {
        this.edge.d = this.tempD
      }
    },
    // 选中
    selectLine($event, edge) {
      if (this.readonly) {
        return
      }
      eventBus.$emit(EVENTS.GRAPH_LINE_SELECT, edge)
    },
    showEditor(a) {
      eventBus.$emit(EVENTS.SHOW_EDITOR, this.edge);
    },
  }
};
</script>

<style lang="scss" scoped>
path.link {
  fill: none;
  stroke: #999;
  stroke-width: 1px;
  stroke-linejoin: round;
  shape-rendering: geometricPrecision;
  &.hide {
    stroke-width: 20px;
    stroke: transparent;
  }
  &.selected {
    stroke: #99bce8;
  }
  &.readonly {
    stroke: #BFBFBF;
    cursor: no-drop;
  }
  &.isFinishSequence {
    stroke: #11CA92 ;
  }
}

.link-drag-line {
  stroke: transparent;
  stroke-width: 20;
  &.horizontal-line {
    cursor: n-resize;
  }
  &.vertical-line {
    cursor: e-resize;
  }
}
</style>
