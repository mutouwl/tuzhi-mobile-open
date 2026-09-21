<template>
  <div>
    <view class="bar-box" v-if="list.length > 0">
      <view class="coupon-tag">
        {{ list[0].amount_text }}
      </view>
      <view @click.stop="modal.receive = true" class="more">
        领券<tz-icon name="enter" :size="16" color="#ff781f" />
      </view>
    </view>

    <u-popup
      :show="modal.receive"
      @close="modal.receive = false"
      :closeable="true"
      :round="10"
      title="领取优惠券"
    >
      <div class="service-box">
        <tz-box padding="10px 15px 15px" bgColor="none">
          <template v-if="list">
            <div v-for="(item, index) in list" style="margin-top: 10px; width: 100%">
              <coupon-my :data="item" @refresh="getData()" />
            </div>
          </template>


          <u-empty v-else mode="coupon" />
        </tz-box>
      </div>
    </u-popup>
  </div>
</template>

<script>
import couponMy from "@/components/coupon/coupon-my.vue";
export default {
  components: { couponMy },
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        search: "",
        order: "",
        sort: "",
      },
      modal: {
        receive: false,
      },
      list: [],
      show: false,
    };
  },
  computed: {},

  props: {
    goodsId: {
      type: [Number, String],
      default: "",
    },
    goodsType: {
      type: String,
      default: "coupon",
    },
  },
  methods: {
    getData() {
      var that = this;
      //资产类型
      that.form.goods_type = this.goodsType;
      that.form.goods_id = this.goodsId;
      that
        .$api("app.coupon.goods", that.form)
        .then((res) => {
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
        })
        .catch((res) => {});
    },
    //刷新
    refresh() {
      this.form.page = 1;
      this.list = [];
      this.getData();
    },
  },
  watch: {
    goodsId() {
      if (this.goodsId && this.goodsType) {
        this.refresh();
      }
    },
  },
};
</script>

<style scoped>
.bar-box {
  font-size: 12px;
  color: #ff781f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.coupon-tag {
  background: url(/static/image/coupon-tag-bg.png);
  margin-right: 8px;
  height: 22px;
  background-size: 100% 100%;
  line-height: 22px;
  display: inline-block;
  padding: 0 10px;
}

.more {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.nav-bar {
  padding: 10px;
  width: 100%;
  background-color: #fff;
  box-sizing: border-box;
}

.service-box {
  max-height: 500px;
  overflow-x: auto;
  padding-bottom: 20px;
}
</style>
