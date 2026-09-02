<template>
  <view>
    <!-- 筛选弹窗（排序 + 时间），圈子首页与圈子搜索页共用 -->
    <u-popup :show="visible" mode="bottom" :round="16" closeable :safeAreaInsetBottom="true" @close="onClose">
      <view class="sort-popup">
        <view class="sort-popup-title">{{ title }}</view>

        <view class="filter-group-title">排序</view>
        <view class="sort-options">
          <view v-for="option in sortOptions" :key="option.value" class="sort-option"
            :class="{ active: pendingSort == option.value }" @tap="pendingSort = option.value">{{ option.name }}</view>
        </view>

        <view class="filter-group-title">时间</view>
        <view class="time-options">
          <view v-for="option in timeOptions" :key="option.value" class="time-option"
            :class="{ active: pendingTime == option.value }" @tap="selectTimeFilter(option.value)">
            <text>{{ option.name }}</text>
            <text class="time-option-extra" v-if="option.extra">{{ option.extra }}</text>
          </view>
        </view>

        <view class="sort-confirm" @tap="onConfirm">确认</view>
      </view>
    </u-popup>

    <!-- 自定义时间范围选择：仅可选今天及以前日期（TDesign 日历，type=range，默认选中最近一周）
         custom-style 内联弹窗顶部圆角、confirm-btn 透传内联按钮样式：内联样式无视组件样式隔离，保证必生效 -->
    <t-calendar :visible="calendarVisible" type="range" switch-mode="month" title="选择日期" :min-date="minDate" :max-date="todayStr"
      :value="defaultRange" :custom-style="'border-top-left-radius: 32rpx; border-top-right-radius: 32rpx;'"
      :confirm-btn="{ style: 'height: 44px; line-height: 44px; border-radius: 4px; font-size: 15px; font-weight: 500;' }"
      @update:visible="onCalendarVisible" @confirm="onCalendarConfirm" @close="closeCalendar"></t-calendar>
  </view>
</template>

<script>
import TCalendar from '@tdesign/uniapp/calendar/calendar.vue';

/**
 * 圈子动态筛选弹窗（排序 + 时间）
 *
 * 受控组件：visible/sort/timeFilter/customRange 由父页面持有，
 * 打开时以当前生效筛选作为待选项；确认后通过 confirm 事件返回待应用的值，由父页面应用并刷新列表。
 * 自定义时间范围（日历）的交互闭环在组件内部完成：点自定义 → 关弹窗开日历 → 确认 → 回到弹窗。
 */
