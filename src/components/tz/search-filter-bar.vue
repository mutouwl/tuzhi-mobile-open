<template>
  <view class="tz-search-filter-bar">
    <!-- 通用搜索栏：TDesign 搜索框 + 右侧筛选按钮（筛选弹窗用 tz-filter-popup） -->
    <t-search :value="value" :placeholder="placeholder" shape="square" :clearable="true" :focus="focus" :maxlength="maxlength" @change="onChange" @submit="onSubmit">
      <template #action>
        <view class="filter-btn" @tap="onFilter">
          <tz-icon :name="filterIcon" :size="20" :color="filterActive ? '#0968f6' : '#86909c'" />
        </view>
      </template>
    </t-search>
  </view>
</template>

<script>
/**
 * 搜索栏（搜索框 + 右侧筛选按钮），圈子搜索页与教务流水/上课记录页共用
 * t-search 在 Vue2 下不支持 v-model：change/submit 原样抛出事件对象（父页面从 e.value 取关键词），
 * 另发 input 事件（纯文本）方便父页面直接 v-model。
 * 筛选按钮点击抛 filter 事件，由父页面打开 tz-filter-popup。
 */
export default {
  name: 'tz-search-filter-bar',
  props: {
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请输入搜索内容',
    },
    maxlength: {
      type: [Number, String],
      default: 30,
    },
    // 搜索框自动聚焦（进入页面后由父页面置 true 拉起键盘）
    focus: {
      type: Boolean,
      default: false,
    },
    // 筛选条件生效中（非默认筛选），驱动筛选按钮主题色
    filterActive: {
      type: Boolean,
      default: false,
    },
    // 筛选按钮图标（教务流水/上课记录页按「时间范围」图标传入，其余默认排序图标）
    filterIcon: {
      type: String,
      default: 'paixu',
    },
  },
  methods: {
    onChange(e) {
      this.$emit('change', e);
      this.$emit('input', (e && e.value) || '');
    },
    onSubmit(e) {
      this.$emit('submit', e);
    },
    onFilter() {
      this.$emit('filter');
    },
  },
};
</script>

<style scoped>
/* 吸顶固定白底通栏，滚动列表时搜索栏常驻 */
.tz-search-filter-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 8px 12px;
  background: #fff;
  /* tdesign t-search 尺寸/配色变量：紧凑搜索栏对齐项目移动端风格 */
  --td-search-height: 32px;
  --td-search-padding: 0 12px;
  --td-search-icon-size: 16px;
  --td-search-clear-icon-size: 16px;
  --td-search-font: 14px;
  --td-search-placeholder-color: #86909c;
  /* 方形搜索框圆角：对齐项目 4px 圆角惯例 */
  --td-search-square-radius: 4px;
}
.filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  padding: 2px;
}
</style>
