/**
 * 奥点云直播消息服务商
 * 纯平台注入的 WebSocket 客户端（无 window/uni 直接依赖）：
 * - env='h5'：内置 WebSocket 实现（Paho/WebSocket 需宿主注入），web/pc/h5 通用
 * - env='mp'：要求注入兼容引擎（MP-TOUTIAO 的 dms.js，API：Enter/Leave/Subscribe/On/Off/Publish）
 * 已内置断线重连状态机复位修复：退避重试超时后复位到 STATE_INIT，
 * 保证任何时刻调用 connect() 都能真正重新发起连接（页面「重新连接」点击必有效）
 */
import EventEmitter from "../emitter.js";

const State = {
  INIT: 0,
  ENTERING: 4,
  ENTERED: 5,
  ENTER_FAILED: 6,
  REENTERING: 7,
};

const REENTER_MAX = 5000;
const REENTER_DEFAULT = 1000;

/**
 * 平台依赖注入集合
 * 需提供：getPaho()（返回 Paho 构造器或 null）、createWebSocket(url)
 * 小程序端若注入 mpEngine（dms 兼容对象），则走 mp 分支完全替代 WebSocket 实现
 */
class AodianyunProvider {
  /**
   * @param {Object} options 配置
   * @param {String} options.env   'h5'|'web'|'pc'（内置 WebSocket）/ 'mp'（注入 mpEngine）
   * @param {Object} options.mpEngine MP 端 dms 兼容引擎
   * @param {Function} options.getPaho 返回 Paho MQTT 构造器（H5 由宿主注入；PC/Web 用 window.Paho）
   * @param {Function} options.createWebSocket 可选 WebSocket 工厂
   */
  constructor(options = {}) {
    this.env = options.env || "h5";
    this.mpEngine = options.mpEngine || null;
    this.getPaho = options.getPaho || null;
    this.createWebSocket = options.createWebSocket || null;

    this.events = new EventEmitter();
    this.topics = []; // {topic, qos}
    this.pubKey = "";
    this.subKey = "";
    this.clientId = "";
    this.useSSL = false;

    this.state = State.INIT;
    this.mqttClient = null;
    this.timer = null;
    this.reenterTimeout = REENTER_DEFAULT;
    this.enterTimes = 0;
  }

  /**
   * 注入事件发射器（由 live-message 工厂统一提供；未注入时构造内置默认发射器）
   * @param {Object} emitter EventEmitter 实例
   * @return {void}
   */
  setEmitter(emitter) {
    this.events = emitter;
  }

  /**
   * 建立连接（状态机复位后必定重新发起，任意状态下调用均生效）
   * @param {Object} param0 连接参数
   * @param {String} param0.pubKey 发布密钥
   * @param {String} param0.subKey 订阅密钥（缺省取 pubKey）
   * @param {String} param0.clientId 客户端ID
   * @param {Boolean} param0.useSSL 是否走 WSS
   * @param {Array} param0.topics 初始订阅话题列表
   * @return {Promise<void>}
   */
  async connect({ pubKey, subKey, clientId, useSSL = false, topics = [] }) {
    // 无论处于何种状态都先复位，保证重连生效（Enter 仅在 INIT 状态真正发起连接）
    this.reset();
    this.pubKey = pubKey;
    this.subKey = subKey || pubKey;
    if (clientId != null) {
      this.clientId = clientId;
    }
    this.useSSL = !!useSSL;
    topics.forEach((t) => this.subscribe(t));

    if (this.mpEngine) {
      // 小程序端（如抖音）使用注入的 dms 兼容引擎
      this.bindMpEvents();
      if (this.pubKey) {
        this.mpEngine.Enter(this.pubKey, this.subKey, this.clientId);
      }
      this.bindSubscribedTopics();
      return;
    }

    // 浏览器场景确保 Paho 就绪（已注入 getPaho 或 window.Paho 时直接用，否则 CDN 注入 ws.js）
    const Paho = await this.ensurePaho();
    if (!Paho) {
      this.events.emit("status", { status: "fail", tipText: "消息客户端未就绪" });
      return;
    }
    this.internalEnter();
  }

