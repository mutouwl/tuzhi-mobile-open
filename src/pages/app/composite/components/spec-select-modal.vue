<template>
    <u-popup :show="show" @close="close" mode="bottom" :closeable="true" :round="10" :safeAreaInsetBottom="true">
        <view class="sku-modal-content" v-if="goodsInfo">
            <!-- 顶部 -->
            <view class="sku-header">
                <image class="sku-image" :src="currentSpec ? (currentSpec.image || (goodsInfo.images && goodsInfo.images[0]) || goodsInfo.cover || '') : ''" mode="aspectFill" @tap="previewSpecImage" />
                <view class="sku-info">
                    <view class="sku-price">
                        <text class="price-symbol" v-if="!isVirtualPay">¥</text>
                        <text class="price-num">{{ currentSpec ? currentSpec.price : 0 }}</text>
                        <text class="coin-name" v-if="isVirtualPay">{{ coinName }}</text>
                    </view>
                    <view class="sku-text">{{ currentSpec ? currentSpec.name : '请选择规格' }}</view>
                </view>
            </view>

            <scroll-view class="sku-body" scroll-y>
                <!-- 规格切换 -->
                <view class="sku-section">
                    <view class="sku-section-title">
                        <text>规格</text>
                    </view>
                    <view class="sku-options">
                        <view
                            class="sku-option"
                            v-for="(spec, index) in (goodsInfo.specs || [])"
                            :key="spec.id || index"
                            :class="{ 'sku-option-active': currentSpec && currentSpec.id === spec.id }"
                            @tap="selectSpec(index)"
                        >
                            {{ spec.name }}
                        </view>
                    </view>
                </view>

                <!-- 内含商品 -->
                <view class="sku-section" :key="'spec-' + (currentSpec ? currentSpec.id : '')" v-if="currentSpec && currentSpec.items && currentSpec.items.length">
                    <view class="sku-section-title">内含商品</view>
                    <view class="sub-goods-list">
                        <view class="sub-goods-item" v-for="(item, idx) in currentSpec.items" :key="item.sub_goods_id + '_' + item.sub_goods_type">
                            <view class="sub-goods-row" @tap="goSubGoods(idx)">
                                <image class="sub-goods-cover" :src="item.sub_goods_cover" mode="aspectFill" />
                                <view class="sub-goods-info">
                                    <text class="sub-goods-name">{{ item.sub_goods_name }}</text>
                                    <view class="sub-goods-price-row">
                                        <text class="sub-goods-type-tag">{{ typeLabel(item.sub_goods_type) }}</text>
                                        <template v-if="item.sub_goods_price > 0">
                                            <text class="sub-goods-price" v-if="!isVirtualPay">¥{{ item.sub_goods_price }}</text>
                                            <text class="sub-goods-price" v-else>{{ item.sub_goods_price }}{{ coinName }}</text>
                                        </template>
                                        <text class="sub-goods-price free" v-else>免费</text>
                                    </view>
                                </view>
                            </view>
                            <text class="sub-goods-validity" v-if="item.validity_text">有效期：{{ item.validity_text }}</text>
                        </view>
                    </view>
                </view>
            </scroll-view>

            <!-- 底部 -->
            <view class="sku-footer">
                <button class="sku-confirm-btn" @tap="onConfirm">立即购买</button>
            </view>
        </view>
    </u-popup>
</template>

