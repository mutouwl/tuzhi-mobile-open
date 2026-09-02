import api from '@/common/request/index';
export default {

    cancelOrder(orderNo,callback) {
        uni.showModal({
            title: '提示',
            content: "确定要取消该订单吗",
            success: function (res) {
                if (res.confirm) {
                    uni.showLoading({
                        title: '正在操作'
                    })
                    api('order.status.cancel', {
                        order_no: orderNo
                    }).then(res => {
                        callback(res);
                    });
                }
            }
        });

    },

    deleteOrder(orderNo,callback) {
        uni.showModal({
            title: '提示',
            content: "确定要删除该订单吗",
            success: function (res) {
                if (res.confirm) {
                    uni.showLoading({
                        title: '正在操作'
                    })
                    api('order.status.delete', {
                        order_no: orderNo
                    }).then(res => {
                        callback(res);
                    });
                }
            }
        });

    },
}