/**
 * 阿里云互动消息（AliVCInteraction）Web 客户端封装
 *
 * 作用：
 *  - 屏蔽阿里云 SDK 的动态加载细节
 *  - 对外提供与奥点云 ROP 客户端风格相近的精简接口
 *  - 便于 message-box 组件按 message_provider 切换
 *
 * 平台支持：
 *  - 仅 H5 平台使用本封装（通过 CDN 动态加载 alivc-im.iife.js）
 *  - 抖音小程序、微信小程序暂不支持阿里云消息服务
 *
 * 调用顺序：init -> login -> joinGroup -> onMessage/onMessageDelete/onTokenExpired -> leaveGroup -> logout -> unInit
 */

// 阿里云互动消息 SDK CDN 地址
var ALIVC_IM_SDK_CDN_URL = 'https://g.alicdn.com/apsara-media-box/imp-interaction/1.9.0/alivc-im.iife.js';

// SDK 加载超时时间（毫秒）
var SDK_LOAD_TIMEOUT = 15000;

/**
 * 动态加载阿里云 SDK
 * @returns {Promise<void>}
 */
function loadSdk() {
  return new Promise(function (resolve, reject) {
    // #ifdef H5
    if (typeof window === 'undefined') {
      reject(new Error('当前环境不支持阿里云互动消息 SDK'));
      return;
    }
    if (window.AliVCInteraction) {
      resolve();
      return;
    }
    // 避免重复注入
    var existing = document.querySelector('script[data-alivc-im="1"]');
    if (existing) {
      waitSdkLoad(existing, resolve, reject);
      return;
    }
    var script = document.createElement('script');
    script.src = ALIVC_IM_SDK_CDN_URL;
    script.async = true;
    script.setAttribute('data-alivc-im', '1');
    script.onload = function () {
      if (window.AliVCInteraction) {
        resolve();
      } else {
        reject(new Error('阿里云 SDK 加载完成但未挂载到 window.AliVCInteraction'));
      }
    };
    script.onerror = function () {
      reject(new Error('阿里云 SDK 加载失败，请检查网络连接'));
    };
    document.getElementsByTagName('head')[0].appendChild(script);
    waitSdkLoad(script, resolve, reject);
    // #endif

    // #ifndef H5
    reject(new Error('当前平台不支持阿里云互动消息 SDK'));
    // #endif
  });
}

/**
 * 等待 SDK 全局对象就绪（兼容 onload 未触发的旧浏览器）
 */
function waitSdkLoad(script, resolve, reject) {
  var waited = 0;
  var timer = setInterval(function () {
    // #ifdef H5
    if (window.AliVCInteraction) {
      clearInterval(timer);
      resolve();
      return;
    }
    // #endif
    waited += 200;
    if (waited >= SDK_LOAD_TIMEOUT) {
      clearInterval(timer);
      reject(new Error('阿里云 SDK 加载超时'));
    }
  }, 200);
}

/**
 * 阿里云 IM 客户端封装（单例）
 */
