<template>
  <div>
    <u-popup :show="show" @close="close" @open="open" title="优惠券" :closeable="true" :round="10">
      
      <u-sticky bgColor="none" :disabled="true">
        <div class="nav-bar">
          <u-subsection
            :list="tabs"
            :current="current"
            @change="tabChange"
          ></u-subsection>
        </div>
      </u-sticky>
      <div class="service-box">
        <tz-box padding="10px 15px 15px" bgColor="none">
          <template v-if="(current == 0 ? uselist.can : uselist.cannot).length > 0">
            <div
              v-for="(item, index) in current == 0 ? uselist.can : uselist.cannot"
              style="margin-top: 10px; width: 100%"
            >
              <coupon-my
                :cant-use-msg="item.cannot_use_msg"
                :data="item.coupon"
                :uc-id="item.id"
                :disabled="current != 0"
                :picker="true && current == 0"
                :checked-id="couponCheckedId"
                @change="couponChange"
              />
            </div>
          </template>
          <u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="暂无优惠券"/>
        </tz-box>
      </div>
      <tz-box bgColor="none">
        <div class="btn-box">
          <div class="not-use-btn">
            <tz-button text="不使用优惠券" long @click="notUse"></tz-button>
          </div>
          <div class="sure-use-btn">
            <tz-button :disabled="!couponCheckedId" text="确定" long @click="changeCoupon" type="primary"></tz-button>
          </div>
        </div>
      </tz-box>
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
      couponCheckedId: "",
      uselist: {
        cannot: [],
        can: [],
      },
      show: false,
      current: 0,
      tabs: [
        {
          name: "可用优惠券",
          type: "",
        },
        {
          name: "不可用优惠券",
          type: "unpaid",
        },
      ],
    };
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },
    type: {
      type: String,
      default: "",
    },
    goods: {
      type: [Array, Object],
      default: () => {
        return [];
      },
    },
    checkedId: {
      type: [String, Number],
      default: "",
    }
  },
  watch: {
    visible() {
      this.show = this.visible;
      if (this.visible) {
        this.refresh();
      }
    },
    checkedId(newVal) {
      this.couponCheckedId = newVal;
    }
  },
  methods: {
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", false);
    },

    couponChange(id) {
      this.couponCheckedId = id;
    },

    changeCoupon() {
      if(!this.couponCheckedId){
        return false;
      }
      this.$emit("change", this.couponCheckedId);
    },
    tabChange(index) {
      this.current = index;
      this.getData();
    },

    notUse() {
      this.couponCheckedId = 0;
      this.$emit("change", this.couponCheckedId);
    },

    getData() {
      uni.showLoading({
        title: "请稍后",
      });

      //资产类型
      that
        .$api("app.coupon.use", {
          goodsList: this.goods,
          goodsType: this.type ? this.type : "goods",
        })
        .then((res) => {
          if (res.code === 1) {
            this.uselist.cannot = res.data.cannot_use;
            this.uselist.can = res.data.can_use;
          }

          uni.hideLoading();
        });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
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
  box-sizing: border-box;
}

.service-box {
  max-height: 340px;
  overflow-x: auto;
  padding-bottom: 60px;
}

.btn-box {
  /* position: fixed; */
  bottom: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  justify-content: space-between;
}

.not-use-btn {
  width: 42%;
}

.sure-use-btn {
  width: 56%;
}
</style>
