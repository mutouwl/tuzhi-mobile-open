<script>
var that;
import shareModal from "@/components/modal/share-modal.vue";
export default {
  components: { shareModal },
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        type: '',
        name: '',
        sort: 'time',
        order: 'desc',
        privilege_type:'',
        card_id:'',
      pageParams:{}
      },
      sortType: [
        {
          type: 'time',
          name: '时间'
        },
        {
          type: 'price',
          name: '价格'
        }
      ],
      list: [],
      pageParams: {
      },
      modal: {
        time: false,
        mode: false,
        type: false,
        share: false
      },

      userInfo: {},

      type: [
        {
          name: '全部',
          key: 0,
          type: ''
        },
        {
          name: '文章',
          type: 'article',
          key: 1
        },
        {
          name: '视频',
          type: 'video',
          key: 2
        },
        {
          name: '音频',
          type: 'audio',
          key: 3
        },
        {
          name: '专栏',
          type: 'column',
          key: 4
        },
        {
          name: '直播',
          type: 'live',
          key: 5
        }
      ],
      typeChecked: 0,
      shareGoodsId: ''
    }
  },
  watch: {
  },
  methods: {

    //类型被切换
    typeSelect(option) {
      this.typeChecked = option.key;
      this.form.type = option.type;
      this.refresh();
    },

    //调整排序
    changeSort(type) {
      if (type == this.form.sort) {
        this.form.order = this.form.order == 'desc' ? 'asc' : 'desc';
      } else {
        this.form.order = 'desc';
        this.form.sort = type;
      }
      this.refresh();
    },

    showModel(type) {
      // this.form.mode = type
      this.modal[type] = !this.modal[type]
    },

    getData() {

      uni.showLoading({
        title: '请稍后'
      });
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));
      that.$api('app.vip.goods', form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list
        }

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      that.getData();
    },

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    this.form.privilege_type = that.pageParams.type;
    this.form.card_id = that.pageParams.card_id;

    if (that.pageParams.type == 'free') {
      uni.setNavigationBarTitle({
        title: '免费商品'
      });
    } else {
      uni.setNavigationBarTitle({
        title: '折扣商品'
      });
    }

    this.getData();
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  //上划加载
  onReachBottom() {
    that.form.page++;
    that.getData();
  },
}
</script>