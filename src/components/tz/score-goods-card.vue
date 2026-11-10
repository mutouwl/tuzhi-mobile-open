<template>
    <div :class="[
        'scg-card',
        { 'scg-card-round': round, 'scg-card-border': border }
    ]" :style="{
    'margin-bottom': margin + 'px'
}" @click="openDetail">
        <!-- 骨架档（M16）：与真实卡同一只外壳、同一套内衬，只把会变的那几格盖成灰块，
             调用页 `:skeleton="true"` 铺几张即可，页面不再抄一份卡片尺寸 -->
        <template v-if="skeleton">
            <div class="scg-cover">
                <div class="scg-sk-cover"></div>
            </div>
            <div class="scg-info">
                <div class="scg-sk-title"></div>
                <div class="scg-sk-price"></div>
                <div class="scg-foot">
                    <div class="scg-sk-redeemed"></div>
                    <div class="scg-sk-btn"></div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="scg-cover">
                <!-- 封面：主图 `aspectFit` 整张可见（参照图两张卡都是「整图 + 左右同色带」不是裁切），
                     两侧空档由同一张放大 1.5 倍 + 12px 模糊的底图填满（与 tz-physical-goods 的 .back-img 同档）。
                     两枚都走 `<image>` 并挂 @error：背景图没有「加载失败」这一档（M65） -->
                <template v-if="coverSrc">
                    <image class="scg-cover-bg" :src="coverSrc" mode="aspectFill" @error="onCoverError" />
                    <image class="score-cover-img" :src="coverSrc" mode="aspectFit" @error="onCoverError" />
                </template>
                <!-- 本来就没配图：浅灰占位 + 图片图标，与「配了图取不到」两档分开（M65③） -->
                <div class="scg-placeholder" v-else>
                    <tz-icon name="picture" :size="20" color="#C9CDD4" />
                </div>
                <!-- 类型角标：后端 `type_label` 优先，老数据回落 $t(type)；取不到时整枚不出，
                     不摆一枚空药丸 -->
                <div class="scg-type" v-if="displayType">
                    <span>{{ displayType }}</span>
                </div>
            </div>
            <div class="scg-info">
                <div class="scg-title">{{ name }}</div>
                <!-- 价格行：积分在前（主）、划线原价在后（次），与参照图同一顺序 -->
                <div class="scg-price">
                    <span class="scg-score">{{ score }}</span>
                    <span class="scg-unit">积分</span>
                    <span class="scg-marking" v-if="marking > 0">¥{{ markingText }}</span>
                </div>
                <div class="scg-foot">
                    <!-- 「已兑换 N」由 /marketing/score 的「展示兑换量」开关控制：关闭时整行不出文字，
                         但这一格保留占位（`visibility: hidden`），右侧「立即兑换」的位置不动 -->
                    <span class="scg-redeemed" :class="{ 'scg-redeemed-off': !showRedeemed }">已兑换{{ redeemed }}</span>
                    <!-- 按钮包一层 `@click.stop`：按钮点自己那一档（进商品详情），不连带触发整卡。
                         形状走登记组件 `tz-button` 的 `warning` 档（浅橙底 + 橙字，与参照图同一配色）＋
                         4px 圆角（M17 / 硬约束 12 禁止手写胶囊），尺寸取列表卡内主操作那一档 -->
                    <view class="scg-redeem" @click.stop>
                        <tz-button type="warning" size="small" text="立即兑换" @click="openDetail" />
                    </view>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
