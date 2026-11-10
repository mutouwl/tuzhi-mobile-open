<template>
	<div class="container">
		<!-- 首屏骨架屏（M16）：原位复用真实版式 —— 用户头 / 会员卡 / 规格卡 / 页签 / 正文 / 吸底按钮，
		     灰块只替换会变的那几格，外壳走真元素那一档的类，撤掉骨架屏后不跳版。
		     只有首屏铺；下拉刷新与重进保留已渲染内容（静默重取）。 -->
		<div class="vip-sk" v-if="loading">
			<div class="user-header">
				<div class="info">
					<div class="avatar vip-sk-block"></div>
					<div class="content">
						<div class="username">
							<div class="vip-sk-line vip-sk-h-16 vip-sk-w-35 vip-sk-block"></div>
						</div>
						<div class="user-descip">
							<div class="vip-sk-tag vip-sk-block"></div>
							<div class="vip-sk-line vip-sk-h-12 vip-sk-w-40 vip-sk-block"></div>
						</div>
					</div>
				</div>
			</div>

			<tz-box padding="15px 15px 10px">
				<div class="card-swiper">
					<div class="vip-sk-card">
						<div class="vip-sk-line vip-sk-h-16 vip-sk-w-35 vip-sk-deep"></div>
						<div class="vip-sk-line vip-sk-h-12 vip-sk-w-25 vip-sk-deep vip-sk-mt-6"></div>
						<div class="vip-sk-card-icon vip-sk-deep"></div>
						<div class="vip-sk-privilege">
							<div class="vip-sk-privilege-item" v-for="i in 2" :key="i">
								<div class="vip-sk-circle vip-sk-deep"></div>
								<div class="vip-sk-line vip-sk-h-10 vip-sk-w-50 vip-sk-deep vip-sk-mt-8"></div>
							</div>
						</div>
					</div>
				</div>
			</tz-box>

			<tz-box padding="0px 15px 5px">
				<div class="price-cell vip-sk-cells">
					<div class="cell-item vip-sk-cell" v-for="i in 3" :key="i">
						<div class="vip-sk-line vip-sk-h-15 vip-sk-w-45 vip-sk-block vip-sk-center"></div>
						<div class="vip-sk-line vip-sk-h-22 vip-sk-w-65 vip-sk-block vip-sk-center vip-sk-mt-10"></div>
						<div class="vip-sk-line vip-sk-h-12 vip-sk-w-85 vip-sk-block vip-sk-center vip-sk-mt-6"></div>
					</div>
				</div>
			</tz-box>

			<tz-divider bgColor="#fafafa" />

			<div class="vip-sk-tabs">
				<div class="vip-sk-line vip-sk-h-14 vip-sk-w-18 vip-sk-block"></div>
				<div class="vip-sk-line vip-sk-h-14 vip-sk-w-18 vip-sk-block"></div>
			</div>

			<tz-box padding="0px 15px 15px">
				<div class="vip-sk-line vip-sk-h-15 vip-sk-w-30 vip-sk-block"></div>
				<div class="vip-sk-line vip-sk-h-12 vip-sk-w-100 vip-sk-block vip-sk-mt-12"></div>
				<div class="vip-sk-line vip-sk-h-12 vip-sk-w-95 vip-sk-block vip-sk-mt-8"></div>
				<div class="vip-sk-line vip-sk-h-12 vip-sk-w-60 vip-sk-block vip-sk-mt-8"></div>
			</tz-box>

			<!-- 吸底栏占位：真实底栏高 60（内衬 10 + 按钮 40），撤骨架时主按钮不前跳 -->
			<div class="vip-sk-footer">
				<div class="vip-sk-btn vip-sk-block"></div>
			</div>
			<div class="vip-sk-filler"></div>
		</div>
		<template v-else-if="detail[checkCardIndex] && config.status == 1">

			<div class="user-header">
				<div class="info">
					<div class="avatar" v-if="userInfo && userInfo.avatar">
						<img :src="userInfo.avatar" />
					</div>
					<div class="content">
						<div class="username">
							<span>
								{{ userInfo && userInfo.nickname ? userInfo.nickname : '-' }}
							</span>
						</div>

						<div class="user-descip">

							<span :class="[
								'viptag',
								{'pay':vipUserInfo ? true : false}
							]"">{{vipUserInfo ? vipUserInfo.card.title : '暂未开通'}}</span>
							<span v-if=" vipUserInfo">到期时间：{{$tools.formatDate(vipUserInfo.end_time)}}</span>
						</div>

					</div>
				</div>
			</div>

			<tz-box padding="15px 15px 10px">
				<view class="vip-media gbd-anchor">
				<swiper class="card-swiper" :style="{ height: swiperHeight ? swiperHeight + 'px' : '' }"
					indicator-active-color="#000000" indicator-color="#efefef" circular
					:autoplay="false" :indicator-dots="true" :duration="300" :current="checkCardIndex" @change="changeCard">
					<swiper-item v-for="(item, index) in detail" :key="index">
						<div class="vip-card" :class="{ 'card-measured': cardMeasured }"
							:style="{ 'background-color': item.style == 1 ? 'black' : item.style_color }">
							<div class="card-title">
								{{ item.title }}
							</div>
							<div class="card-subtitle" v-if="item.subtitle">
								{{ item.subtitle }}
							</div>
							<div class="card-icon">
								<img src="@/static/image/app/vip.png" alt="">
							</div>


							<div class="privilege"
								v-if="item.privilege_free == 1 || item.privilege_discount == 1">
								<u-grid :border="false" :col="4">
									<u-grid-item v-if="item.privilege_free == 1">
										<div class="vip-privilege-icon">
											<tz-icon name="transaction_fill" color="#fff" :size="32"></tz-icon>
										</div>
										<text class="name">专属课程免费</text>
									</u-grid-item>
									<u-grid-item v-if="item.privilege_discount == 1">
										<div class="vip-privilege-icon">
											<tz-icon name="marketing_fill" color="#fff" :size="32"></tz-icon>
										</div>
										<text class="name">专属课程折扣</text>
									</u-grid-item>
								</u-grid>
							</div>
						</div>
					</swiper-item>
				</swiper>
				<tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />
				</view>
			</tz-box>

			<!-- 会员卡选项（规格价卡）放在拼团区**上方**（2026-10-29 用户点名「把会员卡的选项放在拼团价格卡的上方」）：
			     与其余八类商详页同一个次序 —— 先选这张卡买哪一档（天数/价格），再看拼团那块。 -->
			<template v-if="detail[checkCardIndex]">
				<tz-box padding="0px 15px 5px">
					<div class="price-cell">

						<u-scroll-list :indicator="false">
							<div class="cell-item" @click="changeSku(index)" :class="[{
													'active': skuIndex == index ? true : false
												}]" v-for="(item, index) in detail[checkCardIndex].sku" :key="index">
								<div class="cell-title">
									{{ item.time + '天' }}
								</div>
								<!-- 这一排就是会员卡自己的规格组件（`changeSku`）：有进行中的拼团时，
								     卡面上的价切到**这一档的拼团价**、原价划线收起 —— 页面上只有一套价（2026-10-29 统一口径） -->
								<div class="cell-value">
									<template v-if="isScoreExchange">
										{{ scoreExchangeScore }}<span class="value-unit">积分</span>
									</template>
									<template v-else-if="gbSkuPrice(index)">
										<span class="value-unit">¥</span>{{ gbSkuPrice(index) }}<span class="cell-price-origin">¥{{ item.price }}</span>
									</template>
									<template v-else>
										<span class="value-unit" v-if="!isVirtualPaySku(item, detail[checkCardIndex])">¥</span>{{item.price }}<span class="value-unit" v-if="isVirtualPaySku(item, detail[checkCardIndex])">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
									</template>
								</div>
								<!-- 日均价那一行是**现金价**派生（`sku.price / time`）：积分兑换时价格不随天数档变，
								     摆「约¥0.33/天」既不是这一单的口径、也会被读成「还要再付现金」
								     ⇒ 兑换模式整行不出，限购说明单独留一行（2026-11-09） -->
								<div class="cell-label" v-if="!isScoreExchange">
									{{ formatAveragePrice(item, detail[checkCardIndex]) }} <span
										v-if="item.limit>0">，此规格限购{{item.limit}}次</span>
								</div>
								<div class="cell-label" v-else-if="item.limit>0">
									此规格限购{{item.limit}}次
								</div>

							</div>

						</u-scroll-list>

					</div>
				</tz-box>
			</template>

			<!-- 拼团区（2026-10-28 用户点名「会员卡也要能拼团」）：当前这张卡的 id 就是拼团商品 id；
			     左右滑动换卡时靠 changeCard 重取这一块（组件不会自己跟着 prop 变） -->
			<!-- `host-spec`（2026-10-29）：会员卡没有规格弹窗，规格就是页面上那张「N天 / ¥x」选项卡
			     （`changeSku` 那一排）⇒ 直接用它选中的那一档（`skuIndex` 就是拼团 spec_id 的下标），
			     不再让拼团弹窗重复摆一排时长 chips -->
			<!-- `spec-inline`（2026-10-29）：会员卡的规格就是上面那排「N天 / ¥x」卡、摆在页面里，
			     没有规格弹窗可挂 ⇒ 阶梯型的人数额也摆在本区页面上（`gba-pick` 那一块），
			     点「立即开团」时用 `currentPick()` 把规格与档位一起交回，不再开第二步弹窗 -->
			<tz-group-buy-area v-if="detail[checkCardIndex] && !isScoreExchange" ref="gbArea" goods-type="vipcard" host-spec spec-inline hide-danmu
				:goods-id="detail[checkCardIndex].id"
				:join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
				:join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
				:join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
				:join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
				:join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
				:join-price="gbJoinCtx ? gbJoinCtx.price : 0"
				@pick-spec="openGbSpec" @go-pay="gbGoPay" @ready="gbReady" />

			<!-- 送好友（2026-10-28 补会员入口）：购买前（立即开通）与购买后（会员中心/续费）都是这一页，
			     入口不随 `vipUserInfo` 消失 —— 已开通的人照样能再买一张送朋友（课程 M45 同一口径）。
			     `goods-id` 是 `卡ID_SKU下标`（与「立即开通」那份 goodsList 逐字同形）：
			     换卡/换规格时组件自己按新 SKU 重取 flag，价格与下单链都吃后端下发的那一枚。 -->
			<tz-box padding="0px 15px 10px">
				<tz-send-friend-area scene="inCard" goods-type="vipcard"
					:goods-id="detail[checkCardIndex].id + '_' + skuIndex" />
			</tz-box>

			<tz-divider bgColor="#fafafa" />
			<u-sticky bgColor="#fff" :offsetTop="0">
				<u-tabs :list="tabs" :current="current" :scrollable="true" @change="tabChange"></u-tabs>
			</u-sticky>
			

			<template v-if="currentTabType == 'detail'">
				<tz-box padding="0px 15px 15px">
					<tz-parse :content="detail[checkCardIndex].detail" :selectable="true"></tz-parse>
				</tz-box>
			</template>

			<template v-if="currentTabType == 'goods'">

				<!-- 免费权益：全部课程 -->
				<template
					v-if="detail[checkCardIndex].privilege_free == 1 && detail[checkCardIndex].privilege_free_scope == 'all'">
					<tz-title title="免费权益" :more="false" />
					<tz-box>
						<div class="privilege-tip">
							<u-icon name="gift-fill" :size="40" color="#0968f6"></u-icon>
							<div class="privilege-tip-text">全部课程均可免费学习</div>
						</div>
					</tz-box>
				</template>

				<!-- 免费权益：指定课程 -->
				<template
					v-else-if="detail[checkCardIndex].privilege_free == 1 && detail[checkCardIndex].privilege_free_goods.length > 0">

					<tz-title title="免费权益" subtitle="查看更多"
						@click="$nav.to('/pages/app/vip/goods/goods?type=free&card_id=' + detail[checkCardIndex].id)" />
					<tz-box>
						<tz-course type="diallel"  :round="true" border="true"
							:list="detail[checkCardIndex].privilege_free_goods"></tz-course>
					</tz-box>
				</template>

				<!-- 折扣权益：全部课程 -->
				<template
					v-if="detail[checkCardIndex].privilege_discount == 1 && detail[checkCardIndex].privilege_discount_scope == 'all'">
					<tz-title :title="'专享'+detail[checkCardIndex].privilege_discount_val+'折'" :more="false"/>
					<tz-box>
						<div class="privilege-tip">
							<u-icon name="gift-fill" :size="40" color="#0968f6"></u-icon>
							<div class="privilege-tip-text">{{ '全部课程购买可享' + detail[checkCardIndex].privilege_discount_val + '折优惠' }}</div>
						</div>
					</tz-box>
				</template>

				<!-- 折扣权益：指定课程 -->
				<template
					v-else-if="detail[checkCardIndex].privilege_discount == 1 && detail[checkCardIndex].privilege_discount_goods.length > 0">

					<tz-title :title="'专享'+detail[checkCardIndex].privilege_discount_val+'折'" subtitle="查看更多"
						@click="$nav.to('/pages/app/vip/goods/goods?type=discount&card_id=' + detail[checkCardIndex].id)" />
					<tz-box>
						<tz-course type="diallel" :round="true" border="true"
							:list="detail[checkCardIndex].privilege_discount_goods"></tz-course>
					</tz-box>

				</template>

			</template>


			<template v-if="config.exchange == 0 && vipUserInfo && vipUserInfo.card_id != detail[checkCardIndex].id">
				<tz-bottom-btn :disabled="true" btnTitle="暂不支持会员卡换购" @handle="buy" />
			</template>
			<template v-else>
				<!-- 我在这一场拼团里已有进行中的团（`gbInTeam`）→ 主按钮「立即开通」收起（PRD 2026-10-27），
				     与课程详情页同一枚 `hide-main`，底栏只留「查看拼团详情」这一个出口 -->
				<tz-bottom-btn :btnTitle="isScoreExchange ? '立即兑换' : '立即开通'" @handle="buy" :hide-main="gbInTeam || gbJoinMode">
					<tz-group-buy-btn v-if="gbEntry && !isScoreExchange" class="tbb-slot" slot="order-extra" :text="gbEntry.text" :price="gbEntry.price_text" @open="openGb" />
				</tz-bottom-btn>
			</template>

		</template>
		<template v-else>
			<!-- 取数失败要自带出路（M13）：空态里那枚「重新加载」只在失败档出现 -->
			<u-empty icon="/static/image/empty.png" width="70" height="70" :text="emptyText">
				<tz-button v-if="loadMsg" size="normal" text="重新加载" @click="getData" />
			</u-empty>
		</template>



		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
	@import "./css.css";
</style>
