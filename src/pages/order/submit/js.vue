<script>
  var that;
  import submitOrder from "@/components/order/submit-order.vue";
  export default {
    components: {
      submitOrder
    },
    data() {
      return {
        
        pageParams: {},

      };
    },
    
    methods: {
      
    },
    onLoad(pageParams) {
      that = this;
      if (this.componentsParams) {
        that.pageParams = this.componentsParams
      } else {
        //判断pageParams.goodsList是否包含“%5B%7B”
        if(pageParams &&  pageParams.goodsList && typeof pageParams.goodsList == 'string' && pageParams.goodsList?.startsWith("%5B%7B")){
          //url解码
          pageParams.goodsList = decodeURIComponent(pageParams.goodsList);
        }

        pageParams.goodsList = JSON.parse(pageParams.goodsList);
        that.pageParams = that.$nav.parsePageParams(pageParams);
      }

    },
    onShow() {
      // 从表单填写页返回时刷新状态
      uni.$emit('orderFormPageShow');
    },
  };
</script>