import { mpKey } from '@/common/utils/mp-data-key.js';
export default {
// #ifdef MP-TOUTIAO
    i18n,
// #endif
    components: {},
    data() {
        return {
            // 封面加载失败标记（键 = mpKey(地址)）与全站默认商品图（2026-10-29，口径 M65）
            coverErrors: {},
            defaultCover: '/static/image/default-goods.jpg'
        }
    },
    computed: {
        /** 封面真正摆出去的那一张：地址为空返回空串（走浅灰占位），加载失败换默认商品图 */
        coverSrc() {
            const url = String(this.cover || '');
            if (!url) { return ''; }
            return this.coverErrors[mpKey(url)] ? this.defaultCover : url;
        },
        /** 角标：后端下发的 type_label 优先，老数据回落 $t(type) */
        displayType() {
            return this.typeLabel || this.$t(this.type || 'course');
        },
        /** 划线原价（新字段 priceMarking，老调用点仍可用 price_marking） */
        marking() {
            const value = Number(this.priceMarking || this.price_marking || 0);
            return value > 0 ? value : 0;
        },
        /** 划线原价按两位小数显示（参照图 ¥100.00 / ¥1.00，后端回的是数值 100 / 1） */
        markingText() {
            return this.marking.toFixed(2);
        }
    },
    props: {
        // 积分商品行 id（2026-11-08 九类通用；老课程链没有时回落纯课程路径）
        scoreGoodsId: {
            type: [String, Number],
            default: 0
        },
        // 商品大类（course/physical/...）
        goodsType: {
            type: String,
            default: 'course'
        },
        // 课程细分（article/video/...）
        subType: {
            type: String,
            default: ''
        },
        itemId: {
            type: [String, Number],
            default: ''
        },
        name: {
            type: [String, Number],
            default: ''
        },
        type: {
            type: [String, Number],
            default: ''
        },
        typeLabel: {
            type: String,
            default: ''
        },
        cover: {
            type: [String, Number],
            default: ''
        },
        score: {
            type: [String, Number],
            default: ''
        },
        // 已兑换件数（后端 `redeemed`，取积分商品行的 sales，不是底层商品的销量）
        redeemed: {
            type: [String, Number],
            default: 0
        },
        // 是否显示「已兑换 N」：/marketing/score 的「展示兑换量」开关，由调用点从配置下发；
        // 缺省 true（显示），老调用点一字不用改
        showRedeemed: {
            type: [Boolean, Number, String],
            default: true
        },
        priceMarking: {
            type: [String, Number],
            default: ''
        },
        // 老字段（兼容旧调用点）
        price_marking: {
            type: [String, Number],
            default: ''
        },
        // 是否有圆角
        round: {
            type: [Boolean, Number],
            default: true
        },
        border: {
            type: [Boolean, Number],
            default: false
        },
        // 卡间距
        margin: {
            type: Number,
            default: 12
        },
        // 骨架档：只出灰块，不出真实卡（见模板顶部注释）
        skeleton: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        openDetail() {
            // 骨架卡没有商品可进，留一个点了没反应的整卡热区就是硬约束 31② 那一族
            if (this.skeleton) { return; }
            const url = this.$nav.scorePath(
                this.goodsType,
                this.subType,
                this.itemId,
                this.scoreGoodsId
            );
            if (url) {
                this.$nav.to(url, 'local');
            }
        },
        /** 图片 `@error` 回调会写到 data 上，入口先过「已销毁」闸门（M26②） */
        gone() {
            return this._isDestroyed === true || this._isBeingDestroyed === true;
        },
        /** 封面取不到（地址为空或加载失败）：记下这一张并让模板换默认商品图（M65） */
        onCoverError() {
            if (this.gone()) { return; }
            const url = String(this.cover || '');
            if (url) { this.$set(this.coverErrors, mpKey(url), true); }
        }
    },
    watch: {
    },
    mounted() {
    }
}
</script>

<style scoped>
/* 积分商品卡（2026-11-08 按用户给定参照图复刻几何）
   结构 = 左封面（124×94，含两侧模糊补底与右下类型角标）+ 右栏三段
   （标题 / 积分 + 划线原价 / 已兑换 + 立即兑换）。
   卡高由封面 94 + 上下内衬 8 定死，不按标题行数预留空档（硬约束 18）。
   类名统一 `scg-` 前缀：`course-mini.vue` 等组件的样式块未加 scoped，
   用 `.course-item-box` 这类通用名会与本卡互相覆盖（M11/M12）。 */
.scg-card {
    position: relative;
    display: flex;
    align-items: stretch;
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    background-color: #fff;
    overflow: hidden;
}

.scg-card-round {
    border-radius: 8px;
}

.scg-card-border {
    border: 1px solid #efefef;
}

.scg-card:last-child {
    margin-bottom: 0;
}

/* 封面：参照图实测 124×94（含两侧模糊补底色带），圆角 6，右下角压类型角标。
   卡高 110 = 封面 94 + 上下内衬各 8，两枚卡间距 12（均按参照图逐像素量出） */
.scg-card .scg-cover {
    position: relative;
    flex-shrink: 0;
    width: 124px;
    height: 94px;
    border-radius: 6px;
    overflow: hidden;
    background: #F2F3F5;
}

/* 两侧补底：同一张封面放大 1.5 倍再模糊（与 `components/tz/physical-goods.vue`
   的 `.back-img` 逐值同档），主图 aspectFit 留出的空档由它填满 */
