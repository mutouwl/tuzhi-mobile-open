<template>
    <view class="">
        <!-- 送好友三步指示条（图1）：购买礼物 → 赠送好友 → 好友收礼，白底通栏压在最上面。
             三段全是静态文案、不随数据变 ⇒ 放在骨架屏那一支之外，加载中也照常显示（M18：静态文案保持真文字）。
             只吃下单页自身携带的 `sf=1`（`isSendFriend`），普通下单页与直播间下单弹窗都不渲染。
             **2026-10-28 起抽出共用组件 `components/tz/sf-steps.vue`**（用户点名「上面的 step 最好复用
             提交订单页面上面的 step」）：送礼页第二步、本页第一步，同一份几何与配色只存那一处，
             两处只差 `active` 这一档（M57 的「三角按整组垂直居中」也随组件走） -->
        <tz-sf-steps v-if="isSendFriend" :active="1" />
        <!-- 块间间隔条一律取**页面底色**（App.vue 的 `page { background: rgba(250,250,250,1) }`，
             H5 编译成 `uni-page-body{background:#fafafa}`）：tz-divider 默认 #f5f5f5 比页面底色深一档，
             10px 高的一条读出来就是「一道浅灰条」而不是「两块白卡之间的缝」（2026-10-27 用户点名）。
             卡内那两枚（商品卡里围着虚线的）仍写 #fff，与所在白卡同底，不跟着改。
             **每条间隔条归它后面那一块自己所有（前导条）**（2026-10-30 用户点名「出现了两个相连的
             divider，这个最多只能出现一个相邻」）：块自己不渲染时条也一起消失、由后一块的前导条补位，
             任何一档组合下两块之间恒为 0 或 1 条；不许在块外摆一条「共享条」——两个条件块各占一条，
             条件同时成立就叠成两条（拼团教务套餐 / 线下活动那一档就是这么叠出来的）。 -->
        <tz-divider v-if="isSendFriend" bgColor="#fafafa" />

        <!-- 拼团三步说明（2026-10-27 图 5）：选择商品/开团参团 → 邀请好友/参团支付 → 人满成团/失败退款。
             静态文案、不随取数变 ⇒ 与送好友那条一样摆在骨架屏那一支之外，加载中也照常显示（M18）。
             只吃下单页自身携带的 `gb_activity`（`isGroupBuy`），其余下单类型与直播间下单弹窗都不渲染 -->
        <view class="gb-steps" v-if="isGroupBuy">
            <template v-for="(step, index) in gbSteps">
                <view class="gb-step" :key="'step' + index">
                    <view class="gb-step-dot">{{ index + 1 }}</view>
                    <text class="gb-step-name">{{ step.name }}</text>
                    <text class="gb-step-desc">{{ step.desc }}</text>
                </view>
                <view class="gb-step-line" v-if="index < gbSteps.length - 1" :key="'line' + index"></view>
            </template>
        </view>
        <tz-divider v-if="isGroupBuy" bgColor="#fafafa" />

        <!-- 加载骨架屏：块结构与真实内容逐块对齐（地址卡 / 商品卡 / 小记 / 信息行 / 底部支付栏），替代整页 loading 遮罩 -->
        <template v-if="loading">
            <!-- 地址卡那一格按「进去之前就知道要不要地址」判：实物由入口的 `type=physical` 直接给；
                 组合商品要等这一档规格回来才知道（`gbNeedAddress`），加载中先不预留，回来后由真卡补位 -->
            <view class="sk-address" v-if="needShipping">
                <view class="sk-address-row"></view>
                <view class="sk-address-line"></view>
            </view>
            <tz-box>
                <!-- 骨架走卡片自己的骨架档（M16：灰块与真实卡逐块同几何，本页不再抄一份卡片尺寸）；
                     商品卡换成紧凑档课程卡之后，骨架也必须跟着换，否则数据回来那一刻封面/文字列左右跳位 -->
                <tz-course-mini :skeleton="true" :skeleton-count="2" :margin="10" :round="true" :border="false" />
                <view class="sk-total"></view>
            </tz-box>
            <tz-divider bgColor="#fafafa" />
            <tz-box padding="5px 15px">
                <view class="sk-cell" v-for="i in 2" :key="i">
                    <view class="sk-cell-label"></view>
                    <view class="sk-cell-value"></view>
                </view>
            </tz-box>
            <view class="sk-bottom-bar h5-bottom-bar">
                <view class="sk-price"></view>
                <view class="sk-btn"></view>
            </view>
        </template>
        <template v-else>
        <!-- 地址选择栏（实物商品，或规格含实物商品的组合商品 / 拼团同两档） -->
        <view class="address-card" v-if="needShipping" @click="selectAddress">
            <view class="address-content" v-if="address">
                <view class="address-info">
                    <view class="user-info">
                        <text class="name">{{ address.name }}</text>
                        <text class="mobile">{{ address.mobile }}</text>
                    </view>
                    <view class="address-text">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}</view>
                </view>
                <u-icon name="arrow-right" color="#999" size="16"></u-icon>
            </view>
            <view class="address-empty" v-else>
                <view class="add-address-btn">
                    <u-icon name="plus" color="#0968f6" size="16"></u-icon>
                    <text class="add-text">请选择收货地址</text>
                </view>
                <u-icon name="arrow-right" color="#999" size="16"></u-icon>
            </view>
            <view class="address-line"></view>
        </view>
        
        <tz-box>
            <!-- 商品卡（2026-10-31 用户点名「上面的商品信息能够复刻 course-item-mini 相关的样式（封面、tag、价格），
                 然后保留当前商品信息字段」）：封面 140×80 靠左、磨砂类型标签压在封面右下、名称两行、价格红色加粗贴左下，
                 四处版式一律由紧凑档课程卡 `tz-course-mini` 给（M24：共用组件当适配器，页面不再自绘一份封面/标签/价格）。
                 当前商品信息字段一项不少：名称 / 封面 / 类型标签 / 价格 / 件数（`count`，卡片右下角「×N」）；
                 字段映射只存 `orderGoodsCards` 一处，模板里不再出现 `data.orderGoodsList` 的字段名。 -->
            <tz-course-mini :list="orderGoodsCards" :margin="10" :round="true" :border="false" />
            <!-- 送好友档不摆这条「共 N 件，商品小记」：图1 里那笔金额只在下方「商品金额」行出现一次，
                 两处同时摆就是同一笔钱说两遍 -->
            <template v-if="!isSendFriend">
                <tz-divider bgColor="#fff" />
                <u-line dashed></u-line>
                <tz-divider bgColor="#fff" />
                <div class="total-box">
                    共{{ data.goods_count ? data.goods_count : 0 }}件，商品小记：
                    <span class="price">
                        <span class="unit" v-if="!isVirtualPay">¥</span>
                        {{ data.goods_total_price ? data.goods_total_price : 0 }}
                        <span class="unit" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
                    </span>
                </div>
            </template>
        </tz-box>

        <!-- 送好友（`sf=1` 那一档；一份 = 一个好友名额）：份数选多少、支付后就生成多少条礼单；
             其余下单流程逐字不变（这一整段 v-if 不吃它们） -->
        <template v-if="isSendFriend">
        <tz-divider bgColor="#fafafa" />
        <tz-box padding="5px 15px">
            <u-form :labelWidth="labelWidth">
                <u-form-item label="份数" :border="false">
                    <!-- 步进器靠右：与同页其余行同一档（券值 .input-item / 积分与会员折扣 .item-val 都是
                         `width:100% + 靠右`，备注走 inputAlign="right"）；参照页是实物 SKU 弹窗的
                         「数量」行（pages/app/physical/components/sku-select-modal.vue:35-41：标题左、步进器右） -->
                    <view class="gift-count-row">
                        <!-- 步进器照图1那一档：浅灰输入格 + 深色加减号；减号在 min=1 时由 uview 自己落成浅灰（#c8c9cc）。
                             底色走 `bgColor` prop 而不是 `::v-deep`（小程序端进不去组件，M12） -->
                        <u-number-box v-model="form.gift_count" :min="1" :max="sfMax" :integer="true"
                            :buttonSize="24" :inputWidth="44" bgColor="#F5F6F8"
                            @change="onGiftCount"></u-number-box>
                    </view>
                </u-form-item>
            </u-form>
        </tz-box>
        </template>

        <!-- 购买课程前表单入口：同一课程绑了多张表单时**必须全填**，汇总行只给「已填写/请先填写」
             两档 ⇒ 填完其中一张返回后整行一字不变，读起来就是「没刷新」（2026-10-16 用户点名）。
             故多张时在汇总行下方逐张列出（表单名 + 已填写/待填写），点哪一行填哪一张，
             返回后该行立刻翻档——与「加入学习前」拦截层同一份「逐张列出」口径 -->
        <template v-if="formRequirement.hasForm">
        <tz-divider bgColor="#fafafa" />
        <view class="form-requirement-card">
            <view class="form-requirement-content" @click="goFillForm()">
                <view class="form-requirement-title">购买前需填写表单</view>
                <view class="form-requirement-status" :class="{ submitted: formRequirement.allSubmitted }">
                    {{ formRequirement.allSubmitted ? '已填写' : '请先填写' }}
                </view>
                <u-icon name="arrow-right" color="#999" size="16"></u-icon>
            </view>
            <template v-if="formRequirement.forms.length > 1">
                <view class="form-requirement-item" v-for="(item, index) in formRequirement.forms"
                      :key="item.form_id" @click="goFillForm(item)">
                    <text class="form-requirement-name">{{ item.form_name }}</text>
                    <text class="form-requirement-item-status" :class="{ submitted: item.is_submitted }">
                        {{ item.is_submitted ? '已填写' : '待填写' }}
                    </text>
                    <u-icon name="arrow-right" color="#999" size="16"></u-icon>
                </view>
            </template>
        </view>
        </template>

        <!-- 拼团额外信息（2026-10-28）：六类商品里只有**线下活动**在下单这一步还要别的东西 ——
             线下活动要**报名信息**（取价口第三参）。只吃 `gbExtra`（`group_buy.activity.detail` /
             `team.detail` 下发的 order_extra），前端不按商品类型自己猜「要不要填」。
             **教务套餐的「上课校区 + 上课学生」在结算页一个字都不摆**（2026-10-31 用户点名
             「拼团下单的提交订单应该与单独购买一样，不要显示这个校区和学生了」）：单独购买链里
             这两样在「确认报名」页（`app/school/package/confirm`）收完就随 goodsList 的 `extend`
             直接进后端，结算页没有任何回显；拼团走的是同一张确认页，收完随 `gb_campus` /
             `gb_student` 进来，本页只把 id 交给 `team.open/join` 并做一次名单校验。两条购买链
             在结算页因此长成同一个样子（2026-10-30 那一版还留了一行只读回显，正是被点名的差异）。
             **线下活动的报名信息同理（2026-10-31）**：从活动详情点拼团会先走它自己的
             「选票页 → 报名信息页」，报名信息随 `gb_form` 进来 ⇒ 本页也不摆这一行；
             只有老链接 / 历史栈没带 `gb_form` 时，才退回这只表单层补填。 -->
        <template v-if="isGroupBuy && gbExtra.kind === 'activity' && !gbExtra.formUserId">
            <tz-divider bgColor="#fafafa" />
            <tz-box padding="5px 15px">
                <u-form :labelWidth="labelWidth">
                    <u-form-item label="报名信息" :border="false" @click="openApplyForm">
                        <view :class="['input-item', { 'input-item--muted': !gbExtra.applyFilled }]">
                            {{ gbExtra.applyFilled ? '已填写' : '请填写报名信息' }}
                        </view>
                        <u-icon slot="right" name="arrow-right" color="rgb(192, 196, 204)"></u-icon>
                    </u-form-item>
                </u-form>
            </tz-box>
        </template>

        <!-- 券段：拼团单**也摆**（2026-10-29 用户点名「拼团商品应该允许使用优惠券」）。
             仍只被虚拟支付关掉：那一档扣的是代币，券的人民币抵扣口径对不上（与全站同一档）。
             拼团档的券值在选券后由 `group_buy.team.calc` 现算（`data.coupon_discount_fee`），
             提交时随 `team.open/join` 带 `coupon_id`。 -->
        <template v-if="!isVirtualPay">
        <tz-divider bgColor="#fafafa" />
        <tz-box padding="5px 15px">
            <u-form>
                <u-form-item :label="isSendFriend ? '优惠券/码' : '优惠券'" :labelWidth="labelWidth"
                    @click="openCouponPicker">
                    <!-- 券值左侧那枚类型 Tag（2026-10-30 用户点名「如果选择了优惠券，能不能在这个减多少钱
                         左侧增加一个Tag显示当前优惠券的类型，比如满多少减多少、满多少打几折这种」）。
                         文案与「满减/折扣」两档判据都吃后端 `coupon_info.tag_text`（M22/M35：端上不拿
                         `type` 自己拼「满X减Y」）；出不出与券值同一枚判据（真抵到钱才摆，零元券不摆
                         一枚「已选」的空口）。几何照订单详情 `.order-gb-tag`（11px / 行盒 16 / 圆角 4 /
                         内衬 1px 5px），配色从券值橙派生：底 `#fff3e8`、字 `#b95000`（压底实算 4.57:1）。 -->
                    <view :class="['input-item', { 'input-item--muted': !(data.coupon_discount_fee > 0) }]">
                        <text v-if="data.coupon_discount_fee > 0 && data.coupon_info && data.coupon_info.tag_text"
                            class="coupon-type-tag">{{ data.coupon_info.tag_text }}</text>
                        <text class="coupon-discount-value">{{
                            data.coupon_discount_fee > 0
                            ? formatDiscountPrice(data.coupon_discount_fee)
                            : couponEmptyText
                            }}</text>
                    </view>
                    <u-icon slot="right" name="arrow-right" color="rgb(192, 196, 204)"></u-icon>
                </u-form-item>
            </u-form>
        </tz-box>
        </template>
        <!-- 送好友档的「留言 + 商品金额」（图1）：这一档没有积分与会员折扣（送礼单不走那两条优惠链），
             留言保留 —— 买家留言在 gift/create 里同样有地方存；商品金额按商品小计原样给。
             前导条归这一块自己所有：券段被 `isVirtualPay` 关掉（虚拟支付）也照样有一条；
             券段在的时候由券段那条分隔，不会叠成两条。 -->
        <template v-if="isSendFriend">
            <tz-divider bgColor="#fafafa" />
            <tz-box padding="5px 15px">
                <u-form :labelWidth="labelWidth">
                    <u-form-item label="留言" :border="true">
                        <u-input border="none" placeholder="选填，建议和商家沟通后再填写" v-model="form.buyer_remark"
                            inputAlign="right"></u-input>
                    </u-form-item>
                    <u-form-item label="商品金额" :border="false">
                        <div class="item-val sf-amount">
                            <template v-if="isVirtualPay">{{ data.goods_total_price ? data.goods_total_price : 0 }}
                                {{ $tools.systemConfig('coin_name') || '金币' }}</template>
                            <template v-else>¥{{ data.goods_total_price ? data.goods_total_price : 0 }}</template>
                        </div>
                    </u-form-item>
                </u-form>
            </tz-box>
        </template>

        <!-- 积分 / 会员折扣 / 备注：拼团档只摘「积分 + 会员折扣」两行（这两样不参与拼团价，PRD §3.11），
             备注保留 —— 拼团单与其他单落的是同一张 order 表、同一个 OrderCreate，买家留言本来就有地方存。
             送好友那一档整段仍不渲染（留言改由上面那一块摆，口径不同）。
             前导条同样归这一块自己所有：券段在不在、有没有拼团额外信息，这一条都只出一条。 -->
        <template v-if="!isSendFriend">
        <tz-divider bgColor="#fafafa" />
        <tz-box padding="5px 15px">
            <u-form :labelWidth="labelWidth">
                <u-form-item label="积分" :border="true" v-if="!isGroupBuy && data.score_amount">
                    <div class="item-val">-{{ data.score_amount }}</div>
                </u-form-item>

                <u-form-item label="会员折扣" :border="true" v-if="!isGroupBuy && data.vip_discount_price > 0">
                    <div class="item-val">{{ formatDiscountPrice(data.vip_discount_price) }}</div>
                </u-form-item>
                <u-form-item label="备注">
                    <u-input border="none" placeholder="请输入订单备注" v-model="form.buyer_remark"
                        inputAlign="right"></u-input>
                </u-form-item>
            </u-form>
        </tz-box>
        </template>

        <tz-bottom-btn type="submit" :theme="isSendFriend ? 'send-friend' : (isGroupBuy ? 'group-buy' : '')" :params="{
        price: data.real_price ? data.real_price : 0,
        is_virtual_pay: isVirtualPay,
      }" @handle="submitOrder" />
        </template>

        <!-- 拼团档 `:go-order="false"`：支付成功后不走 PayHandle 的 result 页，回到 @close 这一支由
             cancelPay() 统一带去团详情页（orderPaid 广播照常发，商详页的账不受影响） -->
        <tz-pay :visible="modal.pay" :order-no="orderNo" :money="data.real_price || 0" :is-virtual-pay="isVirtualPay"
            :go-order="!isGroupBuy" @close="cancelPay()" @alipay-guide-close="alipayGuideClose()"></tz-pay>

        <bind-mobile-modal @close="getUserData()" ref="bindMobileModal"/>

        <!-- 拼团档换券口：`group_buy.team.coupons` 用**与建单同一份**上下文（活动/团 + 规格/阶梯/份数）
             算可用/不可用；其余下单流不传这两个 prop，照旧走 `app.coupon.use`。 -->
        <coupon-picker-modal :goods="pageParams.goodsList" :type="pageParams.type" @close="modal.couponPicker = false"
            @change="couponChange" :visible="modal.couponPicker" :checkedId="form.coupon_id"
            :api-key="isGroupBuy ? 'group_buy.team.coupons' : ''"
            :api-params="isGroupBuy ? gbCouponParams : null"/>

        <tz-footer />

        <!-- 线下活动报名信息（复用活动详情页那一只表单弹层，不另造一版表单控件） -->
        <form-modal :visible="gbExtra.applyVisible" :field="gbExtra.applyFields"
            @ok="onApplyOk" @close="gbExtra.applyVisible = false" />
        <!-- 教务套餐的上课校区 / 上课学生**不在这里选、也不在这里显示**（2026-10-30 / 10-31）：
             拼团从商详页先进「确认报名」页（`pages/app/school/package/confirm`）收完这两样，
             再带 `gb_campus` / `gb_student` 进本页（与单独购买同一张确认页；本页只管提交）。
             原先那只原生 `u-picker`、学生弹层与 2026-10-30 的只读回显行都已删掉。 -->
    </view>
