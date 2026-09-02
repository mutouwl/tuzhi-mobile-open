<template>
  <view class="container">
    <tz-box padding="12px 12px" v-if="list.length > 0">
      <u-cell-group :border="false">
        <u-cell
          size="large"
          v-for="(item, index) in list"
          :key="index"
          :border="(list.length - 1) == index ? false : true"
          :title="item.status_text"
          :isLink="item.can_confirm_wechat_transfer"
          @click="openWithdrawAction(item)"
        >
          <template #label>
            <view class="withdraw-label">
              <text>{{ item.label }}</text>
              <text class="withdraw-transfer-no">转账流水号：{{ item.transfer_no || '-' }}</text>
            </view>
          </template>
          <template #value>
            <text class="withdraw-amount" :class="'status-' + item.status">-¥{{ item.amount }}</text>
          </template>
        </u-cell>
      </u-cell-group>
    </tz-box>
    <u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无提现记录" />

    <u-popup :show="showReceivePopup" mode="bottom" :round="10" :safeAreaInsetBottom="true" @close="closeReceivePopup">
      <view class="receive-popup">
        <view class="receive-header">
          <text class="receive-title">待领取提现</text>
          <text class="receive-close" @click="closeReceivePopup">×</text>
        </view>
        <view class="receive-body" v-if="selectedWithdraw">
          <view class="receive-amount-row">
            <text class="receive-amount-label">提现金额</text>
            <text class="receive-amount">¥{{ selectedWithdraw.amount }}</text>
          </view>
          <view class="receive-info-row">
            <text class="receive-info-label">到账渠道</text>
            <text class="receive-info-value">微信零钱</text>
          </view>
          <view class="receive-info-row">
            <text class="receive-info-label">申请时间</text>
            <text class="receive-info-value">{{ $tools.formatDate(selectedWithdraw.createtime) }}</text>
          </view>
          <view class="receive-tip">
            <text>微信需要你确认后才会转入零钱。确认页打开成功不代表已到账，最终结果以提现记录状态为准。</text>
          </view>
          <view class="receive-guide" v-if="!canUseWechatReceive">
            <text>{{ receiveGuideText }}</text>
          </view>
        </view>
        <view class="receive-actions" v-if="canUseWechatReceive">
          <button class="receive-btn receive-btn-cancel" @click="closeReceivePopup">取消</button>
          <button
            class="receive-btn receive-btn-primary"
            @click="confirmReceive"
          >去确认收款</button>
        </view>
      </view>
    </u-popup>
    <tz-footer />
  </view>
</template>

