<template>
    <view class="school-page gbd">
        <!-- ① 顶部商品舞台（2026-10-27 对照小鹅通图 1/2/4 重排；同日用户点名「去掉上面的主题背景色」⇒
             渐变底已撤，白卡直接压页面底色 #f7f8fa），页面上半屏只读「商品 + 拼团状态」两件事。
             复用既有卡片，不新造：**九个大类一律走紧凑档 `tz-course-mini`，实物 `physical` 也不再走
             `tz-physical-goods`**（2026-10-29 用户第二次点名，团 6536「人工智能学习实体资料」
             `goods_type=physical`：上一版只把非实物七档从实物卡里捞出来、实物仍留在 124 高那一档，
             用户读出来还是「不是 course-item-mini」。同一句口径不再按商品大类分叉 —— 两张卡的高度
             差一倍，同是拼团详情，实物与虚拟读成两套版式；而这一屏要摆的只有「封面 + 名称 +
             类型标 + 价格」四件事，紧凑档全接得住）。
             代价要认：实物卡原先多一枚「已售 N」，紧凑档没有这一格，实物这一档不再显示销量。
             首帧按 M16 先摆骨架档：`:skeleton="true"` 的卡与真实卡同一个外壳，
             数据到手切真卡不跳位（两分支互斥：加载中 → 数据到手） -->
        <view class="gbd-hero">
            <view class="gbd-goods">
                <tz-course-mini v-if="firstFrame" :skeleton="true" :skeleton-count="1" :margin="0" :round="true" :border="false" />
                <tz-course-mini v-else-if="detail.activity" :list="goodsCard" :margin="0" :round="true" :border="false" />
            </view>
        </view>

        <!-- ①b 拼团玩法（2026-10-20 用户点名「拼团玩法应该放在拼团详情里面，而不是点击拼团之后的弹窗里」）：
             形态照小鹅通（2026-10-27 图 6）：标题行 + 两行整句，**直接摊开、不做折叠**
             （2026-10-27 用户点名「拼团玩法不要在点击折叠面板才显示，默认展示」：@click / 折叠状态位 /
             行尾箭头已撤净，`.gbd-rule-head` 只作标题行容器，与骨架同形）
             整句由后端 `activity.rule_text` 下发，一处真源，与商详区同一份文案；没下发文案时整块不出 -->
        <view class="gbd-rule" v-if="detail.activity && ruleText">
            <view class="gbd-rule-head">
                <text class="gbd-rule-label">拼团玩法</text>
            </view>
            <text class="gbd-rule-full">{{ ruleText }}</text>
        </view>
        <!-- 首帧骨架：与真块**同版式**（M16/M56④：标签行 + 整句另起一段，不是并成一行）。
             旧版把「标签灰块 + 整句灰块」并排塞进 `.gbd-rule-head` 那一行（18px 高），
             而真实版式是「标签行 20 + 8 间距 + 整句 22」= 74 ⇒ 数据一到这一块整块长高 56px。
             现在三段逐块对齐：标签条 14（行盒 20）、整句一条 14（行盒 22）。
             **整句按一行摆**：这一句由后端按 `team_num` / `type` / `auto_refund` 拼出来（`RuleText::of`），
             默认配置（普通团 + 自动退款）在 375 宽下正好一行（实渲染 344 / 可用 345）；阶梯、邀新、
             关闭自动退款那几档会长到两行 —— 那时真块比骨架高 22px（改多行文案时这一条会由门禁 ⑲7 提醒） -->
        <view class="gbd-rule" v-else-if="firstFrame">
            <view class="gbd-rule-head">
                <view class="gbd-sk-line gbd-sk-line--rule-head">
                    <view class="gbd-sk gbd-sk-rule-label"></view>
                </view>
            </view>
            <view class="gbd-rule-full">
                <view class="gbd-sk-line gbd-sk-line--rule">
                    <view class="gbd-sk gbd-sk-rule-line"></view>
                </view>
            </view>
        </view>

        <!-- ② 状态区（2026-10-27 对照小鹅通图 1/2/4 重排）：
             ① 拼团中：居中「— 拼团剩余时间 —」+ 主题色分段倒计时 + 成员头像 + 还差 N 人；
             ② 结果态（已成团 / 已失败 / 已停止）：图标 + 大字状态 + 后端下发的那句说明。
             **首帧骨架按「拼团中」那一帧逐块摆**（2026-10-29 用户点名「拼团详情的骨架屏可以再适配下」）：
             容器与内衬全走真实那一档的类（`.gbd-count-block` / `.gbd-count-row` / `.gbd-members` /
             `.gbd-gap` / `.gbd-actions`），只有**会变的那几格**换灰块 —— 倒计时标题 1 块、四格数字 4 块、
             成员头像 2 枚、还差整句 1 条、按钮 2 枚；数据一到逐块换真内容，页面高度不变。
             旧版只摆一条 24px 灰条（且 `margin: 0 70px`），而到手那一帧是「倒计时 64 + 头像 66 +
             还差 41 + 按钮 118 = 289」的整块（连外层内衬共 333，H5 375 宽实测）—— 用户读出来正是
             「骨架屏只铺了上半截、加载完整体换版」（M16 点名的那一档）。
             按钮按**显示最多的那一档**先占位（成员态两枚；非成员那一档只有一枚，少掉的是页面下沿）；
             头像一排两枚，与同模块列表 `.gbl-sk` 那一条同一口径（一排的**高度恒 44**，枚数只影响这一排的宽度，
             不影响下方几何；超过 6 枚才会折成第二排，那是 7 人以上的团）。
             「倒计时」这一段在结果态那一档本来不出，但首帧还不知道状态 —— 这一处是 M16③
             「`v-if` 才出的元素不给灰块」的**整页主体例外**：这一屏的主体版式就是它，照主体摆；
             那条只治弹窗里偶发的一行（红包倒计时、我的奖品那种）。 -->
        <view class="gbd-main">
            <!-- 首帧骨架：`firstFrame` = `frameDone` 还没置真（取数在途 **或插件闸门还没回包**），判据只存那一处 computed -->
            <block v-if="firstFrame">
                <view class="gbd-count-block">
                    <view class="gbd-count-title">
                        <view class="gbd-sk gbd-sk-dash"></view>
                        <view class="gbd-sk-line gbd-sk-line--title">
                            <view class="gbd-sk gbd-sk-count-label"></view>
                        </view>
                        <view class="gbd-sk gbd-sk-dash"></view>
                    </view>
                    <view class="gbd-count-row">
                        <view class="gbd-sk-line gbd-sk-line--days">
                            <view class="gbd-sk gbd-sk-count-days"></view>
                        </view>
                        <view class="gbd-sk gbd-sk-count-box"></view>
                        <text class="gbd-sk-colon">:</text>
                        <view class="gbd-sk gbd-sk-count-box"></view>
                        <text class="gbd-sk-colon">:</text>
                        <view class="gbd-sk gbd-sk-count-box"></view>
                    </view>
                </view>
                <view class="gbd-members">
                    <view class="gbd-member" v-for="n in 2" :key="n">
                        <view class="gbd-sk gbd-sk-avatar"></view>
                    </view>
                </view>
                <view class="gbd-gap">
                    <view class="gbd-sk-line gbd-sk-line--gap">
                        <view class="gbd-sk gbd-sk-gap"></view>
                    </view>
                </view>
                <view class="gbd-actions">
                    <view class="gbd-sk gbd-sk-btn"></view>
                    <view class="gbd-action-gap"></view>
                    <view class="gbd-sk gbd-sk-btn"></view>
                </view>
            </block>
            <block v-else>
                <view class="gbd-result" v-if="isResult">
                    <image class="gbd-result-icon" :src="resultIcon" mode="aspectFit"></image>
                    <text class="gbd-result-title">{{ detail.status_label }}</text>
                    <text class="gbd-result-tip" v-if="detail.fail_text">{{ detail.fail_text }}</text>
                </view>
                <block v-else>
                    <view class="gbd-count-block" v-if="showCountdown">
                        <view class="gbd-count-title">
                            <text class="gbd-count-dash"></text>
                            <text class="gbd-count-label">拼团剩余时间</text>
                            <text class="gbd-count-dash"></text>
                        </view>
                        <view class="gbd-count-row">
                            <text class="gbd-count-days">{{ countdownParts.days }}天</text>
                            <text class="gbd-count-box">{{ countdownParts.hh }}</text>
                            <text class="gbd-count-colon">:</text>
                            <text class="gbd-count-box">{{ countdownParts.mm }}</text>
                            <text class="gbd-count-colon">:</text>
                            <text class="gbd-count-box">{{ countdownParts.ss }}</text>
                        </view>
                    </view>
                    <text class="gbd-state" v-else-if="detail.status_label">{{ detail.status_label }}</text>
                </block>

                <!-- 成员头像一个一个摆开（图 1/2/4）：团长那一枚挂主题色「团长」小标；
                     拼团中再补**一枚**虚线问号位（竞品同形，不多摆一排空格）；
                     失败/停止那一档不列成员（同一个事实一屏只说一遍，M41）；
                     **模拟成团补的那几个人也要摆**（2026-10-28 用户点名团 4933：一键模拟成团后
                     头像一个都没补上，还是只有团长一枚 —— 后端不造假的成员行，缺口记在团上
                     `virtual_count`，这一区自己按它补 N 枚默认头像，与真人那一排同尺寸同间距） -->
                <view class="gbd-members" v-if="showMembers">
                    <view class="gbd-member" v-for="m in memberList" :key="m.id">
                        <image class="gbd-member-avatar" :src="m.avatar" mode="aspectFill" />
                        <text class="gbd-leader-tag" v-if="Number(m.is_leader) === 1">团长</text>
                    </view>
                    <view class="gbd-member" v-for="n in virtualSlots" :key="'virtual' + n">
                        <image class="gbd-member-avatar" src="/static/image/default-avatar.png" mode="aspectFill" />
                    </view>
                    <view class="gbd-member" v-for="n in emptySlots" :key="'slot' + n">
                        <view class="gbd-member-empty">?</view>
                    </view>
                </view>

                <!-- 还差 N 人：拼团中那句说「即可拼团成功」，失败那一档说「差 N 人成团」 -->
                <view class="gbd-gap" v-if="detail.status === 0 && needNum > 0">
                    <text class="gbd-gap-text">还差</text>
                    <text class="gbd-gap-num">{{ needNum }}</text>
                    <text class="gbd-gap-text">人，即可拼团成功</text>
                </view>
                <view class="gbd-gap" v-else-if="detail.status === 2 && gapNum > 0">
                    <text class="gbd-gap-text">差</text>
                    <text class="gbd-gap-num">{{ gapNum }}</text>
                    <text class="gbd-gap-text">人成团</text>
                </view>

                <!-- ④ 动作区（图 1/2/4：按钮在页面里，不再走吸底条）：
                     拼团中 我是成员 → 邀请好友参团 + 查看订单详情（**「生成分享海报」那条文字链整条撤掉**：
                     2026-10-27 用户点名「生成分享海报按钮，不用单独显示了，点击邀请好友参团就自动弹出
                     分享弹窗就好了」，2026-10-28 再点一次 —— 现在「邀请好友参团」就是下面那只海报弹层的
                     唯一入口，页面不留第二枚进弹层的按钮）；
                     拼团中 我不是成员（受邀点开分享链接的那一位）→ 立即加入；
                     已成团 → 查看课程（课程）/ 查看订单（实物，2026-10-30 用户点名）/
                     查看票券（线下活动，2026-10-31 用户点名）/ 查看商品（其余大类）；
                     失败/停止 → 查看退款 + 再开一团。
                     **每个按钮都有真实去处，不留死入口**。
                     尺寸：2026-10-27 用户点名「查看课程、查看退款、再开一团按钮太大了」⇒ 整区六枚一律
                     `size="normal"`（按钮高 ≈51 → 37，字号 16 → 14），照同模块参照页 `tz-group-buy-popup`
                     底栏那一档 `size="normal" long`；**不许再写回 `size="large"`**（全站只有这一页用过 large，
                     M17 登记的档位里也没有它）。同一屏六个分支互斥、尺寸必须同一档，只改被点名那三枚
                     会让「拼团中」那两档下次又被点名 -->
                <view class="gbd-actions" v-if="detail.status !== undefined">
                    <template v-if="detail.status === 0 && isMember">
                        <tz-button text="邀请好友参团" type="primary" theme="group-buy" size="normal" long @click="inviteFriend" />
                        <view class="gbd-action-gap"></view>
                        <tz-button text="查看订单详情" type="default" size="normal" long @click="goOrder" />
                    </template>
                    <template v-else-if="detail.status === 0">
                        <tz-button text="立即加入" type="primary" theme="group-buy" size="normal" long @click="joinNow" />
                    </template>
                    <template v-else-if="detail.status === 1">
                        <tz-button :text="successText" type="primary" theme="group-buy" size="normal" long @click="goSuccess" />
                    </template>
                    <template v-else>
                        <tz-button text="查看退款" type="primary" theme="group-buy" size="normal" long @click="goOrder" />
                        <view class="gbd-action-gap"></view>
                        <tz-button text="再开一团" type="danger" size="normal" long @click="goGoods" />
                    </template>
                </view>
            </block>
        </view>

        <!-- M-P6 分享弹层（入口 = 「邀请好友参团」，**页面不再单独摆「生成分享海报」文字链**）。
             2026-10-30 用户点名「分享邀请好友参团的公共弹窗，为什么没有这个获取推荐语了？」：
             本页改回**全站公共分享弹窗** `share-modal`（课程/商品/圈子/打卡各详情页同一只）。
             公共弹窗底部那枚入口在 2026-10-30 的口径里叫「分享链接」（此前叫「推荐语」）：
             地址由 `share.getArticle` 一处出，带本团落点与分享人归因；本页不再自己拼一套海报弹层。
             `type="team"`：后端 `Links` 类型表已有 team 档（值 = team_id），出链直进本团
             （`?id=<team_id>&share=<分享人>`），码与复制文案与团详情同一落点。
             入口按钮**不带 loading**：团数据还没取时也照常开弹层，等待由弹窗里链接那格骨架承担。 -->
        <share-modal
            :visible="posterShow"
            type="team"
            :val="teamId"
            :title="posterTitle"
            :cover="posterCover"
            invite-text="邀请你一起拼团"
            @close="posterShow = false"
        />

        <!-- 底部导航 + 版权页脚：与打卡族 / 优惠券族同一档（口径见 pages/app/checkin/detail/detail.vue 同节注释）。
             tz-tab-bar 只在本页被商家配成底部导航项时才渲染（组件内部按 fullPath 命中导航配置判），
             深链进来的团详情仍是无导航条；tz-footer 常驻，自带 margin-top 40 + padding-bottom 60，
             版权那一行正好落在吸底按钮条上方不被压（参照页 pages/course/detail/detail.vue 同构） -->
        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script>
