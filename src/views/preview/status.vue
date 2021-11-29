<template>
  <div class="status-list">
    <div class="item" v-for="(item, index) in list" :key="index">
      <span
        class="status-icon"
        :style="{ 'background-image': 'url(' + icon[item.icon] + ')' }"
      ></span>
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>

<script>
import { icon } from "@/components/icon/index.js";
export default {
  data() {
    return {
      icon,
      list: [
        {
          icon: "done",
          text: "已处理",
        },
        {
          icon: "doing",
          text: "处理中",
        },
        {
          icon: "undo",
          text: "待处理",
        },
        {
          icon: "jump",
          text: "跳过",
        },
        {
          icon: "doneLine",
          text: "已经过的出口",
        },
        {
          icon: "jump",
          text: "跳过的出口",
        },
        {
          icon: "undoLine",
          text: "未经过的出口",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.status-list {
  display: flex;
  flex-direction: row;
  justify-content: center;
  color: #333;
  font-size: 14px;
  line-height: 50px;
  background: #F8F8F8;
  .item {
    display: flex;
    justify-content: center;
    padding-right: 40px;
    .status-icon {
      height:50px;
      width:30px;
      background-repeat: no-repeat;
      background-position: center right;
      background-size: 16px;
      margin-right: 10px;
    }
  }
}
</style>
