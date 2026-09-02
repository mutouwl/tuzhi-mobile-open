<script>
import course from "@/components/order/course.vue";
var that;
// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  components: {
    course
  },
  data() {
    return {
      labelWidth: 70,
      labelStyle: {
        'text-align': 'right'
      },
      showSex: false,
      form: {
        reason:0,
        mobile:'',
        remark:''
      },
      list: [],
      pageParams: {},

      data: {},
      modal: {
        reason: false,
        evaluate: false,
        pay: false
      },
      error: true,
      pageParams: {},
      //售后原因
      reasonOption: [],
      reasonText:''
    }
  },
  computed: {

  },

  methods: {

    reasonSelect(e) {
      this.reasonText = e.name;
			this.form.reason = e.id;
		},

    //展示弹窗
    modelShow(type) {
      that.modal[type] = !that.modal[type];
    },
    getData() {
      
      this.error = true;
      that.$api('order.detail', {
        order_no: that.pageParams.order_no
      }).then(res => {
        if (res.code == 1) {
          that.data = res.data;
          if(res.data.service == 1){
            //售后中
            that.$nav.to('/pages/order/service/detail/detail?order_no='+that.data.order_no,'local','redirectTo');
          }
          this.error = false;
        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            success: function (res) {
              uni.navigateBack({
                delta: 1
              })
            }
          });
        }

      });
      uni.stopPullDownRefresh();
    }, 
    //刷新
    refresh() {
      that.getData();
    },

    /**
     * 提交售后申请
     */
    submit(){
      var params = this.form;
      params.order_no = this.pageParams.order_no;
      that.$api('order.service.apply', params).then(res => {
        that.$u.toast(res.msg);
          if(res.code == 1){
            that.$nav.to('/pages/order/service/detail/detail?order_no='+that.data.order_no,'local','redirectTo');
          }
      });
    },

    onShow() {
      that.getData()
    },
    onLoad(pageParams) {
      that = this;
      that.pageParams = that.$nav.parsePageParams(pageParams);

      this.getRefundReason();
    },

    /**
     * 获取退款原因
     */
    getRefundReason() {
  
      var reasonOption = [];
      that.$api('order.service.reason', {}).then(res => {
          for(var i in res.data){
            reasonOption.push({
              name:res.data[i],
              id:i
            })
          }
          this.reasonText = reasonOption[0].name;
          this.form.reason = reasonOption[0].id;
          
          this.reasonOption = reasonOption;
      });
      uni.stopPullDownRefresh();
    }, 
    onShareAppMessage() {
      return this.$nav.share();
    },
    onShareTimeline() {
      return this.$nav.share();
    }
  }
}
</script>