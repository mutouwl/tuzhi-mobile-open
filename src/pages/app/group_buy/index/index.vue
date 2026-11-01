<template>
    <view class="school-page gbl">
        <!-- 页签：全部 / 拼团中 / 已成团 / 已失败。用共用组件 tz-tabs（登记在册，本页不重造页签形态），
             它的 props 是 `tabs`、对外事件是 `tab-change`（u-tabs 的 click 在 tz-tabs 那层被吃掉后
             不会自己冒出来，见 components/tz/tabs.vue 的注释）；线色吃组件默认 #0968f6，不再调一档。
             **吸顶（M5，2026-10-28 用户点名「tabs 要吸顶」）**：整条页签行包在 u-sticky 里，
             带底给白底、与下方 #f7f8fa 的列表区区分；带内只有页签行，列表留在带外照常滚 -->
        <u-sticky bgColor="#fff" :offsetTop="0">
            <tz-tabs :tabs="tabs" @tab-change="onTab" />
        </u-sticky>

        <view class="gbl-list">
            <!-- 加载态：骨架由课程卡自己的骨架档给（:skeleton），灰块套在真实卡同一只外壳类里，
                 卡高/封面宽/圆角/间距全由那一版式给一份，改卡版式不会出现「真实卡变了、骨架还是老尺寸」（M16）。
                 **v-for 与 v-if 不叠在同一元素上**：skRows 那一枚 computed 就是这道 v-if
                 （不在加载或已有行就返回空数组，列表本身一条灰块都不铺），指令分层由数组给（硬约束 22 那一族的写法）。
                 三段的先后与真实行同序：拼团进度（状态 / 成员）→ 商品卡 → 订单状态标 + 按钮；
                 数据还在取的那一档按到手那一档先占位再盖灰块，不藏入口、不留空白（M18⑨d） -->
            <view class="gbl-item gbl-item--sk" v-for="n in skRows" :key="'sk' + n">
                <view class="gbl-info">
                    <view class="gbl-meta">
                        <view class="gbl-sk gbl-sk-tag"></view>
                        <view class="gbl-sk gbl-sk-need"></view>
                    </view>
                    <view class="gbl-members">
                        <view class="gbl-avatars">
                            <view class="gbl-avatar gbl-avatar--sk" v-for="i in 2" :key="'sk-avatar' + i"></view>
                        </view>
                        <view class="gbl-sk gbl-sk-members"></view>
                    </view>
                </view>
                <view class="gbl-goods">
                    <tz-course-mini :skeleton="true" :skeleton-count="1" :margin="0" :round="true" :border="false" />
                </view>
                <view class="gbl-foot">
                    <view class="gbl-sk gbl-sk-order"></view>
                    <view class="gbl-sk-btn"></view>
                </view>
            </view>

            <view class="gbl-item" v-for="row in rows" :key="row.member_id">
                <!-- ① 拼团进度先摆（2026-10-26 用户点名「把这个课程卡片放在这个拼团进度下面」）：
                     状态标 + 团长标 + 还差人数 / 剩余时间，下一行是已拼成员头像 + 已拼 N/M 人。
                     状态词、人数与头像全部吃后端逐行下发的字段（硬约束 9/35），端上不造枚举 -->
                <view class="gbl-info">
                    <view class="gbl-meta">
                        <text class="gbl-tag" :class="[tagClass(row.team_status)]">{{ teamLabel(row) }}</text>
                        <text class="gbl-leader" v-if="Number(row.is_leader) === 1">团长</text>
                        <text class="gbl-need" v-if="Number(row.team_status) === 0">还差 {{ needNum(row) }} 人成团</text>
                        <text class="gbl-countdown" v-if="showCountdown(row)">{{ countdownText(row) }}</text>
                    </view>
                    <view class="gbl-members">
                        <view class="gbl-avatars" v-if="memberAvatars(row).length">
                            <image class="gbl-avatar" v-for="(avatar, ai) in memberAvatars(row)" :key="ai"
                                :src="avatar" mode="aspectFill" />
                        </view>
                        <text class="gbl-members-text">已拼 {{ joinedCount(row) }}/{{ Number(row.target_num) || 0 }} 人</text>
                    </view>
                </view>

                <!-- ② 商品卡复用既有组件：只给一份**该组件声明的字段**（`list` 数组，一行就是一条 [卡片]）。
                     原先写 `:id="row.goods_id" mode="dark"`：course-mini.vue 没有这两个 prop，
                     于是整块商品区一条都不渲染（列表只剩右边那列状态与按钮）。
                     **九个大类一律紧凑档**（2026-10-29 用户第二次点名，团 6536 是实物 `physical`）：
                     上一版只把非实物七档从实物卡里捞出来、实物仍走 124 高那一档，用户读出来还是
                     「不是 course-item-mini」；两张卡高度差一倍，同是「我的拼团」，实物与虚拟读成两套版式。
                     取档口径与团详情同一处、且不再按大类分叉（旧判据只认 `=== 'course'` 的那一版
                     会把圈子/练习/打卡/组合/会员卡/线下活动/教务套餐七档全推进实物卡）。
                     行上不再挂 @click：卡片自己跳商品详情（真去处），这一行的「查看详情」跳团详情 -->
                <view class="gbl-goods">
                    <tz-course-mini :list="courseCard(row)" :margin="0" :round="true" :border="false" />
                </view>

                <!-- ③ 我的订单那一行去掉「我的订单：」这半句，状态本身改成 Tag（2026-10-26 用户点名）；
                     文案仍吃后端逐行下发的 `status_label`，色档只由 `status` 决定（硬约束 35）。
                     **与团状态同字时不再出第二枚**（已成团两处都写「已成团」就是同一事实说两遍，M41）；
                     两枚不同轴时各自说各自的事（待支付 / 待成团 / 已退款 vs 拼团中 / 已失败） -->
                <view class="gbl-foot">
                    <text class="gbl-order-tag" :class="[orderTagClass(row.status)]"
                        v-if="showOrderTag(row)">{{ row.status_label }}</text>
                    <tz-button text="查看详情" type="default" size="small" @click="goDetail(row)" />
                </view>
            </view>

            <!-- 空态要排除「闸门已判未装」那一档（blocked）：那 800ms 里亮一句「还没有拼团记录」＝
                 对用户说了一句假话，实际是这一屏根本没有可取的数（2026-10-29） -->
            <view class="gbl-empty" v-if="!loading && !rows.length && !blocked">
                <u-empty icon="/static/image/empty.png" width="70" height="70" text="还没有拼团记录" />
            </view>

            <!-- 上拉加载那一行（M3）：尾部状态，翻到底由 onReachBottom 驱动 -->
            <u-loadmore :status="loadStatus" v-if="rows.length && loadStatus !== 'nomore'"></u-loadmore>
        </view>

        <!-- 底部导航 + 版权页脚：与打卡族 / 优惠券族同一档（tz-tab-bar 自带「本页是否被配成导航项」的
             判据，没配就是空渲染、不压内容；tz-footer 常驻，商家名 / 备案 / 订单列表入口都在这一档） -->
        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script>
