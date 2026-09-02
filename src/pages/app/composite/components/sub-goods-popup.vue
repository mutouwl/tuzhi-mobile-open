<template>
    <u-popup :show="show" @close="close" mode="bottom" :round="10" :safeAreaInsetBottom="true">
        <view class="popup-content">
            <view class="popup-header">
                <text class="popup-title">内含商品</text>
                <text class="popup-close" @tap="close"><tz-icon name="close" :size="20" color="#86909c"/></text>
            </view>
            <scroll-view class="popup-body" scroll-y>
                <view class="sub-goods-item" v-for="(item, index) in (spec && spec.items || [])" :key="index">
                    <image class="sub-goods-cover" :src="item.sub_goods_cover" mode="aspectFill">
                        <view class="type-tag">{{ typeLabel(item.sub_goods_type) }}</view>
                    </image>
                    <view class="sub-goods-info">
                        <text class="sub-goods-name">{{ item.sub_goods_name }}</text>
                        <text class="sub-goods-validity" v-if="item.validity_text">{{ item.validity_text }}</text>
                    </view>
                </view>
                <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!spec || !spec.items || !spec.items.length" text="暂无商品" />
            </scroll-view>
        </view>
    </u-popup>
</template>

<script>
export default {
    props: {
        show: { type: Boolean, default: false },
        spec: { type: Object, default: null }
    },
    methods: {
        close() { this.$emit('close'); },
        typeLabel(type) {
            const map = { course: '视频', audio: '音频', article: '图文', live: '直播', vipcard: '会员卡', exercises: '练习', physical: '实物商品' };
            return map[type] || type;
        }
    }
};
</script>

<style scoped>
.popup-content { background: #fff; border-radius: 12px 12px 0 0; }
.popup-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 10px; border-bottom: 1px solid #F7F8FA; }
.popup-title { font-size: 16px; font-weight: 600; color: #1d2129; }
.popup-body { padding: 12px 16px; max-height: 50vh; }
.sub-goods-item { display: flex; align-items: center; padding: 10px; background: #F7F8FA; border-radius: 8px; margin-bottom: 10px; }
.sub-goods-cover { width: 56px; height: 56px; border-radius: 6px; background: #e5e6eb; flex-shrink: 0; position: relative; }
.type-tag { position: absolute; bottom: 2px; right: 2px; font-size: 10px; color: #fff; background: rgba(0,0,0,.45); border-radius: 3px; padding: 0 4px; line-height: 15px; }
.sub-goods-info { flex: 1; margin-left: 12px; }
.sub-goods-name { font-size: 14px; color: #1d2129; }
.sub-goods-validity { font-size: 12px; color: #F56C6C; margin-top: 4px; display: block; }
</style>