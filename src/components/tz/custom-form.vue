<template>
  <view class="custom-form">
    <template v-for="(item, index) in components">
      <template
        v-if="item.type == 'divider' || item.type == 'image' || item.type == 'parse'"
      >
        <tz-box bgColor="none" padding="10px 0" v-if="item.type === 'image'">
          <tz-image
            :list="item.config.list"
            :col="item.config.col"
            :gap="item.config.gap"
            :height="item.config.height"
            :title_status="item.config.title_status"
            :round_status="item.config.round_status"
            :round_val="item.config.round_val"
          />
        </tz-box>
        <tz-box bgColor="none" padding="10px 0" v-if="item.type === 'divider'">
          <tz-divider
            :height="item.config.height"
            :bg-color="item.config.bgColor"
            v-if="item && item.type == 'divider'"
          />
        </tz-box>

        <tz-box bgColor="none" padding="10px 0" v-if="item.type === 'parse'">
          <tz-parse :content="item.config.content" />
        </tz-box>
      </template>
      <view class="form-item" v-else>
        <!-- 标题和描述 -->
        <view class="form-header" v-if="item.config.title_show">
          <div class="form-title">
            {{ item.config.title
            }}<text v-if="item.config.required" class="required">*</text>
          </div>
          <div v-if="item.config.title_desc" class="form-desc">{{ item.config.title_desc }}</div>
        </view>

        <tz-upload
          v-if="item.type === 'upload'"
          :disabled="disabled"
          :maxCount="item.config.max_count"
          v-model="formData[item.config.id]"
          @input="handleInput(item.config.id, $event)"
        />
        <!-- 输入框 -->
        <u-textarea
          class="u-input-diy"
          :disabled="disabled"
          v-if="item.type === 'textarea'"
          :maxlength="item.config.maxlength"
          :value="formData[item.config.id]"
          @input="handleInput(item.config.id, $event)"
          :placeholder="item.config.desc || '请输入'"
        ></u-textarea>

        <!-- 输入框 -->
        <u-input
          :disabled="disabled"
          class="u-input-diy"
          v-if="item.type === 'input'"
          :value="formData[item.config.id]"
          :maxlength="item.config.maxlength"
          @input="handleInput(item.config.id, $event)"
          :placeholder="item.config.desc || '请输入'"
        />

        <!-- 单选 -->
        <u-radio-group
          :disabled="disabled"
          v-if="item.type === 'radio'"
          placement="column"
          :value="formData[item.config.id]"
          @change="handleRadioChange(item.config.id, $event)"
        >
          <u-radio
            v-for="(option, optIndex) in item.config.options"
            :key="optIndex"
            :name="option"
            :label="option"
            class="radio-item"
            customStyle="margin:5px 0;"
          >
          </u-radio>
        </u-radio-group>

        <!-- 多选 -->
        <u-checkbox-group
          :disabled="disabled"
          v-if="item.type === 'checkbox'"
          placement="column"
          :value="formData[item.config.id]"
          @change="handleCheckboxChange(item.config.id, $event)"
        >
          <u-checkbox
            v-for="(option, optIndex) in item.config.options"
            :key="optIndex"
            :name="option"
            :label="option"
            class="checkbox-item"
            customStyle="margin:5px 0;"
          >
          </u-checkbox>
        </u-checkbox-group>

        <!-- 日期选择 -->
        <view v-if="item.type === 'date'" class="picker-container">
          <div @click="showPicker(item.config.id, 'date')" plain class="u-input-diy">
            {{ formData[item.config.id] || item.placeholder || "请选择日期" }}
          </div>

          <u-datetime-picker
            ref="datetimePicker"
            :max-date="Number(new Date(new Date().getFullYear() + 100, 11, 31))"
            :min-date="Number(new Date(new Date().getFullYear() - 100, 0, 1))"
            :show="pickerShow[item.config.id]"
            :value="computedDate(item.config.id)"
            :closeOnClickOverlay="true"
            mode="date"
            @confirm="handlePickerConfirm(item.config.id, $event)"
            @cancel="pickerShow[item.config.id] = false"
            @close="pickerShow[item.config.id] = false"
          />
        </view>

        <!-- 时间选择 -->
        <view v-if="item.type === 'time'" class="picker-container">
          <div @click="showPicker(item.config.id, 'time')" plain class="u-input-diy">
            {{ formData[item.config.id] || item.placeholder || "请选择时间" }}
          </div>
          <u-datetime-picker
            :show="pickerShow[item.config.id]"
            :value="formData[item.config.id]"
            :closeOnClickOverlay="true"
            mode="time"
            @confirm="handlePickerConfirm(item.config.id, $event)"
            @cancel="pickerShow[item.config.id] = false"
            @close="pickerShow[item.config.id] = false"
          />
        </view>
      </view>
    </template>
  </view>
