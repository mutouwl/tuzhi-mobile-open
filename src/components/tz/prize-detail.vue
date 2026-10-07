<template>
	<!--
	  奖品详情弹窗（标准版奖品能力，2026-10-03）

	  两个入口共用这一只：① 列表那枚「去查看」；② 领取成功后由领取链自动弹出来。
	  两处不许各弹一份——弹出来的那张卡要跟列表上那一行说的是同一枚奖品（硬约束 11）。

	  **卡按奖品类型换形态，判据只读后端逐行下发的 detail.kind**（M22：前端不自己按 type 猜）：
	    · course    复用登记在册的 tz-course（条目卡不许自抄一份封面/标题版式，M24），
	                 点整卡跳这门课的详情（落点由后端给 course_id，前端不拼 URL）
	    · coupon    复用 coupon-my 券卡（与「我的优惠券」页同一张，一个字都没改）
	    · physical  实物商品卡（带兜底图的 package-goods-card）+ 0 元订单号
	    · score     积分介绍格：数值 + 单位（读后端 score_value，前端不自己判断有没有值来猜是哪一型）
	    · cash      现金奖励格：金额（元）
	    · custom    不进这只窗（自定义奖品领完弹的是「兑奖方式」窗，带商家的微信号与二维码）

	  数据是列表行上已经带着的那一份（领取回执与列表行后端逐字同形），
	  所以开窗不另发请求、也就不存在加载态——没有可闪的东西。
	-->
	<u-popup
		:show="visible"
		mode="bottom"
		bgColor="transparent"
		:round="12"
		:closeable="true"
		:safeAreaInsetBottom="false"
		:zIndex="popupZ"
		:overlayStyle="{ zIndex: popupZ - 10 }"
		@close="close"
	>
		<view class="sgd">
			<view class="sgd-title">奖品详情</view>

<!-- 内容块：面板的下限高度（300px，用户 2026-10-04 定的档，同一天第二轮）挂在根节点 .sgd 上，
		     不在这一格再给一份——这一档是卡不是文案，卡自带高度，内容块只留上下留白并吃掉面板的余量（flex:1），
		     所以给下限的活归面板、底部按钮因此永远贴在面板下沿（细则见样式里 .sgd 那段） -->
			<view class="sgd-body">
				<!-- 未领取的那一枚唯一「真的没有数据可显示」的一档：券要等领取那一刻才进我的券包，
				     没领就查不到那张券（后端那一档回的是空）。
				     这一档摆奖品本身 + 一句为什么现在看不到面值，不摆一张空券卡（M13）。
				     其余各型不发这一支：课程 id、实物商品名、积分/现金金额都是**发奖那一刻的快照**，
				     未领取甚至已过期都还在行上，照常显示才是「点开就能看到兑到了什么」 -->
				<block v-if="kind === 'coupon' && !couponFace">
					<tz-prize-card :row="current"></tz-prize-card>
					<view class="sgd-pending">{{ pendingTip }}</view>
				</block>

				<!-- 线上课程：复用课程卡（navigate 关掉——落点由本组件按后端给的 course_id 走，
				     不让卡片自己按 item.type 猜路由，那一猜就是「奖品课程跳到别的页」；
				     事件是 @click 不是 @tap：tz-course 内部 emit 的是 click，
				     且 H5 编译器会把模板里的 @tap 单向改写成 @click（硬约束 27），
				     两边名字不一致时写 @tap 在 H5 永远收不到） -->
				<!-- 圆角与描边走课程卡自带的 round/border 两档（2026-10-05 用户点名「奖品详情中的课程、
				     商品组件要有圆角和边框」——原先这两支都是白底直角压在白面板上，卡的边界完全看不出来）：
				     round=10px + 1px solid #F0F3F5，与打卡日记 / 圈子动态详情 / 表单结果那几处
				     `:round="true" :border="true"` 逐字同一写法（M21：圆角档取课程卡自带的那一档，
				     不在弹层里另抄一份数值）。margin 仍收 0：面板自己给了左右 16px，卡再自带 10 就双重留边 -->
				<tz-course
					v-else-if="kind === 'course'"
					:list="[courseRow]"
					:navigate="false"
					:round="true"
					:border="true"
					:margin="0"
					@click="goCourse"
				></tz-course>

				<!-- 优惠券：与「我的优惠券」页同一张券卡（coupon-my 吃的是 coupon_user 那行，
				     金额/门槛/有效期都在关联那张 app_coupon 上，后端给的就是这一份）。
				     外层这一格收一下点击：券卡自带一枚「使用」，点了会跳去用券页，
				     那一跳必须先把这只窗收掉，否则从用券页退回来窗还盖在上面
				     （券卡的其它可点处——使用规则——是弹 toast，不受影响） -->
				<view class="sgd-coupon" v-else-if="kind === 'coupon'" @click="onCouponTap">
					<coupon-my :data="couponFace" :disabled="couponDisabled"></coupon-my>
				</view>