.scg-card .scg-cover .scg-cover-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scale(1.5);
    filter: blur(12px);
}

.scg-card .scg-cover .score-cover-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* 无封面占位：浅灰底 + 图片图标（「本来没配图」这一档，与失败档分开） */
.scg-card .scg-cover .scg-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F2F3F5;
}

/* 类型角标：压在封面右下角，半透明深灰底 + 白字。
   **不照抄参照图那一版**：参照图的角标只有 13px 高，而 10px 汉字的行盒约 14px，
   字的下半截被底片裁掉了（「显示不完整」）。这里改成「底片随字走」：
     · 不给死高度，用上下各 3px 内衬把底片撑起来；
     · `display:flex` + `align-items:center` 让行盒在底片内垂直居中，
       **不靠 `line-height` 定高**——那正是原来「文字偏下」的成因
       （行盒 14px 塞进 13px 底片时上留 2、下溢出 3，读起来就是压在底边上）。
   行高取 11px（= 10px 字身 + 1px）是**按字面墨迹实测出来的**：屏幕上 CJK 字身只有 9px，
   上下余量 4/4 才是真居中；`line-height:1` 会得到 4/3（偏下 1px），
   再往上调 0.5px 会被栅格化吃掉、调 1px 又反过来偏高。 */
.scg-card .scg-cover .scg-type {
    position: absolute;
    right: 6px;
    bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 5px;
    box-sizing: border-box;
    border-radius: 3px;
    background: rgba(0, 0, 0, .45);
}

.scg-card .scg-cover .scg-type span {
    color: #fff;
    font-size: 10px;
    /* 行高按实测取值（见上）：让字面墨迹在底片内上下各留 4px */
    line-height: 11px;
    /* 类型名不折行、不裁字（最长「组合商品 / 教务套餐」4 字 ≈ 40px，远小于封面 124） */
    white-space: nowrap;
}

/* 右栏：标题在上、价格居中、底部那行（已兑换 + 按钮）贴卡底。
   三段纵向位置按参照图逐行量出来（卡高 110 = 内衬 8×2 + 封面 94；
   正文行盒顶贴 5px，标题字身落在 17.3 / 价格字身落在 53.5 那一档） */
.scg-card .scg-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    padding: 5px 0 0 14px;
    overflow: hidden;
}

.scg-card .scg-info .scg-title {
    color: #1D2129;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.scg-card .scg-info .scg-price {
    display: flex;
    align-items: baseline;
    margin-top: 15px;
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
    color: #FF7D00;
}

.scg-card .scg-info .scg-price .scg-unit {
    margin-left: 2px;
    font-size: 12px;
    font-weight: 500;
}

.scg-card .scg-info .scg-price .scg-marking {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    color: #A9AEB8;
    text-decoration: line-through;
}

/* 底部行：`margin-top: auto` 让它始终贴卡底，标题长短都不牵动它 */
.scg-card .scg-info .scg-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
}

.scg-card .scg-info .scg-foot .scg-redeemed {
    font-size: 12px;
    line-height: 18px;
    color: #86909C;
}

/* 「展示兑换量」关闭：文字不渲染但这一格继续占位（visibility 保留盒尺寸，
   不用 display:none）—— 右侧「立即兑换」因此不会跟着挪位 */
.scg-card .scg-info .scg-foot .scg-redeemed-off {
    visibility: hidden;
}

/* ===== 骨架档灰块（M16）：与真实元素逐块对齐 —— 封面块 / 标题条 / 价格条 / 已兑换条 / 按钮块。
   纵向尺寸对齐真实行盒（标题 21 / 价格 22、上距 15），否则数据回来会整体跳一格 ===== */
.scg-card .scg-cover .scg-sk-cover {
    width: 100%;
    height: 100%;
    background: #E5E6EB;
}

.scg-card .scg-info .scg-sk-title {
    width: 62%;
    height: 14px;
    margin-top: 4px;
    border-radius: 4px;
    background: #E5E6EB;
}

.scg-card .scg-info .scg-sk-price {
    width: 46%;
    height: 17px;
    margin-top: 24px;
    border-radius: 4px;
    background: #E5E6EB;
}

.scg-card .scg-info .scg-foot .scg-sk-redeemed {
    width: 58px;
    height: 12px;
    border-radius: 4px;
    background: #E5E6EB;
}

.scg-card .scg-info .scg-foot .scg-sk-btn {
    width: 86px;
    height: 27px;
    border-radius: 4px;
    background: #E5E6EB;
}
</style>
