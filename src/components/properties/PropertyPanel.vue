<template>
  <div class="property-panel flex-col">
    <div class="tools flex-row">
      <div class="tool-item" v-for="icon in icons" :key="icon.id">
        <el-tooltip effect="dark" :content="icon.label" placement="bottom">
          <img :src="icon.src" @click="nodeAlign(icon)" />
        </el-tooltip>
      </div>
    </div>
    <div class="title-part">配置信息</div>
    <div class="content-part flex-col">
      <props class="" v-model="mdata"  v-if="mdata"></props>
      <props-editor
        v-if="props.length"
        :props="props"
        :data="mdata"
      ></props-editor>
    </div>
  </div>
</template>
<script>
import { icon } from "../icon/index.js";
import { properties } from "../../common/config";
import { deepClone } from "../../utils/tools";
import align from "../../utils/align";
import metadata from "../../common/metadata";
import eventBus, { EVENTS } from "../../common/eventBus";
import propsEditor from "./PropsEditor";
import props from "./props";
import { edgeData } from "../../utils/path.js";
export default {
  components: { propsEditor, props },
  data() {
    return {
      props: [],
      mdata: metadata.getData(),
      icons: [
        { id: "hEquidistant", label: "水平等间距", src: icon.v1 },
        { id: "vEquidistant", label: "垂直等间距", src: icon.v2 },
        { id: "left", label: "左对齐", src: icon.v3 },
        { id: "center", label: "居中对齐", src: icon.v4 },
        { id: "right", label: "右对齐", src: icon.v5 },
        { id: "top", label: "顶端对齐", src: icon.v6 },
        { id: "middle", label: "垂直居中对齐", src: icon.v7 },
        { id: "bottom", label: "底端对齐", src: icon.v8 },
      ],
    };
  },
  created() {
    //全局监听 节点选中事件
    let callback = (node) => {
      let props;
      if (node) {
        props = deepClone(properties[node.compType]);
        this.mdata =
          node.compType == "sequenceFlow"
            ? metadata.getEdgById(node.id)
            : metadata.getNodeById(node.id);
      } else {
        props = properties.workflow;
        this.mdata = metadata.getRootWorkflow();
     
      }
      this.props = props;
    };
    eventBus.$on(EVENTS.NODE_SELECTED, callback);
    eventBus.$on(EVENTS.GRAPH_LINE_SELECT, callback);
  },
  methods: {
    nodeAlign({ id }) {
      let nodes = metadata.getData().nodes.filter((node) => node.selected);
      if (nodes.length > 1) {
        align[id](nodes);
        nodes.forEach(node=>{
          align.updateLinkeNode(node);
        })
        metadata.getData().edges.forEach((item) => {
            item.d = edgeData(item, metadata.getData().nodes);
        });
        eventBus.$emit(EVENTS.METADATA_NODE_UPDATED);
        console.log("数据更新了");
      } else {
        this.$message({
          message: "请选择两个或两个以上的节点进行此操作",
          type: "warning",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.tools {
  height: 40px;
  justify-content: space-around;
  padding: 11px 10px;
  box-sizing: border-box;
  .tool-item {
    height: 18px;
    img {
      width: 18px;
      height: 18px;
      border: 1px dashed transparent;
      &:hover {
        border: 1px dashed #999;
      }
    }
  }
}
.property-panel {
  background: #fff;
  width: 300px;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  border-left: 1px solid #e6e6e6;
  .title-part {
    border-top: 1px solid #f0f0f0;
    font-size: 16px;
    font-weight: 500;
    line-height: 46px;
    color: #333;
    font-weight: bold;
    padding: 0 10px;
  }
  .content-part {
    overflow-y: auto;
    overflow-x:hidden;
    color: #333;
  }
}
</style>
