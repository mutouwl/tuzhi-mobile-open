<template>
	<view class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">
			<div class="balance" :style="{
				backgroundImage: pageParams.type == 'money' ? 'linear-gradient(to bottom right,  #F6A516,#F9C667)' : 'linear-gradient(to bottom right,  #6B6C85,#3A4054)'
			}">
				<div class="balance-left">
					<!-- 余额随列表接口异步返回，首屏用同字号占位条，避免只剩「可用余额」四个字 -->
					<span class="sk-value" v-if="!userInfoLoaded"></span>
					<span class="value" v-else>{{ userInfo[pageParams.type] }}</span>
					<span class="name">可用{{pageParams.type == 'money'? '余额' :'积分'}}</span>
				</div>
			</div>

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


		<!-- 首屏骨架屏：吸顶的余额卡与筛选条保持可见，只占位列表区域（仿流水单行版式：左标题+日期、右金额）；
		     仅「请求中且列表为空」时出现，上拉翻页保留已有流水（与教务课时流水列表同一口径） -->
		<tz-box padding="5px 15px" v-if="loading && !list.length">
			<view class="assets-sk-cell" v-for="i in 4" :key="i">
				<view class="assets-sk-main">
					<u-skeleton
						:loading="true"
						:animate="true"
						:title="true"
						title-width="34%"
						title-height="14"
						:rows="1"
						rows-width="46%"
						rows-height="12"
					/>
				</view>
				<view class="assets-sk-amount"></view>
			</view>
		</tz-box>
		<tz-box padding="5px 15px" v-else-if="list.length > 0">
			<u-cell-group :border="false">
				<u-cell  size="large" v-for="(item,index) in list" :key="index"  :border="(list.length - 1) == index ? false : true" :title="item.memo ? item.memo : '-'" :value="item.value" :label="$tools.formatDate(item.createtime)"></u-cell>
			</u-cell-group>			
		</tz-box>
		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else-if="!loading"/>


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

		<tz-tab-bar />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