/**
 * 我的拼团列表（M-P8）
 *
 * 四条要点：
 *  ① **入口显隐只吃 `app_isinstall_group_buy`，不吃「有没有拼团记录」**（硬约束 27②）：
 *     新功能永远等不到第一行，入口判据挂在记录上就是「明明开了却看不到入口」。这一条由
 *     个人中心那一处判据承担，本页只兜未装态：进得来但插件不在盘上时说一句并退回去。
 *  ② **下拉刷新收条等有回音才收**（硬约束 16 例外一）：`refreshing` 只在取数那条链的末端置回，
 *     请求失败也置回，否则收条挂死。
 *  ③ 状态标**不裸输出**：`teamLabel()` 走后端下发的 `team_label`（硬约束 35 / W69）。
 *  ④ **取数走 api_list 登记过的键**：`$api` 是 common/request/index.js 默认导出的函数，
 *     没有 `.post` 这一档，写 `this.$api.post(...)` 会在 onLoad 那一刻抛 `is not a function`，
 *     整页停在骨架屏而接口一条不发。
 */
// 付费插件安装态闸门（三态）：init 未回包时等一次再判，未装就一句话退回、一条请求都不发
import { pluginState, onSystemConfigReady } from '@/common/utils/plugin-guard.js';
import tzTabs from '@/components/tz/tabs.vue';
import tzButton from '@/components/tz/button.vue';
import tzCourseMini from '@/components/tz/course-mini.vue';

