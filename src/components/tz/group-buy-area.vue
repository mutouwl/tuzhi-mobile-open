<template>
    <!--
      商详页拼团区（M-P1）

      **一个组件、两个落点**（硬约束 27③ 共享组件作用域）：课程商详 `pages/course/detail/detail.vue`
      与实物商详 `pages/app/physical/detail/detail.vue` 是两份实现，但拼团区是同一块，
      所以只写这一份、两个页面各挂一次（`pages.json` 的 easycom 规则 `^tz-(.*)` →
      `@/components/tz/$1.vue`，标签 `<tz-group-buy-area>` 自动解析，不用在页面里 import）
      —— 两处各写一遍就是两份会分叉的判据。

      2026-10-20 用户拿参照产品图 2 点名：商详页的拼团价格要**红橙横幅特殊样式**——
      「¥126 + 2人拼团价白标 + 划线原价」在左，右侧「距结束仅剩 21天 21:30:05」分段倒计时。
      原先这个组件是一块白底普通文字，用户读出来「特殊样式没有展示」。

      七条要点：
       ① **没有进行中的活动 ⇒ 整段不渲染**（后端 `app/group_buy/activity/detail` 返回 `null`）；
          **例外：商家开了「活动预热」**（2026-10-27）⇒ 未开始也出这一区，`state='not_start'`、
          右侧倒数到 `start_time`，开始那一刻重取一次切成进行中。预热态底栏按钮写「即将开团」，
          点击给一句「活动尚未开始」（不把用户送进必然失败的下单链）。
       ② **首屏不出加载态**（2026-10-27 用户点名「不要默认展示拼团的骨架屏加载，不然加载完成
          发现不支持拼团，消失时候很奇怪」）：本区本身就是 `v-if` 才出的元素，能不能出要看后端
          `activity/detail` 的回体 ⇒ 取数期间**整段不占位**，有活动才一次性出现；已有数据时的重取
          静默保留旧内容（硬约束 12「`v-if` 才出的元素不给灰块也不预留空位」）。
       ③ **块高由内容算，不写死**（硬约束 18）；骨架那一帧与实数据同一高度。
       ④ **取数时机**：不挂 `onShow` 整页重取（硬约束 16 例外二）。本组件自己只随首屏取一次
          + 下拉刷新 + 支付成功广播到达时静默重取，由调用点调 `reload()`。
       ⑤ **未装插件整段不渲染**（`app_isinstall_group_buy`），不留死入口（W-P5 移动端那一档）。
       ⑥ **凑团弹层的壳挂在本组件里、不挂页面**：`activity` / `teams` / `loading` 三样只在这一份里取。
          **拼团玩法不再放弹窗里**（2026-10-20 用户点名）：本组件只在自己的白块里摆「标题 + 整句」，
          与拼团详情页同一份文案（2026-10-27 起不再折叠，按参照产品图 6 直接摊开两行）。
       ⑨ **在线凑团在商详页内联一段**（2026-10-27 图 3「他们正在拼团，你可直接参与」）：
          最多三行 + 「查看全部」开弹层；**行内只放「去凑团」一枚入口**（整行不挂点击，
          避免行级点击与按钮各发一次 join）。**显隐 = 商家开关 `show_teams` ∧ 我不在这一场
          有进行中的团（`!myTeam`）∧ 真有团可凑（`teams.length > 0`）**，三枚轴各被点过一次名：
          · 商家开关这一枚 —— 2026-10-29 `#/pages/app/vip/center/center`「付费会员卡的拼团不会显示
            他们正在拼团，每个类型的拼团商品都要显示」：判据里不许 ∧ 只有该入口自己会产生的数据，
            于是先把 `teams.length` 从「取不取数」那一轴摘掉（那一轮的解是「段照出 + 空态」）；
          · `myTeam` 这一枚 —— 2026-10-29 `pages/app/circle/presale/presale?id=3168`「如果我现在
            已经参与了这个商品的拼团，那么就不要再显示这个东西了…其他的商品也是这个逻辑」
            （账号 38 在活动 10441 有进行中的团 6218）：我已在团里时后端 `TeamListPage` 已把我的团
            剔出可凑列表，段内只剩一枚与底栏重复的「查看拼团详情」⇒ 整段不出；
          · **没有可参与的团这一枚** —— 同日同路由再点名「如果当前没有可参与的拼团，有时候还没有人
            开团，也不要显示这个东西」：空态「还没有人开团，你来开第一团」+「开新团」、以及取数失败
            那句随整段一起撤掉。**不是 27② 的自锁**：这一段只是「别人正在拼团」的列表，开团入口在
            底栏那枚 `tz-group-buy-btn`（宿主 `openGb()` → 本组件 `openPopup()`），段收掉不影响
            「第一团从哪来」；**九类商详页挂的是同一份组件，收起只改这一处**。
          三枚轴分两枚 computed：`teamsEnabled`（要不要发那一发 `teams` 请求）与
          `showTeams`（要不要占位，再加 `teams.length > 0`）——反过来写就是把「取数」和
          「取回来几行」互相等死。
       ⑦ **开团入口不住在这一段里**：2026-10-16 用户点名「拼团按钮应该与底部按钮放在一起」，
          按钮改由**宿主页底栏**渲染；本组件把活动摘要经 `ready` 事件往上抛。
          2026-10-27 起那枚按钮三档（图 3 / 图 6）：**我在这一场有进行中的团 → 「查看拼团详情」**
          （点击直进本团，不再开凑团弹层）、预热 → 「即将开团」、其余 → 「立即开团」；
          「我在不在团里」只读后端 `my_team`（`GoodsArea::myTeam`，前端不自己拼）。
       ⑧ **购买弹幕**（2026-10-27）：商家开启后轮播「C***购买了本商品」；素材读后端 `buyers`
          （已支付成员，昵称已脱敏、无 user_id），3 秒一条。2026-10-29 用户点名「gba-danmu 应该
          放在页面左上角、封面图片的左上角」⇒ 渲染抽成 `group-buy-danmu.vue`，课程商详用
          `hide-danmu` 收掉本区这份、在封面容器里挂同一枚组件（`overlay`）；其余页面原位不变。
       ⑩ **横幅、玩法、正在拼团必须同在一张卡里挨着**（2026-10-30 用户点名「gba-rule 拼团玩法，
          都应该放在 gba-banner 下面，也包括正在拼团的列表，让拼团连成一个整体」→ 追问后补一句
          「也就是说上下挨在一起，不要拆分放」）：原先各宿主把横幅提到自己价格格/标题卡里
          （2026-10-27 那轮的落点），玩法与凑团列表留在本区 ⇒ 一屏里拼团被拆成两截。
          现在横幅回到本区第一行、原价行回到宿主原位，拼团那几块只在本卡内按
          「横幅 → 邀新提示 → 档位 → 拼团玩法 → 正在拼团」上下挨着排，宿主不再传 `hide-banner`
          （该 prop 随本轮删净，别留一枚没人传的判据）。
    -->
    <!-- 首屏不出骨架：这一区是否存在取决于后端回体（无活动 = 整段不出），
         先铺灰块再撤掉读出来是「闪了一下又没了」⇒ 取数期间不占位，有活动再一次性出现 -->
    <tz-box padding="0" v-if="installed && activity && !expired">
        <block>
            <!-- 购买弹幕（2026-10-27，参照产品图 2）：商家开启后轮播「C***购买了本商品」。
                 2026-10-29 由用户点名「gba-danmu 应该放在页面左上角、封面图片的左上角」——
                 课程商详把这一枚提到封面容器里（宿主传 `hide-danmu`、自己在 `.cd-media` 里挂
                 `tz-group-buy-danmu overlay`），其余八类商详页仍在本区原位；实现只存新组件那一份
                 （脱敏昵称、3 秒轮播、销毁清定时器都在那边）。预热态没有已购用户 ⇒ 整枚不出。 -->
            <tz-group-buy-danmu v-if="!hideDanmu" :buyers="danmuList" />

            <!-- 价格横幅（参照产品图 2）：2026-10-30 起**常驻本卡第一行**，下面紧跟邀新提示 / 档位 /
                 拼团玩法 / 正在拼团——拼团这一整块连着放（用户原话「上下挨在一起，不要拆分放」）。
                 宿主不再把横幅提到价格格（`hide-banner` 已删），原价行回宿主原位。 -->
            <tz-group-buy-banner :activity="activity" />

            <!-- 邀新拼团：价格区下方常驻一条浅底提示（参照产品 03-04 图「仅限新用户参团」黄条）。
                 老用户从商详一眼看不出这是新用户专享价 ⇒ 这一条不隐藏；人数那半句吃后端 invite_min -->
            <view class="gba-invite" v-if="activity.type === 'invite'">
                <text class="gba-invite-text">仅限新用户参团{{ inviteMinText }}</text>
            </view>

            <!-- 档位选择（2026-10-28 用户给的三张拼团页：线下活动 / 付费会员卡 / 实物商品；
                 2026-10-29 用户改口径）
                 **规格不再摆在页面上**：2026-10-29 用户点名 `#/pages/app/vip/center/center`
                 「如果拼团选择规格弹窗里面包含了规格选项，那么就不要再显示 gba-pick 了，
                 其他的多规格商品也是这个逻辑」。吃规格的六类（后端 `has_spec=1`）点「立即开团」
                 弹出的 `group-buy-config-popup` 里就是规格 chips，而实物/组合/圈子/教务套餐/会员卡/
                 线下活动这六页本来还各自有一枚自家的规格格（`选择` / `选择套餐` / `有效期` / 时长卡）
                 ⇒ 页面上再摆一份规格卡片，同一件事就有第三处可选，改一处必漏另一处（硬约束 11）。
                 剩下只有「阶梯型 + 不吃规格的三类（课程/练习/打卡）」这一档：那只弹窗里只有人数档位、
                 没有规格可选，档位块仍摆在页面上（图 3：N人团 + ¥x/人）。
                 选中项同时决定底栏那枚「立即开团」的第二行价格（`ready.price_text`）。 -->
            <view class="gba-pick" v-if="showPicker">
                <view class="gba-pick-head">
                    <text class="gba-pick-title">选择拼团人数</text>
                </view>
                <view class="gba-tiers" v-if="tiers.length">
                    <view class="gba-tier" v-for="row in tiers" :key="row.id"
                        :class="{ 'gba-tier--on': pickedLadderId === Number(row.id) }"
                        @click="pickLadder(row)">
                        <text class="gba-tier-num">{{ row.invite_num }}人团</text>
                        <text class="gba-tier-price">¥{{ money(row.price) }}/人</text>
                    </view>
                </view>
            </view>

            <!-- 拼团玩法（2026-10-27 图 6：白底一块，标题 + 问号 + 两行整句，**直接摊开不折叠**） -->
            <view class="gba-rule">
                <view class="gba-rule-head">
                    <text class="gba-rule-label">拼团玩法</text>
                    </view>
                <text class="gba-rule-full">{{ activity.rule_text }}</text>
            </view>

            <!-- 在线凑团（2026-10-27 图 3）：「他们正在拼团，你可直接参与」+ 最多三行团
                 + 「查看全部」开完整弹层。行内只放「去凑团」一枚入口（整行不挂点击，
                 避免与按钮各发一次 join）；剩余时间不足一天时只写时分秒（图 3 同形）。

                 **显隐 = 商家开关 `show_teams` ∧ 我不在这一场有进行中的团（`!myTeam`）
                 ∧ 真有可参与的团（`teams.length > 0`）**。三枚轴各自被用户点过一次名，逐轮收窄：
                 ① 开关这一轴（2026-10-29 `#/pages/app/vip/center/center`「付费会员卡的拼团不会
                    显示他们正在拼团…每个类型的拼团商品都要显示」）：判据先撤掉 `teams.length`，
                    因为没有团时整段被收掉属于「入口自锁」；那一轮的解是「段照出 + 空态」。
                 ② `myTeam` 这一轴（2026-10-29 `pages/app/circle/presale/presale?id=3168`「如果
                    我现在已经参与了这个商品的拼团，那么就不要再显示这个东西了…其他的商品也是
                    这个逻辑」）：我已在团里时后端 `TeamListPage` 已把「我的团」剔出可凑列表，
                    段内只剩一枚与底栏重复的「查看拼团详情」⇒ 整段不出。
                 ③ **没有可参与的团就不摆这一段**（2026-10-29 同一路由再点名「如果当前没有可参与的
                    拼团，有时候还没有人开团，也不要显示这个东西」）：① 那一版的空态
                    「还没有人开团，你来开第一团」+「开新团」、以及取数失败那句，随整段一起撤掉。
                    **这不与硬约束 27② 的「入口自锁」冲突**——这一段只是「别人正在拼团」的列表，
                    开团入口在**底栏**那枚 `tz-group-buy-btn`（九类宿主页各自 `openGb()` →
                    本组件 `openPopup()`），段收掉不影响「第一团从哪来」；反过来说，摆一段
                    「没人开团」只会让商品页多一块空内容。
                 于是只在「真有团可凑」时才占位：首屏与取数失败那一拍 `teams` 都是空数组 ⇒
                 不占位、不出骨架（硬约束 12 的 `v-if` 元素不给灰块）；标题恒为图 3 那句
                 （不再按空/失败分档，`teamsTitle` 与 `teamsFailed` 随之一并撤净）。
                 九类商详页挂同一份组件，逐类自动一致。 -->
            <view class="gba-teams" v-if="showTeams">
                <view class="gba-teams-head" @click="openTeams">
                    <text class="gba-teams-title">他们正在拼团，你可直接参与</text>
                    <text class="gba-teams-arrow">›</text>
                </view>
                <view class="gba-team" v-for="team in inlineTeams" :key="team.team_id">
                    <image class="gba-team-avatar" :src="team.avatar" mode="aspectFill" />
                    <view class="gba-team-main">
                        <text class="gba-team-name">{{ team.nickname }}的团</text>
                        <view class="gba-team-sub">
                            <text>{{ team.target_num }}人团，还差</text>
                            <text class="gba-team-need">{{ team.need_num }}</text>
                            <text>人成团</text>
                        </view>
                    </view>
                    <view class="gba-team-side">
                        <text class="gba-team-left" v-if="teamLeft(team)">{{ teamLeft(team) }}</text>
                        <view class="gba-team-btn" @click="handleJoin({ teamId: team.team_id, activityId: activity.activity_id })">去凑团</view>
                    </view>
                </view>
                <view class="gba-teams-more" v-if="teamsTotal > inlineTeams.length" @click="openTeams">
                    查看全部 {{ teamsTotal }} 个团
                </view>
            </view>
        </block>

        <!-- 凑团弹层（M-P2）：吃本组件那一份状态，自己不发请求。
             `activity` 取 `|| {}` —— 加载中那一趟 `activity` 是 null，直接绑上去弹层渲染期就会
             去读 `null.name`（硬约束 23 那一族的第二个入口：渲染异常整轮 patch 被跳过）。
             开新团 / 去凑团都**带去提交订单页**，本组件不再自建订单与支付面板 -->
        <!-- 规格 / 档位 / 份数（2026-10-28 两张参照图）：底栏「立即开团」先开这一只，
             选完 → 提交订单页。凑团列表走另一只（他们正在拼团 / 查看全部），两个入口各管一件事 -->
        <!-- 第二步（`host-spec` 时）：规格已在商品自己的规格组件里选完，这只只问「拼团类型 / 份数」，
             规格与份数两节由 `hide-spec` / `hide-count` 收起；非 host-spec 的页面仍按老形态摆全 -->
        <tz-group-buy-config-popup ref="config" :activity="childActivity"
            :spec-id="pickedSpecId" :ladder-id="pickedLadderId"
            :hide-spec="(hostSpec || hostTicket) && !joinMode" :hide-count="(hostSpec || hostTicket) && !joinMode"
            :fixed-ladder-id="joinMode ? joinLadder : 0"
            :team-spec-id="joinMode ? joinTeamSpecId : 0"
            :team-price="joinMode ? joinPrice : 0"
            :hide-ladder="joinMode"
            :confirm-text="joinMode ? '加入拼团' : '确定'"
            @confirm="onConfigConfirm" />

        <tz-group-buy-popup ref="popup" :activity="childActivity" :teams="teams"
            :teams-total="teamsTotal" :teams-load-status="teamsLoadStatus" :teams-loading="teamsLoading"
            :teams-page-start="teamsPageStart" :spec-id="pickedSpecId" :ladder-id="pickedLadderId"
            :loading="loading" @create="handleCreate" @join="handleJoin" @pick="onPopupPick"
            @load-more="loadMoreTeams" />
    </tz-box>