/**
 * 我的拼团详情（M-P4）+ 成团结果态（M-P5，不是新页面，是这一页的三档头部状态）
 *
 * 六条要点写在这里，是为了改这一页时先看见：
 *  ① **取数时机**：本页是被返回的目标页 ⇒ `onShow` 里**静默重取**（`if (that && that.id && !that.loading) that.getData();`），
 *     静默重取不闪骨架。**禁止**在离开的子页 `onUnload` 里 `getCurrentPages()[length-2].$vm.getData()`
 *     跨页替上级取数（硬约束 16 正半句）。
 *  ② **异步回调写响应式数据前过「已销毁」闸门**（硬约束 23）：倒计时 `setTimeout` 续跑、
 *     `$api().then` 两处都过 `gone()`；主修法在 `main.js` 的 `$scope.setData` 出口，本页是兜底。
 *  ③ **响应式数据的 key 里不许含点**（硬约束 25）：本页没有「按图片地址记状态」的那类表，
 *     所以不需要 `mpKey()`；`imgFailed` 那一族也没有，别自己加一张。
 *  ④ 昵称**由后端脱敏**（`TeamPage::mask`），本页不二次加工 —— 两处各截一次会出现
 *     「学员端看得少、管理端看得全」。
 *  ⑤ **取数走 `common/request/api_list.js` 登记过的键**（`this.$api('group_buy.team.detail', …)`）：
 *     `$api` 是那一层的默认导出**函数**，没有 `.post` 这一档，写成 `this.$api.post(…)` 会在 onLoad
 *     那一刻抛 `is not a function`，整页停在骨架屏而接口一条都不发。
 *  ⑥ **未装态先拦一次**（硬约束 3）：插件不在盘上时后端每一发都回「拼团功能未安装」，
 *     这一页照 `pages/app/checkin/index/js.vue` 同一份写法 toast + `navigateBack`，不把骨架铺满再等一条
 *     永远失败的请求；个人中心那一枚「我的拼团」入口同吃这一枚配置键（不留没有效果的入口，硬约束 9）。
 *
 * ⑦ 「立即加入」链（2026-10-16 补）与拼团区 `goBuy` 同一份纪律：未登录先弹登录、
 *    **失败不许前进**（`$api` 的 then 在 code=0 时也会跑到，成功判定要显式判 `code === 1 && order_no`）、
 *    金额吃接口回的 `price`。加入成功后由支付面板关闭那一刻静默重取，本档自动翻成「邀请好友」。
 *
 * ⑧ **2026-10-27 对照小鹅通图 1/2/4 重排**：顶部商品白卡（同日用户点名「去掉上面的主题背景色」，
 *    那层主题色渐变已撤，白卡压页面底色 #f7f8fa）→ 玩法整句 →
 *    白底状态区（拼团中：居中「拼团剩余时间」+ 红块分段倒计时 + 成员头像 + 一枚虚线问号位 +
 *    还差 N 人；已成团：勾图标 + 大字状态 + 成员头像网格 + 查看课程/订单/票券（按大类）；失败/停止：叉图标 + 说明句）。
 *    按钮从吸底条挪回页面里（图 1/2/4 都是页内按钮），**每档按钮都有真实去处**；
 *    **「生成分享海报」那条文字链已撤**（2026-10-27 用户点名「不用单独显示，点击邀请好友参团就
 *    自动弹出分享弹窗」，2026-10-28 再点一次）：海报弹层的入口收成「邀请好友参团」一枚，
 *    页面不再摆第二枚进弹层的按钮。
 *    成员区由「纵向昵称列表」改为「44px 头像网格」：图 1 的成团名单就是这一形，
 *    团长那一枚挂主题色「团长」小标（2026-10-16 那次「用列表」是为修对齐，本版用固定 44 格 + gap 保证对齐）。
 *
 * ⑨ **2026-10-29 首帧骨架按到手那一帧重做**（用户点名「拼团详情的骨架屏可以再适配下」）：
 *    判据收成 `firstFrame` 一处；「玩法整句」与状态区四段（倒计时 / 头像 / 还差 / 按钮）全按真实容器摆，
 *    只有会变的那几格换 `#e5e6eb` 灰块。H5 375 宽实测：骨架 333 ⇄ 真实 333（倒计时 64 / 头像 44 /
 *    还差 21 / 按钮 92 逐段相等），旧版只摆一条 24px 灰条。灰块几何都写在 `.gbd-sk-*` 那一份 CSS 里，
 *    改真实版式（间距、字号、按钮档）时必须同批改它，否则门禁 ⑲ 组会报「灰块与真实元素不同高」。
 */
