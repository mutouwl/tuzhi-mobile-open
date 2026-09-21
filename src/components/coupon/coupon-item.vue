<template>
  <div
    :class="[
      'coupon-card',
      {
        disabled: disabled,
      },
    ]"
  >
    <div class="coupon-body">
      <div class="coupon-left">
        <span class="coupon-tag">最高</span>
        <div class="coupon-price">
          <span class="price-symbol" v-if="data.type == 'reduce'">￥</span>
          <span class="price-num">{{ data.type == "reduce" ? (data.amount ? data.amount : 0) : (data.discount ? data.discount : 0) }}</span>
          <span class="discount-val" v-if="data.type == 'discount'">折</span>
        </div>
        <div class="coupon-type-name">
          {{ !data.enough_status || data.enough == 0 ? "无门槛券" : "满" + data.enough + "元可用" }}
        </div>
      </div>

      <div class="coupon-divider">
        <div class="dashed-line"></div>
      </div>

      <div class="coupon-right">
        <div class="coupon-right-info">
          <div class="coupon-name">{{ data.name ? data.name : "-" }}</div>
          <div class="coupon-time" v-if="data.use_time_type">
            {{
              data.use_time_type == "days"
                ? "有效期至" + getExpireDate(data)
                : data.use_start_time + "-" + data.use_end_time
            }}
          </div>
        </div>
      </div>

      <div class="coupon-choose-box" v-if="picker" @click="change">
        <div
          :class="[
            'coupon-choose',
            {
              'coupon-choosed': checkedId == ucId,
              'coupon-unchoosed': checkedId != ucId,
            },
          ]"
        ></div>
      </div>

      <div class="coupon-action" v-else>
        <div
          class="action-btn"
          @click="receive(data.id)"
          v-if="data.get_status == 'can_get'"
        >
          {{ disabled ? "已过期" : (data.received ? "继续领" : "使用") }}
        </div>
        <div class="action-btn disabled-btn" v-else-if="disabled">已过期</div>
        <div class="action-btn used-btn" v-else-if="data.received && !disabled"></div>
      </div>
    </div>

    <div class="detail-info" v-if="showMore && data.description">
      <div class="instructions">
        <span>{{ data.description }}</span>
      </div>
    </div>
    <div class="detail-info" v-if="cantUseMsg">
      <div class="instructions">
        <tz-icon name="prompt" :size="14" color="#FF7820" />{{ cantUseMsg }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
var that;
export default {
  components: {},
  data() {
    return {
      stateMap: {
        0: "立即领取",
        1: "去使用",
      },
      showMore: false,
    };
  },
  computed: {},

  props: {
    data: {
      type: [Object, Array],
      default: () => {
        return [];
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    picker: {
      type: Boolean,
      default: false,
    },
    checkedId: {
      type: [Number, String],
      default: "",
    },
    ucId: {
      type: [Number, String],
      default: "",
    },
    cantUseMsg: {
      type: String,
      default: "",
    },
  },
  methods: {
    change() {
      this.$emit("change", this.ucId);
    },
    getExpireDate(data) {
      if (!data || !data.use_end_time) return "";
      return data.use_end_time.replace(/-/g, ".").substring(5);
    },
    receive(id) {
      uni.showLoading({
        title: "请稍后",
      });

      that
        .$api("app.coupon.receive", {
          id: id,
        })
        .then((res) => {
          uni.hideLoading();
          if (res.code == 1) {
            that.$emit("refresh", false);
          }

          uni.$u.toast(res.msg);
        });
      uni.stopPullDownRefresh();
    },
  },
  watch: {},
  mounted() {
    that = this;
  },
};
</script>

<style scoped>
.coupon-card {
  margin-bottom: 12px;
}

.coupon-body {
  display: flex;
  align-items: stretch;
  background-color: #fff6f0;
  border-radius: 10px;
  overflow: hidden;
}

.disabled .coupon-body {
  opacity: 0.55;
}

.coupon-left {
  width: 110px;
  min-width: 110px;
  background: linear-gradient(135deg, #ff7820 0%, #ff6000 100%);
  padding: 12px 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.disabled .coupon-left {
  background: linear-gradient(135deg, #c9cdd4 0%, #b8bcc3 100%) !important;
}

.coupon-tag {
  font-size: 10px;
  color: rgba(255,255,255,0.85);
  margin-bottom: 4px;
}

.coupon-price {
  display: flex;
  align-items: baseline;
  line-height: 1;
}

.coupon-price .price-symbol {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.coupon-price .price-num {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-left: 1px;
}

.coupon-price .discount-val {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  margin-left: 2px;
}

.coupon-type-name {
  font-size: 11px;
  color: rgba(255,255,255,0.85);
  margin-top: 6px;
  text-align: center;
}

.coupon-divider {
  width: 1px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.dashed-line {
  width: 1px;
  height: 60%;
  border-left: 1px dashed rgba(255,120,32,0.35);
}

.coupon-right {
  flex: 1;
  padding: 12px 12px 12px 16px;
  display: flex;
  align-items: center;
  min-width: 0;
}

.coupon-right-info {
  width: 100%;
  overflow: hidden;
}

.coupon-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin-bottom: 6px;
}

.coupon-time {
  font-size: 12px;
  color: #86909c;
  line-height: 1.3;
}

.coupon-action {
  display: flex;
  align-items: center;
  padding-right: 14px;
  margin-left: auto;
}

.action-btn {
  min-width: 64px;
  height: 30px;
  border-radius: 15px;
  background: linear-gradient(135deg, #ff904a 0%, #ff6820 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  white-space: nowrap;
}

.disabled-btn {
  background: #c9cdd4 !important;
  cursor: not-allowed;
}

.used-btn {
  position: relative;
  min-width: 56px;
  height: 28px;
  background: none;
  border: none;
}

.detail-info {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  padding: 12px 14px;
  background-color: #fafafa;
  border-radius: 0 0 10px 10px;
  color: #505050;
  text-align: left;
}

.instructions {
  font-size: 12px;
  color: #505050;
  white-space: pre-wrap;
  display: flex;
  align-items: center;
}

.coupon-item .coupon-choose-box {
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  width: 80px;
  height: 100%;
  margin-right: 10px;
}

.coupon-choose {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  background: url(@/static/image/coupon-radio-checked.png);
  background-size: 100% 100%;
}

.coupon-choose-box .coupon-unchoosed {
  border: 1px solid #ccc !important;
  background: none !important;
}
</style>
