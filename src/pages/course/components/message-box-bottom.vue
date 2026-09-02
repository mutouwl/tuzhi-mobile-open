<template>
  <div>
    <!-- 底部区域 -->
    <view class="footer">
    
      <view class="input">
        <template v-if="!bantalk && isMessageEnabled">
          <!-- #ifdef MP-TOUTIAO -->
        <textarea
          :disabled="bantalk == 1"
          :placeholder="bantalk ? '全员禁言中' : ''"
          v-model="input.text"
          type="text"
          confirm-type="send"
          :adjust-position="false"
          :confirm-hold="true"
          :focus="input.focus"
          @focus="onFocus"
          @confirm="send"
        />
        <!-- #endif -->

        <!-- #ifndef MP-TOUTIAO -->
        <textarea
          :disabled="bantalk == 1"
          :placeholder="bantalk ? '全员禁言中' : ''"
          v-model="input.text"
          type="text"
          :confirm-type="confirmType"
          :adjust-position="true"
          :confirm-hold="false"
          :focus="input.focus"
          @focus="onFocus"
          @confirm="send"
          :cursor-spacing="20"
        />
        <!-- #endif -->

        <view class="send-btn" @click="send">
          <u-loading-icon v-if="sendLoading" mode="circle" size="14" color="#fff"
            inactiveColor="rgba(255,255,255,0.35)"></u-loading-icon>
          <text v-else>发送</text>
        </view>
        </template>
        <div v-else style="text-align: center;color: #f6f6f6;font-size: 12px;width: 100%;">
        {{ !isMessageEnabled ? '暂未开启消息' : '全员禁言中' }}
        </div>
      </view>
      <!-- 工具 -->

      <view class="icon" @click="control()">
        <img src="@/static/image/live/control.png" />
      </view>
      <view v-if="gift == 1 && $tools.systemConfig('app_isinstall_live_gift')" class="icon" @click="modal.gift = true">
        <img src="@/static/image/live/gift.png" />
      </view>
      <view v-if="goods == 1" class="icon" @click="modal.goods = true">
        <img src="@/static/image/live/goods.png" />
      </view>

      <!-- 连麦按钮（与带货/送礼物同排，由父级转发给 link-entry 处理申请/记录弹窗） -->
      <view v-if="link == 1" class="icon" @click="$emit('link-click')">
        <tz-icon color="#fff" :size="24" name="video" />
      </view>

      <view class="icon" @click="modal.share = true">
        <tz-icon color="#fff" :size="24" name="share_fill" />
      </view>

      <!-- <view class="icon" @click="dir" v-if="columnId">
        <img src="@/static/image/live/goods.png" />
      </view> -->
      <!-- <view class="icon" @click="control()">
                <tz-icon color="#F53F3F" name="praise_fill" />
            </view> -->
    </view>

    <template v-if="goods == 1">
      <goods-popover :live-id="courseId" />
      <goods-modal
        :live-id="courseId"
        :visible="modal.goods"
        @close="modal.goods = false"
      />
    </template>
    <template v-if="gift == 1 && $tools.systemConfig('app_isinstall_live_gift')">
      <gift-modal
        :gift_max_count="gift_max_count"
        :live-id="courseId"
        :visible="modal.gift"
        @close="modal.gift = false"
      />
    </template>

    <share-modal :val="courseId" :visible="modal.share" @close="modal.share = false" />

    
    <!-- <u-safe-bottom></u-safe-bottom> -->
  </div>
</template>

<script>
var that;
import shareModal from "@/components/modal/share-modal.vue";
import goodsPopover from "@/pages/course/live/goods/goods-popover.vue";
import goodsModal from "@/pages/course/live/goods/goods-modal.vue";
import giftModal from "@/pages/course/live/gift/gift-modal.vue";

