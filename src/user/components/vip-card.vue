<template>
  <view class="box">
    <div
      class="vip-card"
      v-if="vipConfig.status == 1 && vipConfig.entrance == 1 && vipCardList.length > 0"
      @click="$nav.to('/pages/app/vip/center/center')"
    >
      <div class="card-info">
        <template v-if="vipUserInfo">
          <div class="title">
            {{ vipUserInfo.card.title ? vipUserInfo.card.title : "付费会员卡" }}
          </div>
          <div class="subtitle">
            {{
              vipUserInfo.card.subtitle
                ? vipUserInfo.card.subtitle
                : "会员专享免费或指定折扣"
            }}
          </div>
        </template>

        <template v-else>
          <div class="title">
            {{ vipCardList[0].title ? vipCardList[0].title : "付费会员卡" }}
          </div>
          <div class="subtitle">
            {{
              vipCardList[0].subtitle ? vipCardList[0].subtitle : "会员专享免费或指定折扣"
            }}
          </div>
        </template>
      </div>
      <span class="vip-btn">{{ vipUserInfo ? "会员中心" : "立即开通" }}</span>
      <!-- <div class="link"> -->

      <!-- <u-button shape="circle" size="mini" class="vip-btn" :text="vipUserInfo ? '会员中心' : '立即开通'"></u-button> -->
      <!-- </div> -->
    </div>
  </view>
</template>

<script>
var that;
// #ifdef MP-TOUTIAO
import i18n from "@/components/language/index.js";
// #endif
export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  data() {
    return {
      vipConfig: {},
      vipUserInfo: false,
      vipCardList: []
    };
  },
  props: {},
  watch: {},
  methods: {
    getVipConfig() {
      that.$api("app.vip.config", {}).then((res) => {
        if (res.code === 1) {
          that.vipConfig = res.data;

          if (that.vipConfig.status == 1 && that.vipConfig.entrance == 1) {
            that.getVipCard();
            that.getVipUser();
          }
        }
      });
    },
    getVipUser() {
      that.$api("app.vip.user", {}).then((res) => {
        if (res.code === 1) {
          that.vipUserInfo = res.data;
        }
      });
    },
    /**
     * 获取付费会员卡列表
     */
    getVipCard() {
      that.$api("app.vip.detail", that.form).then((res) => {
        that.loading = false;
        if (res.code === 1) {
          that.vipCardList = res.data;
        }
      });
    },
  },
  mounted() {
    that = this;
    that.getVipConfig();
  },
};
</script>

<style>
.vip-card {
  /* position: absolute; */
  width: calc(90% - 20px);
  /* height: 35px; */
  /* line-height: 50px; */

  /* background-image: linear-gradient(to bottom, #FDE9BD,#FFDA9A, #FFCB71); */
  /* background-image: linear-gradient(140deg, #333333, #3e3e3e, #464646, #4d4d4d); */
  background-image: linear-gradient(140deg, #EFE5D4, #F6EFE2);
  
  /* background-color: #37322C; */

  /* border-radius: 8px 8px 0 0; */
  border-radius: 8px;
  bottom: 8px;
  left: 5%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 10px 10px;

  margin: 10px auto;

  opacity: 0.9;
}

.vip-btn {
  /* background: linear-gradient(270deg,#e3cea3,#FFCB71); */
  background-color: #5a3c23;
  /* border: 1px solid #d3ccb2 !important; */
  border: none !important;
  color: #F6EFE2;
  padding: 3px 8px;
  border: none;
  font-size: 12px;
  border-radius: 30px;
}

.card-info .title {
  /* color: #ffecbe; */
  color: #5a3c23;
  font-weight: 600;
  font-size: 14px;
}

.card-info .subtitle {
  /* color: #d3ccb2; */
  color: #878787;
  font-size: 12px;
  font-weight: 400;
  margin-top: 2px;
}
</style>
