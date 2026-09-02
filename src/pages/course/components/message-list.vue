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
