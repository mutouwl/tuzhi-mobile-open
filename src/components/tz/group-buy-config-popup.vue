<template>
    <!--
      拼团规格 / 档位选择弹窗（2026-10-28 用户给的两张参照图：实物商品「多规格选择弹窗」、
      线下活动「拼团规则选择弹窗」）

      两张图是同一个结构的两种数据：
        · 头区：封面 + 「拼团」标 + 拼团价（大）+ 划线原价 +（有库存时）剩余 N 件 + 「已选 X」；
        · 「拼团类型」：阶梯档位 chips（`¥4.00起/3人团`，多规格时带「起」）；
        · 「颜色 / 票种 / 时长 …」：规格 chips（标题词由后端 `spec_label` 给，前端不按大类写死）；
          **实物多属性按维分节**（「规格1」「规格2」各一节，2026-10-29 用户点名「规格一子选项、
          规格二子选项，这样分开，而不是放在一起」），其余五类一行就是一档 ⇒ 仍平铺一节；
        · 「购买数量」：步进器（受库存 **与限购** 封顶）——**只在后端说这一档能买多份时才有这一节**；
        · 底部：整宽「确定」。

      **为什么单独一只弹窗**：商详页那一行只能给「当前选的是哪一档」，真正的下单参数
      （档位 + 规格 + 份数）要一次收齐再送提交订单页 —— 与全站「选规格弹窗」同一套心智，
      也让「立即开团」不再先跳到凑团列表（凑团列表另有入口：他们正在拼团 / 查看全部）。

      纪律：
        ① 数据全读后端 `activity`（`specs` / `ladder` / `spec_label` / `goods_cover` / `count_max` / `count_note`），
          不自己算价、也不自己拿 `stock` 当数量上限；
        ② 单规格不摆规格那一节、非阶梯不摆「拼团类型」那一节（能推导的不开放填写，硬约束 9）；
           **但「规格即标的」那几类单档也摆**（见 `hasSpec`）；
        ③ 按钮走 `u-button` 的 4px 圆角档（硬约束 12：弹层里禁用胶囊 21/22px），底色与商详
          「立即开团」同一条红橙渐变（色值只存这一处 + group-buy-btn 那一处，两处逐字同值）；
        ④ **「购买数量」不是每件商品都有**（2026-10-29 用户点名「组合商品单独购买就没有数量选择，
          你为什么还要加上一个数量选择呢」）：全站单买页只有实物与线下活动票券有那一格，
          判据由后端 `group_buy\Quantity` 一处算成 `specs[].count_max` 下发 —— `0` 不可买、
          `1` 只能买一份（不摆步进器）、`>=2` 才是步进器上限（`min(99, 库存, 限购剩余)`）。
          前端**不许**再用 `Math.min(99, stock)` 自己算：那样只看得见库存、看不见限购，
          用户选 3 件、提交那一刻才被后端拒（实物单次/终身限购、票券 `limit_buy` 都属这一族）；
        ⑤ 售罄（`stock = 0`）或限购用尽（`count_max = 0`）时「确定」禁用，并说清是哪一种；
        ⑥ **多属性的分维判据只存 `common/utils/spec-stock.js`**（`specParts` / `specGroupsOf`）：
          实物商详 `buildSkuTree()` 与这里读同一份，两处各拆一次就会出现「商详两节、拼团一排」
          那种分叉；一维（票种 / 时长 / 套餐规格 / 圈子有效期）不拆，仍按 `spec_label` 平铺。
    -->
    <!--
      外壳（面板 / 头区 / 底部确认按钮）2026-10-30 收进 `components/tz/spec-popup-shell.vue`：
      实物、组合、圈子、拼团档位四只规格弹层同一份视觉。用户原话：「这个专栏本身它是一个单规格的
      商品，但是如果选择阶梯拼团之后，它会弹出一个多规格的弹窗，并且这个弹窗跟上面这些多规格的商品，
      它弹窗是不一样的……样式要统一一下，最好能够做到复用。你比如它的背景色、Tag，或者说按钮颜色
      等等，都是有区别的，这要统一一下，以这个多商品、多规格商品的规格弹窗样式为准。」
      ⇒ 头区（浅暖红渐隐底 + 「拼团专享」标 + 「拼团」标 + 价格 + 划线原价）、底部按钮（46px /
      4px 圆角 / 红橙渐变 / 禁用灰）都由外壳给；本组件只留正文（档位 / 规格 / 数量）。
      面板下限仍是 450px（M71 的三档尺寸史：250 → 350 → 450），剩余高度由外壳的收口占位块吸收。
    -->
    <tz-spec-popup-shell :show="show" :gb-mode="true" :cover="activity.goods_cover"
        :gb-price="priceText" :origin-price="showOrigin ? originText : ''"
        :confirm-text="confirmText" :confirm-disabled="!canBuy"
        min-height="450px" fill body-style="padding: 20px 16px;" @close="close" @confirm="confirm">
        <!-- 头区第三行起的补充（外壳的 `sub-text` 只放一行）：剩余件数 / 已选 X -->
        <view slot="sub">
            <text class="gbc-stock" v-if="stockText">{{ stockText }}</text>
            <text class="gbc-picked" v-if="pickedText">已选 {{ pickedText }}</text>
        </view>

        <!-- 拼团类型（阶梯档位）：**与四只规格弹窗里的「拼团人数」是同一只组件**
             （`components/tz/gb-ladder-picker.vue`）——档位清单、选中回落、价格文案只此一处；
             本弹窗是「还没定规格」的第一步，多规格时该档在各规格下价不同 ⇒ `range` 带「起」。 -->
        <tz-gb-ladder-picker v-if="isLadder && !hideLadder" title="拼团类型" range :activity="activity"
            :spec-id="chosenSpec ? Number(chosenSpec.spec_id) : 0" :value="chosenLadderId"
            @input="chosenLadderId = Number($event) || 0" />

        <!-- 多属性规格（实物的「颜色 × 尺寸」那一形，2026-10-29 用户点名
             `#/pages/app/physical/detail/detail?id=2`「拼团的规格选弹窗应该跟这个实物商品中的
             各个选项一样。比方说，规格一子选项、规格二子选项，这样分开，而不是放在一起」）：
             **一维一节**，标题「规格1 / 规格2」，与实物商详 `sku-select-modal` 的 `sku_tree` 逐节同形。
             分维判据只存 `common/utils/spec-stock.js` 的 `specGroupsOf()` 一处 —— 实物商详的
             `buildSkuTree()` 读的是同一份，两处各拆一次就会出现「商详两节、拼团一排」那种分叉。
             点某一维的值 = 把「当前组合」换掉这一维再映射回那一档规格（组合不存在 / 那一档
             售罄或限购用尽 ⇒ 置灰且点了不选中，判据与平铺那一档同源）。 -->
        <block v-if="!hideSpec && isGrouped">
            <view class="gbc-section" v-for="(group, gi) in viewGroups" :key="gi">
                <text class="gbc-title">{{ group.name }}</text>
                <view class="gbc-chips">
                    <view class="gbc-chip" v-for="(opt, oi) in group.options" :key="oi"
                        :class="{ 'gbc-chip--on': opt.active, 'gbc-chip--off': opt.disabled }"
                        @click="pickOption(gi, opt.name)">
                        <text class="gbc-chip-text">{{ opt.name }}</text>
                        <text class="gbc-chip-off" v-if="opt.block">{{ opt.block }}</text>
                    </view>
                </view>
            </view>
        </block>

        <!-- 单维规格：标题词吃后端 `spec_label`（票种 / 时长 / 套餐规格 / 规格）。
             **单档但有名字也要摆**（2026-10-29 用户点名「规格选择呢」）：圈子的规格就是**有效期**
             （「1个月」）、会员卡是「200天」、组合商品是「标准版」——这一档不是「可推导的废话」，
             它就是这次买的那个标的；不摆出来，用户点开「立即开团」只看得到「购买数量」，
             读出来就是「拼团没有规格选择」（与 2026-10-28「送礼几档都要弹有效期」同一条口径）。
             课程/练习/打卡那种合成行（`spec_id=0` 且文案为空）仍然不摆（硬约束 9：能自动推导的不开放填写）。
             **参团（2026-10-30）**：团绑定商品、不绑定规格 —— 规格照常可选；阶梯人数档固定为团上那一档
             （`fixedLadderId`，只列这一档在该规格下有配档的 chips）。 -->
        <view class="gbc-section" v-else-if="!hideSpec && hasSpec">
            <text class="gbc-title">{{ specLabel }}</text>
            <view class="gbc-chips">
                <!-- 售罄 / 限购用尽的那一档**就地置灰并标出来**，点了也不选中（2026-10-29 用户点名
                     「库存不足是在规格选择中直接禁用啊」）：判据只读 `specBlockText()` 一处，
                     数据是后端 `Composite::specStockMap()` / `Quantity` 下发的 `stock` / `count_max` -->
                <view class="gbc-chip" v-for="row in specs" :key="row.spec_id"
                    :class="{
                        'gbc-chip--on': chosenSpecId === Number(row.spec_id) && !specBlockText(row),
                        'gbc-chip--off': !!specBlockText(row)
                    }"
                    @click="pickSpec(row)">
                    <text class="gbc-chip-text">{{ row.spec_text || '默认' }}</text>
                    <text class="gbc-chip-off" v-if="specBlockText(row)">{{ specBlockText(row) }}</text>
                </view>
            </view>
        </view>

        <!-- 购买数量：**只有后端说这一档能买多份时才摆**（`count_max >= 2`，判据在
             `group_buy\Quantity` 一处）。实物 / 线下活动在全站单买页有那一格；组合商品 /
             圈子 / 会员卡 / 教务套餐没有 ⇒ 拼团也不许自造（2026-10-29 用户点名）。
             上限与限购说明都吃后端：前端自己拿 `stock` 当上限会漏掉「限购」那一轴。 -->
        <view class="gbc-section" v-if="countEnabled && !hideCount">
            <!-- 一行式：标题在左、步进器贴右（照实物商详 `sku-select-modal` 的 `.sku-section-row`）——
                 2026-10-29 用户点名「购买数量应该放在 label 右侧，而不是下面」 -->
            <view class="gbc-count-row">
                <text class="gbc-title gbc-title--row">购买数量</text>
                <view class="gbc-count">
                    <u-number-box v-model="count" :min="1" :max="countMax" :integer="true"
                        :buttonSize="24" :inputWidth="44" bgColor="#F5F6F8"></u-number-box>
                </view>
            </view>
            <text class="gbc-limit" v-if="countNote">{{ countNote }}</text>
        </view>
    </tz-spec-popup-shell>
