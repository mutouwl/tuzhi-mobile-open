<template>
  <view class="tz-school-calendar">
    <!-- 周日历条：仅显示一周，左右箭头翻周，点年月弹出日历选择器；日期下方标注当天数量 -->
    <view class="cal-card">
      <view class="cal-head">
        <view class="cal-arrow" @click="prevWeek"><tz-icon name="return" :size="16" color="#4E5969" /></view>
        <view class="cal-label" @click="openCal">
          <text>{{ weekLabel }}</text>
          <tz-icon name="unfold" :size="12" color="#4E5969" />
        </view>
        <view class="cal-arrow" @click="nextWeek"><tz-icon name="enter" :size="16" color="#4E5969" /></view>
      </view>
      <view class="cal-week">
        <view class="cal-day" v-for="d in weekDays" :key="d.ts" :class="{ on: selectedTs == d.ts }" @click="onStripPick(d)">
          <text class="cd-name">{{ d.name }}</text>
          <text class="cd-num">{{ d.num }}</text>
          <text class="cd-count" :class="{ zero: !d.count }">{{ d.count }}{{ countUnit }}</text>
        </view>
      </view>
    </view>

    <!-- 选择日期弹窗：自绘单月面板（周一开头，日期下方标注当天数量，点日选中、确认后跳到该天）。
         不使用 TDesign t-calendar：其月面板依赖 format 函数 prop，mp-weixin 下函数过不了渲染层
         序列化、直写又会被回传冲掉（三轮验证均不可靠）；自绘为纯页面数据渲染，全端行为一致。
         数量按月统计：打开与切月时按当前展示月拉取，拉取失败不关弹窗（面板照常可点日/确认）。
         safe-area-inset-bottom 必须显式置 false：uview 默认为 true，会在弹窗内容下方插入
         env(safe-area-inset-bottom) 高的空白节点，顶部弹窗底边在屏幕中部用不上避让，只表现为
         「确认」按钮与卡片圆角底边之间多出一条白带（页面底部安全区已由 tz-tab-bar 处理） -->
    <u-popup
      :show="calVisible"
      mode="top"
      :round="12"
      closeable
      :close-on-click-overlay="!calLoading"
      :safe-area-inset-bottom="false"
      :z-index="11500"
      bg-color="#ffffff"
      @close="onCalClose"
    >
      <view class="cal-panel">
        <!-- 月面板：始终渲染保持高度稳定，加载时蒙上加载蒙版（不改变面板高度） -->
        <view class="cal-panel-title">选择日期</view>
        <view class="cal-panel-head">
          <view class="cal-panel-arrow" :class="{ off: !calCanPrev }" @click="calShiftMonth(-1)">
            <tz-icon name="return" :size="14" color="#4E5969" />
          </view>
          <text class="cal-panel-month">{{ calYear }}年{{ calMonth + 1 }}月</text>
          <view class="cal-panel-arrow" :class="{ off: !calCanNext }" @click="calShiftMonth(1)">
            <tz-icon name="enter" :size="14" color="#4E5969" />
          </view>
        </view>
        <view class="cal-panel-week">
          <text class="cal-panel-week-item" v-for="w in calWeek" :key="w">{{ w }}</text>
        </view>
        <view class="cal-panel-grid">
          <view class="cal-panel-cell" v-for="(d, i) in calDays" :key="i" @click="onCalPick(d)">
            <view class="cal-panel-day" :class="{ selected: d.selected, disabled: d.disabled, today: d.today && !d.selected }">{{ d.day || '' }}</view>
            <text class="cal-panel-count" v-if="d.day" :class="{ zero: !d.count }">{{ d.count }}{{ countUnit }}</text>
          </view>
        </view>
        <view class="cal-panel-confirm" @click="onCalConfirmTap">确认</view>
        <!-- 加载蒙版：覆盖面板之上，遮罩+居中旋转图标，不改变面板高度 -->
        <view class="cal-mask" v-if="calLoading">
          <view class="cal-mask-inner">
            <u-loading-icon mode="circle" size="24" />
            <text class="cal-mask-text">{{ loadingText }}</text>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