</template>

<script>
import { FEATURE_GROUP_BUY } from '@/common/utils/feature-flags.js';
// 规格「这一档还能不能买」的唯一一份判据（售罄 / 限购用尽），规格弹窗与商详规格弹窗同读
import { pickSpecRow, specBuyable } from '@/common/utils/spec-stock.js';
// 付费插件安装态闸门（三态）：本会话 init 还没回包时不许拿上一轮的 flag 判（见 plugin-guard.js 头注释）
import { pluginState, onSystemConfigReady } from '@/common/utils/plugin-guard.js';
/**
 * 商详页拼团区（M-P1）
 *
 * 对外事件：
 *  - `go-pay`（**非原生名**，硬约束 27①）—— 导航已经由本组件发出去了，
 *    留这一枚是给宿主页标「用户态可能要变」那本账的（课程详情页的 `stateDirty`，硬约束 16 例外二）。
 *  - `ready` —— 活动摘要上抛给宿主底栏那枚拼团按钮：有活动给 `{ text, activity }`，没有给 `null`。
 *    `activity` 是原样转发（只给「把横幅提到自己价格格」的宿主用，如课程详情页），其余宿主只读 `text`。
 *  - `pick-spec` —— `host-spec` 宿主：点「立即开团」时由宿主打开它自己的规格组件。
 *  - `order` —— `host-order` 宿主（2026-10-30）：拼团下单上下文，宿主带去自己的中间页
 *    （教务套餐确认报名页 / 线下活动选票页），中间页确认完再带同一组 `gb_*` 键进结算页。
 *    `host-ticket` 宿主（2026-10-31，线下活动）同样走这一枚：它连票种与份数都在自己的页面链里收。
 * 公开方法：`reload()`（首屏 / 下拉刷新 / 支付成功广播到达时由调用点调）、
 *          `openPopup()`（宿主底栏那枚按钮点击时调）。
 * 取数：自己发三条请求 —— `group_buy.activity.detail`（活动本体，无活动返 null）
 *      与 `group_buy.activity.teams`（在线凑团），以及首屏那一次 `group_buy.activity.visit`（访客埋点）。
 *      三枚都登记在 `common/request/api_list.js` 顶层那份 `group_buy`。
 *      **2026-10-29 起多一档预取**（宿主传 `preload`）：活动本体由课程详情接口随响应带回，
 *      本组件挂载即渲染、不再发 `activity/detail`（那条腿只在宿主没传 `preload`/下拉刷新时走；
 *      「没传」在小程序里是空对象而不是 `undefined`，见下面 `preload` 那条 prop 的注释）；
 *      埋点与凑团仍要各自发一次，但它们等 init 回包才出，不挡首屏那一帧（见 `loadInitLegsOnce`）。
 */
import tzBox from './box.vue';
import tzGroupBuyBanner from './group-buy-banner.vue';
import tzGroupBuyDanmu from './group-buy-danmu.vue';
import tzGroupBuyPopup from './group-buy-popup.vue';
import tzGroupBuyConfigPopup from './group-buy-config-popup.vue';

const pad2 = (n) => String(n).padStart(2, '0');