</template>

<script>
import { specBlockText, specBuyable, pickSpecRow, specParts, specGroupsOf } from '@/common/utils/spec-stock.js';

/**
 * 拼团规格弹窗（2026-10-28，M-P2.1）
 *
 * 对外事件：`confirm`（{ specId, ladderId, count }）/ `close`
 * 公开方法：`open()` / `close()`
 * 入参：activity（拼团区那一份数据）+ 页面上已选的 specId / ladderId（打开时回显）
 */
export default {
    name: 'GroupBuyConfigPopup',
    props: {
        /** 拼团区下发的活动数据（specs / ladder / spec_label / goods_cover 都在里面） */
        activity: { type: Object, default: () => ({}) },
        /** 页面上已选的规格 / 档位：弹窗打开时回显，用户在弹窗里改了以弹窗为准 */
        specId: { type: [Number, String], default: 0 },
        ladderId: { type: [Number, String], default: 0 },
        /**
         * **第二步模式**（2026-10-29，`host-spec` 宿主页）：规格已经由商品自己的规格组件选完了，
         * 这一只只负责商品规格组件里没有的两样 —— 阶梯档（拼团类型）与购买份数。
         * `hideSpec` 收掉规格/分维两节（价格与「已选」仍按 `specId` 回显），`hideCount` 收掉份数
         * （实物/线下活动的份数在各自的规格组件或票种那一层已经收过）。
         * 缺省 false ⇒ 课程/练习/打卡/线下活动（没有商品规格组件的那几类）仍按老形态摆全。
         */
        hideSpec: { type: Boolean, default: false },
        hideCount: { type: Boolean, default: false },
        /**
         * **参团（2026-10-30）**：团绑定商品、不绑定规格 —— 规格可以换，阶梯档固定为团上那一档。
         * `fixedLadderId > 0` 时只列「这一档人数在该规格下有档位」的规格，换规格不换人数档。
         */
        fixedLadderId: { type: [Number, String], default: 0 },
        /** 团长已选的那一档（等于它时头区仍显示团快照价 `teamPrice`；换到别的规格按该档现价） */
        teamSpecId: { type: [Number, String], default: 0 },
        teamPrice: { type: [Number, String], default: 0 },
        /** join 态不摆阶梯档：人数档由团上快照定死 */
        hideLadder: { type: Boolean, default: false },
        /** 底部确认按钮文案（join 态 = 加入拼团；缺省仍为「确定」） */
        confirmText: { type: String, default: '确定' },
    },
    emits: ['confirm', 'close'],
    data() {
        return {
            show: false,
            chosenSpecId: 0,
            chosenLadderId: 0,
            count: 1,
        };
    },
    computed: {
        /** 在售规格（吃规格的六类才有；不吃规格的三类长度 <= 1）。
         *  参团（`fixedLadderId>0`）时只留「团上那一档人数在该规格下有档位」的几档：
         *  换到一档没有配这个人数档的规格，后端 `SpecLadder::row()` 会拒，界面上先不摆。 */
        specs() {
            const rows = this.activity.specs || [];
            const list = Array.isArray(rows) ? rows : [];
            if (!Number(this.fixedLadderId) || list.length <= 1) { return list; }
            const ok = {};
            (this.activity.ladder || []).forEach((row) => {
                if (Number(row.id) === Number(this.fixedLadderId)) {
                    ok[Number(row.spec_id)] = true;
                }
            });
            const filtered = list.filter((r) => ok[Number(r.spec_id)]);
            return filtered.length ? filtered : list;
        },
        isLadder() { return this.activity.type === 'ladder'; },
        /**
         * 选中的规格：没选过 / 选中的那档已售罄 ⇒ 落到第一档能买的
         * （全都卖完时仍回一档，好让头区把「已售罄」和「确定」禁用态一起摆出来）
         */
        chosenSpec() {
            return pickSpecRow(this.specs, this.chosenSpecId);
        },
        /** 当前规格下的档位（多规格时按 spec_id 过滤；老档位没有 spec_id 时回落整表） */
        tiers() {
            if (!this.isLadder) { return []; }
            const rows = this.activity.ladder || [];
            if (this.specs.length <= 1) { return rows; }
            const specId = this.chosenSpec ? Number(this.chosenSpec.spec_id) : 0;
            const hit = rows.filter((r) => Number(r.spec_id) === specId);
            return hit.length ? hit : rows;
        },
        chosenTier() {
            const rows = this.tiers;
            if (!rows.length) { return null; }
            const hit = rows.find((r) => Number(r.id) === Number(this.chosenLadderId));
            return hit || rows[0];
        },
        /** 规格栏标题（后端词条：票种 / 时长 / 套餐规格 / 规格） */
        specLabel() { return this.activity.spec_label || '规格'; },
        /**
         * 规格那一节摆不摆：
         *  - 多档 ⇒ 必摆（要选）；
         *  - **单档但有名字** ⇒ 也摆（圈子的「1个月」/ 会员卡的「200天」/ 组合商品的「标准版」/
         *    票种名…：这一档就是购买标的本身，不摆出来用户只看到「购买数量」，读成「没有规格选择」，
         *    2026-10-29 用户点名 `presale?id=3168` 的正是这一档）；
         *  - 不吃规格的三类（课程/练习/打卡）后端给的是合成行（`spec_id=0`、文案空串）⇒ 不摆
         *    （硬约束 9：能自动推导的不开放填写）。
         */
        hasSpec() {
            const rows = this.specs;
            if (rows.length > 1) { return true; }
            return rows.length === 1 && specTextOf(rows[0]) !== '';
        },
        /**
         * 多属性分维表（`[{ name: '规格1', children: [{ name: '红色' }, …] }, …]`，与实物商详
         * `sku_tree` 同形）。**只认实物**：六类里只有实物的「一行 = 一个组合」（`goods_sku_text`
         * 以英文逗号并列），其余五类一行就是一档 —— 拿去拆会得到一节空标题（票种 / 时长 /
         * 套餐规格 / 圈子有效期都属这一档）。分维判据只存 `spec-stock.js` 一处。
         */
        specGroups() {
            if (String(this.activity.goods_type || '') !== 'physical') { return []; }
            return specGroupsOf(this.specs, specTextOf);
        },
        /** 摆不摆「一维一节」那一形：拆得出两维以上才算多属性，否则退回平铺（单维 chips） */
        isGrouped() { return this.specGroups.length > 1; },
        /**
         * 当前选中那一档**逐维的值**（多属性才用）：拿 `spec_text` 拆回来，
         * 维数对不上（老数据/异常）时按分组的首项补齐，模板不读 undefined
         */
        chosenNames() {
            const parts = specParts(this.chosenSpec ? specTextOf(this.chosenSpec) : '');
            const out = [];
            for (let i = 0; i < this.specGroups.length; i++) {
                const first = this.specGroups[i].children[0];
                out.push(parts[i] || (first ? first.name : ''));
            }
            return out;
        },
        /**
         * 分维 chips 的渲染表：每枚带 `active` / `disabled` / `block` 三个判据，模板里不再现算
         * （判据与平铺那一档同源：`specBuyable` / `specBlockText`）。
         * `disabled` 的两种来路都算：组合本场不卖（`row` 为空）、组合存在但售罄/限购用尽。
         */
        viewGroups() {
            return this.specGroups.map((group, gi) => ({
                name: group.name,
                options: group.children.map((child) => {
                    const row = this.rowOfNames(this.namesWith(gi, child.name));
                    const disabled = !row || !specBuyable(row);
                    return {
                        name: child.name,
                        active: this.chosenNames[gi] === child.name && !disabled,
                        disabled: disabled,
                        block: row ? specBlockText(row) : '',
                    };
                }),
            }));
        },
        /** 头区大字价：阶梯取选中档、多档规格取选中档、其余取活动价。
         *  **参团且选的是团长那一档**时取团快照价 `teamPrice`（后端 `Gate::joinUnit()` 同一判据）；
         *  换到别的规格就按该档现价（阶梯取团上那一档在该规格下的价）。 */
        priceText() {
            if (Number(this.fixedLadderId) && Number(this.chosenSpecId) === Number(this.teamSpecId)
                && Number(this.teamPrice) > 0) {
                return this.money(this.teamPrice);
            }
            if (this.isLadder && this.chosenTier) { return this.money(this.chosenTier.price); }
            if (this.chosenSpec) { return this.money(this.chosenSpec.price); }
            return this.money(this.activity.price);
        },
        /** 划线原价：取选中规格的原价（没有规格时取活动那枚） */
        originText() {
            if (this.chosenSpec) { return this.money(this.chosenSpec.origin_price); }
            return this.money(this.activity.origin_price);
        },
        showOrigin() {
            return Number(String(this.originText).replace(/[^\d.]/g, '')) > Number(String(this.priceText).replace(/[^\d.]/g, ''));
        },
        /** 库存：-1 = 不限（不摆这一行）；0 = 已售罄 */
        stock() {
            const row = this.chosenSpec;
            if (!row) { return -1; }
            return Number(row.stock) >= 0 ? Number(row.stock) : -1;
        },
        /**
         * 这一档的份数上限（后端 `Quantity` 一处算好）：
         *  `0` = 不可买（售罄 / 限购用尽）、`1` = 只能买一份（不摆步进器）、`>=2` = 步进器上限。
         *  **不再自己拿 `stock` 算** —— 限购（实物单次/终身、票券 `limit_buy`）前端看不见，
         *  自己算出来的上限必然比后端宽，用户选 5 件、提交才被拒（2026-10-29 用户点名）。
         *  老后端没下发这一根时按 `1` 处理（安全方向：宁可少卖一份，也不按拍脑袋的上限多收钱）。
         */
        countMax() {
            const row = this.chosenSpec;
            if (!row) { return 1; }
            const n = Number(row.count_max);
            if (!isFinite(n) || n < 0) { return 1; }
            return Math.min(99, n);
        },
        /** 摆不摆「购买数量」：只有能买多份才摆（组合商品 / 圈子 / 会员卡 / 教务套餐不摆） */
        countEnabled() { return this.countMax >= 2; },
        /** 限购说明（「单次限购 2 件」「限购 3 张，已购 1 张」）；空串 = 不限购 */
        countNote() {
            const row = this.chosenSpec;
            return row ? String(row.count_note || '') : '';
        },
        /** 能不能下单：售罄、或限购额度用完 ⇒ 「确定」禁用（不给一个点了必被拒的按钮） */
        canBuy() {
            return this.chosenSpec ? specBuyable(this.chosenSpec) : true;
        },
        stockText() {
            if (this.stock === 0) { return '已售罄'; }
            // 库存还有但限购用尽：把后端那一句原因摆出来，别让用户读到「剩余 5 件」却点不动
            if (this.countMax === 0) { return this.countNote || '已达限购数量'; }
            return this.stock > 0 ? '剩余 ' + this.stock + ' 件' : '';
        },
        /** 「已选 X」：多档规格写规格名，阶梯再带上档位人数（图 1 的「已选 大」）。
         *  多属性那一形按维用「·」连起来（「已选 红色 · 大」），与分节摆法同一份文案口径 */
        pickedText() {
            const row = this.chosenSpec;
            const showSpec = !!row && (this.hideSpec || this.isGrouped || this.specs.length > 1);
            const spec = showSpec
                ? (this.isGrouped ? specParts(specTextOf(row)).join(' · ') : specTextOf(row))
                : '';
            const tier = this.isLadder && this.chosenTier ? this.chosenTier.invite_num + '人团' : '';
            if (spec && tier) { return spec + ' · ' + tier; }
            if (spec) { return spec; }
            if (tier) { return tier; }
            return '';
        },
    },
    methods: {
        /** 模板读点：这一档 chip 为什么不能买（空串 = 能买），判据在 `utils/spec-stock.js` 一处 */
        specBlockText(row) { return specBlockText(row); },
        /**
         * 打开：回显页面选中项（已售罄的不回显，落到第一档能买的）；份数回到 1。
         * 参团（`fixedLadderId>0`）时人数档固定为团上那一档，换规格不换档。
         */
        open(payload) {
            // 调用点可以显式给一份规格/档位（参团时由拼团区直接给默认项）：props 在同一拍
            // 还没刷到子组件时，读 `this.specId` 会拿到上一档
            const wantSpec = payload && payload.specId !== undefined ? payload.specId : this.specId;
            const wantLadder = payload && payload.ladderId !== undefined ? payload.ladderId : this.ladderId;
            this.count = 1;
            const rows = this.specs;
            const keep = pickSpecRow(rows, wantSpec);
            this.chosenSpecId = keep ? Number(keep.spec_id) : 0;
            const tiers = this.tiers;
            const fixed = Number(this.fixedLadderId) || 0;
            const pickLadder = fixed || Number(wantLadder) || 0;
            const keepTier = tiers.find((r) => Number(r.id) === pickLadder);
            this.chosenLadderId = keepTier
                ? Number(keepTier.id)
                : (fixed || (tiers.length ? Number(tiers[0].id) : 0));
            this.show = true;
        },
        close() {
            this.show = false;
            this.$emit('close');
        },
        pickSpec(row) {
            // 售罄 / 限购用尽的那一档点了不选中（chip 已是置灰态，这里再兜一次异步/历史栈那一拍）
            if (!specBuyable(row)) { return; }
            this.applySpec(row);
        },
        /**
         * 分维 chips 的点击（多属性那一形）：把「当前组合」换掉第 `gi` 维再映射回那一档规格。
         * 组合不存在（本场没给这个组合配价）/ 那一档售罄或限购用尽 ⇒ 不选中
         * （chip 已是置灰态，这里兜异步/历史栈那一拍，与平铺那一档同一条闸门）
         */
        pickOption(gi, name) {
            const row = this.rowOfNames(this.namesWith(gi, name));
            if (!row || !specBuyable(row)) { return; }
            this.applySpec(row);
        },
        /** 选中一档之后的共同收尾：档位回到这一档的第一档（参团时保持团上那一档）、份数回到 1 */
        applySpec(row) {
            this.chosenSpecId = Number(row.spec_id) || 0;
            const tiers = this.tiers;
            const fixed = Number(this.fixedLadderId) || 0;
            if (fixed) {
                const hit = tiers.find((r) => Number(r.id) === fixed);
                this.chosenLadderId = hit ? Number(hit.id) : fixed;
            } else {
                this.chosenLadderId = tiers.length ? Number(tiers[0].id) : 0;
            }
            this.count = 1;
        },
        /** 某一维换成 `name` 之后的组合（其余维保持当前选中） */
        namesWith(gi, name) {
            const names = this.chosenNames.slice();
            names[gi] = name;
            return names;
        },
        /**
         * 组合 → 规格行：逐维归一（去首尾空格）后按逗号串认。**不直接比原始文案**：
         * 库里 `goods_sku_text` 可能带「, 」这类空格，原样比会把整组 chips 判成「本场不卖」。
         * 找不到 = 这一组合本场没有拼团价（界面置灰、点了不选中）
         */
        rowOfNames(names) {
            const key = names.join(',');
            return this.specs.find((row) => specParts(specTextOf(row)).join(',') === key) || null;
        },
        money(v) { return (Number(v) || 0).toFixed(2); },
        /** 确定：把三枚参数交给拼团区（去哪由它决定，弹窗不导航） */
        confirm() {
            // 售罄 / 限购用尽：按钮已是禁用态，这里再兜一次（历史栈/异步竞态那一拍）
            if (!this.canBuy) { return; }
            const payload = {
                specId: this.chosenSpec ? Number(this.chosenSpec.spec_id) : 0,
                // 参团时人数档固定为团上那一档；正常开团取弹窗里选的那一档
                ladderId: this.isLadder
                    ? (Number(this.fixedLadderId) || this.chosenLadderId)
                    : 0,
                // 份数按后端上限收口：不能买多份的档（`count_max = 1`）恒交 1 份
                count: Math.max(1, Math.min(this.countMax || 1, Number(this.count) || 1)),
            };
            this.show = false;
            this.$emit('confirm', payload);
        },
    },
};

