<script>
var that;
export default {
  components: {},
  data() {
    return {
      status: "error",
      title: "成功提交，感谢参与",
      subtitle: "",
      btnText: "查看填写详情",
      order_no: "",
      orderDetail: {
        goodsList: [],
      },
      pageParams: {},
      type: "success",
      content_list:[],
      loading:true,
      status_info:{},
      form:{}
    };
  },
  watch: {},
  methods: {
    handleBtnTap() {
      if (typeof this.btnClick === "function") {
        this.btnClick();
      }
    },
    order() {
      uni.redirectTo({
        url: "/pages/order/detail/detail?order_no=" + this.order_no,
      });
    },
    getData() {
      that.loading = true;
      that
        .$api("app.form.detail", {
          id: that.pageParams.id,
          log_id: that.pageParams.log_id,
        })
        .then((res) => {
          that.loading = false;
          uni.stopPullDownRefresh();
          that.form = res.data.form;
          that.content_list = res.data.form.content_list;
          that.status_info = res.data.status_info;

        })
        .catch((err) => {
          that.loading = false;
          uni.stopPullDownRefresh();
        });
    },
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = pageParams;
    if (pageParams.status) {
      this.status = pageParams.status;
    }
    if (pageParams.title) {
      this.title = pageParams.title;
    }
    if (pageParams.type) {
      this.type = pageParams.type;
      if (pageParams.type == "noauth") {
        this.status = "error";
        this.title = "无填写权限";
      } else {
        this.status = "succsss";
      }
    }
    that.getData();
  },
};
</script>
