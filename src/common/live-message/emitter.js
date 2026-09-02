/**
 * 通用事件发射器（live-message 库共享）
 * 语义兼容原 rop_client 的 On/Off/Emit：on 追加回调，off 不带 fn 时清空该事件
 */
class EventEmitter {
  constructor() {
    this.map = {};
  }

  /**
   * 注册事件回调
   * @param {String} evt 事件名
   * @param {Function} fn 回调
   * @return {void}
   */
  on(evt, fn) {
    if (typeof fn !== "function" || typeof evt !== "string") {
      throw new Error("error arguments");
    }
    if (!this.map[evt]) {
      this.map[evt] = [];
    }
    this.map[evt].push(fn);
  }

  /**
   * 移除事件回调（不传 fn 时清空该事件全部回调）
   * @param {String} evt 事件名
   * @param {Function} fn 可选指定回调
   * @return {void}
   */
  off(evt, fn) {
    if (typeof evt !== "string") return;
    const arr = this.map[evt];
    if (!arr) return;
    if (typeof fn === "function") {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === fn) {
          arr.splice(i, 1);
        }
      }
      if (arr.length === 0) {
        delete this.map[evt];
      }
    } else {
      delete this.map[evt];
    }
  }

  /**
   * 触发事件（单回调异常不影响其他回调）
   * @param {String} evt 事件名
   * @param {...*} args 透传参数
   * @return {void}
   */
  emit(evt) {
    const arr = this.map[evt];
    if (!arr) return;
    const args = Array.prototype.slice.call(arguments, 1);
    for (let i = 0; i < arr.length; i++) {
      try {
        if (arr[i]) {
          arr[i].apply(null, args);
        }
      } catch (e) {
        // 忽略单回调异常
      }
    }
  }
}

export default EventEmitter;