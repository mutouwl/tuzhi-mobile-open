<template>
    <!--
      拼团凑团弹层（开团 / 参团）—— M-P2

      形态照参照页 `pages/course/live/share-gift/activity-detail.vue`：u-popup 外壳 +
      tz-popup-list 列表区 + 标题行 + 底部固定条；面板总高走
      `@/common/utils/live-popup-height` 的 `groupBuyListHeight()`（**不另起第二份几何常量文件**）。

      五条要点写在这里，是为了改这一页时先看见：
       ① **事件名一律非原生**（`open`/`close`/`pick`/`create`/`join`）：H5 编译器把模板里的 `@tap`
          单向改成 `@click`，子组件 `$emit('tap')` 不改名 ⇒ H5 实跑永远收不到（硬约束 27①）。
          **`open` 只表示「弹层已经显示」，「用户要开一个新团」是 `create`**：两个意思挤在同一枚
          `open` 上时，监听 `@open` 的页面分不清自己该干什么（拼团第一轮接线就是这样漏掉的）。
       ② **弹层内的加载态在弹层内部那块画布上铺灰**，不许拿 `tz-loading-page` 那层直角遮罩
          盖住 `u-popup`（硬约束 12）。骨架摆在真实元素那一层：外壳/圆角/内衬走真元素，
          灰块只替换价格/人数/倒计时那几格；`v-if` 才出的（倒计时、在线凑团段）不给灰块也不预留空位。
       ③ **遮罩收口判据是「整条链都收尾」**（硬约束 22）：活动详情 / 团列表 / 阶梯档三条腿，
          任何一条回来都不许撤遮罩；每条腿各自有超时上限，只允许一次收口。
       ④ **按钮只有 tz-button/u-button 的 4px 圆角**，禁胶囊与圆形（硬约束 12）；
          tz-button 没有 slot，只能用 `text` prop。
       ⑤ **「在线凑团」没有团时给空态，不许把整段收掉**（硬约束 27②）：
          入口显隐不许依赖只有该入口自己能产生的数据。
       ⑥ **底栏两枚按钮一律 `long` 撑满等分**（`tz-button` 根类默认 `width: fit-content`，
          不传就缩成内容宽——2026-10-16 用户点名「拼团弹窗中的操作按钮为什么只有一点」）；
          凑团行形态照竞品（08 图左栏）：两行文字 + 行尾「去凑团」小按钮，**行本身不挂点击**
          （入口只留按钮一处，行级点击与 $emit 的双触发不靠 paying 标志兜底）。
    -->
    <u-popup
        :show="show"
        mode="bottom"
        bgColor="transparent"
        :round="12"
        :closeable="true"
        :safeAreaInsetBottom="false"
        :zIndex="10230"
        :overlayStyle="{ zIndex: 10220 }"
        @close="close"
    >
        <view class="gbp">
            <!-- 标题行：15 + 16px/600 行盒 22 + 12 = 49，与达人榜 `.irb-head` 逐值相同（GB 那一份复用 HEAD_H）。
                 **标题左对齐 + 右内衬 36**：u-popup 的关闭图标绝对定位在右上角
                 （right:15 + 图标 18 ⇒ 占面板右缘往里 15~33px），内衬小于 33 时标题一长就钻到图标底下
                 —— 与参照页 `.sgd-head{padding:15px 36px 0 0}` 同一档（M6）。 -->
            <view class="gbp-head">
                <view class="gbp-sk-title" v-if="sk"></view>
                <text class="gbp-title" v-else>{{ activity.name || '拼团' }}</text>
            </view>

            <tz-popup-list :height="listHeight" padding="0 16px" @lower="$emit('load-more')">
                <!-- ① 价格 + 人数 + 时限：骨架摆在真实元素那一层，灰块只替换会变的那几格 -->
                <view class="gbp-price-row">
                    <view class="gbp-sk gbp-sk-price" v-if="sk"></view>
                    <block v-else>
                        <text class="gbp-price">¥{{ shownPrice.toFixed(2) }}</text>
                        <text class="gbp-origin">¥{{ shownOrigin.toFixed(2) }}</text>
                    </block>
                </view>
                <view class="gbp-meta-row">
                    <view class="gbp-sk gbp-sk-meta" v-if="sk"></view>
                    <text class="gbp-meta" v-else>
                        {{ joinedText }}{{ teamNumText }}人成团 · {{ expireText }}
                    </text>
                </view>

                <!-- ② 商品规格（2026-10-28 多规格）：多档时先选规格，再选阶梯档。
                     一档规格一个价，选错规格卖出去的就是别的价的商品；单档不摆（能自动推导的不开放填写） -->
                <view class="gbp-spec-box" v-if="isMultiSpec">
                    <view
                        v-for="row in specRows"
                        :key="row.spec_id"
                        class="gbp-spec-row"
                        :class="{ 'gbp-spec-row--on': chosenSpecId === Number(row.spec_id) }"
                        @click="pickSpec(row)"
                    >
                        <text class="gbp-spec-name">{{ row.spec_text || '默认' }}</text>
                        <text class="gbp-spec-price">¥{{ Number(row.price).toFixed(2) }}</text>
                    </view>
                </view>

                <!-- ③ 阶梯拼团：档位单选行，选中态主色描边 4px 圆角。
                     档数随活动变 ⇒ 这一格是**固定三行的窗口**并在框内滚动（面板总高不跳动，硬约束 37）。
                     多规格时只列**当前规格**那几档（按 spec_id 过滤） -->
                <view class="gbp-ladder-box" v-if="isLadder">
                    <view
                        v-for="row in ladderRows"
                        :key="row.id"
                        class="gbp-ladder-row"
                        :class="{ 'gbp-ladder-row--on': chosenLadderId === row.id }"
                        @click="pickLadder(row)"
                    >
                        <text class="gbp-ladder-num">{{ row.invite_num }} 人</text>
                        <text class="gbp-ladder-price">¥{{ Number(row.price).toFixed(2) }}</text>
                    </view>
                </view>

                <!-- ③ 邀新拼团：一行灰字 -->
                <view class="gbp-invite-tip" v-if="isInvite && !sk">
                    <text>本团需 {{ activity.invite_min }} 名新用户</text>
                </view>

                <!-- ④ 在线凑团：有团列团，没团给空态（**不收掉整段**）。
                     行形态照竞品（竞品截图 08 左栏）：两行文字（「张**的团」/「还差 N 人 · 剩余 X」）
                     + 行尾一枚「去凑团」按钮；**行不再挂 @click** —— 行级点击与按钮点击会各发一次
                     join（事件冒泡与 $emit 双触发，靠 paying 标志兜底不算修好），入口只留按钮这一处 -->
                <view class="gbp-teams" v-if="activity.show_teams === 1">
                    <view class="gbp-teams-title">
                        <text class="gbp-teams-title-text">{{ teamsTitle }}</text>
                    </view>
                    <view class="gbp-team-item" v-for="team in teams" :key="team.team_id">
                        <image class="gbp-team-avatar" :src="team.avatar" mode="aspectFill" />
                        <view class="gbp-team-main">
                            <text class="gbp-team-name">{{ team.nickname }}<text v-if="team.spec_text" class="gbp-team-spec">（团长已选 {{ team.spec_text }}）</text></text>
                            <text class="gbp-team-need">{{ needLine(team) }}</text>
                        </view>
                        <tz-button text="去凑团" type="danger" size="mini" @click="join(team)" />
                    </view>
                    <!-- 上拉加载（M3）：尾部一行状态，翻到底由 tz-popup-list 的 `lower` 事件驱动 -->
                    <u-loadmore :status="teamsLoadStatus" v-if="teams.length && teamsLoadStatus !== 'nomore'"></u-loadmore>
                    <!-- 空态：图标 + 文案，上下留白由容器给（M6「空态这一格自带图标与落位」，
                         内衬 40/48 照全站空态配方；直接摆 u-empty 会贴着标题行顶上去） -->
                    <view class="gbp-empty" v-if="!teamsLoading && !teams.length">
                        <u-empty
                            icon="/static/image/empty.png"
                            width="70"
                            height="70"
                            text="暂时还没有人开团"
                        />
                    </view>
                </view>

                <!-- ⑤ 玩法说明不再放在这一层（2026-10-20 用户点名「拼团玩法应该放在拼团详情里面，
                     而不是点击拼团之后的弹窗里」）：弹窗只承担「凑团」这一件事，
                     玩法那一行由拼团详情页（`pages/app/group_buy/detail`）承担 -->
            </tz-popup-list>

            <!-- 底部固定条：上距 16 + tz-button normal + 下内衬 12 = 65（GB_FOOT_H）。
                 **两个按钮并排等分、各自撑满自己那一格**（`long`，照达人榜 `.irb-foot` 那枚
                 `size="normal" long` 的写法）：tz-button 的根类默认 `width: fit-content`，
                 不传 `long` 时按钮缩成内容宽 —— 2026-10-16 用户点名「拼团弹窗中的操作按钮为什么只有一点」。
                 左右内衬 16 与列表区（tz-popup-list padding 0 16px）对齐，两格间距由容器 gap 给 -->
            <view class="gbp-foot">
                <view class="gbp-foot-cell" v-if="hasTeams">
                    <tz-button text="去凑团" type="default" size="normal" long @click="joinFirst" />
                </view>                <view class="gbp-foot-cell">
                    <tz-button text="开新团" type="primary" size="normal" long @click="openNew" />
                </view>
            </view>
        </view>
    </u-popup>