// 付费插件安装态闸门（三态）：init 未回包时等一次再判（深链首屏与 init 并行是常态）
import { pluginState, onSystemConfigReady } from '@/common/utils/plugin-guard.js';
// 分享卡片文案两端唯一口径（2026-10-28）：H5 标题 + 描述、小程序标题（微信卡片没有描述行）
import gbShare from '@/common/utils/group-buy-share.js';
import tzButton from '@/components/tz/button.vue';
import tzCourseMini from '@/components/tz/course-mini.vue';
// 全站公共分享弹窗（推荐语 + 海报 + 分享文案一处出）：本页不再自拼 tz-share-poster
import shareModal from '@/components/modal/share-modal.vue';
// 拼团「加入别人的团」上下文：商品页按这一份把团规格/档位锁住（2026-10-30）
import { appendQuery } from '@/common/utils/group-buy-join.js';

const pad2 = (n) => String(n).padStart(2, '0');

export default {
    name: 'GroupBuyDetail',
    components: { tzButton, tzCourseMini, shareModal },
    data() {
        return {
            loading: true,
            // 首帧结算标志（见 computed.firstFrame 的长注释）：四种出口里任一到手才置真，骨架随之撤下
            frameDone: false,
            detail: {},
            // 团 id（onLoad 赋值；公共分享弹窗的 `:val` 与 join 链接都读它）
            teamId: 0,
            now: Date.now(),
            timer: null,
            // 分享海报弹层（入口 = 「邀请好友参团」，见 inviteFriend）
            posterShow: false,
            // 「立即加入」导航防连点（跳提交订单页；订单与支付状态归那一页管）
            joining: false,
        };
    },
    computed: {
        /**
         * 首帧骨架（2026-10-29 用户点名「拼团详情的骨架屏可以再适配下」）
         *
         * 判据**只存这一处**：模板里商品卡、玩法整句、状态区整帧（倒计时/头像/还差/按钮）都读它，
         * 各处再写一遍就是第二份判据（硬约束 11）。
         *
         * **判「这一帧结束没有」，不判「请求在不在飞」**（2026-10-29 同日第二次点名「会先显示『拼团』
         * 两个大字，然后再是骨架屏、之后是加载完成的页面」）：`loading` 只是「取数在途」，
         * 而这一页在最前面还有一道**插件闸门**——`onLoad` 里 `pluginState` 回 `null`（`common.init`
         * 还没回包）时 `start()` 会把 `loading` 收成 `false` 先撤骨架，于是首帧掉进真实分支：
         * 倒计时不出（状态位还没有）⇒ 落到 `.gbd-state` 的兜底「拼团」两个大字；
         * 等 init 回包、`getData(true)` 再铺一次骨架、再到手 —— 用户看到的就是**三帧**。
         * 所以骨架要靠 `frameDone`：只有下面这四种「有结论了」的出口才置真，
         * 闸门等待期间它一直是假 ⇒ 骨架从第一帧就铺着，中间不闪真实帧。
         *   · 取数回包（成功或业务失败）：`getData` 的 `.then` 末端
         *   · 网络异常：`getData` 的 `.catch`
         *   · 插件未装（这一页要退回去了）：`start()` 的 `state === false` 分支
         *   · 空态重取（下拉且还没有内容）：`getData(true)` 重新铺回骨架
         * **init 真失败时这一页会停在骨架上**——那一档全 App 都拿不到站点配置、`app/group_buy/`
         * 的请求也被请求层挡着，本来就没法取数；下拉会重跑闸门（见 `onPullDownRefresh`），
         * 不会把转圈挂死，也不会先亮一屏假内容。
         */
        firstFrame() {
            return this.frameDone !== true;
        },
        showCountdown() { return this.detail.status === 0 && Number(this.detail.expire_time) > 0; },
        /** 结果态（已成团 / 已失败 / 已停止）：头部走图标 + 大字状态那一档（2026-10-26 用户点名） */
        isResult() {
            const s = Number(this.detail.status);
            return s === 1 || s === 2 || s === 3;
        },
        /** 结果态图标：成功绿勾 / 失败与停止的警示（取站点既有订单状态图标，不自绘） */
        resultIcon() {
            const s = Number(this.detail.status);
            if (s === 1) { return '/static/order/status/success.png'; }
            if (s === 2) { return '/static/order/status/cancel.png'; }
            return '/static/order/status/close.png';
        },
        /** 已拼人数：吃后端 `joined_num`（参与过的人，含已退款；失败团不被退款扣成 0），
         *  老后端没这一枚时回落 `used_num`（与列表 `joinedCount` 同一份判据） */
        joinedNum() {
            const raw = this.detail.joined_num;
            if (raw === undefined || raw === null || raw === '') {
                return Number(this.detail.used_num) || 0;
            }
            return Number(raw) || 0;
        },
        targetNum() { return Number(this.detail.target_num) || 0; },
        /** 成员逐行（后端脱敏后的昵称与头像；本页只渲染不二次加工）。
         *  头像区只摆**真参与过**的那几行：待支付（0）与已释放（4）还没算进这一团，
         *  与后端 `TeamProgress::joinedOnly` 同一份口径（1 待成团 / 2 已成团 / 3 已退款都算） */
        memberList() {
            const rows = Array.isArray(this.detail.members) ? this.detail.members : [];
            return rows.filter((m) => {
                const s = Number(m.status);
                return s === 1 || s === 2 || s === 3;
            });
        },
        /** 头像区：拼团中与已成团都列（失败/停止那一档不列，同一个事实一屏只说一遍，M41） */
        showMembers() {
            const s = Number(this.detail.status);
            return s === 0 || s === 1;
        },
        /** 拼团中补**一枚**虚线问号位（图 4/2 同形）；已成团与「已满员」不补 */
        emptySlots() {
            if (Number(this.detail.status) !== 0 || this.needNum <= 0) { return 0; }
            return 1;
        },
        /**
         * 模拟成团补的虚拟人数（2026-10-28 用户点名团 4933「只显示一个人的头像，没有填充模拟用户」）
         *
         * 后端**不造假的成员行**：`TeamForce::simulate()` 与 `SuccessService::settle(…, true)`
         * 只把缺口记在团上 `virtual_count`（`is_simulated` 标一下），成员表里仍然只有真人
         * （`GroupBuySuccessTest`「模拟成团：virtual_count 正确、不产生假用户行」就是这条契约），
         * 所以头像区这一排要自己把这一档补上：成团态补 `virtual_count` 枚默认头像。
         *
         * 三档不补：拼团中（还没结算，`virtual_count` 恒 0）、失败、停止——那时摆一排假头像是
         * 另一件事，也说不清「谁在拼」。同理不补昵称：虚拟用户没有身份，默认头像就是它能说的全部。
         */
        virtualSlots() {
            if (Number(this.detail.status) !== 1) { return 0; }
            return Math.max(0, Number(this.detail.virtual_count) || 0);
        },
        /** 还差几人成团：结果态用「参与过的人数」算，失败团才说得清「差 1 人没成」
         *  （拼团中那一句仍由头部 `needNum` 按占名额口径说，两者不重复） */
        gapNum() { return Math.max(0, this.targetNum - this.joinedNum); },
        /** 拼团玩法整句：吃后端 `activity.rule_text`（与商详区同一份文案，硬约束 11） */
        ruleText() { return ((this.detail.activity || {}).rule_text) || ''; },
        /** 我自己那一行：成员表里 `is_me === 1` 那一条（昵称与头像都由后端逐行下发，本页不二次加工） */
        me() {
            return (this.detail.members || []).find((m) => m.is_me === 1) || {};
        },
        /** 我参过这一团没有：底栏「邀请好友」与「立即加入」两档的判据（后端逐行下发的 is_me，前端不猜） */
        isMember() {
            return (this.detail.members || []).some((m) => m.is_me === 1);
        },
        /** 还差几人成团：与后端 `TeamPage::teams` 的 need_num 同一口径（目标 − 已占名额，含未支付） */
        needNum() {
            return Math.max(0, Number(this.detail.target_num || 0) - Number(this.detail.used_num || 0));
        },
        /** 我自己那一行的订单号（底部「查看订单/查看退款」的真实去处，不留死入口） */
        mineOrderNo() {
            return this.me.order_no || '';
        },
        /**
         * 商品卡那一份字段：只给 course-mini.vue 声明过的 `list` 里那几枚
         *  （id / name / cover / type / price；type 同时管封面标签 `$t(type)` 与点卡片的落点）。
         *  这一处只有一个商品，故传一条 [卡片]，不是另造一套 props。
         *
         *  **不再按大类分叉出第二份**（2026-10-29 团 6536 那一轮）：实物卡那一份字段原先单列在
         *  `goodsCard` 之外的 `physical-goods.vue` 上，两套 props 各写一遍才能换档；现在九档同走
         *  这一只组件，字段也只有这一份 —— `type` 仍吃后端 `goods_type`，点卡片由
         *  `$nav.getPagePath(id, type)` 落到该大类自己的详情页（实物落实物商详，不再写死方向）。
         */
        goodsCard() {
            const a = this.detail.activity || {};
            const origin = Number(a.origin_price) || 0;
            const price = Number(this.detail.price) || 0;
            // 多规格（2026-10-30 口径）：团绑定的是商品，不是规格 —— 团长这一行只是**团长已选**，
            // 受邀人可以买自己的那一档，所以标签写「团长已选」而不是把规格拼进商品名（那会读成
            // 「所有人都必须买这一档」）
            const specText = this.detail.spec_text ? '（团长已选 ' + this.detail.spec_text + '）' : '';
            return [{
                id: a.goods_id || 0,
                name: (a.goods_name || '') + specText,
                cover: a.goods_cover || '',
                type: a.goods_type || 'course',
                pay_type: 'pay',
                // 微信小程序虚拟支付（M-P3）：单位跟着接口走。后端 `TeamPage::teamDetail` 已把
                // `price` / `origin_price` 换成代币数并下发 `is_virtual_pay`，卡片缺这一格就会
                // 给代币数配一个「¥」（与「我的拼团」列表 `courseCard()` 同一份写法）
                is_virtual_pay: Number(this.detail.is_virtual_pay) === 1 ? 1 : 0,
                price: this.detail.price,
                // 划线原价（图 1/2/4 商品卡那枚灰字）：只有原价高于拼团价时才传，否则卡片会写一个同价划线
                price_marking: origin > price ? origin : '',
            }];
        },
        /** 公共分享弹窗的标题/封面：直接吃本团商品快照（弹窗自己取分享人昵称与头像） */
        posterTitle() {
            return ((this.detail.activity || {}).goods_name) || '';
        },
        posterCover() {
            return ((this.detail.activity || {}).goods_cover) || '';
        },
        /** 分享卡片文案（`common/utils/group-buy-share.js` 一处真源）：
         *  H5「发送给朋友」= 标题 + 描述（`还差 N 人成团！拼团课程“XXX”` / `好课别错过，原价 x 元，x 元拼到手~`）；
         *  小程序 + 朋友圈卡片微信不给描述行 ⇒ 走 `mpTitle` 短版（价格句折进标题）。
         *  状态与数字都在文案模块里按团状态派生，页面不再自己拼半句（不出现「还差 0 人成团」）。 */
        shareTitle() {
            return gbShare.title(this.detail);
        },
        /** H5 链接卡片的描述行（小程序端无此字段，见 `shareCard`） */
        shareDesc() {
            return gbShare.desc(this.detail);
        },
        /** 小程序转发 / 小程序朋友圈卡片的标题：短版「还差 N 人成团！x 元拼“课程名”」 */
        shareMpTitle() {
            return gbShare.mpTitle(this.detail);
        },
        shareCover() {
            return gbShare.cover(this.detail);
        },
        countdownParts() {
            // ⚠ `expire_time` 是**秒级**时间戳（后端 intval(time())），`this.now` 是 `Date.now()`
            // 的**毫秒**——必须 ×1000 对齐单位。原先直接相减恒为巨大负数 ⇒ 头上「拼团中」、
            // 下面倒计时永远写「已结束」（2026-10-16 用户拿团 1967 点名，库内明明还剩 22 小时）。
            // 同一款 10-18 第二次被点名时根因不在这一处：状态吃库里滞后的一列、倒计时吃实时时刻，
            // 两头各判各的 ⇒ 收口在后端 `Team::displayStatus` 一处派生，到时限的团不再下发「拼团中」。
            // 2026-10-27 对照小鹅通图 2/4 改成「03天 [14]:[40]:[40]」四格，天**恒出**（00天 也写），
            // 秒级一跳（原先只到分钟、30 秒一跳，用户读出来是「倒计时不动」）
            const left = Math.max(0, Number(this.detail.expire_time) * 1000 - this.now);
            const total = Math.max(0, Math.floor(left / 1000));
            return {
                days: pad2(Math.floor(total / 86400)),
                hh: pad2(Math.floor((total % 86400) / 3600)),
                mm: pad2(Math.floor((total % 3600) / 60)),
                ss: pad2(total % 60),
            };
        },
        /** 已成团那颗按钮的文案：课程是「查看课程」（图 1），实物是「查看订单」（2026-10-30 用户点名
         *  「实物商品拼团成功下面的按钮应该是查看订单，点击后跳转订单详情」——实物拼完成团要查的是
         *  自己的收货单，商品页那一趟在成团后没有新的可读信息），线下活动是「查看票券」
         *  （2026-10-31 用户点名 team 7142「线下活动拼团成功，下面的按钮应该是查看票券」——
         *  活动拼团买到的是报名名额，成团后能看的凭据是票券，落点与支付成功页「查看我的票券」同一页），
         *  其余六档（圈子/练习/打卡/组合/会员卡/教务套餐）一律「查看商品」——只有课程这一档说「课程」，
         *  别的货说成课程就是给错名字（2026-10-29 团 5953 是圈子拼团，旧写法在这一屏会写「查看课程」）。
         *  缺省/空串与后端 `GoodsSpec::handleTypeOf()` 同一口径按课程走。 */
        successText() {
            const t = String(((this.detail.activity || {}).goods_type) || '');
            if (t === 'physical') { return '查看订单'; }
            if (t === 'activity') { return '查看票券'; }
            return (t === '' || t === 'course') ? '查看课程' : '查看商品';
        },
    },
    onLoad(query) {
        // 未装态闸门（硬约束 3，写法照 `pages/app/checkin/index/js.vue`）：插件不在盘上时
        // 后端每一发都回「拼团功能未安装」，这一页先把话说一句再退回去，不把骨架铺满等一条永远失败的请求。
        // **闸门要排在 teamId 赋值之前**：`onShow` 那一条 `!that.teamId` 判据就是这一档的出口，
        // 先记下 teamId 会让退回前的那一次 onShow 又去发一发永远失败的请求。
        // **三态**：init 未回包时先等一次（深链首屏与 init 并行是常态），不判死也不发请求。
        this._query = query || {};
        this.start();
        this._offInstallReady = onSystemConfigReady(() => this.start());
    },    /** 硬约束 16 正半句：被返回的目标页自己在 onShow 静默重取 */
    onShow() {
        const that = this;
        if (that && that.teamId && !that.loading) { that.getData(false); }
    },
    /**
     * 下拉刷新（2026-10-19 补）：团状态由后端 `Team::displayStatus` 一处派生，页面**停留期间**
     * 别人加入成团 / 到时限那两件事没有事件源，onShow 只在「离开再回来」那一趟生效
     * ⇒ 下拉是这一屏唯一的强制重载出口。走静默那一档（`getData(false)`）：不闪骨架、
     * 与 onShow 重取同一形态。收条由 `getData` 末端统一收（成功/失败/未装三条退出分支都要收，硬约束 22）。
     */
    onPullDownRefresh() {
        if (!this.teamId) {
            // 未装闸门那条链：这一页根本没发过请求。**再跑一次闸门**（init 若在这一刻之前刚回包，
            // 这一拉就把正式取数接上；仍回 null 就什么都不做），并立刻收条 ——
            // 只收条不重判会让「init 曾失败一次」的页面永远停在骨架上、下拉也没有任何出路（M16）。
            this.start();
            uni.stopPullDownRefresh();
            return;
        }
        // 已经有内容 → 静默重取（不闪骨架，硬约束 16）；还是没有内容（上一轮失败 / 刚放行）
        // → 走带骨架那一档（`getData(true)` 自己会重新铺骨架），别让用户盯着一片空白等
        this.getData(this.detail.status === undefined);
    },
    onUnload() {
        this.clearTimer();
        if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
    },
    onHide() {
        this.clearTimer();
    },
    // 小程序端转发/朋友圈卡片：标题与封面都取这一条团的货（与 H5 那一发 $nav.share 同一份口径，
    // 同一页面两端分享出的卡片不一致最难查；文案模块 `group-buy-share.js` 一处出）。
    // 朋友圈只认 query，带 path 会丢 team_id 这一枚页面参数
    onShareAppMessage() {
        return this.shareCard(false);
    },
    onShareTimeline() {
        return this.shareCard(true);
    },
    methods: {

        /** 安装态闸门 + 首屏取数（`onLoad` 与 init 回包两条到达路径共用，`_started` 保证只进一次） */
        start() {
            if (this._started) { return; }
            const state = pluginState('group_buy');
            if (state === null) {
                // 还不知道：**骨架继续铺着**（`frameDone` 不置真），等 init 回包那一次重来。
                // 这里把 `loading` 收成 false 只是让海报那句「在途」别在闸门期亮着；
                // 骨架由 `firstFrame` 判，不看它 —— 旧写法在这一档撤骨架，首帧就会先亮一屏
                // 「拼团」两个大字（2026-10-29 用户点名「会先显示『拼团』两个大字，然后再是骨架屏」）
                this.loading = false;
                return;
            }
            if (state === false) {
                uni.showToast({ title: '拼团功能未安装', icon: 'none' });
                setTimeout(() => uni.navigateBack(), 800);
                this.loading = false; // 兜底分支也要撤骨架，否则这一页永远停在灰块上
                this.frameDone = true; // 收口：退回前不再摆灰块（这一页后续也不会再取数）
                return;
            }
            if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
            this._started = true;
            this.teamId = Number((this._query || {}).team_id || (this._query || {}).id || 0);
            this.getData(true);
        },

        gone() { return this._isDestroyed === true; },
        clearTimer() {
            if (this.timer) { clearTimeout(this.timer); this.timer = null; }
        },
        /**
         * @param {Boolean} showLoading 首屏才闪骨架；静默重取不闪（W16/硬约束 16）
         */
        getData(showLoading) {
            // 未装 / init 还没回包：闸门还没放行，不发请求（骨架由 start 那一层管）
            if (!this._started) { return; }
            if (showLoading) {
                this.loading = true;
                // 首屏 / 「还没有内容」的重取：把骨架重新铺上（上一轮失败收掉的骨架在这一档回来）
                this.frameDone = false;
            }
            const that = this;
            this.$api('group_buy.team.detail', { team_id: that.teamId })
                .then((ret) => {
                    if (that.gone()) { return; }   // 已销毁就不写响应式数据（硬约束 23）
                    // code 不为 1 时那一句失败提示由请求层统一弹（M13 的出口在那一层），这一页只当没数据
                    that.detail = (ret && ret.code === 1 && ret.data) || {};
                    that.frameDone = true;   // 有回包就撤骨架（成功与业务失败两种回体都算「这一帧结束」）
                    that.loading = false;
                    that.startTimer();
                    that.applyShare();
                })
                .catch(() => {
                    if (that.gone()) { return; }
                    that.detail = {};
                    that.frameDone = true;   // 网络异常那条退出分支也要撤骨架（M16：三条退出分支一次写全）
                    that.loading = false;
                })
                .then(() => {
                    // 三条退出分支（成功 / 失败 / 已销毁）都过这一末端：下拉收条只在这里收一次
                    if (that.gone()) { return; }
                    uni.stopPullDownRefresh();
                });
        },
        /**
         * H5 公众号端把本团页面配成分享卡片（右上角「···」→ 发送给朋友 / 朋友圈）：
         * 标题 + 描述取 `group-buy-share.js` 那一份（描述行只有 H5 链接卡片有；朋友圈卡片
         * 微信同样不展示描述，标题仍是这一句）。数据到手才配，未到手时是模块里的兜底句。
         * 只在 H5 编译：非微信环境 sdk 内部再判一次并直接 return；小程序端不调这里，
         * 由 onShareAppMessage / onShareTimeline 回传卡片参数（与打卡那一族同一份分路）。
         */
        applyShare() {
            // #ifdef H5
            this.$nav.share(this.shareTitle, this.shareDesc, this.shareCover);
            // #endif
        },
        /**
         * 小程序端转发/朋友圈卡片：微信只给标题 + 图，**没有描述行** ⇒ 标题走 `shareMpTitle`
         * 短版（价格句折进标题，长版会被两行标题截掉价格）。$nav.share 只回 title + path
         * （朋友圈那档只认 query，带 path 会丢页面参数），卡片封面要在这里补 imageUrl；
         * 没有封面时不传空串（空串会让卡片变成无图，而不是回退小程序的页面自动截图）。
         */
        shareCard(timeLine) {
            const params = this.$nav.share(this.shareMpTitle, '', this.shareCover, timeLine ? 'time_line' : 'app_message') || {};
            if (this.shareCover) { params.imageUrl = this.shareCover; }
            return params;
        },
        /** 倒计时自续跑：每一跳都过已销毁闸门。**秒级一跳**（格式是 HH:MM:SS，
         *  30 秒一跳时秒位会长时间停在旧值，用户读出来就是「倒计时坏了」） */
        startTimer() {
            this.clearTimer();
            if (!this.showCountdown) { return; }
            const that = this;
            this.timer = setTimeout(function tick() {
                if (that.gone()) { return; }
                that.now = Date.now();
                if (that.showCountdown) { that.timer = setTimeout(tick, 1000); }
            }, 1000);
        },
        /**
         * 「立即加入」（受邀人那一档）：**先去这件商品自己的详情页**（2026-10-30 用户口径）。
         *
         * 为什么不再直达提交订单页：多规格商品要先把「这一团拼的是哪一档」摆出来（团上快照
         * `spec_id` / `spec_text` / `ladder_id` 一并带过去），线下活动的报名信息、教务套餐的
         * 校区与学生也都在商品页/下单页各自那一层补齐；直达确认页会把这几件事全跳过。
         * 参数只活在这一页实例上（不回写 storage）：用户退出后从别处重新进商品页，
         * 就是正常的「自己开团」链，不会一直挂着别人的团。
         *
         * 商品页底栏在这组参数在时为「加入拼团」：单规格（课程/练习/打卡）点它直接去提交订单页，
         * 吃规格的六类先开规格弹窗、规格与档位按团上那一档锁定（`team.join` 只认团上的规格），
         * 打开过的团/凑团列表在这一档整段不出（防止受邀人自己再开一个新团）。
         *
         * 落点映射只走 `$nav.groupBuyGoodsPath()`（九类一份，打卡落 `checkin/intro` 介绍页）；
         * 取不到路径（老/未知大类）才回落到原来的提交订单页，不留死入口。
         */
        joinNow() {
            if (!uni.getStorageSync('user_token')) {
                this.$api('user.info.index', {}).catch(() => {});
                return;
            }
            if (this.joining) { return; }
            this.joining = true;
            const g = this.detail.activity || {};
            const share = Number((this._query || {}).share) || 0;
            const base = this.$nav.groupBuyGoodsPath(g.goods_id, g.goods_type || 'course');
            if (base) {
                const url = appendQuery(base, {
                    // 团上下文：商品页的拼团区按这三枚核「这一页读到的是不是这一场」
                    gb_activity: Number(g.id || 0),
                    gb_team: Number(this.teamId),
                    gb_goods_type: g.goods_type || 'course',
                    gb_goods_id: Number(g.goods_id || 0),
                    // 团上快照的规格 / 档位 / 单价：规格弹窗按它预选并锁定，头区也显示团价
                    gb_spec: Number(this.detail.spec_id) || 0,
                    // 会员卡第 0 档也是合法规格：显式标记，后端不把 0 当「没带规格」
                    gb_spec_set: 1,
                    gb_ladder: Number(this.detail.ladder_id) || 0,
                    gb_price: Number(this.detail.price) || 0,
                    // 邀请人归因：商品页拼团区的访客埋点还要用它（`?share=`）
                    share: share > 0 ? share : '',
                });
                uni.navigateTo({ url: url });
                setTimeout(() => { this.joining = false; }, 800);
                return;
            }
            // 未知商品大类：沿用改造前的直达确认页（那一页的 team.detail 也读得到团规格）
            const q = ['goodsList=[]'];
            if (g.goods_type === 'physical') { q.push('type=physical'); }
            q.push('gb_activity=' + Number(g.id || 0));
            q.push('gb_team=' + Number(this.teamId));
            q.push('gb_goods_type=' + (g.goods_type || 'course'));
            q.push('gb_goods_id=' + Number(g.goods_id || 0));
            uni.navigateTo({ url: '/pages/order/submit/submit?' + q.join('&') });
            setTimeout(() => { this.joining = false; }, 800);
        },
        /**
         * 「邀请好友参团」= 公共分享弹窗的唯一入口（M-P6；2026-10-27/28 用户两次点名
         * 「生成分享海报按钮不用单独显示，点击邀请好友参团就自动弹出分享弹窗」）。
         * 弹层点击即开、入口不挂 loading：团数据还没取时也先开，等待只写在海报那一格（M18⑨g）。
         * 推荐语、复制文案（含 `share=` 归因链接）与右上角分享卡片都由 `share-modal` 一处出。
         */
        inviteFriend() {
            this.posterShow = true;
        },
        goOrder() {
            // 没有我的订单号那一行时要把原因说出来，静默 return 读起来就是「这个按钮坏了」（M13）
            if (!this.mineOrderNo) {
                uni.showToast({ title: '这一团还没有你的订单记录', icon: 'none' });
                return;
            }
            uni.navigateTo({ url: '/pages/order/detail/detail?order_no=' + this.mineOrderNo });
        },
        /**
         * 已成团那颗按钮的去处（与 `successText` 同一份判据）：
         * 实物 → 我这一单的订单详情（`goOrder`，收货/物流那一屏）；
         * 线下活动 → 「我的票券」列表（`goTickets`，成团后要看的是票券）；
         * 其余大类 → 商品自己的详情页。
         */
        goSuccess() {
            const t = String(((this.detail.activity || {}).goods_type) || '');
            if (t === 'physical') {
                this.goOrder();
                return;
            }
            if (t === 'activity') {
                this.goTickets();
                return;
            }
            this.goGoods();
        },
        /**
         * 「查看票券」的去处（线下活动成团那一档）：去「我的票券」列表
         * （`app/activity/user`，与支付成功页「查看我的票券」同一落点——那一页自己按状态分页签、
         *  按活动名/票号检索，本页不再拼一个只筛这一场的第二入口）
         */
        goTickets() {
            uni.navigateTo({ url: '/pages/app/activity/user/user' });
        },
        /**
         * 去这件货自己的详情页（「查看商品」与「再开一团」共用）
         *
         * **按商品大类走 `$nav.getPagePath` 那一份映射**，不再自己写 `course ? 课程详情 : 实物详情`：
         * 旧写法把圈子/练习/打卡/组合/会员卡/线下活动/教务套餐七档全指向实物详情页（`?id=` 是
         * 另一件商品的 id，接口一路 200、落点却是错的）。类型→页面只存 `common/utils/router.js`
         * 那一处 switch（硬约束 11），这里只负责取到路径；取不到路径就不跳（不留死入口，M13）。
         */
        goGoods() {
            const g = this.detail.activity;
            if (!g) { return; }
            const url = this.$nav.getPagePath(g.goods_id, g.goods_type || 'course');
            if (!url) { return; }
            this.$nav.to(url);
        },
    },
};
</script>

