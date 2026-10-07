<script>
import { previewSavablePoster } from '@/common/utils/poster-save';

var that;
export default {
  data() {
    return {
      name: "",
      pageParams: {},
      // 组件出好的那一张海报图地址（@rendered 回来）：点这一张要拿它放大，没到手之前点了要说原因
      rendered: "",
      // 海报上画的内容：这一页没有课程详情数据，只给「谁在分享 + 一句指引」与封面，
      // 封面走 share.getArticle 那一张（后端按 type/src 取商品封面，与分享弹窗同一份来源）
      poster: {
        nickname: "用户",
        avatar: "",
        inviteText: "扫码到手机上继续学习",
        cover: "",
      },
    };
  },
  methods: {
    onRendered(src) {
      that.rendered = src;
    },
    /**
     * 取这一条课程的分享封面（只要图，不要文案）：接口免鉴权，未登录也能拿到
     * 失败不卡住——海报没有封面照样成立（那一块不出），这一页要的是那张码
     */
    getCover() {
      that
        .$api("share.getArticle", { type: "goods", src: that.pageParams.id })
        .then((res) => {
          if (!res || res.code !== 1 || !res.data) return;
          const rows = res.data.poster || [];
          if (rows.length) that.poster.cover = rows[0];
        })
        .catch(() => {});
    },
    /** 点这一张放大：放大的是画布那张原地址，**不发上传**（2026-09-27 用户口径，见 poster-save 文件头） */
    preview() {
      if (!that.rendered) {
        uni.showToast({ title: "海报还在生成，请稍候再试", icon: "none" });
        return;
      }
      previewSavablePoster(that.rendered, {
        inWechat: !!(that.$wxsdk && that.$wxsdk.isWechat && that.$wxsdk.isWechat()),
        extra: {
          longPressActions: {
            itemList: ["发送给朋友", "保存图片", "收藏"],
            success: function () {},
            fail: function () {},
          },
        },
      });
    },
  },
  onLoad(pageParams) {
    that = this;
    that.name = that.$tools.systemConfig("name");
    that.pageParams = that.$nav.parsePageParams(pageParams);
    const user = (that.$tools && that.$tools.cachedUser()) || {};
    that.poster.nickname = user.nickname || "用户";
    that.poster.avatar = user.avatar || "";
    that.getCover();
  },
};
</script>