export default {
    name: 'GroupBuyList',
    components: { tzTabs, tzButton, tzCourseMini },
    data() {
        return {
            tabs: [
                { name: '全部', key: 0, status: 0 },
                { name: '拼团中', key: 1, status: 1 },
                { name: '已成团', key: 2, status: 2 },
                { name: '已失败', key: 3, status: 3 },
            ],
            active: 0,
            state: 0,
            rows: [],
            total: 0,
            page: 1,
            limit: 10,
            // 首帧就摆骨架（2026-10-29 同日第二次点名：拼团详情「会先显示『拼团』两个大字，然后再是
            // 骨架屏、之后是加载完成的页面」——本页同族：旧值 false 让首帧先亮一屏「还没有拼团记录」，
            // init 回包后 `getData` 再置真、换成骨架。骨架一直铺到 `getData` 的回包末端才撤）
            loading: true,
            refreshing: false,
            // 在途标志（2026-10-28 补）：`onShow` 的静默重取不置 loading，只靠 loading 挡不住
            // 「静默重取与上拉/下拉并发」；与送礼记录页同一档（那边叫 fetching）
            fetching: false,
            // 取数序号：下拉/换页签/翻页并发时，晚到的旧回体不许盖新结果（硬约束 33 同族）
            seq: 0,
            loadStatus: 'loadmore',
            // 首次进来由 onLoad 取；onShow 那一趟只做静默重取（硬约束 16）
            entered: false,
            // 未装态闸门立起来之后，下拉/上拉那两条链也不再发请求（见 onLoad 的闸门与 getData 的开头）
            blocked: false,
            // 拼团中那一档的倒计时：一个页面共用一只 1s 定时器（不是每行一个），
            // 每跳都过已销毁闸门；隐藏/卸载/换页签时清掉（硬约束 23）
            now: Date.now(),
            timer: null,
        };
    },
    computed: {
        // 骨架那几行的数组：不在加载、或第一页已经有行 → 空数组（= 那一档 v-if 不成立）
        skRows() { return this.loading && !this.rows.length ? [1, 2, 3] : []; },
    },
    onLoad() {
        // 未装态闸门（硬约束 3）：插件没装时后端每一发都回「拼团功能未安装」，
        // 页面不该先把骨架屏铺满再等一条永远失败的请求 —— 照打卡那一族同一份写法先拦一次。
        // **三态**：init 还没回包时既不许判「未装」（会误退），也不许发请求（旧 flag 不可信），
        // 先挂一次性等待，回包后重跑同一个入口。
        this.start();
        this._offInstallReady = onSystemConfigReady(() => this.start());
    },    /**
     * 退回本页时**静默重取当前页签**（硬约束 16：退回哪一页就由那一页自己重取）。
     *
     * 本页是团详情页（`navigateTo` 出去）的返回目标页，团状态可能在那边变了
     * （受邀人参团、我加入后支付完成）。静默那一档**不闪骨架**（`getData(true)` 不置 `loading`）；
     * 首次进来由 `onLoad` 取，这一趟不重复发；未装态与已有请求在飞时也不叠。
     */
    onShow() {
        if (!this.entered || this.blocked || this.loading || this.fetching) { return; }
        this.page = 1;
        this.getData(true);
    },
    onPullDownRefresh() {
        // 收条等有回音才收（硬约束 16 例外一）。在飞的翻页/静默重取由 getData 里的 seq 作废，
        // 这一发是新的第 1 页；旧回体的末端不会替这一发收条（seq 不一致直接 return）
        this.refreshing = true;
        this.page = 1;
        if (!this.entered) {
            // 闸门还没放行（init 未回包 / 未装）：重判一次 —— 放行了 `start()` 自己会发这一发；
            // 仍没放行就只收条（旧写法只收条不重判，init 曾失败一次的页面下拉也没有出路）
            this.start();
            if (!this.entered) {
                this.refreshing = false;
                uni.stopPullDownRefresh();
            }
            return;
        }
        this.getData();
    },
    onReachBottom() {
        // 在飞/重复触发闸门（M3）：快速触底两次时 page 会 +2，跳过一页或把同一页拼两遍；
        // 末页之后不再发（`loadStatus === 'nomore'` 与 `rows >= total` 两条同义，前者是状态位、后者是真数）。
        // `fetching` 是给静默重取补的那一闸：它不置 loading，只判 loading 会漏。
        if (this.loading || this.fetching || this.loadStatus === 'loading' || this.loadStatus === 'nomore') { return; }
        if (this.rows.length >= this.total) { return; }
        this.page += 1;
        this.getData();
    },
    /** 页面隐藏/卸载都要停表：倒计时续跑在后台没有意义，而且会对已出栈页面写 data（硬约束 23） */
    onHide() {
        this.clearTimer();
    },
    onUnload() {
        this.clearTimer();
        if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
    },
    methods: {

        /** 安装态闸门 + 首屏取数（`onLoad` 与 init 回包两条到达路径共用，`entered` 保证只进一次） */
        start() {
            if (this.entered || this.blocked) { return; }
            const state = pluginState('group_buy');
            if (state === null) {
                // 还不知道：**骨架继续铺着**，等 init 回包那一次重来。
                // 旧写法在这里 `loading = false` 撤骨架 ⇒ 首帧先亮空态「还没有拼团记录」，
                // 回包后再铺骨架、再到手，用户看三帧（2026-10-29 拼团详情同一条点名的同族形态）
                return;
            }
            if (state === false) {
                uni.showToast({ title: '拼团功能未安装', icon: 'none' });
                setTimeout(() => uni.navigateBack(), 800);
                this.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
                this.blocked = true;  // 闸门立在取数那一条链上：退回前那一次下拉/上拉不再白发一发请求
                return;
            }
            if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
            this.entered = true;
            this.getData();
        },

        gone() { return this._isDestroyed === true; },
        clearTimer() {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
        },
        /**
         * 拼团中那一档才走秒级倒计时（与团详情/凑团弹层同一格式）：
         * `expire_time` 是**秒级**时间戳，`Date.now()` 是毫秒，必须 ×1000 对齐单位（M47）。
         * 没有要到时限（`expire_time=0` = 不限时）时仍出这一格，文案是「不限时」，不是空白。
         */
        showCountdown(row) {
            return Number((row || {}).team_status) === 0;
        },
        countdownText(row) {
            const end = Number((row || {}).expire_time) || 0;
            if (end <= 0) { return '不限时'; }
            const total = Math.max(0, Math.floor((end * 1000 - this.now) / 1000));
            if (total <= 0) { return '已结束'; }
            const days = Math.floor(total / 86400);
            const hh = String(Math.floor((total % 86400) / 3600)).padStart(2, '0');
            const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
            const ss = String(total % 60).padStart(2, '0');
            return '剩余 ' + (days > 0 ? days + '天 ' : '') + hh + ':' + mm + ':' + ss;
        },
        /** 一只 1s 表驱动整页倒计时；没有「拼团中且有时限」的行就不起表 */
        startTimer() {
            this.clearTimer();
            const alive = () => this.rows.some((row) => this.showCountdown(row) && Number(row.expire_time) > 0);
            if (!alive()) { return; }
            const that = this;
            this.timer = setTimeout(function tick() {
                if (that.gone()) { return; }
                that.now = Date.now();
                if (alive()) {
                    that.timer = setTimeout(tick, 1000);
                }
            }, 1000);
        },
        needNum(row) {
            return Math.max(0, (Number((row || {}).target_num) || 0) - (Number((row || {}).used_num) || 0));
        },
        memberAvatars(row) {
            const list = (row || {}).member_avatars;
            return Array.isArray(list) ? list : [];
        },
        /** 「已拼 N 人」吃后端 joined_num（参与过的人数，含已退款；失败团不被退款扣成 0）。
         *  老后端没这一枚时回落 used_num，不把这一格留空。 */
        joinedCount(row) {
            const raw = (row || {}).joined_num;
            if (raw === undefined || raw === null || raw === '') {
                return Number((row || {}).used_num) || 0;
            }
            return Number(raw) || 0;
        },
        /** 状态标配色：0 拼团中（主色）/ 1 已成团（绿）/ 2 已失败（红）/ 3 已停止（灰）。
         *  词条本身吃后端 `team_label`，这里只管色档（同一档只在这一处定义）。 */
        tagClass(status) {
            return {
                0: 'gbl-tag--joining',
                1: 'gbl-tag--success',
                2: 'gbl-tag--failed',
                3: 'gbl-tag--stopped',
            }[Number(status)] || 'gbl-tag--stopped';
        },
        /** 我的订单状态标配色：0 待支付（橙）/ 1 待成团（主色）/ 2 已成团（绿）/ 3 已退款、4 已释放（灰）。
         *  词条吃后端 `status_label`（硬约束 35），这一处只把五档映射到共用色板。 */
        orderTagClass(status) {
            return {
                0: 'gbl-order-tag--unpaid',
                1: 'gbl-order-tag--paid',
                2: 'gbl-order-tag--settled',
                3: 'gbl-order-tag--refunded',
                4: 'gbl-order-tag--refunded',
            }[Number(status)] || 'gbl-order-tag--refunded';
        },
        /** 订单状态 Tag 只在「与团状态不是同一句话」时出：
         *  已成团时两处都写「已成团」= 同一事实说两遍（M41），只留标题那枚；
         *  待支付 / 待成团 / 已退款 与团状态各是一根轴，照常出（这一枚不能整行删掉，否则「待支付」就看不见了）。 */
        showOrderTag(row) {
            const label = String((row || {}).status_label || '');
            if (!label) { return false; }
            return label !== String((row || {}).team_label || '');
        },
        onTab(item) {
            // tz-tabs 重发的是 u-tabs 那一包 `{...这一项, index}`，页签上的 key/status 原样带回来
            this.active = item.key;
            this.state = item.status;
            this.page = 1;
            this.rows = [];
            // 换页签时旧 total 必须一起清：请求失败时留着旧总数会让上拉继续翻「新页签的第 2 页」
            this.total = 0;
            this.loadStatus = 'loadmore';
            this.getData();
        },
        getData(silent) {
            // 未装态 / init 还没回包：这一页还没有可取的数，不再白发一发必然失败的请求；
            // 收条照样要收（硬约束 22：退出分支一次写全）
            if (!this.entered || this.blocked) {
                this.refreshing = false;
                this.fetching = false;
                uni.stopPullDownRefresh();
                return;
            }
            // 静默那一趟（onShow 重取）不置 loading ⇒ 不闪骨架（硬约束 16 正半句）
            if (!silent) { this.loading = true; }
            // 在途标志与序号：并发时旧回体一律丢（下拉/换页签/翻页三条来路都会 ++seq）
            this.fetching = true;
            const seq = ++this.seq;
            // **把这一发自己的 page/state 钉在闭包里**：响应回来时 `this.page` 可能已被下拉重置成 1，
            // 读实例上的值会把「第 2 页的回体」按第 1 页处理（整表被替换成第 2 页）——2026-10-28 补
            const page = this.page;
            const state = this.state;
            // 尾部那一行在途态（首屏骨架那一档不出，骨架自己会说话）
            if (!silent) { this.loadStatus = 'loading'; }
            // 取数期间先停表：旧一圈的倒计时不该继续对旧 rows 跳动；到手后由末端统一重起
            this.clearTimer();
            const that = this;
            this.$api('group_buy.team.myList', {
                state: state, page: page, limit: that.limit,
            }).then((ret) => {
                if (that.gone() || seq !== that.seq) { return; }   // 已销毁/已被新一发取代：旧回体整档丢弃
                // code 不为 1 时那一句失败提示由请求层统一弹（M13 的出口在那一层），这里只当没数据
                const data = (ret && ret.code === 1 && ret.data) || {};
                const rows = data.rows || [];
                that.rows = page === 1 ? rows : that.rows.concat(rows);
                that.total = Number(data.total) || 0;
                // 收口优先吃后端 has_more；老后端没这一枚才用 total 兜（M3：空页/总数口径不脱节）
                const hasMore = data.has_more === undefined
                    ? that.rows.length < that.total : !!data.has_more;
                that.loadStatus = hasMore ? 'loadmore' : 'nomore';
            }).catch(() => {
                if (that.gone() || seq !== that.seq) { return; }
                // 首屏/下拉失败：撤掉旧行与旧总数；静默重取（onShow）失败时保留现有列表，
                // 不因为一次网络抖动把用户正在看的那一屏清空
                if (page === 1 && !silent) { that.rows = []; that.total = 0; }
                that.loadStatus = that.rows.length >= that.total ? 'nomore' : 'loadmore';
            }).then(() => {
                if (that.gone() || seq !== that.seq) { return; }
                that.fetching = false;
                that.loading = false;
                that.refreshing = false;     // 成功失败都收条，否则收条挂死
                // 成功/失败两条退出分支都在这一末端重起表：翻页失败时旧行还在，
                // 倒计时不能因为那一页没回来就冻住；rows 为空时 startTimer 自己不起表
                that.startTimer();
                uni.stopPullDownRefresh();
            });
        },
        /** 紧凑档那一份字段：只给 course-mini.vue 声明过的那几枚（id/name/cover/type/pay_type/price）。
         *  **九个大类都走这一份**（2026-10-29 用户第二次点名起，实物 `physical` 也在内；
         *  上一版它还单独吃一份 `goodsCard` + `tz-physical-goods`，两套 props 各写一遍才能换档）。
         *  `type` 同时管两处 —— 封面右下角的标签走 `$t(type)`、点卡片跳哪走 `$nav.getPagePath(id, type)`，
         *  所以给后端下发的 `goods_type`（circle → 「圈子」+ 圈子售前页，physical → 实物商详），
         *  不自己造一个值 */
        courseCard(row) {
            const specText = row.spec_text ? '（团长已选 ' + row.spec_text + '）' : '';
            return [{
                id: row.goods_id,
                name: (row.goods_name || '') + specText,
                cover: row.goods_cover || '',
                type: row.goods_type || 'course',
                pay_type: 'pay',
                // 虚拟支付（2026-10-27）：单位跟着接口走（后端 `myList` 已把 price 换成代币数）
                is_virtual_pay: Number(row.is_virtual_pay) === 1 ? 1 : 0,
                price: row.price,
                // 原价划线：与商详/团详情同一枚商品原价快照（后端 `origin_price`），
                // 只有原价确实高于实付才摆，避免「¥99 ¥99」重复一档（M18⑨：不等就不占位）
                price_marking: Number(row.origin_price) > Number(row.price) ? row.origin_price : '',
            }];
        },
        /** 团状态标签走后端下发的词条 `team_label`，前端不写死（硬约束 35） */
        teamLabel(row) {
            return (row && row.team_label) || '拼团';
        },
        goDetail(row) {
            uni.navigateTo({ url: '/pages/app/group_buy/detail/detail?team_id=' + row.team_id });
        },
    },
};
</script>

