<template>
    <view class="message-list__wrap">
        <view class="message-list" v-for="(item, index) in list" :key="item.id">
            <!-- 通知消息 -->
            <view class="notice portrait-notice" v-if="item.type == 'notice'">
                <span class="notice-label">通知</span>
                <text>{{ item.message }}</text>
            </view>

            <!-- <view
                class="date"
                v-if="
          index == 0 ||
          (list[index - 1] && item.time - list[index - 1].time > timeShowInterval)
        ">{{ $tools.formatDate(item.time) }}</view> -->
            <!-- 礼物 -->
            <template v-if="item.type && item.type == 'gift'">
                <view class="gift-box">
                    <text class="gift-content">
                        <text class="host-label">{{ item.nickname }}：</text>
                        <text class="gift-action">送出了</text>
                        <image class="gift-icon" src="@/static/image/live/gift.png" />
                        <text class="gift-name">{{ item.message }}</text>
                    </text>
                </view>
            </template>

            <!-- 红包消息 -->
            <template v-else-if="item.type == 'redpacket'">
                <view class="redpacket-msg-box" :class="{ 'is-expired': isRedpacketExpired(item) }" @click="openRedpacket(item)">
                    <view class="redpacket-msg-main">
                        <image class="redpacket-msg-icon" src="/static/image/red_packet.png" mode="aspectFit" />
                        <view class="redpacket-msg-content">
                            <text class="redpacket-msg-text">{{ item.nickname }}发了一个红包</text>
                            <text class="redpacket-msg-tip">{{ redpacketStatusTip(item) }}</text>
                        </view>
                    </view>
                </view>
            </template>

            <!-- 分享有礼活动卡片（中控台「发送到讨论区」落的那条消息，图12）
                 渲染吃消息体、不反查接口（与红包卡片同构）：活动之后被失效或到期，
                 这张卡仍是发出那一刻的样子，是登记过的已知限制（PRD §2.3-1）。
                 未安装本插件时整支不渲染——付费插件未安装时连组件文件都不存在（M14），
                 灰卡会让人以为商家配坏了一次活动。 -->
            <template v-else-if="item.type == 'share_gift' && shareGiftInstalled">
                <view class="share-gift-msg-box" @click="openShareGift(item)">
                    <view class="share-gift-msg-main">
                        <image class="share-gift-msg-icon" src="/static/image/live/share_gift.png" mode="aspectFit" />
                        <view class="share-gift-msg-content">
                            <text class="share-gift-msg-text">{{ shareGiftTitle(item) }}</text>
                            <text class="share-gift-msg-tip">{{ shareGiftSubtitle(item) }}</text>
                        </view>
                        <text class="share-gift-msg-btn">去邀请</text>
                    </view>
                </view>
            </template>

            <!-- 邀请达人榜活动卡片（运营设置「发送到讨论区」落的那条消息）
                 几何逐项照上面那张分享有礼卡（同宽、同 margin、同磨砂底、同圆角、同内衬、
                 同图标与两行字号），差别在图标（invite_rand.png，入口同款）与右侧那枚「去冲榜」。
                 两张卡的图标 2026-10-05 跟着入口第二次换成新版（橙色奖杯 / 橙色礼盒，**透明底字形图**）：
                 与本族基准卡那张 `red_packet.png` 同一型，压在磨砂卡底上直接读成字形图，这一族三张图标同型。
                 卡内这一格仍是 20px（照 `.redpacket-msg-box` 抄，不因为换了素材就动），入口那一枚另按
                 20.25 内缩那一档走（入口的尺寸史见 components/tz/live-side-entry.vue，与卡内这一格不是同一份）。
                 同样吃消息体、不反查接口：活动之后被停或到期，这张卡仍是发出那一刻的样子。
                 未安装本插件时整支不渲染（付费插件未安装时连组件文件都不存在，M14）。 -->
            <template v-else-if="item.type == 'invite_rank' && inviteRankInstalled">
                <view class="invite-rank-msg-box" @click="openInviteRank(item)">
                    <view class="invite-rank-msg-main">
                        <image class="invite-rank-msg-icon" src="/static/image/live/invite_rand.png" mode="aspectFit" />
                        <view class="invite-rank-msg-content">
                            <text class="invite-rank-msg-text">{{ inviteRankTitle(item) }}</text>
                            <text class="invite-rank-msg-tip">{{ inviteRankSubtitle(item) }}</text>
                        </view>
                        <text class="invite-rank-msg-btn">去冲榜</text>
                    </view>
                </view>
            </template>

            <!-- 红包抢夺消息 -->
            <template v-else-if="item.type == 'redpacket_grab'">
                <view class="redpacket-grab-box">
                    <text class="redpacket-grab-text">{{ item.nickname }}抢到了¥{{ grabAmount(item) }}</text>
                </view>
            </template>

            <!-- 红包撤回消息 -->
            <template v-else-if="item.type == 'redpacket_revoke'">
                <view class="redpacket-revoke-box">
                    <text class="redpacket-revoke-text">管理员撤回了一个红包</text>
                </view>
            </template>
            <view
                class="message-list__item"
                v-else>
                <view class="avatar">
                    <!-- <u-avatar :src="item.avatar" :size="34"></u-avatar> -->
                </view>

                <view class="det">
                    <view class="content">
                        <!-- 文本消息 -->
                        <view v-if="item.type == 'text'" class="portrait-msg-item" :class="{'is-host': item.isHost || item.nickname.includes('主播'), 'is-notice': item.type === 'notice' || item.nickname.includes('通知')}">
                            <template v-if="item.isHost || item.nickname.includes('主播')">
                                <span class="host-label">主播</span>
                            </template>
                            <template v-else-if="item.type === 'notice' || item.nickname.includes('公告')">
                                <span class="notice-label">公告</span>
                            </template>
                            <text class="name" v-else>{{ item.nickname }}：</text>
                            <text class="text">{{ item.message }}</text>
                        </view>

                        <view v-else class="portrait-msg-item" :class="{'is-host': item.isHost || item.nickname.includes('主播'), 'is-notice': item.type === 'notice' || item.nickname.includes('通知')}">
                            <template v-if="item.isHost || item.nickname.includes('主播')">
                                <span class="host-label">主播</span>
                            </template>
                            <template v-else-if="item.type === 'notice' || item.nickname.includes('公告')">
                                <span class="notice-label">公告</span>
                            </template>
                            <text class="name">{{ item.nickname }}：</text>

                            <!-- 图片 -->
                            <template v-if="item.type == 'image'">
                                <view class="picture" style="display: inline-block; vertical-align: text-top;"
                                    @click="preview(item.message)">
                                    <image mode="widthFix" style="border-radius: 12px;width: 100px;"  :src="item.message" />
                                </view>
                            </template>

                            <!-- 错误 -->
                            <view class="error" v-if="item.error">
                                <text class="cl-icon-warning-border"></text>
                                {{ item.error }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 视频 -->
        <!-- <view class="popup-video" v-if="preview.url">
			<video
				id="video"
				controls
				autoplay
				:src="preview.url"
				@play="onVideoPlay"
				@fullscreenchange="onVideoFullscreenChange"
			></video>
		</view> -->
    </view>
</template>

<script>
var that;
export default {
  components: {},
  data() {
    return {
      list: this.meessageList,

      //时间组件显示的间隔时间
      timeShowInterval: 120,
    };
  },

  props: {
    meessageList: {
      type: Array,
      default: function () {
        return [];
      },
    }
  },
  computed: {
    // 分享有礼未安装时卡片整支不渲染（未安装时插件的接口与页面都不存在，M14）；
    // 判据只在这一处，模板那一行读它
    shareGiftInstalled() {
      return !!this.$tools.systemConfig('app_isinstall_share_gift');
    },
    // 邀请达人榜同一道闸：未安装时卡片整支不渲染（组件与接口都不存在，M14）
    inviteRankInstalled() {
      return !!this.$tools.systemConfig('app_isinstall_invite_rank');
    },
  },
  watch: {
    meessageList() {
      this.list = this.meessageList;
    },
  },
  methods: {
    preview(path) {
      uni.previewImage({
        urls: [path],
      });
    },
    openRedpacket(item) {
      this.$emit('openRedpacket', item);
    },
    parseRedpacketMessage(item) {
      if (!item || !item.message || typeof item.message !== 'string') return {};
      try {
        return JSON.parse(item.message);
      } catch (e) {
        return {};
      }
    },
    isRedpacketExpired(item) {
      var content = this.parseRedpacketMessage(item);
      if (content.status == 'expired') return true;
      if (!content.expire_time) return false;
      var expireTime = parseInt(content.expire_time);
      if (!expireTime) return false;
      return Math.floor(Date.now() / 1000) >= expireTime;
    },
    parseShareGiftMessage(item) {
      if (!item || !item.message || typeof item.message !== 'string') return {};
      try {
        return JSON.parse(item.message) || {};
      } catch (e) {
        return {};
      }
    },
    // 标题与副标题都由后端一处算好下发（Receive::CARD_TITLE / CARD_SUBTITLE），前端不拼文案
    shareGiftTitle(item) {
      return this.parseShareGiftMessage(item).title || '分享有礼活动';
    },
    shareGiftSubtitle(item) {
      return this.parseShareGiftMessage(item).subtitle || '';
    },
    openShareGift(item) {
      this.$emit('openShareGift', this.parseShareGiftMessage(item));
    },
    parseInviteRankMessage(item) {
      if (!item || !item.message || typeof item.message !== 'string') return {};
      try {
        return JSON.parse(item.message) || {};
      } catch (e) {
        return {};
      }
    },
    // 标题与副标题都由后端一处算好下发（Rank::CARD_TITLE / CARD_SUBTITLE），前端不拼文案
    inviteRankTitle(item) {
      return this.parseInviteRankMessage(item).title || '邀请达人榜活动';
    },
    inviteRankSubtitle(item) {
      return this.parseInviteRankMessage(item).subtitle || '';
    },
    // 事件名取非原生名（M28①：H5 把模板里的 @tap 改写成 @click，$emit('tap') 那一侧不改名）
    openInviteRank(item) {
      this.$emit('openInviteRank', this.parseInviteRankMessage(item));
    },
    redpacketStatusTip(item) {
      return this.isRedpacketExpired(item) ? '已过期' : '领取红包';
    },
    // 解析抢红包消息中的金额（message 为 JSON 字符串）
    grabAmount(item) {
      if (!item.message) return '';
      if (typeof item.message !== 'string') return item.message;
      try {
        var content = JSON.parse(item.message);
        return content.amount !== undefined ? content.amount : '';
      } catch (e) {
        return item.message;
      }
    },
  },
  mounted() {
    that = this;
  },
};
</script>

<style lang="scss" scoped>
.gift-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  text-align: center;

  font-size: 12px;
  margin: 10px auto;
  border-radius: 4px;

  

  background-image: linear-gradient(to left, #ffecd2 0%, #fcb69f 100%);
  color: #fff;

  .gift-content {
      display: inline;
      white-space: normal;
      word-break: break-word;
      line-height: 1.4;
      overflow-wrap: break-word;
      text-align: left;
  }

  .gift-icon {
    width: 12px;
    height: 12px;
    margin-left: 6px;
    vertical-align: middle;
    display: inline-block;
  }

  text {
    color: #d87558;
    margin-left: 6px;
    white-space: normal;
    display: inline;
  }
}

.notice {
  width: 90%;
  margin: 10px auto;
  background-color: #ecf5ff;
  padding: 10px;
  color: #0968f6;
  font-size: 14px;
  border-radius: 5px;
}

// 通知样式
.notice.portrait-notice {
  width: auto;
  margin: 2px 12px;
  background-color: rgba(255, 59, 48, 0.2); /* 磨砂透明背景 */
  padding: 6px 10px;
  color: #fff;
  font-size: 13px;
  border-radius: 12px;
  border: 1px solid rgba(255, 59, 48, 0.4);
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  display: inline-block;
  backdrop-filter: blur(10px); /* 磨砂效果 */
  
  .notice-label {
    background-color: #FF3B30;
    color: #fff;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 3px;
    margin-right: 4px;
    font-weight: bold;
    display: inline-block;
  }
}

.message-list__wrap {
  .date {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
  }

  .popup-video {
    position: absolute;
    left: -200%;
    top: 0;
    height: 100%;
    width: 100%;

    video {
      height: 100%;
      width: 100%;
    }
  }
}

.message-list {
  &__item {
    display: flex;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;

    .avatar {
      flex-shrink: 0;
    }

    .det {
      flex: 1;
      margin: 0 10px;

      .content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .wrap {
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          background-color: #fff;
          border-radius: 0 10px 10px 10px;
          padding: 20rpx;
          height: 80rpx;
          max-width: 72%;
          box-sizing: border-box;
          position: relative;
        }

        .name {
          font-size: 12px;
          margin-bottom: 5px;
          color: #666666;
        }

        .progress {
          width: 150rpx;
        }

        .error {
          font-size: 24rpx;
          color: red;
        }

        .text {
          // padding: 10px;
          height: auto;
          word-break: break-all;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .picture {
          width: 100px;

          image {
            width: 100%;
            border-radius: 12px;
            margin: 6px 0;
            overflow: hidden;
          }
        }

        .emoji {
          image {
            height: 20px;
            width: 20px;
          }
        }

        .voice {
          .icon {
            position: relative;
            font-size: 20px;
            height: 25px;
            width: 25px;

            text {
              position: absolute;
            }
          }

          &.is-play {
            .icon {
              text {
                &:nth-child(1) {
                  animation: ss 0.8s linear infinite;
                }

                @keyframes ss {
                  0% {
                    opacity: 1;
                  }

                  50% {
                    opacity: 0;
                  }

                  100% {
                    opacity: 01;
                  }
                }
              }
            }
          }
        }

        .video {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #333;
          border-radius: 8px;
          height: 90px;
          width: 150px;
          position: relative;
          overflow: hidden;

          image {
            height: 100%;
            width: 100%;
          }

          .cl-icon-play {
            position: absolute;
            z-index: 2;
            color: rgba(255, 255, 255, 0.9);
            font-size: 25px;
            text-shadow: 0 0 4rpx #999;
          }
        }
      }
    }

    &.is-my {
      flex-direction: row-reverse;

      .content {
        align-items: flex-end;

        .wrap {
          border-radius: 10px 0 10px 10px;
          background-color: #fff;
        }

        .voice {
          flex-direction: row-reverse;

          .icon {
            transform: rotate(180deg);
          }
        }
      }
    }
  }
}


.message-list__wrap {

  // 红包消息样式
  /* 分享有礼卡片：几何逐项照下面那张红包卡（同宽 220、同 `margin 4px 12px`、同磨砂底、
     同 12px 圆角、同 `padding 10px 12px`、同 20px 图标 + 10px 间距、同 12px/10px 两行字号），
     差别只在右侧那枚「去邀请」（卡内动作按钮，圆角 4px 属 M21 小元素档）。
     2026-09-30 用户点名「跟红包气泡不统一」：这张卡原先是 8px 圆角 / 10px 内衬 / 36px 图标 /
     14px+12px 字号，与同屏那张红包卡并排时两张卡片高矮胖瘦都不同。
     标题与副标题都要单行省略：卡片只有 220px，活动名限 20 字（Receive::TITLE_MAX）
     在这里放不下两行，不 ellipsis 就会撑破卡片。
     往后这一族再加消息卡（消息类型变多时），圆角/内衬/图标/字号一律照 `.redpacket-msg-box` 抄，
     不许各写各的 */
  .share-gift-msg-box {
    display: flex;
    flex-direction: column;
    width: 220px;
    margin: 4px 12px;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;

    .share-gift-msg-main {
      display: flex;
      align-items: center;
      padding: 10px 12px;
    }

    .share-gift-msg-icon {
      width: 20px;
      height: 20px;
      flex: none;
      margin-right: 10px;
    }

    .share-gift-msg-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .share-gift-msg-text {
      font-size: 12px;
      color: #ffffff;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .share-gift-msg-tip {
      margin-top: 3px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.75);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .share-gift-msg-btn {
      flex: none;
      margin-left: 6px;
      padding: 3px 8px;
      font-size: 12px;
      color: #ffffff;
      background-color: rgba(255, 77, 79, 0.9);
      border-radius: 4px;
    }
  }

  /* 邀请达人榜卡片：这一族的老规矩是照 `.redpacket-msg-box` 抄（`.share-gift-msg-box` 已经是它的副本），
     逐项对齐：同宽 220、同 `margin 4px 12px`、同磨砂底、同 12px 圆角、同 `padding 10px 12px`、
     同 20px 图标 + 10px 间距、同 12px/10px 两行字号、同右侧小按钮 4px 圆角；
     差别只有图标（invite_rand.png 橙色奖杯，右侧入口同款，与本族基准卡的 red_packet.png 同一型）与按钮上那两个字。 */
  .invite-rank-msg-box {
    display: flex;
    flex-direction: column;
    width: 220px;
    margin: 4px 12px;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    /* 几何逐项抄本族基准卡 .redpacket-msg-box（M30）：圆角 12px / 卡宽 220 / 外距 4px 12 /
       底色 rgba(0,0,0,.3) + blur(10px) / 内容区 10px 12 / 图标 20×20 + 右距 10 / 标题 12 / 副标 10。
       本族是压在视频上的磨砂消息气泡，不受 M21「页面卡片直角通栏」约束，card-rounded-shadow 走文件基线豁免 */
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;

    .invite-rank-msg-main {
      display: flex;
      align-items: center;
      padding: 10px 12px;
    }

    .invite-rank-msg-icon {
      width: 20px;
      height: 20px;
      flex: none;
      margin-right: 10px;
    }

    .invite-rank-msg-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .invite-rank-msg-text {
      font-size: 12px;
      color: #ffffff;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .invite-rank-msg-tip {
      margin-top: 3px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.75);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .invite-rank-msg-btn {
      flex: none;
      margin-left: 6px;
      padding: 3px 8px;
      font-size: 12px;
      color: #ffffff;
      background-color: rgba(255, 77, 79, 0.9);
      border-radius: 4px;
    }
  }

  .redpacket-msg-box {
    display: flex;
    flex-direction: column;
    width: 220px;
    margin: 4px 12px;
    background-color: rgba(0, 0, 0, 0.3); /* 更深的磨砂透明背景，参考 portrait-msg-item */
    backdrop-filter: blur(10px); /* 磨砂效果 */
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;

    &.is-expired {
      background-color: rgba(128, 128, 128, 0.22); /* 过期灰色磨砂透明背景 */
      cursor: default;

      .redpacket-msg-icon {
        filter: grayscale(100%);
        opacity: 0.7;
      }

      .redpacket-msg-text,
      .redpacket-msg-tip {
        color: rgba(255, 255, 255, 0.72);
      }
    }

    .redpacket-msg-main {
      display: flex;
      align-items: center;
      padding: 10px 12px;

      .redpacket-msg-icon {
        width: 20px;
        height: 20px;
        margin-right: 10px;
        flex: 0 0 auto;
      }

      .redpacket-msg-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;

        .redpacket-msg-text {
          color: #ffd700;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .redpacket-msg-tip {
          color: rgba(255, 255, 255, 0.9);
          font-size: 10px;
          margin-top: 3px;
        }
      }
    }
  }

  .redpacket-grab-box {
    display: inline-flex;
    margin: 4px 12px;
    padding: 4px 10px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .redpacket-grab-text {
      color: #ffd700;
      font-size: 12px;
    }
  }

  .redpacket-revoke-box {
    display: inline-flex;
    margin: 4px 12px;
    padding: 4px 10px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .redpacket-revoke-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
    }
  }

  // 礼物消息样式适配
  .gift-box {
      background-image: none !important;
      background-color: rgba(0, 0, 0, 0.3) !important; /* 更深的磨砂透明背景 */
      border-radius: 12px;
      color: #fff !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
      justify-content: flex-start;
      margin: 4px 12px;
      padding: 4px 10px;
      width: auto;
      display: inline-flex;
      backdrop-filter: blur(10px); /* 磨砂效果 */
      
      .gift-content {
           display: inline;
           white-space: normal;
           word-break: break-word;
           line-height: 1.4;
       }
       
       text {
           color: #FFD700;
           margin-left: 4px;
           white-space: normal;
           display: inline;
           
           &.host-label {
               margin-left: 0;
           }
       }
       
       .gift-icon {
           width: 15px;
           height: 15px;
           margin-left: 4px;
           vertical-align: middle;
           display: inline-block;
       }
  }

  .message-list__item {
    padding: 2px 12px;
    
    // 强制左对齐，覆盖 .is-my
    &.is-my {
        flex-direction: row;
        .content {
            align-items: flex-start;
        }
    }

    .avatar {
        display: none;
    }

    .det {
        margin: 0;
        .content {
            .portrait-msg-item {
                background-color: rgba(0, 0, 0, 0.3); /* 更深的磨砂透明背景 */
                border-radius: 12px;
                padding: 4px 10px 6px;
                display: inline-block;
                margin: 2px 0;
                backdrop-filter: blur(10px); /* 添加模糊效果增强磨砂感 */
                
                .name {
                    color: #b3e5fc; // 浅蓝色昵称，区分度高
                    font-size: 13px;
                    font-weight: bold;
                    text-shadow: 0 1px 1px rgba(0,0,0,0.5);
                    margin-right: 4px;
                }
                
                .text {
                    color: #fff;
                    font-size: 13px;
                    text-shadow: 0 1px 1px rgba(0,0,0,0.5);
                }
                
                .host-label {
                    background-color: #007AFF;
                    color: #fff;
                    font-size: 10px;
                    padding: 2px 4px;
                    border-radius: 3px;
                    margin-right: 4px;
                    font-weight: bold;
                }
                
                .notice-label {
                    background-color: #FF3B30;
                    color: #fff;
                    font-size: 12px;
                    padding: 2px 4px;
                    border-radius: 3px;
                    margin-right: 4px;
                    font-weight: bold;
                }
                
                &.is-host {
                    background-color: rgba(0, 122, 255, 0.2); /* 调整主机消息背景 */
                    border: 1px solid rgba(0, 122, 255, 0.4);
                }
                
                &.is-notice {
                    background-color: rgba(255, 59, 48, 0.2); /* 调整通知消息背景 */
                    border: 1px solid rgba(255, 59, 48, 0.4);
                }
            }
        }
    }
  }
}
</style>