<style scoped>
.gbd {
    background: #f7f8fa;
    min-height: 100vh;
}

/* 顶部商品舞台：2026-10-27 用户点名「去掉上面的主题背景色」⇒ 主题色渐变底整条撤掉；
   2026-10-28 用户点名「gbd-hero 背景为白色」⇒ 这一块从页面底 #f7f8fa 改成**通栏白底**
   （商品卡贴上去，与玩法/状态两块同一个白，上下只由内衬分隔）。
   页面底色仍留在 `.gbd` 那一层，下面两块之间的 10px 缝还是页面底 —— 缝是缝、块是块。 */
.gbd-hero {
    padding: 12px 0 14px;
    background: #fff;
}

.gbd-goods {
    padding: 0 15px;
}

/* ①b 拼团玩法（图 6：白底一块，标题行 + 两行整句，行尾一枚问号） */
.gbd-rule {
    margin: 10px 0 0;
    padding: 12px 15px;
    background: #fff;
}

.gbd-rule-head {
    display: flex;
    align-items: center;
    gap: 4px;
}

.gbd-rule-label {
    color: #1d2129;
    font-size: 14px;
    font-weight: 600;
    /* 行盒写死 20：骨架那一枚灰条按「14 高 + 上下各 3」对齐它（M16 逐块等高） */
    line-height: 20px;
}

