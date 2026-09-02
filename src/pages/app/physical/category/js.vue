<script>
import secondOne from '../components/second-one.vue';
import thirdOne from '../components/third-one.vue';
import firstOne from '../components/first-one.vue';
import firstTwo from '../components/first-two.vue';
import _ from 'lodash';

var that;

export default {
  components: {
    secondOne,
    thirdOne,
    firstOne,
    firstTwo
  },
  data() {
    return {
      categoryList: {},
      activeMenu: 0,
      pagination: {
        data: [],
        current_page: 1,
        total: 1,
        last_page: 1,
      },
      loadStatus: '',
      statusBarHeight: 0,
      pageHeight: 0,
      loading: false,
      categoryId: null
    }
  },
  onLoad(options) {
    that = this;
    const sysInfo = uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight;
    this.pageHeight = sysInfo.safeArea.height - 44 - 50;
    this.categoryId = options.id || null;
    this.getList(options);
  },
  onReachBottom() {
    this.loadmore();
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
        total: 1,
        last_page: 1,
      };
      uni.showLoading({
        title: '请稍后'
      });
      that.getList({});
    },

    async getList(options) {
      that.loading = true;
      const res = await that.$api('physical.category.index', {
        id: options.id,
      });
      that.loading = false;
      uni.hideLoading();
      uni.stopPullDownRefresh();
      if (res.code === 1) {
        // Clean data if necessary (e.g. remove backticks from images)
        let data = res.data;
        
        // Handle array of categories
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.image) item.image = item.image.replace(/^`|`$/g, '').trim();
                if (item.children) {
                    item.children.forEach(child => {
                        if (child.image) child.image = child.image.replace(/^`|`$/g, '').trim();
                        if (child.children) {
                            child.children.forEach(subChild => {
                                if (subChild.image) subChild.image = subChild.image.replace(/^`|`$/g, '').trim();
                            });
                        }
                    });
                }
            });
            // Wrap array in object for compatibility
            that.categoryList = {
                style: 'first',
                children: data
            };
        } else {
            // Handle single object (original format)
            if (data.image) data.image = data.image.replace(/^`|`$/g, '').trim();
            if (data.children) {
                data.children.forEach(child => {
                    if (child.image) child.image = child.image.replace(/^`|`$/g, '').trim();
                    if (child.children) {
                        child.children.forEach(subChild => {
                            if (subChild.image) subChild.image = subChild.image.replace(/^`|`$/g, '').trim();
                        });
                    }
                });
            }
            that.categoryList = data;
        }
        
        if (that.categoryList.style === 'first_one' || that.categoryList.style === 'first_two') {
            if (that.categoryList.children && that.categoryList.children.length > 0) {
                that.getGoodsList(that.categoryList.children[0].id);
            }
        }
      }
    },

    onMenu(val) {
      that.activeMenu = val;
      if (that.categoryList.style === 'first_one' || that.categoryList.style === 'first_two') {
        that.pagination = {
          data: [],
          current_page: 1,
          total: 1,
          last_page: 1,
        };
        that.getGoodsList(that.categoryList.children[val].id);
      }
    },

    async getGoodsList(id, page = 1, list_rows = 6) {
      that.loadStatus = 'loading';
      const res = await that.$api('physical.physical.index', {
        category_id: id,
        limit: list_rows,
        page,
      });
      if (res.code === 1) {
        let cleanedData = res.data.data.map(item => ({
          ...item,
          cover: item.cover ? item.cover.replace(/^`|`$/g, '').trim() : '',
          price: item.sku_prices && item.sku_prices.length > 0 ? item.sku_prices[0].price : (item.price || 0)
        }));
        let goodsList = _.concat(that.pagination.data, cleanedData);
        that.pagination = {
          ...res.data,
          data: goodsList,
        };
        if (that.pagination.current_page < that.pagination.last_page) {
          that.loadStatus = 'more';
        } else {
          that.loadStatus = 'noMore';
        }
      }
    },

    loadmore() {
      if (
        that.loadStatus !== 'noMore' &&
        (that.categoryList.style === 'first_one' || that.categoryList.style === 'first_two')
      ) {
        that.getGoodsList(
          that.categoryList.children[that.activeMenu].id,
          that.pagination.current_page + 1,
        );
      }
    }
  }
}
</script>
