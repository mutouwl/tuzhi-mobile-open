<template>
  <view class="tz-circle" :style="{ margin: margin + 'px' }">
    <view v-for="item in list" :key="item.id" class="circle-card"
      :class="[type, { 'circle-card-round': round, 'circle-card-border': border, 'circle-card-expired': item.is_expired == 1 }]" @tap="goCircle(item)">
      <view class="circle-cover">
        <image v-if="item.cover && !imgErrors[item.id]" class="circle-cover-img" :src="item.cover" mode="aspectFill" @error="onCoverImgError(item.id)" />
        <!-- 封面加载失败/为空占位：浅灰底 + 居中图标（与圈子媒体九宫格一致） -->
        <view v-else class="circle-cover-img circle-cover-img-error">
          <tz-icon name="tupian" :size="24" color="#c9cdd4" />
        </view>
        <!-- 封面右下角类型标签（参考 course 组件） -->
        <view class="circle-type">圈子</view>
      </view>
      <view class="circle-info">
        <view class="circle-name">{{ item.name }}</view>
        <!-- 随课赠送：赠送标识与时长合并在同一标签内（courseCircle 返回 is_gift/gift_text，其余列表无该字段不受影响） -->
        <view v-if="item.is_gift == 1" class="circle-gift">
          <text class="circle-gift-tag">随课赠送{{ item.gift_text || '' }}</text>
        </view>
        <view class="circle-intro" v-if="item.intro">{{ item.intro }}</view>
        <view class="circle-stat">
          <view class="circle-stat-info">
            <!-- 我的圈子（成员列表 circle.circle.index 含 is_expired/expire_text）：展示有效期/已过期，隐藏价格与人数统计 -->
            <text v-if="hasExpire(item)" :class="['circle-expire', { 'circle-expire-warn': item.is_expired == 1 }]">{{ expireText(item) }}</text>
            <template v-else>
              <!-- 付费圈展示最低规格价起点价，免费圈展示"免费" -->
              <text v-if="item.sell_type == 2 && Number(item.price) > 0" class="circle-price">¥{{ item.price }}起</text>
              <text v-else-if="item.sell_type == 1" class="circle-price free">免费</text>
              <!-- 加入数/动态数：mini 紧凑模式（课程详情圈子栏目）不展示，为右侧信息留空间 -->
              <text v-if="type !== 'mini' && item.show_member_count == 1 && item.show_post_count == 1">{{ item.member_count || 0 }}人加入 · {{ item.post_count || 0 }}条动态</text>
              <text v-else-if="type !== 'mini' && item.show_member_count == 1">{{ item.member_count || 0 }}人加入</text>
              <text v-else-if="type !== 'mini' && item.show_post_count == 1">{{ item.post_count || 0 }}条动态</text>
            </template>
          </view>
          <view class="circle-btn" :class="{ 'circle-btn-renew': item.is_expired == 1 }">{{ btnText(item) }}</view>
        </view>
      </view>
    </view>
    <view v-if="!list.length" class="circle-empty">
      <text>暂无圈子</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'tz-circle',
  props: {
    list: { type: Array, default: () => [] },
    // single 大卡 / row 横排小卡 / mini 紧凑横排卡（参考 course-mini）
    type: { type: String, default: 'single' },
    // 圆角/边框（DIY 配置下发 1/0，历史配置缺失时默认圆角显示、边框隐藏，兼容既有页面）
    round: { type: [Boolean, Number], default: true },
    border: { type: [Boolean, Number], default: false },
    margin: { type: [Number, String], default: 10 },
  },
  data() {
    return {
      // 封面图加载失败标记：key = 圈子 id，值为 true 时用图标占位（与圈子媒体九宫格一致）
      imgErrors: {},
    };
  },
  methods: {
    // 封面图加载失败 → 占位图标
    onCoverImgError(id) {
      this.$set(this.imgErrors, id, true);
    },
    // 我的圈子成员列表（circle.circle.index 返回 is_expired/expire_text）→ 有效期展示模式；普通列表（goodsList/courseCircle）无该字段，走既有价格/统计展示
    hasExpire(item) {
      return item && item.is_expired !== undefined;
    },
    // 有效期文案：已过期 / 有效期至 X（免费圈 or 永久规格为「永久有效」）
    expireText(item) {
      if (item.is_expired == 1) return '已过期';
      return item.expire_text ? '有效期至 ' + item.expire_text : '';
    },
    btnText(item) {
      if (this.hasExpire(item)) return item.is_expired == 1 ? '续费' : '进入';
      return item.joined ? '进入' : '加入';
    },
    goCircle(item) {
      // 我的圈子：已过期 → 售前页续费，有效 → 圈子主页
      if (this.hasExpire(item)) {
        this.$nav.to(item.is_expired == 1 ? '/pages/app/circle/presale/presale?id=' + item.id : '/pages/app/circle/index/index?id=' + item.id);
        return;
      }
      // 普通列表：已加入 → 圈子主页，未加入 → 售前页
      this.$nav.to(item.joined ? '/pages/app/circle/index/index?id=' + item.id : '/pages/app/circle/presale/presale?id=' + item.id);
    }
  }
};
</script>

