<script>
var that;
import Wechat from "@/common/wechat/wechat";
// #ifdef MP-TOUTIAO
import i18n from "@/components/language/index.js";
// #endif
export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  data() {
    return {
      accountCheck: "main",
      userInfo: {},
      mergeAccountInfo: {},
      pageParams: {},
    };
  },
  watch: {},

  methods: {
    radioChange(value) {
      this.accountCheck = value;
    },

    submit() {
      uni.showModal({
        title: "提示",
        content: "确定要合并吗,合并后数据不可恢复",
        success: function (res) {
          if (res.confirm) {
            that
              .$api("user.merge.submit", {
                key: that.pageParams.key,
                mobile: that.pageParams.mobile,
                type: that.accountCheck,
              })
              .then((res) => {
                if (res.code == 1) {
                  uni.showModal({
                    title: "提示",
                    content: res.msg,
                    showCancel: false,
                    complete: function (res) {
                      that.$nav.back();
                    },
                  });
                } else {
                  uni.$u.toast(res.msg);
                }
              });
          }
        },
      });
    },

    getMergeInfo() {
      that.$api("user.info.index", {}).then((res) => {
        if (res.code === 1) {
          that.userInfo = res.data;
        }
      });

      that
        .$api("user.merge.bindUserInfo", {
          key: that.pageParams.key,
          mobile: that.pageParams.mobile,
        })
        .then((res) => {
          if (res.code === 1) {
            that.mergeAccountInfo = res.data;
            // uni.showToast({
            //   title: res.msg,
            //   icon: 'success',
            //   duration: 1000,
            //   mask: true
            // });
          } else {
            uni.showModal({
              title: "提示",
              content: res.msg,
              showCancel: false,
              complete: function (res) {
                that.$nav.back();
              },
            });
            // uni.confime
          }
        });
    },
  },
  onShow() {},
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    this.getMergeInfo();
  },
};
</script>
