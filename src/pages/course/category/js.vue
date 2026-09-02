<script>
import thirdOne from './components/third-one.vue';

var that;

export default {
  components: {
    thirdOne
  },
  data() {
    return {
      categoryList: {},
      activeMenu: 0,
      activeSecondMenu: 0,
      secondCategoryList: [],
      currentSecondCategory: null,
      pagination: {
        data: [],
        current_page: 1,
        total: 1,
        last_page: 1,
      },
      loadStatus: 'loadmore',
      statusBarHeight: 0,
      pageHeight: 0,
      loading: false,
      categoryId: null,
      groupLevel: 4,
      courseList: [],
      courseLoading: false,
      courseForm: {
        limit: 10,
        page: 1,
        group: 0
      },
      hasMore: true
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
  onPullDownRefresh() {
    that.refresh();
  },
  computed: {
    // 当前应直接加载课程列表的分类ID；为 null 时展示分类导航
    courseGroupId() {
      const children = this.categoryList.children;
      if (!children || !children.length) return null;
      const first = children[this.activeMenu];
      if (!first) return null;
      if (this.groupLevel === 1) return first.id;
      const second = this.currentSecondCategory;
      if (this.groupLevel === 2) return (second && second.id) || first.id;
      // 三级及以上：当前选中分类仍有下级分类时展示分类导航，否则直接加载该分类课程
      if (first.children && first.children.length > 0) {
        if (this.groupLevel === 3) return null;
        if (second && second.children && second.children.length > 0) return null;
        return second ? second.id : null;
      }
      return first.id;
    },
    // 课程列表模式下是否显示二级分类tabs
    showSecondTabs() {
      return this.groupLevel >= 2 && this.secondCategoryList.length > 0;
    }
  },
  methods: {
    refresh() {
      that.pagination = {
        data: [],
        current_page: 1,
        total: 1,
        last_page: 1,
      };
      that.courseForm.page = 1;
      that.courseList = [];
      that.hasMore = true;
      that.loadStatus = 'loadmore';
      uni.showLoading({
        title: '请稍后'
      });
      that.getList({});
    },

    async getList(options) {
      that.loading = true;
      const res = await that.$api('course.group.index', {
        id: options.id || 0,
      });
      that.loading = false;
      uni.hideLoading();
      uni.stopPullDownRefresh();
      if (res.code === 1) {
        let data = res.data;
        
        that.groupLevel = data.group_level || 4;
        
        let list = data.list || [];
        
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(item => {
            if (item.image) item.image = item.image.replace(/^`|`$/g, '').trim();
            if (item.children) {
              item.children.forEach(child => {
                if (child.image) child.image = child.image.replace(/^`|`$/g, '').trim();
                if (child.children) {
                  child.children.forEach(subChild => {
                    if (subChild.image) subChild.image = subChild.image.replace(/^`|`$/g, '').trim();
                    if (subChild.children) {
                      subChild.children.forEach(fourthChild => {
                        if (fourthChild.image) fourthChild.image = fourthChild.image.replace(/^`|`$/g, '').trim();
                      });
                    }
                  });
                }
              });
            }
          });
          that.categoryList = {
            style: 'first',
            children: list
          };
        } else {
          that.categoryList = {
            style: 'first',
            children: []
          };
        }
        
        if (options.category_id) {
          const cidIndex = that.categoryList.children.findIndex(item => item.id == options.category_id);
          if (cidIndex !== -1) {
            that.activeMenu = cidIndex;
          }
        }
        
        that.updateSecondCategory();
        that.reloadCourseList();
      }
    },

    updateSecondCategory() {
      if (that.categoryList.children && that.categoryList.children.length > 0 && that.categoryList.children[that.activeMenu]) {
        const firstCategory = that.categoryList.children[that.activeMenu];
        if (firstCategory.children && firstCategory.children.length > 0) {
          that.secondCategoryList = firstCategory.children.map(item => ({
            name: item.name,
            id: item.id
          }));
          that.activeSecondMenu = 0;
          that.currentSecondCategory = firstCategory.children[0];
        } else {
          that.secondCategoryList = [];
          that.currentSecondCategory = null;
        }
      } else {
        that.secondCategoryList = [];
        that.currentSecondCategory = null;
      }
    },

    onMenu(val) {
      that.activeMenu = val;
      that.activeSecondMenu = 0;
      that.updateSecondCategory();
      that.reloadCourseList();
    },

    onSecondMenu(option) {
      that.activeSecondMenu = option.index;
      if (that.categoryList.children && that.categoryList.children[that.activeMenu]) {
        const firstCategory = that.categoryList.children[that.activeMenu];
        if (firstCategory.children && firstCategory.children[option.index]) {
          that.currentSecondCategory = firstCategory.children[option.index];
        }
      }
      that.reloadCourseList();
    },

    // 重置并加载当前选中分类的课程列表（courseGroupId 为 null 时是分类导航模式，无需加载）
    reloadCourseList() {
      that.courseList = [];
      that.courseForm.page = 1;
      that.hasMore = true;
      that.loadStatus = 'loadmore';
      if (that.courseGroupId) {
        that.loadCourseList(that.courseGroupId);
      }
    },

    async loadCourseList(groupId) {
      if (!groupId) return;
      
      that.courseLoading = true;
      that.courseForm.group = groupId;
      
      const res = await that.$api('course.course', that.courseForm);
      that.courseLoading = false;
      uni.hideLoading();
      
      if (res.code === 1) {
        const newList = res.data || [];
        if (that.courseForm.page === 1) {
          that.courseList = newList;
        } else {
          that.courseList = that.courseList.concat(newList);
        }
        
        if (newList.length < that.courseForm.limit) {
          that.hasMore = false;
          that.loadStatus = 'nomore';
        } else {
          that.loadStatus = 'loadmore';
        }
      } else {
        that.loadStatus = 'loadmore';
      }
    },

    onScrollToLower() {
      if (!that.courseGroupId) return;
      if (that.courseLoading || !that.hasMore) return;
      that.loadStatus = 'loading';
      that.courseForm.page++;
      that.loadCourseList(that.courseForm.group);
    }
  }
}
</script>