</template>

<script>
export default {
  name: "CustomForm",
  props: {
    components: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [Object, Array],
      default: () => ({}),
    },
    disabled: {
      type: [Boolean, Number],
      default: false
    },
  },
  computed: {
    computedDate() {
    return (key) => {
      return this.formData[key] || this.getCurrentDateFormatted();
    };
  }
  },
  data() {
    return {
      formData: {},
      pickerShow: {}, // 存储每个picker的显示状态
    };
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(newVal) {
        // 初始化pickerShow状态
        this.components.forEach((item) => {
          if (item.type === "date" || item.type === "time") {
            this.$set(this.pickerShow, item.config.id, false);
          }
        });

        // 当外部value变化时更新内部formData
        this.formData = JSON.parse(JSON.stringify({ ...this.formData, ...newVal }));
      },
    },
  },
  created() {
    // 初始化表单数据
    this.initFormData();
  },
  methods: {
    getCurrentDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
    initFormData() {
      // 合并默认值和传入的value
      const defaultData = {};
      this.components.forEach((item) => {
        if (item.type === "checkbox") {
          defaultData[item.config.id] = Array.isArray(this.value[item.config.id])
            ? [...this.value[item.config.id]]
            : [];
        } else {
          defaultData[item.config.id] = this.value[item.config.id] || "";
        }
      });

      this.formData = JSON.parse(JSON.stringify({ ...defaultData, ...this.value }));
    },
    // 显示选择器
    showPicker(name, mode) {
      if (this.disabled) {
        return false;
      }
      this.$set(this.pickerShow, name, true);
    },
    // 处理选择器确认
    handlePickerConfirm(name, value) {
      if (value.mode == "date") {
        if(typeof value.value == "string"){
          this.updateFormData(name, value.value);
        }else{
          this.updateFormData(name, this.$tools.timestamp(value.value / 1000));
        }
        
      } else {
        this.updateFormData(name, value.value);
      }

      this.pickerShow[name] = false;
    },
    // 处理各种输入变化
    handleInput(name, value) {
      this.updateFormData(name, value);
    },
    handleRadioChange(name, value) {
      this.updateFormData(name, value);
    },
    handleCheckboxChange(name, value) {
      this.updateFormData(name, value);
    },
    updateFormData(name, value) {
      // 使用Vue.set确保响应式更新
      this.$set(this.formData, name, value);
      // 触发input事件更新v-model
      this.$emit("input", { ...this.formData });
    },
    // 验证表单方法（可由父组件调用）
    validate() {
      const missingFields = [];
      this.components.forEach((item) => {
        if (item.required) {
          if (
            item.type === "checkbox" &&
            (!this.formData[item.config.id] || this.formData[item.config.id].length === 0)
          ) {
            missingFields.push(item.title);
          } else if (!this.formData[item.config.id]) {
            missingFields.push(item.title);
          }
        }
      });

      if (missingFields.length > 0) {
        return {
          valid: false,
          message: `请填写${missingFields.join("、")}`,
        };
      }

      return {
        valid: true,
        data: { ...this.formData },
      };
    },
  },
};
</script>

<style scoped>
.custom-form {
  padding: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-header {
  /* display: flex; */
  align-items: center;
  margin-bottom: 15rpx;
}

.form-title {
  font-size: 14px;
  margin-right: 5px;
}

.form-title text {
  margin-left: 5px;
}

.form-desc {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.required {
  color: red;
}

.radio-item,
.checkbox-item {
  margin: 5px 0!important;
}

::v-deep .checkbox-item,::v-deep .radio-item{
  margin: 5px 0!important;
}

.picker-container {
  margin-top: 10rpx;
}

.u-input-diy {
  background-color: #fff;
  border: 1px solid #efefef;
  text-align: left;
  /* width: 100%; */
  padding: 10px 10px;
  border-radius: 4px;
}
</style>
