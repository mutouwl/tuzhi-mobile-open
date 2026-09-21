<template>
  <view class="tz-tl-item" :class="{ 'tz-tl-first': first, 'tz-tl-last': last }">
    <!-- 左侧列：口径由 mode 决定，两种口径都右对齐贴轨道，骨架灰块按各自行数占位。
         time=起止时间（开始深色加粗、结束浅灰）；date=上课日期单行（列表跨多天时作日期锚点） -->
    <view class="tz-tl-time">
      <block v-if="skeleton">
        <view class="tz-sk-bar" :class="isDate ? 'tz-sk-date' : 'tz-sk-start'"></view>
        <view class="tz-sk-bar tz-sk-end" v-if="!isDate"></view>
      </block>
      <block v-else-if="isDate">
        <text class="tz-tl-date">{{ dateText }}</text>
      </block>
      <block v-else>
        <text class="tz-tl-start">{{ startTime }}</text>
        <text class="tz-tl-end">{{ endTime }}</text>
      </block>
    </view>
    <!-- 时间轴轨道：竖线贯穿条目，首尾两条各收一段，避免线头超出圆点 -->
    <view class="tz-tl-rail">
      <view class="tz-tl-dot" :class="skeleton ? 'tz-tl-dot-sk' : dotColor"></view>
    </view>
    <!-- 卡体：底色/圆角/内边距按页面传入（课表灰卡与预约白卡口径不同），内容走默认插槽；
         卡体自身 position:relative，供页面把状态标签绝对定位到卡体右上角 -->
    <view class="tz-tl-card" :style="cardStyle" @click="$emit('card-click')">
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  name: 'TzSchoolTimeline',
  props: {
    // 左侧列口径：time=起止时间（「我的课表」「预约上课」，同一页内是按时间扫读，日期由日历/分组头给出）；
    // date=上课日期单行（「我的预约」列表跨多天且未做按天分组，左列改作日期锚点，
    //   时间段回到卡内「课次」行，与详情弹层的课次行同口径）
    mode: {
      type: String,
      default: 'time'
    },
    // date 口径下的日期文案（月-日，如 09-17）：列宽 44px 放不下带年份的完整日期，
    // 完整日期由卡内「课次」行承载，左列只作扫读锚点
    dateText: {
      type: String,
      default: ''
    },
    // 左侧时间列的起止时间
    startTime: {
      type: String,
      default: ''
    },
    endTime: {
      type: String,
      default: ''
    },
    // 圆点配色：blue 可约/正常、green 已完成、orange 待确认或请假、gray 不可用（空值同 gray）。
    // 口径与各页状态标签一致，页面用自己的状态判定函数回传色名
    dotColor: {
      type: String,
      default: ''
    },
    // 首/末条：轨道竖线各收一段（列表首尾不露线头）
    first: {
      type: Boolean,
      default: false
    },
    last: {
      type: Boolean,
      default: false
    },
    // 骨架态：时间列与圆点渲染灰块，卡体内容由页面用骨架块填充
    skeleton: {
      type: Boolean,
      default: false
    },
    // 卡体底色/圆角/内边距：默认白卡 10px 圆角 10px 内边距，
    // 「我的课表」页面嵌在白色分组卡内，传灰底 #f7f8fa + 8px 圆角 + 10px 12px 内边距
    cardBg: {
      type: String,
      default: '#fff'
    },
    cardRadius: {
      type: String,
      default: '10px'
    },
    cardPadding: {
      type: String,
      default: '10px'
    }
  },
  computed: {
    // date 口径：左列渲染单行日期（骨架同步只占一块）
    isDate() {
      return this.mode === 'date';
    },
    // 小程序端 :style 绑定「裸标识符」时编译器不走 __get_style 做对象序列化（内联对象/数组字面量才会），
    // WXML 里是 style="{{(cardStyle)}}"，微信把对象渲染成 [object Object]，卡体底色整条失效；
    // H5 用真 Vue 所以照常生效。故自行拼成 CSS 字符串，两端同一条路径。
    cardStyle() {
      return `background:${this.cardBg};border-radius:${this.cardRadius};padding:${this.cardPadding}`;
    }
  }
};
</script>

<style scoped>
/* 时间轴条目：「我的课表」「预约上课」「我的预约」三页共用
   样式 scoped，页面全局样式（H5 下所有页面样式同文档生效）不会与组件内部类名互相覆盖 */
.tz-tl-item {
  display: flex;
}

/* 左侧列（时间/日期）：右对齐贴轨道；flex 列对齐同时服务骨架灰块 */
.tz-tl-time {
  width: 44px;
  flex-shrink: 0;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.tz-tl-start {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
  line-height: 18px;
}

.tz-tl-end {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #86909c;
}

/* date 口径的单行日期：字号/字重/行高与时间列首行一致（左列视觉重量跨页统一）；
   nowrap 防「09-17」在连字符处折行，列宽 44px + 右内边距 8px 足够放下 5 个字符 */
.tz-tl-date {
  display: block;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
  line-height: 18px;
}

.tz-tl-rail {
  width: 22px;
  flex-shrink: 0;
  position: relative;
}

.tz-tl-rail::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e6eb;
}

.tz-tl-item.tz-tl-first .tz-tl-rail::before {
  top: 13px;
}

.tz-tl-item.tz-tl-last .tz-tl-rail::before {
  bottom: auto;
  height: 13px;
}

/* 状态圆点：不可用灰为默认色，页面按状态回传 blue/green/orange */
.tz-tl-dot {
  position: absolute;
  left: 6px;
  top: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c9cdd4;
}

.tz-tl-dot.blue {
  background: #0968f6;
}

.tz-tl-dot.green {
  background: #00b42a;
}

.tz-tl-dot.orange {
  background: #ff7d00;
}

/* 骨架灰点：比不可用灰更浅，与下方骨架卡同色系 */
.tz-tl-dot-sk {
  background: #e5e6eb;
}

.tz-tl-card {
  position: relative;
  flex: 1;
  min-width: 0;
  margin-bottom: 10px;
}

/* 末条卡体收一点外边距，列表底部不多一段空白（与 u-loadmore 的间距叠加） */
.tz-tl-item.tz-tl-last .tz-tl-card {
  margin-bottom: 2px;
}

/* 骨架灰块：时间列两块（date 口径只渲染主行一块，按日期文案「月-日」的占位 34×13） */
.tz-sk-bar {
  border-radius: 4px;
  background: #e5e6eb;
}

.tz-sk-start,
.tz-sk-date {
  width: 34px;
  height: 13px;
}

.tz-sk-end {
  width: 26px;
  height: 11px;
  margin-top: 4px;
}
</style>
