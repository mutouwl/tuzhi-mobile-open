<script>
var that;
import formModal from "@/pages/app/activity/components/form-modal.vue";
export default {
  components: { formModal },
  data() {
    return {
      loading: false,
      modal: {
        form: false
      },

      //选择的票券列表
      checkedTicket: [],

      //统计
      total: {
        price: 0,
        number: 0
      },

      detail: {},

      //报名信息字段
      apply_info_form: [],
      //被编辑的报名信息下标
      applyInfoIndex: 0,

      //报名信息集合
      applyInfo: [],
      pageParams:{}
    }
  },
  watch: {
  },
  methods: {
    isVirtualPay(item) {
      return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    getDetail() {
      that.loading = true;
      that.$api('app.activity.detail', {
        id: that.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {

          that.detail = res.data;

          // #ifdef H5
          this.$nav.share(that.detail.name, '', that.detail.cover);
          // #endif

          that.loading = false;
        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            complete: function (res) {
              that.$nav.back();
            }
          });
        }
      });
    },

    getTicket() {
      that.loading = true;

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

                that.total.price += res.data[i].price * res.data[i].number;
                that.total.number += res.data[i].number;
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
        that.loading = false;
      });
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

        that.loading = false;
      });
    },

    /**
   * 购买活动
   */
    subscription() {

      if (that.applyInfo.length < that.total.number) {
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
          that.$nav.to('/pages/order/submit/submit?type=activity&goodsList=' + JSON.stringify(goodsList));
        } else {
          uni.$u.toast(res.msg);
        }
        that.loading = false;
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
    that.getDetail();
    that.getTicket();
    that.getApplyForm();

  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>