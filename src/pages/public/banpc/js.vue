<script>
var that;
export default {
  data() {
    return {
      name: "",
      posterSrc: "",
      posterLoading: false,
      posterRequestId: 0,
    };
  },
  methods: {
    getPoster() {
      var requestId = ++that.posterRequestId;
      that.posterSrc = "";
      that.posterLoading = true;
      that
        .$api("share.getPoster", {
          type: "goods",
          src: that.pageParams.id,
          themes: "blue",
        })
        .then((res) => {
          if (requestId !== that.posterRequestId) return;
          that.posterLoading = false;
          if (res.code === 1) {
            that.posterSrc = res.data;
          }
        })
        .catch(() => {
          if (requestId === that.posterRequestId) {
            that.posterLoading = false;
          }
        });
    },
    preview() {
      var imgPath = [this.posterSrc];
      uni.previewImage({
        urls: imgPath,
        longPressActions: {
          itemList: ["发送给朋友", "保存图片", "收藏"],
          success: function (data) {},
          fail: function (err) {
            console.log(err.errMsg);
          },
        },
      });
    },
  },
  onLoad(pageParams) {
    that = this;
    that.name = that.$tools.systemConfig("name");
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.getPoster();
  },
};
</script>
