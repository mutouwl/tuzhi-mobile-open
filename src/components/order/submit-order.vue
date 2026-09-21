<template>
    <view class="">
        <tz-loading-page :absolute="true" tip="正在获取订单数据" :loading="loading"></tz-loading-page>
        
        <!-- 地址选择栏（实物商品，或规格含实物商品的组合商品） -->
        <view class="address-card" v-if="pageParams.type === 'physical' || needAddress" @click="selectAddress">
            <view class="address-content" v-if="address">
                <view class="address-info">
                    <view class="user-info">
                        <text class="name">{{ address.name }}</text>
                        <text class="mobile">{{ address.mobile }}</text>
                    </view>
                    <view class="address-text">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}</view>
                </view>
                <u-icon name="arrow-right" color="#999" size="16"></u-icon>
            </view>
            <view class="address-empty" v-else>
                <view class="add-address-btn">
                    <u-icon name="plus" color="#0968f6" size="16"></u-icon>
                    <text class="add-text">请选择收货地址</text>
                </view>
                <u-icon name="arrow-right" color="#999" size="16"></u-icon>
            </view>
            <view class="address-line"></view>
        </view>
        
        <tz-box>
            <course v-for="(item, index) in data.orderGoodsList" :key="index" :name="item.detail.name"
                :cover="item.detail.cover" :type="item.detail.type" :price="item.detail.price" :count="item.count"
                :is-virtual-pay="isVirtualPay" />
            <tz-divider bgColor="#fff" />
            <u-line dashed></u-line>
            <tz-divider bgColor="#fff" />
            <div class="total-box">
                共{{ data.goods_count ? data.goods_count : 0 }}件，商品小记：
                <span class="price">
                    <span class="unit" v-if="!isVirtualPay">¥</span>
                    {{ data.goods_total_price ? data.goods_total_price : 0 }}
                    <span class="unit" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
                </span>
            </div>
        </tz-box>

        <!-- 购买课程前表单入口 -->
        <tz-divider />
        <template v-if="formRequirement.hasForm && !loading">
        <view class="form-requirement-card" 
              @click="goFillForm">
            <view class="form-requirement-content">
                <view class="form-requirement-title">购买前需填写表单</view>
                <view class="form-requirement-status" :class="{ submitted: formRequirement.allSubmitted }">
                    {{ formRequirement.allSubmitted ? '已填写' : '请先填写' }}
                </view>
                <u-icon name="arrow-right" color="#999" size="16"></u-icon>
            </view>
        </view>

        <tz-divider />
        </template>
        <template v-if="!isVirtualPay">
        <tz-box padding="5px 15px">
            <u-form>
                <u-form-item label="优惠券" :labelWidth="labelWidth" @click="modal.couponPicker = true">
                    <view class="input-item">{{
                        data.coupon_discount_fee > 0
                        ? formatDiscountPrice(data.coupon_discount_fee)
                        : "请选择优惠券"
                        }}</view>
                    <u-icon slot="right" name="arrow-right" color="rgb(192, 196, 204)"></u-icon>
                </u-form-item>
            </u-form>
        </tz-box>

        <tz-divider />
        </template>
        <tz-box padding="5px 15px" v-if="!loading">
            <u-form :labelWidth="labelWidth">
                <u-form-item label="积分" :border="true" v-if="data.score_amount">
                    <div class="item-val">-{{ data.score_amount }}</div>
                </u-form-item>

                <u-form-item label="会员折扣" :border="true" v-if="data.vip_discount_price > 0">
                    <div class="item-val">{{ formatDiscountPrice(data.vip_discount_price) }}</div>
                </u-form-item>
                <u-form-item label="备注">
                    <u-input border="none" placeholder="请输入订单备注" v-model="form.buyer_remark"
                        inputAlign="right"></u-input>
                </u-form-item>
            </u-form>
        </tz-box>

        <tz-bottom-btn v-if="!loading" type="submit" :params="{
        price: data.real_price ? data.real_price : 0,
        is_virtual_pay: isVirtualPay,
      }" @handle="submitOrder" />

        <tz-pay :visible="modal.pay" :order-no="orderNo" :money="data.real_price || 0" :is-virtual-pay="isVirtualPay" @close="cancelPay()" @alipay-guide-close="alipayGuideClose()"></tz-pay>

        <bind-mobile-modal @close="getUserData()" ref="bindMobileModal"/>

        <coupon-picker-modal :goods="pageParams.goodsList" :type="pageParams.type" @close="modal.couponPicker = false"
            @change="couponChange" :visible="modal.couponPicker" :checkedId="form.coupon_id"/>

        <tz-footer />
    </view>
