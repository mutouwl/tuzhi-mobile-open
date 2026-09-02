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

      <div class="link-error-box" v-if="['fail', 'losed', 'offline'].includes(linkStatus)">
      <!--  v-if="linkStatus == 'success'" -->
      <span class="link-error-info">
        <span>{{ tipText }}</span>
        <span class="link-error-sub">直播状态仍按期自动刷新</span>
      </span>
      <span class="re-link-btn" @click="reLink()">重新连接</span>
      </div>

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
          <message-list-box :meessageList="messageList" @openRedpacket="onOpenRedpacket"/>
        </view>
      </scroll-view>
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
      tipText: "连接通信服务器失败，请刷新重试",
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
      this.$emit("link-status", val);
    },
  },
  methods: {
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
      that.tipText = "正在重新连接，如多次重连失败建议刷新页面再试";
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
        success: ["success", "连接通信服务器成功"],
        fail: ["fail", "与服务器连接失败，请重试"],
        losed: ["losed", "与通信服务器断开连接"],
        offline: ["offline", "当前通信服务已离线"],
        connectold: ["connectold", "账户在别处登录"],
        reconnect: ["reconnect", "正在重新连接通信服务器"],
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
            that.tipText = "连接消息服务成功";
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
            that.tipText = "消息服务连接失败，请重试";
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

        that.scrollBottom();
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
  background-color:rgb(255, 241, 233);
  // color: rgb(227, 115, 24);
  padding: 5px 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  top: 0px;left: 10px;
  width: calc(100% - 10px);
  z-index: 1;
  box-sizing: border-box;
  border-radius: 4px;
}

.link-error-box .re-link-btn{
  background-color: rgb(227, 115, 24);
  color: #fff;
  padding: 5px 5px;
  border-radius: 4px;
  font-size: 12px;
  width: 90px;
  text-align: center;
}

.link-error-box .link-error-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.4;
}

.link-error-box .link-error-sub {
  font-size: 11px;
  color: #a0693c;
  margin-top: 2px;
}

</style>