export default {
    name: 'GroupBuyArea',
    components: { tzBox, tzGroupBuyBanner, tzGroupBuyDanmu, tzGroupBuyPopup, tzGroupBuyConfigPopup },
    props: {
        /** 商品定位：与商详页那一行同形（course/physical） */
        goodsType: { type: String, default: 'course' },
        goodsId: { type: [Number, String], default: 0 },
        /** 受邀链接上的 `share`（邀请人 id）：>0 这一次访问计入「分享访客数」 */
        share: { type: [Number, String], default: 0 },
        /**
         * 弹幕已被宿主提到封面左上角（2026-10-29 用户点名「gba-danmu 应该放在页面的左上角，
         * 也就是封面图片/轮播图片的左上角」）：宿主传 true 时本区不再渲染那一枚，
         * 由宿主在自己的封面容器里挂 `tz-group-buy-danmu`（`overlay`）。
         * 缺省 false ⇒ 其余八类商详页仍是拼团区原位那一档，一字不变。
         */
        hideDanmu: { type: Boolean, default: false },
        /**
         * 宿主预取的拼团区摘要（2026-10-29「详情页显示拼团信息有延迟」）：
         *  - **对象**：后端在课程详情响应里已确认有进行中活动 ⇒ 本组件挂载即渲染，
         *    首屏不再等「再发一发 `activity/detail`」（原先那是串在详情回包之后的第二跳）；
         *  - **null**：后端已确认「没有进行中活动」⇒ 首屏连请求都不发（省掉一跳空请求）；
         *  - **`{}`（缺省）**：旧后端 / 其他宿主没传 ⇒ 按原逻辑（等 init 回包再自己取）。
         *
         * **缺省值必须是空对象，不能写 `undefined`**（2026-10-31 实测 mp-weixin 3.17，
         * 用户点名 `pages/app/exam/detail/detail`「练习拼团商品不显示拼团内容」）：
         * 小程序把「宿主没传的 Object prop」落成 `null`（实测 `_props.preload === null`），
         * 与上面「后端明确说没有活动」撞成同一档 ⇒ 练习/打卡/实物/组合/线下活动/会员卡/
         * 教务套餐/圈子售前这八个不传 `preload` 的宿主**首屏永不发 `activity/detail`**，
         * 拼团区整段不出。H5 保留 `undefined`，所以只在真机/开发者工具里复现。
         * 空对象没有 `activity_id`，下面 `pre` 仍算作 null、`this.preload === null` 只剩
         * 「后端明确没有活动」这一档 ⇒ 各分支一字不动，缺省那一档自动回到「自己取」。
         * 端上不重算任何口径：活动状态、价格区间、档位、我的团全在后端 `GoodsArea` 那一份里。
         */
        preload: { type: Object, default: () => ({}) },
        /**
         * **规格由宿主页自己的规格组件选**（2026-10-29，加性、缺省 false）：
         * 实物 `sku-select-modal` / 组合 `spec-select-modal` / 圈子 `tz-circle-spec-popup` /
         * 教务套餐 `package-sku-select-modal` / 会员卡页内那张规格卡 —— 点「立即开团」时本组件
         * 不再开自己那只通用规格弹窗，而是 `$emit('pick-spec')`，由宿主打开它**本来的**那只；
         * 宿主选完调 `afterSpec({specId, count, campusId})` 回来（阶梯档/份数仍由本组件的
         * 第二步弹窗问）。为什么这么做：各商品自己的规格组件里还有校区、套餐权益、内含商品、
         * 实物多属性、份数上限这些本组件不该重写一遍的东西（硬约束 11）。
         * 缺省 false ⇒ 课程/练习/打卡/线下活动（没有商品规格组件的那几类）仍按老形态自取。
         */
        hostSpec: { type: Boolean, default: false },
        /**
         * **规格选择就在页面上**（2026-10-29，加性、缺省 false）：会员卡页那排「N天 / ¥x」卡
         * 既是它的规格组件、又摆在页面里（没有弹窗可挂）⇒ 阶梯型的人数额也摆在页面上
         * （`gba-pick` 那一块），点「立即开团」时由宿主把选中的档一并交回（`afterSpec`）。
         * 其余四类 `host-spec` 宿主（实物/组合/圈子/套餐）都有规格弹窗，人数额挂在弹窗里
         * （`components/tz/gb-ladder-picker.vue`），这一枚保持 false。
         */
        specInline: { type: Boolean, default: false },
        /**
         * **受邀参团上下文**（2026-10-30，加性、缺省 0）：团详情「立即加入」带过来的团 id。
         * >0 时本区进 join 态：底栏按钮写「加入拼团」，点它按团上快照的规格/档位锁定后再去
         * 提交订单页；凑团列表、开新团弹层与页内档位块一律不出（防止受邀人自己再开一个新团）。
         * 参数只来自这一页的 URL（`common/utils/group-buy-join`），不落 storage：
         * 退出后从别处重新进商品页就是正常的「自己开团」链。
         */
        joinTeam: { type: Number, default: 0 },
        /** 团所属活动 id：本区取到的活动与它不一致（活动结束/换了新活动）就不进 join 态 */
        joinActivity: { type: Number, default: 0 },
        /** 团所属商品 id：会员卡多卡页按它核「当前这张卡是不是团上的那张」 */
        joinGoodsId: { type: Number, default: 0 },
        /** 团上快照的规格 / 档位：规格弹窗按它预选并锁定（`team.join` 只认团上那一档） */
        joinSpec: { type: [Number, String], default: 0 },
        joinLadder: { type: [Number, String], default: 0 },
        /** 团上快照的单价：join 态规格弹窗头区显示它（商家改过活动价时两者可能不同） */
        joinPrice: { type: [Number, String], default: 0 },
        /**
         * **下单入口交给宿主**（2026-10-30，加性、缺省 false）
         *
         * 教务套餐在下单这一步还要「校区 + 学生」，而这两样在普通购买链里有自己的中间页
         * （确认报名页）。2026-10-28 拼团接进来时把它内联在了结算页；2026-10-30 用户点名
         * 「拼团也要进这张中间页」⇒ 本组件不导航，把拼团下单上下文（`gbCtx()` 那一份：
         * 活动/团/档位/规格/份数/校区）经 `order` 事件上抛，由宿主带进它自己的中间页，
         * 中间页确认完再带着同一组 `gb_*` 键进结算页。
         * 缺省 false ⇒ 没接中间页的类型仍直接去结算页，一字不变。
         * （线下活动的报名信息页同一族，2026-10-31 已由 `hostTicket` 接上：
         *   点开团/参团先进它自己的「选票页 → 报名信息页」，票种/张数/报名信息都在那两页收。）
         */
        hostOrder: { type: Boolean, default: false },
        /**
         * **选票 / 份数由宿主的页面链收**（2026-10-31，加性、缺省 false；线下活动）
         *
         * 用户原话：「活动拼团点击后，应该在 /pages/app/activity/ticket/ticket?id=11 中添加报名信息啊，
         * 然后再跳转到 /pages/app/activity/form/form?id=11&ticket=… 填写报名信息」——线下活动的商品是
         * 票券，拼团单要带「票种 + 张数 + 报名信息 id」，而这三样本来就在它自己的两张中间页里
         * （选票页 `app/activity/ticket` → 报名信息页 `app/activity/form`）。本区那只配置弹层
         * （票种 chips + 份数）是同一件事的第二处入口（硬约束 11）⇒ `hostTicket` 宿主这一档：
         * 点开团 / 参团 / 去凑团都不弹配置层、不在这里拼规格份数，直接把 `gbCtx()` 经 `order` 上抛，
         * 由宿主带进选票页；之后两跳由那两页原样搬运（键名只存 `common/utils/group-buy-order.js`）。
         * 参团态（`joinMode`）同样走这一档：团上那一档人数仍由 `gbCtx()` 带上，票种由选票页选。
         */
        hostTicket: { type: Boolean, default: false },
        /**
         * **这一场活动已不再接受报名**（2026-10-31，加性、缺省 false；线下活动）
         *
         * 用户原话：「如果报名已截止，那么立即拼团也不能点击」。宿主底栏那枚入口自己会置灰，
         * 但拼团这一件事还有**第二条入口**：卡里「他们正在拼团」每一行的「去凑团」——
         * 只灰底栏按钮的话，从那一行照样能进票券页一路走到结算，最后才被后端一句
         * 「当前活动暂不可用」拦下（硬约束 47：收起一枚按钮 ≠ 关掉那条路）。
         * 这一档把「正在拼团」整段收掉（它本身就是一条参与入口），开团/参团的口子再兜一层原因句。
         */
        closed: { type: Boolean, default: false },
    },
    emits: ['go-pay', 'ready', 'pick-spec', 'order'],
    data() {
        return {
            installed: false,
            // 「首屏那一发取数」是否已经发过（init 回包与 created 两条到达路径只放一次，见 checkInstall）
            installLoaded: false,
            loading: false,
            activity: null,
            teams: [],
            teamsTotal: 0,
            teamsPage: 1,
            // 最后一页第一行在下发列表里的下标（弹层底栏「去凑团」只参用户看得见的那一页）
            teamsPageStart: 0,
            teamsHasMore: false,
            teamsLoadStatus: 'loadmore',
            teamsLoading: false,
            // 导航防连点（点一下就跳提交订单页，本组件不再持有订单/支付状态）
            paying: false,
            // 倒计时（毫秒）：每秒续跑，已销毁闸门见 `gone()`
            now: Date.now(),
            timer: null,
            // 会话内活动到期：倒计时归零那一刻把这一区整段收掉、底栏入口一并撤（M-P1 无活动整枚不出）
            expired: false,
            // 预热态倒计时归零时只重取一次（服务端时钟略有偏差时不至于每秒重发）
            preheatArrived: false,
            // 访客埋点每个页面实例只发一次（重取/支付广播不把「访问次数」刷成几十）
            visitReported: false,
            // 页面上选中的规格 / 档位（2026-10-28）：底栏第二行价格与开团参数都读它。
            // 0 = 这件商品不吃规格（或只有一档，自动取那一档，不由用户选）
            pickedSpecId: 0,
            pickedLadderId: 0,
            // `host-spec` 时宿主那只规格组件已经收过、本组件不再问的两样：
            // 份数（实物规格组件里的数量）与校区（教务套餐规格组件里的校区）
            pendingCount: 0,
            pendingCampusId: 0,
        };
    },
    computed: {
        /** 预热态（2026-10-27）：活动还没开始，但商家开了「活动预热」⇒ 商详页出预告与开始倒计时 */
        isPreheat() {
            return !!(this.activity && this.activity.state === 'not_start');
        },
        /**
         * 受邀参团态（2026-10-30）：URL 带了团 id，且本区取到的活动/商品与团上那一场对得上。
         * **判据只存这一处**：底栏文案、凑团段/档位块的显隐、规格弹窗锁定、`@ready` 上抛的 join
         * 都读它；宿主页只用 `@ready.join` 收单独购买入口，不自己再判一遍 `gb_team`（硬约束 11）。
         *
         * 对不上的两档（活动已结束 / 商家换了新活动、会员卡滑到了别的卡）⇒ 退回正常购买链，
         * 不拿一个已经不存在的团去拼。
         */
        joinMode() {
            if (!(Number(this.joinTeam) > 0)) { return false; }
            if (!this.activity) { return false; }
            if (Number(this.joinActivity) > 0
                && Number(this.activity.activity_id) !== Number(this.joinActivity)) { return false; }
            if (Number(this.joinGoodsId) > 0
                && Number(this.activity.goods_id) !== Number(this.joinGoodsId)) { return false; }
            return true;
        },
        /**
         * join 态可选规格：团绑定商品、不绑定规格（2026-10-30 用户口径：
         * 「我拼一个 XXL 的衣服，分享给其他人也必须买 XXL 吗？」）——参团人可以选自己的规格。
         * 阶梯型只留「团上那一档 `joinLadder` 在该规格下有档位」的几档：换了规格却换不到
         * 团上那一档人数时，后端 `SpecLadder::row()` 会拒，界面上先不摆选项。
         */
        joinableSpecs() {
            const rows = this.specRows;
            if (!this.joinMode || !this.isLadder || !Number(this.joinLadder) || rows.length <= 1) {
                return rows;
            }
            const ok = {};
            (this.activity.ladder || []).forEach((row) => {
                if (Number(row.id) === Number(this.joinLadder)) {
                    ok[Number(row.spec_id)] = true;
                }
            });
            const filtered = rows.filter((r) => ok[Number(r.spec_id)]);
            // 老活动 / 档位行没带 spec_id：筛不出时别把整张表收空，交给后端按团上档位兜
            return filtered.length ? filtered : rows;
        },
        /** 这个规格能不能进团上那一档（非阶梯 / 单档恒 true；阶梯要求该规格配了同一档人数） */
        joinSpecSupported() {
            return (specId) => {
                if (!this.joinMode || !this.isLadder || !Number(this.joinLadder) || this.specRows.length <= 1) {
                    return true;
                }
                return (this.activity.ladder || []).some((row) => Number(row.id) === Number(this.joinLadder)
                    && Number(row.spec_id) === Number(specId));
            };
        },
        /** 团长那一档在本页活动里的当前 spec_id（老团存 0 时归一：0 当作第一档）。
         *  规格弹窗「选团长这一档仍吃团快照价」要拿**归一后**的 id 比，不能拿 URL 上的旧 id。 */
        joinTeamSpecId() {
            const rows = this.specRows;
            if (!rows.length) { return 0; }
            const want = Number(this.joinSpec) || 0;
            const hit = rows.find((r) => Number(r.spec_id) === want)
                || (want === 0 ? rows[0] : null);
            return hit ? Number(hit.spec_id) : 0;
        },
        /** 当前选中的规格行（直接去确认页那几档用它判库存；没有规格行时为空） */
        pickedSpecRow() {
            const rows = this.specRows;
            if (!rows.length) { return null; }
            const want = Number(this.pickedSpecId) || 0;
            return rows.find((r) => Number(r.spec_id) === want) || (want === 0 ? rows[0] : null);
        },
        /**
         * join 态还要不要开规格弹窗（2026-10-30）
         *
         * 与正常开团不同：join 态的阶梯档固定（团上那一档），**规格可以换**；只有
         * 「规格要让人选」或「份数还能选」这两件事值得再弹一层。课程 / 练习 / 打卡
         * （含阶梯型课程）在 join 态什么可选项都没有 —— 用户原话「单规格的商品，比如说课程，
         * 直接跳转到提交订单页面」；弹一只空壳只会多一次点击。
         * 判据与 `group-buy-config-popup` 里那两节同源：多档 ∨ 单档有名字 = 规格节；`count_max>=2`
         * = 份数节；会员卡（`specInline`）的规格在页面上，走另一支。
         */
        joinNeedsConfig() {
            const rows = this.joinableSpecs;
            if (!rows.length) { return false; }
            const hasSpec = rows.length > 1
                || String(rows[0].spec_text || rows[0].text || '') !== '';
            if (hasSpec) { return true; }
            const row = rows.find((r) => Number(r.spec_id) === Number(this.pickedSpecId)) || rows[0];
            return Number(row && row.count_max) >= 2;
        },
        /** 购买弹幕素材（后端已脱敏；未开启/预热态/空列表都不出）。
         *  轮播下标与计时器已随渲染搬进 `group-buy-danmu.vue`（2026-10-29），本区只转发这一份素材 */
        danmuList() {
            return (this.activity && this.activity.buyers) || [];
        },
        /** 阶梯起价 / 展示价 / 白标 / 「起」四处判据已随横幅挪进 `group-buy-banner.vue`（2026-10-27），
         *  本区不再保留第二份（硬约束 11：同一组展示口径只许一处）。 */
        /** 邀新提示条的第二半句：人数吃后端下发的 invite_min，没给就只留第一句 */
        inviteMinText() {
            const n = Number((this.activity && this.activity.invite_min) || 0);
            return n > 0 ? ' · 每团需 ' + n + ' 名新用户' : '';
        },
        /** 倒计时终点（毫秒）：本区只拿它判「会话内到期 ⇒ 整区收掉 + 底栏入口撤掉」，
         *  横幅那一格每秒钟的数字由 `group-buy-banner` 自己按同一口径算 */
        countLeft() {
            const at = this.isPreheat
                ? (Number(this.activity && this.activity.start_time) || 0)
                : (Number(this.activity && this.activity.end_time) || 0);
            if (!at) { return 0; }
            return Math.max(0, at * 1000 - this.now);
        },
        /**
         * 传给两只弹层的活动快照：`activity` 还没到手时给一个空对象
         * （本组件 `activity` 初值是 `null`，而 Vue 的 prop `default` 只兜 `undefined`，
         * 直接把 `null` 传下去会让子组件读 `this.activity.xxx` 抛错）。
         *
         * **不许写回模板里的 `activity || {}`**：小程序 WXML 的表达式解析器不支持**空对象字面量**，
         * 编出来是 `{{activity||{}}}`，开发者工具报
         * `Bad attr activity ... unexpected token $` ⇒ 整个 components/tz/group-buy-area.wxml
         * 编译失败、所有挂了拼团区的商详页打不开（2026-10-29 实测，wcc 复现）。
         * 判据只在 JS 里做，模板只引用这一个 computed。
         */
        childActivity() {
            return this.activity || {};
        },
        /** 商详页内联凑团那一块只摆前三行（图 3 同形），其余走「查看全部」开弹层 */
        inlineTeams() {
            return (this.teams || []).slice(0, 3);
        },
        /**
         * 这一段**要不要取数**（商家开关 `show_teams` ∧ 我不在这一场有进行中的团）。
         * 两处取数闸门（`reload()` / `loadInitLegsOnce()`）读这一枚：两轴任一不成立时
         * 再发一发 `activity/teams` 就是白跑一条腿。
         *
         * **不能在这里 ∧ `teams.length`**：那样「要不要取数」与「取回来有几行」互相等，
         * 列表永远取不到（判据自锁的另一种形态）。
         */
        teamsEnabled() {
            if (!this.activity) { return false; }
            // join 态不取/不摆「别人正在拼团」：这一趟只认 URL 上那一个团，
            // 摆一排别的团就等于给受邀人换一个团的入口（2026-10-30 用户点名）
            if (this.joinMode) { return false; }
            return Number(this.activity.show_teams) === 1 && !this.myTeam;
        },
        /**
         * 这一段**要不要出现**：取数轴成立 ∧ 真有可参与的团（`teams.length > 0`）。
         *
         * 三枚轴各有一次用户点名（见模板那一块的注释）：① 不按列表空不空决定「取不取数」；
         * ② 我已在团里时整段不出（2026-10-29 `circle/presale?id=3168`）；③ **没有可参与的团
         * （含「还没有人开团」）也不摆这一段**（同日同路由再点名）——空态与失败句已随整段撤掉，
         * 开团入口仍在底栏那枚 `tz-group-buy-btn`，所以这不是「入口自锁」。
         *
         * 首屏与取数失败那一拍 `teams` 都是空数组 ⇒ 不占位、不出骨架（硬约束 12）。
         */
        showTeams() {
            // 报名已截止（2026-10-31）：这一整段是「别人正在拼团，你可直接参与」的入口列表，
            // 参与已经关了 ⇒ 整段不出（不留一枚点了只能被后端拒的「去凑团」）
            return !this.closed && this.teamsEnabled && this.teams.length > 0;
        },
        /** 我在这一场「进行中」的团（2026-10-27 图 3）：后端 `my_team.team_id`，没有就是 null。
         *  判据只存后端一处（成员行 + 团状态两跳，见 `GoodsArea::myTeam`），前端不自己拼 */
        myTeam() {
            const t = this.activity && this.activity.my_team;
            const id = Number(t && t.team_id) || 0;
            return id > 0 ? { teamId: id } : null;
        },
        /** 这件商品的在售规格（后端 `activity.specs`，吃规格的六类才有；价格是该档拼团价） */
        specRows() {
            const rows = (this.activity && this.activity.specs) || [];
            return Array.isArray(rows) ? rows : [];
        },
        isLadder() { return !!(this.activity && this.activity.type === 'ladder'); },
        /** 这件商品吃不吃「规格」（后端 `has_spec`，判据只存 `GoodsSpecs::hasSpec()` 一处）：
         *  课程/练习/打卡不吃 ⇒ 「立即开团」没有规格/档位/份数可选，直接去提交订单页 */
        hasSpec() { return Number(this.activity && this.activity.has_spec) === 1; },
        /** 底栏「立即开团」要不要先开规格/档位/份数弹窗：多档规格、阶梯型、或吃规格的单档（份数有意义） */
        needsConfig() { return this.isLadder || this.specRows.length > 1 || this.hasSpec; },
        /** 选中的规格：没选过就落到第一档（页面一出现就有确定的价格，不留「¥-」） */
        pickedSpec() {
            const rows = this.specRows;
            if (!rows.length) { return null; }
            const hit = rows.find((r) => Number(r.spec_id) === Number(this.pickedSpecId));
            return hit || rows[0];
        },
        /** 当前规格下可选的档位（阶梯型按 spec_id 过滤；老档位没有 spec_id 时回落整表） */
        tiers() {
            if (!this.isLadder) { return []; }
            const rows = (this.activity && this.activity.ladder) || [];
            if (this.specRows.length <= 1) { return rows; }
            const specId = this.pickedSpec ? Number(this.pickedSpec.spec_id) : 0;
            const hit = rows.filter((r) => Number(r.spec_id) === specId);
            return hit.length ? hit : rows;
        },
        pickedTier() {
            const rows = this.tiers;
            if (!rows.length) { return null; }
            const hit = rows.find((r) => Number(r.id) === Number(this.pickedLadderId));
            return hit || rows[0];
        },
        /**
         * 页面上要不要摆档位块（2026-10-29 用户改口径）：**先看「立即开团」那只弹窗里有没有规格可选**。
         * 吃规格的六类后端 `has_spec=1` ⇒ `group-buy-config-popup` 里必摆规格 chips（`hasSpec`
         * ＝多档 ∨ 单档有名字）⇒ 本区整块不出，规格只在那只弹窗里选一次
         * （页面与弹窗各摆一份＝同一件事两处可选，2026-10-29 用户在 `vip/center` 就是这么读出来的）。
         * 于是剩下的唯一一档是「阶梯型 + 不吃规格的三类」：那只弹窗里只有人数档位、没有规格，
         * 档位块摆在页面上（图 3 那一排 N人团）。判据只读后端 `has_spec`，端上不自己数规格行。
         */
        showPicker() {
            // 规格在页面上选的那一档（会员卡）也把人数档摆在同一片页面里：
            // 它的「规格组件」就是那排时长卡，没有弹窗可挂（`specInline`）
            // join 态不摆：人数档由团上快照定死，页面上再给一排可选的档就是第二处入口
            if (this.joinMode) { return false; }
            return this.isLadder && (!this.hasSpec || this.specInline);
        },
        /**
         * 底栏那枚「立即开团」第二行的价格（图 1「¥1」/ 图 3「¥1起」/ 图 2「¥5.00」）：
         * 阶梯取选中档、多规格取选中档、单规格取活动价。**只作展示**，实付由 `team.open` 回体为准。
         */
        entryPrice() {
            if (!this.activity || this.expired) { return ''; }
            // join 态按钮只写「加入拼团」一行：价格由弹窗头区按团价说，底栏窄格里再塞一个价
            // 反倒会被读成「这一团就是这个价」（团价是开团那一刻的快照，可能已经不是活动现价）；
            // 已在团里那一档仍是「查看拼团详情」，保留原来的价格行（逐字不变）
            if (this.joinMode && !this.myTeam) { return ''; }
            if (this.isLadder) {
                return this.pickedTier ? '¥' + this.money(this.pickedTier.price) : '';
            }
            if (this.pickedSpec) {
                return '¥' + this.money(this.pickedSpec.price);
            }
            return '¥' + this.money(this.activity.price);
        },
        /** 底栏那枚按钮的文案（宿主只读这一枚字符串，格式化只存这里一处）。
         *  2026-10-27 起三档与竞品对齐：**我在拼 → 查看拼团详情**（图 3）、
         *  预热 → 即将开团（按钮仍在，点一下给一句原因）、其余 → 立即开团（图 6）。
         *  拼团价由上方横幅承担，按钮不再拼「¥x 拼团」那样一串（窄格里价格与动作挤不下） */
        entryText() {
            if (this.myTeam) { return '查看拼团详情'; }
            if (this.joinMode) { return '加入拼团'; }
            if (this.isPreheat) { return '即将开团'; }
            return '立即开团';
        },
    },
    created() {
        this.checkInstall();
        // 组件可能比 `common.init` 先挂载（商详页与 init 并行）：init 回包后重判一次，
        // 已装就补上这一发取数，未装就整段不出、一条请求都不发
        this._offInstallReady = onSystemConfigReady(() => this.checkInstall());
    },
    beforeDestroy() {
        this.clearTimer();
        if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
    },
    beforeUnmount() {
        this.clearTimer();
        if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
    },
    methods: {
        /**
         * 安装态三态判据（`pluginState`：true 已装 / false 未装 / null 本会话 init 还没回包）。
         * **null 不当未装**：先整段不出，等 `onSystemConfigReady` 那一次重判再补上取数；
         * **也不当已装**：没拿到 flag 之前一条请求都不发（未装时发出去只会报「功能未安装」）。
         * `installLoaded` 只让「首屏那一发」发生一次（init 回包与 created 两条到达路径都会走到这里）。
         *
         * 2026-10-29 加**预取**这一档：宿主把后端已经算好的摘要传进来（`preload`），
         * 它就是「插件在位」的事实本身（后端 `DetailGroupBuy` 先过 `GroupBuy::ready()` 才取数），
         * 所以 init 还没回包也先渲染 —— 用户不必为了一个已经到手的活动再等一跳 init。
         */
        checkInstall() {
            const state = pluginState('group_buy');
            const pre = this.preload && this.preload.activity_id ? this.preload : null;
            this.installed = FEATURE_GROUP_BUY && (state === true || !!pre);
            if (!this.installed) {
                // join 态的商品页要靠 `@ready.join` 把「单独购买」收起来：插件不在 / 取不到活动时
                // 这里必须抛一次 null，否则宿主停在 hide-main 上、底栏只剩一条空栏（硬约束 22 的退出分支）
                this.emitReady();
                return;
            }

            if (pre && !this.installLoaded) {
                // 首屏：直接吃预取，一条活动请求都不发（下拉刷新/支付广播仍走 reload 现取）
                this.installLoaded = true;
                this.applyPreload(pre);
                return;
            }
            if (!this.installLoaded && state === true) {
                this.installLoaded = true;
                // 后端明确回 `null`（没有进行中活动）：首屏连这一发都不发
                // （缺省空对象 = 旧后端 / 宿主没传，**不能**落进这一支 —— 小程序里
                //  「没传的 Object prop」是 null，见 `preload` prop 那条注释）
                if (this.preload === null) {
                    this.emitReady();
                    return;
                }
                this.reload();
                return;
            }
            // 预取已渲染、init 此刻才回包（或首屏时它还没就绪）：补发「在线凑团」那一条腿
            // （`teams` 是分页列表，摘要里只有 `show_teams` 开关不带行；且请求层在 init 未回包时会拦插件地址）
            this.loadInitLegsOnce(state);
        },
        /**
         * 用宿主预取的摘要先把首屏渲染出来（2026-10-29）；后续刷新仍走 `reload()`
         * 这一步全是本地装配（倒计时、弹幕、选中档、底栏摘要），不发 `activity/detail`。
         */
        applyPreload(area) {
            this.activity = area;
            this.expired = false;
            this._fromPreload = true;
            this.initPick();
            this.emitReady();
            this.now = Date.now();
            this.startTimer();
            this.loadInitLegsOnce(pluginState('group_buy'));
        },
        /**
         * 预取那一档的两条**剩余腿**：访客埋点 + 在线凑团（都只发一次）
         * 请求层在 init 未回包时会拦掉 `app/group_buy/*`，所以等到 `state === true` 才发；
         * init 回包后 `onSystemConfigReady` 会再走一次 `checkInstall`，把这一发补上。
         */
        loadInitLegsOnce(state) {
            if (state !== true || this._initLegsDone) { return; }
            this._initLegsDone = true;
            this.reportVisit();
            // 不取数（商家没开凑团 / 我已在团里）就不发这一条腿；这里只能读 `teamsEnabled`，
            // **不能读 `showTeams`**（它 ∧ 了 `teams.length > 0`，取数前恒为空 ⇒ 永远取不到）
            if (this.teamsEnabled) {
                this.getTeams();
            }
        },
        /** 活动摘要上抛：宿主底栏那枚按钮的显隐与文案都吃这一条（`null` = 收掉按钮）。
         *  第二枚 `activity` 是从 2026-10-27 起顺手给宿主的：把横幅提到商详卡价格格的页面
         *  （课程详情页）要拿它渲染 `<tz-group-buy-banner>`；没提走的页面只读 `text`，不受影响。
         *  **会话内到期也走 `null`**：活动结束那一刻起底栏按钮、这一区、宿主价格格里的横幅同时消失
         *  （硬约束 27②：不留死入口；价格行随之回到原位） */
        emitReady() {
            const live = this.activity && !this.expired;
            this.$emit('ready', live
                ? { text: this.entryText, inTeam: !!this.myTeam, join: this.joinMode, activity: this.activity, price_text: this.entryPrice }
                : null);
        },
        /**
         * 重取拼团区（首屏 / 下拉刷新 / 支付成功广播到达时调）
         * **一条腿回来不撤 loading**：两条腿都收尾才关（硬约束 22）
         */
        reload() {
            if (!this.installed) { return; }
            this.loading = true;
            this.teamsPage = 1;
            // 这一发自己会走 reportVisit + getTeams，预取那套「剩余腿」不必再来一遍
            this._initLegsDone = true;
            // 序号守卫（2026-10-28）：这一发有**四条来路**——首屏 / 下拉刷新 / 支付成功广播 / 预热倒计时归零，
            // 彼此可能同时在路上（用户下拉一下就是整页取数 + 拼团区各发一发）。接口回的是「发出去那一刻」的快照，
            // 晚到的旧回体一旦落进 `this.activity`，界面上读出来就是「下拉刷新之后拼团信息还是老的」
            // （页面侧 `getData` 早就有 `_getDataToken` 这同一条纪律，见 `pages/course/detail/js.vue`）。
            // 只采纳**最后一次发出**的那一发；过期回体连 loading 都不许撤（撤了会把后一发那趟的骨架提前关掉）。
            const seq = (this._reloadSeq || 0) + 1;
            this._reloadSeq = seq;
            this.$api('group_buy.activity.detail', {
                goods_type: this.goodsType, goods_id: this.goodsId,
            }).then((ret) => {
                if (this.gone()) { return; }
                if (seq !== this._reloadSeq) { return; }
                this.activity = (ret && ret.code === 1 && ret.data) || null;
                this.expired = false;
                // 现取回体已经盖掉预取那一份：后续闸门失败不再享受「保留已渲染内容」的保护
                this._fromPreload = false;
                this.initPick();
                this.emitReady();
                if (this.activity) {
                    this.now = Date.now();
                    // 预热倒计时只允许触发一次重取：真到了开始时刻、且服务端仍回 not_start 时停下等下一轮
                    if (this.activity.state !== 'not_start' || Number(this.activity.start_time) * 1000 > this.now) {
                        this.preheatArrived = false;
                    }
                    this.startTimer();
                    this.reportVisit();
                } else {
                    this.clearTimer();
                }
                // 取数闸门读 `teamsEnabled`（不是 `showTeams`：后者 ∧ 了「这回有几行」，
                // 取数前恒为空，读它就成了判据自锁）
                if (this.teamsEnabled) {
                    this.getTeams();
                } else {
                    this.teams = [];
                    this.teamsTotal = 0;
                    this.teamsHasMore = false;
                    this.teamsLoading = false;
                    this.loading = false;
                }
            }).catch((err) => {
                if (this.gone()) { return; }
                // 过期回体（失败也算回体）同样丢弃：别让前一发的失败把后一发刚取回的活动清成 null
                if (seq !== this._reloadSeq) { return; }
                // 预取已渲染的这一档，闸门拦下来只可能是「本会话 init 还没回包」（后端既然给了摘要，
                // 插件一定在位）⇒ 保留已渲染的内容，不把一次手动下拉换成一块空白
                if (this._fromPreload && err && err.plugin) {
                    this.loading = false;
                    return;
                }
                // 请求层拦下的「插件未装 / init 未就绪」那一档带 `plugin` 标记：本区整段收掉，
                // 不留空位、不重试（flag 已在 plugin-guard 里就地翻成 false）
                if (err && err.plugin) { this.installed = false; }
                this.activity = null;
                this.teams = [];
                this.teamsTotal = 0;
                this.teamsHasMore = false;
                this.loading = false;
                this.clearTimer();
                this.emitReady();
            });
        },
        /** 在线凑团：**服务端分页**（M3 / 硬约束 32）—— 每页 10、总数吃后端下发的 `total` */
        getTeams() {
            const page = this.teamsPage;
            this.teamsLoading = true;
            this.teamsLoadStatus = 'loading';
            this.$api('group_buy.activity.teams', { activity_id: this.activity.activity_id, page: page, limit: 10 })
                .then((ret) => {
                    if (this.gone()) { return; }
                    const d = (ret && ret.code === 1 && ret.data) || {};
                    const rows = d.rows || [];
                    // 新到这一页的起始下标（追加之前取长度；第 1 页恒 0）
                    this.teamsPageStart = page === 1 ? 0 : this.teams.length;
                    // 业务码非 1 ⇒ `d` 是空对象、`rows` 为空 ⇒ 这一段整段不出（2026-10-29 起
                    // 「没有可参与的团」与「这一发没取到」都不摆那一段，所以不再需要一句失败文案；
                    // 不摆 ≠ 说假话：页面上不出现「还没有人开团」这句话）
                    this.teams = page === 1 ? rows : this.teams.concat(rows);
                    this.teamsTotal = Number(d.total) || 0;
                    this.teamsHasMore = !!d.has_more;
                    this.teamsLoadStatus = this.teamsHasMore ? 'loadmore' : 'nomore';
                })
                .catch(() => {
                    if (this.gone()) { return; }
                    if (page === 1) { this.teams = []; }
                    this.teamsLoadStatus = 'loadmore';
                })
                .then(() => {
                    if (this.gone()) { return; }
                    this.teamsLoading = false;
                    this.loading = false;
                });
        },
        /** 弹层滚到底：还有下一页、且没有在飞的那一发时才前进（M3） */
        loadMoreTeams() {
            if (this.teamsLoading || !this.teamsHasMore) { return; }
            this.teamsPage += 1;
            this.getTeams();
        },
        /** 已销毁闸门（硬约束 23 兜底；主修法在 main.js 的 `$scope.setData` 出口） */
        gone() { return this._isDestroyed === true; },
        /**
         * 商详页内联凑团行的剩余时间（图 3：`剩余23:59:19`）
         * ⚠ `expire_time` 是秒级、`this.now` 是毫秒，必须 ×1000（与弹层 `leftOf` 同一份口径）
         */
        teamLeft(team) {
            const end = Number(team && team.expire_time) || 0;
            if (!end) { return ''; }
            const total = Math.max(0, Math.floor((end * 1000 - this.now) / 1000));
            if (total <= 0) { return '已过期'; }
            const days = Math.floor(total / 86400);
            return '剩余' + (days > 0 ? days + '天' : '')
                + pad2(Math.floor((total % 86400) / 3600)) + ':'
                + pad2(Math.floor((total % 3600) / 60)) + ':'
                + pad2(total % 60);
        },
        /** 开团入口（宿主底栏那枚按钮点的就是这一枚）。
         *  三档去处：**我在拼 → 直进本团详情**（图 3）、预热 → 说一句原因、其余 → 开凑团弹层 */
        openPopup() {
            // 会话内已到期：这一区与底栏按钮都已撤，兜底再拦一次（历史栈/异步竞态的那一拍）
            if (this.expired || !this.activity) { return; }
            // 预热态：按钮可见但活动没开始，**说一句原因**（不给一个点了没反应的按钮）
            if (this.isPreheat) {
                uni.showToast({ title: '活动尚未开始，请稍后再来', icon: 'none' });
                return;
            }
            if (this.myTeam) {
                this.$nav.to('/pages/app/group_buy/detail/detail?team_id=' + this.myTeam.teamId);
                return;
            }
            // 报名已截止（2026-10-31）：底栏入口由宿主置灰，这里兜住历史栈 / 异步竞态那一拍。
            // **排在 `myTeam` 之后**：已在团里的人这一枚是「查看拼团详情」，报名关了也要能看自己的团
            if (this.closed) {
                uni.showToast({ title: '报名已截止', icon: 'none' });
                return;
            }
            // 受邀参团态（2026-10-30）：只认 URL 上那一个团，不开凑团弹层、不给开新团入口。
            // 规格按团上快照锁定后再去提交订单页（`team.join` 只认团上那一档）。
            if (this.joinMode) {
                this.openJoin();
                return;
            }
            // 线下活动（2026-10-31 用户点名「活动拼团点击后应该在选票页添加报名信息，再去报名信息页」）：
            // 票种与份数由宿主自己的「选票页 → 报名信息页」收，本区那只配置弹层（票种 chips + 份数）
            // 就是同一件事的第二处入口 ⇒ 直接交上下文，不弹层（与 `host-spec` 同一档道理）。
            // **阶梯型仍是例外**：人数档只有这一层能问（选票页不认识档位）⇒ 仍开那一只，
            // 但只问档位（规格/份数两节由下面弹层的 `hide-spec` / `hide-count` 收起）。
            if (this.hostTicket && !this.isLadder) {
                this.goBuy(this.gbCtx());
                return;
            }
            // 2026-10-28：底栏「立即开团」先开**规格/档位/份数**弹窗（两张参照图那一只），
            // 选完直接去提交订单页；凑团列表另有入口（他们正在拼团 / 查看全部）。
            // 2026-10-29（用户点名 /pages/course/detail/detail?id=26020）：「课程属于单规格商品，
            // 不需要弹出规格弹窗并选择数量」——不吃规格又非阶梯的（课程/练习/打卡）这一层只有
            // 「购买数量」一项，直接带去提交订单页，不摆一只没有可选项的弹层。
            // 2026-10-29：规格交给宿主页自己的商品规格组件（`host-spec`）——那只里面才有校区、
            // 套餐权益、内含商品、实物多属性这些东西；本组件只上抛一枚事件，不替它选规格。
            if (this.hostSpec) {
                this.$emit('pick-spec', { activity: this.activity, specId: this.pickedSpecId });
                return;
            }
            if (!this.needsConfig) {
                this.goBuy({ activity_id: this.activity ? this.activity.activity_id : 0 });
                return;
            }
            if (this.$refs.config) { this.$refs.config.open(); }
        },
        /**
         * 受邀参团：底栏「加入拼团」的唯一出口（2026-10-30）
         *
         * **团绑定的是商品，不是规格**（同日用户口径：「我拼一个 XXL 的衣服，分享给其他人也必须
         * 买 XXL 吗？」）——参团人可以选自己的规格（会员卡时长 / 实物尺码 / 套餐档位…），
         * 只有阶梯档沿用团上那一档（团队人数由团长开团时定死）。
         *
         * 三档：
         *  - 会员卡（`specInline`）：规格就是页面那排时长卡，换时长由页面 `changeSku` 回写 ⇒ 直接去确认页；
         *  - 不吃规格（课程/练习/打卡）：没有可选的规格/份数 ⇒ 直接去确认页；
         *  - 其余（含线下活动票种 / 六类多规格）：开规格弹窗，**规格可换**、阶梯档固定为团上那一档，
         *    确认后带着 `team_id` + 选中的规格去确认页。
         *
         * **绝不在这里开凑团弹层**：那一层里有「开新团」与别的团，受邀人这一趟只应加入分享给他的那一团。
         */
        openJoin() {
            if (!this.activity) { return; }
            // 阶梯型且这件商品吃规格：团上那一档人数在所有在售规格里都没配档位 ⇒ 进不了这一团
            // （课程/练习/打卡不吃规格，`hasSpec=0`，不能拿空 specs 把正常参团挡掉）
            if (this.joinMode && this.isLadder && this.hasSpec && !this.joinableSpecs.length) {
                uni.showToast({ title: '该拼团档位暂无可选规格', icon: 'none' });
                return;
            }
            // 线下活动（2026-10-31）：票种在宿主的选票页选（`hostTicket`）⇒ 本区不弹规格/配置层，
            // 只把团 id + 团上那一档人数交出去，报名信息也由宿主的中间页收
            if (this.hostTicket) {
                this.goBuy(this.gbCtx({ team_id: this.joinTeam }));
                return;
            }
            // 页面级规格（会员卡）与「没有可选的规格、也没份数可选」那几档：直接进确认页
            if (this.specInline || !this.joinNeedsConfig) {
                // 直接去确认页这一档没有弹窗兜底：选中那档售罄 / 限购用尽就当场说原因
                if (this.pickedSpecRow && !specBuyable(this.pickedSpecRow)) {
                    uni.showToast({ title: '该规格已售罄', icon: 'none' });
                    return;
                }
                if (this.joinMode && this.isLadder && !this.joinSpecSupported(this.pickedSpecId)) {
                    uni.showToast({ title: '该规格不支持当前拼团档位', icon: 'none' });
                    return;
                }
                this.goBuy(this.gbCtx({ team_id: this.joinTeam }));
                return;
            }
            // 规格弹窗默认选团上那一档（团长已选），可选别的；阶梯档固定为团上那一档
            const joinRows = this.joinableSpecs;
            let joinSpec = Number(this.joinSpec) || 0;
            if (joinRows.length && !joinRows.some((r) => Number(r.spec_id) === joinSpec)) {
                joinSpec = Number(joinRows[0].spec_id) || 0;
            }
            this.pickedSpecId = joinSpec;
            this.pickedLadderId = Number(this.joinLadder) || 0;
            this.emitReady();
            if (this.$refs.config) {
                this.$refs.config.open({ specId: joinSpec, ladderId: Number(this.joinLadder) || 0 });
            }
        },
        /**
         * 宿主那只规格组件选完了（`host-spec` 模式）：把结果记回来，再决定还要不要问第二步。
         *
         * 商品规格组件里没有、只有拼团这一层才有的是：**阶梯档（拼团类型）**。份数与校区如果宿主
         * 已经收过（实物规格组件的数量 / 教务套餐规格组件的校区），就随参数带下去、不再问第二遍。
         * 两者都不需要 ⇒ 直接去提交订单页（少一次弹层）。
         * @param {Object} payload { specId, ladderId?, count?, campusId? }
         */
        afterSpec(payload) {
            const p = payload || {};
            // 注意 0 是**合法**的 spec_id（会员卡按下标取档，第 0 档就是 spec_id 0）⇒ 只判「给了没有」
            if (p.specId !== undefined && p.specId !== null) { this.pickedSpecId = Number(p.specId) || 0; }
            const ladderChosen = Number(p.ladderId) > 0;
            if (ladderChosen) {
                // 档位必须属于**这一档规格**（宿主换过规格后旧档位就失效了）：对不上落这一档的第一档，
                // 否则页面显示 4人团、下单带过去的却是另一档规格的档位 id
                const hit = this.tiers.filter((r) => Number(r.id) === Number(p.ladderId))[0];
                this.pickedLadderId = hit ? Number(hit.id) : (this.tiers.length ? Number(this.tiers[0].id) : 0);
            }
            this.pendingCount = Math.max(0, Number(p.count) || 0);
            this.pendingCampusId = Number(p.campusId) || 0;
            this.emitReady();
            // 阶梯型：**人数额已经在规格弹窗里选掉了**（2026-10-29 用户点名「在这个选择商品规格弹窗
            // 里面，增加这个阶梯的选择」）⇒ 直接进提交订单页，不再开第二步弹窗（少一次点击）。
            // 没带档位的两档仍要问一次：① 老宿主还没升级；② 规格弹窗这一次没有档位可选。
            if (this.isLadder && !ladderChosen) {
                if (this.$refs.config) { this.$refs.config.open(); }
                return;
            }
            this.goBuy(this.gbCtx());
        },
        /**
         * 宿主在**页面上**换了规格（`specInline` 那一档，如会员卡那排时长卡）：规格与档位一起落到本组件。
         * 人数档跟着落这一档规格的第一档 —— 不换的话页面会摆着上一档规格的档位，点开团带过去的价对不上。
         * @param {Number|String} specId 新的规格 id（会员卡是 sku 下标，0 是合法值）
         */
        pickSpecId(specId) {
            this.pickedSpecId = Number(specId) || 0;
            const tiers = this.tiers;
            if (this.joinMode) {
                // join 态阶梯档固定为团上那一档：换规格只换规格，不把人数档重置成第一档
                const hit = tiers.find((r) => Number(r.id) === Number(this.joinLadder));
                this.pickedLadderId = hit
                    ? Number(hit.id)
                    : (Number(this.joinLadder) || (tiers.length ? Number(tiers[0].id) : 0));
            } else {
                this.pickedLadderId = tiers.length ? Number(tiers[0].id) : 0;
            }
            this.emitReady();
        },
        /**
         * 宿主在页面上选完规格（`host-spec` + `specInline` 那一档，如会员卡）时的默认载荷：
         * 规格与人数档都读本组件此刻选中的那一份 —— 宿主不再自己拼一份 `specId / ladderId`
         * （两处各拼一次就会出现「页面显示 4人团、下单带的是 5人档」那种分叉）
         * @return {Object} { specId, ladderId }
         */
        currentPick() {
            return { specId: this.pickedSpecId, ladderId: this.pickedLadderId };
        },
        /** 拼团上下文（开团参数）：`afterSpec` 与第二步弹窗「确定」共用一份，别各拼一次 */
        gbCtx(extra) {
            const ctx = { activity_id: this.activity ? this.activity.activity_id : 0 };
            // 宿主选过规格（`host-spec`）时 spec_id 必须带 —— 包括会员卡那一档 spec_id = 0
            if (this.hostSpec || this.pickedSpecId) { ctx.spec_id = this.pickedSpecId; }
            if (this.pickedLadderId) { ctx.ladder_id = this.pickedLadderId; }
            if (this.pendingCount > 1) { ctx.count = this.pendingCount; }
            if (this.pendingCampusId) { ctx.campus_id = this.pendingCampusId; }
            return Object.assign(ctx, extra || {});
        },
        /** 规格弹窗「确定」：把选中项记回页面（卡片与底栏价格跟着变），再带去提交订单页 */
        onConfigConfirm(payload) {
            if (payload) {
                // 规格：第二步模式下弹窗收着规格、回传的就是宿主选的那一档；非第二步模式用弹窗里选的
                if (payload.specId) { this.pickedSpecId = Number(payload.specId) || 0; }
                if (payload.ladderId) { this.pickedLadderId = Number(payload.ladderId) || 0; }
                // 份数：宿主那只组件已经收过（实物）就沿用它，别再被第二步弹窗的 1 覆盖
                if (payload.count > 1 && !this.pendingCount) { this.pendingCount = payload.count; }
                this.emitReady();
            }
            // join 态：确认的是团上那一档（弹窗已锁），参数里把 team_id 一起带过去；
            // 正常开团档不传 team_id，逐字不变
            this.goBuy(this.gbCtx(this.joinMode ? { team_id: this.joinTeam } : null));
        },
        /** 在线凑团那一段（商详页内联的标题行 / 「查看全部」）：**永远开弹层**，
         *  与底栏那枚「我在拼 → 详情」两档互不影响 */
        openTeams() {
            if (this.expired || !this.activity || this.isPreheat || this.joinMode) { return; }
            if (this.$refs.popup) { this.$refs.popup.open(); }
        },
        /** 金额格式化（两行价格与卡片都用它，别在模板里各写一份 toFixed） */
        money(v) {
            return (Number(v) || 0).toFixed(2);
        },
        /**
         * 活动换了 / 首屏回来：把选中项落到**仍存在 ∧ 还能买**的那一档上
         * （商家删了规格、或换了个活动 ⇒ 旧的 spec_id 不能继续用，否则开团参数指向不存在的那档；
         *  那一档已售罄 / 限购用尽 ⇒ 默认选中要跳过它，否则页面标签指着买不了的一档，
         *  2026-10-29 用户点名「库存不足是在规格选择中直接禁用啊」）
         */
        initPick() {
            // join 态：默认选团长那一档，可换别人的规格；团上那一档人数固定（阶梯只看这一档有配的规格）
            if (this.joinMode) {
                // 团上那一档规格只是**团长已选**（2026-10-30 口径）：默认选它；它若已下架 /
                // 不支持团上那一档人数，就落到第一档可选的规格（不让受邀人卡在一个死默认上）
                const joinRows = this.joinableSpecs;
                let want = Number(this.joinSpec) || 0;
                if (joinRows.length && !joinRows.some((r) => Number(r.spec_id) === want)) {
                    want = Number(joinRows[0].spec_id) || 0;
                }
                this.pickedSpecId = want;
                const joinTiers = this.tiers;
                const hitJoin = joinTiers.find((r) => Number(r.id) === Number(this.joinLadder));
                this.pickedLadderId = hitJoin
                    ? Number(hitJoin.id)
                    : (Number(this.joinLadder) || (joinTiers.length ? Number(joinTiers[0].id) : 0));
                return;
            }
            const rows = this.specRows;
            const keep = pickSpecRow(rows, this.pickedSpecId);
            this.pickedSpecId = keep ? Number(keep.spec_id) : 0;
            const tiers = this.tiers;
            const keepTier = tiers.find((r) => Number(r.id) === Number(this.pickedLadderId));
            this.pickedLadderId = keepTier ? Number(keepTier.id) : (tiers.length ? Number(tiers[0].id) : 0);
        },
        /** 页面上换档位（规格只在弹窗里选，页面这一处只剩档位块；2026-10-29） */
        pickLadder(row) {
            this.pickedLadderId = Number(row.id) || 0;
            this.emitReady();
        },
        /** 弹层里改了选择：页面上那一份跟着变（两处读同一份状态，不各存一个 selected） */
        onPopupPick(payload) {
            if (payload && payload.specId) {
                this.pickedSpecId = Number(payload.specId) || 0;
                const tiers = this.tiers;
                this.pickedLadderId = tiers.length ? Number(tiers[0].id) : 0;
            }
            if (payload && payload.ladderId) {
                this.pickedLadderId = Number(payload.ladderId) || 0;
            }
            this.emitReady();
        },
        /** 弹层「开新团」（`create`，不是 `open`）：带上此刻选中的那一档 */
        handleCreate(payload) {
            if (this.closed) { uni.showToast({ title: '报名已截止', icon: 'none' }); return; }
            const ctx = { activity_id: payload.activityId };
            if (payload.ladderId) { ctx.ladder_id = payload.ladderId; }
            // 选中的那一档规格（2026-10-28 多规格）：后端按它取价、建团、装箱
            if (payload.specId) { ctx.spec_id = payload.specId; }
            this.goBuy(ctx);
        },
        /** 弹层「去凑这个团」（`join`）：带这一团的 id */
        handleJoin(payload) {
            if (this.closed) { uni.showToast({ title: '报名已截止', icon: 'none' }); return; }
            this.goBuy({ activity_id: payload.activityId, team_id: payload.teamId });
        },
        /**
         * 开团 / 参团入口：**带上拼团上下文去提交订单页**（2026-10-16 用户点名
         * 「拼团付款为什么不跳转提交订单页面」）——与全站购买流同一张确认页；提交那一刻
         * 由 `submit-order.vue` 在拼团模式下把建单口换成 `team.open/join`。
         *
         * 四条纪律：
         *  ① 未登录先弹登录再走（口径同课程页 `buyCheck`）：把人送进一张必然 401 的链，
         *     读出来就是「点了没反应」（硬约束 27）；
         *  ② **金额只作展示**：确认页上的拼团价与实付都以 `team.open/join` 回体为准；
         *  ③ 提交失败不许前进、支付面板结果这些**都归提交订单页管**；
         *  ④ 参数全用扁平 `gb_*` 键（小程序端 URL 稳）；`goodsList` 传空数组占位。
         *
         * `hostOrder` 宿主（教务套餐，2026-10-30）不在这里导航：只把 `ctx` 经 `order` 上抛，
         * 由宿主的确认报名页收完校区与学生再进结算页（同一组 `gb_*` 键，键名收在
         * `common/utils/group-buy-order.js`）。
         * @param {Object} ctx {activity_id, team_id?, ladder_id?, spec_id?, count?, campus_id?}
         */
        goBuy(ctx) {
            if (!uni.getStorageSync('user_token')) {
                this.$api('user.info.index', {}).catch(() => {});
                return;
            }
            if (this.paying) { return; }
            this.paying = true;
            if (this.$refs.popup) { this.$refs.popup.close(); }
            // 让调用页把「用户态可能要变」记在账上（硬约束 16 例外二）
            this.$emit('go-pay');
            // 宿主自己带路（2026-10-30 / 2026-10-31）：教务套餐在下单这一步还要「校区 + 学生」，
            // 线下活动要「票种 + 张数 + 报名信息」—— 这两样在普通购买链里都有自己的中间页 ⇒
            // 本组件不导航，把拼团上下文原样上抛，由宿主先进它自己的中间页，中间页确认完再带着
            // 同一组 `gb_*` 键进结算页（`hostOrder` = 只交下单入口；`hostTicket` = 连选规格/份数一起交）
            if (this.hostOrder || this.hostTicket) {
                this.$emit('order', ctx);
                setTimeout(() => { this.paying = false; }, 800);
                return;
            }
            // goodsList 发明文空数组：页面壳对它走 JSON.parse，编码成 %5B%5D 会解析失败
            const q = ['goodsList=[]'];
            if (this.goodsType === 'physical') { q.push('type=physical'); }
            q.push('gb_activity=' + Number(ctx.activity_id));
            if (ctx.team_id) { q.push('gb_team=' + Number(ctx.team_id)); }
            if (ctx.ladder_id) { q.push('gb_ladder=' + Number(ctx.ladder_id)); }
            // spec_id = 0 对会员卡是**第 0 档**（不是「没有规格」）⇒ host-spec / 参团时连 0 一起带，
            // 并带 `gb_spec_set=1` 让后端区分「显式选了 0」与「没带规格」
            if (ctx.spec_id !== undefined && (ctx.spec_id > 0 || this.hostSpec || this.joinMode)) {
                q.push('gb_spec=' + Number(ctx.spec_id));
                q.push('gb_spec_set=1');
            }
            // 购买份数（2026-10-28）：>1 才带，1 份不带（老链路逐字不变）
            if (ctx.count && Number(ctx.count) > 1) { q.push('gb_count=' + Number(ctx.count)); }
            // 弹窗里选过的上课校区（教务套餐，2026-10-29）：>0 才带，其余类型与老链路逐字不变
            if (ctx.campus_id) { q.push('gb_campus=' + Number(ctx.campus_id)); }
            q.push('gb_goods_type=' + this.goodsType);
            q.push('gb_goods_id=' + Number(this.goodsId));
            this.$nav.to('/pages/order/submit/submit?' + q.join('&'));
            setTimeout(() => { this.paying = false; }, 800);
        },
        /** 倒计时自续跑：每一跳都过已销毁闸门（硬约束 23）。
         *  预热态倒数到活动开始：归零时整份重取一次，切成进行中（底栏文案/凑团列表跟着回来） */
        startTimer() {
            this.clearTimer();
            if (!this.activity) { return; }
            const at = this.isPreheat
                ? Number(this.activity.start_time)
                : Number(this.activity.end_time);
            if (!at) { return; }
            const that = this;
            this.timer = setInterval(function tick() {
                if (that.gone()) { that.clearTimer(); return; }
                that.now = Date.now();
                if (that.countLeft <= 0) {
                    that.clearTimer();
                    if (that.isPreheat) {
                        if (!that.preheatArrived) {
                            that.preheatArrived = true;
                            that.reload();
                        }
                        return;
                    }
                    // 到期这一拍：整区收掉 + 底栏入口撤掉（PRD M-P1「无活动整枚不出」；
                    // 只在倒计时归零这一刻补，取数时点那一条由后端 detail 返回 null 承担）
                    that.expired = true;
                    that.emitReady();
                }
            }, 1000);
        },
        clearTimer() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; }
        },
        /** 访客埋点（数据页「访客数 / 访问次数 / 分享访客数」的唯一来源）：
         *  每个组件实例只发一次；未登录也发，匿名访客用本地固定串区分。 */
        reportVisit() {
            if (this.visitReported || !this.activity) { return; }
            this.visitReported = true;
            this.$api('group_buy.activity.visit', {
                activity_id: this.activity.activity_id,
                visitor: this.visitorId(),
                share: Number(this.share) || 0,
            }).catch(() => {});
        },
        visitorId() {
            let v = uni.getStorageSync('group_buy_visitor');
            if (!v) {
                v = 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
                uni.setStorageSync('group_buy_visitor', v);
            }
            return v;
        },
    },
};
</script>

