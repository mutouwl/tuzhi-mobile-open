/**
 * 阿里云互动消息服务商
 * 平台无关封装（SDK 加载与鉴权均由宿主注入，不做 window/uni 直依赖）：
 * - loadSdk(): Promise —— 返回后 window.AliVCInteraction / 注入的 sdkInstance 可用
 * - getAuth(): Promise<authData> —— authData = {app_id, app_sign, auth:{user_id,timestamp,nonce,role}, app_token}
 * 内置：token 过期自动续期（getAuth 刷新）、断线状态事件、logout→login 复位重连（reconnect）
 */
class AliyunProvider {
  /**
   * @param {Object} options 配置
   * @param {Function} options.getAuth 获取鉴权（Promise）
   * @param {Function} options.loadSdk 加载 SDK（Promise），resolve 后取 window.AliVCInteraction 或 options.sdkInstance
   * @param {Object} options.sdkInstance 可选：SDK 全局对象（loadSdk 之外的方式注入）
   */
  constructor(options = {}) {
    this.getAuth = options.getAuth || function () {
      return Promise.reject(new Error("未注入 getAuth"));
    };
    this.loadSdk = options.loadSdk || function () {
      return Promise.resolve();
    };
    this.sdkInstance = options.sdkInstance || null;
    // 登录时携带的用户扩展信息（函数返回对象 / 直接对象）
    this.userExtension = options.userExtension || null;
    // 幂等建群开关（中控台场景）：joinGroup 前 createGroup 不存在即建 + 300ms 防 SDK 429 并发延迟
    this.createGroupIfAbsent = !!options.createGroupIfAbsent;

    this.events = null; // 由工厂注入统一 EventEmitter
    this.engine = null;
    this.groupManager = null;
    this.messageManager = null;
    this.inited = false;
    this.logined = false;
    this.topics = [];
    this.authData = null;
    this._callbacksBound = false;
  }

  /**
   * 注入事件发射器（由 live-message 工厂统一提供）
   * @param {Object} emitter EventEmitter 实例
   * @return {void}
   */
  setEmitter(emitter) {
    this.events = emitter;
  }

  /**
   * 注册事件回调
   * @param {String} evt 事件名 message/status
   * @param {Function} fn 回调
   * @return {void}
   */
  on(evt, fn) {
    if (this.events) {
      this.events.on(evt, fn);
    }
  }

  /**
   * 移除事件回调
   * @param {String} evt 事件名
   * @param {Function} fn 回调
   * @return {void}
   */
  off(evt, fn) {
    if (this.events) {
      this.events.off(evt, fn);
    }
  }

  /**
   * 输出状态事件
   * @param {String} status  状态类型 connecting/success/fail/losed/offline/connectold/reconnect
   * @param {String} tipText 提示文案
   * @return {void}
   */
  emitStatus(status, tipText) {
    if (this.events) {
      this.events.emit("status", { status, tipText });
    }
  }

  /**
   * 获取 SDK 全局对象（loadSdk 后）
   * @return {Object|null}
   */
  sdk() {
    if (this.sdkInstance) return this.sdkInstance;
    if (typeof window !== "undefined" && window.AliVCInteraction) {
      return window.AliVCInteraction;
    }
    return null;
  }

  /**
   * 建立连接：加载 SDK → 鉴权 → init → login → 入群 → 监听消息
   * @param {Object} param0 连接参数
   * @param {String} param0.topic 直播间群组ID（message_topic）
   * @param {Boolean} param0.relink 是否重连（true 时先 logout 复位登录态再重登，绕开 login 幂等跳过）
   * @return {Promise<void>}
   */
  async connect({ topic, relink = false }) {
    this.emitStatus("connecting", "");
    await this.loadSdk();
    if (!this.sdk()) {
      throw new Error("阿里云消息 SDK 加载失败");
    }

    const authData = await this.getAuth();
    if (!authData || !authData.app_id || !authData.app_token) {
      throw new Error("获取阿里云鉴权信息失败");
    }
    this.authData = authData;

    const Sdk = this.sdk();
    const ImEngine = Sdk.ImEngine;
    const ImLogLevel = Sdk.ImLogLevel || { ERROR: 3 };
    if (!this.engine) {
      const engine = ImEngine.createEngine();
      this.engine = engine;
      await engine.init({
        appId: authData.app_id,
        appSign: authData.app_sign,
        logLevel: ImLogLevel.ERROR,
      });
      this.inited = true;
    }
    const engine = this.engine;
    if (!this._callbacksBound) {
      this.bindEngineEvents(engine);
      this._callbacksBound = true;
    }

    if (relink) {
      // 断线重连：login 存在 logined 幂等跳过，SDK 断线后登录态残留会导致跳过重登、
      // joinGroup 失败——先登出复位登录态再走 登录+入群
      await engine.logout().catch(function () {});
      this.logined = false;
    }

    if (!this.logined) {
      const auth = authData.auth || {};
      // userExtension 支持注入（函数返回对象 / 直接对象），用于登录时携带用户信息
      let userExtension = {};
      if (typeof this.userExtension === "function") {
        userExtension = this.userExtension() || {};
      } else if (this.userExtension && typeof this.userExtension === "object") {
        userExtension = this.userExtension;
      }
      await engine.login({
        user: {
          userId: auth.user_id,
          userExtension: JSON.stringify(userExtension),
        },
        userAuth: {
          timestamp: auth.timestamp,
          nonce: auth.nonce,
          role: auth.role || "",
          token: authData.app_token,
        },
      });
      this.logined = true;
      this.groupManager = engine.getGroupManager();
      this.messageManager = engine.getMessageManager();
      this.bindMessageEvents();
    }

    if (topic) {
      if (this.createGroupIfAbsent) {
        // 幂等建群：群已存在时 createGroup 报错忽略
        try {
          await this.groupManager.createGroup(topic, topic);
        } catch (e) {
          // 群已存在
        }
        // 等待上一操作完全结束后再 joinGroup，避免 SDK 429 并发冲突
        await new Promise(function (r) {
          setTimeout(r, 300);
        });
      }
      await this.joinGroup(topic);
    }
    this.emitStatus("success", "连接消息服务成功");
  }

