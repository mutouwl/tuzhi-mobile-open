<script>
import { applyH5Share, mpCard } from '@/common/utils/checkin-share';
import { goActivity } from '@/common/utils/checkin-activity';
var that;
export default {
  data() {
    return {
      // 主页签：0=参与的打卡 / 1=发布的日记。两个页签各自一份列表状态，互不覆盖
      current: 0,
      tabs: [{ name: '参与的打卡' }, { name: '发布的日记' }],
      // 子页签（只在「参与的打卡」下）：sort 跟页签一起存，切换时原样带给接口（同教务预约列表 tab.type 的写法）。
      // 三档的判据全在后端（最近加入/最近使用=排序、今日任务=筛选，M22），前端不本地重排
      subCurrent: 0,
      subTabs: [
        { name: '最近加入', sort: 'join' },
        { name: '最近使用', sort: 'use' },
        { name: '今日任务', sort: 'today' },
      ],
      // ===== 页签一：参与的打卡 =====
      loading: true,
      list: [],
      // 取数失败的原因（空串=没失败）：第一页且取空时落到空态文案，其余情况只 toast（出口见 listFail，M13）
      failMsg: '',
      page: 1,
      limit: 20,
      hasMore: true,
      loadStatus: 'loadmore',
      // 枚举文案由 myList 接口下发（attr），前端不再自存一份
      attr: { join_type: {}, run_state: {}, checkin_mode: {} },
      // 快速切页签/子页签时丢弃过期响应（同教务预约列表 refreshSeq）：旧响应晚到不得回写覆盖新列表
      seq: 0,
      // ===== 页签二：发布的日记 =====
      diaryLoading: false, // 这一栏是切过去才取数，初值给 true 会让它一直显示「在加载」
      diaryList: [],
      // 同一档失败出口（见 diaryFail）
      diaryFailMsg: '',
      diaryPage: 1,
      diaryHasMore: true,
      diaryLoadStatus: 'loadmore',
      diarySeq: 0,
      // onShow 重取要跳过 onLoad 之后那一次（同「可参与的打卡」discover 页的 inited 口径）
      inited: false,
    };
  },
  computed: {
    // 微信分享卡片：本页是不挂在具体活动下的列表页，标题取当前列表名称（与导航栏一致）；
    // 列表页没有内容封面，H5 由 $nav.share 回退站点 logo，小程序端不传 imageUrl（走页面自动截图）
    shareTitle() {
      return '我的打卡';
    },
    shareCover() {
      return '';
    },
    // 页签一的空态文案：「今日任务」是筛过之后的空（不是没参与过活动），
    // 那一档还说「还没有参与的打卡」就是把筛选结果说成空数据（M13）；失败时空态说失败原因
    listEmptyText() {
      if (this.failMsg) return this.failMsg;
      return this.subCurrent === 2 ? '今天没有需要打卡的任务' : '还没有参与的打卡';
    },
  },
  onLoad() {
    that = this;
    if (!that.$tools.systemConfig('app_isinstall_checkin')) {
      uni.showToast({ title: '打卡功能未安装', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 800);
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
      return;
    }
    // 首屏只取当前页签那一份：另一个页签的数据等切过去再取（两处列表互不阻塞）
    that.refresh();
  },
  onShow() {
    // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定（同路由多实例时点赞/页签会改到销毁的实例上）
    that = this;
    // 列表页标题不依赖接口，每次显示都按本页口径设一次（main.js 的全局兜底是无标题的站点名）
    this.applyShare();
    if (!that.inited) {
      that.inited = true;
      return;
    }
    // M23：从活动主页/日记详情退回来时重取当前显示的那一份（静默：不清列表、不铺骨架；
    // 首进那一次由上面的 inited 判掉，H5 的 onLoad→onShow 连发不会重复取）
    if (that.current === 0) that.reload();
    else that.reloadDiary();
  },
  onPullDownRefresh() {
    const done = () => uni.stopPullDownRefresh();
    // 下拉刷新拉的是当前显示的那一份；动画等请求落地再收（M4），失败也收
    (that.current === 0 ? that.refresh() : that.refreshDiary()).then(done, done);
  },
  onReachBottom() {
    if (that.current === 0) that.loadMore();
    else that.loadDiaryMore();
  },
  methods: {
    // 分享卡片口径见 common/utils/checkin-share（H5 走 JSSDK，小程序端走 onShare* 钩子）
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    // 主页签切换：先清空再拉——页签决定数据身份，加载中留着上一个页签的记录会被读成新页签的结果
    // （同教务预约列表 tabChange 的口径）
    tabChange(tab) {
      const index = Number(tab && tab.index) || 0;
      if (that.current === index) return;
      that.current = index;
      if (index === 0) that.refresh();
      else that.refreshDiary();
    },
    // 子页签切换：u-subsection 的 change 直接回索引（u-tabs 回的是 { index } 事件对象，两者不一样）；
    // 三档是同一个列表的不同条件，同样先清空再拉
    subTabChange(index) {
      const next = Number(index) || 0;
      if (that.subCurrent === next) return;
      that.subCurrent = next;
      that.refresh();
    },

    // ===== 页签一：参与的打卡 =====

    // 回第 1 页重拉（切页签/子页签、下拉刷新）：清列表 + 铺骨架
    refresh() {
      return that.fetchList(true, false);
    },
    // 静默重取第 1 页（onShow 返回时用）：保留已加载内容，失败也不动它
    reload() {
      return that.fetchList(true, true);
    },
    // 上拉追加下一页（已无下一页时不再请求）
    loadMore() {
      if (!that.hasMore || that.loadStatus === 'loading') return Promise.resolve();
      return that.fetchList(false, false);
    },
    // silent=true：onShow 的静默重取（保留已加载内容、不铺骨架，失败也不改成空态）
    fetchList(refresh, silent) {
      const page = refresh ? 1 : that.page + 1;
      const seq = refresh ? (that.seq += 1) : that.seq;
      if (refresh && !silent) {
        that.list = [];
        that.failMsg = '';
        that.loading = true;
      }
      that.loadStatus = 'loading';
      const sort = (that.subTabs[that.subCurrent] || {}).sort || 'join';
      return that.$api('checkin.checkin.myList', { page: page, limit: that.limit, sort: sort })
        .then((ret) => {
          // 过期响应丢弃：页签/子页签已变，旧响应不得回写覆盖新列表
          // 过期响应只丢数据，加载态照收：留给「更新的那一发」关，那一发若也被丢掉就永远没人关（骨架屏卡死）
          if (seq !== that.seq) { that.loading = false; return; }
          that.loading = false;
          if (!ret || ret.code !== 1) {
            that.listFail(refresh, (ret && ret.msg) || '');
            return;
          }
          that.failMsg = '';
          const rows = (ret.data && ret.data.rows) || [];
          that.list = refresh ? rows : that.list.concat(rows);
          that.page = page;
          if (refresh) {
            that.attr = (ret.data && ret.data.attr) || that.attr;
          }
          // 接口同一次响应里还带 discover（可参与的预览段），本页不渲染：只铺「我参与的」，
          // 可参与的全量分页在 pages/app/checkin/discover
          that.hasMore = that.list.length < ((ret.data && ret.data.total) || 0);
          that.loadStatus = that.hasMore ? 'loadmore' : 'nomore';
        })
        .catch(() => {
          // 过期响应只丢数据，加载态照收：留给「更新的那一发」关，那一发若也被丢掉就永远没人关（骨架屏卡死）
          if (seq !== that.seq) { that.loading = false; return; }
          that.loading = false;
          that.listFail(refresh, '');
        });
    },
    // 取数失败的出口（M13：判到失败还不够，必须让人看见原因；与打卡记录页 dayFail 同一档）：
    // 翻下一页失败 → 页码没动、旧内容还在，再上拉就是重试，给一句 toast；
    // 静默重取失败 → 只 toast，列表仍留在屏上；第一页本来就取空了 → 落到空态文案，
    // 不把后端故障说成「还没有参与的打卡」
    listFail(refresh, msg) {
      const text = msg || '加载失败，请重试';
      that.loadStatus = 'loadmore';
      if (!refresh || that.list.length) {
        uni.showToast({ title: text, icon: 'none' });
      } else {
        that.failMsg = text;
      }
    },
    // 未参与的活动先进介绍页（打卡介绍：看介绍/价格/玩法 → 参与 → 打卡主页）；
    // 已参与的活动不再被介绍页拦一道，直接进主页。地址与分流在 common/utils/checkin-activity 一处存
    goDetail(item) {
      goActivity(item);
    },

    // ===== 页签二：发布的日记 =====

    refreshDiary() {
      return that.fetchDiary(true, false);
    },
    // 静默重取（onShow 返回、本人日记删除后）：保留已加载内容，不铺骨架
    reloadDiary() {
      return that.fetchDiary(true, true);
    },
    loadDiaryMore() {
      if (!that.diaryHasMore || that.diaryLoadStatus === 'loading') return Promise.resolve();
      return that.fetchDiary(false, false);
    },
    fetchDiary(refresh, silent) {
      const page = refresh ? 1 : that.diaryPage + 1;
      const seq = refresh ? (that.diarySeq += 1) : that.diarySeq;
      if (refresh && !silent) {
        that.diaryList = [];
        that.diaryFailMsg = '';
        that.diaryLoading = true;
      }
      that.diaryLoadStatus = 'loading';
      return that.$api('checkin.diary.myList', { page: page, limit: that.limit })
        .then((ret) => {
          if (seq !== that.diarySeq) { that.diaryLoading = false; return; } // 过期响应只丢数据，不撤骨架
          that.diaryLoading = false;
          if (!ret || ret.code !== 1) {
            that.diaryFail(refresh, (ret && ret.msg) || '');
            return;
          }
          that.diaryFailMsg = '';
          const rows = (ret.data && ret.data.rows) || [];
          that.diaryList = refresh ? rows : that.diaryList.concat(rows);
          that.diaryPage = page;
          // 日记列表的分页判据是 has_more（同成员列表 memberList、可参与列表 discoverList）
          that.diaryHasMore = !!(ret.data && Number(ret.data.has_more) === 1);
          that.diaryLoadStatus = that.diaryHasMore ? 'loadmore' : 'nomore';
        })
        .catch(() => {
          if (seq !== that.diarySeq) { that.diaryLoading = false; return; } // 过期响应只丢数据，不撤骨架
          that.diaryLoading = false;
          that.diaryFail(refresh, '');
        });
    },
    // 页签二的失败出口，口径与 listFail 逐条同档（只换这一份列表）
    diaryFail(refresh, msg) {
      const text = msg || '加载失败，请重试';
      that.diaryLoadStatus = 'loadmore';
      if (!refresh || that.diaryList.length) {
        uni.showToast({ title: text, icon: 'none' });
      } else {
        that.diaryFailMsg = text;
      }
    },
    // 点日记卡（整卡或卡片脚的评论图标）→ 这条日记的详情：复用现有日记页 pages/app/checkin/diary，
    // 与动态搜索页同一落点（打卡的评论与分享都在详情页那一层，本页不再挂一份评论弹窗）；
    // checkin_id 行上自带（myDiaryList 逐行下发），不靠本页记住
    goDiary(record) {
      if (!record || !record.id) return;
      uni.navigateTo({ url: '/pages/app/checkin/diary/diary?id=' + record.id + '&checkin_id=' + record.checkin_id });
    },
    // 点赞：乐观改心形与计数，接口失败原样回滚并说一句为什么（与动态搜索页同一份写法）
    onLike(record) {
      const item = that.diaryList.find((x) => Number(x.id) === Number(record.id));
      if (!item) return;
      const old = item.is_liked;
      const oldCount = item.like_count;
      item.is_liked = old ? 0 : 1;
      item.like_count = oldCount + (old ? -1 : 1);
      that.$api('checkin.checkin.like', { checkin_id: record.checkin_id, record_id: item.id })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            item.is_liked = old;
            item.like_count = oldCount;
            uni.showToast({ title: (ret && ret.msg) || '点赞失败，请重试', icon: 'none' });
          }
        })
        .catch(() => {
          item.is_liked = old;
          item.like_count = oldCount;
        });
    },
  },
  // 小程序转发/朋友圈卡片：无封面时不传 imageUrl，让卡片走页面自动截图（口径见 common/utils/checkin-share）
  onShareAppMessage() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover);
  },
  onShareTimeline() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
  },
};
</script>
