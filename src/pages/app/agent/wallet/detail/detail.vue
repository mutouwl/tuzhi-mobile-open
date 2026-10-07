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


		<!-- 首屏骨架屏：行结构与真实 u-cell 逐块对齐（左侧说明 + 灰字时间、右侧变动前后），
		     吸顶的月份与类型筛选留在骨架屏外保持可点；加载完再换成流水行或空态（M16） -->
		<tz-box padding="5px 15px" v-if="loading || list.length > 0">
			<div class="wdt-sk" v-if="loading">
				<div class="wdt-sk-cell" v-for="i in 5" :key="i">
					<div class="wdt-sk-col">
						<div class="wdt-sk-line wdt-sk-block sk-h-14 sk-w-50"></div>
						<div class="wdt-sk-line wdt-sk-block sk-h-12 sk-w-35"></div>
					</div>
					<div class="wdt-sk-line wdt-sk-block sk-h-12 sk-w-40"></div>
				</div>
			</div>
			<u-cell-group :border="false" v-else-if="list.length > 0">
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
		<u-action-sheet :round="10" :safeAreaInsetBottom="true" cancelText="取消" :show="modal.mode" :actions="modeList"
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
