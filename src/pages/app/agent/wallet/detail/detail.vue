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
			<u-cell-group :border="false">
				<u-cell  size="large" v-for="(item,index) in list" :key="index"  :border="(list.length - 1) == index ? false : true" :title="(item.memo ? item.memo : '-') + '【'+item.value+'】'" :value='"变动前:"+item.before+"｜变动后:"+item.after' :label="$tools.formatDate(item.createtime)"></u-cell>
			</u-cell-group>			
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
