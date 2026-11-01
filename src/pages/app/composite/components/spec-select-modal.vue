<template>
    <!--
      外壳（面板 / 头区 / 底部确认按钮）2026-10-30 收进 `components/tz/spec-popup-shell.vue`：
      实物、组合、圈子、拼团档位四只规格弹层同一份视觉（用户点名「样式要统一，最好能够做到复用」），
      正文（规格 chips / 人数档 / 内含商品）仍是本组件自己的（硬约束 11）。
    -->
    <tz-spec-popup-shell v-if="goodsInfo" :show="show" :gb-mode="gbMode" :cover="coverSrc" :gb-price="gbPrice"
        :price="priceText" :origin-price="priceText" :team-text="gbTeam" :is-virtual-pay="isVirtualPay"
        :coin-name="coinName" :sub-text="currentSpec ? currentSpec.name : '请选择规格'"
        :confirm-text="confirmText" :confirm-disabled="confirmDisabled"
        max-height="70vh" :body-scroll="true" :body-style="bodyStyle"
        @close="close" @confirm="onConfirm" @cover="previewSpecImage">
        <!-- 正文外层：拼团态的选中色挂在这一层（外壳的 `gb-mode` 不在本组件作用域里，
             插槽内容由本组件渲染 ⇒ 自己的 scoped 样式只认自己的类，见 M12） -->
        <view class="sku-body-inner" :class="{ 'sku-body-inner--gb': gbMode }">
            <!-- 规格切换 --><!-- 售罄那一档就地置灰并标「售罄」、点了不选中：库存口径是后端
                 `Composite::specStockMap()`（规格里的实物子商品还剩几件），
                 不给用户一个选完到提交才被拒的档（2026-10-29 用户点名） -->
            <view class="sku-section">
                <view class="sku-section-title">
                    <text>规格</text>
                </view>
                <view class="sku-options">
                    <view
                        class="sku-option"
                        v-for="(spec, index) in (goodsInfo.specs || [])"
                        :key="spec.id || index"
                        :class="{
                            'sku-option-active': currentSpec && currentSpec.id === spec.id && specBuyable(spec),
                            'sku-option-disabled': !specBuyable(spec)
                        }"
                        @tap="selectSpec(index)"
                    >
                        <text>{{ spec.name }}</text>
                        <text class="sku-option-off" v-if="!specBuyable(spec)">{{ specBlockText(spec) }}</text>
                    </view>
                </view>
            </view>

            <!-- 阶梯拼团：人数档就在这一步选（2026-10-29 用户点名「在这个选择商品规格弹窗里面，
                 增加这个阶梯的选择。注意，不同阶梯对应的价格不同，要进行单独适配」） -->
            <tz-gb-ladder-picker v-if="gbMode && isLadder" :activity="gb" :spec-id="gbSpecId"
                :value="ladderId" @input="ladderId = $event" />

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
        </view>
    </tz-spec-popup-shell>
</template>

<script>
import { specBlockText, specBuyable, pickSpecRow } from '@/common/utils/spec-stock.js';
import { gbSpecOf, gbPriceTextOf, gbTeamText, gbTierId, IN_TEAM_BLOCK_TEXT } from '@/common/utils/group-buy-spec.js';