.gbd-rule-full {
    display: block;
    margin-top: 8px;
    color: #1d2129;
    font-size: 14px;
    line-height: 22px;
}

/* ===== 首帧骨架灰块（M16）：白底上取全站那一档灰 #e5e6eb，几何逐块对着真实元素给 =====
   口径：灰块只占**文字内容高**，上下外衬由行盒包装补齐 —— 灰块高 + 上下外衬 = 真实行盒高，
   数据到手换真文字时才不跳（14/20 标签、14/22 整句、16/22 倒计时标题、18/26 天、15/21 还差句）。 */
.gbd-sk {
    border-radius: 4px;
    background: #e5e6eb;
}

.gbd-sk-line {
    display: flex;
    align-items: center;
}

/* 玩法：标签一行（行盒 20）+ 整句一条（行盒 22），与 `.gbd-rule` 真块逐段同高 */
.gbd-sk-line--rule-head {
    height: 20px;
}

.gbd-sk-rule-label {
    width: 56px;
    height: 14px;
    flex: none;
}

.gbd-sk-line--rule {
    height: 22px;
}

.gbd-sk-rule-line {
    height: 14px;
    flex: 1;
}

/* 倒计时标题行：与 `.gbd-count-title` 同 22（16px 字）；虚线取真实那两枚的 16 宽
   （真实那条是 1px 红橙线 `#ff4b2b`，灰块取 2 高才看得见——它只是装饰，不影响行高） */
