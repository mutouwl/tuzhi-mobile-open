<template>
	<view class="school-page" :class="{ 'sfr-page--gift': giftPage }">
		<!--
		  好友领取页（M-P6）+ 领取成功那一档（M-P7，本页一档，不另开路由）

		  凭据 `?code=` 只在 onLoad 读一次（蓝本 pages/app/exchange/center/js.vue:26-31,56-57）：
		  在 onShow 里重读会把「用户刚改过的那一档界面」按旧地址重刷一遍（硬约束 16）。

		  版式与同模块「赠送记录」页同一档（2026-10-27 用户点名「这个页面的样式也太丑了」）：
		  内容区走全局 `.school-cards`（左右留边 10）+ `.school-card`（白卡、内衬 14、卡间距 10），
		  商品区复用登记在册的紧凑档课程卡 `tz-course-mini`（同一轮点名「课程也没有使用 course-item-mini」）。
		  骨架屏也住在这同一只外壳里 —— 上一版把骨架挂成通栏 `.school-block`，左右一点留边都没有，
		  与数据到手后的卡片宽度差着 20px（同一轮点名「骨架屏宽度 100% 了，没有左右边距」）。
		-->

		<!-- 首屏骨架：与真实的可领礼盒**逐块同形**（送出人一行 → 蓝面板 + 彩带 + 标题 + 商品卡 →
		     权益/有效期 → 主按钮），灰块只替换会变的那几格；商品区那一块由 `tz-course-mini` 自己的
		     骨架档给（卡高/封面宽只有那一份）。2026-10-28 用户点名「骨架屏为什么没变动」：
		     上一版只换了真实态，loading 还停在旧白卡骨架上，进页面先闪一屏旧版式。 -->
		<template v-if="loading">
			<view class="sfs-main sfs-main--claim">
				<view class="sfr-giver-head">
					<view class="sfr-giver-head-avatar sfr-giver-head-avatar--sk"></view>
					<view class="sfr-sk sfr-sk-name"></view>
					<view class="sfr-sk sfr-sk-gift"></view>
				</view>
				<view class="sfs-hero sfs-hero--sk">
					<view class="sfs-sk-ribbon"></view>
					<view class="sfs-sk-title"></view>
					<view class="sfs-gift">
						<tz-course-mini :skeleton="true" :skeleton-count="1" :margin="0" :border="false" />
					</view>
				</view>
				<view class="sfr-claim-meta">
					<view class="sfr-sk sfr-sk-desc"></view>
					<view class="sfr-sk sfr-sk-expire"></view>
				</view>
				<view class="sfs-sk-btn"></view>
			</view>
		</template>

		<!-- 领取成功不再停一张成功屏：2026-10-28 用户点名「领取成功关闭当前页面跳转到课程详情」，
		     所以成功那一拍直接 `redirectTo` 商品详情（`js.vue` 的 `receive()` 收口），
		     模板这一档只留骨架/整页提示/正文三支，旧的 M-P7 成功卡整块下线（路由仍在，深链行为不变）。 -->

		<!-- 整页那一句（未装 / 链接没带凭据 / 取不到这一条礼物）：
		     撤骨架并把原因说出来，不摆一张只有标题的商品空壳（M13）；
		     空态走登记在册的 `u-empty`（图标 + 一句），取数失败那一档在它下面补一枚「重新加载」——
		     报错要自带出路，不能只留一句灰字让人自己找路（硬约束 39②） -->
		<template v-else-if="notice">
			<view class="school-cards">
				<view class="school-card sfr-empty">
					<u-empty icon="/static/image/empty.png" width="70" height="70" :text="notice"
						text-color="#86909c">
						<tz-button v-if="noticeRetry" size="normal" text="重新加载" @click="getData"></tz-button>
					</u-empty>
				</view>
			</view>
		</template>

		<!-- 可领那一档（2026-10-28 用户点名「领礼物的页面啊 没动」+ P2 参考页）：
		     与已领取同一套礼盒视觉，标题换成「好友赠礼 请领取」，底部一枚「立即领取」；
		     送出人放在最上面一行（头像 + 昵称 + 送你的礼物），权益说明/有效期在白卡下方补两行灰字。
		     样式取 `common/styles/send-friend-gift.scss`，本页在可领/已领取两档切到礼盒版式（底色仍是全站默认）。 -->
		<template v-else-if="!needLogin && status === 0">
			<view class="sfs-main sfs-main--claim">
				<view class="sfr-giver-head" v-if="giverName">
					<image class="sfr-giver-head-avatar" :src="giverAvatar || defaultAvatar" mode="aspectFill" />
					<text class="sfr-giver-head-name">{{ giverName }}</text>
					<text class="sfr-giver-head-text">送你的礼物</text>
				</view>
				<view class="sfs-hero">
					<view class="sfs-ribbon">
						<view class="sfs-ribbon-line sfs-ribbon-line--l"></view>
						<view class="sfs-ribbon-bow">
							<view class="sfs-ribbon-loop sfs-ribbon-loop--l"></view>
							<view class="sfs-ribbon-knot"></view>
							<view class="sfs-ribbon-loop sfs-ribbon-loop--r"></view>
						</view>
						<view class="sfs-ribbon-line sfs-ribbon-line--r"></view>
					</view>
					<text class="sfs-hero-title">“好友赠礼 请领取”</text>
					<view class="sfs-gift">
						<tz-course-mini :list="courseCard" :margin="0" :round="true" :border="false"
							:clickable="canOpenGoods" />
					</view>
				</view>
				<view class="sfr-claim-meta" v-if="goodsDesc || stateSub">
					<text class="sfr-claim-desc" v-if="goodsDesc">{{ goodsDesc }}</text>
					<text class="sfr-claim-expire" v-if="stateSub">{{ stateSub }}</text>
				</view>
				<view class="sfr-claim-action">
					<tz-button v-if="canClaim" size="normal" long type="primary" theme="send-friend"
						:disabled="receiving" :text="receiveBtnText" @click="receive"></tz-button>
					<!-- 不能领的那一支（例如送出人自己打开分享链接）：也留在这套礼盒版式里，
					     把后端那句话原样说出来，不摆一枚点了没反应的按钮（硬约束 27②/39②） -->
					<text class="sfs-status" v-else>{{ stateText }}</text>
				</view>
			</view>
		</template>

		<!-- 已领取那一档（2026-10-28 用户给的参考图「礼物已领取」）：与送礼页终局态同一套视觉——
		     页首大标题 + 蓝色礼盒面板（彩带 / 礼物已备好 / 商品卡）+ 白卡（已领取 + 领取人 / 日期）。
		     样式取 `common/styles/send-friend-gift.scss`（两页共用，不各抄一份）；本页只在 status=2 那一档切过来，
		     可领 / 已失效 / 未登录仍走下面那张白卡版式。 -->
		<template v-else-if="!needLogin && status === 2">
			<view class="sfs-main sfs-main--result">
				<text class="sfs-result-title">{{ resultTitle }}</text>
				<view class="sfs-hero">
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
						<tz-course-mini :list="courseCard" :margin="0" :round="true" :border="false"
							:clickable="canOpenGoods" />
					</view>
				</view>
				<view class="sfs-claim-card">
					<text class="sfs-claim-head">{{ claimedLabel }}</text>
					<view class="sfs-claim-row">
						<image class="sfs-claim-avatar" v-if="receiverAvatar" :src="receiverAvatar"
							mode="aspectFill" />
						<view class="sfs-claim-avatar sfs-claim-avatar--default" v-else>
							<view class="sfs-claim-avatar-head"></view>
							<view class="sfs-claim-avatar-body"></view>
						</view>
						<text class="sfs-claim-name">{{ receiverName || '好友' }}</text>
						<text class="sfs-claim-text">{{ claimActionText }}</text>
						<text class="sfs-claim-date" v-if="claimedAtDate">{{ claimedAtDate }}</text>
					</view>
				</view>
			</view>
		</template>

		<!-- 未登录（2026-10-28 用户点名「未登录打开还是原来的页面结构」）：不再回旧白卡，
		     同样用礼盒版式：送出人拿不到就只出商品卡 + 「登录后领取」；后端未登录只回商品名/封面，
		     送出人/权益/有效期一个字都不编（§2.3-4 防枚举）。 -->
		<template v-else-if="needLogin">
			<view class="sfs-main sfs-main--claim">
				<view class="sfs-hero">
					<view class="sfs-ribbon">
						<view class="sfs-ribbon-line sfs-ribbon-line--l"></view>
						<view class="sfs-ribbon-bow">
							<view class="sfs-ribbon-loop sfs-ribbon-loop--l"></view>
							<view class="sfs-ribbon-knot"></view>
							<view class="sfs-ribbon-loop sfs-ribbon-loop--r"></view>
						</view>
						<view class="sfs-ribbon-line sfs-ribbon-line--r"></view>
					</view>
					<text class="sfs-hero-title">“好友赠礼 请领取”</text>
					<view class="sfs-gift">
						<tz-course-mini :list="courseCard" :clickable="canOpenGoods" :margin="0" :round="true"
							:border="false" />
					</view>
				</view>
				<view class="sfr-claim-meta">
					<text class="sfr-claim-desc">{{ stateText }}</text>
				</view>
				<view class="sfr-claim-action">
					<tz-button size="normal" long type="primary" theme="send-friend" text="登录后领取"
						@click="goLogin"></tz-button>
				</view>
			</view>
		</template>

		<!-- 已失效 / 其余终局档（2026-10-28 统一样式）：标题 + 蓝面板 + 白卡原因，不再回旧白卡 -->
		<template v-else>
			<view class="sfs-main sfs-main--result">
				<text class="sfs-result-title">{{ resultTitle }}</text>
				<view class="sfs-hero">
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
						<tz-course-mini :list="courseCard" :clickable="canOpenGoods" :margin="0" :round="true"
							:border="false" />
					</view>
				</view>
				<view class="sfs-claim-card">
					<text class="sfs-claim-head">{{ claimedLabel }}</text>
					<text class="sfs-claim-reason">{{ stateText }}</text>
					<text class="sfs-claim-date" v-if="stateSub">{{ stateSub }}</text>
				</view>
			</view>
		</template>
		<!-- 底部导航 + 版权页脚：与「赠送记录」页同一档（tz-tab-bar 自带导航配置判据，深链进来的
		     领取页不命中导航项就是空渲染；tz-footer 常驻） -->
		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue">
</script>

<style lang="scss">
/* 送礼页 / 领取页共用的礼盒视觉（蓝面板 + 彩带 + 终局白卡）：SCSS 内联，MP 端也能拿到 */
@import "../../../../common/styles/send-friend-gift.scss";
@import "./css.css";
</style>
