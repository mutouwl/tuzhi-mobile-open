<template>
  <div>
    <u-popup
      title="商品列表"
      :show="show"
      @close="close"
      @open="open"
      :closeable="true"
      :round="10"
      :overlayStyle="{ zIndex: 12000 }"
      :zIndex="12010"
    >
      <tz-box bgColor="none" class="goods-box">
        <!-- 列表加载状态：与红包/礼物弹窗一致的流内块（标题常驻可见）。
             不再用 tz-loading-page 绝对定位整层覆盖——其直角背景会越出弹窗 border-radius 圆角范围，
             视觉上加载时弹窗变成直角方框 -->
        <div class="course-list-loading" v-if="loading">
          <u-loading-icon mode="circle" size="36" color="#0968f6"></u-loading-icon>
          <text class="course-list-loading-text">页面加载中…</text>
        </div>
        <template v-else>
        <div class="course-list" v-if="list && list.length > 0">
          <template v-for="(item, index) in list">
            <div
              :class="[
                'course-item-box',
                {
                  'explaining-bg': item.explaining == 1,
                },
              ]"
              @click="order(item.goods.id, item.goods.type)"
            >
              <div class="explaining" v-if="item.explaining == 1">
                <tz-icon name="flashlight_fill" color="f57676" :size="14"></tz-icon>
                ˙讲解中
              </div>
              <div class="course-containner">
                <div
                  class="cover"
                  :style="{
                    'background-image': 'url(' + item.goods.cover + ')',
                    'background-size': '100% 100%',
                  }"
                >
                  <img :src="item.goods.cover" :alt="item.goods.name" />
                  <div class="type">
                    <span>{{ $t(item.goods.type) }}</span>
                  </div>
                </div>
                <div class="info">
                  <div :class="['title', 'two-line-hidden']">
                    {{ item.description ? item.description : item.goods.name }}
                  </div>

                  <div class="footer">
                    <div class="price">
                      <template v-if="item.goods.pay_type">
                        <template v-if="item.goods.pay_type == 'free'">
                          <span class="no-price">免费</span>
                        </template>
                        <template v-if="item.goods.pay_type == 'student'">
                          <span class="no-price">指定学员</span>
                        </template>
                        <template v-if="item.goods.pay_type == 'bind_course'">
                          <span class="no-price">绑定课程</span>
                        </template>
                        <template v-if="item.goods.pay_type == 'password'">
                          <span class="no-price">密码兑换</span>
                        </template>
                        <template v-if="item.goods.pay_type == 'pay'">
                          <span class="unit">¥ </span> {{ item.goods.price }}
                          <span class="marking" v-if="item.goods.price_marking"
                            >¥{{ item.goods.price_marking }}</span
                          >
                        </template>
                      </template>
                    </div>

                    <div
                      class="buy-btn"
                      
                      style="font-size: 14px; font-weight: 700; color: #fff"
                    >
                      抢购
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <template v-else>
          <u-empty
            icon="/static/image/empty.png"
            text="暂无可购商品"
            width="50"
            height="50"
          />
        </template>
        </template>
      </tz-box>
    </u-popup>

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
var that;
// const liveLibrary = require("@/common/utils/live.js");
import liveLibrary from "@/common/utils/live.js";
import orderModal from "@/pages/course/live/goods/order-modal.vue";
import detailPopup from "./detail-popup.vue";
export default {
  components: { orderModal, detailPopup },
  data() {
    return {
      show: false,
      list: [],
      modal: {
        order: false,
        detail: false
      },
      orderParams: {},
      loading: false,
      // 详情页弹窗相关
      detailUrl: ''
    };
  },
  props: {
    liveId: {
      type: [String, Number],
      default: 0,
    },
    visible: {
      type: [Boolean, Number],
      default: false,
    },
  },
  watch: {
    visible() {
      that.show = that.visible;
      if (that.show) {
        that.getGoods();
      }
    },
  },
  methods: {
    /**
     * 获取课程绑定的作业考试
     */
    getGoods() {
      that.loading = true;
      that
        .$api("live.goods.list", {
          live_id: that.liveId,
        })
        .then((res) => {
          if (res.code === 1) {
            that.list = res.data;
          }
          that.loading = false;
        })
        .catch(function () {
          // 网络异常兜底：复位加载态回到空状态，避免弹窗停在加载中
          that.loading = false;
        });
    },
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", false);
    },
    order(id, type) {
      // #ifdef H5
      // H5环境使用弹窗显示详情页
      this.showDetailInModal(type, id);
      // #endif
      
      // #ifndef H5
      // 非H5环境直接跳转到详情页
      this.navigateToDetail(type, id);
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
      // 仅允许跳转到 http(s) 链接，避免误跳到 about:blank 等非法地址
      if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
        window.location.href = url;
      }
    },
  },
  mounted() {
    that = this;
    this.show = this.visible;
    this.getGoods();
  },
};
</script>

<style scoped>
.course-item-box {
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  margin-bottom: 10px;
  overflow: hidden;
  padding: 6px;
  /* background-color: #fff; */
  border-radius: 6px;
}

.course-item-box .course-containner {
  display: flex;
  justify-content: space-between;
}

.course-item-box .explaining {
  padding: 4px 0 8px;
  font-size: 14px;
  font-weight: bold;
  color: #f57676;
}

.course-item-box.explaining-bg {
  background: linear-gradient(to left, #fff, #f8ecf0);
}

.goods-box {
  width: 100%;
  height: 60vh;
  overflow-y: auto;
}

/* 列表加载状态：流内居中，写法对齐 gift-modal / redpacket-modal，不在弹窗内做整页遮罩 */
.course-list-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.course-list-loading-text {
  color: #86909c;
  font-size: 13px;
  margin-top: 12px;
}

.course-item-box .info {
  width: calc(100% - 150px);
  overflow: hidden;
  position: relative;
}

.course-item-box .cover {
  height: 100px;
  width: 130px;
  padding: 0px;
  position: relative;
  border-radius: 6px;
}

.course-item-box .cover img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 6px;
  /* border-radius: 6px */
}

.course-item-box-round {
  border-radius: 10px;
}

.course-item-box-border {
  border: 1px solid #efefef;
}

.course-item-box:last-child {
  margin-bottom: 0;
}

.course-item-box .info .title {
  color: #1d2129;
  font-size: 16px;
  font-weight: 400;
}

.course-item-box .info .subtitle {
  color: #86909c;
  font-size: 12px;
  margin-top: 8px;
}

.course-item-box .info .time .unit,
.course-item-box .info .time .marking {
  font-size: 14px;
}

.course-item-box .cover .type {
  position: absolute;
  bottom: 4px;
  right: 4px;
  height: 20px;
  padding: 0px 4px;
  box-sizing: border-box;
  line-height: 18px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.course-item-box .cover .type span {
  color: #fff;
  font-size: 10px;
}

.course-item-box .footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  left: 0;
}

.course-item-box .footer .price {
  font-weight: 700;
  font-size: 18px;
  color: #f53f3f;
}

.course-item-box .footer .no-price {
  font-size: 18px;
  color: #f53f3f;
  /* font-weight: normal; */
}

.course-item-box .footer .price .unit {
  margin-right: 2px;
  font-size: 12px;
  font-weight: 700;
}

.course-item-box .footer .price .marking {
  color: #c9cdd4;
  font-weight: 400;
  margin-left: 10px;
  font-size: 12px;
  text-decoration: line-through;
}

.buy-btn {
  background: linear-gradient(to right, #f53f3f, #f55454, #f57676);
  border-radius: 6px;
  padding: 6px 16px;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.detail-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
