<template>
  <detail-popup :show="show" :url="url" @close="close" @navigate="handleNavigate" />
</template>

<script>
import detailPopup from "./detail-popup.vue";

/**
 * 讨论区「带货商品」气泡卡点开的商品详情层（2026-11-14 用户点名）
 *
 * 不新造弹窗：壳直接复用工具条那两只（goods-modal / goods-popover）已在用的 detail-popup，
 * 只有一处差别 —— 那两只的入口是本场商品行（带 live_id），这张卡的入口是消息体里的
 * {goods_id, goods_type}，所以这里自己算地址。
 *
 * 端路口径与它们逐字同一条（M18⑧，别在本文件另抄一份）：
 *  · H5     → 详情弹窗（iframe 商详）
 *  · 非 H5  → 直接跳商详（uni-app 里嵌 iframe 平台不支持）
 * 九大类 → 页面的映射仍走全站唯一那一份 `$nav.getPagePath()`（router.js），不自己拼路径。
 */
export default {
  components: { detailPopup },
  data() {
    return {
      show: false,
      url: "",
    };
  },
  methods: {
    /**
     * @param {Object} payload 卡片消息体的 JSON：{goods_id, goods_type, title, subtitle, cover}
     */
    open(payload) {
      const id = parseInt((payload || {}).goods_id, 10) || 0;
      const type = String((payload || {}).goods_type || "").trim();
      if (!id || !type) {
        // 历史消息被截断时拿不到 id/type：把原因说出口，不留一次静默的点击（M13）
        uni.showToast({ title: "这条商品卡缺少商品信息，请让主播重新发送", icon: "none" });
        return;
      }

      // #ifdef H5
      const path = this.$nav.getPagePath(id, type);
      if (!path) {
        // getPagePath 对认不出的大类返回空串：宁可说一句，也不开一张空白 iframe
        uni.showToast({ title: "这件商品暂时打不开，请到商城页查看", icon: "none" });
        return;
      }
      this.url = "/#".concat(path);
      this.show = true;
      // #endif

      // #ifndef H5
      this.$nav.to(id, type);
      // #endif
    },

    close() {
      this.show = false;
      this.url = "";
    },

    /** iframe 里跳到了白名单之外：关掉这一层，交给外层按 URL 处理（同工具条那两只） */
    handleNavigate(url) {
      this.close();
      if (typeof url === "string" && /^https?:\/\//i.test(url)) {
        window.location.href = url;
      }
    },
  },
};
</script>