</template>

<script>
/**
 * 拼团凑团弹层（M-P2）
 *
 * 对外事件：`open`（已显示）/ `close` / `pick` / `create`（开新团）/ `join`（去凑这个团）
 * —— 全部**非原生名**（硬约束 27①）。
 * 公开方法：`open()` 显示、`close()` 收起（调用点导航前要先收，否则从下单页退回来时
 * 这一层还压在商详页上）。
 * 入参：activity（商详页拼团区那一段的数据，由调用点透传，弹层自己不取数）
 *      + teams（在线凑团，同样由调用点透传，保持一处取数）
 */
import tzButton from './button.vue';
import tzPopupList from './popup-list.vue';
import { groupBuyListHeight } from '@/common/utils/live-popup-height';

const pad2 = (n) => String(n).padStart(2, '0');

export default {
    name: 'GroupBuyPopup',
    components: { tzButton, tzPopupList },
    props: {
        /**
         * 页面上已选的规格 / 档位（2026-10-28）：弹层不再自己发明一个默认选项，
         * 打开时回显页面上那一份；用户在弹层里改了会 `pick` 回拼团区（同一份状态，不各存一个）
         */
        specId: { type: [Number, String], default: 0 },
        ladderId: { type: [Number, String], default: 0 },
        activity: { type: Object, default: () => ({}) },
        teams: { type: Array, default: () => [] },
        /** 可凑的团**总数**（后端算的，不是本页行数 —— 硬约束 32②：统计位不许拿本页行数当总数） */
        teamsTotal: { type: Number, default: 0 },
        /** 上拉加载那一行的状态（`loadmore` / `loading` / `nomore`，M3） */
        teamsLoadStatus: { type: String, default: 'loadmore' },
        teamsLoading: { type: Boolean, default: false },
        /** 最后一页第一行在 `teams` 里的下标（调用点算，弹层只读）：
         *  底栏「去凑团」参的是**用户此刻看到的那一页的第一行**，不是第 1 页第一行 ——
         *  翻到第 3 页再点底栏，盲参一个早就沉到列表顶部外面去的团，与所见对不上 */
        teamsPageStart: { type: Number, default: 0 },
        loading: { type: Boolean, default: false },
    },
    emits: ['open', 'close', 'pick', 'create', 'join', 'load-more'],
    beforeDestroy() {
        this.clearTimer();
    },
    beforeUnmount() {
        this.clearTimer();
    },
    data() {
        return { show: false, chosenLadderId: 0, chosenSpecId: 0, now: Date.now(), timer: null };
    },
    computed: {
        /** 骨架：只在**整条链都还没收尾**时铺灰（活动详情 / 团列表 / 阶梯档任一在飞都算没收尾，硬约束 22） */
        sk() { return this.loading; },
        isLadder() { return this.activity.type === 'ladder'; },
        isInvite() { return this.activity.type === 'invite'; },
        /** 商品规格（2026-10-28）：后端下发的逐档价，多档时先选档 */
        specRows() {
            const rows = this.activity.specs || [];
            return Array.isArray(rows) ? rows : [];
        },
        isMultiSpec() { return this.specRows.length > 1; },
        chosenSpec() {
            const rows = this.specRows;
            if (!rows.length) { return null; }
            const hit = rows.find((r) => Number(r.spec_id) === Number(this.chosenSpecId));
            return hit || rows[0];
        },
        /** 阶梯档：多规格时只看当前规格那几套（后端按 spec_id 分组下发） */
        ladderRows() {
            const rows = this.activity.ladder || [];
            if (!this.isMultiSpec) { return rows; }
            const specId = this.chosenSpec ? Number(this.chosenSpec.spec_id) : 0;
            const hit = rows.filter((r) => Number(r.spec_id) === specId);
            // 老活动/后端没给 spec_id 时回落整表（那一档是「整活动一套档位」，逐字兼容）
            return hit.length ? hit : rows;
        },
        chosenLadder() {
            const rows = this.ladderRows;
            return rows.find((r) => r.id === this.chosenLadderId) || rows[0] || null;
        },
        /** 成团人数按所选档位走（阶梯型的人数随档变） */
        teamNumText() {
            if (this.isLadder && this.chosenLadder) { return this.chosenLadder.invite_num; }
            return this.activity.team_num || 0;
        },
        /** 顶部大字价：阶梯取所选档，多规格取所选规格，其余取活动价 */
        shownPrice() {
            if (this.isLadder && this.chosenLadder) { return Number(this.chosenLadder.price) || 0; }
            if (this.chosenSpec) { return Number(this.chosenSpec.price) || 0; }
            return Number(this.activity.price) || 0;
        },
        /** 顶部划线原价：多规格取所选规格的原价（别拿最高那档当划线价，那会读成「便宜了 300」） */
        shownOrigin() {
            if (this.chosenSpec) { return Number(this.chosenSpec.origin_price) || 0; }
            return Number(this.activity.origin_price) || 0;
        },
        expireText() {
            const hours = Math.round((Number(this.activity.team_expire) || 0) / 3600);
            return hours >= 24 ? `${Math.round(hours / 24)} 天内成团` : `${hours} 小时内成团`;
        },
        hasTeams() { return this.teams.length > 0; },
        /** 「已拼 N 件」社会证明（参照产品 01-08 弹层 meta 行）：人数吃后端 `join_count`，
         *  没给（老包/未装）就整段不写，不留一句「已拼 0 件」 */
        joinedText() {
            const n = Number(this.activity.join_count) || 0;
            return n > 0 ? '已拼 ' + n + ' 件 · ' : '';
        },
        /** 标题里的「N 人」吃**后端下发的总数**（`teamsTotal`），不是 `teams.length` —— 那一页只有 10 行 */
        teamsTitle() {
            if (!this.teamsTotal) { return '正在拼团的人'; }
            return `${this.teamsTotal} 人正在拼团，去凑一个`;
        },
        /**
         * 列表区高：走模块那**唯一一份**几何常量（硬约束 11/37）。
         * 阶梯档那一格多高，列表区就少多少 ⇒ 两档面板总高恒等。
         */
        listHeight() { return groupBuyListHeight(this.isLadder); },
    },
    methods: {
        /**
         * 打开（**只有调用点调**；对外事件名非原生）
         * `$emit('open')` 说的是「弹层已经显示」这一件事，
         * 「用户要开一个新团」是 `create`（见 openNew），两枚不许再挤回同一个名字。
         */
        open() {
            this.show = true;
            this.now = Date.now();
            this.startTimer();
            // 回显页面上选中的那一档（页面上没有/已失效时落到第一档，与列表顺序一致）
            const rows = this.specRows;
            const keepSpec = rows.find((r) => Number(r.spec_id) === Number(this.specId));
            this.chosenSpecId = keepSpec ? Number(keepSpec.spec_id) : (rows.length ? Number(rows[0].spec_id) : 0);
            const tiers = this.isLadder ? this.ladderRows : [];
            const keepTier = tiers.find((r) => Number(r.id) === Number(this.ladderId));
            this.chosenLadderId = keepTier ? Number(keepTier.id) : (tiers.length ? Number(tiers[0].id) : 0);
            this.$emit('open');
        },
        /** 收起（公开：调用点在导航前要先收这一层，否则从下单页退回来时弹层还压在商详页上） */
        close() {
            this.show = false;
            this.clearTimer();
            this.$emit('close');
        },
        /** 弹层内倒计时自续跑（M47 同族）：`leftOf` 是秒级 HH:MM:SS，弹层开着时**每秒**重算，
         *  回调前过已销毁闸门；关层/卸载/组件销毁都收口（硬约束 22：每一条退出分支都要收） */
        startTimer() {
            this.clearTimer();
            const that = this;
            this.timer = setInterval(function tick() {
                if (!that.show || that._isDestroyed) { that.clearTimer(); return; }
                that.now = Date.now();
            }, 1000);
        },
        clearTimer() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; }
        },
        priceOf(ladder) {
            if (ladder) { return Number(ladder.price) || 0; }
            return Number(this.activity.price) || 0;
        },
        pickLadder(row) {
            this.chosenLadderId = row.id;
            // 只报「选了哪一档」，价格随 payload 下去是给界面看的（实付价由后端 Gate::unitPrice 重算）
            this.$emit('pick', { ladderId: row.id, price: Number(row.price) || 0 });
        },
        /** 选规格：换了规格，阶梯档要跟着落到那一档的第一档（否则选着 A 规格的价、开的是 B 规格的团） */
        pickSpec(row) {
            this.chosenSpecId = Number(row.spec_id);
            if (this.isLadder) {
                const tiers = this.ladderRows;
                this.chosenLadderId = tiers.length ? tiers[0].id : 0;
            }
            // 报给拼团区：页面上那张卡与底栏价格跟着换（弹层与页面读同一份状态）
            this.$emit('pick', { specId: this.chosenSpecId, ladderId: this.chosenLadderId });
        },
        /** 开新团：事件名是 `create`，不是 `open` —— `open` 已经被「弹层已显示」占了 */
        openNew() {
            this.$emit('create', {
                ladderId: this.chosenLadderId,
                activityId: this.activity.activity_id,
                specId: this.chosenSpec ? Number(this.chosenSpec.spec_id) : 0,
            });
        },
        join(team) { this.$emit('join', { teamId: team.team_id, activityId: this.activity.activity_id }); },
        joinFirst() {
            // 参的是**当前这一页的第一行**（用户此刻看得见的那一团），不是全列表第 1 行 ——
            // 后者在翻过页之后已经沉到列表外面，点底栏会盲参一个看不见的团
            const start = Math.max(0, Number(this.teamsPageStart) || 0);
            const team = this.teams[start] || this.teams[0];
            if (team) { this.join(team); }
        },
        /** 行的第二行文案：`还差 N 人 · 剩余 X`（剩多少由 leftOf 给；取不到时间就只留前半句） */
        needLine(team) {
            const left = this.leftOf(team);
            return left ? `还差 ${team.need_num} 人 · ${left}` : `还差 ${team.need_num} 人`;
        },
        /** 剩余倒计时：`v-if` 才出的那一格，不给骨架灰块也不预留空位（M18⑨）。
         *  ⚠ `expire_time` 是**秒级**、`this.now` 是毫秒（`Date.now()`），必须 ×1000 对齐单位——
         *  原先直接相减恒为负 ⇒ 凑团行永远写「已过期」（与详情页倒计时同一个 bug，同批修）。
         *  格式照竞品（01-08 图「剩余23:59:59」）：`HH:MM:SS`，超过一天加 `N天` 前缀 */
        leftOf(team) {
            const end = Number(team.expire_time) || 0;
            if (!end) { return ''; }
            const total = Math.max(0, Math.floor((end * 1000 - this.now) / 1000));
            if (total <= 0) { return '已过期'; }
            const days = Math.floor(total / 86400);
            const hh = pad2(Math.floor((total % 86400) / 3600));
            const mm = pad2(Math.floor((total % 3600) / 60));
            const ss = pad2(total % 60);
            return '剩余 ' + (days > 0 ? days + '天 ' : '') + hh + ':' + mm + ':' + ss;
        },
    },
};
</script>