<style scoped>
.tz-circle {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.circle-card {
  background: #fff;
  overflow: hidden;
}
.circle-card-round {
  border-radius: 10px;
}
.circle-card-border {
  border: 1px solid #efefef;
}
.circle-cover {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.circle-cover .circle-cover-img {
  width: 100%;
  height: 100%;
  display: block;
}
/* 封面加载失败/为空占位：浅灰底 + 居中图标（与圈子媒体九宫格 post-media-image-error 一致） */
.circle-cover .circle-cover-img-error {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f3f5;
}
.circle-card.single .circle-cover {
  width: 100%;
  height: 160px;
}
.circle-card.row {
  display: flex;
}
.circle-card.row .circle-cover {
  width: 100px;
  height: 75px;
}
/* mini 紧凑横排卡（参考 course-mini：封面110x80、标题14px、信息行紧凑；封面收窄为右侧信息留足空间） */
.circle-card.mini {
  display: flex;
  align-items: stretch;
  height: 80px;
  position: relative;
}
.circle-card.mini .circle-cover {
  width: 110px;
  height: 100%;
}
.circle-card.mini .circle-info {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  padding-right: 70px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.circle-card.mini .circle-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.circle-card.mini .circle-intro {
  display: none;
}
.circle-card.mini .circle-stat {
  margin-top: 0;
}
.circle-card.mini .circle-btn {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}
/* 封面右下角类型标签（参考 course 组件） */
.circle-type {
  position: absolute;
  bottom: 4px;
  right: 4px;
  height: 18px;
  padding: 0 6px;
  line-height: 18px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  color: #fff;
  font-size: 10px;
  font-weight: 500;
  z-index: 1;
}
.circle-info {
  padding: 10px;
}
.circle-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}
.circle-intro {
  font-size: 12px;
  color: #86909c;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 随课赠送：赠送标识与时长统一展示在标签内（课程详情圈子栏目副标题位） */
.circle-gift {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  overflow: hidden;
}
.circle-gift-tag {
  flex-shrink: 0;
  font-size: 10px;
  color: #0968f6;
  background: rgba(9, 104, 246, 0.08);
  border: 1px solid rgba(9, 104, 246, 0.2);
  border-radius: 3px;
  padding: 0 4px;
  line-height: 16px;
}
.circle-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: #86909c;
}
.circle-stat-info {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}
.circle-price {
  color: #f53f3f;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.circle-price.free {
  color: #86909c;
  font-weight: 400;
}
.circle-btn {
  font-size: 11px;
  color: #fff;
  background: #0968f6;
  padding: 3px 12px;
  border-radius: 14px;
  flex-shrink: 0;
}
/* 我的圈子成员模式：已过期卡片弱化 + 续费橙色按钮 + 有效期文案 */
.circle-card-expired {
  opacity: 0.75;
}
.circle-btn-renew {
  background: #ff7d00;
}
.circle-expire {
  font-size: 11px;
  color: #86909c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.circle-expire-warn {
  color: #f53f3f;
}
.circle-empty {
  text-align: center;
  color: #86909c;
  font-size: 12px;
  padding: 20px 0;
}
</style>
