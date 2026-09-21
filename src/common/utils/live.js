// import {API_URL} from '@/env'
// import router from '@/common/router'
import api from '@/common/request/index';
export default {
    goodsAction(liveId, goodsId, goodsType) {
        api('live.goods.action', {
            live_id: liveId,
            goods_id: goodsId,
            goods_type: goodsType
        }).then(res => {
            uni.hideLoading()
            if (res.code === 1) {
                resolve(res);
            } else {
                uni.$u.toast(res.msg);
            }
        });
    },

    clickGoods(liveId, goodsId, goodsType, callback=function(){}, skuParams=null) {

        
        if (goodsType == 'vipcard') {
            this.$nav.to('/pages/app/vip/center/center');
            return false;
        }

        var orderParams = {
            goodsList: [
                {
                    goodsId: goodsId,
                    count: skuParams ? skuParams.count : 1,
                    goodsType: goodsType,
                    skuId: skuParams ? skuParams.skuId : null
                }
            ],
            live_id: liveId
        };

        uni.showLoading({
            title:"正在加载"
        })

        api('live.goods.action', {
            live_id: liveId,
            goods_id: goodsId,
            goods_type: goodsType
        }).then(res => {
            uni.hideLoading();
            if (res.code === 1) {
                orderParams.live_goods_action_id = res.data;
                callback(orderParams);
            } else {
                uni.$u.toast(res.msg);
            }
        });
    }
}