/** 规格文案（后端字段 `spec_text`；老数据可能只有 `text`） */
function specTextOf(row) {
    return String((row && (row.spec_text || row.text)) || '');
}
</script>

<style scoped>
/* 面板 / 头区（封面 + 拼团专享标 + 拼团标 + 价格 + 划线原价 + N人团）/ 底部确认按钮
   2026-10-30 收进 `components/tz/spec-popup-shell.vue`（四只规格弹层同一份，用户点名「样式要统一」）。
   本组件只留**正文**：档位（共用 `tz-gb-ladder-picker`）/ 规格 chips / 购买数量。
   正文的几何与实物商详 `sku-select-modal` 逐值相同（节 20px 下距、标题 14/500/#333、chips 8×16 圆角 6、
   间距 10），不再用旧的 32px 描边胶囊档。 */
.gbc-section {
    margin-bottom: 20px;
}

.gbc-title {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
}

.gbc-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.gbc-chip {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px solid transparent;
    border-radius: 6px;
    background-color: #f7f8fa;
    color: #333;
    font-size: 14px;
}

/* 选中档：拼团红系（与 `.gbl-chip--on` / 四只宿主规格弹窗的拼团态同值） */
.gbc-chip--on {
    border-color: #f53f3f;
    background: #fff7f7;
    color: #f53f3f;
}

