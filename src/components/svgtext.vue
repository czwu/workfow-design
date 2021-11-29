<template>
  <g>
    <text v-if="tempText" style="font-size:12px;opacity:0;pointer-events:none">
      <tspan ref="mytspan" fill='#333'>{{ tempText }}</tspan>
    </text>
    <template v-if="tspanList.length>0">
      <text v-if="showTextBg" style="font-size:12px;pointer-events:none" filter="url(#textBg)">
        <tspan v-for="item in tspanList" :key="item.y" :x="item.x" :y="item.y"  fill='#333'>{{ item.tspan }}</tspan>
      </text>
      <text v-else style="font-size:12px;pointer-events:none">
        <tspan v-for="item in tspanList" :key="item.y" :x="item.x" :y="item.y" fill='#333'>{{ item.tspan }}</tspan>
      </text>
    </template>
  </g>
</template>

<script>
export default {
  props: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    w: {
      type: Number,
      required: false // 非必传，如果没有传只能单行显示
    },
    h: {
      type: Number,
      required: false // 非必传，如果没有传只能以起点为顶点
    },
    desc: {
      type: String | Number,
      required: false // 非必传，如果没有传刚显示空
    },
    textAlign: {
      type: String,
      required: false,
      default: 'center'
    },
    verticalAlign: {
      type: String,
      required: false,
      default: 'middle'
    },
    showTextBg: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      // 行间距
      lineHeight: 10,
      tempText: '',
      tspanList: []
    }
  },
  watch: {
    x: {
      immediate: true,
      handler() {
        this.getTspanArray()
      }
    },
    y: {
      immediate: true,
      handler() {
        this.getTspanArray()
      }
    },
    w: {
      immediate: true,
      handler() {
        this.getTspanArray()
      }
    },
    h: {
      immediate: true,
      handler() {
        this.getTspanArray()
      }
    },
    desc: {
      immediate: true,
      handler() {
        this.getTspanArray()
      }
    },
    textAlign: {
      immediate: true,
      handler() {
        this.getTspanArray()
      }
    },
    verticalAlign: {
      immediate: true,
      handler() {
        this.getTspanArray()
      }
    },
    showTextBg: {
      immediate: true,
      handler() {
        this.getTspanArray()
      }
    }
  },
  methods: {
    // 计算文字起点宽高文字内容x,y,w,y,tspan
    getBoundingClientRect(tempText) {
      this.tempText = tempText
      return new Promise((resolve) => {
        this.$nextTick(() => {
          const res = this.$refs['mytspan'].getBoundingClientRect()
          this.tempText = ''
          resolve(res)
        })
      })
    },
    // 将单行文字计算改成多行显示
    async getTspanArray() {
     
      if (this.desc) {
        const desc = String(this.desc)
        let tspanList = []
        // 当前计算的文字段
        let tempText = ''
        let start = 0
        let res = {}
        if (!this.w) {
          res = await this.getBoundingClientRect(this.desc)
          tspanList.push({
            x: this.calcTextAlign(res),
            y: Math.ceil(res.height * tspanList.length + this.lineHeight + this.y),
            tspan: desc,
            w: res.width,
            h: res.height
          })
        } else {
          for (let i = 1; i <= desc.length; i++) {
            tempText = desc.slice(start, i)
            res = await this.getBoundingClientRect(tempText)
            if (res.width > this.w) {
              tspanList.push({
                x: this.x,
                y: Math.ceil(res.height * tspanList.length + this.lineHeight + this.y),
                tspan: desc.slice(start, i - 1 > 0 ? i - 1 : 1),
                w: res.width,
                h: res.height
              })
              start = i
            } else if (i === desc.length) {
              tspanList.push({
                x: this.calcTextAlign(res),
                y: Math.ceil(res.height * tspanList.length + this.lineHeight + this.y),
                tspan: desc.slice(start, i),
                w: res.width,
                h: res.height
              })
            }
          }
        }
        this.tspanList = this.calcVerticalAlign(tspanList)
      } else {
        this.tspanList = []
      }
    },
    // 计算textAlign对齐：左对齐，右对齐，居中对齐
    calcTextAlign(res) {
      let x = this.x
      if (this.textAlign === 'left') {
        x = this.x
        // console.log('left')
      } else if (this.textAlign === 'right') {
        if (this.w) {
          x = Math.ceil(this.x + this.w - res.width)
          // console.log('right')
        } else {
          x = Math.ceil(this.x - res.width)
          // console.log('right', '没有传w宽度以起点为准右对齐')
        }
      } else if (this.textAlign === 'center') {
        if (this.w) {
          x = Math.ceil(this.x + ((this.w - res.width) / 2))
          // console.log('center')
        } else {
          x = Math.ceil(this.x - (res.width / 2))
          // console.log('center', '没有传w宽度，以起点为中心点')
        }
      }
      return x
    },
    // 计算verticalAlign对齐：顶部对齐，居中对齐，底部对齐
    calcVerticalAlign(tspanList) {
      let height = 0
      tspanList.forEach(item => {
        height += item.h
      })
      let newTspanList = tspanList
      if (this.verticalAlign === 'top') {
        // console.log('top', '不需要重新计算')
      } else if (this.verticalAlign === 'bottom') {
        if (this.h) {
          newTspanList = tspanList.map(item => {
            return { ...item, y: item.y + Math.floor(this.h - height) }
          })
          // console.log('bottom')
        } else {
          newTspanList = tspanList.map(item => {
            return { ...item, y: item.y - Math.floor(height) }
          })
          // console.log('bottom', 没有传h高度，以起点为准)
        }
      } else if (this.verticalAlign === 'middle') {
        if (this.h) {
          newTspanList = tspanList.map(item => {
            return { ...item, y: item.y + Math.floor((this.h - height) / 2) }
          })
          // console.log('middle')
        } else {
          newTspanList = tspanList.map(item => {
            return { ...item, y: item.y - Math.floor(height / 2) }
          })
          // console.log('middle', '没有传h高度，以起点为中心点')
        }
      }
      return newTspanList
    }
  }
}
</script>