.gbd-sk-line--title {
    height: 22px;
}

.gbd-sk-count-label {
    width: 96px;
    height: 16px;
}

.gbd-sk-dash {
    width: 16px;
    height: 2px;
    flex: none;
}

/* 倒计时四格：方块与真实 `.gbd-count-box` 同 26×26；「天」那一格是 18px 文字 → 18 高 */
.gbd-sk-line--days {
    height: 26px;
}

.gbd-sk-count-days {
    width: 40px;
    height: 18px;
}

.gbd-sk-count-box {
    width: 26px;
    height: 26px;
}

.gbd-sk-colon {
    color: #e5e6eb;
    font-size: 16px;
    font-weight: 600;
}

/* 成员头像：与真实 44 圆同尺寸，间距仍由 `.gbd-members` 的 gap 给（硬约束 20） */
.gbd-sk-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
}

/* 「还差 N 人」那一句：15px 字 → 15 高、行盒 21；宽度按整句实际量（10 个汉字 + 2 空格 + 1 数字 ≈ 166）取 176 */
.gbd-sk-line--gap {
    height: 21px;
    justify-content: center;
}

.gbd-sk-gap {
    width: 176px;
    height: 15px;
}

/* 按钮块按 `tz-button size="normal" long` 实算：上下内衬 10+10 + 14px 行盒 20 = 40
   （行盒 `normal` 随字体在 17~20 之间漂，端上差 ≤3px；原先那条「≈37」是按 17 估的） */
