<script>
var that;
import formModal from "@/components/tz/form-modal.vue";
// 拼团下单上下文（2026-10-31）：拼团那一趟随 `ticket` 一起进来，本页把「票种/张数/报名信息」
// 补齐后原样交给结算页（键名只存 `common/utils/group-buy-order.js`）
import { readGroupBuyOrder, withGroupBuyOrder } from '@/common/utils/group-buy-order.js';
// 拼团业务主题色（2026-10-31）：拼团那一趟按钮换红橙渐变、价格换业务红（与拼团区/详情页同一档）
import { GB_GRADIENT, GB_TEXT } from '@/common/utils/group-buy-theme.js';
// 票种 → 拼团价 的映射（与选票页同读一份；各写一遍就是下一次改口径只改一半）
import { gbTicketPrice } from '@/common/utils/group-buy-ticket-price.js';
export default {
  components: { formModal },
  data() {
    return {
      // 三段取数各自落地（2026-10-31 骨架屏）：只按「先回来的那一路」收口，票券行与合计
      // 会先闪一遍半成品（硬约束 22「一个加载态盖住多条腿」）——与同模块选票页同一份判据
      detailLoaded: false,
      ticketLoaded: false,
      formLoaded: false,
      // 拼团那一趟多一条腿（拼团活动本体：票种拼团价 / 划线原价从这里取）
      gbLoaded: false,
      gbActivity: null,
      modal: {
        form: false
      },

      //选择的票券列表
      checkedTicket: [],

      detail: {},

      //报名信息字段
      apply_info_form: [],
      //被编辑的报名信息下标
      applyInfoIndex: 0,

      //报名信息集合
      applyInfo: [],
      pageParams:{},
      // 拼团下单上下文（没有 `gb_activity` 就是空对象 = 普通报名链，逐字不变）
      gbOrder: {}
    }
  },
  watch: {
  },
  computed: {
    /** 骨架屏的撤出判据：活动详情 / 票券 / 报名表单 / 拼团活动（非拼团链恒为已落地）全部到手 */
    loading() {
      return !(this.detailLoaded && this.ticketLoaded && this.formLoaded && this.gbLoaded);
    },
    /** 拼团那一趟（URL 带 `gb_activity`）：行金额与合计按活动的拼团价画 */
    gbPicking() {
      return !!(this.gbOrder && this.gbOrder.gb_activity);
    },
    /** 票券张数合计（原来记在 data 里，改成 computed：拼团价晚到时合计能跟着重算） */
    totalNumber() {
      let n = 0;
      (this.checkedTicket || []).forEach((item) => { n += Number(item.number) || 0; });
      return n;
    },
    /** 合计金额：与票券行同源（拼团那一趟按拼团价累加） */
    totalPrice() {
      let p = 0;
      (this.checkedTicket || []).forEach((item) => { p += this.ticketUnitPrice(item) * (Number(item.number) || 0); });
      return Math.round(p * 100) / 100;
    },
    /** 主按钮底色：拼团那一趟换业务红橙渐变（模板读不到 import，经 computed 下发；空串 = 平台蓝） */
    gbBtnColor() {
      return this.gbPicking ? GB_GRADIENT : '';
    },
    /** 价格文字色：拼团那一趟换业务红（白底 5.04:1），普通链仍是平台价红 */
    gbPriceStyle() {
      return this.gbPicking ? { color: GB_TEXT } : {};
    },
    /** 「添加报名信息」那枚镂空按钮：拼团那一趟换成业务红 */
    gbPlainColor() {
      return this.gbPicking ? GB_TEXT : '#257AF2';
    }
  },
  methods: {
    isVirtualPay(item) {
      return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    /**
     * 拼团那一趟的票价（2026-10-31 用户点名「这个也没有适配啊」——选票页改完，本页的行金额与合计
     * 也要跟着换）：价只从拼团活动读（`group_buy.activity.detail` 的 `specs[].price`；阶梯型按
     * URL 上 `gb_ladder` 取 `ladder[].price`，缺省第一档，与拼团区 `initPick()` 同口径），
     * 本页不自己算。普通报名链（`gbOrder` 空）不发这一条，页面与改造前逐字不变。
     */
    getGroupBuy() {
      if (!that.gbPicking) { that.gbLoaded = true; return; }
      const goodsType = that.gbOrder.gb_goods_type || 'activity';
      const goodsId = Number(that.gbOrder.gb_goods_id) || Number(that.pageParams.id) || 0;
      const done = () => { that.gbLoaded = true; };
      that.$api('group_buy.activity.detail', { goods_type: goodsType, goods_id: goodsId })
        .then(res => {
          // 对不上 URL 上那一场（活动已结束、商家又开了新的一场）⇒ 不拿别场的价画这一单
          if (res && res.code === 1 && res.data
              && Number(res.data.activity_id) === Number(that.gbOrder.gb_activity)) {
            that.gbActivity = res.data;
          }
          done();
        })
        .catch(done);
    },
    /** 这一张票的拼团价与划线原价（映射只在 `common/utils/group-buy-ticket-price.js` 一份） */
    gbTicketPriceOf(item) {
      return gbTicketPrice(this.gbActivity, item, this.gbOrder.gb_ladder);
    },
    /** 行金额与合计同读这一枚：拼团那一趟用拼团价，其余照旧 */
    ticketUnitPrice(item) {
      const row = this.gbTicketPriceOf(item);
      return row ? row.price : (Number(item && item.price) || 0);
    },

    getDetail() {
      that.$api('app.activity.detail', {
        id: that.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {

          that.detail = res.data;

          // #ifdef H5
          this.$nav.share(that.detail.name, '', that.detail.cover);
          // #endif

        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            complete: function (res) {
              that.$nav.back();
            }
          });
        }
        that.detailLoaded = true;
      }).catch(() => { that.detailLoaded = true; });
    },

    getTicket() {
      that.tabs = [];
      that.$api('app.activity.ticket.getTicket', {
        id: this.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {
          for (var i in res.data) {
            for (var j in that.pageParams.ticket) {
              if (res.data[i].id == j) {
                res.data[i].number = that.pageParams.ticket[j];
                that.checkedTicket.push(res.data[i]);
              }
            }
          }

        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            complete: function (res) {
              that.$nav.back();
            }
          });
        }
        that.ticketLoaded = true;
      }).catch(() => { that.ticketLoaded = true; });
    },
    //刷新
    refresh() {
    },

    //编辑报名信息完成
    formHandle(option) {
      this.modal.form = false;
      if (this.applyInfoIndex === '') {

        //效验手机号有没有重复
        for (var i in this.applyInfo) {
          if (this.applyInfo[i][1] == option[1]) {
            uni.showToast({
              title: '手机号不允许重复',
              icon: 'none',
              duration: 2000
            });
            return false;
          }
        }
        this.applyInfo.push(option);
      } else {
        for (var i in this.applyInfo) {
          if (this.applyInfo[i][1] == option[1] && i != this.applyInfoIndex) {
            uni.showToast({
            title: '手机号不允许重复',
            icon: 'none',
            duration: 2000
          });
          return false;
          }
        }

        this.applyInfo[this.applyInfoIndex] = option;
      }
    },
    //删除报名信息
    delApplyInfo(index) {
      this.applyInfo.splice(index, 1)
    },
    //修改报名信息
    editApplyInfo(index) {
      this.applyInfoIndex = index;
      this.modal.form = true;
    },
    //添加报名信息
    addApplyInfo() {
      this.applyInfoIndex = '';
      this.modal.form = true;
    },

    getApplyForm() {
      that.$api('app.activity.form.getform', {
        activity_id: this.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {
          that.apply_info_form = res.data;
        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            complete: function (res) {
              that.$nav.back();
            }
          });
        }

        that.formLoaded = true;
      }).catch(() => { that.formLoaded = true; });
    },

    /**
   * 购买活动
   */
    subscription() {

      // 拼团单（2026-10-31）：后端 `team.open/join` 只收一枚 `form_user_id`（`ActivitySpec::box()`
      // 把报名信息 id 当 `extra` 带下去），而「每张票券都要单独报名」的活动一张票就要一份报名信息
      // ⇒ 拼团一次只能买 1 张。这里明说；不拦的话多份报名里只有第一份会进订单，票券发错人。
      if (that.gbOrder && that.gbOrder.gb_activity
          && that.detail.apply_info_collet == 1 && that.totalNumber > 1) {
        uni.$u.toast('该活动的每张票券需单独报名，拼团一次只能购买 1 张');
        return false;
      }

      if (that.applyInfo.length < that.totalNumber) {
        if (that.detail.apply_info_collet == 1) {
          uni.$u.toast('每张票券都需要填写报名信息，请补全后再提交');
          return false;
        }
        uni.$u.toast('请补全每张票券对应联系人信息');
        return false;
      }

      if (that.detail.apply_info_collet != 1 && that.applyInfo.length < 1) {
        uni.$u.toast('请完善报名信息');
        return false;
      }

      that.$api('app.activity.form.submit', {
        form: that.applyInfo,
        activity_id: this.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {
          //判断购买方式、单独购买、购买专栏
          var goodsList = [];

          if (!res.data) {
            uni.$u.toast('报名信息提交失败，请刷新页面重试');
            return false;
          }

          var formInfoIndex = 0;
          for (var i in that.checkedTicket) {
            for (var j = 0; j < that.checkedTicket[i].number; j++) {
              if (that.detail.apply_info_collet != 1) {
                //收集多个信息
                var formId = res.data[0];
              } else {
                //单一信息
                if (!res.data.hasOwnProperty(i)) {
                  uni.$u.toast('报名信息提交失败，请刷新页面重试');
                  return false;
                }
                var formId = res.data[formInfoIndex];
              }

              goodsList.push({
                goodsId: that.checkedTicket[i].id,
                goodsType: 'activity',
                count: 1,
                extend: formId
              });
              formInfoIndex++;
            }

          }
          var url = '/pages/order/submit/submit?type=activity&goodsList=' + JSON.stringify(goodsList);
          // 拼团单（2026-10-31 用户点名「先在选票页添加报名信息，再到报名信息页填写」）：
          // 结算页的拼团档（`team.open/join`）只认「一枚票种 + 份数 + 一枚报名信息 id」——
          // 票种当规格（`gb_spec` / `gb_spec_set`）、张数当份数（`gb_count`）、报名信息当 `gb_form`；
          // 票券页已拦住多票种、本页已拦住多份报名。普通报名链 `gbOrder` 是空对象 ⇒ 地址逐字不变。
          if (that.gbOrder && that.gbOrder.gb_activity) {
            var firstTicket = that.checkedTicket[0] || {};
            url = withGroupBuyOrder(url, Object.assign({}, that.gbOrder, {
              gb_spec: Number(firstTicket.id) || 0,
              gb_spec_set: 1,
              gb_count: Number(firstTicket.number) > 1 ? Number(firstTicket.number) : '',
              gb_form: Number(res.data[0]) || ''
            }));
          }
          that.$nav.to(url);
        } else {
          uni.$u.toast(res.msg);
        }
      });




    },
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShow() {
    that.refresh();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.pageParams.ticket = JSON.parse(that.pageParams.ticket)
    // 拼团那一趟（选票页随 `ticket` 带上来的扁平 `gb_*`）：本页只搬运并补齐票种/张数/报名信息 id。
    // **身份核的是 `gb_goods_id` 与 `pageParams.id`**（活动 9），不是 `gb_activity`（拼团活动 12388）：
    // 对不上（历史链接 / 手工改址）⇒ 当普通报名链，别把别一场活动带进这一单
    var gbIn = readGroupBuyOrder(that.pageParams);
    var gbGoods = Number(gbIn.gb_goods_id) || 0;
    that.gbOrder = gbIn.gb_activity && (!gbGoods || gbGoods === Number(that.pageParams.id)) ? gbIn : {};
    that.getDetail();
    that.getTicket();
    that.getApplyForm();
    that.getGroupBuy();

  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>