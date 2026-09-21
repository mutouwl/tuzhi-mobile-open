<template>
  <div>
    <div class="goods-popover" v-if="show && data && data.goods" @click="order">
      <div
        class="cover"
        :style="{
          'background-image': 'url(' + data.goods.cover + ')',
          'background-size': '100% 100%',
        }"
      >
        <img :src="data.goods.cover" :alt="data.goods.name" />
        <div class="type">
          <span>{{ $t(data.goods.type) }}</span>
        </div>
      </div>

      <div class="title two-line-hidden">{{ data.goods.name }}</div>
      <div class="footer">
        <div class="price">
          <template v-if="data.goods.pay_type">
            <template v-if="data.goods.pay_type == 'free'">
              <span>免费</span>
            </template>
            <template v-if="data.goods.pay_type == 'student'">
              <span>指定学员</span>
            </template>
            <template v-if="data.goods.pay_type == 'bind_course'">
              <span>绑定课程</span>
            </template>
            <template v-if="data.goods.pay_type == 'password'">
              <span>密码兑换</span>
            </template>
            <template v-if="data.goods.pay_type == 'pay'">
              <span class="unit">¥ </span> {{ data.goods.price }}
            </template>
          </template>
        </div>

        <div style="font-size: 14px; font-weight: 700; color: #fff">抢</div>
      </div>

      <div class="close" @click.stop="close">
        <tz-icon name="close" color="#fff" :size="15" />
      </div>
    </div>
    <order-modal
      :visible="modal.order"
      :order-params="orderParams"
      @close="modal.order = false"
    />
    
    <!-- 详情页弹窗 - H5环境使用iframe -->
    <detail-popup 
      :show="modal.detail" 
      :url="detailUrl"
      @close="closeDetail" 
      @open="openDetail" 
      @navigate="handleNavigate"
    />
  </div>
</template>

<script>
import liveLibrary from "@/common/utils/live.js";
import orderModal from "@/pages/course/live/goods/order-modal.vue";
import detailPopup from "./detail-popup.vue";