  /**
   * 确保 Paho MQTT 客户端就绪（浏览器：getPaho 注入 > window.Paho > CDN ws.js 动态加载；
   * 就绪判定以「存在可用的 Client 构造器」为准，仅存在 Paho 命名空间不算就绪；
   * 奥点云官方 CDN 失败或超时时再试备用镜像）
   * @return {Promise<Object|null>}
   */
  ensurePaho() {
    if (this.getPahoClientCtor(this.currentPaho())) {
      return Promise.resolve(this.currentPaho());
    }
    if (this.mpEngine || typeof document === "undefined" || typeof window === "undefined") {
      return Promise.resolve(null);
    }
    if (this._pahoPromise) {
      return this._pahoPromise;
    }
    const me = this;
    this._pahoPromise = (async function () {
      // 首选奥点云官方 ws.js（标准 Paho-MQTT 构建，提供 Paho.MQTT.Client）；
      // 其失败/超时/仅命名空间无构造器时，用备用镜像再试一次
      const sources = [
        "https://cdn.aodianyun.com/dms/ws.js?v=2.0.0",
        "https://cdn.jsdelivr.net/npm/paho-mqtt@1.1.0/paho-mqtt-min.js",
      ];
      for (let i = 0; i < sources.length; i++) {
        await me.loadScriptOnce(sources[i]);
        const paho = await me.waitForPahoReady(500); // 每源最多等待 5s
        if (paho) {
          me._pahoPromise = null;
          return paho;
        }
      }
      me._pahoPromise = null;
      return null;
    })();
    return this._pahoPromise;
  }

  /**
   * 注入外层脚本（同一地址只注入一次，避免重复加载）
   * @param {String} src 脚本地址
   * @return {Promise<void>}
   */
  loadScriptOnce(src) {
    if (this._pahoScripts && this._pahoScripts.indexOf(src) !== -1) {
      return Promise.resolve();
    }
    const me = this;
    return new Promise(function (resolve) {
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.async = false;
      s.src = src;
      s.charset = "UTF-8";
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      (document.getElementsByTagName("head")[0] ||
        document.getElementsByTagName("body")[0]).appendChild(s);
      me._pahoScripts = me._pahoScripts || [];
      me._pahoScripts.push(src);
    });
  }

  /**
   * 轮询等待 Paho 就绪（存在可用的 Client 构造器），超时返回 null
   * @param {Number} times 轮询次数（每 10ms 一次）
   * @return {Promise<Object|null>}
   */
  waitForPahoReady(times) {
    const me = this;
    return new Promise(function (resolve) {
      let wait = times;
      const timer = setInterval(function () {
        const paho = me.currentPaho();
        if (me.getPahoClientCtor(paho)) {
          clearInterval(timer);
          resolve(paho);
          return;
        }
        wait--;
        if (wait <= 0) {
          clearInterval(timer);
          resolve(null);
        }
      }, 10);
    });
  }

  /**
   * 断开连接并复位状态机（清理退避定时器，下此 connect 可立即重建）
   * @return {void}
   */
  disconnect() {
    if (this.mpEngine) {
      try {
        this.mpEngine.Leave();
      } catch (e) {}
      this.state = State.INIT;
      return;
    }
    this.reset();
  }

