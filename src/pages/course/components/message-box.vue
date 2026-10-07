<template>
  <div class="page-chat" :style="{height: height + 'px'}">
    <template>
    <!-- 消息区域 -->
    <view class="container">
      <u-transition
        customStyle="position: absolute;top: 50px;left: 20px;z-index: 1;"
        :show="modal.giftTransition"
        mode="fade-left"
        v-if="giftDetail && giftDetail.user_id"
      >
        <view class="gift-transition">
          <view class="gift-box">
            <text class="gift-content">
              <image class="gift-icon" src="@/static/image/live/gift.png" />
              <text class="gift-nickname">{{ giftDetail.nickname }}</text>
              <text class="gift-action">送出了</text>
              <text class="gift-name">{{ giftDetail.message }}</text>
            </text>
          </view>
        </view>
      </u-transition>

      <!-- 连接状态条：首连阶段不显示，断线重连显示加载态，失败/断开态显示刷新图标 + 关闭图标。
           关闭后由页面在右侧悬浮栏挂一枚入口（见 live.vue 的 linkBarEntryVisible），点它再把这张卡放回来 -->
      <div class="link-error-box" v-if="showLinkBar">
      <span class="link-error-info">
        <span class="link-error-main">
          <u-loading-icon
            v-if="isRelinking"
            mode="circle"
            size="14"
            color="#fff"
            inactive-color="rgba(255, 255, 255, 0.35)"
          ></u-loading-icon>
          <span>{{ tipText }}</span>
        </span>
        <span class="link-error-sub" v-if="!isRelinking">直播状态不受影响，会自动刷新</span>
      </span>
      <span class="link-error-actions">
        <span class="re-link-btn" v-if="!isRelinking" @click="reLink()">
          <tz-icon name="refresh" :size="14" color="#fff"></tz-icon>
        </span>
        <span class="link-error-close" @click="closeLinkBar()">
          <tz-icon name="close" :size="14" color="#fff"></tz-icon>
        </span>
      </span>
      </div>

      <!-- 外层这一只 view 只挂上下渐隐遮罩，不参与滚动：mask 直接写在 scroll-view 上时，
           iOS 的惯性滚动会把遮罩算进那一张合成层里（滚动过程中掉帧/整层忽明忽暗），
           写在不动的父层上才是稳定档。遮罩口径见下面样式里的 .scroller-fade -->
      <view class="scroller-fade">
        <scroll-view
          scroll-y
          :scroll-with-animation="scroller.animation"
          :scroll-top="scroller.top"
          :upper-threshold="0"
          scroll-anchoring
          :show-scrollbar="false"
          @scrolltoupper="loadmore"
          class="scroller"
        >
          <view id="chatlistbox" class="chat-list">
            <message-list-box :meessageList="messageList" @openRedpacket="onOpenRedpacket" @openShareGift="onOpenShareGift" @openInviteRank="onOpenInviteRank"/>
          </view>
        </scroll-view>
      </view>
    </view>
    

    </template>

  </div>
</template>

<script>
var that;
var giftTransitionTimer = null;
import messageListBox from "@/pages/course/components/message-list.vue";
// 通用直播消息服务库（web/pc/h5/小程序通用，见 src/common/live-message/index.js）
import liveMessage from "@/common/live-message/index.js";

// #ifdef MP-TOUTIAO
import ROP from "@/static/lib/dms/dms.js";
// #endif

// #ifdef MP-WEIXIN
// 微信小程序当前不支持直播即时消息，使用空实现避免引入大体积的 dms.js / mqtt.js（>400KB）。
// 如需在微信小程序上启用直播聊天，请替换为对应的实现。
var MP_NOOP_ROP = {
  Enter() {},
  Leave() {},
  Subscribe() {},
  On() {},
  Off() {},
  Publish() {}
};
// #endif

// 阿里云互动消息客户端由通用库按需注入（message-box 仅提供 loadSdk/getAuth）