export default {
  components: { orderModal, detailPopup },
  data() {
    return {
      show: true,
      data: {},
      modal: {
        order: false,
        detail: false
      },
      orderParams: {},
      timer: null,
      // 详情页弹窗相关
      detailUrl: '',
      goodsMessageHandler: null,
      visibilityChangeHandler: null
    };
  },
  props: {
    liveId: {
      type: [String, Number],
      default: 0
    }
  },
  methods: {
    getData() {
      this.$api("live.goods.explaining", {
        live_id: this.liveId
      }).then((res) => {
        if (res.code === 1) {
          this.updateGoods(res.data || null);
        }
      });
    },
    updateGoods(data) {
      if (data && data.goods) {
        this.data = data;
        this.show = true;
        this.goodsComparison(data.goods_id + data.goods_type);
        // 3 秒后自动关闭
        var that = this;
        clearTimeout(this._autoCloseTimer);
        this._autoCloseTimer = setTimeout(function () {
          that.show = false;
        }, 6000);
      } else {
        this.data = {};
        this.show = false;
      }
    },
    /**
     * 对比商品：同一场直播重复推送同一商品时不重复弹窗
     * 缓存键 live_popover_goods_{liveId} 有效期为 24 小时，过期后重新计入
     */
    goodsComparison(goodsId) {
      const goodsKey = "live_popover_goods_" + this.liveId;
      // 缓存有效期 24 小时
      const expire = 24 * 3600 * 1000;
      var cached = uni.getStorageSync(goodsKey);
      // 兼容旧版纯字符串缓存：time 缺失视为已过期
      if (cached && cached.value !== undefined && (Date.now() - (cached.time || 0)) < expire) {
        if (cached.value === goodsId) {
          return false;
        }
        uni.setStorageSync(goodsKey, { value: goodsId, time: Date.now() });
        return true;
      }
      uni.setStorageSync(goodsKey, { value: goodsId, time: Date.now() });
      return true;
    },
    order() {
      const goodsType = this.data.goods.type;
      const goodsId = this.data.goods.id;
      
      // #ifdef H5
      // H5环境使用弹窗显示详情页
      this.showDetailInModal(goodsType, goodsId);
      // #endif
      
      // #ifndef H5
      // 非H5环境直接跳转到详情页
      this.navigateToDetail(goodsType, goodsId);
      // #endif
    },
    
    // 在弹窗中显示详情页（H5环境）
    showDetailInModal(type, id) {
      const url = this.buildDetailUrl(type, id);
      if (url) {
        this.detailUrl = '/#'.concat(url);
        this.modal.detail = true;
      }
    },
    
    // 构建详情页URL
    buildDetailUrl(type, id) {
      const pageMap = {
        'goods': '/pages/course/detail/detail',
        'article': '/pages/course/detail/detail',
        'column': '/pages/course/detail/detail',
        'video': '/pages/course/detail/detail',
        'audio': '/pages/course/detail/detail',
        'activity': '/pages/app/activity/detail/detail',
        'score': '/pages/course/detail/detail',
        'physical': '/pages/app/physical/detail/detail',
        'vipcard': '/pages/app/vip/center/center',
        'exercises': '/pages/app/exam/detail/detail',
        'composite': '/pages/app/composite/detail/detail',
        'circle': '/pages/app/circle/presale/presale'
      };
      
      const page = pageMap[type];
      if (!page) return null;
      
      if (type === 'vipcard') {
        return page;
      }
      
      return `${page}?id=${id}`;
    },
    
    // 跳转到商品详情页（非H5环境）
    navigateToDetail(type, id) {
      const routeMap = {
        'goods': 'course',
        'article': 'course',
        'column': 'course',
        'video': 'course',
        'audio': 'course',
        'activity': 'activity',
        'score': 'course',
        'physical': 'physical',
        'vipcard': '/pages/app/vip/center/center',
        'exercises': '/pages/app/exam/detail/detail?id=' + id,
        'composite': 'composite',
        'circle': 'circle'
      };
      
      const route = routeMap[type];
      if (route) {
        if (type === 'vipcard' || type === 'exercises') {
          this.$nav.to(route, 'local');
        } else {
          this.$nav.to(id, route);
        }
      }
    },
    
    // 关闭详情弹窗
    closeDetail() {
      this.modal.detail = false;
      this.detailUrl = '';
    },
    
    // 打开详情弹窗
    openDetail() {
      // 可以在这里添加打开时的逻辑
    },
    
    // 处理导航事件
    handleNavigate(url) {
      this.modal.detail = false;
      this.detailUrl = '';
      window.location.href = url;
    },
    
    close() {
      this.show = false;
      this.$emit("close");
    },
    startTimer() {
      this.getData();
    },
    stopTimer() {
      this.timer = null;
    },
    handlePageShow() {
      this.getData();
    },
    handlePageHide() {
      this.stopTimer();
    }
  },
  deactivated() {
    this.stopTimer();
  },
  onShow() {
    this.handlePageShow();
  },
  onHide() {
    // this.handlePageHide();
  },
  onUnload() {
    this.stopTimer();
  },
  created() {
    this.getData();
    this.goodsMessageHandler = (payload) => {
      if (!payload || String(payload.liveId) !== String(this.liveId)) {
        return;
      }
      this.updateGoods(payload.data || null);
    };
    uni.$on("live_goods_explaining", this.goodsMessageHandler);
    // H5 端额外监听 visibilitychange 事件
    if (uni.getSystemInfoSync().platform === 'h5') {
      this.visibilityChangeHandler = () => {
        if (document.visibilityState === 'hidden') {
          this.handlePageHide();
        } else {
          this.handlePageShow();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  },
  mounted() {
    
  },
  destroyed() {
    this.stopTimer();
    if (this.goodsMessageHandler) {
      uni.$off("live_goods_explaining", this.goodsMessageHandler);
      this.goodsMessageHandler = null;
    }
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }
};
</script>    
<style scoped>
.goods-popover {
  width: 130px;
  background-color: #fff;
  position: fixed;
  right: 10px;
  bottom: calc(env(safe-area-inset-bottom) + 70px);
  border-radius: 6px;
  padding: 4px;
  /* box-shadow: ; */
}

.goods-popover .cover {
  height: 100px;
  width: 100%;
  padding: 0px;
  position: relative;
  border-radius: 6px;
}

.goods-popover .cover img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 6px;
  /* border-radius: 6px */
}

.goods-popover .cover .type {
  position: absolute;
  bottom: 6px;
  right: 3px;
  height: 18px;
  border-radius: 5px;
  padding: 0px 6px;
  box-sizing: border-box;
  line-height: 14px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.goods-popover .cover .type span {
  color: #fff;
  font-weight: 500;
  font-size: 10px;
}

.goods-popover .title {
  color: #1d2129;
  font-size: 12px;
  margin-top: 6px;
}

.goods-popover .footer {
  margin-top: 6px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* background-color: #f53f3f; */
  background: linear-gradient(to right, #f53f3f, #f55454, #f57676);
  border-radius: 6px;
  padding: 2px 8px;
  box-sizing: border-box;
}

.goods-popover .price {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}

.goods-popover .price .unit {
  margin-right: 2px;
  font-size: 12px;
  font-weight: normal;
}

.goods-popover .close {
  position: absolute;
  top: 5px;
  right: 10px;
}

.one-line-hidden,
.two-line-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
}

.one-line-hidden {
  white-space: nowrap !important;
}

.two-line-hidden {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