<style scoped>
/* 购买弹幕那一枚的样式已随渲染搬进 `group-buy-danmu.vue`（2026-10-29），本区不再留第二份
   （硬约束 11：同一枚元素的配色/字号只存一处）。 */

/* 红橙横幅本体已随 `group-buy-banner.vue` 抽走（2026-10-27）：
   价格 / 白标 / 划线原价 / 分段倒计时那一套样式只存那一份组件，本区不再留第二份。 */

/* 邀新提示条：横幅下方一条浅暖底（按参照产品 03-04 图那条「仅限新用户参团」提示，
   色系从横幅红橙派生、不搬竞品的黄；文字压浅底对比度 ≈ 5.1:1） */
.gba-invite {
    padding: 8px 15px;
    background: #fff3e8;
    border-bottom: 1px solid #f2f3f5;
}

.gba-invite-text {
    color: #b95000;
    font-size: 12px;
    line-height: 17px;
}

/* 拼团玩法（2026-10-27 图 6）：标题行 + 问号 + 两行整句，直接摊开 */
.gba-pick {
    padding: 12px 15px 4px;
}

.gba-pick-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 8px;
}

.gba-pick-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
}

/* 档位块（图 3）：浅灰底、两行（N人团 / ¥x/人），选中同样红描边 */
.gba-tiers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.gba-tier {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 104px;
    padding: 10px 12px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: #f7f8fa;
}

