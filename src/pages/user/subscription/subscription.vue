<template>
	<view class="container">
		<u-sticky :offsetTop="0" bgColor="#fff">
			<u-tabs :list="tabs" @click="tabsChange"></u-tabs>
		</u-sticky>

		<tz-box bgColor="none">
			<!-- 首屏骨架屏：外壳/圆角/内衬与 components/course.vue 的真实行逐值对齐（几何常量在同一份 css.css 里），
			     灰块只替换会变的三格（封面、标题行、订阅时间行）；判据 loading && !list.length，上拉翻页保留已有列表（M16）。
			     类名带 sub-sk- 前缀而不复用子组件的 .course-item-box：组件样式两端都选不中（H5 自动 scope / 小程序样式隔离） -->
			<block v-if="loading && !list.length">
				<view class="sub-sk-item" v-for="n in 3" :key="n">
					<view class="sub-sk-cover"></view>
					<view class="sub-sk-info">
						<view class="sub-sk-title">
							<u-skeleton :loading="true" :animate="true" :title="false" :rows="1"
								:rows-width="['100%']" rows-height="14" />
						</view>
						<view class="sub-sk-time">
							<u-skeleton :loading="true" :animate="true" :title="false" :rows="1"
								:rows-width="['100%']" rows-height="12" />
						</view>
					</view>
				</view>
			</block>
			<block v-else-if="list.length > 0">
				<course v-for="(item, index) in list" :key="index" :cover="item.course.cover" :border="false" :round="true"
					:start_time="item.createtime" :end_time="item.validity_time" :type="item.course.type" :name="item.course.name" :itemId="item.course.id" />
			</block>
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-else />
		</tz-box>

		<tz-footer/>

		<tz-tab-bar />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
