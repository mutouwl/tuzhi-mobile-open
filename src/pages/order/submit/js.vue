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

        // **这一行不许抛**（2026-10-29：拼团「开新团」与买课后「送好友」两条入口进来，下单页白屏）：
        // 整条购买流用明文 JSON 拼地址（`goodsList=[{"goodsId":...}]`），H5 与开发者工具都吃得下，
        // 但真机/分享出去的地址可能把 query 截断（`goodsList=` 后面为空、少一个 `}`），
        // 一旦 `JSON.parse` 抛出，`onLoad` 就断在这里 —— 页面壳连骨架都不会渲染，
        // 读出来就是「跳转过来一片白」。解析失败按空单处理，交给下单页自己的失败分支说话
        // （M13：失败要有可读出口，不许静默成白屏）。
        let goodsList = pageParams ? pageParams.goodsList : null;
        if (typeof goodsList === 'string') {
          try {
            goodsList = JSON.parse(goodsList);
          } catch (e) {
            goodsList = [];
            uni.showToast({ title: '下单信息不完整，请返回重新进入', icon: 'none' });
          }
        } else if (!Array.isArray(goodsList)) {
          goodsList = [];
        }
        pageParams = pageParams || {};
        pageParams.goodsList = goodsList;
        that.pageParams = that.$nav.parsePageParams(pageParams);
      }

    },
    onShow() {
      // 从表单填写页返回时刷新状态
      uni.$emit('orderFormPageShow');
    },
  };
</script>