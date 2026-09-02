/**
 * 通用直播消息服务库（web / pc / h5 / 小程序通用）
 *
 * 统一封装直播即时消息的「连接 / 订阅 / 收发 / 状态感知」，服务商策略可切换：
 * - aodianyun：奥点云 WebSocket（Paho 注入）或小程序 dms 引擎（mpEngine 注入）
 * - aliyun：阿里云互动消息（loadSdk + getAuth 注入）
 *
 * 平台无关：不直接依赖 window / uni / document，宿主按端注入对应能力；
 * 三端（tuzi-mobile / tuzi-pc / tuzi-web）通过 tools/sync_live_message.sh 保持同一份源码。
 *
 * 用法：
 *   import liveMessage from '@/common/live-message/index.js';
 *   const msg = liveMessage.create({
 *     provider: 'aodianyun',                       // 或 'aliyun'
 *     pubKey: room.message_pubkey,                 // aodianyun
 *     subKey: room.message_subkey,                 // aodianyun
 *     clientId: token,                             // aodianyun
 *     env: 'h5',                                   // h5/web/pc 内置 WebSocket；'mp' 需 mpEngine
 *     mpEngine: null,                              // MP-TOUTIAO 注入 dms 对象
 *     getPaho: () => window.Paho,                  // h5 注入 Paho
 *     getAuth: () => api('live.message.getAliyunAuth', {course_id}),  // aliyun
 *     loadSdk: () => import('alivc sdk'),          // aliyun
 *   });
 *   msg.on('message', (parsed, groupId, extra) => {});
 *   msg.on('status', ({status, tipText}) => {});   // success/fail/losed/offline/connectold/reconnect
 *   msg.connect({topic: room.message_topic});
 *   msg.disconnect();
 *   msg.subscribe(topic); msg.publish(body, topic); msg.reconnect(topic);
 *
 * status 取值说明：
 *   connecting 连接中 / success 已连接 / fail 连接失败 / losed 已断开 /
 *   offline 通信服务离线 / connectold 账户在别处登录 / reconnect 自动重连中
 */
import EventEmitter from "./emitter.js";
import AodianyunProvider from "./provider/aodianyun.js";
import AliyunProvider from "./provider/aliyun.js";

/**
 * 创建直播消息服务实例（统一客户端）
 * @param {Object} options 配置（provider/pubKey/subKey/clientId/env/mpEngine/getPaho/getAuth/loadSdk）
 * @return {Object} 统一客户端 {connect, disconnect, subscribe, unsubscribe, publish, reconnect, on, off}
 */
function create(options = {}) {
  const emitter = new EventEmitter();
  const opts = options || {};

  let provider;
  if (opts.provider === "aliyun") {
    provider = new AliyunProvider({
      getAuth: opts.getAuth,
      loadSdk: opts.loadSdk,
      sdkInstance: opts.sdkInstance,
      userExtension: opts.userExtension,
      createGroupIfAbsent: opts.createGroupIfAbsent,
    });
  } else {
    provider = new AodianyunProvider({
      env: opts.env || "h5",
      mpEngine: opts.mpEngine || null,
      getPaho: opts.getPaho || null,
      createWebSocket: opts.createWebSocket || null,
    });
  }
  provider.setEmitter(emitter);

  /**
   * 建立连接
   * @param {Object} param0 {topic: 订阅话题, relink: 是否重连}
   * @return {Promise<void>}
   */
  function connect({ topic, relink = false } = {}) {
    if (opts.provider === "aliyun") {
      return provider.connect({ topic, relink });
    }
    // 奥点云：内部先确保 Paho 就绪（getPaho/window.Paho/CDN 注入），MP 分支直接连 dms 引擎
    return provider.connect({
      pubKey: opts.pubKey,
      subKey: opts.subKey,
      clientId: opts.clientId,
      useSSL: opts.useSSL !== false,
      topics: topic ? [topic] : [],
    });
  }

  /**
   * 断开连接并复位（奥点云状态机复位，保证下次 connect 必定生效）
   * @return {void}
   */
  function disconnect() {
    provider.disconnect();
  }

  /**
   * 订阅话题（重复订阅幂等；阿里云需已连接）
   * @param {String} topic 话题ID
   * @param {Number} qos   QoS（奥点云，默认0）
   * @return {Promise<void>|void}
   */
  function subscribe(topic, qos) {
    if (opts.provider === "aliyun") {
      return provider.joinGroup(topic);
    }
    provider.subscribe(topic, qos);
    return Promise.resolve();
  }

  /**
   * 取消订阅
   * @param {String} topic 话题ID
   * @return {void}
   */
  function unsubscribe(topic) {
    if (opts.provider === "aliyun") {
      provider.leaveGroup(topic);
      return;
    }
    provider.unsubscribe(topic);
  }

  /**
   * 发送消息
   * @param {String} body  消息体
   * @param {String} topic 话题ID
   * @return {void}
   */
  function publish(body, topic) {
    provider.publish(body, topic);
  }

  /**
   * 重连（阿里云 logout→login→joinGroup；奥点云复位后重连）
   * @param {String} topic 话题ID
   * @return {Promise<void>|void}
   */
  function reconnect(topic) {
    if (opts.provider === "aliyun") {
      return provider.reconnect(topic);
    }
    disconnect();
    return connect({ topic });
  }

  /**
   * 注册事件（message / status / message_delete）
   * message: (parsedData, groupId, extra)；奥点云为 (rawString, topic)
   * status: ({status, tipText})
   * @param {String} evt 事件名
   * @param {Function} fn 回调
   * @return {void}
   */
  function on(evt, fn) {
    emitter.on(evt, fn);
  }

  /**
   * 移除事件回调
   * @param {String} evt 事件名
   * @param {Function} fn 回调
   * @return {void}
   */
  function off(evt, fn) {
    emitter.off(evt, fn);
  }

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    reconnect,
    on,
    off,
  };
}

export default {
  create,
};