/**
 * 教务日历（周日历条 + 自绘月面板），「我的课表」与「预约上课」共用
 *
 * 用法：
 *   <tz-school-calendar v-model="selectedTs" :student-id="studentId" :week-counts="dayCountMap"
 *       counts-api="school.user.scheduleCounts" count-unit="节" loading-text="正在加载课次…"
 *       @change="refresh" />
 *
 * 职责边界：
 *   - 组件只负责「选日期」与「日历角标」，不关心列表内容；选中日期经 v-model 回传，变化时抛 change
 *   - 周内角标由父组件把已加载数据的每日数量经 week-counts 传入（避免重复请求）
 *   - 月面板角标由组件按 counts-api 自行按月拉取（两页只是接口名与计数单位不同）
 *   - 月面板拉数量时必须带上列表的筛选条件（counts-params），否则会出现
 *     「日历标着有 N 场、点进去列表一条都没有」（如预约页按课程筛选、角标却统计全部课程）
 */
import { WEEK_MS, fmtDate, mondayOf, todayStart } from '@/common/utils/school-date';

// 每日数量映射 { 'YYYY-MM-DD': n } 归一化：后端没有数据时下发空映射，而 PHP 的空数组
// json_encode 出来是 [] （JS 判为 Array），直接按字典取值虽不出错，但会触发
// 「Invalid prop: type check failed for prop "weekCounts"」。统一归一化成对象再用
const toCountMap = (v) => (v && !Array.isArray(v) ? v : {});

