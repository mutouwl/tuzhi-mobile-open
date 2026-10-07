<template>
	<view class="container">

		
		<!-- 首屏骨架屏（M16）：外壳复用真实列表的 .message-box / .message-item-box，灰块逐块对齐
		     真实版式（16px 标题 / 12px 时间 / 14px 正文两行）⇒ 加载完成切换不跳动；
		     判据用 loading && !list.length，上拉翻页由已有列表继续展示，不闪骨架。
		     底部「去查看」那一行按内容有无才出，骨架不替它预留高度 -->
		<div class="message-box msg-sk" v-if="loading && !list.length">
			<div class="message-item-box" v-for="i in 3" :key="'msgsk' + i">
				<!-- rows-width 必须传数组：u-skeleton 对单行列表会把最后一行宽度写死 70% -->
				<u-skeleton :loading="true" :animate="true" :title="true" title-width="45%" title-height="16"
					:rows="1" :rows-width="['20%']" rows-height="12" />
				<u-skeleton class="msg-sk-body" :loading="true" :animate="true" :title="false" :rows="2"
					:rows-width="['92%', '64%']" rows-height="14" />
			</div>
		</div>

		<div class="message-box" v-else-if="list.length > 0">
			<div class="message-item-box" v-for="(item,index) in list">

				<div class="message-title" v-if="item.title">{{ item.title }}</div>
				<div class="message-time">
						{{ $tools.formatDate(item.createtime) }}
					</div>
				<div class="message-content" v-if="item.content">
					<u-parse :content="item.content" :selectable="true"></u-parse>
				</div>

				<div class="message-footer" v-if="item.link && item.link.type && item.link.type !='unlink'" @click="$nav.to(item.link.src,item.link.type)">
					<div class="message-btn">
						<span>{{ item.btn_text }}</span>
					</div>

					<tz-icon name="enter" color="#86909C" :size="13" />
				</div>
			</div>
		</div>

		<u-empty mode="message" v-else-if="!loading"/>


		<tz-footer/>

		<tz-tab-bar />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