<style scoped>
.gbl {
    background: #f7f8fa;
    min-height: 100vh;
}

.gbl-list {
    padding: 10px 15px 20px;
}

/* 一行 = 拼团进度 + 商品卡 + 订单状态标/入口行（2026-10-26 用户点名的先后）；
   卡在这一栏里不再自带下间距（:margin="0"），行与行的间距由这一份 margin-bottom 给 */
.gbl-item {
    background: #fff;
    padding: 12px 15px;
    margin-bottom: 10px;
}

/* ① 拼团进度（状态/成员）在上面、商品卡在下面（2026-10-26 用户点名的先后），
   进度与商品之间用一道发丝线分开（白底卡片内的一条静态分隔，色值取全站发丝线 #f2f3f5） */
.gbl-info {
    padding-bottom: 10px;
    border-bottom: 1px solid #f2f3f5;
}

/* ② 商品卡落在进度下面：与上面那条发丝线留 10px 的缝 */
.gbl-goods {
    padding-top: 10px;
}

/* ① 状态标 + 团长标 + 还差人数 / 剩余时间。项与项的间距只由容器 gap 给（硬约束 20） */
.gbl-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
}

.gbl-tag {
    flex: none;
    height: 18px;
    padding: 0 6px;
    border-radius: 4px;
    color: #86909c;
    background: #f2f3f5;
    font-size: 11px;
    line-height: 18px;
    font-weight: 600;
}

