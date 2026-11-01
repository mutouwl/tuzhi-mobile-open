<template>
    <div :class="[
        'course-list-box',
        'single'
    ]">
        <!-- 骨架档（ui-baseline-mobile M16）：与真实卡同一只外壳类（卡高 80、封面 140、内衬 6/8、圆角由
             round 决定），调用页 loading 时传 :skeleton="true" 即可，页面不再抄一份卡片尺寸；
             骨架档下真实卡走空数据（rows 计算属性），两者不会同屏叠出 -->
        <div :class="[
            'course-item-box',
            {
                'course-item-box-round': round,
                'course-item-box-border': border,
            }
        ]" :style="{
    'margin-bottom': margin + 'px'
}" v-for="i in skCount" :key="'sk' + i">
            <div class="cover" :class="{ 'course-item-box-round': round }">
                <div class="mini-sk-cover"></div>
            </div>
            <div class="info">
                <!-- rows-width 用数组传值：u-skeleton 对单行列表会把「最后一行」宽度写死成 70%，传字符串不生效 -->
                <u-skeleton
                    :loading="true"
                    :animate="true"
                    :title="true"
                    title-width="85%"
                    title-height="15"
                    :rows="1"
                    :rows-width="['55%']"
                    rows-height="11"
                />
                <div class="mini-sk-price"></div>
            </div>
        </div>
        <div :class="[
            'course-item-box',
            {
                'course-item-box-round': round,
                'course-item-box-border': border,
            }
        ]" :style="{
    'margin-bottom': margin + 'px'
}" v-for="(item, index) in rows" :key="index" @click="onCard(item)">
            <!-- 封面走 `<image>` 而不是 `background-image`：背景图**没有加载失败这一档**，
                 地址写错 / CDN 掉图 / 域名没进白名单时那一格永远是白的，读起来像「图还没出来」。
                 2026-10-29 用户点名「列表中的图片如果加载失败要有默认填充的图片」——
                 失败档与全站同一张默认商品图（`package.vue` / 确认报名页 / 规格弹窗都是它），
                 真实封面沿用原来的 `background-size:100% 100%` 拉伸档（`scaleToFill` 一字不差），
                 兜底那张是 400×400 方图，按 `aspectFill` 居中裁一刀、不压扁。 -->
            <div :class="[
                'cover',
                {
                    'course-item-box-round': round
                }
            ]">
                <image v-if="item.cover && !coverFailed(item)" class="mini-cover" :src="item.cover"
                    mode="scaleToFill" @error="onCoverError(item)" />
                <image v-else-if="item.cover" class="mini-cover" :src="defaultCover" mode="aspectFill" />
                <!-- 无封面：跟「加载失败」分开——那一档是「这张卡本来就没配图」，不该画成一张假封面。
                     兜底跟 `tz-course` 同一档（浅灰底 + 图片图标，图标按 80 卡高取 24，
                     与 `checkin-list` 的小封面占位同档），有封面的调用点逐字不变 -->
                <div class="placeholder" v-else>
                    <tz-icon name="picture" :size="24" color="#C9CDD4" />
                </div>
                <div class="vip-tag" v-if="item.is_vip_goods"><span class="vip-tag-text">会员商品</span></div>
                <!-- 型别标签：调用点拿不到型别（只展示一张商品卡、没有 `type`）时整枚不出。
                     不给空值时仍摆一枚 20px 高的半透明药丸，读起来像「有一块没加载出来的标签」 -->
                <div class="type" v-if="item.type">
                    <span>{{ $t(item.type) }}</span>
                </div>
            </div>
            <div class="info">
                <div :class="[
                    'title',
                    'two-line-hidden'
                ]">
                    {{ item.name }}
                </div>
                <!-- 份数档（2026-10-28 送礼页 / 领取页）：礼单是一份 = 一个好友名额，
                     卡片右下角写「×1」比摆一个价格更像「送的是一份礼」；
                     不给 `qty` 的调用点仍走下面那套价格档，逐字不变 -->
                <div class="qty" v-if="item.qty">×{{ item.qty }}</div>
                <div class="price" v-else>
                    <template v-if="item.pay_type">
                        <template v-if="item.pay_type == 'free'">
                            <span class="unit">免费</span>
                        </template>
                        <template v-if="item.pay_type == 'student'">
                            <span class="unit">指定学员</span>
                        </template>
                        <template v-if="item.pay_type == 'bind_course'">
                            <span class="unit">绑定课程</span>
                        </template>
                        <template v-if="item.pay_type == 'password'">
                            <span class="unit">密码兑换</span>
                        </template>
                        <template v-if="item.pay_type == 'pay'">
                            <template v-if="isVirtualPay(item)">
                                <span class="price-value">{{ item.price }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
                            </template>
                            <template v-else>
                            <span class="unit">¥ </span> {{ item.price }}
                            <span class="marking" v-if="item.price_marking">¥{{ item.price_marking }}</span>
                            </template>
                        </template>
                    </template>

                </div>
            </div>
            <!-- 件数档（2026-10-31 提交订单页）：结算页要能看出「这一件买了几份」，与价格同一行、贴卡片右下角。
                 **挂在卡片根节点上、不挂在 `.info` 里**：`.info` 那一列是 `width: calc(100% - 110px)`，
                 与 140 宽的封面加起来超过卡片、由 flex 收缩分掉，它的右缘并不恒等于卡片的右缘
                 ⇒ 贴信息列右缘的绝对定位会跟着封面那一档飘；挂在卡片上，左下单价、右下件数各占一端。
                 给了 `item.qty` 的调用点仍走上面那套（份数占价格那一格），两枚互斥、都可缺省。 -->
            <div class="count" v-if="item.count">×{{ item.count }}</div>
        </div>
    </div>
</template>

<script>
// 封面地址这类外部串作 data 的键必过 mpKey（M27/硬约束 25）：模板看不到模块级 import，
// 所以模板那一侧只调 `coverFailed(item)` 这个方法来查表，键的转换只在本文件里做一次
import { mpKey } from '@/common/utils/mp-data-key.js';

export default {
    components: {},
    data() {
        return {
            // 封面加载失败标记（键 = mpKey(地址)）：失败那一档换成下面这张默认商品图，
            // 与套餐卡 / 确认报名页 / 规格选套餐弹窗同一张（全站只有这一份默认封面图）
            coverErrors: {},
            defaultCover: '/static/image/default-goods.jpg',
        }
    },
    props: {
        list: {
            type: [Object, Array],
            default: () => {
                return [];
            }

        },
        //是否有圆角
        round: {
            type: [Boolean, Number],
            default: false
        },

        //单列 双列
        type: {
            type: String,
            default: 'single'
        },
        border: {
            type: [Boolean, Number],
            default: false
        },
        //间距
        margin: {
            type: Number,
            default: 10
        },
        //骨架档：只出灰块，不出真实卡（见模板顶部注释）
        skeleton: {
            type: Boolean,
            default: false
        },
        //骨架档铺几张卡
        skeletonCount: {
            type: Number,
            default: 4
        },
        // 卡片是否可点进商品详情（默认 true，既有调用点一字未动）。
        // 只展示的场景（领取页那种拿不到商品 id 的卡）传 false：`$nav.to()` 对空地址是静默 return，
        // 留一个点了没反应的整卡热区就是硬约束 27② 那一族
        clickable: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        // 骨架档铺几张灰卡（非骨架档为 0，模板里 v-for 一个数即按 1..N 出条目）
        skCount() {
            return this.skeleton ? this.skeletonCount : 0;
        },
        // 真实卡数据：骨架档一律出空，避免骨架与真实卡同屏
        rows() {
            return this.skeleton ? [] : this.list || [];
        },
    },
    methods: {
        /** 点卡片进商品详情：只展示档（`clickable=false`）整卡不响应，也不给一条点了没反应的路 */
        onCard(item) {
            if (!this.clickable) { return; }
            this.detail((item || {}).id, (item || {}).type);
        },
        detail(id, type) {
            this.$nav.to(this.$nav.getPagePath(id, type));
        },
        isVirtualPay(item) {
            return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
        },
        /** 图片 `@error` 回调会写到 data 上，入口先过「已销毁」闸门（M26②：晚到的回调打到已出栈的
            页面上，一次 setData 抛错就能把整条调度队列拖死；这一层只是兜底，主修法在 main.js） */
        gone() {
            return this._isDestroyed === true || this._isBeingDestroyed === true;
        },
        /** 这张封面是不是已经加载失败过：表按 mpKey(地址) 存，读写两头同一口径
            （只转写点 = 兜底图静默失效，M27） */
        coverFailed(item) {
            const cover = (item || {}).cover;
            return !!cover && !!this.coverErrors[mpKey(cover)];
        },
        /** 封面加载失败：记下这一张，模板随即换成默认商品图（`item.cover` 为空的另一档不进这里，
            那一档走浅灰占位——「本来没配图」与「配了图取不到」是两件事） */
        onCoverError(item) {
            if (this.gone()) { return; }
            const cover = (item || {}).cover;
            if (cover) { this.$set(this.coverErrors, mpKey(cover), true); }
        }
    },

    watch: {
    }
}
</script>
<style>
.course-list-box.single .course-item-box {
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    margin-bottom: 10px;
    overflow: hidden;
    box-sizing: border-box;
    /* 件数那一格（`.count`）以整张卡为定位基准（见模板上那一段说明） */
    position: relative;
}


.course-list-box.single .course-item-box .info {
    width: calc(100% - 110px);
    padding: 6px 8px;
    overflow: hidden;
    position: relative;
}


.course-list-box.single .course-item-box .cover {
    height: 100%;
    width: 140px;
    position: relative;
}

/* 无封面/加载失败占位：选择器与声明都与 `tz-course` 那一份逐字相同，
   同页两型并存时不会互相拨动（图标大小由调用处那一档给） */
.course-list-box .cover {
    overflow: hidden;
}

/* 封面图（2026-10-29）：铺满 `.cover` 的盒子，几何与原来那张 `background-size:100% 100%`
   完全一致（`scaleToFill` 那一档），换成 `<image>` 只为拿到 `@error` 这条失败回音 */
.course-list-box .cover .mini-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.course-list-box .cover .placeholder {
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

.course-list-box.single .course-item-box .info .price {
    position: absolute;
    bottom: 4px;
    left: 8px;
    font-weight: 700;
    font-size: 14px;
    color: #F53F3F;
}

.course-list-box.single .course-item-box .info .price .price-value {
    font-size: 14px;
    font-weight: 700;
}

.course-list-box.single .course-item-box .info .price .coin-name {
    font-size: 10px;
    font-weight: 500;
    margin-left: 2px;
}

/* 份数档：与价格同一格（右下角、距底 4 / 距左 8），字号取 §1 的 12 档、灰色；
   礼单卡片只表达「这一份」，不把购买价再摆一遍（价格是购买单那一侧的事实） */
.course-list-box.single .course-item-box .info .qty {
    position: absolute;
    bottom: 4px;
    left: 8px;
    font-size: 12px;
    line-height: 18px;
    color: #86909C;
}

/* 件数档：与价格同一行、贴卡片右下角（左下是单价、右下是「×N」，两枚分列两端，长价格也压不到它）。
   定位基准是整张卡（`.course-item-box` 已给 `position: relative`），不跟着信息列那档宽度走（见模板注释） */
.course-list-box.single .course-item-box .count {
    position: absolute;
    bottom: 4px;
    right: 8px;
    font-size: 12px;
    line-height: 18px;
    color: #86909C;
}



.course-item-box-round {
    border-radius: 10px;
}

.course-item-box-border {
    border: 1px solid #F0F3F5;
}

.course-item-box:last-child {
    margin-bottom: 0;
}


.course-item-box .info .title {
    color: #1D2129;
    font-size: 14px;
    font-weight: 500;
}


.course-item-box .info .price .unit,
.course-item-box .info .price .marking {
    font-size: 12px;
}

.course-item-box .info .price .marking {
    color: #C9CDD4;
    font-weight: 400;
    margin-left: 10px;
    text-decoration: line-through;
}


.course-item-box .cover .type {
    position: absolute;
    bottom: 4px;
    right: 4px;
    height: 20px;
    border-radius: 0.08rem;
    padding: 0px 6px;
    box-sizing: border-box;
    line-height: 18px;
    background: rgba(0, 0, 0, .05);
    border-radius: 4px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

.course-item-box .cover .type span {
    color: #fff;
    font-weight: 400;
    font-size: 10px;
}


  .vip-tag{
    position: absolute;
    top: 0;
    left: 0;
    display: -webkit-flex;
    display: flex;
    padding: 2px 4px;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: center;
    align-items: center;
    background: linear-gradient(275deg, #F2C89F 1.39%, #F9E5DB 100%);
    border-radius: 0 0 4px;
    z-index: 1;
}
.vip-tag .vip-tag-text{
    color: #66351f;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
}

/* ===== 骨架档灰块（M16）：封面块铺满真实 .cover 的盒子，价格块对齐左下角价格位（真实价格 bottom 4 / 14px） ===== */
.mini-sk-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #e5e6eb;
}

.mini-sk-price {
    position: absolute;
    bottom: 6px;
    left: 8px;
    width: 60px;
    height: 14px;
    border-radius: 4px;
    background: #e5e6eb;
}
</style>

