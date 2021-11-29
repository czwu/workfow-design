<template>
  <div class="preview flex-col flex-grow">
    <status />
    <section class="flex-row flex-grow">
      <preview-graph :progress="progress"></preview-graph>
    </section>
    <el-dialog
      title="查看子流程"
      :visible.sync="showSubFlow"
      width="70vw"
      :close-on-click-modal="false"
      custom-class="sub-dialog"
    >
      <div class="dialog-content">
        <preview-graph
          :progress="subProgress"
          style="width: 2000px"
          v-if="subProgress"
        ></preview-graph>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import status from "./preview/status";
import PreviewGraph from "./preview/PreviewGraph";
import service from "../common/service";
import metadata from "../common/metadata";
import { parser } from "../plugin/xml";
import eventBus, { EVENTS } from "../common/eventBus";
export default {
  name: "Preview",
  props: ["params"],
  components: { status, PreviewGraph },
  data() {
    return {
      progress: null,
      showSubFlow: false,
      subProgress: null,
    };
  },
  created() {
    let modelId = this.params.modelId;
    let instanceId = this.params.instanceId;
    let modelKey = this.params.modelKey;
    if (modelId) {
      service.queryById(modelId).then(({ data }) => {
        parser.xml2Meta(data.xml);
        metadata.getData().workflow.modelId = modelId;
      });
    } else if (instanceId) {
      service.queryByInstanceId(instanceId).then(({ data }) => {
        parser.xml2Meta(data.xml);
        this.progress = { ...data };
      });
    } else if (modelKey) {
      service.querymodelbykey(modelKey).then(({ data }) => {
        parser.xml2Meta(data.xml);
        metadata.getData().modelId = data.modelId;
      });
    }

    eventBus.$on(EVENTS.SHOW_SUBFLOW, (data) => {
      service.getSubInfo({ processInstanceId: instanceId }).then((res) => {
        let subid = res.data;
        service.queryByInstanceId(subid).then(({ data }) => {
          this.subProgress = { ...data };
        });
        this.showSubFlow = true;
      });
    });
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.header-title {
  line-height: 50px;
  font-size: 16px;
  color: #666;
  font-weight: bold;
}
.dialog-content {
  height: 530px;
  overflow-x: auto;
}
::v-deep .el-dialog__body {
  padding: 0 2px 2px 0;
}
::v-deep .el-dialog__header {
  padding: 20px 15px;
  padding-bottom: 15px;
  border-bottom: 1px #d9d9d9 solid;
}
::v-deep .el-dialog__title {
  line-height: 24px;
  font-size: 16px;
  color: #666;
  font-weight: bold;
}
</style>