.gbl-tag--joining {
    color: #0968f6;
    background: #e8f3ff;
}

.gbl-tag--success {
    color: #00b42a;
    background: #e8ffea;
}

.gbl-tag--failed {
    color: #f53f3f;
    background: #ffece8;
}

.gbl-tag--stopped {
    color: #86909c;
    background: #f2f3f5;
}

/* 团长标：与状态标同高同一档圆角，但走中性灰，不与状态抢色 */
.gbl-leader {
    flex: none;
    height: 18px;
    padding: 0 5px;
    border-radius: 4px;
    color: #4e5969;
    background: #f2f3f5;
    font-size: 11px;
    line-height: 18px;
}

.gbl-need {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: #4e5969;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.gbl-countdown {
    flex: none;
    color: #86909c;
    font-size: 10px;
}

/* ② 成员头像（最多三枚，重叠 6px，白描边分缝）+ 已拼人数 */
.gbl-members {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
}

.gbl-avatars {
    display: flex;
    flex: none;
}

.gbl-avatar {
    width: 24px;
    height: 24px;
    border: 1px solid #fff;
    border-radius: 50%;
    background: #f2f3f5;
}

/* 相邻两枚重叠：只在后一枚上拉负外边距，首枚不留偏移（不用 :first-child，小程序端最稳） */
.gbl-avatar + .gbl-avatar {
    margin-left: -6px;
}

