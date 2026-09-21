import api from '@/common/request/index';
import orderStatus from './status.js';

/**
 * 订单处理公共方法
 * @param {Object} options - 配置选项
 * @param {string} options.type - 操作类型：evaluate/cancel/delete/pay/service/express/surereceive
 * @param {string} options.orderNo - 订单号
 * @param {number} options.orderIndex - 订单索引（列表页使用）
 * @param {number} options.realPrice - 订单实付金额（支付时使用）
 * @param {Object} options.context - 页面上下文（this）
 * @param {Function} options.callback - 回调函数
 */
export function handleOrder(options) {
    const { type, orderNo, orderIndex, realPrice, context, callback } = options;
    
    switch (type) {
        case 'evaluate':
            // 评价
            if (callback) {
                callback({ type: 'evaluate', orderNo });
            }
            break;
            
        case 'cancel':
            // 取消订单
            orderStatus.cancelOrder(orderNo, function (res) {
                if (res.code === 1) {
                    uni.$u.toast(res.msg);
                    if (callback) {
                        callback({ type: 'cancel', res, orderIndex });
                    }
                }
            });
            break;
            
        case 'delete':
            // 删除订单
            orderStatus.deleteOrder(orderNo, function (res) {
                if (res.code === 1) {
                    uni.$u.toast(res.msg);
                    if (callback) {
                        callback({ type: 'delete', res, orderIndex });
                    }
                }
            });
            break;
            
        case 'pay':
            // 支付
            if (callback) {
                callback({ type: 'pay', orderNo, realPrice });
            }
            break;
            
        case 'service':
            // 售后服务
            context.$nav.to('/pages/order/service/form/form?order_no=' + orderNo);
            break;
            
        case 'express':
            // 物流查询
            context.$nav.to('/pages/order/express/log/log?order_no=' + orderNo);
            break;
            
        case 'surereceive':
            // 确认收货
            uni.showModal({
                title: '确认收货',
                content: '确认已收到商品？确认后订单将完成',
                confirmColor: '#0968f6',
                success: function (res) {
                    if (res.confirm) {
                        api('order.status.confirmReceive', {
                            order_no: orderNo
                        }).then(res => {
                            if (res.code === 1) {
                                uni.$u.toast(res.msg);
                                if (callback) {
                                    callback({ type: 'surereceive', res });
                                }
                            } else {
                                uni.$u.toast(res.msg || '操作失败');
                            }
                        }).catch(err => {
                            uni.$u.toast('操作失败，请重试');
                        });
                    }
                }
            });
            break;
    }
}

export default {
    handleOrder
};