<script>
export default {
    props: {
        show: { type: Boolean, default: false },
        goodsInfo: { type: Object, default: null },
        selectedSpec: { type: Object, default: null }
    },
    data() {
        return { currentSpec: null };
    },
    computed: {
        isVirtualPay() {
            return Number(this.goodsInfo && this.goodsInfo.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
        },
        coinName() {
            return this.$tools.systemConfig('coin_name') || '金币';
        }
    },
    watch: {
        show(v) {
            if (v && this.goodsInfo) {
                this.currentSpec = this.selectedSpec || (this.goodsInfo.specs && this.goodsInfo.specs[0]) || null;
            }
        }
    },
    methods: {
        selectSpec(index) {
            const specs = (this.goodsInfo && this.goodsInfo.specs) || [];
            const spec = specs[index];
            if (!spec) return;
            // 先置空再赋值，确保 v-for 子节点完全销毁重建，避免小程序端 patch 异常
            this.currentSpec = null;
            this.$nextTick(() => {
                this.currentSpec = spec;
                this.$emit('select', spec);
            });
        },
        onConfirm() {
            if (this.currentSpec) {
                this.$emit('confirm', this.currentSpec);
            } else {
                uni.showToast({ title: '请选择规格', icon: 'none' });
            }
        },
        close() { this.$emit('close'); },
        typeLabel(type) {
            const map = { course: '视频', audio: '音频', article: '图文', live: '直播', vipcard: '会员卡', exercises: '练习', column: '专栏', physical: '实物商品' };
            return map[type] || type;
        },
        goSubGoods(idx) {
            const items = (this.currentSpec && this.currentSpec.items) || [];
            const item = items[idx];
            if (!item || !item.sub_goods_id) return;
            // 通过工具方法获取子商品详情页路径，支持 course/audio/live/article/column/exercises 等
            const url = this.$nav.getPagePath(item.sub_goods_id, item.sub_goods_type);
            if (!url) {
                uni.showToast({ title: '暂不支持的商品类型', icon: 'none' });
                return;
            }
            this.$nav.to(url);
        },
        previewSpecImage() {
            const imgUrl = (this.currentSpec && this.currentSpec.image)
                || (this.goodsInfo && this.goodsInfo.images && this.goodsInfo.images[0])
                || (this.goodsInfo && this.goodsInfo.cover)
                || '';
            if (imgUrl) {
                uni.previewImage({ urls: [imgUrl] });
            }
        }
    }
};
</script>

<style scoped>
.sku-modal-content { background-color: #fff; border-radius: 12px 12px 0 0; max-height: 70vh; }
.sku-header { display: flex; padding: 20px 16px; border-bottom: 1px solid #F7F8FA; }
.sku-image { width: 90px; height: 90px; border-radius: 8px; background-color: #F7F8FA; }
.sku-info { flex: 1; margin-left: 12px; display: flex; flex-direction: column; justify-content: center; }
.price-symbol { font-size: 12px; font-weight: 700; color: #F53F3F; }
.price-num { font-size: 24px; font-weight: 700; color: #F53F3F; margin-left: 2px; }
.coin-name { font-size: 12px; font-weight: 500; color: #F53F3F; margin-left: 2px; }
.sku-text { font-size: 13px; color: #666; margin-top: 8px; }
.sku-body { padding: 16px; max-height: 40vh; overflow-x: hidden; }
.sku-section { margin-bottom: 20px; }
.sku-section-title { font-size: 14px; color: #333; margin-bottom: 12px; font-weight: 500; display: flex; justify-content: space-between; align-items: center; }
.spec-count { font-size: 12px; color: #0968f6; font-weight: 400; }
.sku-options { display: flex; flex-wrap: wrap; gap: 10px; }
.sku-option { padding: 8px 16px; background-color: #F7F8FA; border-radius: 6px; font-size: 14px; color: #333; border: 1px solid transparent; }
.sku-option-active { background-color: #E8F4FF; color: #0968f6; border-color: #0968f6; }
.sub-goods-list { display: flex; flex-direction: column; gap: 10px; }
.sub-goods-item { background: #F7F8FA; border-radius: 8px; overflow: hidden; }
.sub-goods-row { display: flex; align-items: center; padding: 10px; }
.sub-goods-cover { width: 56px; height: 56px; border-radius: 6px; background: #e5e6eb; flex-shrink: 0; }
.sub-goods-info { flex: 1; margin-left: 10px; overflow: hidden; }
.sub-goods-name { font-size: 14px; color: #1d2129; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.sub-goods-price-row { display: flex; align-items: center; margin-top: 6px; }
.sub-goods-type-tag { font-size: 10px; color: #fff; background: rgba(0,0,0,.45); border-radius: 3px; padding: 0 4px; line-height: 16px; margin-right: 8px; }
.sub-goods-price { font-size: 14px; font-weight: 700; color: #F53F3F; }
.sub-goods-price.free { color: #0968f6; font-weight: 500; font-size: 12px; }
.sub-goods-validity { font-size: 12px; color: #86909c; padding: 0 10px 10px; display: block; }
.sku-footer { padding: 16px; border-top: 1px solid #F7F8FA; }
.sku-confirm-btn { width: 100%; height: 46px; line-height: 46px; font-weight: 500; font-size: 16px; background: #0968f6; color: #fff; border: none; padding: 0; margin: 0; }
.sku-confirm-btn::after { border: none; }
</style>