<template>
  <div>
    <u-popup
      :show="show"
      @close="close"
      @open="open"
      :closeable="false"
      :round="12"
      mode="center"
      bgColor="transparent"
      :overlayStyle="{ zIndex: 10200 }"
      :zIndex="10210"
    >
      <div class="redpacket-modal">
        <!-- 关闭按钮 -->
        <div class="modal-close" @click="close">
          <tz-icon name="close" color="#fff" :size="12" />
        </div>

        <!-- 加载状态 -->
        <div class="redpacket-loading" v-if="detailLoading">
          <u-loading-icon mode="circle" size="36" color="#e8553a"></u-loading-icon>
          <text class="loading-text">加载中...</text>
        </div>

        <template v-else>
        <!-- 红包封面 -->
        <div class="redpacket-cover">
          <div class="cover-top">
            <div class="sender-avatar">
              <image :src="redpacketData.avatar || '/static/image/default-avatar.png'" mode="aspectFill" />
            </div>
            <div class="sender-name">{{ redpacketData.nickname || '主播' }}</div>
            <div class="redpacket-blessing">{{ redpacketData.blessing || '恭喜发财，大吉大利' }}</div>
            <div class="redpacket-type">{{ redpacketData.type_text || '拼手气红包' }}</div>
          </div>

          <!-- 未抢状态 -->
          <div class="cover-action" v-if="status == 'pending'">
            <div class="grab-btn" @click="grabRedpacket">
              <text class="grab-text">抢</text>
            </div>
            <div class="cover-tip">{{ redpacketData.total_num || 0 }}个红包，先到先得</div>
          </div>

          <!-- 已抢到状态 -->
          <div class="cover-result" v-else-if="status == 'grabbed'">
            <div class="result-amount">
              <text class="amount-symbol">¥</text>
              <text class="amount-value">{{ myAmount }}</text>
            </div>
            <div class="result-tip">已存入红包余额</div>
          </div>

          <!-- 已抢完/已过期 -->
          <div class="cover-result" v-else-if="status == 'finished' || status == 'expired'">
            <div class="result-empty">{{ status == 'expired' ? '红包已过期，无法领取' : '红包已抢完' }}</div>
            <div class="result-tip" v-if="status == 'expired'">下次记得早点来</div>
          </div>
        </div>

        <!-- 领取记录入口 -->
        <div class="records-entry" v-if="grabList.length > 0" @click="showRecords = true">
          <text class="entry-text">已领取 {{ grabList.length }}/{{ redpacketData.total_num || 0 }} 个</text>
          <text class="entry-link">看看大家的手气 ›</text>
        </div>
        </template>
      </div>
    </u-popup>

    <!-- 领取记录弹窗 -->
    <u-popup
      :show="showRecords"
      @close="showRecords = false"
      mode="bottom"
      :round="12"
      :overlayStyle="{ zIndex: 10300 }"
      :zIndex="10310"
    >
      <div class="records-popup">
        <div class="records-header">
          <text class="records-title">领取记录</text>
          <text class="records-count">已领取 {{ grabList.length }}/{{ redpacketData.total_num || 0 }} 个</text>
        </div>
        <scroll-view scroll-y class="records-scroll">
          <template v-if="grabList.length > 0">
            <div class="records-item" v-for="(item, index) in grabList" :key="index">
              <image class="records-avatar" :src="item.avatar || '/static/image/default-avatar.png'" mode="aspectFill" />
              <div class="records-info">
                <text class="records-name">{{ maskName(item.nickname) }}</text>
                <text class="records-time">{{ $tools.formatDate(item.createtime) }}</text>
              </div>
              <div class="records-right">
                <text class="records-amount">¥{{ item.amount }}</text>
                <div class="records-lucky" v-if="item.is_max == 1">
                  <image class="lucky-icon" src="@/static/image/live/gift.png" />
                  <text class="lucky-text">手气最佳</text>
                </div>
              </div>
            </div>
          </template>
          <div class="records-empty" v-else>
            <u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无领取记录"></u-empty>
          </div>
        </scroll-view>
      </div>
    </u-popup>
  </div>
</template>

<script src="./js.vue"></script>

<style scoped>
@import "./css.css";
</style>