.gbd-sk-btn {
    width: 100%;
    height: 40px;
}

.gbd-main {
    background: #fff;
    margin: 10px 0 0;
    padding: 20px 20px 24px;
    text-align: center;
}

.gbd-state {
    display: block;
    font-size: 22px;
    font-weight: 600;
    color: #1d2129;
}

/* 结果态（已成团 / 已失败 / 已停止）：图标 + 大字状态 + 说明句。
   本屏状态字取 22（2026-10-26 用户点名「要有大的字体显示状态信息」）；
   图标压到 42（2026-10-27 用户点名「状态图标有点大、不协调」——60 比整屏字号大一倍多） */
.gbd-result {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 结果态图标：42 与 22px 大字差一档（60 比整屏所有元素都大一倍，读出来「图标抢戏」） */
.gbd-result-icon {
    width: 42px;
    height: 42px;
}

.gbd-result-title {
    margin-top: 10px;
    color: #1d2129;
    font-size: 22px;
    font-weight: 600;
    line-height: 30px;
}

.gbd-result-tip {
    margin-top: 6px;
    color: #86909c;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
}

/* 倒计时（2026-10-27 图 2/4）：「— 拼团剩余时间 —」居中标题 + 「03天 [14]:[40]:[40]」
   **标题与方块取拼团业务色，不取平台主色蓝**（2026-10-30 用户点名「这个页面中的主题色是蓝色的，
   那最好可以同步一下平台的主题色」——本模块自己的主题色是红橙，参照就是规格弹窗那一档：
   `group-buy-btn` / `group-buy-banner` 的 `linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)` 与
   `group-buy-list` 记下的深一档 `#cf350e`）。色只认这两处，页面不另调一条：

     小字/文字（白底）      `#cf350e`  白底 5.04:1、压本色浅底 4.55:1（M64 那一档记过）
     实底块（白字压上去）    `#cf350e`  同一对数反过来仍是 5.04:1 ⇒ 倒计时三块用它，不拿渐变
     装饰线与小块           `#ff4b2b`  业务色本体（压白 3.34:1，「团长」那枚 9px 白字用它）

   为什么方块不用渐变：三枚 26×26 的方块各带一条左右渐变读起来是三条小色带，且渐变浅端白字只有
   2.28:1（`group-buy-list` 已记过这一档）——大焦点上的 16px 数字走深一档实色才读得清。 */
.gbd-count-block {
    padding-top: 2px;
}

.gbd-count-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.gbd-count-dash {
    width: 16px;
    height: 1px;
    background: #ff4b2b;
    opacity: 0.45;
}

.gbd-count-label {
    color: #cf350e;
    font-size: 16px;
    font-weight: 600;
    /* 行盒写死 22：骨架那一行按同一档摆（M16 逐块等高） */
    line-height: 22px;
}

.gbd-count-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 14px;
}

