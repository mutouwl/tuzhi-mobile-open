<template>
    <!--
      商详页拼团价横幅（小鹅通图 2 的那一块：左「¥ 拼团价 + N人拼团价白标 + 划线原价」，
      右「多人拼团 + 天/时分秒分段倒计时」）。

      **为什么单独成一枚组件（2026-10-27 抽出来的）**：横幅的配色 / 价格口径 / 倒计时三段与
      商详页其它块不是一回事，抽出来只留一份判据（硬约束 11）。
      **落点（2026-10-30 用户点名「gba-rule 拼团玩法都应该放在 gba-banner 下面，也包括正在拼团的列表，
      让拼团连成一个整体」+「上下挨在一起，不要拆分放」）**：横幅只由拼团区
      `group-buy-area.vue` 在**自己那张卡的第一行**渲染，紧跟邀新提示 / 档位 / 拼团玩法 / 正在拼团；
      宿主不再把横幅提到商详卡的价格格（`hide-banner` 那种提法已删），原价行回宿主原位。

      计时的归属：拼团区那一份 `now` 管「会话内到期 ⇒ 整区收掉 + 底栏入口撤掉」，
      横幅这一份只管自己那一格每秒钟的数字（同 `group-buy-popup` 的 `now/timer` 档），
      两边各自一处定时器、都按已销毁闸门收（硬约束 23）。

      阶梯型（2026-10-25）：展示价与白标都取**价最低的那一档**（人数最多），价格后面跟「起」
      —— 小鹅通「拼团¥78.00 起」就是这一档口径（取首档会把门槛价写高）。
      预热态（2026-10-27）：左侧同形，右侧换「距活动开始」并倒数到 `start_time`。
    -->
    <view class="gba-banner">
        <view class="gba-main">
            <view class="gba-price-line">
                <text class="gba-yen" v-if="!isVirtualPay">¥</text>
                <text class="gba-price">{{ priceText(displayPrice) }}</text>
                <text class="gba-coin" v-if="isVirtualPay">{{ coinName }}</text>
                <text class="gba-rise" v-if="displayRise">起</text>
                <text class="gba-tag">{{ displayTeamNum }}人拼团价</text>
            </view>
            <text class="gba-origin" v-if="!isVirtualPay">¥{{ priceText(activity.origin_price) }}</text>
            <text class="gba-origin" v-else>{{ priceText(activity.origin_price) }}{{ coinName }}</text>
        </view>
        <view class="gba-side">
            <!-- 类型词（2026-10-29 用户点名实物商详「拼团的价格卡都是显示多人拼团，并不显示
                 阶梯和邀新的类型」）：三档只由 `typeTitle` 判一次，两个宿主同口径 -->
            <text class="gba-side-title">{{ typeTitle }}</text>
            <view class="gba-count" v-if="countLeft > 0">
                <text class="gba-days">{{ countdown.days }}天</text>
                <text class="gba-time">{{ countdown.hh }}</text>
                <text class="gba-colon">:</text>
                <text class="gba-time">{{ countdown.mm }}</text>
                <text class="gba-colon">:</text>
                <text class="gba-time">{{ countdown.ss }}</text>
                <text class="gba-after">{{ isPreheat ? '后开始' : '后结束' }}</text>
            </view>
            <text class="gba-ended" v-else>{{ isPreheat ? '活动已开始' : '活动已结束' }}</text>
        </view>
    </view>
</template>

<script>
const pad2 = (n) => String(n).padStart(2, '0');

