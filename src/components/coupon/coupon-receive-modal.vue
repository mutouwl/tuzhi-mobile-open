<template>
  <div>
    <u-popup :show="show" @close="close" @open="open" :closeable="true" :round="10">
      <div class="popup-title">领取优惠券</div>
      <div class="service-box">
        <tz-box padding="10px 15px 15px" bgColor="none">
          <div v-for="(item, index) in 10" style="margin-top: 10px; width: 100%">
            <coupon-my />
          </div>
        </tz-box>
      </div>
    </u-popup>
  </div>
</template>

<script>
var that;
import couponMy from "@/components/coupon/coupon-my.vue";
export default {
  components: {
    couponMy,
  },
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        search: "",
        order: "",
        sort: "",
      },
      list: [],
      show: false,
    };
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },
    goodsId: {
      type: [Number, String],
      default: false,
    },
    goodsType: {
      type: String,
      default: "coupon",
    },
  },
  watch: {
    visible() {
      this.show = this.visible;
      if (this.visible) {
        this.refresh();
      }
    },
  },
  methods: {
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", false);
    },

    getData() {
      uni.showLoading({
        title: "请稍后",
      });

      //资产类型
      that.form.goods_type = this.goodsType;
      that.form.goods_id = this.goodsId;
      that.$api("app.coupon.goods", that.form).then((res) => {
        if (res.code === 1) {
          var list = that.list;

          if (that.form.page == 1) {
            list = [];
          }
          for (var i in res.data) {
            list.push(res.data[i]);
          }
          that.list = list;
        }

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
      that.form.page = 1;
      that.list = [];
      uni.showLoading({
        title: "请稍后",
      });
      that.getData();
    },
  },
  created() {},
  mounted() {
    that = this;
    this.show = this.visible;
    if (this.visible) {
        this.refresh();
      }
  },
};
</script>

<style scoped>
.nav-bar {
  padding: 10px;
  width: 100%;
  background-color: #fff;
  box-sizing: border-box;
}

.service-box {
  max-height: 500px;
  overflow-x: auto;
  padding-bottom: 60px;
}
</style>
