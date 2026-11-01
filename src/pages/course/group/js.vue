<script>
import { readPageSnapshot, writePageSnapshot } from '@/common/utils/page-snapshot';

// 快照 key 前缀：不同分组 id / 有没有顶部页签是两个页面，快照不许串
const SNAPSHOT_PREFIX = 'course/group:';

var that;
export default {
  data() {
    return {
      tabsList: [
        {
          name: "全部",
          id: 0,
        },
      ],
      tabbarHeight: 0,
      form: {
        limit: 10,
        page: 1,
        group: 0
      },
      list: [],
      pageParams: {},
      showTabs: false,
      loading: true,
      // 分页状态：hasMore 由「本页是否铺满」判定，loadStatus 供底部 u-loadmore 展示
      hasMore: true,
      loadStatus: 'loadmore',
      // 取数失败（接口 code!=1）时不复用「暂无课程」，避免把后端故障说成没内容
      loadFailed: false
    };
  },
  watch: {},
  methods: {
    getData() {
      if(that.showTabs){
        if(!that.form.group){
          that.form.group = that.pageParams.id;
        }
      }else{
        if (that.pageParams.id) {
          that.form.group = that.pageParams.id;
        }
      }

      // 取数期间切了 tab：这一份迟到响应不许写到新实例上
      const vm = that;
      // 请求序号：下拉刷新 / 切页签 / 上拉翻页可能叠着发，只认最新那一发
      const seq = (that._dataSeq || 0) + 1;
      that._dataSeq = seq;

      that._dataSettled = false;
      that.loading = true;
      that.loadStatus = 'loading';

      that.$api("course.course", that.form).then((res) => {
        // 下拉刷新指示器要等数据回来再收，否则用户看不出刷新有没有生效
        uni.stopPullDownRefresh();
        // 实例被切走 / 期间又发了一发（切页签、下拉刷新或上拉翻页）：这一份都不算数
        if (that !== vm || seq !== that._dataSeq) return;
        that.loading = false;
        if (!res || res.code !== 1) {
          that.loadFailed = true;
          // 失败复位加载行，便于再次上拉重试
          that.loadStatus = that.hasMore ? 'loadmore' : 'nomore';
          return;
        }
        var rows = res.data || [];
        for (var i in rows) {
          that.list.push(rows[i]);
        }
        that.loadFailed = false;
        // 本页没铺满即到底：不再发下一页请求，加载行收掉
        that.hasMore = rows.length >= that.form.limit;
        that.loadStatus = that.hasMore ? 'loadmore' : 'nomore';
        // 成功这一份才进快照（失败留着上一份，切回来不至于一片空栏）
        that._dataSettled = true;
        that.saveSnapshot();
      }).catch(() => {
        if (that !== vm || seq !== that._dataSeq) return;
        // 网络异常：收起首屏骨架、恢复可重试状态（老写法没有 catch，骨架屏会一直转）
        that.loading = false;
        that.loadStatus = that.hasMore ? 'loadmore' : 'nomore';
        uni.stopPullDownRefresh();
      });
    },
    getGroup() {
      that.tabsList = [
        { 
          name: "全部",
          id: 0,
        },
      ];
      that.$api("course.group.getList", { parent_id: that.pageParams.id || 0 }).then((res) => {
        if (res.code === 1) {
          that.tabsList = that.tabsList.concat(res.data);
          that.saveSnapshot();
        }
      }).catch(() => {
        // 页签取失败不影响列表本身；下拉刷新会再来一次
      });
    },

    /**
     * 存一份「已稳定显示着」的这一屏（成功取数之后调用；下拉刷新重建后覆盖）。
     * 切 tab 会销毁实例，这是回来时零请求复原的唯一来源。
     */
    saveSnapshot() {
      // 列表还没落地（getData 在飞 / 首取失败）时不存：半份快照复原出来是「空列表 + 加载行」
      if (!that._snapshotKey || !that._dataSettled) return;
      writePageSnapshot(that._snapshotKey, {
        tabsList: that.tabsList,
        form: that.form,
        list: that.list,
        showTabs: that.showTabs,
        hasMore: that.hasMore,
        loadStatus: that.loadStatus,
        loadFailed: that.loadFailed
      });
    },

    /**
     * 复原快照；没有返回 false。
     * 带页签的页面要求页签已经取全（只有「全部」那一枚说明 getGroup 还没回来：
     * 这种半份快照复原出来会永久少几个页签，宁可当没存过、整页重取一次）。
     * @return {Boolean}
     */
    restoreSnapshot() {
      const snap = readPageSnapshot(that._snapshotKey);
      if (!snap) return false;
      if (snap.showTabs && (!snap.tabsList || snap.tabsList.length <= 1)) return false;
      that.tabsList = snap.tabsList || that.tabsList;
      that.form = snap.form || that.form;
      that.list = snap.list || [];
      that.hasMore = snap.hasMore !== false;
      that.loadStatus = snap.loadStatus || 'loadmore';
      that.loadFailed = !!snap.loadFailed;
      that.loading = false;
      that._dataSettled = true;
      return true;
    },

    refresh() {
      that.form.page = 1;
      that.list = [];
      that.hasMore = true;
      that.loadStatus = 'loadmore';
      // 不再叠 uni.showLoading：首屏/切页签的加载反馈由骨架屏给（M16），下拉刷新有原生指示器
      that.getData();
    },

    tabsHandle(option) {
      if (this.form.group != option.id) {
        this.form.group = option.id;
        that.refresh();
      }
    },
  },
  onLoad(pageParams) {
    that = this;
    if (pageParams) {
      that.pageParams = that.$nav.parsePageParams(pageParams);
    } else {
      that.pageParams = null;
    }

    uni.getSystemInfo({
      success: function (res) {
        that.titleBarHeight = res.windowTop;
      },
    });
    
    if ((that.pageParams && that.pageParams.tabs == 1) || !that.pageParams.id) {
      that.showTabs = true;
    }
    
    // 这一屏的身份：分组 id + 有没有顶部页签（两者不同就是另一页）
    // key 用 JSON 数组拼，参数里带分隔符也不会与另一屏撞成同一个 key
    that._snapshotKey = SNAPSHOT_PREFIX + JSON.stringify([
      (that.pageParams && that.pageParams.id) || '',
      that.showTabs ? 1 : 0
    ]);
    // 本会话已加载过这一页（切 tab 回来）⇒ 零请求复原；页签还没取全的那份快照不算数
    if (!that.restoreSnapshot()) {
      if (that.showTabs) {
        that.getGroup();
      }
      that.refresh();
    }

    if (that.pageParams && that.pageParams.name) {
      const decodedName = decodeURIComponent(that.pageParams.name);
      uni.setNavigationBarTitle({
        title: decodedName
      });
    }
  },
  onPullDownRefresh() {
    that.refresh();
  },
  onReachBottom() {
    // 请求在途或已到底不再翻页：翻页期间列表留着、由 u-loadmore 给反馈（M16 不闪骨架）
    if (that.loading || !that.hasMore) return;
    that.form.page++;
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>