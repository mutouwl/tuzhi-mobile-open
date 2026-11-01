<template>
	<div class="container tkd-page">

		<!-- 加载骨架：与详情页同一张白纸分块（头图 / 电子票 / 信息块），灰块只替换会变的那几格 -->
		<view class="tkd-sheet" v-if="loading">
			<view class="tkd-head">
				<view class="tkd-sk-cover"></view>
				<view class="tkd-head-main">
					<view class="tkd-sk-bar tkd-sk-title"></view>
					<view class="tkd-sk-bar tkd-sk-meta"></view>
					<view class="tkd-sk-bar tkd-sk-meta short"></view>
				</view>
			</view>
			<tz-divider bgColor="#fafafa" />
			<view class="tkd-code">
				<view class="tkd-sk-bar tkd-sk-code-title"></view>
				<view class="tkd-sk-bar tkd-sk-tip"></view>
				<view class="tkd-sk-barcode"></view>
				<view class="tkd-sk-bar tkd-sk-switch"></view>
				<view class="tkd-sk-bar tkd-sk-num"></view>
				<view class="tkd-sk-bar tkd-sk-ticket-name"></view>
				<view class="tkd-sk-bar tkd-sk-price"></view>
			</view>
			<tz-divider bgColor="#fafafa" />
			<view class="tkd-block">
				<view class="tkd-sk-bar tkd-sk-row-title"></view>
				<view class="tkd-sk-bar tkd-sk-row"></view>
				<view class="tkd-sk-bar tkd-sk-row"></view>
			</view>
		</view>

		<!-- 电子票详情：一张白纸分块（活动头 / 电子票码 / 场馆地址 / 订单详情 / 票券信息），
		     块间用 TZ Divider 取页面底色分隔（M58：项目里的分隔线统一这一档，不再自绘主色虚线，
		     2026-10-31 用户点名「蓝色分隔线颜色太抢眼」）；
		     条码由票号按 Code128 现场生成（不调接口、不刷新），扫票人员按条码核对入场 -->
		<view class="tkd-sheet" v-else-if="!notFound">
			<view class="tkd-head">
				<image v-if="info.activity_cover && !coverFailed" class="tkd-cover"
					:src="info.activity_cover" mode="aspectFill" @error="onCoverError" />
				<view v-else class="tkd-cover tkd-cover--empty">
					<tz-icon name="picture" :size="28" color="#C9CDD4" />
				</view>
				<view class="tkd-head-main">
					<view class="tkd-title two-line-hidden">{{ info.activity_name || '活动暂不可用' }}</view>
					<view class="tkd-meta" v-if="info.activity_location">
						<tz-icon name="coordinates" :size="14" color="#86909C" />
						<text class="tkd-meta-text">{{ info.activity_location }}</text>
					</view>
					<view class="tkd-meta">
						<tz-icon name="clock" :size="14" color="#86909C" />
						<text class="tkd-meta-text">{{ startText }}</text>
					</view>
				</view>
			</view>

			<!-- 每块自带一枚前导条（M87）：条件随块一起写，块不渲染时条一起不渲染 -->
			<tz-divider bgColor="#fafafa" />

			<view class="tkd-code">
				<view class="tkd-code-head">
					<view class="tkd-code-title-wrap">
						<text class="tkd-code-title">请凭电子票入场</text>
					</view>
					<view class="tkd-status" :class="statusClass">{{ statusText }}</view>
				</view>
				<view class="tkd-code-tip">请勿截图转发给他人，入场时出示此条码</view>
				<!-- 码位：条码与二维码共用这一块，点一下互相切换（2026-10-31 用户口径）。
				     条码按票号走 Code128 现场生成；二维码按票号现场编码（utils/qrcode.js），都不调接口。
				     二维码用逐行硬边渐变画：模块取整数像素，边缘落在像素边界上，扫得清楚，
				     也避开了小程序旧画布的静默失败（取证见 utils/canvas-2d.js 头注释） -->
				<view class="tkd-code-body" v-if="barcodeBars.length || qr" @click="toggleCodeMode">
					<view class="tkd-barcode" v-if="codeView === 'barcode' && barcodeBars.length">
						<view class="tkd-bar" v-for="(bar, i) in barcodeBars" :key="i"
							:class="{ 'tkd-bar--on': bar.on }" :style="{ flexGrow: bar.w }"></view>
					</view>
					<view class="tkd-qr" v-else-if="codeView === 'qr' && qr"
						:style="{ width: qr.size + 'px', height: qr.size + 'px' }">
						<view class="tkd-qr-row" v-for="(row, i) in qr.rows" :key="i"
							:style="{ height: qr.scale + 'px', backgroundImage: row }"></view>
					</view>
				</view>
				<!-- 切换提示：只有条码和二维码都出得来时才摆（否则这行会指向一个切不动的动作） -->
				<view class="tkd-code-switch" v-if="canSwitchCode" @click="toggleCodeMode">
					{{ codeView === 'qr' ? '点击二维码切换为条码' : '点击条码切换为二维码' }}
				</view>
				<!-- 票号整行可点：点一下复制到剪贴板（扫票人员核对、转给客服/同事时用），
				     右侧「复制」是这枚点击的视觉提示；没有票号时点下去也要有回音（M13） -->
				<view class="tkd-code-num" @click="copyTicketNo">
					<text class="tkd-code-num-text">{{ info.ticket_no || '-' }}</text>
					<text class="tkd-code-copy" v-if="info.ticket_no">复制</text>
				</view>
				<view class="tkd-ticket-name">{{ info.ticket_name || '电子票' }}</view>
				<view class="tkd-price">
					<tz-icon name="coupons" :size="14" color="#86909C" />
					<text v-if="isVirtualPay" class="tkd-price-value">{{ info.price }}<text class="tkd-price-unit">{{ $tools.systemConfig('coin_name') || '金币' }}</text></text>
					<text v-else class="tkd-price-value"><text class="tkd-price-unit">¥</text>{{ info.price }}</text>
				</view>
			</view>

			<tz-divider bgColor="#fafafa" v-if="info.activity_location" />

			<!-- 场馆地址：点一下打开地图（2026-10-31 用户口径）。活动表只有文本地址、没有经纬度，
			     H5 按文字检索打开高德页；小程序/App 没有「按地址开地图」的接口，退到复制地址 -->
			<view class="tkd-block" v-if="info.activity_location" @click="openVenueMap">
				<view class="tkd-block-head">
					<view class="tkd-block-title">
						<tz-icon name="coordinates" :size="16" color="#0968F6" />
						<text class="tkd-block-title-text">场馆地址</text>
					</view>
					<view class="tkd-venue-nav">
						<tz-icon name="dingwei" :size="14" color="#86909C" />
						<text class="tkd-venue-nav-text">导航</text>
					</view>
				</view>
				<view class="tkd-venue">{{ info.activity_location }}</view>
			</view>

			<tz-divider bgColor="#fafafa" v-if="info.order_no" />

			<view class="tkd-block" v-if="info.order_no" @click="goOrder">
				<view class="tkd-block-head">
					<view class="tkd-block-title">
						<text class="tkd-block-title-text">订单详情</text>
					</view>
					<tz-icon name="enter" :size="14" color="#C9CDD4" />
				</view>
				<view class="tkd-block-sub">查看订单信息、支付方式等</view>
			</view>

			<tz-divider bgColor="#fafafa" />

			<view class="tkd-block">
				<view class="tkd-block-head">
					<view class="tkd-block-title">
						<text class="tkd-block-title-text">票券信息</text>
					</view>
				</view>
				<view class="school-cell-item tkd-row" v-for="(row, i) in infoRows" :key="i"
					:class="{ 'tkd-row--last': i === infoRows.length - 1 }">
					<view class="school-cell-label">{{ row.label }}</view>
					<view class="school-cell-value">
						<text class="school-cell-value-text tkd-row-value">{{ row.value }}</text>
					</view>
				</view>
			</view>
		</view>

		<u-empty v-else icon="/static/image/empty.png" width="70" height="70" :text="loadMsg" />

		<view class="tkd-foot" v-if="!loading && !notFound">本电子票仅限本人使用，请勿转借</view>

		<tz-footer />

	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">@import "./css.css";</style>
