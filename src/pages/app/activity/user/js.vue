<script>
import { ticketStatusText, ticketStatusClass, ticketStartText, ticketShortDate } from '@/common/utils/activity-ticket';

var that;

export default {
  components: {},
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        group: 0,
        search: '',
        order: '',
        status:'',
        sort: ''
      },
      current: 0,
      tabs: [
        {
          name: '全部',
          type: ''
        },
        {
          name: '待使用',
          type: 1
        },
        {
          name: '已签到',
          type: 2
        },
        {
          name: '待审核',
          type: 3
        },
        {
          name: '作废',
          type: 4
        }
      ],
      list: [],
      // 首屏/刷新加载态：true 时列表区铺骨架屏（M16 禁止 showLoading 转圈 toast）
      loading: true,
      // 空态/失败态文案：失败时取后端那一句，不再把「取数失败」渲染成「暂无可用票券」（M13）
      emptyText: '暂无可用票券',
      modal: {
        info: false
      },
      // 弹层里展示的那一行的「更多信息」字段（[字段名, 字段值] 对），点开时定格，
      // 不再按下标回查 list，列表刷新后弹层内容不会串行
      infoRows: []
    }
  },
  computed: {
    // 报名信息行数不固定：列表区给确定高度（tz-popup-list 只认确定高度），
    // 行高 48 逐行累加、上限取屏高的 46%（M6 选项类那一档），少行不撑空、多行框内滚动
    infoHeight() {
      const rows = (this.infoRows || []).length || 3;
      const winH = (uni.getSystemInfoSync() || {}).windowHeight || 667;
      return Math.min(rows * 48 + 4, Math.round(winH * 0.46)) + 'px';
    }
  },
  watch: {
  },
  methods: {

    isVirtualPay(item) {
      return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    // 整卡点击进票券详情（M19：列表卡片进详情绑在卡片根节点；复制/更多信息在卡内 @click.stop）；
    // 状态、时间口径与详情页共读 common/utils/activity-ticket
    goDetail(item) {
      if (!item || !item.ticket_no) {
        uni.showToast({ title: '票券信息不存在', icon: 'none' });
        return;
      }
      that.$nav.to('/pages/app/activity/ticketdetail/ticketdetail?ticket_no=' + encodeURIComponent(item.ticket_no), 'local');
    },

    // 参加人：一行「姓名 手机号」（不再单独占一行手机号 label）
    attendeeText(item) {
      var name = (item && item.name) || '';
      var mobile = (item && item.mobile) || '';
      return [name, mobile].filter(Boolean).join(' ') || '-';
    },

    // 票券状态：签到优先（已签到），否则按票券状态（待使用 / 待审核 / 作废）
    statusText(item) {
      return ticketStatusText(item);
    },

    // 时间轴左列日期锚点：月-日（左列 44px 放不下带年份的完整日期，完整日期在卡内）
    shortDate(item) {
      return ticketShortDate((item || {}).activity_start_time);
    },
    // 卡内活动时间行：2026.10.25 周日 19:30（参考图版式）
    startText(item) {
      return ticketStartText((item || {}).activity_start_time);
    },
    // 封面加载失败按行记一次（预置在取数时，属性已在 data 里，赋值可响应；不写带点的键）
    onCoverError(item) {
      if (item) item.cover_failed = true;
    },

    //状态被切换
    tabChange(tab) {
      that.current = tab.index;
      that.form.status = tab.type;
      that.refresh();
    },

    // 打开「更多信息」弹层：字段对随点击一起定格
    openInfo(item) {
      that.infoRows = (item && item.other) || [];
      that.modal.info = true;
    },

    getData() {
      return that.$api('app.activity.ticket.getUserTicket', that.form).then(res => {
        if (res && res.code === 1) {
          var list = that.list;

          if (that.form.page == 1) {
            list = [];
          }
          for (var i in res.data) {
            var row = res.data[i] || {};
            // 封面失败标记预置在取数时（属性随对象一起进 data，失败时赋值可响应；键名不带点）
            row.cover_failed = false;
            // 状态配色预置成字段：小程序编译器**不支持 `:class` 里调函数**
            // （`Errors compiling template: :classDoes not support statusClass(item) syntax`，
            // H5 能过、mp-weixin 直接编译失败）；与 dot-color 共用同一份判定
            row.status_class = ticketStatusClass(row);
            list.push(row)
          }
          that.list = list;
          that.emptyText = '暂无可用票券';
        } else if (that.form.page == 1) {
          // 首屏/刷新失败：列表留空，空态说后端那一句（M13 不许渲染成「暂无」）
          that.list = [];
          that.emptyText = (res && res.msg) || '加载失败，请重试';
        }
        // 成功/失败都要撤骨架：只收成功那一支会停在灰块上（M16/M4）
        that.loading = false;
      }).catch(() => {
        if (that.form.page == 1) {
          that.list = [];
          that.emptyText = '加载失败，请重试';
        }
        that.loading = false;
      });
    },
    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      that.loading = true;
      return that.getData();
    }
  },
  onLoad(pageParams) {
    that = this;
    that.refresh();
  },
  //下拉刷新：指示器等请求回来再收（M4）
  onPullDownRefresh() {
    const done = () => uni.stopPullDownRefresh();
    that.refresh().then(done, done);
  },
  //上划加载：已有列表在屏上，不铺首屏骨架
  onReachBottom() {
    that.form.page++;
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>