<!-- 实物商品卡：带兜底图的那一张（tz-physical-goods 无图片兜底，奖品图常是空）。
					     圆角与描边与上面课程卡同一档（2026-10-05 用户点名「奖品详情中的课程、商品组件要有
					     圆角和边框」——原先这里传 :round="false" 走通栏直角那一档，白卡压在白面板上看不出边界）：
					     **圆角由本组件的 round prop 给、描边由外层 .sgd-goods 给**——package-goods-card
					     只有 round 没有 border prop，描边只能落在装它的那一格上（描边给内层白卡会与
					     订单号那一行脱开，给这一格才是「商品 + 订单号」整体一只框）。
					     外层圆角与内卡同值，overflow:hidden 把白卡四角按框裁齐。
					     订单号只在这一型、且只在真拿到手那一档出（0 元单是领取那一刻建的，没领就没有这个号）；
					     2026-10-04 用户点名「点击奖品订单号可以跳转到订单详情」⇒ 这一行本身是入口，
					     行尾给一枚指示箭头照 §1「关联 chip」那一档（12px 文字 ⇒ arrow-right 15 / #86909c），
					     灰字不带箭头会被读成一行读得出但点不动的说明文字 -->
				<view class="sgd-goods" v-else-if="kind === 'physical'">
					<tz-package-goods-card
						:cover="coverSrc"
						:name="prizeName"
						:price="0"
						:round="true"
					></tz-package-goods-card>
					<view class="sgd-order" v-if="orderNo" @click="onOrderTap">
						<text class="sgd-order-no">奖品订单号：{{ orderNo }}</text>
						<u-icon name="arrow-right" size="15" color="#86909c"></u-icon>
					</view>
					<view class="sgd-pending" v-if="!granted">{{ pendingTip }}</view>
				</view>

				<!-- 积分 / 现金：数值格（数值与单位都由后端给，前端只排版）。
				     这一型没有封面与实体卡，不摆奖品名的话弹窗里就只有一枚孤零零的数字，
				     学员不知道这个数字是什么奖来的，所以名称压在数值上方一行 -->
				<view class="sgd-value" v-else-if="kind === 'score' || kind === 'cash'">
					<view class="sgd-value-name">{{ prizeName }}</view>
					<view class="sgd-value-num">{{ valueText }}</view>
					<view class="sgd-value-unit">{{ valueUnit }}</view>
					<!-- 到账说明只在真拿到手那一档出现：未领取时说「已存入」是假的 -->
					<view class="sgd-value-desc" v-if="granted">{{ valueDesc }}</view>
					<view class="sgd-pending" v-if="!granted">{{ pendingTip }}</view>
				</view>

				<!-- 兜底：后端给了个没登记过的 kind（ prizes/types 增了一型而这一只组件还没跟上）。
				     不摆空白面板，把奖品本身摆出来，原因说出口（M13） -->
				<block v-else>
					<tz-prize-card :row="current"></tz-prize-card>
				</block>
			</view>

			<!-- 唯一动作入口：课程那一型是「去学习」（落点课程详情）、现金/积分是「去查看」（落点资产页），
			     其余是「我知道了」（纯展示） -->
			<view class="sgd-foot">
				<tz-button size="normal" long type="primary" :text="footText" @click="onFoot"></tz-button>
			</view>
		</view>
	</u-popup>
