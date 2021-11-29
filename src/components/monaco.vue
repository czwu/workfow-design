<template>
      <div style="height: 100%">
        <el-row style="height: 100%; overflow: auto">
          <el-col :md="24" :lg="24" class="left-editor">
            <div id="code_json" v-show="activeTab == 'json'" class="tab-editor" />
            <div  id="code_xml" v-show="activeTab == 'xml'" class="tab-editor"  /> 
          </el-col>
        </el-row>
      </div>
</template>
<script>
// import { exportDefault, beautifierConf } from "@/render/src/utils/index";
import loadMonaco from "../utils/loadMonaco";
import loadBeautifier from "../utils/loadBeautifier";
import metadata from "../common/metadata";
import {compile} from "../plugin/xml/index"
let beautifier;
let monaco;
const monacoEditor = {
  json: "",
  xml: "",
};
export default {
  name: "monaco",
  props: {
    type: String,
  },
  data() {
    return {
      resourceVisible: false,
      drawer: false,
      scripts: [],
      links: [],
      monaco: null,
      activeTab: this.type,
      beautifier: null,
    };
  },
  watch: {
    type(val) {
      this.onOpen()
    },
  },
  created() {
    this.onOpen()
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    onOpen() {
      if(!this.type){
        return
      }
      this.activeTab = this.type;
      if (monaco) {
        this.loadCode(this.type, this.getCode(this.type));
        return;
      }
      loadBeautifier((btf) => {
        beautifier = btf;
        loadMonaco((val) => {
          monaco = val;
          this.loadCode();
        });
      });
    },
    loadCode(type, value) {
      if (monacoEditor[type]) {
        monacoEditor[type].setValue(value);
        return;
      }
      monacoEditor.json = monaco.editor.create(
        document.getElementById("code_json"),
        {
          value: this.getCode("json"),
          theme: "Visual Studio",
          language: "json",
          automaticLayout: true
        }
      );
      monacoEditor.xml = monaco.editor.create(
        document.getElementById("code_xml"),
        {
          value: this.getCode("xml"),
          theme: "Visual Studio",
          language: "xml",
          automaticLayout: true,
        }
      );
    },
    getCode(type) {
      if (type == "xml") {
        return beautifier.html(compile.compile());
      } else {
        return beautifier.js(metadata.toJson());
      }
    },
    onClose() {},
  },
};
</script>

<style lang="scss" scoped>
.tab-editor {
  position: absolute;
  top: 5px;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 14px;
}
.left-editor {
  position: relative;
  height: 100%;
  overflow: hidden;
}
::v-deep .code .el-drawer__header {
  margin-bottom: 2px;
  display: none;
}
.close-btn {
  position: absolute;
  right: 10px;
  top: 2px;
  background: #504a4a;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  display: block;
  height: 30px;
  line-height: 30px;
  padding: 0 20px;
  z-index: 9999;
}
</style>
<style lang="sass">
.editor-tabs
  background: #121315
  & .el-tabs__header
    margin: 0
    border-bottom-color: #121315
    & .el-tabs__header .el-tabs__nav
      border-color: #121315

    & .el-tabs__item
      height: 32px
      line-height: 32px
      color: #888a8e
      border-left: 1px solid #121315 !important
      background: #363636
      margin-right: 5px
      user-select: none
    & .el-tabs__item.is-active
      background: #1e1e1e
      border-bottom-color: #1e1e1e !important
      color: #fff
    & .el-icon-edit
      color: #f1fa8c
    & .el-icon-document
      color: #a95812
    & :focus.is-active.is-focus:not(:active)
      box-shadow: none
      border-radius: 0
</style>