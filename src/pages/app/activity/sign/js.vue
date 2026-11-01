<script>
var that;
import banner from '@/components/course/banner.vue';
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";
export default {
  components: {banner,liveStartTimeBar},
  data() {
    return {
      // 首屏（还没有详情）铺骨架屏，取数落地后整块换成真实版式
      loading:true,
      data:{},
      form:{
        name:'',
        mobile:''
      },
      pageParams:{}
    };
  },
  watch: {
  },
  methods: {
    getData() {
      that.loading = true;

      that.tabs = [];
      that.$api('app.activity.detail', {
        id: this.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {

          that.data = res.data;

          // #ifdef H5
					this.$nav.share(res.data.name, '', res.data.cover);
					// #endif
          

          that.loading = false;
        } else {
          // 业务失败也要收口：停在骨架态读出来是「一直在加载」，原因交给全局那句 toast
          that.loading = false;
        }
      }).catch(() => {
        // 网络异常 / 请求被拦：同样要收口（M22 的退出分支一次写全）
        that.loading = false;
      });
    },

    check(){
      that.form.activity_id = this.pageParams.id;
      that.$api('app.activity.signin.signin', that.form).then(res => {

        if(res.code != 1){
          uni.showModal({
            title: '提示',
            content: res.msg,
            showCancel:false,
            complete: function (res) {
            }
          });
          return false;
        }

        this.$nav.to('/pages/app/activity/sign/result/result?ticket_no='+res.data);
      });
    }
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    
    this.getData();
  }
}
</script>