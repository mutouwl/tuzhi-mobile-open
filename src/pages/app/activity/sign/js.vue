<script>
var that;
import banner from '@/components/course/banner.vue';
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";
export default {
  components: {banner,liveStartTimeBar},
  data() {
    return {
      loading:false,
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
        }
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