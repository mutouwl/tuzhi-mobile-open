<script>
var that;
export default {
  data() {
    return {
      loading: false,
      refreshing: false,
      orderNo: '',
      expressInfo: null
    }
  },
  onLoad(options) {
    that = this;
    if (options.order_no) {
      that.orderNo = options.order_no;
      that.getExpressInfo();
    } else {
      uni.showToast({
        title: '订单号不能为空',
        icon: 'none'
      });
    }
  },
  methods: {
    // 获取物流信息
    async getExpressInfo() {
      that.loading = true;
      try {
        const res = await that.$api('physical.express.detail', {
          order_no: that.orderNo
        });
        
        if (res.code === 1) {
          that.expressInfo = res.data;
        } else if (res.code === 0 && res.msg === '暂无物流信息') {
          // 暂无物流信息，显示空状态
          that.expressInfo = {
            express_name: '',
            express_no: '',
            status: 'noinfo',
            status_text: '暂无物流信息',
            logs: []
          };
        } else {
          uni.showToast({
            title: res.msg || '获取物流信息失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取物流信息失败:', error);
        uni.showToast({
          title: '获取物流信息失败',
          icon: 'none'
        });
      } finally {
        that.loading = false;
      }
    },
    
    // 刷新物流信息
    async refreshExpressInfo() {
      if (that.refreshing) return;

      uni.showLoading({
        title: '刷新中...',
        mask: true
      });

      that.refreshing = true;
      try {
        const res = await that.$api('physical.express.refresh', {
          order_no: that.orderNo
        });

        uni.hideLoading();
        if (res.code === 1) {
          that.expressInfo = res.data;
          uni.showToast({
            title: '刷新成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: res.msg || '刷新失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('刷新物流信息失败:', error);
        uni.showToast({
          title: '刷新失败',
          icon: 'none'
        });
      } finally {
        that.refreshing = false;
      }
    },
    
    // 复制快递单号
    copyExpressNo() {
      if (!that.expressInfo || !that.expressInfo.express_no) {
        uni.showToast({
          title: '快递单号为空',
          icon: 'none'
        });
        return;
      }
      
      uni.setClipboardData({
        data: that.expressInfo.express_no,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
    }
  }
}
</script>