<script>
var that;
export default {
  data() {
    return {
      list: [],
      page: 1,
      limit: 20,
      hasMore: true,
      loading: false,
      showReceivePopup: false,
      selectedWithdraw: null,
      canUseWechatReceive: false,
      receiveGuideText: '请使用微信小程序或微信内H5打开页面确认收款。',
    };
  },
  onLoad() {
    that = this;
    uni.showLoading({ title: '加载中' });
    this.getData();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.list = [];
    this.hasMore = true;
    this.getData();
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.page++;
      this.getData();
    }
  },
  methods: {
    getData() {
      if (this.loading) return;
      this.loading = true;
      that.$api('user.withdraw.getLog', { page: that.page, limit: that.limit }).then(function (res) {
        that.loading = false;
        uni.hideLoading();
        uni.stopPullDownRefresh();
        if (res.code === 1 && res.data) {
          var rows = res.data.rows || res.data || [];
          if (rows.length < that.limit) {
            that.hasMore = false;
          }
          var statusMap = { waiting: '待处理', processing: '转账中', success: '已成功', refuse: '已拒绝', fail: '转账失败' };
          var statusCodeMap = { waiting: 0, processing: 0, success: 1, refuse: 2, fail: 2 };
          var newList = rows.map(function (item) {
            var canConfirm = !!item.can_confirm_wechat_transfer && item.status != 'success';
            var wechatStatusText = item.wechat_transfer_state_text || '';
            var statusText = canConfirm ? '待领取' : (statusMap[item.status] || item.status);
            var label = that.$tools.formatDate(item.createtime);
            if (wechatStatusText) {
              label += ' · ' + wechatStatusText;
            }
            return {
              id: item.id,
              type: item.type,
              amount: item.money,
              createtime: item.createtime,
              status: statusCodeMap[item.status] !== undefined ? statusCodeMap[item.status] : 0,
              status_text: statusText,
              label: label,
              transfer_no: item.transfer_no || '',
              can_confirm_wechat_transfer: canConfirm,
            };
          });
          that.list = that.list.concat(newList);
        }
      }).catch(function () {
        that.loading = false;
        uni.hideLoading();
        uni.stopPullDownRefresh();
      });
    },
    openWithdrawAction(item) {
      if (!item || !item.can_confirm_wechat_transfer) return;
      this.selectedWithdraw = item;
      this.updateWechatReceiveEnv();
      this.showReceivePopup = true;
    },
    closeReceivePopup() {
      this.showReceivePopup = false;
      this.selectedWithdraw = null;
    },
    confirmReceive() {
      if (!this.selectedWithdraw || !this.canUseWechatReceive) return;
      var item = this.selectedWithdraw;
      this.showReceivePopup = false;
      this.getWechatReceiveParams(item);
    },
    updateWechatReceiveEnv() {
      var canUse = false;
      var guideText = '请使用微信小程序或微信内H5打开页面确认收款。';

      // #ifdef MP-WEIXIN
      canUse = typeof wx !== 'undefined' && !!wx.requestMerchantTransfer;
      if (!canUse) {
        guideText = '当前微信版本不支持确认收款，请升级微信后重试。';
      }
      // #endif

      // #ifdef H5
      var ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent.toLowerCase() : '';
      var isWechat = ua.indexOf('micromessenger') !== -1;
      canUse = isWechat;
      if (!isWechat) {
        guideText = '当前浏览器无法确认收款。请复制页面链接到微信中打开，再进入提现记录确认收款。';
      }
      // #endif

      // #ifndef MP-WEIXIN || H5
      canUse = false;
      guideText = '请使用微信小程序或微信内H5打开页面确认收款。';
      // #endif

      this.canUseWechatReceive = canUse;
      this.receiveGuideText = guideText;
    },
    getWechatReceiveParams(item) {
      uni.showLoading({ title: '加载中' });
      that.$api('user.withdraw.getWechatReceiveParams', { id: item.id }).then(function (res) {
        uni.hideLoading();
        if (res.code !== 1 || !res.data) {
          uni.showModal({
            title: '无法确认收款',
            content: res.msg || '请稍后重试',
            showCancel: false,
          });
          return;
        }
        that.requestWechatMerchantTransfer(res.data);
      }).catch(function () {
        uni.hideLoading();
      });
    },
    requestWechatMerchantTransfer(params) {
      var payload = {
        mchId: params.mch_id,
        appId: params.app_id,
        package: params.package_info,
      };

      // #ifdef MP-WEIXIN
      if (typeof wx === 'undefined' || !wx.requestMerchantTransfer) {
        uni.showModal({
          title: '无法确认收款',
          content: '当前微信版本不支持确认收款，请升级微信后重试',
          showCancel: false,
        });
        return;
      }
      wx.requestMerchantTransfer({
        mchId: payload.mchId,
        appId: payload.appId,
        package: payload.package,
        success: function () {
          that.showConfirmOpenedModal();
        },
        fail: function (err) {
          that.showWechatTransferFail(err);
        },
      });
      // #endif

      // #ifdef H5
      if (typeof WeixinJSBridge === 'undefined') {
        uni.showModal({
          title: '无法确认收款',
          content: '请在微信客户端内打开页面后确认收款',
          showCancel: false,
        });
        return;
      }
      WeixinJSBridge.invoke('requestMerchantTransfer', payload, function (res) {
        if (res && res.err_msg && res.err_msg.indexOf(':ok') > -1) {
          that.showConfirmOpenedModal();
        } else {
          that.showWechatTransferFail(res || {});
        }
      });
      // #endif

      // #ifndef MP-WEIXIN || H5
      uni.showModal({
        title: '无法确认收款',
        content: '当前端暂不支持微信确认收款，请使用微信小程序或微信内H5打开',
        showCancel: false,
      });
      // #endif
    },
    showConfirmOpenedModal() {
      uni.showModal({
        title: '确认收款',
        content: '已完成微信确认收款，正在同步到账结果',
        showCancel: false,
        success: function () {
          that.syncWechatTransferAfterReceive();
        },
      });
    },
    syncWechatTransferAfterReceive() {
      if (!this.selectedWithdraw || !this.selectedWithdraw.id) {
        this.reloadList();
        return;
      }
      uni.showLoading({ title: '同步中' });
      that.$api('user.withdraw.syncWechatTransfer', { id: this.selectedWithdraw.id }).then(function () {
        uni.hideLoading();
        that.reloadList();
      }).catch(function () {
        uni.hideLoading();
        that.reloadList();
      });
    },
    reloadList() {
      this.closeReceivePopup();
      this.page = 1;
      this.list = [];
      this.hasMore = true;
      this.getData();
    },
    showWechatTransferFail(err) {
      var msg = (err && (err.errMsg || err.err_msg)) ? (err.errMsg || err.err_msg) : '用户取消或微信确认收款失败';
      uni.showModal({
        title: '确认收款未完成',
        content: msg,
        showCancel: false,
      });
    },
  },
};
</script>

