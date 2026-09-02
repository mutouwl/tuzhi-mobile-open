<template>
  <div>
    <u-popup
      title="送礼物"
      :show="show"
      @close="close"
      @open="open"
      :closeable="true"
      :round="10"
      :overlayStyle="{ zIndex: 12000 }"
      :zIndex="12010"
    >
      <tz-box bgColor="none" v-if="loading">
        <div class="gift-options-box gift-loading">
          <u-loading-icon size="40" color="#ff7d00"></u-loading-icon>
          <div class="loading-text">加载中…</div>
        </div>
      </tz-box>

      <tz-box bgColor="none" v-else-if="list && list.length>0">
        <div class="gift-options-box">
          <u-grid :col="4" :border="false" align="left">
            <u-grid-item v-for="(item, index) in list" @click="changeOption(index)">
              <div :class="['gift-item', { active: index == checkedOptionsIndex }]">
                <img class="gift-icon" :src="item.icon" />
                <div class="gift-name">{{ item.name }}</div>
                <div class="gift-price"><span>¥</span>{{ item.price }}</div>
              </div>
            </u-grid-item>
          </u-grid>
        </div>
        <div class="gift-footer">
          <div class="price-total-box">
            合计：<span class="price-value"
              ><span class="price-unit">¥</span>{{ totalPrice }}</span
            >
          </div>
          <div class="send-btn">
            <u-number-box
              bgColor="rgb(255,247,232)"
              color="rgb(255,125,0)"
              :cursorSpacing="20"
              :max="gift_max_count"
              :min="1"
              button-size="26"
              v-model="giftCount"
              @change="giftCountChange"
            >
              <template slot="minus">
                <u-icon name="minus-circle" color="rgb(255, 125, 0)" size="20"></u-icon>
              </template>

              <template slot="plus">
                <u-icon name="plus-circle" color="rgb(255, 125, 0)" size="20"></u-icon>
              </template>
            </u-number-box>
            <button @click="send">赠送</button>
          </div>
        </div>
      </tz-box>

      <tz-box bgColor="none" v-else>
        <u-empty
          icon="/static/image/empty.png"
          width="50"
          height="50"
          text="暂无礼物"
        />
      </tz-box>

      <tz-pay 
        :visible="modal.pay" 
        @handle="payHandle" 
        :go-order="false" 
        :order-no="orderNo" 
        :money="totalPrice"
        @close="modal.pay=false"
      ></tz-pay>
    </u-popup>
  </div>
</template>

<script>

var that;
export default {
  components: {},
  data() {
    return {
      modal:{
        pay: false
      },
      show: false,
      loading: false,
      list: [],
      giftCount: 1,
      checkedOptionsIndex:0,
      orderNo:''
    };
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },
    liveId: {
      type: [String, Number],
      default: 0
    },
    gift_max_count: {
      type: [String, Number],
      default: 100
    }
  },
  computed: {
    /**
     * 送礼物插件是否已安装
     */
    isGiftEnabled() {
      return !!this.$tools.systemConfig('app_isinstall_live_gift');
    },
    totalPrice() {
      if (this.list && this.list.length > 0 && this.list[this.checkedOptionsIndex]) {
        return (this.giftCount * this.list[this.checkedOptionsIndex].price).toFixed(2);
      }
      return '0.00';
    }
  },
  watch: {
    visible() {
      that.show = that.visible;
      if (that.show && that.isGiftEnabled) {
        that.getGiftOptions();
      }
    },
  },
  methods: {
    changeOption(index){
      this.checkedOptionsIndex = index
      this.giftCount = 1;
    },
    giftCountChange(e) {
      this.giftCount = e.value;
    },
    /**
     * 获取课程绑定的作业考试
     */
    getGiftOptions() {
      if (!that.isGiftEnabled) {
        that.loading = false;
        that.list = [];
        return;
      }
      that.loading = true;
      that.checkedOptionsIndex = 0;
      that.$api("live.gift.options", {}).then((res) => {
        if (res.code === 1) {
          that.list = res.data;
        }
        that.loading = false;
      });
    },
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", false);
    },
    /**
     * 赠送礼物
     */
    send(){
      if (!that.isGiftEnabled) {
        uni.showToast({
          title: '礼物功能未开启',
          icon: 'none'
        });
        return;
      }
      if (!that.list || !that.list[that.checkedOptionsIndex]) {
        uni.showToast({
          title: '请选择礼物',
          icon: 'none'
        });
        return;
      }
      uni.showLoading({
        title: "提交中",
      });
      that.$api("live.gift.send", {
        course_id:that.liveId,
        count: that.giftCount,
        gift_id: that.list[that.checkedOptionsIndex].id
      }).then((res) => {
        uni.hideLoading();
        if (res.code === 1) {
          that.orderNo = res.data.order_no;
          that.modal.pay = true;
        }
      });
    },

    payHandle(type,result){
      if(result == 'success'){
        //成功支付
        that.modal.pay = false;
        that.$emit("close", false);
      }
    }
  },
  mounted() {
    that = this;
    this.show = this.visible;
    if (this.show && this.isGiftEnabled) {
      this.getGiftOptions();
    }
  },
};
</script>

<style scoped>
/* 兼容多端 */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  color: transparent; /* 可选：进一步隐藏 */
}

.gift-options-box {
  height: 300px;
  width: 100%;
  overflow-x: auto;
}

.gift-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #999;
  font-size: 14px;
  margin-top: 10px;
}

.gift-item {
  text-align: center;
  /* margin: 10px 0; */
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: 16px;
  border: 2px solid rgba(255, 125, 0, 0);
  box-sizing: border-box;
}

.gift-item.active {
  background: rgba(255, 125, 0, 0.1);
  border: 2px solid rgba(255, 125, 0, 1);
}

.gift-icon {
  width: 40px;
  height: 40px;
}

.gift-name {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.gift-price {
  color: #ff7d00;
  font-size: 12px;
  font-weight: 700;
  margin-top: 2px;
}

.gift-footer {
  padding: 10px;
  border-top: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  vertical-align: middle;
  justify-content: space-between;
}

.price-total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 10px; */
  font-size: 14px;
  color: #666;
}

.price-value {
  color: #ff7d00;
  font-size: 20px;
  font-weight: 700;
}

.price-unit {
  font-size: 14px;
}

.send-btn {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.send-btn button {
  width: 80px;
  height: 36px;
  line-height: 36px;
  background: linear-gradient(90deg, #ff7d00, #ff9f00);
  color: #fff;
  border-radius: 18px;
  font-size: 14px;
  border: none;
}

.send-btn button::after {
  border: none;
}
</style>