<style scoped>
.gbp {
    background: #fff;
    border-radius: 12px 12px 0 0;
    overflow: hidden;
    /* 底部安全区挂在弹层根节点（M6：面板只挂一份；u-popup 的 safeAreaInsetBottom 已关，
       否则两份叠加就是 iPhone X 下多出 34px）。微信端按教务口径减半 */
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    /*  #ifdef  MP-WEIXIN  */
    padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
    padding-bottom: calc(env(safe-area-inset-bottom) / 2);
    /*  #endif  */
}

/* 标题行：上 15 / 下 12 —— 与达人榜 `.irb-head`、分享有礼 `.sgd-head` 逐值相同（HEAD_H 49）。
   **左对齐**（`display:flex` + 不写 `text-align`）：参照页 `.irb-head` 与 `.sgd-head` 都是左对齐，
   原先写 `text-align:center` 是自造的一档（M6）。
   ⚠ **左内衬必须写成四值简写的第 4 位 = 16px**（2026-10-29 用户点名「gbp-head 标题左侧的间距太大了，
   你要参考其他弹窗的标题栏样式」）：上一版写的是三值 `15px 36px 12px`，三值里的第二值是**左右共用**，
   于是左内衬也跟着变成 36px —— 标题比下方列表（`tz-popup-list padding: 0 16px`）整整缩进 20px，
   看着像误缩进。参照页都写成四值（`.sgd-head` 的 `15px 36px 0 0` + 面板 16、`.prize-detail` 的
   `15px 36px 12px 0` + 面板 16）：左内衬 16 与列表对齐，右内衬 36 给 u-popup 关闭图标让位
   （图标占面板右缘往里 15~33px，不够时长标题会钻到图标底下）。 */