.gbd-count-days {
    margin-right: 2px;
    color: #cf350e;
    font-size: 18px;
    font-weight: 600;
    /* 行盒写死 26 = 方块高：18px 字在当前字体下的 `normal` 会随端漂，写死才与骨架同高 */
    line-height: 26px;
}

.gbd-count-box {
    min-width: 26px;
    padding: 0 4px;
    height: 26px;
    line-height: 26px;
    border-radius: 4px;
    background: #cf350e;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
}

.gbd-count-colon {
    color: #cf350e;
    font-size: 16px;
    font-weight: 600;
}

/* 成员头像区（图 1/2/4）：一枚一格、自动换行、整行居中；间距只由容器 gap 给（硬约束 20） */
.gbd-members {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px 14px;
    margin-top: 22px;
}

.gbd-member {
    position: relative;
    width: 44px;
    height: 44px;
    flex: none;
}

.gbd-member-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #f2f3f5;
}

/* 「团长」小标：压在自己那枚头像底缘上（图 1/2/4 同形），业务色实底白字、小圆角方块。
   底色取 `#ff4b2b`（业务色本体，白字 3.34:1）而不是整条渐变：这一枚只有 26×14，渐变浅端那半截
   白字会掉到 2.28:1（`group-buy-list` 记过这一档），小块上不往浅端走 */
.gbd-leader-tag {
    position: absolute;
    left: 50%;
    bottom: -4px;
    transform: translateX(-50%);
    padding: 0 4px;
    height: 14px;
    line-height: 14px;
    border-radius: 2px;
    background: #ff4b2b;
    color: #fff;
    font-size: 9px;
    white-space: nowrap;
}

/* 待加入的虚位：虚线圆 + 问号（图 4/2 各一枚） */
.gbd-member-empty {
    width: 44px;
    height: 44px;
    border: 1px dashed #c9cdd4;
    border-radius: 50%;
    box-sizing: border-box;
    color: #c9cdd4;
    font-size: 18px;
    line-height: 42px;
    text-align: center;
}

/* 「还差 N 人」：正文色一句话，数字取**拼团业务色的深一档** `#cf350e`（白底 5.04:1，
   与倒计时同一档；平台主色蓝不在这条链上） */
.gbd-gap {
    margin-top: 20px;
    /* 行盒写死 21（15px 字）：骨架那条灰块 15 + 上下各 3 = 21，换真文字不跳（M16） */
    line-height: 21px;
}

.gbd-gap-text {
    color: #1d2129;
    font-size: 15px;
}

.gbd-gap-num {
    color: #cf350e;
    font-size: 15px;
    font-weight: 600;
}

.gbd-actions {
    margin-top: 26px;
}

.gbd-action-gap {
    height: 12px;
}

/* 「生成分享海报」文字链 2026-10-28 已撤（用户点名不要再显示）：`.gbd-poster-link` 两条规则一并删掉，
   动作区只剩两枚主按钮（图 2 本来就是两枚）。 */
</style>