export default {
  name: 'circle-post-filter',
  components: { TCalendar },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    // 弹窗标题（动态筛选/搜索筛选）
    title: {
      type: String,
      default: '动态筛选',
    },
    // 当前生效排序（new/like/comment）
    sort: {
      type: String,
      default: 'new',
    },
    // 当前生效时间筛选（all/7/30/custom）
    timeFilter: {
      type: String,
      default: 'all',
    },
    // 当前生效的自定义时间范围（YYYY-MM-DD）
    customRange: {
      type: Object,
      default: () => ({ start: '', end: '' }),
    },
  },
  data() {
    return {
      pendingSort: 'new',
      pendingTime: 'all',
      pendingCustomRange: { start: '', end: '' },
      calendarVisible: false,
      fromCalendar: false, // 从日历返回弹窗的标志：回弹窗时不重置 pending 待选项
      defaultRange: [], // 日历默认选中（最近一周：6 天前 ~ 今天）
    };
  },
  computed: {
    sortOptions() {
      return [
        { name: '最新发布', value: 'new' },
        { name: '评论最多', value: 'comment' },
        { name: '获赞最多', value: 'like' },
      ];
    },
    timeOptions() {
      // 自定义范围已选时在选项内展示起止日期
      const extra = this.pendingCustomRange.start ? this.pendingCustomRange.start + ' ~ ' + this.pendingCustomRange.end : '';
      return [
        { name: '全部时间', value: 'all' },
        { name: '近七天', value: '7' },
        { name: '近30天', value: '30' },
        { name: '自定义', value: 'custom', extra },
      ];
    },
    // 日历最小可选日期：2020-01-01（TDesign 默认 min-date 为当前时刻，需显式放开历史日期）
    minDate() {
      return new Date(2020, 0, 1).getTime();
    },
    // 日历最大可选日期：今天 23:59:59 时间戳（今天可选、明天起禁用）
    todayStr() {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime();
    },
  },
  watch: {
    visible(n) {
      if (n) {
        if (!this.fromCalendar) {
          // 首次打开：以当前生效筛选作为待选项
          this.pendingSort = this.sort;
          this.pendingTime = this.timeFilter;
          this.pendingCustomRange = { start: this.customRange.start, end: this.customRange.end };
        }
        this.fromCalendar = false;
      }
    },
    calendarVisible(n) {
      if (n) {
        // 每次打开日历默认选中最近一周（6 天前 00:00 ~ 今天 23:59:59）
        this.defaultRange = this.getRecentRange();
      }
    },
  },
  methods: {
    // 关闭弹窗（遮罩/取消）
    onClose() {
      this.$emit('update:visible', false);
    },
    // 确认：返回待应用的筛选值，由父页面应用并刷新
    onConfirm() {
      this.$emit('confirm', {
        sort: this.pendingSort,
        timeFilter: this.pendingTime,
        customRange: this.pendingCustomRange,
      });
      this.$emit('update:visible', false);
    },
    // 选择时间筛选；自定义项弹出日历选择范围
    selectTimeFilter(value) {
      if (value != 'custom') {
        this.pendingTime = value;
        return;
      }
      this.$emit('update:visible', false);
      // 先准备受控 value，再打开日历，避免首次渲染时 value 为空导致日历面板无内容。
      this.defaultRange = this.getRecentRange();
      this.calendarVisible = true;
    },
    // 日历确认：TDesign range 模式 value 为起止时间戳数组（本地时区当日 00:00）
    onCalendarConfirm(e) {
      const list = (e && e.value) || [];
      if (list.length < 2) return;
      this.pendingTime = 'custom';
      this.pendingCustomRange = { start: this.formatDate(list[0]), end: this.formatDate(list[1]) };
      this.calendarVisible = false;
      // 标记从日历返回：回弹窗时保留刚选择的待选项，避免 visible watch 重置
      this.fromCalendar = true;
      // 回到筛选弹窗，继续确认筛选
      this.$emit('update:visible', true);
    },
    onCalendarVisible(e) {
      this.calendarVisible = e;
    },
    // 日历关闭（遮罩/取消）：回到筛选弹窗，保留弹窗中原有待选项
    closeCalendar() {
      this.calendarVisible = false;
      this.fromCalendar = true;
      this.$emit('update:visible', true);
    },
    // 时间戳转 YYYY-MM-DD（本地时区）
    formatDate(ts) {
      const d = new Date(ts);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },
    getRecentRange() {
      const d = new Date();
      return [
        new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6, 0, 0, 0).getTime(),
        new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime(),
      ];
    },
  },
};
</script>

<style scoped>
.sort-popup { display: flex; flex-direction: column; min-height: 300px; padding: 16px 14px; }
.sort-popup-title { color: #1d2129; font-size: 14px; font-weight: 600; }
.filter-group-title { margin-top: 18px; color: #1d2129; font-size: 13px; font-weight: 600; }
.sort-options { display: flex; gap: 7px; margin-top: 9px; }
.sort-option { flex: 1; padding: 9px 0; border-radius: 6px; background: #f6f7f9; color: #5e6670; font-size: 13px; text-align: center; }
.sort-option.active { background: #eaf3ff; color: #0968f6; font-weight: 600; }
.time-options { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 9px; margin-bottom: 20px; }
/* 高度固定（选中态不因内容变高）；短选项按 min-width 等宽一行四个，内容超长的选项（自定义日期范围）自动换行独占下一行 */
.time-option {
  flex: 0 1 auto;
  min-width: calc(25% - 7px);
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 6px;
  background: #f6f7f9;
  color: #5e6670;
  font-size: 13px;
  text-align: center;
  box-sizing: border-box;
}
.time-option.active { background: #eaf3ff; color: #0968f6; font-weight: 600; }
.time-option-extra { margin-top: 2px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; opacity: 0.75; }
/* 大按钮样式对齐全 App 惯例（44px 高/15px/字重500/主题蓝 #0968f6/4px 圆角） */
.sort-confirm { margin-top: auto; padding: 11px 0; border-radius: 4px; background: #0968f6; color: #fff; font-size: 15px; font-weight: 500; text-align: center; }
/* TDesign 日历：选中态/区间色对齐项目主题蓝 */
.t-calendar {
  --td-calendar-active-color: #0968f6;
  --td-calendar-item-centre-color: #eaf3ff;
}
</style>

<style>
/* 非 scoped 全局覆盖：TDesign 组件声明 styleIsolation=shared，允许外部样式穿透组件内部；
   高特异性 + !important 覆盖日历标题为靠左，对齐项目弹窗标题（sort-popup-title：14px/600/#1d2129） */
.t-calendar .t-calendar__title {
  padding-left: 14px !important;
  color: #1d2129 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 44px !important;
  text-align: left !important;
}
/* 日历确认按钮兜底样式（confirm-btn 内联样式为主，此处补强高度/字号） */
.t-calendar .t-calendar__confirm-btn .t-button {
  height: 44px !important;
  line-height: 44px !important;
  border-radius: 4px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
}
</style>