export default {
    name: 'GroupBuyBanner',
    props: {
        /** 活动本体（`group_buy.activity.detail` 的回体，由拼团区原样经 `ready` 上抛给宿主） */
        activity: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            // 倒计时（毫秒）：每秒续跑，已销毁闸门见 `tick()`
            now: Date.now(),
            timer: null,
        };
    },
    computed: {
        /** 预热态（2026-10-27）：活动还没开始，但商家开了「活动预热」⇒ 右侧倒数到开始时刻 */
        isPreheat() {
            return !!(this.activity && this.activity.state === 'not_start');
        },
        /**
         * 微信小程序虚拟支付（2026-10-27 用户点名「拼团和送好友对应的支付都要适配小程序的虚拟支付」）：
         * 活动回体里的 `is_virtual_pay`（后端按商品细分档 + 平台 + 配置三档判好），
         * 为真时价格那一格的单位换成代币名 —— 数字侧后端已按兑换比例换算过（`GoodsArea::of`），
         * 本组件只负责别再写死 ￥。
         */
        isVirtualPay() {
            return Number(this.activity && this.activity.is_virtual_pay) === 1;
        },
        coinName() {
            return (this.$tools && this.$tools.systemConfig && this.$tools.systemConfig('coin_name')) || '金币';
        },
        /**
         * 横幅右上角的类型词（2026-10-29 用户点名 `/pages/app/physical/detail/detail?id=2`
         * 「拼团的价格卡都是显示这个多人拼团，并不显示这个阶梯和邀新的类型」）：
         *  - 阶梯型（`type=ladder`）→「阶梯拼团」；
         *  - 邀新型（`type=invite`）→「邀新拼团」；
         *  - 普通型（`type=normal`，也是缺省）→ 仍写竞品那句「多人拼团」。
         *
         * **普通型不写后端 `Activity::typeList()` 里的「普通拼团」**：那一份是给后台下拉用的词条，
         * 「普通」在购买页读起来像「还有不普通的」，竞品图 2 那一格本来就是「多人拼团」。
         * 三档只在这一处判 —— 九类商详页挂的是同一份拼团区，逐类自动同口径。
         */
        typeTitle() {
            const t = (this.activity && this.activity.type) || '';
            if (t === 'ladder') { return '阶梯拼团'; }
            if (t === 'invite') { return '邀新拼团'; }
            return '多人拼团';
        },
        /** 阶梯型里「价最低」的那一档（= 小鹅通横幅那个「¥X 起」的 X）；
         *  同价时取人数多的那一档（门槛更宽的一档先让用户看到） */
        lowestLadder() {
            const rows = (this.activity && this.activity.ladder) || [];
            if (!rows.length) { return null; }
            return rows.reduce((a, b) => {
                const pa = Number(a.price) || 0;
                const pb = Number(b.price) || 0;
                if (pb !== pa) { return pb < pa ? b : a; }
                return (Number(b.invite_num) || 0) > (Number(a.invite_num) || 0) ? b : a;
            }, rows[0]);
        },
        /** 界面展示价：普通/邀新型吃活动价；阶梯型取**最低价那一档**（不是首档——首档是人数最少、
         *  价格最高的那一档，横幅写它会把这个活动的参与门槛价写高，与竞品「起」价口径相反） */
        displayPrice() {
            if (this.activity && this.activity.type === 'ladder' && this.lowestLadder) {
                return Number(this.lowestLadder.price) || 0;
            }
            return Number(this.activity && this.activity.price) || 0;
        },
        /** 白标上的「N人拼团价」：阶梯型取最低价那一档的人数，其余取成团人数 */
        displayTeamNum() {
            if (this.activity && this.activity.type === 'ladder' && this.lowestLadder) {
                return Number(this.lowestLadder.invite_num) || 0;
            }
            return Number(this.activity && this.activity.team_num) || 0;
        },
        /**
         * 价格后面跟不跟「起」（单档不跟，写「起」反而让人以为还有更便宜的）
         *
         * 两档来源（2026-10-28 多规格）：
         *  - 阶梯型：档位多于 1 档；
         *  - 吃规格的六类：**各档拼团价不完全相同**时也跟「起」（横幅展示的是最低那一档，
         *    不跟「起」会被读成「所有规格都是这个价」）。
         */
        displayRise() {
            const act = this.activity || {};
            if (act.type === 'ladder') {
                return (act.ladder || []).length > 1;
            }
            const rows = act.specs || [];
            if (rows.length <= 1) { return false; }
            const prices = rows.map((r) => Number(r.price) || 0);
            return Math.max.apply(null, prices) !== Math.min.apply(null, prices);
        },
        /** 倒计时终点：预热态倒数到活动开始，其余倒数到活动结束（毫秒） */
        countLeft() {
            const at = this.isPreheat
                ? (Number(this.activity && this.activity.start_time) || 0)
                : (Number(this.activity && this.activity.end_time) || 0);
            if (!at) { return 0; }
            return Math.max(0, at * 1000 - this.now);
        },
        countdown() {
            const left = Math.floor(this.countLeft / 1000);
            const days = Math.floor(left / 86400);
            const hh = Math.floor((left % 86400) / 3600);
            const mm = Math.floor((left % 3600) / 60);
            const ss = left % 60;
            return { days, hh: pad2(hh), mm: pad2(mm), ss: pad2(ss) };
        },
    },
    watch: {
        /** 活动被重取（支付回来、「ready」又上抛一次）时把这一刻与定时器一起对上 */
        activity() {
            this.now = Date.now();
            this.startTimer();
        },
    },
    created() {
        this.startTimer();
    },
    beforeDestroy() {
        this.clearTimer();
    },
    beforeUnmount() {
        this.clearTimer();
    },
    methods: {
        /** 金额尾零去掉（'¥100' / '¥9.9' / '¥9.99'）：横幅空间窄，四位小数式文案撑不下 */
        priceText(p) {
            const s = (Number(p) || 0).toFixed(2);
            return s.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
        },
        /** 倒计时自续跑：每一跳都过已销毁闸门（硬约束 23）；到 0 就停（撤区由拼团区那一条负责） */
        startTimer() {
            this.clearTimer();
            if (!this.activity) { return; }
            const at = this.isPreheat
                ? Number(this.activity.start_time)
                : Number(this.activity.end_time);
            if (!at) { return; }
            const that = this;
            this.timer = setInterval(function tick() {
                if (that._isDestroyed) { that.clearTimer(); return; }
                that.now = Date.now();
                if (that.countLeft <= 0) { that.clearTimer(); }
            }, 1000);
        },
        clearTimer() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; }
        },
    },
};
</script>