<style scoped>
::v-deep .u-cell__body {
  padding: 10px 0 !important;
}

::v-deep .u-cell__body .u-cell__title-text {
  font-size: 14px !important;
  font-weight: 400 !important;
}

::v-deep .u-cell__body .u-cell__label--large {
  font-size: 12px !important;
}

::v-deep .u-cell__body .u-cell__label {
  margin-top: 0 !important;
}

::v-deep .u-line {
  border-bottom: 1px solid #efefef !important;
}

.withdraw-amount {
  font-size: 14px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.withdraw-label {
  display: flex;
  flex-direction: column;
  margin-top: 2px;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.withdraw-transfer-no {
  color: #666;
  word-break: break-all;
}

.status-0 {
  color: #f5a623;
  background-color: rgba(245, 166, 35, 0.1);
}

.status-1 {
  color: #52c41a;
  background-color: rgba(82, 196, 26, 0.1);
}

.status-2 {
  color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
}

.receive-popup {
  padding: 16px;
  background: #fff;
}

.receive-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.receive-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.receive-close {
  width: 28px;
  height: 28px;
  line-height: 26px;
  text-align: center;
  color: #999;
  font-size: 24px;
}

.receive-body {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 14px;
}

.receive-amount-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eceff3;
}

.receive-amount-label,
.receive-info-label {
  font-size: 13px;
  color: #777;
}

.receive-amount {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.receive-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.receive-info-value {
  font-size: 13px;
  color: #333;
}

.receive-tip {
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  background: rgba(9, 104, 246, 0.06);
  color: #0968f6;
  font-size: 12px;
  line-height: 1.5;
}

.receive-guide {
  margin-top: 10px;
  padding: 10px;
  border-radius: 6px;
  background: #fff7e6;
  color: #ad6800;
  font-size: 12px;
  line-height: 1.5;
}

.receive-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.receive-btn {
  flex: 1;
  height: 42px;
  line-height: 42px;
  border-radius: 8px;
  font-size: 15px;
  border: none;
}

.receive-btn::after {
  border: none;
}

.receive-btn-cancel {
  color: #666;
  background: #f2f3f5;
}

.receive-btn-primary {
  color: #fff;
  background: #0968f6;
}
</style>
