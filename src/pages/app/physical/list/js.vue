<script>
import _ from 'lodash';

var that;

export default {
  components: {
  },
  data() {
    return {
      pagination: {
        data: [],
        current_page: 1,
        total: 0,
        last_page: 1,
      },
      currentSort: 'weigh',
      currentOrder: 'desc',
      currentTab: 0,
      iconStatus: false, // false: grid mode, true: list mode
      categoryId: 0,
      tabList: [
        {
          name: '综合推荐',
          value: 'weigh',
        },
        {
          name: '销量',
          value: 'total_sales',
        },
        {
          name: '新品优先',
          value: 'createtime',
        },
      ],
      loadStatus: 'more',
      keyword: '',
      // 首屏即骨架态：进页面就展示商品卡骨架，避免空状态先闪一下
      loading: true
    }
  },
  onLoad(options) {
    that = this;
    that.categoryId = options.categoryId || 0;
    that.keyword = options.keyword || '';
    that.getList();
  },
  onReachBottom() {
    that.loadmore();
  },
  onPullDownRefresh() {
    that.refresh();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
  methods: {
    refresh() {
      that.pagination = {
        data: [],
        current_page: 1,
        total: 0,
        last_page: 1,
      };
      that.loadStatus = 'more';
      that.getList();
    },

    // Reset list
    emptyList() {
      that.pagination = {
        data: [],
        current_page: 1,
        total: 0,
        last_page: 1,
      };
      that.loadStatus = 'more';
    },

    onSearch() {
      that.emptyList();
      that.getList();
    },

    onTabsChange(index) {
      if (index === that.currentTab) return;
      
      that.currentTab = index;
      that.currentSort = that.tabList[index].value;
      
      that.emptyList();
      that.getList();
    },

    async getList(page = 1, list_rows = 10) {
      if (that.loadStatus === 'loading') return;
      
      that.loadStatus = 'loading';
      // 首屏（列表为空）由骨架屏给反馈，不再叠加原生 loading；上拉翻页时已有商品还在屏上，用「请稍后」提示
      var loadingTip = that.pagination.data.length > 0;
      if (loadingTip) {
        uni.showLoading({
          title: '请稍后'
        });
      }
      that.loading = true;

      try {
        const res = await that.$api('physical.physical.index', {
          sort: that.currentSort,
          order: that.currentOrder,
          category_id: that.categoryId,
          limit: list_rows,
          keyword: that.keyword,
          page: that.pagination.current_page,
        });

        if (res.code === 1) {
          let cleanedData = res.data.data.map(item => ({
            ...item,
            cover: item.image || item.cover ? (item.image || item.cover).replace(/^`|`$/g, '').trim() : '',
            price: item.price || (item.sku_prices && item.sku_prices.length > 0 ? item.sku_prices[0].price : 0),
            virtual_sales: item.show_sales || item.virtual_sales || 0
          }));

          if (page === 1) {
              that.pagination.data = cleanedData;
          } else {
              that.pagination.data = that.pagination.data.concat(cleanedData);
          }

          that.pagination.total = res.data.total;
          that.pagination.current_page = res.data.current_page;
          that.pagination.last_page = res.data.last_page;

          if (that.pagination.current_page < that.pagination.last_page) {
            that.loadStatus = 'more';
          } else {
            that.loadStatus = 'noMore';
          }
        } else {
            that.loadStatus = 'more';
        }
      } catch (e) {
        // 网络异常/请求被取消（如未登录）：释放骨架屏并回到可重试状态，避免页面停在加载态
        that.loadStatus = 'more';
      } finally {
        that.loading = false;
        uni.hideLoading();
        uni.stopPullDownRefresh();
      }
    },

    loadmore() {
      if (that.loadStatus !== 'noMore') {
        that.pagination.current_page++;
        that.getList(that.pagination.current_page);
      }
    }
  }
}
</script>