</template>

<script>
import couponMy from '@/components/coupon/coupon-my.vue';
import { prizeAssetPage, prizeImage, prizeOrderPage } from '@/common/utils/prize';

/**
 * props: show（受控入口，父页置真也开窗）、row（奖品行，读 row.detail 那段）、zIndex（压在调用方弹层之上）
 * emits: open / close
 *
 * 用法（ref 命令式，主路径）：this.$refs.detail.open(row)
 *
 * 自定义奖品（kind=custom）不进这只窗——它领完弹的是「兑奖方式」窗（商家微信号 + 二维码），
 * 那一只在 tz-prize-claim 里，本组件只管其余五型。
 */
export default {
	name: 'tz-prize-detail',
	components: { couponMy },
	props: {
		show: { type: Boolean, default: false },
		row: { type: Object, default: null },
		zIndex: { type: [Number, String], default: 10340 },
	},
	data() {
		return {
			// 当前弹的那一行：存实例字段而不是直接读 prop row，
			// 关窗时父页把 row 置空也不会让已经摆出来的那一张中途塌掉
			current: null,
			// 真实开关是这一枚内部状态：调用点是命令式 open()，父页那枚 show prop 只是初值/受控入口，
			// 光绑 prop 的话 close() 收不掉窗（prop 没人改）——窗关了但遮罩还在
			visible: false,
		};
	},
	computed: {
		popupZ() {
			return Number(this.zIndex);
		},
		/** 后端逐行下发的判据；取不到就落回 course 之外的中性档，绝不自己按 type 猜 */
		kind() {
			const d = (this.current && this.current.detail) || {};
			return String(d.kind || '');
		},
		/**
		 * 领了没有（判据读后端逐行的 can_view）
		 *
		 * 三态里只有这一档是「已拿到手」：待领取与已过期都还没拿到，弹窗里的文案不能写成
		 * 「已存入你的积分」——那句话在没领取的那一枚上就是假的。
		 */
		granted() {
			return !!(this.current && this.current.can_view);
		},
		/** 未领取那一档（待领取 / 已过期）统一的一句提示：为什么现在看不到面值与课程入口 */
		pendingTip() {
			if (!this.current) {
				return '';
			}
			return this.current.can_receive
				? '领取成功后即可查看奖品详情'
				: '该奖品已超过领取期限，无法兑换';
		},
		coverSrc() {
			return this.current ? prizeImage(this.current.cover, this.$tools) : '';
		},
		/** 奖品名：模板只读这一枚 computed，不直接摸可能为 null 的 prop（硬约束 23 同族） */
		prizeName() {
			return (this.current && this.current.name) || '-';
		},
		/** 课程卡那一行：id 走后端给的 course_id，卡片自己不会去跳（M24：条目卡只负责版式） */
		courseRow() {
			const d = (this.current && this.current.detail) || {};
			return {
				id: Number(d.course_id) || 0,
				name: (this.current && this.current.name) || '',
				cover: this.coverSrc,
				// 类型标签走课程那一档（$t('course')），价格一律「免费」——奖品不发钱，
				// 写 ¥0 会被读成「这个课值 0 元」
				type: 'course',
				pay_type: 'free',
			};
		},
		/** 券卡吃的是关联那张 app_coupon（金额、门槛、有效期都在它身上） */
		couponFace() {
			const d = (this.current && this.current.detail) || {};
			const cu = d.coupon;
			return cu && cu.coupon ? cu.coupon : null;
		},
		couponDisabled() {
			const d = (this.current && this.current.detail) || {};
			const cu = d.coupon;
			return !cu || String(cu.status || '') !== 'can_use';
		},
		orderNo() {
			const d = (this.current && this.current.detail) || {};
			return String(d.order_no || '');
		},
		valueText() {
			const d = (this.current && this.current.detail) || {};
			if (this.kind === 'cash') {
				// 金额给两位小数（后端那一列就是 decimal(10,2)），别让 5 显示成 5
				const n = Number(d.cash_amount || 0);
				return (Number.isFinite(n) ? n : 0).toFixed(2);
			}
			return String(Number(d.score_value) || 0);
		},
		valueUnit() {
			return this.kind === 'cash' ? '元' : '积分';
		},
		valueDesc() {
			return this.kind === 'cash' ? '已存入你的余额，可在余额页提现' : '已存入你的积分，可在积分中心使用';
		},
		footText() {
			// 「去学习」只在真拿到手那一档出：没领的课程跳过去也看不了（权益是领取那一刻才开通的），
			// 给一枚点开只能看不能学的按钮，是把用户送去撞墙
			if (this.kind === 'course') {
				return this.granted ? '去学习' : '我知道了';
			}
			// 现金 / 积分：底部那一枚由「我知道了」换成「去查看」（2026-10-04 用户点名）。
			// 这一型弹窗里只有一枚数值、没有可展开的详情，「我知道了」关掉就完了——学员真正想看的是
			// 「这笔钱 / 这些积分到我账户上了没有」，所以给它一个落点，而不是只有一句收窗
			if (this.kind === 'cash' || this.kind === 'score') {
				return '去查看';
			}
			return '我知道了';
		},
	},
	watch: {
		// 受控入口：父页把 show 置真也开窗（命令式 open() 之外的第二条路）
		show(val) {
			if (val) {
				this.visible = true;
			} else {
				this.visible = false;
			}
		},
	},
	methods: {
		open(row) {
			if (!row) {
				uni.showToast({ title: '奖品信息不完整，请刷新后重试', icon: 'none' });
				return;
			}
			this.current = row;
			this.visible = true;
			this.$emit('open', row);
		},
		close() {
			this.visible = false;
			// 不在这里置空 current：u-popup 的离场动画期间 DOM 还挂着，这一格仍在渲染，
			// 置空会让收尾那一下闪成兜底图 + 「-」。下一枚 open() 本来就整份覆盖它。
			this.$emit('close');
		},
		/**
		 * 课程详情：落点只认后端给的 course_id（M22）
		 * 路由走 $nav（router.js 是唯一真源），不自己拼 URL
		 */
		goCourse() {
			const d = (this.current && this.current.detail) || {};
			const id = Number(d.course_id) || 0;
			if (!id) {
				uni.showToast({ title: '这门课程暂时无法打开，请联系客服', icon: 'none' });
				return;
			}
			this.$nav.to(this.$nav.getPagePath(id, 'course'));
		},
		/**
		 * 券卡那一格：点「使用」跳走之前先把这只窗收掉（券卡内部自己跳，
		 * 收窗只能在这一层接；不收的话退回来窗还盖在用券页上面）
		 */
		onCouponTap() {
			this.close();
		},
		/**
		 * 实物那一行：点订单号进这一笔 0 元单的订单详情（用户 2026-10-04 点名的入口）
		 *
		 * 与底栏那一枚是两条不同的路，两条都要：底栏实物这一型仍是「我知道了」（关窗即收），
		 * 这一行才是去订单详情的那一跳——落点只认后端逐行下发的 `detail.order_no`，取路径走
		 * common/utils/prize 的 prizeOrderPage（与那张 TARGET_PAGE 的 `order`＝订单列表不是同一件事）。
		 * 先关窗再跳，与底栏同一口径：不关的话从订单详情退回来窗还盖在上面。
		 * 取不到号时给一句原因而不是静默 return（M13），这一格本来就 v-if 了订单号，属兜底。
		 */
		onOrderTap() {
			const page = prizeOrderPage(this.orderNo);
			this.close();
			if (!page) {
				uni.showToast({ title: '这个订单号暂时打不开，请联系客服', icon: 'none' });
				return;
			}
			this.$nav.to(page);
		},
		/**
		 * 底栏那一枚：课程去学习、现金/积分去资产页（都先关窗再跳，不关的话从落点退回来窗口还盖在上面），
		 * 其余三型纯展示（关窗即收）
		 *
		 * 必须走 close() 而不是只 $emit('close')：父页那枚 show prop 从头到尾没人改，
		 * 只 emit 的话 visible 一直是真的 —— 症状是那枚按钮按了没反应、遮罩也撤不掉。
		 */
		onFoot() {
			// 判据与 footText 同一句：课程那一档未领取时不跳（见 footText 的注释）
			if (this.kind === 'course') {
				if (this.granted) {
					this.close();
					this.goCourse();
				} else {
					this.close();
				}
				return;
			}
			// 现金 / 积分：落点按 kind 给（现金＝余额页、积分＝资产管理页的积分那一档），
			// 取路径走 common/utils/prize 的 ASSET_PAGE —— 落点只有那一处，不在本组件里再抄一份
			const page = prizeAssetPage(this.kind);
			this.close();
			if (page) {
				this.$nav.to(page);
			}
		},
	},
};
</script>