export default {
  components: { messageListBox },
  data() {
    return {
      modal: {
        giftTransition: false,
      },
      scroller: {
        top: 0,
        animation: false,
      },
      form: {
        page: 1,
        limit: 20,
      },
      input: {
        text: "",
        focus: false,
      },
      messageList: [],
      isLoad: false,
      linkStatus: false,
      // 本次进页是否已连上过：首连成功前的「正在连接」不显示状态条
      linkedOnce: false,
      // 是否由用户点击「重新连接」触发：手点要有加载反馈
      manualRelink: false,
      tipText: "消息服务连接失败，请刷新重试",
      giftDetail: {},
      // 通用直播消息服务库实例（连接/订阅/事件由库统一管理）
      msgClient: null,
      // 阿里云模式专用状态
      aliyun: {
        // 是否已提示过微信小程序不支持
        weixinNotSupportedTipShown: false,
        // 是否正在初始化中（避免重复进入）
        initializing: false,
        // 消息回调是否已绑定（避免重连时重复绑定导致消息重复处理）
        callbacksBound: false,
      },
    };
  },
  computed: {
    /**
     * 是否处于连接中/重连中
     */
    isRelinking() {
      return ['relink', 'reconnect', 'connecting'].includes(this.linkStatus);
    },
    /**
     * 连接状态条「本应显示」判据（不含用户关闭）
     * 连接失败/断开显示错误态（带刷新图标按钮）；
     * 加载态只在「已连上过之后掉线重连」或「手点重新连接」时显示，
     * 首次进页建连那 1~5s 不显示（成功前一闪而过的「正在连接」会被当成报错）
     * 这一份原样上抛页面，右侧悬浮入口按「本应显示 && 已被用户关掉」判显隐
     */
    linkBarShown() {
      if (['fail', 'losed', 'offline'].includes(this.linkStatus)) {
        return true;
      }
      return this.isRelinking && (this.linkedOnce || this.manualRelink);
    },
    /**
     * 连接状态条实际显示：用户关掉后由页面那枚悬浮入口再放回来
     */
    showLinkBar() {
      return this.linkBarShown && !this.linkBarDismissed;
    },
    /**
     * 是否为阿里云消息服务商
     */
    isAliyunProvider() {
      return this.messageProvider === "aliyun";
    },
    /**
     * 消息服务是否已开启
     * 兼容后端返回的数字 1/0 或字符串 "1"/"0"，未定义时视为开启
     */
    isMessageEnabled() {
      var v = this.messageEnabled;
      if (v === undefined || v === null) return true;
      return v !== 0 && v !== '0' && v !== false;
    },
  },
  props: {
    height: {
      type: [String, Number],
      default: 0,
    },
    course_id: {
      type: [String, Number],
      default: 0,
    },
    topic: {
      type: String,
      default: "",
    },
    notice: {
      type: String,
      default: "",
    },
    messagePubkey: {
      type: String,
      default: "",
    },
    messageSubkey: {
      type: String,
      default: "",
    },
    bantalk: {
      type: [Boolean, Number, String],
      default: false,
    },
    goods: {
      type: [Boolean, Number, String],
      default: false,
    },
    gift: {
      type: [Boolean, Number, String],
      default: false,
    },
    gift_max_count: {
      type: [String, Number],
      default: 0,
    },
    /**
     * 消息服务商：'aodianyun'（默认，兼容历史数据）/ 'aliyun'
     */
    messageProvider: {
      type: String,
      default: "aodianyun",
    },
    /**
     * 消息服务是否已开启：1=开启，0=关闭
     */
    messageEnabled: {
      type: [Boolean, Number],
      default: true,
    },
    /**
     * 用户点卡片上那枚关闭图标后的收起位（页面持有，页面右侧悬浮入口点开时置回 false）
     */
    linkBarDismissed: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    course_id() {
      that.init();
    },
    topic() {
      if (this.topic) {
        that.init();
      }
    },
    // 连接状态上抛父级：直播间据此联动轮询频率——
    // success（SOCKET 可用）时 getRoomDetail 降为低频兜底；断开/失败回快轮询
    linkStatus(val) {
      if (val === "success") {
        this.linkedOnce = true;
      }
      this.$emit("link-status", val);
    },
    // 卡片「本应显示」状态变化上抛：页面右侧悬浮入口据此判显隐（关掉卡片后那枚入口才出现）
    linkBarShown(val) {
      this.$emit("link-bar-state", val);
    },
  },
  methods: {
    /**
     * 关闭连接状态条（事件名不与原生事件同名，理由同 link-status 那条：H5 端模板里的
     * 原生监听名会被单向改写成 click，见 ui-baseline-mobile.md M28）
     */
    closeLinkBar() {
      this.$emit("link-bar-dismiss");
    },
    control() {
      this.$emit("control", false);
    },
    scrollBottom() {
      setTimeout(function () {
        that.scroller.animation = false;
        that.scroller.top = 100000 + Math.random();
      }, 200);
    },
    //加载消息
    async loadmore() {
      if (that.isLoad) {
        return false;
      }

      that.isLoad = true;

      var queryDom = null;
      // #ifdef MP-WEIXIN || MP-TOUTIAO
      var queryDom = this.createSelectorQuery();
      // #endif

      // 原位置
      const r1 = await that.$tools.getRect(".chat-list", queryDom);

      await that.getMessage();

      await this.$nextTick();

      // 新位置
      var r2 = await that.$tools.getRect(".chat-list", queryDom);

      // // 关闭动画
      that.scroller.animation = false;

      if (that.form.page == 2 || that.form.page == 1) {
        that.scrollBottom();
      } else {
        that.scroller.top = r2.height - r1.height + Math.random();
      }
    },
    refreshGiftTransition() {
      that.modal.giftTransition = false;
      clearInterval(giftTransitionTimer);
    },
    setGiftTransition(data) {
      that.refreshGiftTransition();

      that.giftDetail = data;
      that.modal.giftTransition = true;
      giftTransitionTimer = setInterval(function () {
        that.modal.giftTransition = false;
      }, 4500);
    },

    async getMessage() {
      that.form.course_id = that.course_id;

      await that.$api("live.message.list", that.form).then((res) => {
        if (res.code === 1) {
          for (var i in res.data) {
            that.messageList.unshift(res.data[i]);
          }

          if (that.form.page == 1 && that.notice) {
            that.messageList.push({
              is_my: false,
              avatar: "",
              message: that.notice,
              nickname: "公告",
              type: "text",
              time: Date.now() / 1000,
            });
          }

          if (res.data.length >= that.form.limit) {
            that.form.page++;
            that.isLoad = false;
          }
        }
      });
    },

    /**
     * 重新连接
     * 统一走通用库：奥点云 disconnect() 会复位底层状态机（断线退避超时卡死修复），
     * 再 connect 必定真正发起连接；阿里云 reconnect 走 logout→login→joinGroup
     * （绕开 SDK logined 幂等跳过）；initializing 卡死（拉鉴权网络黑洞）超过 10s 强制复位重进
     */
    reLink() {
      // 手点重连要有加载反馈（首连阶段的静默不算）
      that.manualRelink = true;
      // 阿里云模式：库内 reconnect 完成 登出→重登→入群
      if (that.isAliyunProvider) {
        // #ifdef H5
        if (that.aliyun.initializing) {
          if (
            that._aliyunInitialSince &&
            Date.now() - that._aliyunInitialSince > 10000
          ) {
            // 上一次连接流程卡死超过 10s（如拉鉴权无响应），强制复位后重进
            that.aliyun.initializing = false;
          } else {
            // 正常重连中，避免重复进入
            return;
          }
        }
        that.connectAliyunMessage(true, true);
        // #endif
        return;
      }
      // 奥点云模式：disconnect（复位状态机）→ connect，确保重连生效
      that.linkStatus = "relink";
      that.tipText = "正在重新连接消息服务";
      if (that.msgClient) {
        that.msgClient.disconnect();
        that.msgClient.connect({ topic: that.topic });
      } else {
        that.init();
      }
    },

    //断开连接（通用库统一管理）
    leave() {
      if (that.msgClient) {
        that.msgClient.disconnect();
      }
    },

    onPageUnload() {
      clearInterval(giftTransitionTimer);
      // 页面销毁时断开消息服务（通用库内部会按服务商释放连接与定时器）
      that.leave();
    },

    /**
     * 奥点云连接初始化（通用库 aodianyun provider）
     * 库内置断线重连状态机复位（退避超时后自动复位，重连必生效）、
     * 统一 status 事件（success/fail/losed/offline/connectold/reconnect）
     * @return {void}
     */
    connectAodianyunMessage() {
      if (that.msgClient) {
        that.msgClient.disconnect();
      }
      const token = uni.getStorageSync("user_token");
      // 小程序端注入 dms 兼容引擎（抖音），H5/Web/PC 走库内置 WebSocket（Paho 注入）
      // #ifdef MP-TOUTIAO
      var mpEngine = ROP;
      // #endif
      // #ifndef MP-TOUTIAO
      var mpEngine = null;
      // #endif
      var client = liveMessage.create({
        provider: "aodianyun",
        env: mpEngine ? "mp" : "h5",
        mpEngine: mpEngine,
        pubKey: that.messagePubkey,
        subKey: that.messageSubkey,
        clientId: token || "",
        useSSL: true,
        // H5 下由库内部加载 Paho；此处提供 getPaho 供库判断就绪
        getPaho: function () {
          return typeof window !== "undefined" && window.Paho ? window.Paho : null;
        },
      });
      // 收到关注话题的消息
      client.on("message", function (data, topic) {
        that.receive(data, topic);
      });
      // 连接状态事件 → 页面链接状态条
      client.on("status", function (s) {
        that.applyLinkStatus(s);
      });
      that.msgClient = client;
      that.linkStatus = "relink";
      that.tipText = "正在连接消息服务";
      client.connect({ topic: that.topic });
    },

    /**
     * 连接状态事件统一映射到页面链接状态条
     * @param {Object} s 状态事件 {status, tipText}
     * @return {void}
     */
    applyLinkStatus(s) {
      if (!s || !s.status) {
        return;
      }
      var map = {
        success: ["success", "消息服务已连接"],
        fail: ["fail", "消息服务连接失败，请重新连接"],
        losed: ["losed", "消息服务已断开，请重新连接"],
        offline: ["offline", "消息服务已离线，请重新连接"],
        connectold: ["connectold", "账号已在其他设备登录，消息服务已断开"],
        reconnect: ["reconnect", "正在重新连接消息服务"],
        connecting: ["relink", "正在连接消息服务"],
      };
      var item = map[s.status] || ["relink", s.tipText || "正在连接消息服务"];
      that.linkStatus = item[0];
      that.tipText = item[1];
    },

    init() {
      that.loadmore();

      // 消息服务未开启时，不建立连接
      if (!that.isMessageEnabled) {
        return;
      }

      // 根据 provider 选择连接方式（统一走通用库）
      if (that.isAliyunProvider) {
        // 微信小程序阿里云模式：提示不支持
        // #ifdef MP-WEIXIN
        that.showAliyunNotSupportedTip();
        return;
        // #endif

        // #ifndef H5
        // 抖音等其他小程序暂不支持阿里云消息服务
        that.showAliyunNotSupportedTip();
        return;
        // #endif

        // #ifdef H5
        that.connectAliyunMessage(false);
        // #endif
        return;
      }

      that.connectAodianyunMessage();
    },

    /**
     * 不支持阿里云 SDK 的小程序平台提示
     * 文案按平台区分，便于用户感知
     */
    showAliyunNotSupportedTip() {
      if (that.aliyun.weixinNotSupportedTipShown) {
        return;
      }
      that.aliyun.weixinNotSupportedTipShown = true;
      var tipTitle = "当前平台暂不支持阿里云消息服务，请联系客服";
      // #ifdef MP-WEIXIN
      tipTitle = "暂不支持微信小程序阿里云消息服务，请联系客服";
      // #endif
      // #ifdef MP-TOUTIAO
      tipTitle = "暂不支持抖音小程序阿里云消息服务，请联系客服";
      // #endif
      uni.showToast({
        title: tipTitle,
        icon: "none",
        duration: 3000,
        mask: false,
      });
    },

    // #ifdef H5
    /**
     * 阿里云模式连接初始化（通用库 aliyun provider）
     * 库内完成：加载 SDK → 鉴权 → init → login → joinGroup → 监听消息；
     * 重连（isRelink）自动走 logout→login→joinGroup（绕开 SDK logined 幂等跳过）；
     * token 过期由库内 getAuth 自动续期；断线状态经统一 status 事件上抛
     * @param {Boolean} isRelink 是否为重连场景（reLink 触发）
     * @param {Boolean} force    是否强制重进（initializing 卡死保护放行后调用）
     * @return {void}
     */
    connectAliyunMessage(isRelink, force) {
      if (that.aliyun.initializing && !force) {
        return;
      }
      that.aliyun.initializing = true;
      that._aliyunInitialSince = Date.now();
      that.linkStatus = "relink";
      that.tipText = "正在连接消息服务";

      const doConnect = function (relink) {
        // 复用同一库实例（disconnect 仅登出复位，引擎保留）
        let client = that.msgClient;
        if (!client) {
          client = liveMessage.create({
            provider: "aliyun",
            getAuth: function () {
              return that
                .$api("live.message.getAliyunAuth", {
                  course_id: that.course_id,
                })
                .then(function (res) {
                  if (res.code !== 1 || !res.data) {
                    throw new Error((res && res.msg) || "获取消息服务鉴权失败");
                  }
                  return res.data;
                });
            },
            loadSdk: function () {
              return that.loadAliyunImSdk();
            },
          });
          client.on("message", function (parsed, groupId) {
            that.receiveAliyunMessage(parsed, groupId);
          });
          client.on("message_delete", function (payload) {
            that.removeAliyunMessage(payload);
          });
          // 连接状态事件 → 页面链接状态条（success/fail/losed/offline/connectold/...）
          client.on("status", function (s) {
            that.applyLinkStatus(s);
          });
          that.msgClient = client;
        }
        return client.connect({ topic: that.topic, relink: relink }).then(
          function () {
            that.aliyun.initializing = false;
            that._aliyunInitialSince = 0;
            that.linkStatus = "success";
            that.tipText = "消息服务已连接";
          },
          function (err) {
            console.error("[alivc-im] 连接失败", err);
            that.aliyun.initializing = false;
            that._aliyunInitialSince = 0;
            // 鉴权/网络失败自动重试 1 次（兼容临时波动），重试仍失败才显示错误框
            if (!relink && !that._authRetryCount) {
              that._authRetryCount = 1;
              setTimeout(function () {
                that.connectAliyunMessage(true);
              }, 2000);
              return;
            }
            that._authRetryCount = 0;
            that.linkStatus = "fail";
            that.tipText = "消息服务连接失败，请重新连接";
          }
        );
      };

      doConnect(!!isRelink);
    },

    /**
     * 动态加载阿里云互动消息 SDK（H5，同一页面只注入一次）
     * @return {Promise<void>}
     */
    loadAliyunImSdk() {
      if (that._aliyunSdkPromise) {
        return that._aliyunSdkPromise;
      }
      if (typeof window !== "undefined" && window.AliVCInteraction) {
        that._aliyunSdkPromise = Promise.resolve();
        return that._aliyunSdkPromise;
      }
      that._aliyunSdkPromise = new Promise(function (resolve, reject) {
        const script = document.createElement("script");
        script.src =
          "https://g.alicdn.com/apsara-media-box/imp-interaction/1.9.0/alivc-im.iife.js";
        script.async = true;
        script.charset = "UTF-8";
        script.onload = function () {
          if (window.AliVCInteraction) {
            resolve();
          } else {
            that._aliyunSdkPromise = null;
            reject(new Error("阿里云 SDK 加载完成但未找到全局对象"));
          }
        };
        script.onerror = function () {
          that._aliyunSdkPromise = null;
          reject(new Error("阿里云 SDK 加载失败"));
        };
        document.getElementsByTagName("head")[0].appendChild(script);
      });
      return that._aliyunSdkPromise;
    },

    /**
     * 阿里云消息接收处理（通用库 message 事件已解析）
     * @param {Object} data  JSON.parse 后的消息对象
     * @param {String} groupId 群组ID
     */
    receiveAliyunMessage(data, groupId) {
      // 仅处理本直播间群组消息
      if (groupId && that.topic && groupId !== that.topic) {
        return;
      }
      if (!data) {
        // 解析失败的消息忽略，不渲染
        return;
      }

      // 兼容阿里云消息体字段：优先使用解析后的业务字段
      // 后端推送时已按 {user_id, nickname, avatar, message, type, time, message_id} 结构组装
      if (data.type == "goods_explaining") {
        that.emitGoodsExplaining(data.data || null);
        return;
      }

      // 直播状态实时推送（主播推流开始/停止）：上抛父级页面立即刷新状态，
      // 不渲染进聊天列表（控制类消息）；data = {course_id, action, status, status_text}
      if (data.type == "stream_status") {
        that.$emit("stream-status", data);
        return;
      }

      // 右侧悬浮入口三枚（红包 / 分享有礼 / 邀请达人榜）的显隐变更：控制类消息，不渲染进聊天列表，
      // 上抛父级由它把三枚真值按下去（EntryNotice 现算好推下来，前端不自己判，M22）。
      // 管理员在直播中途改开关 / 建活动 / 发红包时推，学员端据此即时显隐，不必退出重进。
      if (data.type == "live_entry") {
        that.$emit("live-entry", data);
        return;
      }

      // 管理员拉黑通知（群组广播，按 data.user_ids 命中自己才上抛）：直播间收到即停止观看并退出，
      // 属控制类消息不渲染进聊天列表
      if (data.type == "user_black") {
        that.emitUserBlack(data);
        return;
      }

      // 连麦开关控制消息（讲师切换「允许学员申请连麦」）：实时上抛父级页面，
      // 由父级更新 roomData.config 驱动工具条「申请连麦」按钮及时显示/隐藏
      if (data.type == "link_allow") {
        that.$emit("link-allow", data);
        return;
      }

      // 讲师拒绝连麦申请消息（定向推送该学员）：仅当前学员响应，
      // 提示「讲师已拒绝你的连麦申请」并刷新连麦记录弹窗
      if (data.type == "link_rejected") {
        if (data.user_id && String(data.user_id) == String(that.currentUserId())) {
          that.$emit("link-rejected", data);
        }
        return;
      }

      // 讲师取消连麦邀请消息（定向推送该学员）：仅当前学员响应，
      // 关闭邀请弹窗并提示「讲师已取消连麦邀请」
      if (data.type == "link_invite_cancel") {
        if (data.user_id && String(data.user_id) == String(that.currentUserId())) {
          that.$emit("link-invite-cancel", data);
        }
        return;
      }

      // 连麦事件消息（讲师邀请/同意/结束/全员下麦，定向匹配当前用户）：实时上抛父级页面，
      // 由父级转发 link-entry 弹出邀请提醒/自动进入连麦/本地下麦（不再依赖周期轮询）
      if (
        data.type == "link_invite" ||
        data.type == "link_agree" ||
        data.type == "link_end" ||
        data.type == "link_end_all"
      ) {
        if (data.user_id && String(data.user_id) == String(that.currentUserId())) {
          that.$emit(
            data.type == "link_invite"
              ? "link-invite"
              : data.type == "link_agree"
              ? "link-approved"
              : "link-ended",
            data
          );
        }
        return;
      }

      // 连麦控制类消息（link_ 前缀，如学员申请连麦）：仅供中控台使用，移动端不渲染
      if (data.type && data.type.indexOf("link_") === 0) {
        return;
      }

      data.uniqueId = that.generateMessageId(data);
      if (that.isMessageDuplicate(data.uniqueId)) {
        return;
      }

      var userInfo = uni.getStorageSync("user_info");
      var currentUserId = "";
      try {
        currentUserId = userInfo ? JSON.parse(userInfo).id : "";
      } catch (e) {
        currentUserId = "";
      }
      data.is_my = data.user_id == currentUserId;

      that.messageList.push(data);

      if (data.type == "gift") {
        that.setGiftTransition(data);
      }

      if (data.type == "redpacket") {
        that.$emit("openRedpacket", data);
      }

      // 讨论区里出现「分享有礼 / 达人榜」的活动卡片 ⇒ 上抛父级重判右侧那一枚悬浮入口
      // （用户 2026-10-04 点名：直播中途才建的活动，只要在讨论区出现过，就该监听这条事件把按钮显示出来）。
      // 只有实时推送这一路走这里，历史消息走 getMessage() 不经这一段 ⇒ 进房拉历史不会重复触发；
      // 那一趟由组件 mounted 自己取一次。事件名不与原生事件同名（M28：H5 端编译器只单向改模板里的监听名）。
      if (data.type == "share_gift" || data.type == "invite_rank") {
        that.$emit("entry-card", data);
      }

      that.scrollBottom();
    },

    /**
     * 阿里云消息撤回处理（通用库 message_delete 事件，payload={messageId, groupId}）
     */
    removeAliyunMessage(payload) {
      if (!payload || !payload.messageId) return;
      var msgId = payload.messageId;
      for (var i = that.messageList.length - 1; i >= 0; i--) {
        var msg = that.messageList[i];
        if (
          (msg.message_id && String(msg.message_id) === String(msgId)) ||
          (msg.msg_tid && String(msg.msg_tid) === String(msgId))
        ) {
          that.messageList.splice(i, 1);
        }
      }
    },
    // #endif

    //收到消息（奥点云模式）
    receive(data, topic) {
      if (topic == that.topic) {
        let userInfo = uni.getStorageSync("user_info");
        var data = JSON.parse(data);
        
        if (data.type == "goods_explaining") {
          that.emitGoodsExplaining(data.data || null);
          return;
        }

        // 直播状态实时推送（主播推流开始/停止）：上抛父级页面立即刷新状态，
        // 不渲染进聊天列表（控制类消息）；data = {course_id, action, status, status_text}
        if (data.type == "stream_status") {
          that.$emit("stream-status", data);
          return;
        }

        // 右侧悬浮入口三枚（红包 / 分享有礼 / 邀请达人榜）的显隐变更：控制类消息，不渲染进聊天列表，
        // 上抛父级由它把三枚真值按下去（与上面阿里云那一条同一判据、同一载荷形状）
        if (data.type == "live_entry") {
          that.$emit("live-entry", data);
          return;
        }

        // 管理员拉黑通知（群组广播，按 data.user_ids 命中自己才上抛）：直播间收到即停止观看并退出
        if (data.type == "user_black") {
          that.emitUserBlack(data);
          return;
        }

        // 连麦开关控制消息（讲师切换「允许学员申请连麦」）：实时上抛父级页面
        if (data.type == "link_allow") {
          that.$emit("link-allow", data);
          return;
        }

        // 讲师拒绝连麦申请消息（定向推送该学员）：仅当前学员响应，
        // 提示「讲师已拒绝你的连麦申请」并刷新连麦记录弹窗
        if (data.type == "link_rejected") {
          if (data.user_id && String(data.user_id) == String(that.currentUserId())) {
            that.$emit("link-rejected", data);
          }
          return;
        }

        // 讲师取消连麦邀请消息（定向推送该学员）：仅当前学员响应，
        // 关闭邀请弹窗并提示「讲师已取消连麦邀请」
        if (data.type == "link_invite_cancel") {
          if (data.user_id && String(data.user_id) == String(that.currentUserId())) {
            that.$emit("link-invite-cancel", data);
          }
          return;
        }

        // 连麦事件消息（讲师邀请/同意/结束/全员下麦，定向匹配当前用户）：实时上抛父级页面，
        // 由父级转发 link-entry 弹出邀请提醒/自动进入连麦/本地下麦（不再依赖周期轮询）
        if (
          data.type == "link_invite" ||
          data.type == "link_agree" ||
          data.type == "link_end" ||
          data.type == "link_end_all"
        ) {
          if (data.user_id && String(data.user_id) == String(that.currentUserId())) {
            that.$emit(
              data.type == "link_invite"
                ? "link-invite"
                : data.type == "link_agree"
                ? "link-approved"
                : "link-ended",
              data
            );
          }
          return;
        }

        // 连麦控制类消息（link_ 前缀，如学员申请连麦）：仅供中控台使用，移动端不渲染
        if (data.type && data.type.indexOf("link_") === 0) {
          return;
        }

        // 为消息生成唯一ID（结合时间戳和随机数）
        data.uniqueId = this.generateMessageId(data);
        
        // 检查是否已存在相同唯一ID的消息
        if (this.isMessageDuplicate(data.uniqueId)) {
          return;
        }
        

        if (data.user_id == JSON.parse(userInfo).id) {
          data.is_my = true;
        } else {
          data.is_my = false;
        }
        that.messageList.push(data);

        if (data.type == "gift") {
          that.setGiftTransition(data);
        }

        if (data.type == "redpacket") {
          that.$emit("openRedpacket", data);
        }

        // 与上面阿里云那一路同一判据、同一载荷：讨论区出现活动卡片 ⇒ 上抛 entry-card 让页面重判那一枚入口
        // （实时推送才走这里，历史消息走 getMessage()，见 receiveAliyunMessage 那一段的注记）
        if (data.type == "share_gift" || data.type == "invite_rank") {
          that.$emit("entry-card", data);
        }

        that.scrollBottom();
      }
    },

    /**
     * user_black 控制消息定向匹配
     * 消息服务只有群组广播（无点对点能力），故后端把被拉黑名单广播给全房，
     * 前端比对名单里是否有自己才上抛父级页面处理（与 link_rejected 的定向机制一致）
     * @param {Object} data 控制消息，data.data = {course_id, user_ids}
     */
    emitUserBlack(data) {
      var payload = (data && data.data) || {};
      var ids = Array.isArray(payload.user_ids)
        ? payload.user_ids
        : (data && data.user_id ? [data.user_id] : []);
      var me = String(that.currentUserId());
      if (!me || !ids.length) {
        return;
      }
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i]) === me) {
          that.$emit("user-black", data);
          return;
        }
      }
    },

    /**
     * 当前登录用户 ID（读取本地 user_info，解析失败返回空串）
     * @returns {String}
     */
    currentUserId() {
      try {
        var userInfo = uni.getStorageSync("user_info");
        return userInfo ? String(JSON.parse(userInfo).id || "") : "";
      } catch (e) {
        return "";
      }
    },

    /**
     * 生成消息唯一ID
     * @param {Object} messageData 消息数据
     * @returns {String} 唯一ID
     */
    generateMessageId(messageData) {
      // 使用消息内容+时间戳+随机数生成唯一ID
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      const contentHash = this.hashCode(JSON.stringify(messageData));

      // 如果有服务器提供的唯一标识优先使用
      if (messageData.message_id) {
        return `msg_${messageData.message_id}`;
      }

      // 阿里云模式下使用 msg_tid 作为唯一标识
      if (messageData.msg_tid) {
        return `tid_${messageData.msg_tid}`;
      }

      // 否则生成基于内容和时间的唯一ID
      return `gen_${contentHash}_${timestamp}_${random}`;
    },
    /**
     * 简单哈希函数
     * @param {String} str 输入字符串
     * @returns {Number} 哈希值
     */
    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    },
    /**
     * 检查消息是否重复
     * @param {String} messageId 消息唯一ID
     * @returns {Boolean} 是否重复
     */
    isMessageDuplicate(messageId) {
      return that.messageList.some((msg) => msg.uniqueId === messageId);
    },
    emitGoodsExplaining(data) {
      uni.$emit("live_goods_explaining", {
        liveId: that.course_id,
        data: data,
      });
    },
    onOpenRedpacket(item) {
      that.$emit("openRedpacket", item);
    },
    // 分享有礼卡片：列表层已经把消息体 JSON 解好（{activity_id, title, subtitle}）再交上来，
    // 这里只原样转给直播间页，由它打开活动详情弹窗
    onOpenShareGift(payload) {
      that.$emit("openShareGift", payload);
    },
    // 邀请达人榜卡片：与分享有礼同一条链，列表层解析好的载荷原样上抛，
    // 由直播间页打开右侧那枚达人榜入口的榜单弹层
    onOpenInviteRank(payload) {
      that.$emit("openInviteRank", payload);
    },
  },
  mounted() {
    that = this;

    if (this.topic && this.course_id) {
      this.init();
    }
  }
};
</script>