  /**
   * 加入群组订阅（可多次加入多直播间）
   * @param {String} topic 群组ID
   * @return {Promise<void>}
   */
  async joinGroup(topic) {
    if (!topic) return;
    if (!this.groupManager) {
      throw new Error("群组管理器未就绪");
    }
    if (this.topics.indexOf(topic) >= 0) {
      return;
    }
    await this.groupManager.joinGroup(topic);
    this.topics.push(topic);
  }

  /**
   * 离开群组
   * @param {String} topic 群组ID
   * @return {void}
   */
  leaveGroup(topic) {
    const idx = this.topics.indexOf(topic);
    if (idx >= 0) {
      this.topics.splice(idx, 1);
    }
    try {
      if (this.groupManager && this.groupManager.leaveGroup) {
        this.groupManager.leaveGroup(topic);
      }
    } catch (e) {}
  }

  /**
   * 断开连接：登出 + 复位登录态（保留引擎，便于 reconnect）
   * @return {void}
   */
  disconnect() {
    try {
      if (this.engine && this.engine.logout) {
        this.engine.logout();
      }
    } catch (e) {}
    this.logined = false;
    this.topics = [];
  }

  /**
   * 重连（logout→login→joinGroup，绕开 logined 幂等跳过）
   * @param {String} topic 群组ID
   * @return {Promise<void>}
   */
  reconnect(topic) {
    return this.connect({ topic, relink: true });
  }

  /**
   * 绑定引擎级事件（连接状态、断线、token 过期续期）
   * @param {Object} engine SDK 引擎
   * @return {void}
   */
  bindEngineEvents(engine) {
    const me = this;
    if (engine.on) {
      engine.on("connectsuccess", function () {
        me.emitStatus("success", "连接消息服务成功");
      });
      engine.on("connectfailed", function () {
        me.emitStatus("fail", "与消息服务器连接失败");
      });
      engine.on("disconnect", function (code) {
        me.logined = false;
        if (code === 4) {
          me.emitStatus("connectold", "账户在别处登录");
        } else {
          me.emitStatus("losed", "与消息服务断开连接");
        }
      });
      engine.on("tokenexpired", function (cb) {
        me.refreshTokenAuth(cb);
      });
    }
  }

  /**
   * token 过期：重新获取鉴权并回调 SDK 续签
   * @param {Function} cb SDK 回调 (err, authData)
   * @return {void}
   */
  refreshTokenAuth(cb) {
    const me = this;
    this.getAuth()
      .then(function (authData) {
        if (!authData) {
          cb(new Error("刷新鉴权失败"));
          return;
        }
        me.authData = authData;
        const auth = authData.auth || {};
        cb(null, {
          timestamp: auth.timestamp,
          nonce: auth.nonce,
          role: auth.role || "",
          token: authData.app_token,
        });
      })
      .catch(function (err) {
        cb(err);
      });
  }

  /**
   * 绑定消息事件（收群消息/撤回），统一解析后以 (parsedData, groupId) 上抛
   * @return {void}
   */
  bindMessageEvents() {
    const me = this;
    if (!this.messageManager) return;
    if (this._messageBound) return;
    this._messageBound = true;
    if (this.messageManager.on) {
      this.messageManager.on("recvgroupmessage", function (msg, groupId) {
        me.emitMessage(msg, groupId);
      });
      this.messageManager.on("deletegroupmessage", function (messageId, groupId) {
        me.events && me.events.emit("message_delete", { messageId, groupId });
      });
    }
  }

  /**
   * 解析群消息并按统一结构上抛：message(parsed, groupId, {messageId, raw})
   * @param {Object} msg     SDK 消息对象（msg.data 为 JSON 字符串或对象）
   * @param {String} groupId 群组ID
   * @return {void}
   */
  emitMessage(msg, groupId) {
    if (!msg || !this.events) return;
    let parsed = null;
    try {
      parsed =
        typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data || null;
    } catch (e) {
      parsed = null;
    }
    this.events.emit("message", parsed, groupId, {
      messageId: msg.messageId || msg.msgId || "",
      raw: msg,
    });
  }
}

export default AliyunProvider;