<style scoped>
/* 红橙横幅（小鹅通图 2）：左价格、右倒计时；宿主给格子宽度，本体自己贴满那一格左右两边。
   **显式 `width: 100%` + `border-box`**（2026-10-29 用户点名「gba-banner 宽度没有 100%，
   左右有白边」）：本组件只挂在拼团区那张 `tz-box padding="0"` 的第一行（2026-10-30 起
   宿主不再提走它），宽度本来就满；显式写满宽是为了不受将来换宿主时的内衬影响，
   15px 左右内衬记在盒内，不会把本体撑出格子 */
.gba-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    padding: 12px 15px;
    background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);
}

.gba-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.gba-price-line {
    display: flex;
    align-items: center;
    gap: 6px;
}

.gba-yen {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    line-height: 34px;
}

.gba-price {
    color: #fff;
    font-size: 30px;
    line-height: 34px;
    font-weight: 700;
}

/* 虚拟支付那一档的单位（代币名）是**后缀**：与「起」同一档基线，压在价格右侧 */
.gba-coin {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    line-height: 34px;
    margin-left: -2px;
}

/* 「起」：价格后缀，比价格小两档、与「¥」同一档基线（小鹅通「拼团¥78.00 起」） */
.gba-rise {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    line-height: 34px;
}

/* 「N人拼团价」白底红字小标（照小鹅通：圆角胶囊只在标签这一档，按钮仍是 4px） */
.gba-tag {
    flex: none;
    padding: 0 7px;
    border-radius: 9px;
    background: #fff;
    color: #ff4b2b;
    font-size: 10px;
    line-height: 18px;
    font-weight: 500;
}

.gba-origin {
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    text-decoration: line-through;
}

.gba-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: none;
}

.gba-side-title {
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.gba-count {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-top: 6px;
}

.gba-days {
    color: #fff;
    font-size: 12px;
    margin-right: 2px;
}

/* 时分秒三枚白底红字小方块（与图 2 同形） */
.gba-time {
    display: inline-block;
    min-width: 20px;
    padding: 0 2px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 3px;
    background: #fff;
    color: #ff4b2b;
    font-size: 11px;
    font-weight: 600;
}

.gba-colon {
    color: #fff;
    font-size: 12px;
}

.gba-after {
    margin-left: 2px;
    color: #fff;
    font-size: 11px;
}

.gba-ended {
    margin-top: 6px;
    color: #fff;
    font-size: 12px;
}
</style>