<style lang="scss" scoped>
.page-chat {

  // position: absolute;
    // bottom: 90px; /* 留出底部工具栏高度 */
    left: 0;
    width: 75%;
    max-width: 300px;

  display: flex;
  flex-direction: column;
  // padding-bottom: env(safe-area-inset-bottom);
  // background-color: #fff;
  box-sizing: border-box;
  overflow: hidden;
  padding-bottom: 0px;

  .more-btn {
    padding: 0 20rpx;
    font-size: 44rpx;
  }

  .container {
    flex: 1;
    // background-color: #f5f6f9;
    overflow: hidden;
    position: relative;

    /* 上下两端渐隐遮罩：消息滚到边界时先淡出，不再整行被硬切成一条直线
       （2026-10-06 用户点名直播间讨论区「像是被模糊掉了，并不是直接分割那种隐藏掉」）。
       只吃 alpha 通道，底下是视频还是白面板都能透出，所以不必像背景色遮罩那样猜底色。
       色标取百分比不取 px+calc：calc() 写在渐变色标位置上，老版本 iOS Safari 会整条丢掉
       这一声明 —— 丢掉之后一点效果都没有，而源码看着完全正常。
       12% 在这一屏（讨论区高 = 窗口高 / 3）约 27px ≈ 一条气泡高；嫌宽退到 8%、嫌窄进到 16%。
       ⚠️ 带 mask 的祖先在 Blink/WebKit 里构成 backdrop root，后代就 blur 不到这个根之外的画面：
       这一族气泡（.portrait-msg-item、.notice、三张活动卡）都写着 `backdrop-filter: blur(10px)`，
       父层一加 mask 它们就糊不到身后那层视频，只剩 rgba(0,0,0,.3) 压在原画面上（白字可读性掉一档）。
       跑起来先看那一眼：气泡里还看得出身后画面的模糊纹理 = 没事；只剩一层 flat 黑 = 被打掉了。
       退法是撤这两条 mask，改成上下各盖一条覆盖带（覆盖带自己吃 backdrop-filter + mask，
       气泡的磨砂不动，代价是那两条带里的视频会被糊一小块）。 */
    .scroller-fade {
      height: 100%;
      mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0,
        #000 12%,
        #000 88%,
        rgba(0, 0, 0, 0) 100%
      );
      -webkit-mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0,
        #000 12%,
        #000 88%,
        rgba(0, 0, 0, 0) 100%
      );
    }

    .scroller {
      height: 100%;
      position: relative;

      /* 隐藏滚动条 */
      & ::-webkit-scrollbar {
        display: none;
        width: 0 !important;
        height: 0 !important;
        -webkit-appearance: none;
        background: transparent;
      }
      
      /* 兼容 Firefox */
      scrollbar-width: none; 
      
      /* 兼容 IE 10+ */
      -ms-overflow-style: none;

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100rpx;
        width: 100%;
        position: absolute;
        left: 0;
        background-color: #fff;
        z-index: 9;
        transform: translateY(-100rpx);
        transition: all 0.3s;

        &.is-active {
          transform: translateY(0);
        }
      }
    }
  }

  .append {
    transition: height 0.3s;
    position: relative;

    & > view {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }
}

