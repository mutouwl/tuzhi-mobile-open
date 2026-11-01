<template>
	<div class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">
			<tz-box padding="10px 15px 10px">
				<u-search placeholder="请输入活动名称/票号/票种搜索" shape="square" :showAction="false" v-model="form.search"
							@search="refresh"></u-search>
			</tz-box>
			<u-tabs :list="tabs" :current="current" :scrollable="false" @change="tabChange"></u-tabs>
		</u-sticky>

		<view class="tk-list">
			<!-- 首屏/刷新骨架屏：左侧日期灰块与轨道灰点由共用组件 tz-school-timeline 渲染（与真行同一档），
			     卡内按真实卡片逐块铺灰（标题 / 时间 / 地点 + 右侧封面与状态 + 下面五行信息），
			     静态版式与真实卡对齐，加载完不换版（M16） -->
			<block v-if="loading && !list.length">
				<tz-school-timeline v-for="n in 3" :key="'sk' + n" skeleton mode="date" card-radius="0" card-padding="12px">
					<view class="tk-top">
						<view class="tk-top-main">
							<view class="tk-sk-bar tk-sk-title"></view>
							<view class="tk-sk-bar tk-sk-sub"></view>
							<view class="tk-sk-bar tk-sk-loc"></view>
						</view>
						<view class="tk-top-side">
							<view class="tk-sk-cover"></view>
							<view class="tk-sk-bar tk-sk-status"></view>
						</view>
					</view>
					<view class="tk-sk-bar tk-sk-row" v-for="m in 3" :key="m" :class="'w' + ((m % 2) + 1)"></view>
				</tz-school-timeline>
			</block>

			<!-- 票券时间轴：左列取活动开始日期（月-日）作扫读锚点，右侧卡片按参考图版式：
			     标题 / 活动时间 / 地点 + 封面，下面保留列表字段（票档与价格、票号、参加人 = 姓名 手机号、
			     更多信息「查看」贴右）；购买时间与使用时间只在票券详情页展示；
			     状态做成封面下方的标签，与时间轴圆点同一判定。
			     排序由后端按活动开始时间倒序（同场多票再按票券 id 倒序）；整卡点击进票券详情 -->
			<block v-else-if="list.length">
				<tz-school-timeline
					v-for="(item, index) in list"
					:key="item.id"
					:first="index === 0"
					:last="index === list.length - 1"
					mode="date"
					card-radius="0"
					card-padding="12px"
					:date-text="shortDate(item)"
					:dot-color="item.status_class"
					@card-click="goDetail(item)"
				>
					<view class="tk-top">
						<view class="tk-top-main">
							<view class="tk-title two-line-hidden">{{ item.activity_name || '活动暂不可用' }}</view>
							<view class="tk-start">{{ startText(item) }}</view>
							<view class="tk-location" v-if="item.activity_location">
								<tz-icon name="coordinates" :size="14" color="#86909C" />
								<text class="tk-location-text">{{ item.activity_location }}</text>
								<tz-icon name="enter" :size="12" color="#C9CDD4" />
							</view>
						</view>
						<view class="tk-top-side">
							<image v-if="item.activity_cover && !item.cover_failed" class="tk-cover"
								:src="item.activity_cover" mode="aspectFill" @error="onCoverError(item)" />
							<view v-else class="tk-cover tk-cover--empty">
								<tz-icon name="picture" :size="26" color="#C9CDD4" />
							</view>
							<view class="tk-status" :class="item.status_class">{{ statusText(item) }}</view>
						</view>
					</view>

					<view class="tk-row">
						<text class="tk-label">票档</text>
						<view class="tk-value tk-ticket-row">
							<text class="tk-ticket-name">{{ item.ticket_name || '-' }}</text>
							<text v-if="isVirtualPay(item)" class="tk-price">{{ item.price }}<text class="tk-price-unit">{{ $tools.systemConfig('coin_name') || '金币' }}</text></text>
							<text v-else class="tk-price"><text class="tk-price-unit">¥</text>{{ item.price }}</text>
						</view>
					</view>
					<view class="tk-row">
						<text class="tk-label">票号</text>
						<text class="tk-value">{{ item.ticket_no }}</text>
					</view>
					<view class="tk-row">
						<text class="tk-label">参加人</text>
						<text class="tk-value">{{ attendeeText(item) }}</text>
					</view>
					<view class="tk-row" v-if="item.other && item.other.length > 2">
						<text class="tk-label">更多信息</text>
						<view class="tk-value tk-value--end">
							<text class="tk-link" @click.stop="openInfo(item)">查看</text>
						</view>
					</view>
				</tz-school-timeline>
			</block>

			<u-empty v-if="!loading && !list.length" icon="/static/image/empty.png" width="70" height="70" :text="emptyText" />
		</view>

		<!-- 报名信息弹层：外壳走 M6/M18 那一档（u-popup mode=bottom + round 12 + bgColor=transparent +
		     closeable + safeAreaInsetBottom=false），标题走全局 .school-popup-title（16px/600 左对齐）；
		     圆角必须由面板自己给（.u-popup__content 只有 border-radius 没有 overflow:hidden，只写 :round 会被面板方角盖住）；
		     字段行沿用信息行那一档 .school-cell-*（打卡信息/校区信息同款），不另造一套行版式；
		     列表区按 M6 给确定高度（行高 48 逐行累加、上限 46vh），字段多时框内滚动、少时不撑出一屏空白；
		     面板最低高度 300px（用户 2026-10-31 点名）：字段少时补一块底部留白，弹层不显得又矮又局促 -->
		<u-popup :show="modal.info" mode="bottom" :round="12" bgColor="transparent" :closeable="true"
			:closeOnClickOverlay="true" :safeAreaInsetBottom="false" @close="modal.info = false">
			<view class="school-popup tk-info-popup" :style="{ 'min-height': '300px' }">
				<view class="school-popup-title">报名信息</view>
				<tz-popup-list :height="infoHeight" padding="0 0 4px" :refreshable="false">
					<view class="school-cell-item tk-info-row" v-for="(row, i) in infoRows" :key="i"
						:class="{ 'tk-info-row--last': i === infoRows.length - 1 }">
						<view class="school-cell-label">{{ row[0] }}</view>
						<view class="tk-info-value">{{ row[1] ? row[1] : '-' }}</view>
					</view>
				</tz-popup-list>
			</view>
		</u-popup>

		<tz-footer />

	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">@import "./css.css";</style>