export default {
  components: {
    goodsPopover,
    goodsModal,
    giftModal,
    shareModal
  },
  data() {
    return {
      input: {
        text: "",
        focus: false,
      },
      // 消息发送中标记：防止网络卡顿时点击/回车重复触发请求
      sendLoading: false,
      bottomHeight: 0,
      modal: {
        goods: false,
        gift: false,
        column:false,
        share:false
      },
    };
  },
  computed: {
    /**
     * 消息服务是否已开启
     * 兼容后端返回的数字 1/0 或字符串 "1"/"0"，未定义时视为开启
     */
    isMessageEnabled() {
      var v = this.messageEnabled;
      if (v === undefined || v === null) return true;
      return v !== 0 && v !== '0' && v !== false;
    },
    /**
     * 键盘右下角按钮/回车键行为：
     * - H5：return——回车由原生 keydown 监听统一处理（默认发送，Shift+回车换行）。
     *       不能设为 send：uni-h5 仅在 confirm-type 为 send 等值时接管回车（isDone 分支
     *       会自行 preventDefault/触发 confirm/收起键盘），会与原生监听重复触发且无法区分 Shift。
     * - 小程序端：send——键盘右下角按钮显示「发送」，点击/回车键触发 confirm 事件发送。
     */
    confirmType() {
      // #ifdef H5
      return "return";
      // #endif
      return "send";
    },
  },
  props: {
    courseId: {
      type: [String, Number],
      default: 0,
    },
    bantalk: {
      type: [Boolean, Number, String],
      default: false,
    },
    goods: {
      type: [Boolean, Number, String],
      default: 0,
    },
    gift: {
      type: [Boolean, Number, String],
      default: 0,
    },
    gift_max_count: {
      type: [String, Number],
      default: 100,
    },
    safeAreaBottom: {
      type: [Number, String],
      default: 0,
    },
    messageEnabled: {
      type: [Boolean, Number],
      default: true,
    },
    // 连麦开关（live_room.config.link == 1 时显示连麦按钮）
    link: {
      type: [Boolean, Number, String],
      default: 0,
    }
  },
  watch: {},
  methods: {
    dir(){
      this.$emit("dir", false);
    },
    control() {
      this.$emit("control", false);
    },
    onKeydown(e) {
      // 回车键/换行键默认发送，Shift+回车保留换行
      // 由 mounted 中挂载的原生 keydown 监听调用：uni-h5 的组件 @keydown 事件
      // 会被包装丢失 key/shiftKey/preventDefault，只能监听原生 DOM 事件
      if (!e || !e.target) {
        return;
      }
      // 仅处理底部消息输入框（textarea）内的回车，避免误伤礼物/商品等弹窗内输入
      if (e.target.tagName !== "TEXTAREA") {
        return;
      }
      // 输入法组词确认的回车（isComposing / keyCode 229）不触发发送
      if (e.isComposing || e.keyCode === 229) {
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault && e.preventDefault();
        this.send();
      }
    },

    send() {
      var self = that || this;
      if (!self.isMessageEnabled) {
        uni.showToast({ title: '暂未开启消息', icon: 'none' });
        return false;
      }
      if (!self.input.text || !self.input.text.trim()) {
        return false;
      }
      // 上一条消息仍在发送中时忽略本次触发（点击发送/键盘确认/回车均会进入）
      if (self.sendLoading) {
        return false;
      }
      self.sendLoading = true;
      // mask 阻挡触摸，避免加载期间重复点击
      uni.showLoading({
        title: "正在发送",
        mask: true,
      });
      self
        .$api("live.message.send", {
          course_id: self.courseId,
          message: self.input.text,
        })
        .then((res) => {
          // 仅发送成功清空输入框，失败时保留内容便于重发
          if (res.code === 1) {
            self.input.text = "";
          }
        })
        .catch(() => {
          // 接口拦截器已处理业务失败(code=0)的提示，此处兜底网络等异常
          uni.showToast({ title: '消息发送失败', icon: 'none' });
        })
        .finally(() => {
          self.sendLoading = false;
          uni.hideLoading();
        });
    },

    debounce(fn, delay = 500) {
      let flag = true,
        timer = null;
      return function (...args) {
        if (flag) {
          fn.apply(this, args);
          flag = false;
        }
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          clearTimeout(timer);
          flag = true;
        }, delay);
      };
    },
    onFocus() {
      // that.openPanel("close");
      setTimeout(() => {
        that.scrollBottom();
      }, 300);
    },
    scrollBottom() {
      that.debounce(function () {
        that.scroller.animation = true;
        that.scroller.top = 100000 + Math.random();
      }, 300);
    },
  },
  mounted() {
    that = this;
    // H5 端：uni-h5 组件事件（@keydown）会被包装丢失 key/shiftKey/preventDefault，
    // 改为在组件根节点挂原生 keydown 监听（textarea 键盘事件冒泡到根节点），
    // 实现回车/换行键默认发送、Shift+回车换行；销毁时移除监听
    // #ifdef H5
    if (this.$el) {
      this._chatKeydownHandler = function (e) {
        that.onKeydown(e);
      };
      this.$el.addEventListener("keydown", this._chatKeydownHandler);
    }
    // #endif
    // this.bottomHeight = uni.$u.sys().safeAreaInsets.bottom / 4;
    // console.log("this.bottomHeight",this.bottomHeight)
  },
  beforeDestroy() {
    // #ifdef H5
    if (this._chatKeydownHandler && this.$el) {
      this.$el.removeEventListener("keydown", this._chatKeydownHandler);
    }
    // #endif
  },
};
</script>

<style lang="scss" scoped>
.footer {
    display: flex;
    align-items: center;
    width: 100%;
    background-color: transparent;
    flex-shrink: 0;
    padding: 3px 10px 6px;
    box-sizing: border-box;
    
    // position: fixed;
    // bottom:46px;
    left: 0;

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 34px;
    width: 34px;
    border-radius: 50%;
    margin-left: 10px;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);

    &:active {
      background-color: rgba(0, 0, 0, 0.5);
    }

    text {
      font-size: 60rpx;
      color: #fff;
    }

    img {
      width: 18px;
      height: 18px;
      // filter: brightness(100) invert(1);
    }
  }

  .send-btn {
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    width: 35px;
    opacity: .8;
  }

  .input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
    border-radius: 20px;
    flex: 1;
    margin: 5px 5px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    // #ifdef MP
    padding: 8px 10px;
    // #endif

    // #ifndef MP
    padding: 8px 10px;
    // #endif

    textarea {
      width: 100%;
      height: max-content;
      // height: 34px;
      font-size: 14px;
      box-sizing: border-box;
      color: #fff;
    }
  }
}
</style>