</template>

<script>
    import bindMobileModal from "@/components/modal/bind-mobile.vue";
    import couponPickerModal from "@/components/coupon/coupon-picker-modal.vue";
    // 拼团额外信息（2026-10-28）：线下活动报名信息复用活动详情页那只表单弹层（教务套餐的校区/学生
    // 归确认报名页，2026-10-30 起本页不再 import 学生弹层）。
    // **组件本体已挪主包 `src/components/tz/form-modal.vue`（2026-10-31）**：本文件是主包组件
    // （`src/components/order/`），引 `pages/app/**` 的分包组件在 mp-weixin 冷启时解析不到 ——
    // 运行时 `Component is not found in path` 会打断整棵初始创建，用户读出来就是下单页白屏
    // （`Framework inner error (expect FLOW_INITIAL_CREATION end but get FLOW_CREATE_NODE)`）。
    // 微信只保证「分包能用主包的组件」，反向不成立；门禁 `scripts/check-cross-subpackage-import.js` 已补这一档。
    import formModal from "@/components/tz/form-modal.vue";
    // 拼团那一单回「确认报名」页补选校区/学生的地址（老链接/历史栈兜底；路径与 gb_* 键只存那一处）
    import { groupBuyConfirmUrl } from '@/common/utils/group-buy-order.js';
    import { FEATURE_GROUP_BUY, FEATURE_SEND_FRIEND } from '@/common/utils/feature-flags.js';
    // 付费插件安装态闸门（三态）：本会话 init 未回包时等一次，未装就一句话退回、不发必然失败的建单口
    import { pluginState, pluginMissing, onSystemConfigReady } from '@/common/utils/plugin-guard.js';
    var that;
    export default {
        components: {
            bindMobileModal,
            couponPickerModal,
            formModal,
        },
        data() {
            return {
                //表单标题宽度
                labelWidth: 70,

                modal: {
                    payType: false,
                    pay: false,
                    bindMobile: false,
                    couponPicker: false,
                },

                form: {
                    buyer_remark: "",
                    pay_type: "",
                    goodsList: [],
                    coupon_id: "",
                    // 送好友：份数（一份 = 一个好友名额）；其余流程不读它
                    gift_count: 1,
                },
                /**
                 * 自动选券只试一次（2026-10-29 用户点名「优惠券可以默认选中一个最优的」）
                 *
                 * 首屏核算由后端挑一张最划算的券并回 `coupon_id`，端上只负责回填券行；
                 * 用户自己选过（含「不使用优惠券」）或换了一件商品之后才允许重新挑。
                 */
                couponAutoTried: false,
                list: [],
                pageParams: {},
                // 拼团三步说明（2026-10-27 图 5）：整句只存这一份，模板块只按下标摆
                gbSteps: [
                    { name: '选择商品', desc: '开团/参团' },
                    { name: '邀请好友', desc: '参团支付' },
                    { name: '人满成团', desc: '失败退款' },
                ],

                orderNo: "",
                // 拼团档：提交成功后回体里的团 id（支付面板关闭/支付成功都跳这一团的详情页）
                gbTeamId: 0,
                // 拼团建单在途锁：连点「立即支付」会各发一次 team.open（各建一个团+一条待支付订单），
                // 用户回头看到「开了好几个团」；`uni.showLoading` 的 mask 是异步出现的，挡不住连点
                submitting: false,
                // 送好友档：本页现取的份数上限（入口 URL 里那一枚可能已过期）与闸门拦下锁
                giftMax: 0,
                giftBlocked: false,
                // 入口复核在途锁：mounted 与 componentsParams 两处都可能触发首屏取数，只问一次
                giftGateChecking: false,

                data: {},
                /**
                 * 拼团这一档要不要收货地址（2026-10-29 用户点名「拼团的组合商品居然不显示收货地址选择组件」）
                 *
                 * 只认后端下发的两枚之一（**不按商品类型猜**）：
                 *  - 开团：活动规格行上的 `need_address`（选中的那一档，`ActivitySpec::rows()` 透传）；
                 *  - 参团：团详情里这一团的 `need_address`（`TeamPage::teamDetail()` 按团上 spec_id 算好）。
                 * 1 = 摆地址卡、提交前校验、`address_id` 随 `team.open/join` 交回后端。
                 */
                gbNeedAddress: 0,
                /**
                 * 拼团下单页的额外上下文（2026-10-28）
                 *
                 * kind：'' 不要额外信息 / 'activity' 线下活动报名信息 / 'school' 教务套餐校区学生。
                 * 判据来自后端下发的 `order_extra`（`GoodsArea::orderExtra`），前端不按商品类型猜。
                 * 'activity' 本页要收报名信息；'school' 的校区/学生由确认报名页
                 * （`app/school/package/confirm`）收完随 `gb_campus` / `gb_student` 带进来 ——
                 * 2026-10-31 起本页**不显示、也不选**这两样（与单独购买同一形态），
                 * 只按名单校验还在不在（名单里没有就清掉，不留指向已下线校区/学生的值）。
                 */
                gbExtra: {
                    kind: '',
                    activityId: 0,
                    packageId: 0,
                    // 套餐规格下标（`form.skus` 的下标）：兜底回确认页时按它把这一单原样带回去
                    skuIndex: 0,
                    applyVisible: false,
                    applyFields: [],
                    applyFilled: false,
                    formUserId: 0,
                    // 校区名单只用于「确认页选过的那一处还在不在」的校验（本页不选、也不显示）
                    campusList: [],
                    campusId: 0,
                    studentId: 0,
                },
                userInfo: {},
                loading: false,
                address: null,
                formRequirement: {
                    loading: false,
                    hasForm: false,
                    allSubmitted: false,
                    forms: []
                },
            };
        },
        props: {
            componentsParams: {
                type: [Object],
                default: () => {
                    return {};
                },
            },
        },
        computed: {
            isVirtualPay() {
                return Number(this.data && this.data.is_virtual_pay) === 1;
            },
            /**
             * 商品卡的字段映射（2026-10-31 用户点名「上面的商品信息能够复刻 course-item-mini 相关的样式
             * （封面、tag、价格），然后保留当前商品信息字段」）
             *
             * 版式不再由本页自绘：整卡交给紧凑档课程卡 `tz-course-mini`（M24「共用组件当适配器」），
             * 这里只做「订单行 → 卡片字段」的映射，两个字段名不同口径也只在这一处转：
             *  - `item_id`：后端 calcAmount 回写的 id（= detail.id，physical/vipcard 已在下单前剥掉 sku 后缀），
             *    与订单详情页同一口径。**教务套餐例外**：那一档 `item_id` 是规格 id，卡片只认「商品详情」
             *    一条跳转（`$nav.getPagePath`）⇒ 换成包 id，否则点开的是一个不存在规格的套餐页；
             *  - `pay_type`：结算页的价格恒按「实付金额」出一个数（免费/指定学员/密码兑换在核算后也只是一个金额），
             *    紧凑档的价格块按 `pay_type` 分档、缺了整块不出 ⇒ 固定给 'pay'，数字逐字沿用 `detail.price`；
             *  - `count`：件数（紧凑档右下角那枚「×N」），本页必须保留 —— 多份下单要能看出买了几份；
             *  - `is_virtual_pay`：虚拟支付（代币）档，卡片自带 `platform` 判据，这里只负责把页面那一枚透下去。
             */
            orderGoodsCards() {
                const rows = (this.data && this.data.orderGoodsList) || [];
                return rows.map((row) => {
                    const item = row || {};
                    const detail = item.detail || {};
                    const type = detail.type || '';
                    const isSchool = type === 'school_package' && Number(detail.package_id) > 0;
                    return {
                        id: isSchool ? detail.package_id : (item.item_id || detail.id),
                        type: type,
                        cover: detail.cover || '',
                        name: detail.name || '',
                        price: detail.price,
                        pay_type: 'pay',
                        count: item.count,
                        is_virtual_pay: this.isVirtualPay ? 1 : 0,
                    };
                });
            },
            // 规格含实物商品的组合订单需提交收货地址（核算接口返回 need_address）；
            // 拼团那一档不走核算接口（数据是本页按活动/团详情现组的），读后端下发的这一档标记
            needAddress() {
                if (this.isGroupBuy) {
                    return Number(this.gbNeedAddress) === 1;
                }
                return Number(this.data && this.data.need_address) === 1;
            },
            /**
             * 这一屏要不要摆收货地址（同一枚判据给三处：地址卡、提交前校验、骨架屏）
             *
             * 实物商品由入口的 `type=physical` 给（全站口径，逐字不变：`order.calculate` 回的
             * `need_address` 也是 1）；组合商品看**这一档规格**里有没有实物子商品 ——
             * 2026-10-29 之前这里只认 `pageParams.type`，拼团组合商品两个判据都不成立，
             * 地址卡整块不渲染，用户读出来就是「居然不支持收货地址」。
             */
            needShipping() {
                return this.pageParams.type === 'physical' || this.needAddress;
            },
            /** 送好友那一档（下单页自身携带 `sf=1` 标记：与全站购买流同一条落页，建单口切到插件礼物口） */
            isSendFriend() {
                return Number(this.pageParams && this.pageParams.sf) === 1;
            },
            /** 份数上限：本次入口复核回体的那一枚优先，URL 里带的 `sf_max` 只当旧包兜底；取不到按 1，
             *  后端 `gift/create` 还会再兜一层（硬约束 9：上限吃后端，不前端写死） */
            sfMax() {
                const fresh = Number(this.giftMax) || 0;
                return Math.max(1, fresh > 0 ? fresh : (Number((this.pageParams || {}).sf_max) || 1));
            },
            /**
             * 拼团那一档（下单页自身携带 `gb_activity` 等扁平标记：2026-10-16 用户点名
             * 「拼团付款为什么不跳转提交订单页面」——拼团与全站购买流走同一张确认页，
             * 只是提交口换成 `team.open/join`）。URL 用扁平键（不走 JSON 串，小程序端稳）。
             */
            isGroupBuy() {
                return Number((this.pageParams || {}).gb_activity) > 0;
            },
            /** 拼团上下文（调用方都知道 goods_type/goods_id，随参数带过来，本页不再反查） */
            gbCtx() {
                const p = this.pageParams || {};
                return {
                    activity_id: Number(p.gb_activity) || 0,
                    team_id: Number(p.gb_team) || 0,
                    ladder_id: Number(p.gb_ladder) || 0,
                    // 选中的那一档规格（2026-10-28 多规格）：参团时由团上那一档决定、这里不传
                    spec_id: Number(p.gb_spec) || 0,
                    // 2026-10-30：spec_id=0 对会员卡是合法档位；这一枚区分「显式选了 0」与「没带规格」
                    spec_set: Number(p.gb_spec_set) === 1 ? 1 : 0,
                    // 购买份数（规格弹窗里的数量）：1 份时不带，后端缺省 1
                    count: Math.max(1, Number(p.gb_count) || 1),
                    goods_type: String(p.gb_goods_type || 'course'),
                    goods_id: Number(p.gb_goods_id) || 0,
                };
            },
            /**
             * 拼团券口 / 试算的入参（2026-10-29 拼团开放用券）
             *
             * 与 `submitGroupBuy()` 交出去的那一份**同一批键**：活动/团 + 规格/阶梯/份数。
             * 券门槛由后端按拼团价判，端上不带 goodsList（那会把券口引到商品原价上去）。
             */
            gbCouponParams() {
                const gb = this.gbCtx;
                const params = {
                    count: gb.count,
                    address_id: this.needShipping && this.address ? (Number(this.address.id) || 0) : 0,
                    // 线下活动 / 教务套餐的取价口要这几枚（与 `submitGroupBuy()` 同一批键）：
                    // 缺了它们，券清单/试算会以「报名信息错误 / 请选择上课学生」失败
                    form_user_id: Number(this.gbExtra.formUserId) || 0,
                    student_id: Number(this.gbExtra.studentId) || 0,
                    campus_id: Number(this.gbExtra.campusId) || 0,
                };
                if (gb.team_id) {
                    // 参团：规格由参团人自己选（2026-10-30），档位仍由团快照定；
                    // 券门槛/试算与建单同源，都要带这一枚
                    params.team_id = gb.team_id;
                    params.spec_id = gb.spec_id || 0;
                    params.spec_set = gb.spec_set || 0;
                    params.count = gb.count || 1;
                } else {
                    params.activity_id = gb.activity_id;
                    params.ladder_id = gb.ladder_id || 0;
                    params.spec_id = gb.spec_id || 0;
                    params.spec_set = gb.spec_set || 0;
                }
                return params;
            },
            /**
             * 券行没抵扣时那句说明（2026-10-30 用户点名「如果当前没有可用的优惠券，那么就显示
             * 暂无可用优惠券，不要显示请选择优惠券了」）
             *
             * 两档由后端 `coupon_can_use` 答（端上不自己扫券）：
             *  - 有可用券、只是还没选 → 「请选择优惠券」（点开弹窗还有得挑）；
             *  - 一张可用的都没有 → 「暂无可用优惠券」（再写「请选择」就是把人骗进一个空弹窗）。
             * 送好友那一档不进这条（它的券段本来就只在有券时才有意义）。
             */
            couponEmptyText() {
                if (this.isSendFriend) { return '无可用优惠券'; }
                const data = this.data || {};
                // 字段缺失（旧后端 / 回包还没回来）时保持原口径「请选择优惠券」，
                // 只有后端明确答了 `0` 才改口「暂无可用优惠券」——不把「还不知道」说成「没有」
                if (data.coupon_can_use === undefined || data.coupon_can_use === null) { return '请选择优惠券'; }
                return Number(data.coupon_can_use) > 0 ? '请选择优惠券' : '暂无可用优惠券';
            },
            /**
             * 「这一屏该用哪张券」的上下文指纹（2026-10-29 默认选最优券）
             *
             * 换商品 / 换拼团活动、换规格档都算另一单（券的适用范围与门槛跟着变）⇒ 允许重新挑；
             * **份数不进指纹**：同一单里改份数（送好友步进器）只是重算金额，不该把用户选过的券改掉。
             */
            couponCtxSig() {
                const p = this.pageParams || {};
                const list = (p.goodsList || []).map((g) => [
                    String(g && g.goodsId !== undefined ? g.goodsId : ''),
                    String(g && g.goodsType ? g.goodsType : ''),
                    String(g && g.extend ? g.extend : ''),
                ].join('_'));
                const gb = this.isGroupBuy
                    ? [this.gbCtx.activity_id, this.gbCtx.team_id, this.gbCtx.ladder_id, this.gbCtx.spec_id, this.gbCtx.goods_id]
                    : [];
                return JSON.stringify({ list, type: p.type || '', sf: p.sf || '', gb });
            },
        },
        watch: {
            componentsParams() {
                that = this;
                this.pageParams = this.componentsParams;
                if (this.pageParams && Object.keys(this.pageParams).length > 0) {
                    // 换了一件商品就是另一单：上一单自动挑的券不跟过来，允许按新单重新挑
                    this.resetCouponForCtx();
                    this.getData();
                    // 如果是实物商品，获取默认地址
                    if (this.pageParams.type === 'physical' && !this.address) {
                        this.getDefaultAddress();
                    }
                }
            },
        },
        mounted() {
            that = this;
            
            // 监听地址选择
            this.onAddressSelected = (address) => {
                this.address = address;
            };
            uni.$on('addressSelected', this.onAddressSelected);

            // 表单状态刷新的两路信号（都走 refreshFormRequirement，1s 内只查一次）：
            // ① 宿主页 onShow 转发（提交订单页 pages/order/submit 那一档，设计文档既有口径）；
            // ② 表单页提交成功后直接广播（直播间下单弹窗这类宿主没有 onShow 转发，靠这一路兜住）
            this.onFormPageShow = () => {
                this.refreshFormRequirement();
            };
            uni.$on('orderFormPageShow', this.onFormPageShow);
            this.onFormSubmitted = () => {
                this.refreshFormRequirement();
            };
            uni.$on('orderFormSubmitted', this.onFormSubmitted);

            if (this.componentsParams && Object.keys(this.componentsParams).length > 0) {
                this.pageParams = this.componentsParams;
                this.resetCouponForCtx();
                this.getData();
                
                // 如果是实物商品，获取默认地址
                if (this.pageParams.type === 'physical') {
                    this.getDefaultAddress();
                }
            }
        },
        destroyed() {
            // 撤掉未跑到的重算计时器，并把在途那一号作废：回包再回来也不许写到一个已出栈的实例上
            //（硬约束 23 那一族；主修法在 `main.js` 的 setData 出口，这里是把源头关掉）
            clearTimeout(this.giftTimer);
            this.calcSeq = (this.calcSeq || 0) + 1;
            // 按 handler 注销：本组件有两个宿主（提交订单页 + 直播间下单弹窗），
            // 不带 handler 的 $off 会把另一个实例的监听一起摘掉
            uni.$off('addressSelected', this.onAddressSelected);
            uni.$off('orderFormPageShow', this.onFormPageShow);
            uni.$off('orderFormSubmitted', this.onFormSubmitted);
            // 插件闸门那枚「等 init 回包」的订阅同样要摘（本组件有两个宿主，按 handler 注销）
            if (this._offPluginReady) { this._offPluginReady(); this._offPluginReady = null; }
            // 闸门那只「init 一直不回就撤骨架」的兜底计时器也要清（否则回包晚于卸载会写死实例）
            if (this._gateTimer) { clearTimeout(this._gateTimer); this._gateTimer = null; }
        },

        methods: {
            formatDiscountPrice(price) {
                return this.isVirtualPay ? '-' + (price || 0) + ($tools.systemConfig('coin_name') || '金币') : '-¥' + (price || 0);
            },
            /**
             * 换商品/换拼团活动时复位「自动选券」这一档（2026-10-29 默认选最优券）
             *
             * 指纹只存实例上（`_couponCtxSig`）：同一单里改份数的静默重算不经过这里，
             * 用户已经看到的券不会被改掉；换了一件商品则上一单的券选择作废（那张券未必适用新商品）。
             */
            resetCouponForCtx() {
                const sig = this.couponCtxSig;
                if (this._couponCtxSig === sig) { return; }
                this._couponCtxSig = sig;
                this.couponAutoTried = false;
                this.form.coupon_id = '';
            },
            /**
             * 表单状态刷新（两路信号共用）：1s 内只查一次——「表单页提交广播」与
             * 「宿主页 onShow 转发」几乎同时到达时不必发两条同样的请求
             */
            refreshFormRequirement() {
                if (!this.formRequirement.hasForm || !this.pageParams.goodsList) return;
                var now = Date.now();
                if (this.formRequirement.loading || now - (this._formCheckedAt || 0) < 1000) return;
                this._formCheckedAt = now;
                this.checkFormRequirement();
            },
            // 获取默认地址
            getDefaultAddress() {
                that.$api('user.address.default').then(res => {
                    if (res.code === 1) {
                        that.address = res.data;
                    }
                });
            },

            // 检查购买课程前表单状态
            checkFormRequirement() {
                if (!that.pageParams.goodsList) return;

                // 表单为付费插件，未安装时不调用接口避免 404
                if (!that.$tools.systemConfig('app_isinstall_form')) {
                    that.formRequirement.loading = false;
                    that.formRequirement.hasForm = false;
                    return;
                }

                that.formRequirement.loading = true;
                that.$api('app.form.checkBeforeBuy', {
                    goods_list: that.pageParams.goodsList
                }).then(res => {
                    that.formRequirement.loading = false;
                    if (res.code === 1) {
                        that.formRequirement = {
                            ...that.formRequirement,
                            hasForm: res.data.has_form,
                            allSubmitted: res.data.all_submitted,
                            forms: res.data.forms
                        };
                    }
                }).catch(() => {
                    that.formRequirement.loading = false;
                });
            },

            // 跳转到表单填写页：带参就填那一张（多张表单时逐行点），不带参填第一张未提交的
            goFillForm(form) {
                const forms = (that.formRequirement.forms || []).slice();
                if (!forms.length) {
                    uni.showToast({ title: '暂无可填写的表单', icon: 'none' });
                    return;
                }
                // 点某一行就填那一张；点汇总行优先跳转未提交的表单，否则跳转第一个已提交的（查看/修改）
                const target = (form && form.form_id)
                    ? form
                    : (forms.find(f => !f.is_submitted) || forms[0]);
                if (!target || !target.form_id) {
                    uni.showToast({ title: '表单数据异常', icon: 'none' });
                    return;
                }

                let url = `/pages/app/form/submit/submit?id=${target.form_id}&from=order`;
                if (target.is_submitted && target.log_id) {
                    url += `&log_id=${target.log_id}`;
                }
                uni.navigateTo({
                    url,
                    fail(err) {
                        uni.showToast({ title: '跳转失败：' + (err && err.errMsg || ''), icon: 'none' });
                    }
                });
            },
            
            // 选择地址
            selectAddress() {
                that.$nav.to('/pages/user/address/list/list?select=1');
            },
            /** 实例已出栈/正在销毁 ⇒ 异步回包什么都不写（硬约束 23） */
            gone() {
                return this._isDestroyed === true || this._isBeingDestroyed === true;
            },
            /**
             * 付费插件闸门（三态，口径见 `common/utils/plugin-guard.js`）：
             *   · `true`  → 放行（已装）；
             *   · `false` → 一句话 + 退回（未装，这一页没有可用的建单口）；
             *   · `null`  → **不请求、不判死**：挂一次性等待，init 回包后重跑 `getData()` 这一趟
             *               （首屏竞态那一档：旧会话的 flag 不能拿来判这一轮）。
             * @param {String} tag `group_buy` / `send_friend`
             * @param {String} label 文案里的名字（「拼团」/「送好友」）
             * @return {Boolean} 是否继续往下走
             */
            pluginGate(tag, label) {
                const state = pluginState(tag);
                if (state === true) { return true; }
                if (state === null) {
                    // **等待那一拍要留着骨架屏，不能把 `loading` 关掉**（2026-10-29：拼团「开新团」与
                    // 买课后「送好友」两条入口进来都白屏）。`loading` 一关，模板就从骨架翻到内容那一支，
                    // 而此刻 `data` 还是空的、一条请求都还没发 ⇒ 整页只剩页脚，用户读出来就是「白屏」；
                    // 等 init 回包这一支又只有 `onSystemConfigReady` 一条到达路径，慢一点就是白屏好几秒。
                    // 骨架本来就是「数据还没到手」的正确形态（M16），这里保持它，
                    // init 回包后 `getData()` 会重跑这一趟并把骨架换成真内容。
                    this.loading = true;
                    if (!this._offPluginReady) {
                        this._offPluginReady = onSystemConfigReady(() => {
                            if (this._offPluginReady) { this._offPluginReady(); this._offPluginReady = null; }
                            if (!this._isDestroyed) { this.getData(); }
                        });
                    }
                    // **进入加载态就要把退出分支一次写完**（硬约束 22）：init 一直不回（离线 / 接口挂掉）
                    // 时 `onSystemConfigReady` 永远不会触发，这一页会永久停在骨架上 —— 那是另一种
                    // 「加载不完」。到点还没回包就撤骨架、说一句原因，人自己退回，不给死页。
                    clearTimeout(this._gateTimer);
                    this._gateTimer = setTimeout(() => {
                        this._gateTimer = null;
                        if (this._isDestroyed) { return; }
                        if (pluginState(tag) !== null) { return; }   // 已回包：交给正常那一支继续
                        this.loading = false;
                        uni.showToast({ title: label + '信息加载失败，请返回重试', icon: 'none' });
                    }, 6000);
                    return false;
                }
                uni.showToast({ title: label + '功能未开放', icon: 'none' });
                this.loading = false;
                setTimeout(() => this.$nav.back(), 800);
                return false;
            },
            /**
             * 送礼档的入口复核（只在首屏那一趟发，`silent` 的份数/券重算不重复问）
             *
             * 入口那枚 flag 是进页之前取的：页面从历史栈/分享链接重新打开、或停留到商家改了
             * 「可赠送内容」之后，`sf=1` 仍然在 URL 上，但这一件已经不可送了。不在这里先拦一次，
             * 用户要一路填到「立即支付」才被 `gift/create` 退回（2026-10-20 用户实报）。
             *
             * 三档退出：
             *   · flag=1 → 顺手把**本次**的份数上限写进 `giftMax`（URL 里那枚可能已过期）；
             *   · 显式 0 → 说一句原因并退回上一页，本页不再可提交；
             *   · 取不到事实（网络/接口异常）→ **不拦**，让 `gift/create` 那一次给权威判据
             *     （硬约束 22：不许把一次失败扩大成「这一页不可用」）。
             */
            checkGiftEntry() {
                const vm = this;
                if (this.giftGateChecking || this.giftBlocked) { return; }
                const first = (this.pageParams.goodsList || [])[0] || {};
                // 会员卡的 goodsId 是 `卡ID_下标`、圈子还带 `extend`：一律按字符串透传，
                // 不许 Number()（`12_0` → NaN，复核会直接跳过；后端也收不到 SKU）
                const goodsId = String(first.goodsId === null || first.goodsId === undefined ? '' : first.goodsId);
                const extend = String(first.extend || '');
                if (Number(goodsId.split('_')[0]) <= 0) { return; }
                this.giftGateChecking = true;
                this.$api('send_friend.gift.entry', {
                    goods_type: first.goodsType || 'course', goods_id: goodsId, extend: extend,
                }).then((ret) => {
                    vm.giftGateChecking = false;
                    if (vm.gone()) { return; }
                    // 复核期间 componentsParams 换了商品/规格：这一拍作废（不许拿上一件的事实判这一件）
                    const now = ((vm.pageParams || {}).goodsList || [])[0] || {};
                    const nowId = String(now.goodsId === null || now.goodsId === undefined ? '' : now.goodsId);
                    if (nowId !== goodsId || String(now.extend || '') !== extend) { return; }
                    // 后端说「送好友功能未安装」：入口 flag 已经是旧值，这一页也不能再往下走
                    if (pluginMissing('send_friend')) {
                        vm.giftBlocked = true;
                        vm.loading = false;
                        uni.showModal({
                            title: '提示',
                            content: '送好友功能暂未开放',
                            showCancel: false,
                            success() { vm.$nav.back(); },
                        });
                        return;
                    }
                    const d = ret && ret.data ? ret.data : null;
                    if (!d) { return; }
                    if (FEATURE_SEND_FRIEND && (Number(d.send_friend_entry) === 1 || d.send_friend_entry === true)) {
                        vm.giftMax = Number(d.max_per_order) || 0;
                        return;
                    }
                    vm.giftBlocked = true;
                    vm.loading = false;
                    uni.showModal({
                        title: '提示',
                        content: '该内容暂不支持赠送',
                        showCancel: false,
                        success() {
                            vm.$nav.back();
                        },
                    });
                }).catch(() => {
                    vm.giftGateChecking = false;
                });
            },
            // 送好友：改份数 = 改 goodsList 里那一件的 count 再走同一份试算（`order.calculate`，与其余购买流同口径）
            /**
             * 回体那一枚金额是不是真数值
             * `!== undefined` 挡不住 `null`/空串：一旦覆盖上去，支付面板的 `:money="data.real_price || 0"` 就是 ¥0
             * @param {*} v
             * @return {Boolean}
             */
            isGiftNum(v) {
                return v !== null && v !== undefined && v !== '' && isFinite(Number(v));
            },

            onGiftCount(e) {
                const n = Math.max(1, Number((e && e.value) || this.form.gift_count) || 1);
                this.form.gift_count = n;
                // 份数没变就不必再重算（`v-model` 先把这一格写成新值，所以记的是「上一趟发出去的数」，
                // 不能拿 `form.gift_count` 比——那样恒等、每次点击都会白发一发）
                if (this.calcGiftCount === n) { return; }
                this.calcGiftCount = n;
                const first = (this.pageParams.goodsList || [])[0];
                if (first) { first.count = n; }
                // 连点并成一发：每一发都会把前一发的回包作废（`calcSeq`），点到 5 就是白跑四趟
                clearTimeout(this.giftTimer);
                this.giftTimer = setTimeout(() => { this.getData(true); }, 300);
            },

            /**
             * 拼团档的取数（**不走 `order.calculate`**）：拼团价与商品卡由拼团侧那两个口给，
             * 金额只是展示——权威实付价在提交那一刻由 `team.open/join` 现算（回体覆盖这一格）。
             * 开团场景取活动（含阶梯价表），参团场景取团详情（价格吃团快照 `price`）。
             */
            getGroupBuyData() {
                const that = this;
                // 未装插件（或本会话 init 还没回包）：这一页没有可用的建单口 —— 已装放行、
                // 未装一句话退回，init 未回包就等它回来再重来这一趟（**不发**那条必然失败的请求）
                if (!FEATURE_GROUP_BUY || !that.pluginGate('group_buy', '拼团')) { return; }
                that.loading = true;
                that.getUserData();
                const gb = that.gbCtx;
                const req = gb.team_id
                    ? that.$api('group_buy.team.detail', {
                        team_id: gb.team_id,
                        // 2026-10-30：参团人可换规格 —— 报价按自己选的那一档（0/缺省 = 团上快照）
                        spec_id: gb.spec_id || 0,
                        spec_set: gb.spec_set || 0,
                        count: gb.count || 1,
                    })
                    : that.$api('group_buy.activity.detail', { goods_type: gb.goods_type, goods_id: gb.goods_id });
                req.then((res) => {
                    const d = (res && res.code === 1 && res.data) || null;
                    if (!d) {
                        that.loading = false;
                        if (res && res.code === 401) { return; }
                        /* 「成功但没有数据」与「真失败」两档要分开说（2026-10-29 用户点名「点击立即开团
                           跳转 pages/order/submit/submit 并提示获取成功」）：`group_buy.activity.detail`
                           的**无活动档**回的是 `{code:1, msg:'获取成功', data:null}`（后端 `Activity::detail`
                           的 `success('获取成功', null)`），拿 `res.msg` 当失败原因就是把一句成功话
                           弹成错误框 —— 用户只能读出「提示获取成功」却不知道为什么退回。
                           真失败（code≠1）才回后端那句原因；成功但无数据一律用这一句固定说明。 */
                        const msg = (res && res.code !== 1 && res.msg)
                            ? res.msg
                            : '拼团活动已结束或暂不可用，请返回重新选择';
                        uni.showModal({
                            title: '提示', content: msg, showCancel: false,
                            success: function () { that.$nav.back(); },
                        });
                        return;
                    }
                    const isJoin = !!gb.team_id;
                    // 参团页：我在这团里已经有成员行时先把话说清、带去团详情 ——
                    // 否则整页照常可填，直到点「立即支付」才被后端一句「你已参与该团」拦下。
                    // 判据不按成员状态筛：`uniq_team_user` 是物理唯一索引，退款(3)/释放(4)的行也参不了第二次，
                    // 后端 `Gate::assertTeam` 同一口径（2026-10-20 用户点自己的团撞这句错）。
                    if (isJoin) {
                        const mine = (d.members || []).filter(function (m) {
                            return Number(m.is_me) === 1;
                        })[0];
                        if (mine) {
                            that.loading = false;
                            uni.showModal({
                                title: '提示',
                                content: '你已参与该团',
                                showCancel: false,
                                success: function () {
                                    uni.redirectTo({
                                        url: '/pages/app/group_buy/detail/detail?team_id=' + gb.team_id,
                                    });
                                },
                            });
                            return;
                        }
                    }
                    // 商品三件套：开团取活动回体、参团取团详情里的 activity 段（字段同形）
                    const g = isJoin ? (d.activity || {}) : d;
                    // 参团吃团快照价；开团吃活动价（阶梯型取所选档，与弹层里选中那一档一致）
                    let price = Number(isJoin ? d.price : g.price) || 0;
                    // 多规格（2026-10-28）：开团按**选中的那一档**取价；参团吃团快照价，不再重算
                    const specRows = g.specs || [];
                    const wantSpec = Number(gb.spec_id) || 0;
                    // 规格 id 认当前 id，也认活动里存的那枚旧 id：商品重存会整批换 SKU id，
                    // 旧分享链接 / 历史栈里带来的可能是旧 id（后端 `ActivitySpec::find` 同一口径）
                    let specHit = specRows.find((r) => Number(r.spec_id) === wantSpec) || null;
                    if (!specHit && wantSpec > 0) {
                        specHit = specRows.find((r) => Number(r.legacy_spec_id) === wantSpec) || null;
                    }
                    // 参团那一档的规格文案：团详情根上直接有快照 `spec_text`（`team.detail` 的 activity
                    // 段不带 specs），老链接没带 `gb_spec` 时也能说清「买的是哪一档」（2026-10-30 用户点名
                    // 「直接跳到了这个提交订单页面，并没有选择规格」——确认页至少要把团规格写出来）
                    const teamSpecText = isJoin ? String(d.spec_text || '') : '';
                    if (!isJoin) {
                        // 开团档到这里先把规格说完，别让人填完地址才在「立即支付」上被后端拒一句
                        // **「有没有选规格」不能只看 spec_id 真值**：会员卡的 spec_id 是 sku 下标，
                        // 0 就是第 0 档（`VipcardSpec` 按下标取档）——拼团区开团链会把
                        // `gb_spec=0` 与 `gb_spec_set=1` 一起带过来（`goBuy()`），按真值判就会把
                        // 「在会员中心默认选中的第一档」读成没选，弹一句「请先选择拼团商品的规格」
                        // 再退回（2026-10-30 用户点名 `vip/center/center` 立即开团）
                        const specPicked = wantSpec > 0 || Number(gb.spec_set) === 1;
                        let specMsg = '';
                        if (specRows.length > 1 && !specPicked) {
                            specMsg = '请先选择拼团商品的规格';
                        } else if (specPicked && !specHit) {
                            specMsg = '所选规格已下架，请返回重新选择';
                        }
                        if (specMsg) {
                            that.loading = false;
                            uni.showModal({
                                title: '提示', content: specMsg, showCancel: false,
                                success: function () { that.$nav.back(); },
                            });
                            return;
                        }
                    }
                    if (!isJoin && specHit) {
                        price = Number(specHit.price) || 0;
                    }
                    if (!isJoin && g.type === 'ladder' && g.ladder && g.ladder.length) {
                        // 阶梯档按选中的规格过滤（后端按 spec_id 分组下发），再按 ladder_id 取档
                        const tiers = specHit
                            ? (g.ladder.filter((r) => Number(r.spec_id) === Number(specHit.spec_id)).length
                                ? g.ladder.filter((r) => Number(r.spec_id) === Number(specHit.spec_id))
                                : g.ladder)
                            : g.ladder;
                        const row = tiers.find((r) => Number(r.id) === Number(gb.ladder_id)) || tiers[0];
                        price = Number(row.price) || 0;
                    }
                    // 份数与合计：单价 × 份数（后端 `team.open/join` 仍按同一份 count 现算，
                    // 提交后支付面板的金额以回体为准）
                    const gbCount = Math.max(1, Number(gb.count) || 1);
                    const gbTotal = Math.round((Number(price) || 0) * gbCount * 100) / 100;
                    that.data = {
                        orderGoodsList: [{
                            item_id: gb.goods_id,
                            // 份数（规格弹窗里的「购买数量」）：确认页要按 n 份显示，别把 2 份写成 1 份
                            count: gbCount,
                            detail: {
                                id: gb.goods_id,
                                // 名称带上规格：确认页要能看出「买的是哪一档」（多规格下只写商品名会两个活动长得一样）
                                name: (g.goods_name || '') + ((specHit && specHit.spec_text ? specHit.spec_text : teamSpecText)
                                    ? ' · ' + (specHit && specHit.spec_text ? specHit.spec_text : teamSpecText) : ''),
                                cover: g.goods_cover || '',
                                type: g.goods_type || gb.goods_type,
                                price: price,
                                price_marking: Number(g.origin_price) || 0,
                            },
                        }],
                        goods_count: gbCount,
                        goods_total_price: gbTotal,
                        real_price: gbTotal,
                        // 虚拟支付（2026-10-27 用户点名「拼团对应的支付要适配小程序虚拟支付」）：
                        // `price` 已经是后端换算过的展示价（代币），判据只读接口下发的 `is_virtual_pay`——
                        // 参团那一档在团详情根上、开团那一档在活动回体根上（`activity` 段里没有这一枚）。
                        // **实付金额仍按人民币原值**由 `team.open/join` 现算（后端 OrderCreate），
                        // 本页只负责把面板与底栏的「显示那一格」切成代币。
                        is_virtual_pay: Number(isJoin ? d.is_virtual_pay : g.is_virtual_pay) === 1 ? 1 : 0,
                    };
                    // 额外上下文（2026-10-28）：线下活动报名信息 / 教务套餐校区学生
                    that.prepareGbExtra(g);
                    // 收货地址（2026-10-29）：实物单与「规格含实物子商品的组合单」这一屏要地址。
                    // 判据只读后端那一枚，不在前端按商品类型猜（组合商品另一档可能全是虚拟）：
                    //   开团 ⇒ 选中/唯一那一档规格行上的 `need_address`；
                    //   参团 ⇒ 团详情 activity 段上按团快照规格算好的 `need_address`。
                    let gbNeedAddress = 0;
                    if (isJoin) {
                        gbNeedAddress = Number(g.need_address) === 1 ? 1 : 0;
                    } else if (specHit) {
                        gbNeedAddress = Number(specHit.need_address) === 1 ? 1 : 0;
                    } else if (specRows.length === 1) {
                        gbNeedAddress = Number(specRows[0].need_address) === 1 ? 1 : 0;
                    }
                    that.gbNeedAddress = gbNeedAddress;
                    // 要地址就先把默认地址填上（与实物那一档同口径：能自动推导的不让用户再点一次）
                    if ((gb.goods_type === 'physical' || gbNeedAddress === 1) && !that.address) {
                        that.getDefaultAddress();
                    }
                    // 购买前表单（before_buy）照全站口径拦一次——支付口那一层也会拦，
                    // 提前到这一步是为了让人在本页就把表单填了，不是到点支付才被拒
                    that.checkFormRequirement();
                    // 已经选过券（本页重取一次数据时）：金额必须按券后那一档显示，
                    // 否则「券还挂着、底栏却回到拼团原价」——提交那一刻又变成券后价
                    if (Number(that.form.coupon_id) > 0) {
                        that.loading = false;
                        that.calcGroupBuyAmount();
                        return;
                    }
                    // 默认选最优券（2026-10-29 用户点名）：开团/参团这一档也要，券的适用性
                    // 与门槛由后端按拼团价判（`group_buy.team.calc` 带 `auto_coupon=1`）。
                    // **骨架留到券算完**：否则券行与底栏会先按原价摆一次再跳成券后价
                    if (that.canAutoPickCoupon()) {
                        that.calcGroupBuyAmount(true, function () { that.loading = false; });
                        return;
                    }
                    that.loading = false;
                }).catch(() => {
                    that.loading = false;
                    // 请求层异常（断网/超时/被拦截）也要有可读出口：只关骨架就是把这一页
                    // 静默留成一张只有页脚的白页（M13）。失败不前进、不动购物车状态，人自己退回。
                    uni.showToast({ title: '拼团信息加载失败，请返回重试', icon: 'none' });
                });
            },

            getData(silent) {
                // 拼团档走自己的取数（两个口、无 calculate）
                if (this.isGroupBuy) {
                    this.getGroupBuyData();
                    return;
                }
                // 送好友那一档：插件不在盘上（标准版）时这一页没有可用的建单口，先说话再退回，
                // 不白铺一张骨架等一条必然 404 的请求（付费插件「代码即插件」，paid-plugins.md）
                if (this.isSendFriend && (!FEATURE_SEND_FRIEND || !this.pluginGate('send_friend', '送好友'))) { return; }
                // 送礼档：首屏那一趟先复核一次入口 flag（页面可能来自历史栈/分享链接，或停留到设置变更之后）。
                // `silent` 那一趟（改份数 / 选券）不再问——份数上限已经落到 `giftMax`，金额重算与 flag 无关
                if (this.isSendFriend && !silent) {
                    this.checkGiftEntry();
                }
                // `silent`（页内改份数 / 选券）= 局部刷新：`loading` 一置真，整块模板就从内容翻成骨架，
                // 步进器与券行被销毁重建，用户读出来是「点一次刷一次」；随金额一起回来的那三样
                //（用户资料、默认收货地址、购买前表单）都不随份数与券变，静默那一趟不再重取。
                if (!silent) {
                    this.loading = true;
                    that.getUserData();
                }
                var form = {
                    goodsList: that.pageParams.goodsList,
                    coupon_id: that.form.coupon_id,
                };

                // 自动选券（2026-10-29 用户点名「优惠券可以默认选中一个最优的」）：
                // 只走首屏那一趟 —— silent 的局部重算（改份数）与用户自己选过券之后都不许再挑，
                // 否则「我选了不使用」会被下一次重算改回来。虚拟支付由后端那一侧跳过。
                const autoCoupon = !silent && !this.couponAutoTried && !(Number(this.form.coupon_id) > 0);
                if (autoCoupon) {
                    form.auto_coupon = 1;
                }

                if (that.pageParams.type) {
                    form.order_type = that.pageParams.type;
                }

                if (that.pageParams.live_id) {
                    form.live_id = that.pageParams.live_id;
                }

                if (that.pageParams.live_goods_action_id) {
                    form.live_goods_action_id = that.pageParams.live_goods_action_id;
                }

                // 每一趟重算发一号，回包只认最新那一号：连点「+」时先发的请求可能后回，
                // 照旧写 `data` 就把新份数的金额盖回上一档（数字与步进器对不上，最难查）。
                // 记在实例上（`this`，箭头回调吃的是词法 this），不记模块级 `that` —— 两个宿主共用本组件时
                // `that` 会被后挂载的那个实例顶掉，拿它比号就等于比到别人家的账上
                const seq = (this.calcSeq || 0) + 1;
                this.calcSeq = seq;

                that.$api("order.calculate", form).then((res) => {
                    if (seq !== this.calcSeq) { return; }
                    this.loading = false;
                    if (res.code === 1) {
                        that.data = res.data;
                        if (autoCoupon) {
                            // 后端挑中的券回填到 form：券行（抵扣额）、券弹窗的勾选态、提交载荷都读这一格。
                            // 没挑到（无可用券 / 虚拟支付）时 `coupon_id` 为 0，券行保持「请选择优惠券」
                            that.couponAutoTried = true;
                            const picked = Number((res.data || {}).coupon_id) || 0;
                            if (picked > 0) {
                                that.form.coupon_id = picked;
                            }
                        }
                        if (silent) { return; }
                        // 规格含实物商品的组合订单：预载默认收货地址
                        if (that.needAddress && !that.address) {
                            that.getDefaultAddress();
                        }
                        // 检查购买课程前表单
                        that.checkFormRequirement();
                    } else if (res.code === 401) {
                        // 登录态失效，全局拦截器已弹出登录提示并引导跳转登录页，此处不再重复提示或返回
                    } else if (silent) {
                        // 静默那一趟不拆页面：金额停在上一档、说一句原因（原先不管哪一趟都弹
                        //「确认后返回上一页」的框 ⇒ 改一次份数就把人送离下单页）
                        uni.showToast({ title: (res && res.msg) || '金额未更新，请重试', icon: 'none' });
                    } else {
                        uni.showModal({
                            title: "提示",
                            content: res.msg,
                            success: function (res) {
                                that.$nav.back();
                            },
                        });
                    }
                }).catch(() => {
                    if (seq !== this.calcSeq) { return; }
                    // 接口异常/未登录被拦截时释放骨架屏，避免页面永久停留在占位态
                    this.loading = false;
                    if (silent) {
                        uni.showToast({ title: '金额未更新，请重试', icon: 'none' });
                    }
                });
            },

            /**
             * 打开券弹窗（2026-10-29 拼团档先补齐取价必需项）
             *
             * 线下活动要报名信息、教务套餐要校区 + 学生：这两类商品的**取价口**本身就要它们
             * （`Handle::getGoodsDetail` 第三参 / 教务套餐核归属），缺了它们券清单与试算都会失败，
             * 弹窗只会显示「暂无优惠券」——先把话说清，别让人以为没券可用。
             */
            openCouponPicker() {
                if (this.isGroupBuy) {
                    if (this.gbExtra.kind === 'activity' && !this.gbExtra.formUserId) {
                        uni.showToast({ title: '请先填写报名信息', icon: 'none' });
                        return;
                    }
                    if (this.gbExtra.kind === 'school' && (!this.gbExtra.campusId || !this.gbExtra.studentId)) {
                        uni.showToast({ title: '请先选择上课校区与上课学生', icon: 'none' });
                        return;
                    }
                }
                this.modal.couponPicker = true;
            },

            /**
             * 优惠券选中
             * @param {*} id 用户优惠券 id
             */
            couponChange(id) {
                // 用户自己选过（含「不使用优惠券」）就不能再被自动选券改回去（2026-10-29）
                this.couponAutoTried = true;
                this.form.coupon_id = id;
                this.modal.couponPicker = false;
                // 拼团档不走 `order.calculate`（那一页的金额由活动/团详情现组），选券后单独试算一次
                if (this.isGroupBuy) {
                    this.calcGroupBuyAmount();
                    return;
                }
                // 同份数那一档：选券只改金额，不该把整页换成骨架再换回来
                this.getData(true);
            },

            /**
             * 拼团档这一拍能不能自动挑券（2026-10-29 用户点名「优惠券可以默认选中一个最优的」）
             *
             * 三档不打主意：用户已选过（含「不使用」）、已经挑过一轮、这一单是虚拟支付
             * （券段整段不摆，后端 `autoPickCoupon()` 也不挑）。
             * 另有两档**取价口本身要它们**，缺了券清单/试算会直接失败，等填完再挑：
             * 线下活动要报名信息、教务套餐要校区 + 上课学生（与 `openCouponPicker` 同一份判据）。
             */
            canAutoPickCoupon() {
                if (this.couponAutoTried || Number(this.form.coupon_id) > 0) { return false; }
                if (this.isVirtualPay) { return false; }
                if (this.gbExtra.kind === 'activity' && !this.gbExtra.formUserId) { return false; }
                if (this.gbExtra.kind === 'school' && (!this.gbExtra.campusId || !this.gbExtra.studentId)) { return false; }
                return true;
            },

            /**
             * 拼团档：取价必需项「后补」时补挑一次最优券（报名信息填完 / 校区学生选完）
             *
             * 首屏那一趟若因为缺这些项没挑，之后补齐了就没人再问券了 —— 用户会读成
             * 「这个商品就是没有自动选券」。这里只补这一拍，挑没挑过由 `canAutoPickCoupon` 判。
             */
            tryAutoCouponGb() {
                if (!this.isGroupBuy || !this.canAutoPickCoupon()) { return; }
                this.calcGroupBuyAmount(true);
            },

            /**
             * 拼团档选券后试算（2026-10-29 拼团开放用券）
             *
             * 只改展示金额，**权威实付价仍是提交那一刻 `team.open/join` 现算的那一份**；
             * 两条链在后端共用 `OrderBridge` + `TeamService::context*` 同一份参数形状。
             *
             * 券在弹窗打开之后失效/门槛不够时，回体会带 `msg`（`OrderCreate::calc()` 的
             * 非致命错误档）：把券清掉、按不带券再算一次，并把原因说给用户听。
             * 不能静默留着那张券 —— 提交那一刻会直接失败，用户不知道是哪一步。
             *
             * 自动挑券那一趟（`auto=true`）由后端按本单可用券挑优惠最大的一张、随回体给 `coupon_id`；
             * 端上只把这一格回填给券行与提交载荷（提交不带 auto 标记，后端建单档永不自动）。
             *
             * @param {Boolean} auto 自动挑券那一趟（首屏）
             * @param {Function} done 收尾回调（首屏要把骨架留到这一趟算完才撤）
             */
            calcGroupBuyAmount(auto, done) {
                const that = this;
                const finish = () => {
                    if (typeof done === 'function') {
                        const cb = done;
                        done = null;
                        cb();
                    }
                };
                if (auto) {
                    // 只挑一次：失败也记下，别在重试链里反复问券
                    this.couponAutoTried = true;
                }
                const params = Object.assign({}, this.gbCouponParams, {
                    coupon_id: Number(this.form.coupon_id) || 0,
                });
                if (auto) {
                    params.auto_coupon = 1;
                }
                that.$api('group_buy.team.calc', params).then((res) => {
                    if (!res || res.code !== 1) {
                        if (res && res.code === 401) { finish(); return; }
                        // 自动档失败只等于「这次没选上券」（券行仍是「请选择优惠券」，人自己能选），
                        // 别在首屏弹一句「金额未更新」把页面打开那一刻说得像出错
                        if (!auto) {
                            uni.showToast({ title: (res && res.msg) || '金额未更新，请重试', icon: 'none' });
                        }
                        finish();
                        return;
                    }
                    const d = res.data || {};
                    if (auto) {
                        const picked = Number(d.coupon_id) || 0;
                        if (picked > 0) {
                            that.form.coupon_id = picked;
                        }
                    }
                    if (d.msg) {
                        // 券不可用：清掉后回落不带券那一档（避免留下「显示有券、提交必失败」的页面）
                        if (!auto) {
                            uni.showToast({ title: d.msg, icon: 'none' });
                        }
                        that.form.coupon_id = 0;
                        that.$set(that.data, 'coupon_info', null);
                        finish();
                        that.calcGroupBuyAmount();
                        return;
                    }
                    // 只覆盖随券变化的这几格；商品卡单价/份数/名称仍是拼团价那一份
                    const goods = that.data && that.data.orderGoodsList ? that.data.orderGoodsList : [];
                    if (goods.length) {
                        goods[0].coupon_discount_fee = Number(d.coupon_discount_fee) || 0;
                    }
                    that.$set(that.data, 'goods_total_price', Number(d.goods_total_price) || 0);
                    that.$set(that.data, 'coupon_discount_fee', Number(d.coupon_discount_fee) || 0);
                    // 券类型 Tag（2026-10-30）：拼团档不走 `order.calculate`，这一格要在这里单独回填，
                    // 否则「券抵了钱、Tag 不出现」——两档金额来源不同，展示字段必须同源跟上
                    that.$set(that.data, 'coupon_info', d.coupon_info || null);
                    // 券行「请选择优惠券 / 暂无可用优惠券」那一档的判据（后端本单可用券张数，
                    // 2026-10-30）：拼团档不吃 `order.calculate`，这一格同样要在这里单独回填
                    that.$set(that.data, 'coupon_can_use', Number(d.coupon_can_use) || 0);
                    that.$set(that.data, 'discount_price', Number(d.discount_price) || 0);
                    that.$set(that.data, 'order_total_price', Number(d.order_total_price) || 0);
                    that.$set(that.data, 'real_price', Number(d.real_price) || 0);
                    finish();
                }).catch(() => {
                    // 同上一支：自动档失败不弹错误（只是这一屏没默认选上券）
                    if (!auto) {
                        uni.showToast({ title: '金额未更新，请重试', icon: 'none' });
                    }
                    finish();
                });
            },

            /**
             * 取消支付
             * 跳转到订单详情页面
             */
            cancelPay() {
                if (that.pageParams.live_id) {
                    this.modal.pay = false;
                    return false;
                }

                // 拼团档：支付面板关掉（无论已支付还是取消）都去**团详情页**看进度——
                // 与拼团区旧链 payClosed 同一去处；支付成功那一刻 orderPaid 广播已由 PayHandle 发出
                if (that.isGroupBuy) {
                    this.modal.pay = false;
                    if (this.gbTeamId) {
                        uni.redirectTo({
                            url: "/pages/app/group_buy/detail/detail?team_id=" + this.gbTeamId,
                        });
                    }
                    return false;
                }

                uni.redirectTo({
                    url: "/pages/order/detail/detail?order_no=" + this.orderNo,
                });
            },

            /**
             * 支付宝引导弹窗关闭
             * 跳转到订单详情页面
             */
            alipayGuideClose() {
                this.modal.pay = false;
                if (that.isGroupBuy) {
                    if (this.gbTeamId) {
                        uni.redirectTo({
                            url: "/pages/app/group_buy/detail/detail?team_id=" + this.gbTeamId,
                        });
                    }
                    return false;
                }
                uni.redirectTo({
                    url: "/pages/order/detail/detail?order_no=" + this.orderNo,
                });
            },

            //展示弹窗
            showModal(type) {
                that.modal[type] = !that.modal[type];
            },
            getUserData() {
                that.$api("user.info.index", {}).then((res) => {
                    if (res.code === 1) {
                        that.userInfo = res.data;
                    }
                });
            },

            /**
             * 拼团额外上下文（2026-10-28）：只认后端 `order_extra`，不按商品类型猜
             *
             * kind='activity'（线下活动）：拉报名信息字段（`activity.form.getform`），
             *   填完提交拿 form_user_id（取价口第三参）；
             * kind='school'（教务套餐）：**校区与学生已经在上一跳「确认报名」页选好**
             *   （2026-10-30），2026-10-31 起本页也不再回显（与单独购买同形），
             *   只按 `gb_campus` / `gb_student` 核「还在名单里」。
             *
             * 参团场景 `g` 是团详情里的 activity 段，字段与商详区同形（都带 order_extra）。
             */
            prepareGbExtra(g) {
                const extra = (g && g.order_extra) || {};
                this.gbExtra.kind = extra.kind || '';
                this.gbExtra.activityId = Number(extra.activity_id) || 0;
                this.gbExtra.packageId = Number(extra.package_id) || 0;
                // 上课校区 / 上课学生（2026-10-30）：由确认报名页带过来，本页不再让人选第二次；
                // 2026-10-31 起也不再显示（与单独购买同形），只留 id 交给 `team.open/join`。
                // 老链接没带这两枚时，只有一个可选校区/学生仍自动选上（`loadSchoolContext`）。
                const preCampus = Number((this.pageParams || {}).gb_campus) || 0;
                if (preCampus) { this.gbExtra.campusId = preCampus; }
                const preStudent = Number((this.pageParams || {}).gb_student) || 0;
                if (preStudent) { this.gbExtra.studentId = preStudent; }
                // 线下活动（2026-10-31 用户点名「拼团先到选票页添加报名信息、再到报名信息页填写」）：
                // 报名信息在那两页收完、随 `gb_form` 进来 ⇒ 本页不再摆那只表单层
                //（与单独购买同形：结算页没有报名信息这一行），只把 id 交给 `team.open/join`。
                // 老链接 / 历史栈没带这一枚时仍按原路补填（下面 `loadApplyFields()` 那一支）。
                const preForm = Number((this.pageParams || {}).gb_form) || 0;
                if (preForm) {
                    this.gbExtra.formUserId = preForm;
                    this.gbExtra.applyFilled = true;
                }
                if (extra.kind === 'activity' && !this.gbExtra.formUserId) {
                    this.loadApplyFields();
                }
                if (extra.kind === 'school') {
                    this.loadSchoolContext();
                }
            },
            loadApplyFields() {
                const that = this;
                if (!that.gbExtra.activityId) { return; }
                that.$api('app.activity.form.getform', { activity_id: that.gbExtra.activityId }).then((res) => {
                    if (res && res.code === 1) {
                        that.gbExtra.applyFields = res.data || [];
                    }
                }).catch(() => {});
            },
            openApplyForm() {
                if (!this.gbExtra.activityId) { return; }
                // 字段还没回来：先取一次再开（不让用户点出一个空表单）
                if (!this.gbExtra.applyFields.length) {
                    const that = this;
                    that.$api('app.activity.form.getform', { activity_id: that.gbExtra.activityId }).then((res) => {
                        if (res && res.code === 1) {
                            that.gbExtra.applyFields = res.data || [];
                            that.gbExtra.applyVisible = true;
                        } else {
                            uni.showToast({ title: (res && res.msg) || '获取报名信息失败', icon: 'none' });
                        }
                    }).catch(() => {});
                    return;
                }
                this.gbExtra.applyVisible = true;
            },
            /** 报名信息弹层确认：先提交拿 form_user_id，再放行支付 */
            onApplyOk(values) {
                const that = this;
                that.gbExtra.applyVisible = false;
                uni.showLoading({ title: '保存报名信息', mask: true });
                that.$api('app.activity.form.submit', {
                    activity_id: that.gbExtra.activityId,
                    form: [values],
                }).then((res) => {
                    uni.hideLoading();
                    const ids = (res && res.code === 1 && res.data) || [];
                    if (!ids.length) {
                        uni.showToast({ title: (res && res.msg) || '报名信息提交失败，请重试', icon: 'none' });
                        return;
                    }
                    that.gbExtra.formUserId = Number(ids[0]) || 0;
                    that.gbExtra.applyFilled = that.gbExtra.formUserId > 0;
                    // 取价必需的报名信息到手了：补挑一次最优券（2026-10-29 默认选券）
                    that.tryAutoCouponGb();
                }).catch((res) => {
                    uni.hideLoading();
                    uni.showToast({ title: (res && res.msg) || '报名信息提交失败，请重试', icon: 'none' });
                });
            },
            /**
             * 教务套餐：校区名单来自套餐详情（同一份接口给 skus 与 campus_list），学生名单走学生接口。
             *
             * **本页不选、也不显示**（2026-10-30 用户点名「拼团也要进确认报名页，不要在下单页另造一套
             * 选择器」；2026-10-31 再点名「拼团下单的提交订单应该与单独购买一样，不要显示这个校区和
             * 学生了」）：`gb_campus` / `gb_student` 是上一跳确认页带过来的，这里只核**还在不在名单里**；
             * 名单里没有这一处（校区被删/禁用、学生被删或解绑）就清掉，让提交口把那句可读的原因说出来，
             * 不留一枚指向已下线实体的值（取价口会以「校区不适用 / 请选择本人名下的学生」拒单）。
             * 老链接（没带这两枚）仍按「只有一个就自动选上」兜一次，能自动推导的不让人再点。
             */
            loadSchoolContext() {
                const that = this;
                if (!that.gbExtra.packageId) { return; }
                that.$api('school.package.detail', { id: that.gbExtra.packageId }).then((res) => {
                    const d = (res && res.code === 1 && res.data) || {};
                    // 规格下标：兜底回「确认报名」页时要按它把这一单原样带回去（确认页按 `skus` 下标取档）
                    const skus = d.skus || [];
                    const wantSku = Number(that.gbCtx.spec_id) || 0;
                    let skuIndex = skus.findIndex((s) => Number(s.id) === wantSku);
                    if (skuIndex < 0) { skuIndex = 0; }
                    that.gbExtra.skuIndex = skuIndex;
                    // 校区名单只留 id：本页不选也不显示，只拿它核「确认页选过的那一处还在不在」
                    //（选择与校区卡弹层都在确认报名页，那份数据由那一页自己拉）
                    that.gbExtra.campusList = (d.campus_list || []).map((c) => ({
                        id: Number(c.id) || 0,
                    }));
                    // 确认页选过的那一处：列表里还在就沿用；换了套餐 / 校区已下线（软删或禁用）⇒ 清掉，
                    // 落到下面「只有一个校区就自动选」那一档
                    const want = Number(that.gbExtra.campusId) || 0;
                    const hit = want ? that.gbExtra.campusList.filter((c) => c.id === want)[0] : null;
                    if (!hit && want) {
                        that.gbExtra.campusId = 0;
                    }
                    // 只有一个校区时直接选上（老链接没有 `gb_campus` 这一枚时的兜底）
                    if (!that.gbExtra.campusId && that.gbExtra.campusList.length === 1) {
                        that.gbExtra.campusId = that.gbExtra.campusList[0].id;
                    }
                    // 校区可能先于学生回来：两枚齐了才挑券（`tryAutoCouponGb` 自己判）
                    that.tryAutoCouponGb();
                }).catch(() => {});
                that.$api('school.user.students').then((res) => {
                    const list = (res && res.code === 1 && res.data && res.data.list) || [];
                    const want = Number(that.gbExtra.studentId) || 0;
                    const hit = want ? list.filter((x) => Number(x.id) === want)[0] : null;
                    if (!hit && want) {
                        that.gbExtra.studentId = 0;
                    }
                    // 只有一名学生时直接选上（老链接兜底；多名时确认页已经选过，不在这里再猜）
                    if (!that.gbExtra.studentId && list.length === 1) {
                        that.gbExtra.studentId = Number(list[0].id) || 0;
                    }
                    // 学生可能晚于校区回来：两枚齐了才挑券（同上）
                    that.tryAutoCouponGb();
                }).catch(() => {});
            },
            /**
             * 教务套餐的兜底出口：本页不再摆校区/学生选择器、也不再回显（2026-10-30 / 10-31）⇒
             * 老链接、历史栈、或名单里那一处已失效时，只能把这一单原样带回「确认报名」页补选。
             *
             * `redirectTo` 替掉本页：确认页提交时也是 `redirectTo` 回来，栈里不会留下两张结算页
             * （`navigateTo` 会留下「返回上一页 = 另一张结算页」）。
             */
            goConfirmForSchool() {
                if (!this.gbExtra.packageId) { return; }
                const gb = this.gbCtx;
                const unit = ((this.data && this.data.orderGoodsList) || [])[0] || {};
                const unitPrice = Number(unit.detail && unit.detail.price) || 0;
                const url = groupBuyConfirmUrl({
                    packageId: this.gbExtra.packageId,
                    skuIndex: this.gbExtra.skuIndex,
                    campusId: this.gbExtra.campusId,
                    gb: {
                        gb_activity: gb.activity_id,
                        // 0 不拼：开团档没有团、非阶梯档没有人数档（空串会被 `withGroupBuyOrder` 跳过）
                        gb_team: gb.team_id || '',
                        gb_ladder: gb.ladder_id || '',
                        gb_spec: gb.spec_id,
                        gb_spec_set: gb.spec_set,
                        gb_count: gb.count > 1 ? gb.count : '',
                        gb_campus: this.gbExtra.campusId,
                        gb_goods_type: gb.goods_type,
                        gb_goods_id: gb.goods_id,
                        // 确认页展示价：结算页当前这一档的拼团单价（虚拟支付那一档是代币，不混进人民币位）
                        gb_price: unitPrice > 0 && !this.isVirtualPay ? unitPrice.toFixed(2) : '',
                    },
                });
                this.$nav.to(url, 'local', 'redirectTo');
            },
            /**
             * 拼团档提交：`team.open` / `team.join` 拿待支付订单号 → 起支付面板。
             * 三条纪律与拼团区 `goBuy` 同一份：**失败不许前进**（显式判 code 与 order_no，
             * 否则就是一枚 order_no 为空的支付面板，点支付必报「订单不存在」）、
             * 金额吃回体 `price`（后端算的应付价）、未登录交给全局拦截器（401 分支）。
             */
            submitGroupBuy() {
                const that = this;
                // 在途锁：这一口每进来一次就 `team.open` 建一个新团 + 一条待支付订单，
                // 连点两下＝账上多一个团（2026-10-20 用户「发起多次支付」同族）；遮罩挡不住连点
                if (that.submitting) { return; }
                that.submitting = true;
                const gb = that.gbCtx;
                // 买家留言与其他单同一格（form.buyer_remark），后端 team.open/join 收进去交 OrderCreate
                const remark = String(that.form.buyer_remark || '').trim();
                // 额外上下文（2026-10-28）：线下活动本页收报名信息；教务套餐的校区/学生已在
                // 「确认报名」页选好、随 `gb_campus` / `gb_student` 进来（本页不显示也不让人改）。
                // 缺了**先在页内拦**：后端取价口会回一句「报名信息错误 / 请选择上课学生」，
                // 但那时已经建了团与待支付订单（白占一个名额），体验与账目都不该那样
                if (that.gbExtra.kind === 'activity' && !that.gbExtra.formUserId) {
                    uni.showToast({ title: '请填写报名信息', icon: 'none' });
                    that.submitting = false;
                    return;
                }
                if (that.gbExtra.kind === 'school' && (!that.gbExtra.campusId || !that.gbExtra.studentId)) {
                    // 本页不选校区/学生（选择在确认报名页）⇒ 这里只给一个出口，把人带回那一页补选；
                    // toast 一秒就消失、也说不清去哪儿补，用只给确认键的原生弹窗（M13）
                    that.submitting = false;
                    uni.showModal({
                        title: '提示',
                        content: '上课校区或上课学生信息已失效，请重新选择',
                        showCancel: false,
                        confirmText: '去选择',
                        success: function (r) {
                            if (r && r.confirm) { that.goConfirmForSchool(); }
                        },
                    });
                    return;
                }
                // 收货地址（2026-10-29）：实物单与「规格含实物子商品的组合单」必须先选地址 ——
                // 后端 `team.open/join` 会在建团前拦同一句，这里拦是为了不白建团/不白占名额。
                // 地址随 body 交回去，由 `OrderBridge` 交给 `OrderCreate` 落 `app_physical_order_address`
                if (that.needShipping && !that.address) {
                    uni.showToast({ title: '请选择收货地址', icon: 'none' });
                    that.submitting = false;
                    return;
                }
                const addressId = that.needShipping ? Number(that.address.id) || 0 : 0;
                // 优惠券（2026-10-29）：与普通单同一枚键名，后端 `OrderBridge` 透传给 `OrderCreate`。
                // 0 = 没用券（缺省，逐字等于改造前）；虚拟支付那一档券段整段不出，
                // 这里也强制归 0（防「先选券、数据回来才翻成虚拟支付」那一拍把券带进去）
                const couponId = that.isVirtualPay ? 0 : (Number(that.form.coupon_id) || 0);
                const body = gb.team_id
                    ? {
                        team_id: gb.team_id,
                        // 2026-10-30：团绑定商品、不绑定规格 —— 参团人自己选的那一档随建单口交回
                        spec_id: gb.spec_id || 0,
                        spec_set: gb.spec_set || 0,
                        count: gb.count || 1,
                        buyer_remark: remark,
                        address_id: addressId,
                        coupon_id: couponId,
                        form_user_id: that.gbExtra.formUserId || 0,
                        student_id: Number(that.gbExtra.studentId) || 0,
                        campus_id: Number(that.gbExtra.campusId) || 0,
                    }
                    : {
                        activity_id: gb.activity_id,
                        ladder_id: gb.ladder_id || 0,
                        spec_id: gb.spec_id || 0,
                        spec_set: gb.spec_set || 0,
                        count: gb.count || 1,
                        buyer_remark: remark,
                        address_id: addressId,
                        coupon_id: couponId,
                        form_user_id: that.gbExtra.formUserId || 0,
                        student_id: Number(that.gbExtra.studentId) || 0,
                        campus_id: Number(that.gbExtra.campusId) || 0,
                    };
                uni.showLoading({ title: '正在提交订单', mask: true });
                that.$api(gb.team_id ? 'group_buy.team.join' : 'group_buy.team.open', body).then((res) => {
                    uni.hideLoading();
                    that.submitting = false;
                    const d = (res && res.code === 1 && res.data) || null;
                    if (!d || !d.order_no) {
                        if (res && res.code === 401) { return; }
                        uni.showModal({
                            title: '提示', content: (res && res.msg) || '提交失败，请重试', showCancel: false,
                        });
                        return;
                    }
                    that.orderNo = String(d.order_no);
                    that.gbTeamId = Number(d.team_id) || 0;
                    // 金额以回体为准：面板上的数与实扣的数同源（拼团区旧链同一条纪律）。
                    // **虚拟支付那一档读 `display_price`（代币数）**：`price` 是人民币实付原值，
                    // 拿它直接上面板就是「显示 ¥9.9、实扣 99 金币」（2026-10-27）
                    if (d.display_price !== undefined) {
                        that.data.real_price = d.display_price;
                    } else if (d.price !== undefined) {
                        that.data.real_price = Number(d.price) || 0;
                    }
                    if (d.is_virtual_pay !== undefined) {
                        that.data.is_virtual_pay = Number(d.is_virtual_pay) ? 1 : 0;
                    }
                    // 0 元单（含券后 0 元）：后端已按支付成功收尾（`TeamService::settleFreeOrder`），
                    // 直接去「支付成功」页，不再弹选择支付方式（2026-10-30 用户点名）。
                    // 判据只认后端那一枚 `paid`：端上拿价格自己判会把「显示 0 元、实际还待支付」的
                    // 单也放过去（价格是券后价，收尾是后端行为）。
                    if (Number(d.paid) === 1) {
                        uni.redirectTo({
                            url: "/pages/public/result/result?order_no=" + that.orderNo,
                        });
                        return;
                    }
                    that.showModal('pay');
                }).catch(() => {
                    // 失败也要撤遮罩（硬约束 22：进入加载态要把其余退出分支一次扫完）——
                    // 请求层在 code 0 / 401 与网络异常时都会 reject，漏了这一支整页被 mask 锁死
                    uni.hideLoading();
                    that.submitting = false;
                });
            },

            //提交订单
            submitOrder() {
                // 购买前表单校验
                if (that.formRequirement.hasForm && !that.formRequirement.allSubmitted) {
                    uni.showModal({
                        title: '提示',
                        content: '请先完成购买前表单',
                        showCancel: false
                    });
                    return false;
                }

                //判断是否绑定手机号
                if (
                    that.$tools.systemConfig("bind_mobile_modal") == "open" &&
                    !that.userInfo.mobile
                ) {
                    uni.showModal({
                        title: "提示",
                        content: "请先绑定手机号",
                        showCancel: false,
                        success: function (res) {
                            that.$refs.bindMobileModal.showModal();
                        }
                    });
                    return false;
                }

                // 拼团档：提交口切到 team.open/join（订单 source 与团/成员行的唯一正解，PRD M-P3）。
                // 位置必须在这两段校验**之后**（购买前表单 + 手机号绑定与普通链同一份闸门——
                // 支付口 pay/handle 里照查 before_buy 表单，前端提前拦才不用到支付才被拒）
                if (that.isGroupBuy) {
                    that.submitGroupBuy();
                    return false;
                }

                // 送礼档被入口复核判死（flag=0）时不再提交：弹窗那一次已经在退回上一页，
                // 这里只兜「用户在弹窗确认前又点了一下」的那一拍
                if (that.isSendFriend && that.giftBlocked) {
                    return false;
                }

                uni.showLoading({
                    title: "正在提交订单",
                });

                that.form.goodsList = that.pageParams.goodsList;

                if (that.pageParams.type) {
                    that.form.order_type = that.pageParams.type;
                }
                
                // 实物商品或含实物商品的组合订单，校验地址（`needShipping` 是这一屏的唯一判据）
                if (that.needShipping) {
                    if (!that.address) {
                        uni.hideLoading();
                        uni.showToast({
                            title: '请选择收货地址',
                            icon: 'none'
                        });
                        return false;
                    }
                    that.form.address_id = that.address.id;
                }

                if (that.pageParams.live_id) {
                    that.form.live_id = that.pageParams.live_id;
                }

                if (that.pageParams.live_goods_action_id) {
                    that.form.live_goods_action_id = that.pageParams.live_goods_action_id;
                }

                //创建订单 拿到订单号跳到订单详情页面
                // 送好友（`sf=1`）那一档：同一条链走到这里，建单口换成插件的 `send_friend.gift.create`
                // （source=send_friend 与礼单结算都在那一条口上，见 PRD D1/D2）；其余下单流程逐字不变。
                // 那一口回体没有 `status`（必为待支付），走支付面板那一支。
                const sfFirst = (that.pageParams.goodsList || [])[0] || {};
                that.$api(
                    that.isSendFriend ? "send_friend.gift.create" : "order.create",
                    that.isSendFriend ? {
                        // 圈子带规格位、会员卡的 SKU 在 goods_id 里：两枚都按入口给的原样透传
                        goods_id: String(sfFirst.goodsId),
                        goods_type: sfFirst.goodsType,
                        extend: String(sfFirst.extend || ''),
                        count: that.form.gift_count,
                        coupon_id: that.form.coupon_id,
                        // 留言照图1 那一行真的落库：`gift/create` 早就读它并交给 `OrderBridge`
                        // （`api/controller/app/send_friend/Gift.php:94`）——不传就是摆一格永远丢的输入
                        buyer_remark: that.form.buyer_remark,
                    } : that.form
                ).then((res) => {
                    uni.hideLoading();
                    if (res.code === 1) {
                        that.orderNo = res.data.order_no;
                        // 金额以回体为准：礼物口发 `real_price`。
                        // 只认「是个数值」再覆盖 —— 原先判的是 `!== undefined`，回体给 null 也照样过，
                        // 于是把 `order.calculate` 算好的应付盖成空 ⇒ 支付面板 ¥0（2026-10-18 用户点名；
                        // 后端那一侧同步改成吐订单行的 real_price，两头各留一手才不会再出现 0 元面板）
                        //
                        // 虚拟支付（2026-10-27）：面板要显示的是**代币数** `display_price`，
                        // `real_price` 是人民币实付原值（后端扣代币时按兑换比例换算）——
                        // 有 display_price 就读它，没有才退回 real_price（旧后端/非虚拟支付那一档）
                        if (that.isSendFriend) {
                            if (that.isGiftNum(res.data.display_price)) {
                                that.data.real_price = res.data.display_price;
                            } else if (that.isGiftNum(res.data.real_price)) {
                                that.data.real_price = res.data.real_price;
                            }
                            if (res.data.is_virtual_pay !== undefined) {
                                that.data.is_virtual_pay = Number(res.data.is_virtual_pay) ? 1 : 0;
                            }
                        }

                        // 0 元单（含券后 0 元）：后端已当场按支付成功收尾（普通单 `order.create` /
                        // 送好友 `gift.create` 同一段口径），直接去「支付成功」页，不再弹支付方式
                        // （2026-10-30 用户点名）；普通单没有 `paid` 这一枚时，`status` 已经翻成
                        // success，走 else 那一支同样正确
                        const zeroPaid = Number(res.data.paid) === 1;
                        if (!zeroPaid && (that.isSendFriend || res.data.status == "unpaid")) {
                            that.showModal("pay");
                        } else {
                            that.$nav.to(
                                "/pages/public/result/result?order_no=" + res.data.order_no,
                                "local",
                                "redirectTo"
                            );
                        }
                    } else if (res.code === 401) {
                        // 登录态失效，全局拦截器已弹出登录提示并引导跳转登录页，此处不再重复提示
                    } else {
                        uni.showModal({
                            title: "提示",
                            content: res.msg,
                            showCancel: false,
                            success: function (res) {
                                // that.$nav.back();
                            },
                        });
                    }
                }).catch(() => {
                    // 同 submitGroupBuy：code 0 / 401 与网络异常都会 reject，
                    // 这一支不撤遮罩就是整页被 mask 锁死（硬约束 22）
                    uni.hideLoading();
                });
            },
        },
        onLoad() {
            that = this;
        },
    };