.gba-tier--on {
    border-color: #f53f3f;
    background: #fff7f7;
}

.gba-tier-num {
    font-size: 13px;
    color: #4e5969;
}

.gba-tier-price {
    margin-top: 4px;
    font-size: 16px;
    font-weight: 700;
    color: #f53f3f;
}

/* 拼团玩法：与上下兄弟（`.gba-pick` / `.gba-teams`）同为 15px 内衬的正文块。
   **下沿那条发丝线已撤**（2026-10-30 用户点名 `#/pages/app/vip/center/center`
   「去掉 gba-rule 下面的边框细线」）：这一块与送好友之间靠块间距分隔，不画线；
   上一轮为「线不通栏」用过的 `margin: 0 15px + padding: 12px 0` 随之回到常规内衬
   （线都没了就没有要收的那条边，留一套缩进技巧会让下一个人以为这里还有一条线）。
   底色不写 —— 它压在 `tz-box` 的白卡上，本身就是白的，写一层 `#fff` 反而会在换底色时留一块白板 */
.gba-rule {
    padding: 12px 15px;
}

.gba-rule-head {
    display: flex;
    align-items: center;
    gap: 4px;
}

.gba-rule-label {
    color: #1d2129;
    font-size: 14px;
    font-weight: 600;
}

.gba-rule-full {
    display: block;
    margin-top: 8px;
    color: #1d2129;
    font-size: 14px;
    line-height: 22px;
}