export default {
    props: {
        show: { type: Boolean, default: false },
        goodsInfo: { type: Object, default: null },
        selectedSpec: { type: Object, default: null },
        /** 拼团活动本体（2026-10-29 加性）：有它 ⇒ 头部切拼团价、按钮写「立即开团」；缺省与老形态逐字相同 */
        gb: { type: Object, default: null },
        /**
         * 我在这一场拼团里已有进行中的团（2026-10-30 加性）：宿主传页面那一枚 `gbInTeam`。
         * 底栏的原价按钮已经收起，但「选择」那一行是**第二条购买入口**——只收底栏等于只把入口
         * 藏起来，从规格行照样能下原价单（用户点名「这应该是一个逻辑漏洞」）。
         * 弹窗照开（内含商品只有这里看得见），只把确认按钮换成禁用态。
         */
        inTeam: { type: Boolean, default: false }
    },
    data() {
        return {
            currentSpec: null,
            // 选中的拼团人数额（阶梯型；0 = 还没选，按这一档规格的第一档算，见 `effectiveLadderId`）
            ladderId: 0
        };
    },
    computed: {
        /** 当前规格 id（`app_composite_spec.id` 就是拼团 `spec_id`） */
        gbSpecId() {
            return Number(this.currentSpec && this.currentSpec.id) || 0;
        },
        /** 头区封面：这一档规格图 → 商品首图 → 商品封面 → 空串（灰底占位，失败档由外壳落默认商品图） */
        coverSrc() {
            if (!this.currentSpec) { return ''; }
            return this.currentSpec.image
                || (this.goodsInfo && this.goodsInfo.images && this.goodsInfo.images[0])
                || (this.goodsInfo && this.goodsInfo.cover)
                || '';
        },
        /** 普通态那一格价格（拼团态由外壳按 `gb-mode` 切到 `gbPrice`） */
        priceText() {
            return this.currentSpec ? this.currentSpec.price : 0;
        },
        /** 正文几何：与收进外壳前逐值相同（16px 内衬 + 40vh 上限） */
        bodyStyle() {
            return 'padding: 16px; max-height: 40vh; overflow-x: hidden;';
        },
        /** 这一档在拼团活动里的价行 */
        gbRow() {
            return gbSpecOf(this.gb, this.gbSpecId);
        },
        /** 是不是阶梯拼团（只有它才在弹窗里摆人数档） */
        isLadder() {
            return !!(this.gb && this.gb.type === 'ladder');
        },
        /** 实际生效的档位 id：点过就用点过的，没点过落这一档规格的第一档 */
        effectiveLadderId() {
            return gbTierId(this.gb, this.gbSpecId, this.ladderId);
        },
        /** 头区拼团价：阶梯型取「规格 + 档位」两轴的价 */
        gbPrice() {
            return gbPriceTextOf(this.gb, this.gbSpecId, this.effectiveLadderId);
        },
        gbTeam() {
            return gbTeamText(this.gb, this.gbSpecId, this.effectiveLadderId);
        },
        /** 拼团态的整块视觉开关（虚拟支付那趟不切主题，理由同实物那只） */
        gbMode() {
            return !!this.gbRow && !this.isVirtualPay;
        },
        isVirtualPay() {
            return Number(this.goodsInfo && this.goodsInfo.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
        },
        coinName() {
            return this.$tools.systemConfig('coin_name') || '金币';
        },
        /** 当前这一档还能不能买（售罄 / 限购用尽 = 不能买；判据在 `utils/spec-stock.js` 一处） */
        canBuy() {
            const ok = this.currentSpec ? specBuyable(this.currentSpec) : false;
            // 拼团那一趟：还要看这一档在活动里有没有卖完 / 限购用尽（后端 `count_max`，与拼团弹窗同一份判据）
            return ok && (!this.gbRow || specBuyable(this.gbRow));
        },
        /** 参团中 ⇒ 这一枚不许下单（文案与判据在 `utils/group-buy-spec.js` 一处，四只规格弹窗同读） */
        inTeamBlocked() {
            return !!this.inTeam;
        },
        /** 确认按钮禁用态：这一档买不了 ∨ 参团中 */
        confirmDisabled() {
            return !this.canBuy || this.inTeamBlocked;
        },
        /** 确认按钮文案（参团中优先于售罄 / 拼团两档，先说清为什么点不了） */
        confirmText() {
            if (this.inTeamBlocked) { return IN_TEAM_BLOCK_TEXT; }
            if (!this.canBuy) { return '已售罄'; }
            return this.gbMode ? '立即开团' : '立即购买';
        }
    },
    watch: {
        show(v) {
            if (v && this.goodsInfo) {
                // 默认选中跳过售罄那一档（全都卖完时仍落一档，好让按钮摆出「已售罄」禁用态）
                this.currentSpec = pickSpecRow((this.goodsInfo.specs || []), this.selectedSpec ? this.selectedSpec.id : 0);
            }
        }
    },
    methods: {
        /** 模板读点：这一档为什么不能买（空串 = 能买） */
        specBlockText(spec) { return specBlockText(spec); },
        specBuyable(spec) { return specBuyable(spec); },
        selectSpec(index) {
            const specs = (this.goodsInfo && this.goodsInfo.specs) || [];
            const spec = specs[index];
            if (!spec) return;
            // 售罄 / 限购用尽：chip 已是置灰态，这里再兜一次（历史栈 / 异步那一拍）
            if (!specBuyable(spec)) return;
            // 先置空再赋值，确保 v-for 子节点完全销毁重建，避免小程序端 patch 异常
            this.currentSpec = null;
            this.$nextTick(() => {
                this.currentSpec = spec;
                this.$emit('select', spec);
            });
        },
        onConfirm() {
            // 参团中：按钮已是禁用态，这里兜异步那一拍（活动在弹窗打开后才回包 / 历史栈）
            if (this.inTeamBlocked) {
                uni.showToast({ title: IN_TEAM_BLOCK_TEXT, icon: 'none' });
                return;
            }
            if (!this.currentSpec) {
                uni.showToast({ title: '请选择规格', icon: 'none' });
                return;
            }
            if (!specBuyable(this.currentSpec)) {
                uni.showToast({ title: '该规格已售罄', icon: 'none' });
                return;
            }
            // 第二个参数是阶梯型选中的人数额（普通购买不收，逐字不变）
            this.$emit('confirm', this.currentSpec, this.effectiveLadderId);
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
/* 面板 / 头区（封面 + 拼团专享标 + 拼团标 + 价格 + 划线原价 + N人团 + 已选）/ 底部确认按钮
   2026-10-30 收进 `components/tz/spec-popup-shell.vue`（四只规格弹层同一份，用户点名「样式要统一」）：
   这里只留**本商品自己的正文**——规格 chips、人数档、内含商品清单。 */
.sku-section { margin-bottom: 20px; }
.sku-section-title { font-size: 14px; color: #333; margin-bottom: 12px; font-weight: 500; display: flex; justify-content: space-between; align-items: center; }
.spec-count { font-size: 12px; color: #0968f6; font-weight: 400; }
.sku-options { display: flex; flex-wrap: wrap; gap: 10px; }
.sku-option { padding: 8px 16px; background-color: #F7F8FA; border-radius: 6px; font-size: 14px; color: #333; border: 1px solid transparent; }
.sku-option-active { background-color: #E8F4FF; color: #0968f6; border-color: #0968f6; }
/* 拼团态：选中规格切红系（与 group-buy-config-popup 的 `.gbc-chip--on` 同值），不再蓝红混用 */
.sku-body-inner--gb .sku-option-active { background-color: #fff7f7; color: #f53f3f; border-color: #f53f3f; }
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
/* 售罄 / 限购用尽：chip 置灰（按钮灰档在外壳里，四只弹层同一份） */
.sku-option-disabled { background-color: #F7F8FA; color: #c9cdd4; opacity: .6; }
.sku-option-off { font-size: 11px; color: #c9cdd4; margin-left: 4px; text-decoration: line-through; }
</style>