</template>

<script>
    import course from "@/components/order/course.vue";
    import bindMobileModal from "@/components/modal/bind-mobile.vue";
    import couponPickerModal from "@/components/coupon/coupon-picker-modal.vue";
    var that;
    export default {
        components: {
            course,
            bindMobileModal,
            couponPickerModal,
        },
        data() {
            return {
                //表单标题宽度
                labelWidth: 70,

                modal: {
                    payType: false,
                    pay: false,
                    bindMobile: false,
                    couponPicker: false,
                },

                form: {
                    buyer_remark: "",
                    pay_type: "",
                    goodsList: [],
                    coupon_id: "",
                },
                list: [],
                pageParams: {},

                orderNo: "",

                data: {},
                userInfo: {},
                loading: false,
                address: null,
                formRequirement: {
                    loading: false,
                    hasForm: false,
                    allSubmitted: false,
                    forms: []
                },
            };
        },
        props: {
            componentsParams: {
                type: [Object],
                default: () => {
                    return {};
                },
            },
        },
        computed: {
            isVirtualPay() {
                return Number(this.data && this.data.is_virtual_pay) === 1;
            },
            // 规格含实物商品的组合订单需提交收货地址（核算接口返回 need_address）
            needAddress() {
                return Number(this.data && this.data.need_address) === 1;
            },
        },
        watch: {
            componentsParams() {
                that = this;
                this.pageParams = this.componentsParams;
                if (this.pageParams && Object.keys(this.pageParams).length > 0) {
                    this.getData();
                    // 如果是实物商品，获取默认地址
                    if (this.pageParams.type === 'physical' && !this.address) {
                        this.getDefaultAddress();
                    }
                }
            },
        },
        mounted() {
            that = this;
            
            // 监听地址选择
            uni.$on('addressSelected', (address) => {
                that.address = address;
            });

            // 监听表单填写完成返回刷新
            uni.$on('orderFormPageShow', () => {
                if (that.formRequirement.hasForm && that.pageParams.goodsList) {
                    that.checkFormRequirement();
                }
            });

            if (this.componentsParams && Object.keys(this.componentsParams).length > 0) {
                this.pageParams = this.componentsParams;
                this.getData();
                
                // 如果是实物商品，获取默认地址
                if (this.pageParams.type === 'physical') {
                    this.getDefaultAddress();
                }
            }
        },
        destroyed() {
            uni.$off('addressSelected');
            uni.$off('orderFormPageShow');
        },

        methods: {
            formatDiscountPrice(price) {
                return this.isVirtualPay ? '-' + (price || 0) + ($tools.systemConfig('coin_name') || '金币') : '-¥' + (price || 0);
            },
            // 获取默认地址
            getDefaultAddress() {
                that.$api('user.address.default').then(res => {
                    if (res.code === 1) {
                        that.address = res.data;
                    }
                });
            },

            // 检查购买课程前表单状态
            checkFormRequirement() {
                if (!that.pageParams.goodsList) return;

                // 表单为付费插件，未安装时不调用接口避免 404
                if (!that.$tools.systemConfig('app_isinstall_form')) {
                    that.formRequirement.loading = false;
                    that.formRequirement.hasForm = false;
                    return;
                }

                that.formRequirement.loading = true;
                that.$api('app.form.checkBeforeBuy', {
                    goods_list: that.pageParams.goodsList
                }).then(res => {
                    that.formRequirement.loading = false;
                    if (res.code === 1) {
                        that.formRequirement = {
                            ...that.formRequirement,
                            hasForm: res.data.has_form,
                            allSubmitted: res.data.all_submitted,
                            forms: res.data.forms
                        };
                    }
                }).catch(() => {
                    that.formRequirement.loading = false;
                });
            },

            // 跳转到表单填写页
            goFillForm() {
                const forms = (that.formRequirement.forms || []).slice();
                if (!forms.length) {
                    uni.showToast({ title: '暂无可填写的表单', icon: 'none' });
                    return;
                }
                // 优先跳转未提交的表单，否则跳转第一个已提交的（查看/修改）
                const target = forms.find(f => !f.is_submitted) || forms[0];
                if (!target || !target.form_id) {
                    uni.showToast({ title: '表单数据异常', icon: 'none' });
                    return;
                }

                let url = `/pages/app/form/submit/submit?id=${target.form_id}&from=order`;
                if (target.is_submitted && target.log_id) {
                    url += `&log_id=${target.log_id}`;
                }
                uni.navigateTo({
                    url,
                    fail(err) {
                        uni.showToast({ title: '跳转失败：' + (err && err.errMsg || ''), icon: 'none' });
                    }
                });
            },
            
            // 选择地址
            selectAddress() {
                that.$nav.to('/pages/user/address/list/list?select=1');
            },

            getData() {
                this.loading = true;
                that.getUserData();
                var form = {
                    goodsList: that.pageParams.goodsList,
                    coupon_id: that.form.coupon_id,
                };

                if (that.pageParams.type) {
                    form.order_type = that.pageParams.type;
                }

                if (that.pageParams.live_id) {
                    form.live_id = that.pageParams.live_id;
                }

                if (that.pageParams.live_goods_action_id) {
                    form.live_goods_action_id = that.pageParams.live_goods_action_id;
                }

                that.$api("order.calculate", form).then((res) => {
                    this.loading = false;
                    if (res.code === 1) {
                        that.data = res.data;
                        // 规格含实物商品的组合订单：预载默认收货地址
                        if (that.needAddress && !that.address) {
                            that.getDefaultAddress();
                        }
                        // 检查购买课程前表单
                        that.checkFormRequirement();
                    } else if (res.code === 401) {
                        // 登录态失效，全局拦截器已弹出登录提示并引导跳转登录页，此处不再重复提示或返回
                    } else {
                        uni.showModal({
                            title: "提示",
                            content: res.msg,
                            success: function (res) {
                                that.$nav.back();
                            },
                        });
                    }
                });
            },

            /**
             * 优惠券选中
             * @param {*} id 用户优惠券 id
             */
            couponChange(id) {
                this.form.coupon_id = id;
                this.modal.couponPicker = false;
                this.getData();
            },

            /**
             * 取消支付
             * 跳转到订单详情页面
             */
            cancelPay() {
                if (that.pageParams.live_id) {
                    this.modal.pay = false;
                    return false;
                }

                uni.redirectTo({
                    url: "/pages/order/detail/detail?order_no=" + this.orderNo,
                });
            },

            /**
             * 支付宝引导弹窗关闭
             * 跳转到订单详情页面
             */
            alipayGuideClose() {
                this.modal.pay = false;
                uni.redirectTo({
                    url: "/pages/order/detail/detail?order_no=" + this.orderNo,
                });
            },

            //展示弹窗
            showModal(type) {
                that.modal[type] = !that.modal[type];
            },
            getUserData() {
                that.$api("user.info.index", {}).then((res) => {
                    if (res.code === 1) {
                        that.userInfo = res.data;
                    }
                });
            },
            //提交订单
            submitOrder() {
                // 购买前表单校验
                if (that.formRequirement.hasForm && !that.formRequirement.allSubmitted) {
                    uni.showModal({
                        title: '提示',
                        content: '请先完成购买前表单',
                        showCancel: false
                    });
                    return false;
                }

                //判断是否绑定手机号
                if (
                    that.$tools.systemConfig("bind_mobile_modal") == "open" &&
                    !that.userInfo.mobile
                ) {
                    uni.showModal({
                        title: "提示",
                        content: "请先绑定手机号",
                        showCancel: false,
                        success: function (res) {
                            that.$refs.bindMobileModal.showModal();
                        }
                    });
                    return false;
                }

                uni.showLoading({
                    title: "正在提交订单",
                });

                that.form.goodsList = that.pageParams.goodsList;

                if (that.pageParams.type) {
                    that.form.order_type = that.pageParams.type;
                }
                
                // 实物商品或含实物商品的组合订单，校验地址
                if (that.pageParams.type === 'physical' || that.needAddress) {
                    if (!that.address) {
                        uni.hideLoading();
                        uni.showToast({
                            title: '请选择收货地址',
                            icon: 'none'
                        });
                        return false;
                    }
                    that.form.address_id = that.address.id;
                }

                if (that.pageParams.live_id) {
                    that.form.live_id = that.pageParams.live_id;
                }

                if (that.pageParams.live_goods_action_id) {
                    that.form.live_goods_action_id = that.pageParams.live_goods_action_id;
                }

                //创建订单 拿到订单号跳到订单详情页面
                that.$api("order.create", that.form).then((res) => {
                    uni.hideLoading();
                    if (res.code === 1) {
                        that.orderNo = res.data.order_no;

                        if (res.data.status == "unpaid") {
                            that.showModal("pay");
                        } else {
                            that.$nav.to(
                                "/pages/public/result/result?order_no=" + res.data.order_no,
                                "local",
                                "redirectTo"
                            );
                        }
                    } else if (res.code === 401) {
                        // 登录态失效，全局拦截器已弹出登录提示并引导跳转登录页，此处不再重复提示
                    } else {
                        uni.showModal({
                            title: "提示",
                            content: res.msg,
                            showCancel: false,
                            success: function (res) {
                                // that.$nav.back();
                            },
                        });
                    }
                });
            },
        },
        onLoad() {
            that = this;
        },
    };
