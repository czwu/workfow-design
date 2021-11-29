<template>
  <div class="props-editor">
    <el-form size="small" label-width="60px" label-position="left">
      <template v-for="(field, index) in fields">
        <!-- 分割线 -->
        <div class="divider" v-if="field.type == 'divider' && checkField(field)" :key="index">
          {{ field.label }}
        </div>
        <!-- text 普通文本框-->
        <el-form-item v-if="field.type == 'input' && checkField(field)"  :label="field.label" :key="field.mapping"
        >
          <el-input
            v-model="field.value"
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
        </el-form-item>
        <!-- Number 数字-->
        <el-form-item
          v-if="field.type == 'number' && checkField(field)"
          :label="field.label"
          :key="index"
        >
          <el-input-number
            v-model="field.value"
            :controls-position="field.controlPos"
            @input="changeValue(field, $event)"
            :min="field.min"
            :step="field.step || 1"
            :max="field.max"
          ></el-input-number>
        </el-form-item>
        <!-- select 下拉选择-->
        <el-form-item
          v-if="field.type == 'select' && checkField(field)"
          :label="field.label"
          :key="index"
        >
          <el-select
            v-model="field.value"
            :placeholder="field.placeholder || '请选择'"
            style="width: 100%"
            @change="changeValue(field, $event)"
            clearable
          >
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
          </el-select>
        </el-form-item>
        <!-- slide 滑块-->
        <el-form-item
          v-if="field.type == 'slider' && checkField(field)"
          :label="field.label"
          :key="index"
        >
          <el-slider
            v-model="field.value"
            :max="field.max || 24"
            :min="field.min || 0"
            :marks="field.marks"
            :range="!!field.range"
            @change="changeValue(field, $event)"
          />
        </el-form-item>
        <!-- radio 单选-->
        <el-form-item
          v-if="field.type == 'radio' && checkField(field)"
          :label="field.label"
     
          :key="index"
        >
          <el-radio-group
            v-model="field.value"
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
        </el-form-item>

        <!-- checkbox -->
        <el-form-item
          v-if="field.type == 'checkbox' && checkField(field)"
          :label="field.label"
          :key="index"
        >
          <el-checkbox
            v-model="field.value"
            @change="changeValue(field, $event)"
          ></el-checkbox>
        </el-form-item>

        <!-- switch 开关-->
        <el-form-item
          v-if="field.type == 'switch' && checkField(field)"
          :label="field.label"
          :key="index"
               label-width="80px"
        >
          <el-switch
            v-model="field.value"
            :disabled="field.disabled"
            @change="changeValue(field, $event)"
          >
          </el-switch>
        </el-form-item>
        <!-- color 颜色选择-->
        <el-form-item
          v-if="field.type == 'color' && checkField(field)"
          :label="field.label"
          :key="index"
        >
          <el-color-picker
            v-model="field.value"
            @change="changeValue(field, $event)"
          ></el-color-picker>
        </el-form-item>
        <!-- textarea -->
        <el-form-item
          v-if="field.type == 'textarea' && checkField(field)"
          :label="field.label"
          :key="index"
        >
          <el-input
            type="textarea"
            :rows="field.rows"
            :icon="field.placeholder"
            v-model="field.value"
            :show-word-limit="field.showWordLimit"
            :maxlength="field.maxlength"
            @input="changeValue(field, $event)"
          >
          </el-input>
        </el-form-item>

        <!-- selectSubflow -->
        <el-form-item
          v-if="field.type == 'selectSubflow' && checkField(field)"
          :label="field.label"
          :key="index"
        >
          <!-- 选择子流程 -->
          <template v-if="isMdc">
            <mdcsubflow v-model="field.value" :nodeData="data" @change="changeValue(field, $event)" />
          </template>
        </el-form-item>

        <!-- $List 列表数据 -->
        <div
          class="dynamic-list"
          :key="index"
          v-if="field.type == '$List' && checkField(field)"
        >
          <template v-if="Array.isArray(field.value)">
            <div
              class="flex-row dynamic-list-row"
              v-for="(row, index) in field.value"
              :key="index"
            >
              <!-- <div class="select-line-icon option-drag icon-btn" v-if="field.value.length>1">
                <i class="el-icon-sort" />
              </div> -->
              <div
                class="flex-row list-col-item flex-grow"
                v-for="col in field.columns"
                :key="col.field"
                :style="col.style"
              >
                <prop-field
                  v-model="field.value[index][col.field]"
                  :field="col.dynamic ? col.dynamic(field.value[index]) : col"
                  @change="listItemChangeValue(field, col, index, $event)"
                ></prop-field>
              </div>
              <div
                class="close-btn icon-btn"
                v-if="field.supportDelRow"
                @click="field.value.splice(index, 1)"
              >
                <i class="el-icon-remove-outline" />
              </div>
            </div>
          </template>
          <div style="margin: 0 0 20px 20px" v-if="field.supportAddRow">
            <el-button
              style="padding-bottom: 0"
              icon="el-icon-circle-plus-outline"
              type="text"
              @click="addRowHandler(field)"
            >
              {{ field.addLabel }}
            </el-button>
          </div>
        </div>
      </template>
    </el-form>
  </div>