.gbp-head {
    display: flex;
    align-items: center;
    padding: 15px 36px 12px 16px;
}

.gbp-title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
}

/* 骨架那一档：与真标题**等高**，数据到手不跳（M16：骨架那一帧的行高必须与实数据那一行相同）。
   左对齐档 ⇒ 灰块从标题行左缘起排（原先 `margin: 0 60px` 是配居中标题的自造档） */
.gbp-sk-title {
    width: 120px;
    height: 22px;
    border-radius: 4px;
    background: #e5e6eb;
}

.gbp-spec-box {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
    /* 规格档数极少（一般 2~3 档），行高/间距与阶梯档同一套；
       不设 max-height/overflow —— 整个列表区本来就是可滚动的（D1：tz-popup-list 里不许写 min/max-height） */
}

.gbp-spec-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    background: #fff;
}

.gbp-spec-row--on {
    border-color: #f53f3f;
    background: #fff7f7;
}

.gbp-spec-name {
    font-size: 14px;
    color: #1d2129;
}

.gbp-spec-price {
    font-size: 14px;
    font-weight: 600;
    color: #f53f3f;
}

.gbp-team-spec {
    font-size: 12px;
    color: #86909c;
}

.gbp-price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 4px 0 8px;
}

.gbp-price {
    color: #f53f3f;
    font-size: 22px;
    font-weight: 700;
}