</script>

<style scoped>
.container{
    padding: 10px;
    background: rgba(250, 250, 250, 1);
}
    ::v-deep .u-form-item__body {
        padding: 0 !important;
    }

    .total-box {
        text-align: right;
        color: #4e5969;
        font-size: 13px;
    }

    .total-box .price {
        color: #f53f3f;
        font-weight: 700;
        font-size: 18px;
    }

    .total-box .unit {
        font-size: 13px;
        margin-right: 2px;
    }

    ::v-deep .u-form-item__body__left__content__label,
    ::v-deep .u-cell__title-text--large,
    ::v-deep .u-cell__value--large {
        font-size: 14px !important;
    }

    .item-val {
        font-size: 14px;
        color: #303133;
        height: 40px;
        line-height: 40px;
        width: 100%;
        text-align: right;
        color: #f53f3f;
        font-weight: 600;
    }

    /* 份数行：撑满 + 靠右（`text-align` 挪不动 flex 盒子，所以这一行用 flex 收口）。
       参照页 `.item-val` / `.input-item` 是同一份「满宽 + 靠右」口径。
       **上下内边距照券行那一格**（2026-10-27 用户点名「份数 cell 的上下内边距有点小，参考优惠券」）：
       本组件把 `.u-form-item__body` 的内衬归 0，所以每一格的高度 = tz-box 的 5px + 内容高 + 5px；
       券行内容高是 `.input-item` 的 40（H5/APP）/ 24（MP），而份数行原来只有步进器自身的 24
       ⇒ H5 上整格矮 16px、步进器上下各少 8px。这里把 H5/APP 的内容盒拉到与券行同一档（40）
       并把步进器垂直居中，两格高度就一致（50），上下留白也回到券行那一档；
       MP 不动 —— 那端 `.u-form-item` 本来就写死 40 高，两格早已同高（`.input-item` 的 MP 档也是 24）。 */
    .gift-count-row {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        /* #ifndef MP */
        height: 40px;
        align-items: center;
        /* #endif */
    }

    /* #ifdef MP */
    .u-form-item {
        height: 40px;
        line-height: 40px;
    }

    /* #endif */

    /* 券类型 Tag（2026-10-30 用户点名「在这个减多少钱左侧增加一个Tag显示当前优惠券的类型」）：
       券值左侧那一枚，几何照订单详情 `.order-gb-tag`（11px / 行盒 16 / 圆角 4 / 内衬 1px 5px），
       配色从券值橙派生：底 `#fff3e8`、字 `#b95000`（压底实算 4.57:1 ≥ 4.5）。
       `inline-block` 是为了让 padding 与圆角在两个端都生效；行盒 16 < 券行 24/40，不会把行撑高。 */
    .coupon-type-tag {
        display: inline-block;
        margin-right: 6px;
        padding: 1px 5px;
        border-radius: 4px;
        background: #fff3e8;
        color: #b95000;
        font-size: 11px;
        line-height: 16px;
        vertical-align: middle;
        white-space: nowrap;
    }

    .input-item {
        width: 100%;
        text-align: right;
        color: #303133;
        font-size: 14px;
        /* #ifdef MP */
        height: 24px;
        line-height: 24px;
        /* #endif */

        /* #ifndef MP */
        height: 40px;
        line-height: 40px;
        /* #endif */
        color: #ff781f;
    }

    /* 券行没有抵扣时那一格是占位（「请选择优惠券」/「暂无可用优惠券」），不是金额：
       2026-10-30 用户点名「暂无可用的优惠券 颜色不要是橙色了，可以是灰色的」⇒ 只要没抵到钱就吃这档灰，
       橙 `#ff781f` 只留给真减了钱的那一档；送好友档（图1）无券那句早在这一档。
       商品金额是深钢蓝（不是积分/会员折扣那档红） */
    .input-item--muted {
        color: #B5BCC8;
    }

    .sf-amount {
        color: #1B3D68;
        font-weight: 500;
    }

    /* 送好友三步指示条 2026-10-28 起在 `components/tz/sf-steps.vue`（几何与 M57 那一条随组件走） */

    /* 拼团三步说明（2026-10-27 图 5）：白底通栏，橙圆数字在上、两行灰字在下，
       相邻两格之间一条浅橙短线（与圆点垂直居中：圆 26 / 线 1.5 ⇒ margin-top 12.25 取 12） */
    .gb-steps {
        display: flex;
        align-items: flex-start;
        padding: 18px 8px 16px;
        background: #fff;
        box-sizing: border-box;
    }

    .gb-step {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .gb-step-dot {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #ff4b2b;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        line-height: 26px;
        text-align: center;
    }

    .gb-step-name,
    .gb-step-desc {
        color: #86909c;
        font-size: 13px;
        line-height: 19px;
        white-space: nowrap;
    }

    .gb-step-name {
        margin-top: 10px;
    }

    .gb-step-line {
        flex: none;
        width: 26px;
        height: 1.5px;
        margin-top: 12px;
        background: #ffc3ae;
    }

    .address-card {
        background-color: #fff;
        padding: 16px;
        margin-bottom: 10px;
        position: relative;
        overflow: hidden;
    }
    
    .address-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .address-info {
        flex: 1;
        margin-right: 12px;
    }
    
    .user-info {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .user-info .name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-right: 12px;
    }
    
    .user-info .mobile {
        font-size: 14px;
        color: #666;
    }
    
    .address-text {
        font-size: 14px;
        color: #333;
        line-height: 1.5;
    }
    
    .address-empty {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
    }
    
    .add-address-btn {
        display: flex;
        align-items: center;
    }
    
    .add-text {
        font-size: 15px;
        color: #333;
        margin-left: 8px;
    }
    
    .address-line {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: repeating-linear-gradient(
            -45deg,
            #ff6c6c 0,
            #ff6c6c 10px,
            #fff 10px,
            #fff 20px,
            #3c9cff 20px,
            #3c9cff 30px,
            #fff 30px,
            #fff 40px
        );
    }

    .form-requirement-card {
        background-color: #fff;
        padding: 14px 16px;
    }
    
    .form-requirement-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .form-requirement-title {
        font-size: 14px;
        color: #303133;
    }
    
    .form-requirement-status {
        flex: 1;
        text-align: right;
        font-size: 14px;
        color: #ff781f;
        margin-right: 4px;
    }
    
    .form-requirement-status.submitted {
        color: #999;
    }

    /* 多张表单时的逐张状态行：表单名左、状态右（与汇总行同一档字号与配色），
       行间一条浅分隔线；第一行与汇总行之间留 12px，避免分隔线贴着标题 */
    .form-requirement-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-top: 1px solid #f2f3f5;
    }

    .form-requirement-content + .form-requirement-item {
        margin-top: 12px;
    }

    .form-requirement-item:last-child {
        padding-bottom: 0;
    }

    .form-requirement-name {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        color: #4e5969;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .form-requirement-item-status {
        font-size: 13px;
        color: #ff781f;
        margin-right: 4px;
    }

    .form-requirement-item-status.submitted {
        color: #999;
    }

    /* 加载骨架屏：尺寸与真实内容逐块对齐（**商品行不再在这里画**——真实卡换成紧凑档课程卡之后，
       那一格由 `tz-course-mini` 自己的骨架档给，页面抄一份必然与真实卡差一档；见 M16 与 M24）、
       信息行 40px 行高对齐 u-form-item、底部栏对齐 tz-bottom-btn 固定底栏，
       灰块颜色取 uview 骨架屏静态块口径 #e5e6eb（与确认报名页 / 订单详情弹层骨架屏一致） */
    .sk-address {
        background-color: #fff;
        padding: 16px;
        margin-bottom: 10px;
    }

    .sk-address-row {
        width: 30%;
        height: 16px;
        border-radius: 4px;
        background: #e5e6eb;
    }

    .sk-address-line {
        width: 70%;
        height: 14px;
        margin-top: 10px;
        border-radius: 4px;
        background: #e5e6eb;
    }

    .sk-total {
        width: 40%;
        height: 18px;
        margin: 14px 0 0 auto;
        border-radius: 4px;
        background: #e5e6eb;
    }

    .sk-cell {
        display: flex;
        align-items: center;
        height: 40px;
    }

    .sk-cell-label {
        width: 42px;
        height: 14px;
        flex-shrink: 0;
        border-radius: 4px;
        background: #e5e6eb;
    }

    .sk-cell-value {
        width: 45%;
        height: 14px;
        margin-left: auto;
        border-radius: 4px;
        background: #e5e6eb;
    }

    .sk-bottom-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 10px;
        background-color: #fff;
        box-shadow: 0 0 8px 0 rgb(0 0 0 / 8%);
        display: flex;
        align-items: center;
        z-index: 10;
        box-sizing: border-box;

        /* #ifdef MP-WEIXIN */
        padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
        padding-bottom: calc(env(safe-area-inset-bottom) / 2);
        /* #endif */
    }

    .sk-price {
        width: 110px;
        height: 22px;
        flex-shrink: 0;
        border-radius: 4px;
        background: #e5e6eb;
    }

    .sk-btn {
        flex: 1;
        height: 40px;
        margin-left: 12px;
        border-radius: 4px;
        background: #e5e6eb;
    }
</style>
