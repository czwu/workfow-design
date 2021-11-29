<template>
  <div class="container flex-col flex-grow">
    <component :is="comp" :params="params"></component>
  </div>
</template>
<script>
import designer from "./views/designer";
import preview from "./views/preview";
import { getUrlParams } from "./utils/tools";
import app from "./common/app";

export default {
  data() {
    return {
      comp: "designer",
      params: null,
    };
  },
  created() {
    this.params = getUrlParams();
    console.log('this.params.mode',this.params.mode)
    if (this.params.mode == "preview") {
      this.comp = "preview";
    }
  },
  mounted() {
    app.init();
  },
  components: {
    designer,
    preview
  },
};
</script>