</template>
<script>
import { getValueByPath, setValueByPath, getUrlParams } from "../../utils/tools"; 
import mdcsubflow from "./mdcSubflow.vue";
import PropField from "./PropField";
export default {
  name: "propsEditor",
  props: {
    // 组件配置属性
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    props: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      isMdc: false,
      currOpField: null, //当前操作的配置对象
      propsData: this.data,
      fields: [],
      propsType: "",
    };
  },
  components: { PropField, mdcsubflow },
  watch: {
    data(newval) {
      this.propsData = newval;
      this.sync2Value();
    },
    props(newval) {
      this.fields = newval;
      this.sync2Value();
    },
  },
  created() {
    this.fields = this.props;
    this.sync2Value();
    this.isMdc = getUrlParams().sourceCode === 'mdc';
    setTimeout(() => {
      console.log(this.data, this.props)
    }, 1000)
  },
  methods: {
    checkField(field) {
      if (field.vif) {
        let valType = typeof field.vif;
        if (valType == "string") {
          return getValueByPath(this.propsData, field.vif);
        } else if (valType == "object") {
          for (var attr in field.vif) {
            let isEquels =
              getValueByPath(this.propsData, attr) == field.vif[attr];
            if (!isEquels) {
              return false;
            }
          }
        } else if (valType == "function") {
          return field.vif(this.propsData);
        }
      }
      return true;
    },
    sync2Value() {
      this.$nextTick(() => {
        //将属性数据同步到 属性编辑器中
        this.fields.forEach((field, i) => {
          if (field.mapping) {
            let val = getValueByPath(this.propsData, field.mapping);
            if (val !== undefined && val !== null) {
              if (
                !Array.isArray(val) &&
                typeof val == "object" &&
                typeof field.value == "object"
              ) {
                Object.assign(field.value, val);
              } else {
                field.value = val;
              }
            } else if (field.value) {
              this.sync2PropsData(field, field.value);
            }
          }
        });
      })
    },
    //将数据同步到propsData中
    sync2PropsData(field, value) {
      if (field.mapping) {
        setValueByPath(this.propsData, value, field.mapping);
      }
      //如果包含数组值映射关系,需要修改数组对象,使其刷新
      if (field.mapping.indexOf("[") > 0) {
        let mapping = field.mapping.split("[")[0];
        let val = getValueByPath(this.propsData, mapping);
        val = [].concat(val);
        setValueByPath(this.propsData, val, mapping);
      }
    },
    changeValue(field, value) {
      if (field.beforeChange) {
        let ret = field.beforeChange(value, this.propsData);
        if (ret === false) {
          return;
        } else {
          value = ret;
        }
      }
      this.sync2PropsData(field, value);
      if (field.onChange) {
        let ret = field.onChange(value, this.propsData);
        if (ret === true) {
          this.sync2Value();
        }
      }
      // this.$forceUpdate();
    },
    changeValueChild(field) {
      this.sync2PropsData(field, field.value);
    },
    listItemChangeValue(field, item, index, value) {
      field.value[index][item.field] = value;
      this.sync2PropsData(field, field.value);
      if (item.onChange) {
        item.onChange(value, field.value[index], field);
      }
    },
    addRowHandler(field) {
      let newRow = field.addHandler
        ? field.addHandler(this.propsData)
        : { [field.labelField || "label"]: "" };
      newRow && field.value.push(newRow);
      this.sync2PropsData(field, field.value);
    },
  },
};
</script>
<style lang="scss" scoped>
.dynamic-list-row {
  line-height: 30px;
  margin-bottom: 5px;
  .icon-btn {
    padding: 0 5px;
    color: #3f73f3;
    cursor: pointer;
  }
  .close-btn {
    color: Red;
  }
  .list-col-item {
    padding: 0 2px;
  }
}

.span-btn {
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
}
.divider{
  border-top:1px solid #f0f0f0;
  line-height: 46px;
  font-size: 14px;
  color:#666;
  font-weight: bold;
}
.el-form-item--small.el-form-item {
    margin-bottom: 13px !important;
}
</style>
<style lang="scss">
.props-editor {
  .el-input-group__append,
  .el-input-group__prepend {
    padding: 0 15px;
  }
}
</style>