/* 售罄 / 限购用尽那一档：灰掉 + 划掉感（文字 2 档深灰，仍看得清是哪一档），
   与「实物商详规格弹窗」的 `.sku-option-disabled` 同一档口径（2026-10-29） */
.gbc-chip--off {
    background: #fafafa;
    border-color: #f2f3f5;
    color: #c9cdd4;
}

.gbc-chip-text {
    font-size: 14px;
}

.gbc-chip--off .gbc-chip-text {
    color: #c9cdd4;
}

/* 售罄标：贴着规格名、比名字小一号（12px），不给它加外边距（间距由父级 gap 给） */
.gbc-chip-off {
    margin-left: 4px;
    font-size: 11px;
    color: #c9cdd4;
    text-decoration: line-through;
}

/* 头区第三行起：剩余件数 / 已选 X（插槽内容由本组件渲染，样式写在本组件里；
   字号与外壳的 `.sps-sub`（13/666/上 8）同一档，库存那句再淡一档） */
.gbc-stock {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: #86909c;
}

.gbc-picked {
    display: block;
    margin-top: 8px;
    font-size: 13px;
    color: #666;
}

/* 数量行：标题在左、步进器贴右（同一屏参照页＝实物商详 `sku-select-modal` 的 `.sku-section-row`：
   `display:flex + justify-content:space-between`，标题 `margin-bottom:0 + flex-shrink:0`）。
   标题的 `margin-bottom:12px` 由 `--row` 那一档收掉，否则行高二选一（block 行盒 + 下边距)会把步进器顶下去 */
.gbc-count-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.gbc-title--row {
    margin-bottom: 0;
    flex-shrink: 0;
}

.gbc-count {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

/* 限购说明：数量框下一行灰字（照实物商详 `sku-select-modal` 的 `.limit-hint` 同档 12/灰） */
.gbc-limit {
    display: block;
    margin-top: 8px;
    font-size: 12px;
    color: #86909c;
}
</style>