  /**
   * 复位状态机：清理定时器、复位退避步长与计数（等效库内 Leave）
   * @return {void}
   */
  reset() {
    this.state = State.INIT;
    this.enterTimes = 0;
    this.reenterTimeout = REENTER_DEFAULT;
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      if (this.mqttClient && this.mqttClient.disconnect) {
        this.mqttClient.disconnect();
      }
    } catch (e) {}
  }

  /**
   * 订阅话题
   * @param {String} topic 话题ID
   * @param {Number} qos   QoS（默认0）
   * @return {void}
   */
  subscribe(topic) {
    if (!topic) return;
    topic = topic.toString();
    const qos = isNaN(Number(arguments[1] === undefined ? 0 : arguments[1]))
      ? 0
      : Number(arguments[1] === undefined ? 0 : arguments[1]);
    for (let i = 0; i < this.topics.length; i++) {
      if (this.topics[i].topic === topic) {
        return;
      }
    }
    this.topics.push({ topic, qos });
    if (this.state === State.ENTERED) {
      try {
        this.mqttClient.subscribe(topic, { qos });
      } catch (e) {}
    }
    if (this.mpEngine && (this.state === State.ENTERED || this.state === State.ENTERING)) {
      this.bindSubscribedTopics();
    }
  }

  /**
   * 取消订阅
   * @param {String} topic 话题ID
   * @return {void}
   */
  unsubscribe(topic) {
    topic = topic.toString();
    for (let i = 0; i < this.topics.length; i++) {
      if (this.topics[i].topic === topic) {
        this.topics.splice(i, 1);
        if (this.state === State.ENTERED) {
          try {
            this.mqttClient.unsubscribe(topic);
          } catch (e) {}
        }
        return;
      }
    }
  }

  /**
   * 发送消息到话题
   * @param {String} body  消息体
   * @param {String} topic 话题
   * @param {Number} qos   QoS
   * @return {void}
   */
  publish(body, topic, qos = 0) {
    if (this.mpEngine) {
      if (this.mpEngine.Publish) {
        this.mpEngine.Publish(body, topic, qos, false);
      }
      return;
    }
    if (this.state !== State.ENTERED) {
      return;
    }
    try {
      const Paho = this.currentPaho();
      const MessageCtor = this.getPahoMessageCtor(Paho);
      if (!MessageCtor) {
        return;
      }
      const message = new MessageCtor(body);
      message.destinationName = topic;
      message.qos = qos;
      message.retained = false;
      this.mqttClient.send(message);
    } catch (e) {}
  }

  /**
   * 注册事件回调
   * @param {String} evt 事件名 message/status
   * @param {Function} fn 回调
   * @return {void}
   */
  on(evt, fn) {
    this.events.on(evt, fn);
  }

  /**
   * 移除事件回调
   * @param {String} evt 事件名
   * @param {Function} fn 回调
   * @return {void}
   */
  off(evt, fn) {
    this.events.off(evt, fn);
  }

  /**
   * 当前 Paho 构造器（MP 分支无需）
   * @return {Object}
   */
  currentPaho() {
    if (this.getPaho) {
      return this.getPaho();
    }
    if (typeof window !== "undefined" && window.Paho) {
      return window.Paho;
    }
    return null;
  }

  /**
   * 取 Paho 命名空间下可用的 MQTT 客户端构造器
   * 奥点云官方 ws.js 为标准 Eclipse Paho-MQTT 构建（全局 window.Paho = {MQTT: {...}}，
   * 客户端构造器为 Paho.MQTT.Client）；个别历史构建直接挂 Paho.Client。两种布局都兼容，
   * 缺任一即视为「Paho 未就绪」继续等待/降级。
   * @param {Object} Paho Paho 命名空间对象
   * @return {Function|null}
   */
  getPahoClientCtor(Paho) {
    if (!Paho) return null;
    if (typeof Paho.Client === "function") return Paho.Client;
    if (Paho.MQTT && typeof Paho.MQTT.Client === "function") return Paho.MQTT.Client;
    return null;
  }

  /**
   * 取 Paho 命名空间下可用的消息构造器（Paho.MQTT.Message / Paho.Message）
   * @param {Object} Paho
   * @return {Function|null}
   */
  getPahoMessageCtor(Paho) {
    if (!Paho) return null;
    if (typeof Paho.Message === "function") return Paho.Message;
    if (Paho.MQTT && typeof Paho.MQTT.Message === "function") return Paho.MQTT.Message;
    return null;
  }

  /**
   * 生成客户端唯一标识后缀（Paho.MQTT.NewGuid / Paho.NewGuid，缺失时本地随机兜底）
   * @param {Object} Paho
   * @return {String}
   */
  getPahoGuid(Paho) {
    if (Paho) {
      try {
        if (typeof Paho.NewGuid === "function") return Paho.NewGuid();
        if (Paho.MQTT && typeof Paho.MQTT.NewGuid === "function") return Paho.MQTT.NewGuid();
      } catch (e) {}
    }
    return (
      "guid-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  // ---------- 内部实现（WebSocket 分支） ----------

  /**
   * 内部进入连接流程（含初始连接与退避重试）
   * @return {void}
   */
  internalEnter() {
    this.timer = null;
    if (this.state === State.REENTERING) {
      this.events.emit("status", { status: "reconnect", tipText: "正在重新连接通信服务器" });
    }
    const Paho = this.currentPaho();
    const ClientCtor = this.getPahoClientCtor(Paho);
    if (!ClientCtor && this.createWebSocket) {
      this.connectViaWebSocket();
      return;
    }
    if (!ClientCtor) {
      // 宿主未注入 Paho 时无法建立 MQTT 连接
      this.events.emit("status", { status: "fail", tipText: "消息客户端未就绪" });
      return;
    }
    if (!this.clientId) {
      this.clientId = "ws2-" + this.getPahoGuid(Paho);
    }
    const secure = this.useSSL;
    const port = secure ? 443 : 8000;
    if (this.mqttClient) {
      try {
        this.mqttClient.disconnect();
      } catch (e) {}
    }
    const me = this;
    let client = null;
    try {
      // 标准 Paho-MQTT 构建的构造器在 Paho.MQTT.Client，历史定制构建在 Paho.Client，
      // 统一经 getPahoClientCtor 解析（原实现硬编码 Paho.Client，对标准构建必抛
      // 「Paho.Client is not a constructor」导致连麦/消息服务连不上）
      client = new ClientCtor("mqttdms.aodianyun.com", port, this.clientId);
    } catch (e) {
      this.events.emit("status", { status: "fail", tipText: "消息客户端初始化失败，请刷新重试" });
      this.reset();
      return;
    }
    this.mqttClient = client;

    client.onConnectionLost = function (responseObject) {
      if (responseObject && responseObject.errorCode !== 0) {
        me.events.emit("status", { status: "offline", tipText: "当前通信服务已离线" });
        me.reEnter();
      }
    };
    client.onMessageArrived = function (message) {
      if (message.destinationName === "__sys__") {
        try {
          const msg = JSON.parse(message.payloadString);
          if (msg.cmd === "kill") {
            me.events.emit("status", { status: "connectold", tipText: "账户在别处登录" });
            me.events.emit("status", { status: "losed", tipText: "与通信服务器断开连接" });
            me.disconnect();
            return;
          }
        } catch (e) {}
      }
      me.events.emit("message", message.payloadString, message.destinationName);
    };

    try {
      client.connect({
        timeout: 10,
        userName: this.pubKey,
        password: this.subKey,
        keepAliveInterval: 60,
        cleanSession: true,
        useSSL: secure,
        onSuccess: function () {
          me.state = State.ENTERED;
          me.reenterTimeout = REENTER_DEFAULT;
          for (let i = 0; i < me.topics.length; i++) {
            try {
              me.mqttClient.subscribe(me.topics[i].topic, { qos: me.topics[i].qos });
            } catch (e) {}
          }
          me.events.emit("status", { status: "success", tipText: "连接通信服务器成功" });
        },
        onFailure: function (err) {
          if (me.state === State.ENTERING) {
            if (me.enterTimes++ >= 3) {
              me.state = State.ENTER_FAILED;
              me.enterTimes = 0;
              me.events.emit("status", { status: "fail", tipText: "与通信服务器连接失败" });
              me.reset();
            } else {
              setTimeout(function () {
                me.internalEnter();
              }, 1000);
            }
          } else if (me.state === State.REENTERING) {
            me.events.emit("status", { status: "offline", tipText: "当前通信服务已离线" });
            me.reEnter();
          }
        },
      });
    } catch (e) {
      this.reEnter();
    }
  }

  /**
   * 退避重连：超时上限后复位状态机（手动 connect 恢复生效），否则调度 internalEnter
   * @return {void}
   */
  reEnter() {
    if (this.timer != null) return;
    if (this.reenterTimeout > REENTER_MAX) {
      this.events.emit("status", { status: "losed", tipText: "与通信服务器断开连接" });
      // 必须复位状态机，否则 connect() 在非 INIT 状态下被静默丢弃
      this.reset();
      return;
    }
    if (this.state === State.ENTERED || this.state === State.REENTERING) {
      this.state = State.REENTERING;
      const me = this;
      this.timer = setTimeout(function () {
        me.internalEnter();
      }, this.reenterTimeout);
      this.reenterTimeout += REENTER_DEFAULT;
    }
  }

  // ---------- 内部实现（小程序 dms 引擎分支） ----------

  /**
   * 绑定小程序引擎事件（dms 兼容：publish_data/losed/enter_fail/reconnect/offline/connectold/enter_suc）
   * @return {void}
   */
  bindMpEvents() {
    const me = this;
    if (this.mpBound) return;
    this.mpBound = true;
    this.mpEngine.Off && this.mpEngine.Off("publish_data");
    this.mpEngine.Off && this.mpEngine.Off("losed");
    this.mpEngine.Off && this.mpEngine.Off("enter_fail");
    this.mpEngine.Off && this.mpEngine.Off("reconnect");
    this.mpEngine.Off && this.mpEngine.Off("offline");
    this.mpEngine.Off && this.mpEngine.Off("connectold");
    this.mpEngine.Off && this.mpEngine.Off("enter_suc");

    this.mpEngine.On && this.mpEngine.On("publish_data", function (data, topic) {
      me.events.emit("message", data, topic);
    });
    this.mpEngine.On && this.mpEngine.On("losed", function () {
      me.events.emit("status", { status: "losed", tipText: "与通信服务器断开连接" });
      me.state = State.INIT;
    });
    this.mpEngine.On && this.mpEngine.On("enter_fail", function () {
      me.events.emit("status", { status: "fail", tipText: "与通信服务器连接失败" });
    });
    this.mpEngine.On && this.mpEngine.On("reconnect", function () {
      me.events.emit("status", { status: "reconnect", tipText: "正在重新连接通信服务器" });
    });
    this.mpEngine.On && this.mpEngine.On("offline", function () {
      me.events.emit("status", { status: "offline", tipText: "当前通信服务已离线" });
    });
    this.mpEngine.On && this.mpEngine.On("connectold", function () {
      me.events.emit("status", { status: "connectold", tipText: "账户在别处登录" });
    });
    this.mpEngine.On && this.mpEngine.On("enter_suc", function () {
      me.state = State.ENTERED;
      me.events.emit("status", { status: "success", tipText: "连接通信服务器成功" });
      me.bindSubscribedTopics();
    });
  }

  /**
   * MP 分支：将本地已登记话题同步给 dms 引擎订阅
   * @return {void}
   */
  bindSubscribedTopics() {
    if (!this.mpEngine || !this.mpEngine.Subscribe) {
      return;
    }
    this.topics.forEach((t) => {
      this.mpEngine.Subscribe(t.topic, t.qos);
    });
  }
}

export default AodianyunProvider;