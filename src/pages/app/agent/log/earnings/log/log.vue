<template>
	<view class="container">

		<u-sticky bgColor="#fff" :offsetTop="0" v-if="pageParams.uid">
			<div class="filter">
				<div class="time" @click="showModel('time')">
					<span>{{ $tools.yearmonth(form.time / 1000) }}</span>
					<span><tz-icon name="unfold" :size="16" color="#4E5969" /></span>
				</div>
				<div class="user-name">{{customerDetail.user.nickname}}的订单收益记录</div>
			</div>
		</u-sticky>

		<!-- 时间选择 -->

		<template v-if="!pageParams.uid">
			<u-sticky bgColor="#fff" :offsetTop="0">
				<u-tabs :list="typeList" @change="typeChange"></u-tabs>
			</u-sticky>

			<tz-box padding="15px 15px 0">
				<div class="total-box">
					<div class="total-item">
						<div class="total-item-name">订单数</div>
						<div class="total-item-value">
							{{ total.order_count ? total.order_count : '-' }}
						</div>
					</div>
					<div class="total-item">
						<div class="total-item-name">已结算收益(元)</div>
						<div class="total-item-value">
							{{ total.price_success ? total.price_success : '-' }}
						</div>
					</div>
					<div class="total-item">
						<div class="total-item-name">待结算收益(元)</div>
						<div class="total-item-value">
							{{ total.price_waiting ? total.price_waiting : '-' }}
						</div>
					</div>
				</div>
			</tz-box>
		</template>

		<tz-box>

			<u-subsection :list="statusList" :current="form.status" @change="statusChange" v-if="!pageParams.uid"></u-subsection>


			<template v-if="list.length > 0">
				<div class="order-list">
					<div class="order-item" v-for="(item, index) in list">
						<div class="order-item-header">
							<div class="order-item-name">
								{{ item.item.item_name }}
								<span class="order-item-num">*{{ item.item.count }}</span>
							</div>
							<div class="order-item-price">
								¥{{ item.brokerage_price }}
							</div>
						</div>
						<div class="order-item-list">
							<template v-if="!item.is_channels">
								用户<span class="order-item-value">{{ item.user  && item.user.nickname ? item.user.nickname : '-' }}</span>于
							</template>
							<template v-else>视频号分享员</template>
							<span class="order-item-value">{{$tools.formatDate(item.createtime) }}</span>下单
						</div>
						<div class="order-item-list">
							实付金额: ¥{{ item.item.real_price }} | {{ item.mode != 3 ? '收益比例: ' + item.brokerage_prop + '%' : '固定佣金'
							}}
						</div>
						<div class="order-item-list">
							结算状态: {{ item.status == 1 ? '已结算' : item.status == 2 ? '无效' : '待结算' }}
						</div>
						<div class="order-item-list">
							类型: {{ item.type == 'commission' ? '商品佣金' : '下级分销员卖货提成' }}
						</div>
					</div>
				</div>
			</template>
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-else />
		</tz-box>


		<!-- 时间选择 -->
		<u-datetime-picker
				:closeOnClickOverlay="true"
                :show="modal.time"
				v-model="form.time"
                mode="year-month"
				:maxDate="Number(new Date())"
				@close="showModel('time')"
				@cancel="showModel('time')"
				@confirm="confirmTime"
        ></u-datetime-picker>


		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