.gbp-origin {
    color: #86909c;
    font-size: 12px;
    text-decoration: line-through;
}

.gbp-meta-row {
    padding-bottom: 12px;
}

.gbp-meta {
    color: #86909c;
    font-size: 12px;
}

/* 阶梯段：三行的固定窗口，档数再多也在框内滚 —— 面板总高不随档位数跳动 */
.gbp-ladder-box {
    height: 132px;
    overflow-y: auto;
    margin-bottom: 12px;
}

.gbp-ladder-row {
    height: 40px;
    line-height: 40px;
    margin-bottom: 6px;
    padding: 0 12px;
    border-radius: 4px;
    border: 1px solid #e5e6eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.gbp-ladder-row--on {
    border-color: #0968f6;
}

.gbp-ladder-num {
    color: #1d2129;
    font-size: 14px;
}

.gbp-ladder-price {
    color: #f53f3f;
    font-size: 14px;
    font-weight: 600;
}

.gbp-invite-tip {
    padding-bottom: 12px;
}

.gbp-invite-tip text {
    color: #86909c;
    font-size: 12px;
}

.gbp-teams {
    padding-bottom: 8px;
}

/* 空态：上下 40/48 内衬（M6 空态配方；u-empty 自带 margin:100px 会被这一档改掉） */
.gbp-empty {
    padding: 40px 0 48px;
}