/* 在线凑团（2026-10-27 图 3）：标题行 + 最多三行团 + 「查看全部」 */
.gba-teams {
    background: #fff;
    padding: 0 15px 4px;
}

.gba-teams-head {
    display: flex;
    align-items: center;
    padding: 12px 0;
}

.gba-teams-title {
    flex: 1;
    min-width: 0;
    color: #1d2129;
    font-size: 14px;
    font-weight: 600;
}

.gba-teams-arrow {
    flex: none;
    color: #c9cdd4;
    font-size: 16px;
    line-height: 16px;
}

.gba-team {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-top: 1px solid #f7f8fa;
}

.gba-team-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f2f3f5;
    flex: none;
}

.gba-team-main {
    flex: 1;
    min-width: 0;
    padding: 0 10px;
}

.gba-team-name {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #1d2129;
    font-size: 14px;
    line-height: 20px;
}

.gba-team-sub {
    margin-top: 2px;
    color: #4e5969;
    font-size: 12px;
    line-height: 17px;
}

.gba-team-need {
    color: #ff4b2b;
    font-weight: 600;
}

.gba-team-side {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.gba-team-left {
    color: #86909c;
    font-size: 11px;
}

.gba-team-btn {
    padding: 0 12px;
    height: 28px;
    line-height: 28px;
    border-radius: 4px;
    background: #ff4b2b;
    color: #fff;
    font-size: 12px;
    text-align: center;
}

.gba-teams-more {
    padding: 10px 0 6px;
    text-align: center;
    color: #86909c;
    font-size: 12px;
}

/* 空态那一行（2026-10-29 撤）：没有可参与的团时整段不出（同日用户第三次点名），
   `.gba-teams-empty` / `.gba-teams-empty-text` 两条样式随之删净，别留一个没有节点的类名。 */
</style>