<style scoped>
/* 面板：白底 + 顶部圆角 12（多值写法，弹窗档位）；安全区只挂这一份，底部内衬交给
   内容最后一块自己给（.sgd-foot 的 padding-bottom，M6：面板不许再叠一层固定内衬）。
   组件 isolated，全局 .school-popup 档进不来，数值与 tz-prize-claim 那一组同源 */
.sgd {
	position: relative;
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	box-sizing: border-box;
	/* 面板下限高度：内容最省的一档（积分/现金那张数值格）只有九十几 px，不给下限的话这只窗会缩成
	   标题加一枚按钮的一条（M18⑨d：静态内容块要给下限高度，「列表区给确定高度」那条禁的是滚动区）。
	   档位 300px ＝ 用户定的，同一天连着两轮：2026-10-03 给的是 200~250（取上沿先落上）、
	   10-04 复述定档 250px、当天第二轮「最低高度调到300」⇒ 300 是收敛值，此后别按族里 220 那档收回去。
	   这个数是本弹窗自己定的、不是族里的公共档：课程卡那档内容自己就到 ≈300，正好同高不打架。
   下限挂**面板**这一层、不挂 .sgd-body：面板竖向排成弹性列、内容块吃掉余量，
   底部按钮永远贴在面板下沿（余量落到内容块里，不会掉到按钮下面留一条死白） */
	min-height: 300px;
	display: flex;
	flex-direction: column;
	padding: 0 16px;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}
