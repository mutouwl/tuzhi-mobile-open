<script>
import thirdOne from './components/third-one.vue';
import { readPageSnapshot, writePageSnapshot } from '@/common/utils/page-snapshot';

// 快照 key 前缀：同一路由不同 id / 初始选中的 category_id 是两个页面，快照不许串
const SNAPSHOT_PREFIX = 'course/category:';

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
      loading: true,
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
    // 这一屏的身份（id + 建页时选中的二级分类）与「下拉刷新该用哪一份参数」都记在这里：
    // 老写法的 refresh() 调 getList({})，下拉一次就把 id 丢了、回到根分类树
    that._loadQuery = { id: options.id, category_id: options.category_id };
    // key 用 JSON 数组拼：参数里带 `:` 时也不会与另一屏撞成同一个 key
    that._snapshotKey = SNAPSHOT_PREFIX + JSON.stringify([options.id || '', options.category_id || '']);
    // 本会话已经加载过这一页（切 tab 回来 / 从别的入口进来过）⇒ 直接复原，零请求
    if (!that.restoreSnapshot()) {
      that.getList(that._loadQuery);
    }
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
    /**
     * 存一份「已稳定显示着」的这一屏（只在取数成功之后调用；下拉刷新重建后覆盖）。
     * 切 tab 会销毁实例，这份快照是回来时零请求复原的唯一来源。
     */
    saveSnapshot() {
      if (!that._snapshotKey) return;
      writePageSnapshot(that._snapshotKey, {
        categoryList: that.categoryList,
        groupLevel: that.groupLevel,
        activeMenu: that.activeMenu,
        activeSecondMenu: that.activeSecondMenu,
        secondCategoryList: that.secondCategoryList,
        currentSecondCategory: that.currentSecondCategory,
        courseList: that.courseList,
        courseForm: that.courseForm,
        pagination: that.pagination,
        hasMore: that.hasMore,
        loadStatus: that.loadStatus
      });
    },

    /**
     * 复原快照；没有（本会话没加载过这一页）返回 false，交给调用点正常取数。
     * @return {Boolean}
     */
    restoreSnapshot() {
      const snap = readPageSnapshot(that._snapshotKey);
      if (!snap) return false;
      that.categoryList = snap.categoryList || { style: 'first', children: [] };
      that.groupLevel = snap.groupLevel || 4;
      that.activeMenu = snap.activeMenu || 0;
      that.activeSecondMenu = snap.activeSecondMenu || 0;
      that.secondCategoryList = snap.secondCategoryList || [];
      that.currentSecondCategory = snap.currentSecondCategory || null;
      that.courseList = snap.courseList || [];
      that.courseForm = snap.courseForm || { limit: 10, page: 1, group: 0 };
      that.pagination = snap.pagination || that.pagination;
      that.hasMore = snap.hasMore !== false;
      that.loadStatus = snap.loadStatus || 'loadmore';
      that.loading = false;
      that.courseLoading = false;
      return true;
    },

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
      // 不再叠 uni.showLoading：加载反馈由左右两栏的骨架屏给（M16），下拉刷新有原生指示器
      // 参数用本页 onLoad 记下的那一份：传 {} 会把 id 丢掉，下拉一次就回根分类树
      that.getList(that._loadQuery || {});
    },

    async getList(options) {
      const query = options || {};
      // 取数期间切了 tab：这一份迟到响应不许写到新实例上（模块级 that 已被新实例改写）
      const vm = that;
      that.loading = true;
      try {
        const res = await that.$api('course.group.index', {
          id: query.id || 0,
        });
        if (that !== vm) return;
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

          if (query.category_id) {
            const cidIndex = that.categoryList.children.findIndex(item => item.id == query.category_id);
            if (cidIndex !== -1) {
              that.activeMenu = cidIndex;
            }
          }

          that.updateSecondCategory();
          if (that.courseGroupId) {
            // 课程那一栏落地后由 loadCourseList 存快照（此处存会是一份「分类有了、课程还在路上」的半份）
            that.reloadCourseList();
          } else {
            that.saveSnapshot();
          }
        }
      } catch (err) {
        // 网络异常：收起骨架屏，保留可下拉重试的空态（老写法没有 catch，骨架屏会一直转）
      } finally {
        if (that === vm) {
          that.loading = false;
        }
        uni.stopPullDownRefresh();
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
      } else {
        // 导航模式（三级/四级分类）不发课程请求，菜单/页签的选择本身就是这一屏要保存的状态
        that.saveSnapshot();
      }
    },

    async loadCourseList(groupId) {
      if (!groupId) return;

      // 这一发对应的页码：返回期间 courseForm.page 可能已被下一次上拉改掉，
      // 拿它判「首页覆盖 / 追加」才是这一份响应自己的语义
      const page = that.courseForm.page;
      const vm = that;
      // 请求序号：下拉刷新 / 切分类会另起一发，同一分组也可能两发叠着，
      // 只认最新那一发（旧的那发不许把行拼进新列表、也不许收 loading）
      const seq = (that._courseSeq || 0) + 1;
      that._courseSeq = seq;

      that.courseLoading = true;
      that.courseForm.group = groupId;

      try {
        const res = await that.$api('course.course', that.courseForm);
        // 实例被切走 / 期间又发了一发（切分类、页签或下拉刷新）：这一份都不算数
        if (that !== vm || seq !== that._courseSeq) return;

        if (res.code === 1) {
          const newList = res.data || [];
          if (page === 1) {
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
          // 只有成功的这一份才配进快照（失败留着上一份好的，切回来不会得到一片空栏）
          that.saveSnapshot();
        } else {
          that.loadStatus = 'loadmore';
        }
      } catch (err) {
        if (that === vm && seq === that._courseSeq) {
          that.loadStatus = 'loadmore';
        }
      } finally {
        // 旧的迟到响应不许把新那一发的加载态收掉（新的可能还在飞）
        if (that === vm && seq === that._courseSeq) {
          that.courseLoading = false;
        }
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