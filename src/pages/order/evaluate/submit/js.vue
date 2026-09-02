<script>
var that;
import course from "@/components/order/course.vue";
export default {
  components: { course },
  data() {
    return {
      value: 0,
      labelWidth: 70,
      form: {
        rate: 5,
        content: '',
        anonymity: 0,
        imgs: []
      },
      list: [],
      pageParams: {},
      imgList: [],
      uploadImgList: [],
      data: {
        snapshoot: {}
      }
    }
  },
  watch: {
  },
  methods: {
    getData() {
      that.$api('order.evaluate.getToItemInfo', {
        order_no: that.pageParams.order_no,
        item_id: that.pageParams.item_id
      }).then(res => {
        if (res.code == 1) {
          that.data = res.data
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
    },

    //立即提交
    submit() {
      if (that.uploadImgList.length > 9) {
        uni.$u.toast('最多上传9张图片');
        return false;
      }

      if (!that.form.content) {
        uni.$u.toast('请输入要评价的内容');
        return false;
      }

      var params = {
        order_no: that.pageParams.order_no,
        item_id: that.pageParams.item_id,
        rows: that.form
      }


      that.$api('order.evaluate.submit', params).then(res => {
        if (res.code == 1) {
          uni.showModal({
            title: '提示',
            content: res.msg,
            showCancel:false,
            success: function (res) {
              uni.navigateBack({
                delta: 1
              })
            }
          });
        } else {
          uni.$u.toast(res.msg);
        }
      });
    },
    // 删除图片
    deletePic(event) {
      this[`imgList`].splice(event.index, 1);
      this.form.imgs.splice(event.index, 1);
    },

    // 新增图片
    async afterRead(event) {
      if (event.file.length > 0) {
        for (var i in event.file) {
          that.$tools.uploadImage('common/upload', event.file[i].url).then(res => {
            that.imgList.push({
              url: res.full_url
            });
            this.form.imgs.push(res.url);
          });
        }
      }

    },
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    this.getData();
  }
}
</script>