.gbp-teams-title {
    padding: 8px 0;
}

.gbp-teams-title-text {
    color: #1d2129;
    font-size: 14px;
    font-weight: 600;
}

.gbp-team-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

/* 一排等分：flex:1 + min-width:0（行内项不因文字长短错位，W41②的移动端同款口径） */
.gbp-team-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    background: #f2f3f5;
}

.gbp-team-main {
    flex: 1;
    min-width: 0;
    padding: 0 10px;
}

.gbp-team-name,
.gbp-team-need {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.gbp-team-name {
    color: #1d2129;
    font-size: 14px;
}

.gbp-team-need {
    color: #86909c;
    font-size: 10px;
}

.gbp-team-left {
    color: #86909c;
    font-size: 10px;
    flex-shrink: 0;
}

/* 底部固定条：上距 16 + 下内衬 12（中间那枚 tz-button normal 档 37 在 button.vue 里）。
   左右内衬 16 与列表区对齐；两格间距只由容器 gap 给（不给某一格写 margin，硬约束 20） */
.gbp-foot {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    padding: 0 16px 12px;
}

.gbp-foot-cell {
    flex: 1;
    min-width: 0;
}

/* 骨架灰块：白底上取 #e5e6eb；形状摆在真实元素那一层，只替换会变的那几格 */
.gbp-sk {
    background: #e5e6eb;
    border-radius: 4px;
}

.gbp-sk-price {
    width: 120px;
    height: 22px;
}

.gbp-sk-meta {
    width: 180px;
    height: 12px;
}
</style>