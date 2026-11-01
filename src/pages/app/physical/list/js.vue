<script>
import _ from 'lodash';
import { readPageSnapshot, writePageSnapshot } from '@/common/utils/page-snapshot';

// 快照 key 前缀：分类 / 搜索词不同就是另一屏（同一路由不同参数不许串）
const SNAPSHOT_PREFIX = 'physical/list:';

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
    // key 用 JSON 数组拼：搜索词里带 `:` 也不会与另一屏撞成同一个 key
    that._snapshotKey = SNAPSHOT_PREFIX + JSON.stringify([that.categoryId, that.keyword]);
    // 本会话已加载过这一屏（切 tab 回来）⇒ 零请求复原；下拉刷新是唯一失效口
    if (!that.restoreSnapshot()) {
      that.getList();
    }
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
    /**
     * 存一份「已稳定显示着」的这一屏（成功取数之后调用；下拉刷新重建后覆盖）。
     * 切 tab 会销毁实例，商品列表还带着分页与筛选，这一份就是回来时零请求复原的来源。
     */
    saveSnapshot() {
      if (!that._snapshotKey) return;
      writePageSnapshot(that._snapshotKey, {
        pagination: that.pagination,
        currentSort: that.currentSort,
        currentOrder: that.currentOrder,
        currentTab: that.currentTab,
        iconStatus: that.iconStatus,
        loadStatus: that.loadStatus,
        keyword: that.keyword
      });
    },

    /**
     * 复原快照；没有返回 false。
     * @return {Boolean}
     */
    restoreSnapshot() {
      const snap = readPageSnapshot(that._snapshotKey);
      if (!snap) return false;
      that.pagination = snap.pagination || that.pagination;
      that.currentSort = snap.currentSort || 'weigh';
      that.currentOrder = snap.currentOrder || 'desc';
      that.currentTab = snap.currentTab || 0;
      that.iconStatus = !!snap.iconStatus;
      that.loadStatus = snap.loadStatus || 'more';
      that.keyword = snap.keyword || '';
      that.loading = false;
      return true;
    },

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

      // 这一发的序号：切排序 / 切分类 / 搜索会各发一发，上一发迟到的响应不许覆盖新一屏
      const seq = (that._listSeq || 0) + 1;
      that._listSeq = seq;
      // 取数期间切了 tab：迟到响应不许写到新实例上
      const vm = that;

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

        if (that !== vm || that._listSeq !== seq) return;

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
          // 成功这一份才进快照（失败留着上一份好的，切回来不至于一片空栏）
          that.saveSnapshot();
        } else {
            that.loadStatus = 'more';
        }
      } catch (e) {
        if (that !== vm || that._listSeq !== seq) return;
        // 网络异常/请求被取消（如未登录）：释放骨架屏并回到可重试状态，避免页面停在加载态
        that.loadStatus = 'more';
      } finally {
        if (that === vm && that._listSeq === seq) {
          that.loading = false;
          uni.hideLoading();
        }
        uni.stopPullDownRefresh();
      }
    },

    loadmore() {
      // 请求在途时再点一次会把页码连加两次（第二发被 loadStatus 守卫挡掉，页码却已经走了）⇒ 跳过一页
      if (that.loadStatus === 'loading') return;
      if (that.loadStatus !== 'noMore') {
        that.pagination.current_page++;
        that.getList(that.pagination.current_page);
      }
    }
  }
}
</script>