</script>

<style scoped>
.container{
    padding: 10px;
    background: rgba(250, 250, 250, 1);
}
    ::v-deep .u-form-item__body {
        padding: 0 !important;
    }

    .total-box {
        text-align: right;
        color: #4e5969;
        font-size: 13px;
    }

    .total-box .price {
        color: #f53f3f;
        font-weight: 700;
        font-size: 18px;
    }

    .total-box .unit {
        font-size: 13px;
        margin-right: 2px;
    }

    ::v-deep .u-form-item__body__left__content__label,
    ::v-deep .u-cell__title-text--large,
    ::v-deep .u-cell__value--large {
        font-size: 14px !important;
    }

    .item-val {
        font-size: 14px;
        color: #303133;
        height: 40px;
        line-height: 40px;
        width: 100%;
        text-align: right;
        color: #f53f3f;
        font-weight: 600;
    }

    /* #ifdef MP */
    .u-form-item {
        height: 40px;
        line-height: 40px;
    }

    /* #endif */

    .coupon-tag {
        background: url(/static/image/coupon-tag-bg.png);
        margin-right: 8px;
        height: 22px;
        background-size: 100% 100%;
        line-height: 22px;
        display: inline-block;
        padding: 0 10px;
        font-size: 12px;
        color: #ff781f;
    }

    .input-item {
        width: 100%;
        text-align: right;
        color: #303133;
        font-size: 14px;
        /* #ifdef MP */
        height: 24px;
        line-height: 24px;
        /* #endif */

        /* #ifndef MP */
        height: 40px;
        line-height: 40px;
        /* #endif */
        color: #ff781f;
    }

    .address-card {
        background-color: #fff;
        padding: 16px;
        margin-bottom: 10px;
        position: relative;
        overflow: hidden;
    }
    
    .address-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .address-info {
        flex: 1;
        margin-right: 12px;
    }
    
    .user-info {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .user-info .name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-right: 12px;
    }
    
    .user-info .mobile {
        font-size: 14px;
        color: #666;
    }
    
    .address-text {
        font-size: 14px;
        color: #333;
        line-height: 1.5;
    }
    
    .address-empty {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
    }
    
    .add-address-btn {
        display: flex;
        align-items: center;
    }
    
    .add-text {
        font-size: 15px;
        color: #333;
        margin-left: 8px;
    }
    
    .address-line {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: repeating-linear-gradient(
            -45deg,
            #ff6c6c 0,
            #ff6c6c 10px,
            #fff 10px,
            #fff 20px,
            #3c9cff 20px,
            #3c9cff 30px,
            #fff 30px,
            #fff 40px
        );
    }

    .form-requirement-card {
        background-color: #fff;
        padding: 14px 16px;
    }
    
    .form-requirement-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .form-requirement-title {
        font-size: 14px;
        color: #303133;
    }
    
    .form-requirement-status {
        flex: 1;
        text-align: right;
        font-size: 14px;
        color: #ff781f;
        margin-right: 4px;
    }
    
    .form-requirement-status.submitted {
        color: #999;
    }
</style>
