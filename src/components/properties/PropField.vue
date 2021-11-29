<template>
  <div class="props-field">
    <!-- text 普通文本框-->
    <el-input
      v-if="field.type == 'input'"
      :value="value"
      :disabled="field.disabled ? true : false"
      @input="changeValue(field, $event)"
      :placeholder="field.placeholder"
    >
      <template slot="append" v-if="field.appendField">
        <el-select
          @change="changeValue(field.appendField, $event)"
          slot="append"
          v-model="field.appendField.value"
          :style="{ width: '70px' }"
        >
          <el-option
            :label="item"
            :value="item"
            v-for="item in field.appendField.options"
            :key="item"
          />
        </el-select>
      </template>
      <template slot="append" v-else-if="field.append">
        {{ field.append }}
      </template>
    </el-input>
    <!-- Number 数字-->

    <el-input-number
      v-if="field.type == 'number'"
      :value="value"
      :controls-position="field.controlPos"
      @change="changeValue(field, $event)"
      :min="field.min"
      :step="field.step || 1"
      :max="field.max"
      :style="field.style"
    ></el-input-number>
    <!-- select 下拉选择-->

    <el-select
      v-if="field.type == 'select'"
      :key="Math.random()"
      :value="value"
      :placeholder="field.placeholder || '请选择'"
      style="width: 100%"
      :filterable="field.filterable"
      :multiple="field.multiple"
      :multiple-limit="field.multipleLimit"
      @change="changeValue(field, $event)"
      clearable
    >
      <template v-if="field.options == 'role'">
        <el-option v-for="(item, index) in roles" :key="index"  :label='item.label' :value='item.value' />
      </template>
      <template v-else-if="field.options == 'group'">
        <el-option v-for="(item, index) in groups" :key="index"  :label='item.label' :value='item.value' />
      </template>
      <template v-else>
        <template v-for="(item, index) in field.options">
          <el-option
            v-if="typeof item == 'string'"
            :key="index"
            :label="item"
            :value="item"
          />
          <el-option
            v-else
            :key="index"
            :label="item[field.labelField || 'label']"
            :value="item[field.valueField || 'value']"
          />
        </template>
      </template>
    </el-select>

    <!-- radio 单选-->
    <el-radio-group
      v-if="field.type == 'radio'"
      :value="value"
      @change="changeValue(field, $event)"
    >
      <template v-for="item in field.options">
        <el-radio-button
          v-if="typeof item == 'string'"
          :label="item"
          :key="item"
        >
          {{ item }}
        </el-radio-button>
        <el-radio-button
          v-else
          :label="item[field.valueField || 'value']"
          :key="item[field.valueField || 'value']"
        >
          {{ item[field.labelField || "label"] }}
        </el-radio-button>
      </template>
    </el-radio-group>

    <!-- checkbox -->
    <el-form-item
      v-if="field.type == 'checkbox' && checkField(field)"
      :label="field.label"
      :key="index"
    >
      <el-checkbox
        :value="value"
        @change="changeValue(field, $event)"
      ></el-checkbox>
    </el-form-item>

    <!-- switch 开关-->

    <el-switch
      v-if="field.type == 'switch'"
      :value="value"
      :disabled="field.disabled"
      @change="changeValue(field, $event)"
    >
    </el-switch>
    <!-- color 颜色选择-->

    <el-color-picker
      v-if="field.type == 'color'"
      :value="value"
      @change="changeValue(field, $event)"
    ></el-color-picker>
    <!-- textarea -->

    <el-input
      v-if="field.type == 'textarea'"
      type="textarea"
      :rows="field.rows"
      :icon="field.placeholder"
      :value="value"
      :show-word-limit="field.showWordLimit"
      :maxlength="field.maxlength"
    >
    </el-input>

    <!-- 选择用户 -->
    <user-dialog v-if="field.type == 'selectUser'" :value="value" @change="changeValue(field, $event)" />

    <!-- 选择子流程 -->
    <subflow v-if="field.type == 'selectSubflow'" :value="value" @change="changeValue(field, $event)" />


  </div>
</template>
<script>
import userDialog from "./userDialog";
import subflow from "./subflow.vue";
import service from "../../common/service";
export default {
  name: "PropField",
  props: ["field", "value"],
  data() {
    return { 
      users: [],
      roles: [],
      groups: [],
    };
  },
  created() {
    let options = this.field.options;
    this.loadOptions(options);
  },
  watch: {
    field(val) {
      this.loadOptions(val.options);
    },
  },

  components: { userDialog, subflow },
  methods: {
    loadOptions(type) {
      if (type == "role") {
        this.loadRoles();
      } else if (type == "group") {
        this.loadUserGroups();
      }
    },
    changeValue(field, value) {
      this.$emit("input", value);
      this.$emit("change", value);
    },
    loadRoles() {
      if (!this.roles.length) {
        service.queryRoles().then(({ data }) => {
          this.roles = data.list.map((d) => {
            return { value: d.roleCode, label: d.roleName };
          });
        });
      }
    },
    loadUserGroups() {
      if (!this.groups.length) {
        service.queryUserGroups().then(({ data }) => {
         this.groups = data.list.map((d) => {
            return { value: d.userGroupCode, label: d.userGroupName };
          });
        });
      }
    },
  },
};
</script>
<style lang="scss">
.props-field {
  .el-input-group__append,
  .el-input-group__prepend {
    padding: 0 15px;
  }
}
</style>