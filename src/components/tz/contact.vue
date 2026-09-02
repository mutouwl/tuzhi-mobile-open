<template>
  <div>
    <div class="contact">
      <div class="contact-icon" @click="handle()">
        <tz-icon name="customerservice_fill" style="line-height: 32px" :size="28" />
      </div>
    </div>

    <u-modal :show="show" :closeOnClickOverlay="true" width="300px" @confirm="show = false" confirmColor="#567"
      confirmText="取消">
      <view class="code-content">

        <div class="tip">
          <div v-if="modal_title">{{modal_title}}</div>
          <div v-if="modal_tip">{{ modal_tip }}</div>
        </div>
        <template v-if="mobile_status">
          <div class="mobile-box">
            <div class="mobile-tip" v-if="mobile_tip">{{mobile_tip}}</div>
            <div class="mobile-val" v-if="mobile_val">{{ mobile_val }}</div>
          </div>
        </template>
        <template v-if="wechat_status">
          <div class="code-img">
            <div class="wechat-tip" v-if="wechat_tip">{{wechat_tip}}</div>
            <image mode="scaleToFill" v-if="wechat_qrcode" :src="wechat_qrcode" :show-menu-by-longpress="true"></image>
          </div>
        </template>
      </view>
    </u-modal>
  </div>
</template>
<script lang="ts">
  // import externalIcon from "@/components/icon/external-icon.vue";
  export default {
    components: {},
    data() {
      return {
        show: false
      };
    },
    props: {
      type: {
        type: [String],
        default: "modal"
      },
      mobile_status: {
        type: [Boolean, Number],
        default: 0
      },
      wechat_status: {
        type: [Boolean, Number],
        default: 1
      },
      mobile_val: {
        type: [String],
        default: "",
      },
      mobile_tip: {
        type: [String],
        default: "",
      },
      wechat_qrcode: {
        type: [String],
        default: ""
      },
      wechat_tip: {
        type: [String],
        default: ""
      },
      modal_title: {
        type: [String],
        default: ""
      },
      modal_tip: {
        type: String,
        default: ""
      },
      link: {
        type: Object,
        default: (ret) => {
          return {
            type: '',
            config: {}
          }
        }
      }
    },
    methods: {
      showModal() {
        this.show = !this.show;
      },

      handle() {
        if (this.type == 'modal') {
          this.show = true;
        } else {
          this.$nav.to(this.link.src, this.link.type)
        }
      }
    },
    watch: {},
  };
</script>

<style>
  .contact {
    width: 84px;
    height: 84px;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-align-items: center;
    align-items: center;
    -webkit-justify-content: center;
    justify-content: center;
    
    position: fixed;
    z-index: 2;
    bottom: 100px;
    right: 0;
  }

  .contact .contact-icon {
    width: 46px;
    height: 46px;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: center;
    align-items: center;
    font-size: 24px;
    background: rgb(255, 255, 255);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    border-radius: 50%;
  }

  .code-content {
    text-align: center;
    padding-bottom: 10px;
    /* padding: 20px; */
  }

  .code-content .tip {
    text-align: center;
  }

  .code-content .tip div:first-child {
    color: #1D2129;
    font-size: 18px;
    font-weight: 500;
  }

  .code-content .tip div:last-child {
    margin-top: 10px;
    color: #6b7785;
    font-size: 14px;
  }

  .code-content .code-img {
    width: 150px;
    height: 150px;

    margin: 20px auto 0;
  }

  .code-content .code-img image {
    width: 100%;
    height: 100%;
  }

  .mobile-box {
    margin-top: 20px;
  }

  .mobile-tip,
  .wechat-tip {
    color: #6b7785;
    font-size: 14px;
  }

  .mobile-box .mobile-val {
    color: #1D2129;
    font-size: 18px;
    font-weight: 500;
    margin-top: 10px;
  }
</style>