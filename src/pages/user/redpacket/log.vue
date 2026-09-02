<template>
  <view class="container">
    <tz-box padding="5px 5px" v-if="list.length > 0">
      <u-cell-group :border="false">
        <u-cell
          size="large"
          v-for="(item, index) in list"
          :key="index"
          :border="(list.length - 1) == index ? false : true"
          :title="item.type_text"
          :label="$tools.formatDate(item.createtime)"
        >
          <template #value>
            <text class="log-amount">+¥{{ item.amount }}</text>
            <text class="log-max" v-if="item.is_max">手气最佳</text>
          </template>
        </u-cell>
      </u-cell-group>
    </tz-box>
    <u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无红包记录" />
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
    };
  },
  onLoad() {
    that = this;
    if (!that.$tools.systemConfig('app_isinstall_live_redpacket')) {
      uni.showToast({ title: '直播红包功能未开启', icon: 'none' });
      setTimeout(function () {
        uni.navigateBack();
      }, 1500);
      return;
    }
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
      that.$api('live.redpacket.getMyList', { page: that.page, limit: that.limit }).then(function (res) {
        that.loading = false;
        uni.hideLoading();
        uni.stopPullDownRefresh();
        if (res.code === 1 && res.data) {
          var rows = res.data.rows || res.data || [];
          if (rows.length < that.limit) {
            that.hasMore = false;
          }
          var newList = rows.map(function (item) {
            return {
              amount: item.amount,
              type_text: item.type == 'equal' ? '普通红包' : '拼手气红包',
              is_max: item.is_max == 1,
              createtime: item.createtime,
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

.log-amount {
  font-size: 14px;
  font-weight: 700;
  color: #ff4d4f;
  margin-right: 6px;
}

.log-max {
  font-size: 12px;
  color: #0968f6;
  background-color: rgba(9, 104, 246, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