export default {
  name: 'tz-school-calendar',
  props: {
    // 选中的日期（当天 0 点时间戳），v-model
    value: {
      type: Number,
      default: 0,
    },
    // 学员 ID：为 0 时不允许打开月面板（提示先在教务中心选择学员）
    studentId: {
      type: [Number, String],
      default: 0,
    },
    // 周内每日数量 { 'YYYY-MM-DD': n }，由父组件从已加载列表/接口派生。
    // 类型放宽到 Array：父页的映射来自接口，无数据时后端会下发成 [] 的空映射（见 toCountMap），
    // 声明成 Object 会在每次进页面时打一条 prop 类型告警
    weekCounts: {
      type: [Object, Array],
      default: () => ({}),
    },
    // 月面板角标接口（学校课表用 scheduleCounts，预约用 bookableCounts）
    countsApi: {
      type: String,
      default: 'school.user.scheduleCounts',
    },
    // 月面板拉角标时的附加参数：必须与父页列表的筛选条件一致（预约页传 {course_id: 23}），
    // 否则角标统计的课程范围比列表宽，会出现「日历有场次、列表为空」
    countsParams: {
      type: Object,
      default: () => ({}),
    },
    // 角标计数单位（节 / 场）
    countUnit: {
      type: String,
      default: '节',
    },
    // 月面板加载蒙版文案
    loadingText: {
      type: String,
      default: '正在加载…',
    },
    // 未选择学员时的提示文案
    studentTip: {
      type: String,
      default: '请先在教务中心选择学员',
    },
  },
  data() {
    return {
      // 选择日期弹窗（自绘月面板）：可选范围前后各 180 天
      calVisible: false,
      minDate: todayStart() - 180 * 86400000,
      maxDate: todayStart() + 180 * 86400000,
      // 月面板每日数量：{ 'YYYY-MM-DD': 数量 }
      calCountMap: {},
      calLoading: false,
      // 弹窗展示的年月（calMonth 0 基）与选中日（当天 0 点时间戳）
      calYear: 0,
      calMonth: 0,
      calPicked: 0,
      // 星期表头（周一为第一列）
      calWeek: ['一', '二', '三', '四', '五', '六', '日'],
    };
  },
  computed: {
    selectedTs() {
      return this.value || todayStart();
    },
    // 当前选中日期所在周的周一
    weekStart() {
      return mondayOf(this.selectedTs);
    },
    // 当前周一至周日（count 为当天数量，来自父组件传入的已加载数据）
    weekDays() {
      const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const start = this.weekStart.getTime();
      const arr = [];
      for (let i = 0; i < 7; i++) {
        const ts = start + i * 86400000;
        arr.push({ ts, num: new Date(ts).getDate(), name: names[i], count: toCountMap(this.weekCounts)[fmtDate(ts)] || 0 });
      }
      return arr;
    },
    weekLabel() {
      return this.weekStart.getFullYear() + '年' + (this.weekStart.getMonth() + 1) + '月';
    },
    // 月面板 6×7 网格（周一开头）：标注/禁用/选中一次性算好，切月即重新求值
    calDays() {
      const lead = (new Date(this.calYear, this.calMonth, 1).getDay() + 6) % 7;
      const start = new Date(this.calYear, this.calMonth, 1 - lead);
      const today = fmtDate(new Date());
      const days = [];
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const key = fmtDate(d);
        const inMonth = d.getMonth() === this.calMonth;
        days.push({
          day: inMonth ? d.getDate() : 0,
          ts: d.getTime(),
          count: this.calCountMap[key] || 0,
          disabled: d.getTime() < this.minDate || d.getTime() > this.maxDate,
          selected: d.getTime() === this.calPicked,
          today: key === today,
        });
      }
      return days;
    },
    // 上/下月是否可切（范围内还有可选日期；min/max 均为当天 0 点）
    calCanPrev() {
      return new Date(this.calYear, this.calMonth, 0).getTime() >= this.minDate;
    },
    calCanNext() {
      return new Date(this.calYear, this.calMonth + 1, 1).getTime() <= this.maxDate;
    },
  },
  methods: {
    // 选中日期变化统一出口：v-model 回传 + 抛 change 供父组件刷新列表
    emitChange(ts) {
      this.$emit('input', ts);
      this.$emit('change', ts);
    },
    prevWeek() { this.shiftWeek(-1); },
    nextWeek() { this.shiftWeek(1); },
    // 翻周：目标周含今天或已是过去 → 保持周内同一星期（周一 + 偏移天数）；
    // 目标日期落在今天之后 → 落到该周左侧第一个可选日（整周在未来＝该周周一，
    // 与今天同周＝今天）。此前一律保持星期：点周五再翻下周只能停在周五，
    // 而未来的周一到周四全是空白日，用户还得自己点回来，落点应是未来最早那天
    shiftWeek(count) {
      const start = this.weekStart.getTime();
      const idx = Math.min(6, Math.max(0, Math.round((this.selectedTs - start) / 86400000)));
      const target = start + count * WEEK_MS + idx * 86400000;
      const today = todayStart();
      if (target <= today) {
        this.emitChange(target);
        return;
      }
      // mondayOf 按日历日回退，不靠毫秒加减；与 weekDays 的周一起点同口径，高亮可精确命中
      this.emitChange(Math.max(mondayOf(target).getTime(), today));
    },
    onStripPick(d) {
      this.emitChange(d.ts);
    },
    // 打开弹窗：以当前选中日期为展示月与选中日，先显示蒙版并拉取每日数量
    openCal() {
      if (this.calLoading || this.calVisible) return;
      if (!this.studentId) {
        // 未选中学员时明确告知去教务中心选择，避免点击年份毫无反馈
        uni.showModal({ title: '提示', content: this.studentTip, showCancel: false });
        return;
      }
      const base = new Date(this.selectedTs);
      this.calYear = base.getFullYear();
      this.calMonth = base.getMonth();
      this.calPicked = todayStart(base);
      this.calVisible = true;
      this.loadCalCounts();
    },
    // 当前展示月首日/末日（按月拉取数量）
    currentMonthRange() {
      const first = new Date(this.calYear, this.calMonth, 1);
      const last = new Date(this.calYear, this.calMonth + 1, 0);
      return { start: fmtDate(first), end: fmtDate(last) };
    },
    // 日历弹窗每日数量（打开与切月时均重新拉取当月）；
    // 拉取失败不关闭弹窗，面板照常可点日/确认，关后重开即重拉
    loadCalCounts() {
      this.calLoading = true;
      const range = this.currentMonthRange();
      // countsParams 由父页给出与列表一致的筛选条件（如预约页的课程），放在后面覆盖同名默认值
      const params = Object.assign({
        student_id: this.studentId,
        start_date: range.start,
        end_date: range.end,
      }, this.countsParams || {});
      this.$api(this.countsApi, params).then((ret) => {
        // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码，避免把失败渲染成全 0
        if (!ret || ret.code !== 1) {
          this.calLoading = false;
          if (ret && ret.code !== 0 && ret.code !== 401) {
            uni.showModal({ title: '提示', content: ret.msg || '日历数据获取失败，请稍后重试', showCancel: false });
          }
          return;
        }
        this.calCountMap = toCountMap(ret.data && ret.data.counts);
        this.calLoading = false;
      }).catch(() => {
        this.calLoading = false;
        uni.showModal({ title: '提示', content: '日历数据获取失败，请稍后重试', showCancel: false });
      });
    },
    // 切上一月/下一月：边界月箭头置灰不可点，切换后按新月份重新拉取
    calShiftMonth(count) {
      if (count < 0 && !this.calCanPrev) return;
      if (count > 0 && !this.calCanNext) return;
      const d = new Date(this.calYear, this.calMonth + count, 1);
      this.calYear = d.getFullYear();
      this.calMonth = d.getMonth();
      this.loadCalCounts();
    },
    // 点日选中（跨月占位与范围外日期不可点）
    onCalPick(d) {
      if (!d.day || d.disabled) return;
      this.calPicked = d.ts;
    },
    // 确认：跳到所选当天
    onCalConfirmTap() {
      if (!this.calPicked) return;
      this.calVisible = false;
      this.emitChange(this.calPicked);
    },
    // 关闭（右上角关闭图标/遮罩）
    onCalClose() {
      this.calVisible = false;
    },
  },
};
</script>