::-webkit-scrollbar {
  display: none !important;
}

.message-control-btn {
  width: 100px;
  margin-top: 20px;
  margin: 20x auto;
}

.page-chat .u-empty {
  margin-top: 80px !important;
}

.gift-transition {
  padding: 14px 15px;
  background-image: linear-gradient(to left, #ffecd2 0%, #fcb69f 100%);
  border-radius: 4px;
}

.gift-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  text-align: left;

  font-size: 12px;

  color: #fff;

  .gift-content {
    display: inline;
    white-space: normal;
    word-break: break-word;
    line-height: 1.4;
    overflow-wrap: break-word;
  }

  .gift-icon {
    width: 15px;
    height: 15px;
    margin-right: 6px;
    vertical-align: middle;
    display: inline-block;
  }

  text {
    color: #d87558;
    margin-left: 4px;
    white-space: normal;
    display: inline;
    
    &.gift-nickname {
      margin-left: 0;
    }
  }
}

.link-error-box{
  // 配色对齐直播间聊天气泡体系：深色磨砂底 + 白字 + 12px 圆角
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  padding: 6px 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  top: 0px;left: 10px;
  width: calc(100% - 10px);
  z-index: 1;
  box-sizing: border-box;
  border-radius: 12px;
}

.link-error-box .link-error-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

/* 重新连接：主操作色与直播间一致（关注/主按钮 #FF2C55），文案换成刷新图标。
   26 见方的方块只框墨迹不框字号（icon-refresh 14px 字号的实际墨迹约 11px），
   相邻档 24 / 28 —— 卡片内主文字是 12px，图标不宜再大过一档 */
.link-error-box .re-link-btn{
  background-color: #FF2C55;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex: none;
  text-shadow: none;
}

/* 关闭：白字无底，与左侧那枚实心主按钮拉开主次；重连进行中（按钮收起）时它是唯一出口 */
.link-error-box .link-error-close {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.link-error-box .link-error-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.4;
  min-width: 0;
  margin-right: 8px;
}

.link-error-box .link-error-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.link-error-box .link-error-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
  text-shadow: none;
}

</style>