function AlivcImClient() {
  var engine = null;
  var groupManager = null;
  var messageManager = null;
  var inited = false;
  var logined = false;
  var joinedGroups = {};
  // 内部回调列表（外部通过 onMessage 等方法注册）
  var callbacks = {
    message: [],
    messageDelete: [],
    tokenExpired: [],
    connect: [],
    disconnect: []
  };

  /**
   * 初始化：加载 SDK + 创建引擎 + 初始化
   * @param {String} appId  阿里云互动消息应用 AppId
   * @param {String} appSign 阿里云互动消息应用 AppSign
   * @returns {Promise<void>}
   */
  function init(appId, appSign) {
    if (inited) {
      return Promise.resolve();
    }
    return loadSdk().then(function () {
      // #ifdef H5
      var AliVCInteraction = window.AliVCInteraction;
      var ImEngine = AliVCInteraction.ImEngine;
      var ImLogLevel = AliVCInteraction.ImLogLevel || { ERROR: 3 };
      engine = ImEngine.createEngine();
      return engine.init({
        appId: appId,
        appSign: appSign,
        logLevel: ImLogLevel.ERROR
      }).then(function () {
        inited = true;
        bindEngineEvents();
      });
      // #endif
    });
  }

  /**
   * 绑定引擎级事件（连接、token 过期等）
   */
  function bindEngineEvents() {
    if (!engine) return;
    // token 过期：SDK 提供的 cb 用于回传新的鉴权信息
    // 外部回调可返回 Promise<{timestamp, nonce, role, token}>，由内部 await 后调用 cb
    engine.on('tokenexpired', function (cb) {
      // 串行触发外部回调，取第一个返回的有效鉴权信息
      var promise = Promise.resolve(null);
      for (var i = 0; i < callbacks.tokenExpired.length; i++) {
        (function (cbFn) {
          promise = promise.then(function (prev) {
            if (prev) return prev;
            try {
              var result = cbFn(cb);
              // 兼容同步返回对象或返回 Promise
              return Promise.resolve(result);
            } catch (e) {
              console.error('[alivc-im] tokenExpired callback error', e);
              return null;
            }
          });
        })(callbacks.tokenExpired[i]);
      }
      promise.then(function (authData) {
        if (cb && typeof cb === 'function' && authData) {
          cb(null, {
            timestamp: authData.timestamp,
            nonce: authData.nonce,
            role: authData.role,
            token: authData.token
          });
        }
      }).catch(function (e) {
        console.error('[alivc-im] tokenExpired refresh fail', e);
      });
    });

    engine.on('disconnect', function (code) {
      for (var i = 0; i < callbacks.disconnect.length; i++) {
        try {
          callbacks.disconnect[i](code);
        } catch (e) {
          console.error('[alivc-im] disconnect callback error', e);
        }
      }
    });

    engine.on('connectsuccess', function () {
      for (var i = 0; i < callbacks.connect.length; i++) {
        try {
          callbacks.connect[i]('success');
        } catch (e) {
          console.error('[alivc-im] connect callback error', e);
        }
      }
    });
  }

  /**
   * 登录
   * @param {Object} authData 后端 getAliyunAuth 接口返回的数据
   *   {
   *     app_id, app_sign,
   *     auth: { nonce, timestamp, role, user_id },
   *     app_token
   *   }
   * @returns {Promise<void>}
   */
  function login(authData) {
    if (!inited) {
      return Promise.reject(new Error('请先调用 init 完成初始化'));
    }
    if (logined) {
      return Promise.resolve();
    }
    var auth = authData.auth || {};
    return engine.login({
      user: {
        userId: auth.user_id,
        userExtension: '{}'
      },
      userAuth: {
        timestamp: auth.timestamp,
        nonce: auth.nonce,
        role: auth.role || '',
        token: authData.app_token
      }
    }).then(function () {
      logined = true;
      groupManager = engine.getGroupManager();
      messageManager = engine.getMessageManager();
      bindMessageEvents();
    });
  }

  /**
   * 绑定消息管理器事件
   */
  function bindMessageEvents() {
    if (!messageManager) return;

    messageManager.on('recvgroupmessage', function (msg, groupId) {
      // msg.data 是业务约定的 JSON 字符串，由后端推送时组装
      // 解析失败时不直接抛错，将原始消息透传给业务侧
      var parsed = null;
      if (msg && typeof msg.data === 'string') {
        try {
          parsed = JSON.parse(msg.data);
        } catch (e) {
          parsed = null;
        }
      }
      var payload = {
        groupId: groupId,
        type: msg && msg.type,
        data: msg && msg.data,
        parsed: parsed,
        messageId: msg && msg.messageId,
        sender: msg && msg.sender,
        raw: msg
      };
      for (var i = 0; i < callbacks.message.length; i++) {
        try {
          callbacks.message[i](payload);
        } catch (e) {
          console.error('[alivc-im] message callback error', e);
        }
      }
    });

    messageManager.on('deletegroupmessage', function (msgId, groupId) {
      var payload = {
        groupId: groupId,
        messageId: msgId
      };
      for (var i = 0; i < callbacks.messageDelete.length; i++) {
        try {
          callbacks.messageDelete[i](payload);
        } catch (e) {
          console.error('[alivc-im] messageDelete callback error', e);
        }
      }
    });
  }

  /**
   * 加入群组
   * @param {String} groupId 群组 ID（即直播间 message_topic）
   * @returns {Promise<void>}
   */
  function joinGroup(groupId) {
    if (!groupManager) {
      return Promise.reject(new Error('未登录，无法加入群组'));
    }
    if (joinedGroups[groupId]) {
      return Promise.resolve();
    }
    return groupManager.joinGroup(groupId).then(function () {
      joinedGroups[groupId] = true;
    });
  }

  /**
   * 离开群组
   * @param {String} groupId
   * @returns {Promise<void>}
   */
  function leaveGroup(groupId) {
    if (!groupManager) {
      return Promise.resolve();
    }
    return groupManager.leaveGroup(groupId).catch(function (e) {
      console.warn('[alivc-im] leaveGroup error', e);
    }).then(function () {
      delete joinedGroups[groupId];
    });
  }

  /**
   * 监听群消息
   * @param {Function} callback 接收 { groupId, type, data, parsed, messageId, sender, raw }
   */
  function onMessage(callback) {
    if (typeof callback === 'function') {
      callbacks.message.push(callback);
    }
  }

  /**
   * 监听消息撤回
   * @param {Function} callback 接收 { groupId, messageId }
   */
  function onMessageDelete(callback) {
    if (typeof callback === 'function') {
      callbacks.messageDelete.push(callback);
    }
  }

  /**
   * 监听 token 过期
   * 外部回调可返回 { timestamp, nonce, role, token } 用于自动续签
   * @param {Function} callback
   */
  function onTokenExpired(callback) {
    if (typeof callback === 'function') {
      callbacks.tokenExpired.push(callback);
    }
  }

  /**
   * 监听连接状态变化
   * @param {Function} callback 接收状态字符串 'success' / 'disconnect'
   */
  function onConnect(callback) {
    if (typeof callback === 'function') {
      callbacks.connect.push(callback);
    }
  }

  /**
   * 监听断连
   * @param {Function} callback 接收 code
   */
  function onDisconnect(callback) {
    if (typeof callback === 'function') {
      callbacks.disconnect.push(callback);
    }
  }

  /**
   * 主动刷新登录态（用于 token 过期后外部重新调用）
   * @param {Object} authData 同 login 的 authData
   * @returns {Promise<void>}
   */
  function refreshLogin(authData) {
    if (!engine) {
      return Promise.reject(new Error('引擎未初始化'));
    }
    var auth = authData.auth || {};
    // 阿里云 SDK 未提供直接的 refreshLogin 方法，需先 logout 再 login
    return engine.logout().then(function () {
      logined = false;
      return login(authData);
    });
  }

  /**
   * 登出
   * @returns {Promise<void>}
   */
  function logout() {
    if (!engine) {
      return Promise.resolve();
    }
    return engine.logout().catch(function (e) {
      console.warn('[alivc-im] logout error', e);
    }).then(function () {
      logined = false;
      joinedGroups = {};
    });
  }

  /**
   * 反初始化，释放底层资源
   */
  function unInit() {
    if (engine && typeof engine.unInit === 'function') {
      try {
        engine.unInit();
      } catch (e) {
        console.warn('[alivc-im] unInit error', e);
      }
    }
    engine = null;
    groupManager = null;
    messageManager = null;
    inited = false;
    logined = false;
    joinedGroups = {};
    callbacks = {
      message: [],
      messageDelete: [],
      tokenExpired: [],
      connect: [],
      disconnect: []
    };
  }

  return {
    init: init,
    login: login,
    refreshLogin: refreshLogin,
    joinGroup: joinGroup,
    leaveGroup: leaveGroup,
    onMessage: onMessage,
    onMessageDelete: onMessageDelete,
    onTokenExpired: onTokenExpired,
    onConnect: onConnect,
    onDisconnect: onDisconnect,
    logout: logout,
    unInit: unInit,
    /**
     * 是否已初始化
     */
    isInited: function () {
      return inited;
    },
    /**
     * 是否已登录
     */
    isLogined: function () {
      return logined;
    }
  };
}

// 单例：全局只维护一个阿里云 IM 客户端实例
var alivcImClientInstance = null;

/**
 * 获取阿里云 IM 客户端单例
 */
function getClient() {
  if (!alivcImClientInstance) {
    alivcImClientInstance = new AlivcImClient();
  }
  return alivcImClientInstance;
}

export default {
  /**
   * 获取单例（推荐使用）
   */
  getInstance: getClient,
  /**
   * 工厂方法，创建独立实例（一般不需要）
   */
  create: function () {
    return new AlivcImClient();
  }
};
