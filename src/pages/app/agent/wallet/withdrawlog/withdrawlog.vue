<template>
	<view class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">
			<div class="filter">
				<div class="time" @click="showModel('time')">
					<span>{{$tools.yearmonth(form.time / 1000)}}</span>
					<span><tz-icon :name="modal.time ==false ? 'unfold' : 'packup'" :size="16" color="#4E5969" /></span>
				</div>
				<div class="type" @click="showModel('mode')">
					<span>{{ modeList[form.mode].name }}</span>
					<span><tz-icon :name="modal.mode ==false ? 'unfold' : 'packup'" :size="16" color="#4E5969" /></span>
				</div>
			</div>
		</u-sticky>


		<tz-box padding="5px 15px" v-if="list.length > 0">
			<div class="order-list">
				<div class="order-item" v-for="(item, index) in list">
					<div class="order-item-header">
						<div class="order-item-price">
							¥{{ item.money }}
						</div>
						<div class="order-item-name">
							{{ item.status }}
						</div>
						
					</div>
					<div class="order-item-list">
						持卡人：<span class="order-item-value">{{ item.card_name }}</span>
					</div>
					<div class="order-item-list">
						银行卡号：<span class="order-item-value">{{ item.card_no }}</span>
					</div>
					<div class="order-item-list">
						开户银行：<span class="order-item-value">{{ item.card_address }}</span>
					</div>
					<div class="order-item-list">
						申请时间：<span class="order-item-value">{{ $tools.formatDate(item.createtime) }}</span>
					</div>
					<div class="order-item-list" v-if="item.updatetime">
						处理时间：<span class="order-item-value">{{ $tools.formatDate(item.updatetime) }}</span>
					</div>
					<div class="order-item-list" v-if="item.remark">
						反馈：<span class="order-item-value">{{ item.remark }}</span>
					</div>
				</div>
			</div>
		</tz-box>
		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else/>


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


		<!-- 类型 -->
		<u-action-sheet :safeAreaInsetBottom="true" cancelText="取消" :show="modal.mode" :actions="modeList"
			:closeOnClickOverlay="true" :closeOnClickAction="true" @close="showModel('mode')"
			@select="modeSelect"
			>
		</u-action-sheet>

		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