/* 标题走 .school-popup-title 口径：16px/600 左对齐、内衬 15/0/12，不自造居中标题行（M18）。
   :closeable 的关闭图标绝对定位在右上角（占面板右缘往里 15~33px），标题行要让开那一段 */
.sgd-title {
	padding: 15px 36px 12px 0;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
/* 内容块：卡自带动，给一点上下留白让卡不贴着标题与按钮。
   flex:1 吃掉面板的下限高度余量（见 .sgd），内容不足时把按钮顶到面板下沿而不是留死白 */
.sgd-body {
	flex: 1;
	padding: 4px 0 8px;
}
/* 券卡那一格：coupon-my 自带 margin:10px（它是列表里的一枚，页面靠那个留边），
   装进弹层里那一格再叠 10px 会顶到面板左右内衬，所以这一格把外边距收掉。
   只收外边距，卡内版式一个字不动（还是那张券卡，还是那个样子） */
.sgd-coupon .coupon-box {
	margin: 0;
}
/* 实物那一档：商品卡 + 订单号（订单号是发货台与订单详情共用的那一个，学员要能自己看到）。
   底色与圆角描边：2026-10-05 用户点名「商品组件要有圆角和边框」——原先这一格是 #f7f8fa 灰底 + 4px
   圆角且无描边，包着里面一张通栏直角白卡，弹层里读出来是「一块灰底上浮着一张白纸」。
   现在按同屏课程卡同一档收：外框 10px 圆角（与内卡 .pkg-goods-card 的 10px 同值，overflow:hidden
   把白卡四角按框裁齐，不会出现白角戳出框外）+ 1px solid #F0F3F5 发丝描边，仍在弹层内衬里，
   描边给外格而不是内卡 ⇒ 订单号那一行与商品卡合成一只框 */
.sgd-goods {
	background: #f7f8fa;
	border-radius: 10px;
	border: 1px solid #F0F3F5;
	overflow: hidden;
	box-sizing: border-box;
}
/* 订单号这一行 2026-10-04 起是入口（点行进这一笔的订单详情），所以按可点行排：
   文字 + 行尾指示箭头两段，几何照 §1「关联 chip」那一档（12px 文字 ⇒ arrow-right 15 / #86909c）。
   字号从 10px 收到 12px：§1 那张表里 10px 只归「灰字时间」一档（卡脚时间、评论行 meta），
   这一行从「读得出但点不动的一行说明」变成「整行都是点区」，10px 配一整行的点击面读不出可点，
   12px 才是「辅助信息」那一档；行高 18 配上下各 10 内衬 ⇒ 整行 38px 高，够点。
   文字仍走偏灰那一档、不改主色：它是弹窗里的一块灰底，压在灰底上的主色蓝会跳成另一块颜色 */
.sgd-order {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 16px;
	font-size: 12px;
	line-height: 18px;
	color: #86909c;
}
/* 号码不许折行（折成两行会把这一行读成两句话），超宽截断而不是换行；要看全号点这一行进订单详情 */
.sgd-order-no {
	flex: 1;
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
/* 数值格（积分 / 现金）：数值走价格那一档的红色 34px/600，单位与说明走灰字两档。
   数值与单位同一行、基线对齐，不堆成两行——堆成两行会被读成两句话 */
.sgd-value {
	padding: 20px 0 10px;
	text-align: center;
}
/* 奖品名压数值上方一行：14/600 正文档，居中。它是这一型唯一的身份信息（M29⑤） */
.sgd-value-name {
	margin-bottom: 8px;
	font-size: 14px;
	line-height: 20px;
	font-weight: 600;
	color: #1d2129;
}
.sgd-value-num {
	display: inline-block;
	font-size: 34px;
	line-height: 40px;
	font-weight: 600;
	color: #f53f3f;
}
.sgd-value-unit {
	display: inline-block;
	margin-left: 4px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	/* 数值 40 行高、单位 17 行高，基线对齐后单位要往下压一点才落在数值的中线上 */
	vertical-align: baseline;
}
.sgd-value-desc {
	margin-top: 6px;
	font-size: 12px;
	line-height: 18px;
	color: #86909c;
}
/* 未领取那一档：奖品身份卡下面那一句为什么现在看不到面值。
   压在浅灰卡（.ppc 自己的底）之外的白面板上，所以取正文灰那一档，不跟卡里的标签灰混 */
.sgd-pending {
	margin-top: 12px;
	font-size: 12px;
	line-height: 18px;
	color: #86909c;
	text-align: center;
}
/* 按钮那一行：面板最后一块，底部 12px 内衬由它自己带（面板只挂安全区那一份） */
.sgd-foot {
	margin-top: 12px;
	padding-bottom: 12px;
}
</style>