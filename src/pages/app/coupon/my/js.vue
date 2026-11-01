<script>
var that;
import couponMy from "@/components/coupon/coupon-my.vue";
// import exercisesControlModal from "../components/exercises-control-modal.vue";
export default {
  components: { couponMy },
  data() {
    return {
      current: 0,
      tabs: [
        {
          name: '待使用',
          type: 'can_use'
        },
        {
          name: '已使用',
          type: 'used'
        },
        {
          name: '已失效',
          type: 'expired'
        }
      ],
      // 加载态只服务首屏与切页签：清单为空时才铺骨架屏（原来这里是 uni.showLoading 黑底转圈 toast，
      // 它抓不到 ui-audit 的 loading-not-skeleton 清单，且接口快于转圈时整屏闪一下黑遮罩）
      loading: true,
      list:[],
      // 取数失败的原因（空串=没失败）：第一页取空时落到空态文案，不把故障说成「暂无优惠券」（M13）
      failMsg: '',
      // 快速切页签/下拉刷新时丢弃过期响应（同打卡「我的打卡」页 seq 口径）：
      // 晚到的那一发不得把已经切走的那一档列表盖回来
      seq: 0,
      form: {
        limit: 15,
        page: 1,
        order: "",
        sort: "",
        type:'can_use'
      }
    }
  },
  computed: {
    // 骨架屏判据：请求中且手上还没有券。翻页时 list 非空 → 只追加不铺骨架
    sk() {
      return that.loading && !that.list.length;
    }
  },
  watch: {
  },
  methods: {

    //状态被切换（u-tabs 的 change 回的是整条页签对象 + index，取法与订单列表 pages/order/list/js.vue 同一份）
    tabChange(tab) {
      if (that.current === tab.index) return;
      that.current = tab.index;
      that.form.type = tab.type;
      that.refresh();
    },

    getData() {
      var seq = ++that.seq;
      that.loading = true;
      that.failMsg = '';

      //资产类型

      return that.$api('app.coupon.my', that.form).then(res => {
        // 过期响应（切页签/下拉刷新那一发更晚回来）整条丢弃；加载态照收——
        // 留给更新的那一发关，它若也被丢掉就永远没人关，骨架屏卡死
        if (seq !== that.seq) {
          that.loading = false;
          return;
        }
        that.loading = false;

        if (!res || res.code !== 1) {
          that.listFail((res && res.msg) || '');
          return;
        }

        var list = that.list;

        if (that.form.page == 1) {
          list = [];
        }
        for (var i in res.data) {
          list.push(res.data[i])
        }
        that.list = list;
      }).catch(() => {
        if (seq !== that.seq) {
          that.loading = false;
          return;
        }
        that.loading = false;
        that.listFail('');
      });
    },

    //取数失败的出口（M13：判到失败还不够，必须让人看见原因）：
    //手上已经有券（翻页/静默重取失败）→ 给一句 toast，旧内容留在屏上；
    //第一页本来就取空 → 落到空态文案
    listFail(msg) {
      var text = msg || '加载失败，请重试';
      if (that.list.length) {
        uni.showToast({ title: text, icon: 'none' });
      } else {
        that.failMsg = text;
      }
    },

    //刷新（首屏 / 切页签 / 下拉刷新）：清列表 + 铺骨架
    refresh() {
      that.form.page = 1
      that.list = [];
      return that.getData();
    },
  },
  onShow() {
    // 模块级 that 停在最后 onLoad 的实例上，本页重新可见先收回绑定（M23）
    that = this;
  },
  //下拉刷新
  onPullDownRefresh() {
    // 下拉的圈等请求落地再收（M4），失败也收
    const done = () => uni.stopPullDownRefresh();
    that.refresh().then(done, done);
  },
  //上划加载
  onReachBottom() {
    if (that.loading) return;
    that.form.page++;
    that.getData();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.refresh();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>