<style scoped>
/* 周日历卡片：仅显示一周；通栏直角（无外边距 + 无圆角），与教务模块「贴顶通栏白块」口径一致 */
.cal-card {
  margin: 0;
  background: #fff;
  border-radius: 0;
  padding: 4px 8px 4px;
}

.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px;
}

.cal-arrow {
  display: flex;
  align-items: center;
  padding: 4px 10px;
}

.cal-label {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.cal-week {
  display: flex;
}

.cal-day {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0 8px;
}

.cd-name {
  font-size: 11px;
  color: #86909c;
}

.cd-num {
  margin-top: 6px;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 50%;
  font-size: 15px;
  color: #1d2129;
}

.cal-day.on .cd-name {
  color: #0968f6;
  font-weight: 600;
}

.cal-day.on .cd-num {
  background: #0968f6;
  color: #fff;
  font-weight: 600;
}

/* 当天数量标注 */
.cd-count {
  margin-top: 3px;
  font-size: 10px;
  line-height: 12px;
  color: #0968f6;
}

/* 数量为 0：灰色标注 */
.cd-count.zero {
  color: #86909c;
}

/* 选择日期弹窗：自绘单月面板（对齐 TDesign 日历版式：标题/月头/星期行/日期网格/确认条） */
.cal-panel {
  position: relative;
  padding: 16px 14px 14px;
}

.cal-panel-title {
  padding-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.cal-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
}

.cal-panel-month {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.cal-panel-arrow {
  display: flex;
  align-items: center;
  padding: 6px 14px;
}

.cal-panel-arrow.off {
  opacity: 0.3;
}

.cal-panel-week {
  display: flex;
  padding: 4px 0;
}

.cal-panel-week-item {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #86909c;
}

.cal-panel-grid {
  display: flex;
  flex-wrap: wrap;
}

.cal-panel-cell {
  width: 14.28%;
  height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4px;
  box-sizing: border-box;
}

.cal-panel-day {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 50%;
  font-size: 15px;
  color: #1d2129;
}

.cal-panel-day.today {
  color: #0968f6;
  font-weight: 600;
}

.cal-panel-day.selected {
  background: #0968f6;
  color: #fff;
  font-weight: 600;
}

.cal-panel-day.disabled {
  color: #c9cdd4;
}

.cal-panel-count {
  margin-top: 2px;
  font-size: 10px;
  line-height: 12px;
  color: #0968f6;
}

.cal-panel-count.zero {
  color: #86909c;
}

.cal-panel-confirm {
  margin-top: 10px;
  padding: 11px 0;
  border-radius: 4px;
  background: #0968f6;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
}

/* 数量加载蒙版：覆盖在月面板之上，遮罩+居中旋转图标，不改变面板高度 */
.cal-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
}

.cal-mask-inner {
  display: flex;
  align-items: center;
  color: #0968f6;
  font-size: 14px;
}

.cal-mask-text {
  margin-left: 8px;
  color: #86909c;
}
</style>
