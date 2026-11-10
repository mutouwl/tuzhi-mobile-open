<template>
	<div class="container">
		<!-- #ifdef MP-TOUTIAO -->
		<u-empty icon="/static/image/empty.png" width="70" height="70" text="分销功能禁止抖音小程序端使用" />
		<!-- #endif -->
		<!-- #ifndef MP-TOUTIAO -->
		<!-- 首屏骨架屏：原位复用真实卡片结构（深色会员卡/收益栏/数据格/推广入口）占位，撤掉骨架屏后不跳版；
		     仅首次进入显示，onShow 与下拉刷新重拉保留已渲染内容 -->
		<div class="agent-sk" v-if="loading">
			<tz-box bgColor="#242531" padding="20px 15px">
				<div class="user-box">
					<div class="user-avatar agent-sk-block agent-sk-light"></div>
					<div class="user-info">
						<div class="agent-sk-line agent-sk-block agent-sk-light sk-h-14 sk-w-35"></div>
					</div>
					<!-- 右侧箭头留位，否则 space-between 会把信息列顶偏 -->
					<div class="user-more"></div>
				</div>
				<div class="level-box">
					<div class="level-info">
						<div class="agent-sk-line agent-sk-block agent-sk-brand sk-h-14 sk-w-30"></div>
						<div class="agent-sk-line agent-sk-block agent-sk-brand sk-h-12 sk-w-100"></div>
					</div>
					<div class="agent-sk-badge agent-sk-block agent-sk-brand"></div>
				</div>
			</tz-box>

			<tz-box bgColor="none">
				<div class="data-total-box" style="border-radius: 6px 6px 0 0 ;">
					<div class="data-total-item" v-for="i in 2" :key="i">
						<div class="agent-sk-line agent-sk-block agent-sk-light sk-w-100"></div>
						<div class="agent-sk-line agent-sk-block agent-sk-light sk-h-20 sk-w-60"></div>
					</div>
				</div>
				<tz-box>
					<div class="data-box">
						<div class="data-item" v-for="i in 4" :key="i">
							<div class="agent-sk-line agent-sk-block sk-w-60"></div>
							<div class="agent-sk-line agent-sk-block sk-h-20 sk-w-35"></div>
						</div>
					</div>
					<!-- 可提现金额行按金额为 0 收起（v-if），按 M16 不给灰块也不预留空位 -->
				</tz-box>
				<tz-divider bgColor="none" />
				<tz-box padding="10px 15px">
					<div class="channel-box">
						<div class="channel-item" v-for="i in 2" :key="i">
							<div class="channel-item-info">
								<div class="agent-sk-line agent-sk-block agent-sk-deep sk-h-14 sk-w-70"></div>
								<div class="agent-sk-line agent-sk-block agent-sk-deep sk-w-75"></div>
							</div>
							<div class="agent-sk-icon agent-sk-block agent-sk-deep"></div>
						</div>
					</div>
				</tz-box>
			</tz-box>
		</div>
		<u-empty v-if="!loading && config.status == 0" icon="/static/image/empty.png" width="70" height="70" text="分销功能已关闭" />
		<template v-if="!loading && config.status == 1">
			<tz-box bgColor="#242531" padding="20px 15px">

				<div class="user-box" @click="$nav.to('/pages/app/agent/member/level/level')">
					<div class="user-avatar">
						<img :src="userInfo.avatar" />
					</div>
					<div class="user-info">
						<div class="user-name">
							{{ userInfo.nickname ? userInfo.nickname : '-' }}
						</div>
						<div class="user-descip" v-if="member.status != 1">
							当前已禁用分销功能
						</div>
					</div>

					<div class="user-more">
						<tz-icon name="enter" color="#fff" :size="16" />
					</div>
				</div>

				<div class="level-box" @click="$nav.to('/pages/app/agent/member/level/level')" v-if="level.list.length > 0">

					<div class="level-info">
						<div class="level-name">
							{{ level.list[level.user].name }}
						</div>
						<div class="level-descip">
							商品佣金:{{ level.list[level.user] ? level.list[level.user].proportion.goods : 0 }}% <template
								v-if="config.mode == 2"> ；下级分销员卖货提成:{{ level.list[level.user] ?
									level.list[level.user].proportion.customer : 0 }}%</template>
						</div>
					</div>

					<div class="level-cover">
						<img src="@/static/image/app/vip.png" />
					</div>
				</div>
			</tz-box>

			<tz-box bgColor="none">
				<div class="data-total-box" style="border-radius: 6px 6px 0 0 ;">
					<div class="data-total-item">
						<div class="data-total-name">
							今日收益(元)
						</div>
						<div class="data-total-value">
							{{ statistics.order.today.price_success ? statistics.order.today.price_success : '0' }}
						</div>
					</div>

					<div class="data-total-item">
						<div class="data-total-name">
							总收益(元)
						</div>
						<div class="data-total-value">
							{{ statistics.order.total.price_success ? statistics.order.total.price_success : '0' }}
						</div>
					</div>
				</div>
				<tz-box>
					<div class="data-box">
						<div class="data-item" @click="$nav.to('/pages/app/agent/log/earnings/log/log')">
							<div class="data-item-name">
								今日推广订单 <tz-icon name="enter" color="#86909C" :size="12" />
							</div>
							<div class="data-item-value">
								{{ statistics.order.today.order_count ? statistics.order.today.order_count : '0' }}
							</div>
						</div>
						<div class="data-item" @click="$nav.to('/pages/app/agent/log/earnings/log/log')">
							<div class="data-item-name">
								累计推广订单 <tz-icon name="enter" color="#86909C" :size="12" />
							</div>
							<div class="data-item-value">
								{{ statistics.order.total.order_count ? statistics.order.total.order_count : '0' }}
							</div>
						</div>
						<div class="data-item" @click="$nav.to('/pages/app/agent/log/customer/log/log')">
							<div class="data-item-name">
								今日新增客户 <tz-icon name="enter" color="#86909C" :size="12" />
							</div>
							<div class="data-item-value">
								{{ statistics.customer.today.count ? statistics.customer.today.count : '0' }}
							</div>
						</div>
						<div class="data-item" @click="$nav.to('/pages/app/agent/log/customer/log/log')">
							<div class="data-item-name">
								累计客户 <tz-icon name="enter" color="#86909C" :size="12" />
							</div>
							<div class="data-item-value">
								{{ statistics.customer.total.count ? statistics.customer.total.count : '0' }}
							</div>
						</div>
					</div>

					<!-- 可提现金额 / 账户余额两行同属一本账：分隔线只留在这一块头上，挂在页面自己的行容器上
					     （不再往 u-cell 内部加边框）；两行之间只留白、不画线。
					     可提现金额为 0 时整行收起（2026-11-08 用户口径），此时由账户余额行自己带那条线 -->
					<view class="balance-total" v-if="showWithdrawMoney">
						<u-cell :border="false" style="padding: 0;" :value="member.money"
							@click="$nav.to('/pages/app/agent/wallet/settle/settle')">
							<template #title>
								<view class="balance-title">
									<text class="u-cell__title-text">可提现金额</text>
									<text class="balance-tag balance-tag--old">旧</text>
								</view>
							</template>
							<template #right-icon>
								<tz-icon name="enter" color="#86909C" :size="13" />
							</template>
						</u-cell>
					</view>
					<!-- 商家开启「结算到用户余额」后，新佣金不再进分销钱包，这一本账也得在这页有个门；
					     显隐只吃后端下发的那枚开关，不许前端自己判「有没有余额」（硬约束 27②/M36）。
					     右缘只挂行尾箭头，与「可提现金额」那一行同一档（tz-icon enter 13 #86909C），
					     入门动作交给整行点击，不再摆「去提现」按钮（2026-11-08 用户口径） -->
					<view class="balance-cell" :class="{ 'balance-cell--solo': !showWithdrawMoney }"
						v-if="config.settle_to_balance == 1">
						<u-cell :border="false" style="padding: 0;" @click="$nav.to('/pages/user/balance/index')">
							<template #title>
								<view class="balance-title">
									<text class="u-cell__title-text">账户余额</text>
									<!-- 「新」只在两本账并排（上面那行可提现金额也在）时才有对照意义：
									     只剩这一本账时摆个「新」没有可比的另一本，整枚 Tag 收起（2026-11-09 用户口径） -->
									<text class="balance-tag balance-tag--new" v-if="showWithdrawMoney">新</text>
								</view>
							</template>
							<template #right-icon>
								<tz-icon name="enter" color="#86909C" :size="13" />
							</template>
						</u-cell>
					</view>
				</tz-box>
				<tz-divider bgColor="none" />
				<tz-box padding="10px 15px">
					<div class="channel-box">
						<div class="channel-item" @click="$nav.to('/pages/app/agent/recommend/goods/goods')">
							<div class="channel-item-info">
								<div class="channel-item-info-title">推广商品</div>
								<div class="channel-item-info-subtitle">佣金赚不够</div>
							</div>
							<div class="channel-item-cover">
								<img src="@/static/image/app/goods.png">
							</div>
						</div>
						<div class="channel-item" @click="modal.share = true;">
							<div class="channel-item-info">
								<div class="channel-item-info-title">推广海报</div>
								<div class="channel-item-info-subtitle">发圈快速获客</div>
							</div>
							<div class="channel-item-cover">
								<img src="@/static/image/app/poster.png">
							</div>
						</div>
						<!-- <div class="channel-item" v-if="config.channels" @click="channels()">
							<div class="channel-item-info">
								<div class="channel-item-info-title">视频号分享员</div>
								<div class="channel-item-info-subtitle">视频号私域分销</div>
							</div>
							<div class="channel-item-cover">
								<img src="@/static/image/channels.png">
							</div>
						</div> -->
					</div>
				</tz-box>
			</tz-box>
		</template>
		<!-- #endif -->

		<!-- 海报画的是店铺首页（type=page、val=pages/index/index），封面/名称就取站点自己的 logo 与店铺名，与 tz-footer 同一取法 -->
		<share-modal val="pages/index/index" type="page" :visible="modal.share" @close="modal.share = false"
			:title="$tools.systemConfig('name')" :cover="$tools.systemConfig('logo')" />


		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">@import "./css.css";</style>