.gbl-members-text {
    flex: 1;
    min-width: 0;
    color: #86909c;
    font-size: 10px;
}

/* ③ 订单状态标 + 查看详情：卡下再一道发丝线（商品与动作分开）。
   按钮恒贴右缘（Tag 与团状态同字时整枚不出，不用空占位撑左半边） */
.gbl-foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #f2f3f5;
}

/* 我的订单状态：与上面那枚团状态标同一档外形（18 高 / 4px 圆角 / 11px 600），
   词条吃后端 status_label，色档按 status 五档（未支付橙 / 待成团蓝 / 已成团绿 / 已退款、已释放灰） */
.gbl-order-tag {
    flex: none;
    margin-right: auto;
    height: 18px;
    padding: 0 6px;
    border-radius: 4px;
    color: #4e5969;
    background: #f2f3f5;
    font-size: 11px;
    line-height: 18px;
    font-weight: 600;
}

.gbl-order-tag--unpaid {
    color: #b95000;
    background: #fff3e8;
}

.gbl-order-tag--paid {
    color: #0968f6;
    background: #e8f3ff;
}

.gbl-order-tag--settled {
    color: #00b42a;
    background: #e8ffea;
}

.gbl-order-tag--refunded {
    color: #4e5969;
    background: #f2f3f5;
}

/* 骨架灰块：白底上取全站那一档灰 #e5e6eb，形状/行高按到手那一档的真实元素给（M16） */
.gbl-sk {
    border-radius: 4px;
    background: #e5e6eb;
}

.gbl-sk-tag {
    width: 48px;
    height: 18px;
    flex: none;
}

.gbl-sk-need {
    width: 90px;
    height: 12px;
}

.gbl-avatar--sk {
    border-color: #fff;
    background: #e5e6eb;
}

.gbl-sk-members {
    width: 70px;
    height: 10px;
}

.gbl-sk-order {
    width: 48px;
    height: 18px;
    flex: none;
    margin-right: auto;
}

/* 按钮块按 tz-button size-small 实算（内衬 5+5 + 14px 行盒 ≈ 27，「查看详情」四字 56 + 左右内衬 30 = 86） */
.gbl-sk-btn {
    width: 86px;
    height: 27px;
    border-radius: 4px;
    background: #e5e6eb;
}

.gbl-empty {
    padding: 40px 0 48px;
}
</style>
