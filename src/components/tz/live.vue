<template>
  <div class="live-list-box" v-if="live && live.length>0">
    <template v-for="(item, index) in live">
      <div :class="['live-box', { 'live-box-round': round }]" v-if="index < max_show_num" @click="detail(item.id)">
        <div class="live-box-image">
          <div class="image-box" style="padding-top: 32%">
            <img :src="item.cover" class="course-img" />
          </div>
        </div>
        <div class="live-box-info big-column-info">
          <div class="content-box">
            <div
              v-if="title_show != 'no'"
              :class="[
                'title-box',
                {
                  'one-line-hidden': title_show == 'one',
                  'two-line-hidden': title_show == 'two',
                },
              ]"
              style="font-weight: 600"
            >
            {{ item.name }}
            </div>
            <div
              v-if="introduce_show != 'no'"
              :class="[
                'live-description',
                {
                  'one-line-hidden': introduce_show == 'one',
                  'two-line-hidden': introduce_show == 'two',
                },
              ]"
            >
            {{ item.briefing }}
            </div>
          </div>
          <div class="price-box">
            <div class="price-box">
              <div class="live-price" v-if="price_show">
                <template v-if="item.pay_type">
                  <template v-if="item.pay_type == 'free'"> 免费 </template>
                  <template v-if="item.pay_type == 'password'"> 密码兑换 </template>
                  <template v-if="item.pay_type == 'pay'">
                    <template v-if="isVirtualPay(item)">{{ item.price }} {{ $tools.systemConfig('coin_name') || '金币' }}</template>
                    <template v-else><span style="font-size: 10px;">¥</span> {{ item.price }}</template>
                  </template>
                </template>
              </div>
              <div
                class="live-marking-price"
                v-if="item.pay_type == 'pay' && item.price_marking"
              >
              ¥{{ item.price_marking }}
              </div>
            </div>
          </div>
          <div class="live-footer-box">
            <div class="live-time-box">
              <span class="alive-time-text" v-if="start_time_show">
                <span class="live-start-time-bg theme-customize-bg"></span>
                <span class="live-start-time theme-customize-font"
                  >{{ item.live_start_time_text }}</span
                >
              </span>
            </div>
            <div class="alive-type-show">
              <div class="live-status-box">
                <div class="live-status-btn theme-customize-bg" v-if="status_show">
                  <span>{{ item.live_status_text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {};
  },
  props: {
    live: {
      type: [Object, Array],
      default: () => {
        return [];
      },
    },
    //是否有圆角
    round: {
      type: [Boolean,Number],
      default: true,
    },
    max_show_num: {
      type: [Boolean, Number],
      default: 1,
    },
    title_show: {
      type: String,
      default: "one",
    },
    introduce_show: {
      type: String,
      default: "two",
    },
    price_show: {
      type: [Boolean, Number],
      default: 1,
    },
    marking_price_show: {
      type: [Boolean, Number],
      default: 1,
    },
    status_show: {
      type: [Boolean, Number],
      default: 1,
    },
    start_time_show: {
      type: [Boolean, Number],
      default: 1,
    },
    source: {
      type: String,
      default: "ing",
    }
  },
  computed: {
  },
  methods: {
    detail(id) {
      this.$nav.to(this.$nav.getPagePath(id, 'live'));
    },
    isVirtualPay(item) {
      return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    }
  },
  watch: {},
  mounted() {},
};
</script>

<style>
.live-box {
  display: flex;
  flex-direction: row;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
  margin-bottom: 10px;
}

.live-list-box .live-box:last-child{
  margin-bottom: 0;
}
.live-box-round {
  border-radius: 10px;
}

.live-box-image,
.live-box-image .image-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.live-box-image .image-box {
  position: relative;
  width: 100%;
}

.live-box-image .image-box .course-img {
  object-fit: cover;
}

.live-box-image .image-box img {
  -o-object-fit: cover;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.live-box .big-column-info {
  padding-left: 13px;
  padding-right: 13px;
}

.live-box-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 8px 8px 13px;
  overflow: hidden;
}

.live-box-info > div {
  text-align: start !important;
}

.title-box {
  color: #333;
  font-family: PingFang SC;
  font-size: 15px;
  line-height: 21px;
  white-space: normal;
  margin-bottom: 4px;
  font-weight: 600;
  font-size: 16px;
  line-height: 25px;
}

.live-description {
  color: #999;
  font-size: 13px;
  font-weight: 400;
  font-family: PingFang SC;
  line-height: 17px;
  white-space: normal;
  margin-bottom: 4px;
}

.live-box-info .price-box {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 4px;
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  color: #ff5024;
  font-family: PingFang SC;
  line-height: 17px;
  align-items: baseline;
  margin-top: 2px;
}

.live-price {
  height: 17px;
  line-height: 17px;
  color: #ff5024;
  font-size: 15px;
  font-weight: 700;
  font-family: PingFang SC;
  text-align: left;
  color: #ff2929;
  margin-right: 6px;
}

.live-marking-price {
  text-decoration: line-through;
  font-size: 12px;

  color: #86909C;
}

.live-box .live-footer-box {
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0;
}

.live-box .live-footer-box .live-time-box {
  text-align: left;
  font-size: 11px;
}

.live-box .live-footer-box .live-time-box .alive-time-text {
  position: relative;
  display: inline-block;
  margin-top: 4px;
}

.live-box .live-footer-box .live-time-box .alive-time-text .live-start-time-bg {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  left: 0;
  top: 0;
  opacity: 0.09;
  background-color: #6aa1ff !important;
}

.live-box .live-footer-box .live-time-box .alive-time-text .live-start-time {
  display: inline-block;
  padding: 1px 4px;
  color: #fff;
  font-weight: 500;
  font-size: 12px;
  white-space: normal;
}

.live-box .live-footer-box .live-status-box {
  margin-top: 4px;
  display: inline-block;
}

.live-box .live-footer-box .live-status-box .live-status-btn {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #fff;
  font-weight: 600;
  font-family: PingFang SC;
  padding: 4px 12px;
  background-color: #1572fd;
  border-radius: 21px;
  letter-spacing: 2px;
}

.theme-customize-font {
  color: #0968f6 !important;
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
