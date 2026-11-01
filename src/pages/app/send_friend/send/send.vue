<template>
	<view class="school-page sfs-page">
		<!-- 三步条与下单页共用同一只组件（2026-10-28 用户点名「上面的 step 最好复用提交订单页面上面的 step」）：
		     本页是第二步，所以 `:active="2"` —— ① 与 ② 深色、③ 浅色，与参考页那一屏一致。
		     **只在待赠送那一档出**：已领取/已失效是终局，礼物流程已经走完，参考页那一屏用
		     「礼物已领取」这一句大标题接替了三步条（2026-10-28 用户给的已领取截图）。 -->
		<tz-sf-steps v-if="!loading && !notice && status === 0" :active="2" bg-color="transparent" />

		<!-- 首屏骨架（M16）：外壳与真实那一屏同一只 `.sfs-hero`，商品区走 `tz-course-mini` 自己的骨架档；
		     不另铺一棵通栏灰块树（那会加载前后差着左右留边） -->
		<view class="sfs-main sfs-main--send" v-if="loading">
			<view class="sfs-hero sfs-hero--sk">
				<view class="sfs-sk-ribbon"></view>
				<view class="sfs-sk-title"></view>
				<view class="sfs-gift">
					<tz-course-mini :skeleton="true" :skeleton-count="1" :margin="0" :round="true" :border="false" />
				</view>
			</view>
			<view class="sfs-sk-btn"></view>
			<view class="sfs-sk-self"></view>
		</view>

		<!-- 整页那一句（未装 / 没带凭据 / 不是本人 / 取不到）：撤骨架、说原因，取数失败那一档给一枚重试（硬约束 39②） -->
		<view class="sfs-main sfs-main--notice" v-else-if="notice">
			<u-empty icon="/static/image/empty.png" width="70" height="70" :text="notice" text-color="#86909c">
				<tz-button v-if="noticeRetry" size="normal" text="重新加载" @click="getData()"></tz-button>
				<tz-button v-else-if="needLogin" size="normal" type="primary" text="登录后赠送" @click="goLogin"></tz-button>
			</u-empty>
		</view>

		<!-- 正文：蓝色礼盒面板（彩带 + 一句 + 商品卡）在剩余空间里**垂直居中**（2026-10-28 用户点名
		     「礼物已备好的元素可以靠近垂直方向中心」）；参考页里那块「写下专属寄语」按同一轮要求整块不做 -->
		<view class="sfs-main" :class="{ 'sfs-main--send': status === 0, 'sfs-main--result': status !== 0 }" v-else>
			<!-- 终局那一档的页首大标题（参考图「礼物已领取」）：词条吃后端 `status_label`，
			     端上只拼一个「礼物」前缀，不另写一份状态枚举（硬约束 9） -->
			<text class="sfs-result-title" v-if="status !== 0">{{ resultTitle }}</text>
			<view class="sfs-hero">
				<!-- 彩带：两段金线 + 中间一只蝶结（纯 CSS，不引图片资源；装饰元素不进可读文本） -->
				<view class="sfs-ribbon">
					<view class="sfs-ribbon-line sfs-ribbon-line--l"></view>
					<view class="sfs-ribbon-bow">
						<view class="sfs-ribbon-loop sfs-ribbon-loop--l"></view>
						<view class="sfs-ribbon-knot"></view>
						<view class="sfs-ribbon-loop sfs-ribbon-loop--r"></view>
					</view>
					<view class="sfs-ribbon-line sfs-ribbon-line--r"></view>
				</view>
				<text class="sfs-hero-title">“礼物已备好 给Ta送心意”</text>
				<view class="sfs-gift">
					<!-- 商品卡复用紧凑档 `tz-course-mini`（M24）：卡高/封面宽/圆角/骨架只有那一份；
					     礼单卡片给 `qty`，右下角写「×1」而不是再摆一遍购买价。
					     **2026-10-28 用户点名「之后在送好友详情点击商品再跳商品详情」**：
					     这一张卡保持可点（默认 clickable），由 `courseCard` 里的 id/type 跳到商品详情；
					     赠送记录里的同一张卡则关掉自身跳转、统一由整条记录接住（见 gift.vue 同节注释）。 -->
					<tz-course-mini :list="courseCard" :margin="0" :round="true" :border="false" />
				</view>
			</view>

			<!-- 待赠送那一档：主操作一页只一处（M17） -->
			<view class="sfs-actions" v-if="status === 0">
				<tz-button v-if="canShare" size="normal" long type="primary" theme="send-friend" text="去分享送礼"
					@click="openShare"></tz-button>
				<!-- 【自己使用】只在「这份礼物还能领 ∧ 我还没拥有对应权益」时出（判据由后端一枚 `self_usable`
				     折好下发，端上不重算；2026-10-28 用户点名「已经开通了对应的订阅权限就不显示」） -->
				<view class="sfs-self" v-if="selfUsable" @click="useSelf">自己使用</view>
			</view>

			<!-- 已领取（参考图第二张白卡）：标题「已领取」+ 一行「谁 / 领取了你的赠送 / 日期」；
			     这一档不再有分享与自用按钮（礼物已经是别人的了） -->
			<view class="sfs-claim-card" v-else-if="status === 2">
				<text class="sfs-claim-head">{{ stateText }}</text>
				<view class="sfs-claim-row">
					<image class="sfs-claim-avatar" v-if="receiverAvatar" :src="receiverAvatar" mode="aspectFill" />
					<view class="sfs-claim-avatar sfs-claim-avatar--default" v-else>
						<view class="sfs-claim-avatar-head"></view>
						<view class="sfs-claim-avatar-body"></view>
					</view>
					<text class="sfs-claim-name">{{ receiverName || '好友' }}</text>
					<text class="sfs-claim-text">领取了你的赠送</text>
					<text class="sfs-claim-date" v-if="claimedAtDate">{{ claimedAtDate }}</text>
				</view>
			</view>

			<!-- 已失效（同构白卡）：一句原因，不摆一枚点了没反应的按钮（硬约束 27②） -->
			<view class="sfs-claim-card" v-else-if="status === 3">
				<text class="sfs-claim-head">{{ stateText }}</text>
				<text class="sfs-claim-reason">{{ voidText }}</text>
			</view>
		</view>

		<!-- 页尾与同模块两页同一档（M-P4/M-P6：tz-tab-bar 只在配成导航项时渲染，tz-footer 常驻；
		     参考页只给页脚链接、没有底部导航，故两枚都挂着，渲染结果与参考页一致） -->
		<tz-tab-bar />
		<tz-footer />

		<!-- 分享弹窗用全站公共那只（M-P5）：`type=send_friend` 的落点就是礼单凭据 code，
		     海报上的昵称/头像由 share-modal 读 `$tools.cachedUser()`（user_info 是 JSON 串） -->
		<share-modal :visible="shareVisible" type="send_friend" :val="code" :title="goodsName" :cover="cover"
			invite-text="送你的礼物" @close="shareVisible = false"></share-modal>
	</view>
</template>

<script src="./js.vue">
</script>

<style lang="scss">
/* 送礼页 / 领取页共用的礼盒视觉（蓝面板 + 彩带 + 终局白卡）：SCSS 内联，MP 端也能拿到 */
@import "../../../../common/styles/send-friend-gift.scss";
@import "./css.css";
</style>
